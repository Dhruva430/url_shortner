package middleware

import (
	"net/http"
	"strconv"
	"sync"
	"time"

	"api/internal/utils"

	"github.com/gin-gonic/gin"
)

// visitor tracks the request count for a single client within the current window.
type visitor struct {
	count       int
	windowStart time.Time
}

// rateLimiter is a simple in-memory, fixed-window rate limiter keyed by client IP.
type rateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*visitor
	limit    int
	window   time.Duration
}

func newRateLimiter(limit int, window time.Duration) *rateLimiter {
	rl := &rateLimiter{
		visitors: make(map[string]*visitor),
		limit:    limit,
		window:   window,
	}
	go rl.cleanupLoop()
	return rl
}

// decision is the outcome of a rate-limit check for a single request.
type decision struct {
	allowed    bool
	remaining  int // requests still permitted in the current window
	retryAfter int // seconds until the current window resets
}

// allow reports whether the given key may make another request and returns the
// quota metadata needed to populate the rate-limit response headers.
func (rl *rateLimiter) allow(key string, now time.Time) decision {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	v, ok := rl.visitors[key]
	if !ok || now.Sub(v.windowStart) >= rl.window {
		rl.visitors[key] = &visitor{count: 1, windowStart: now}
		return decision{allowed: true, remaining: rl.limit - 1, retryAfter: int(rl.window.Seconds())}
	}

	retryAfter := max(int(rl.window.Seconds()-now.Sub(v.windowStart).Seconds()), 1)
	if v.count >= rl.limit {
		return decision{allowed: false, remaining: 0, retryAfter: retryAfter}
	}

	v.count++
	return decision{allowed: true, remaining: rl.limit - v.count, retryAfter: retryAfter}
}

// cleanupLoop periodically evicts visitors whose window has fully elapsed so the
// map does not grow unbounded.
func (rl *rateLimiter) cleanupLoop() {
	ticker := time.NewTicker(rl.window)
	defer ticker.Stop()
	for now := range ticker.C {
		rl.mu.Lock()
		for key, v := range rl.visitors {
			if now.Sub(v.windowStart) >= rl.window {
				delete(rl.visitors, key)
			}
		}
		rl.mu.Unlock()
	}
}

// respondTooManyRequests aborts the request with a clear HTTP 429 Too Many
// Requests response: it sets the Retry-After header so clients know how long to
// back off, and returns a machine-readable JSON body describing the error.
func respondTooManyRequests(ctx *gin.Context, retryAfter int) {
	ctx.Header("Retry-After", strconv.Itoa(retryAfter))
	ctx.JSON(http.StatusTooManyRequests, gin.H{
		"error":       "Too many requests. Please try again later.",
		"retry_after": retryAfter,
	})
	ctx.Abort()
}

// RateLimit returns a Gin middleware that allows at most `limit` requests per
// client IP within `window`. When exceeded it responds with 429 Too Many
// Requests and a Retry-After header.
func RateLimit(limit int, window time.Duration) gin.HandlerFunc {
	rl := newRateLimiter(limit, window)

	return func(ctx *gin.Context) {
		key := utils.GetIP(ctx)
		d := rl.allow(key, time.Now())

		ctx.Header("X-RateLimit-Limit", strconv.Itoa(limit))
		ctx.Header("X-RateLimit-Remaining", strconv.Itoa(d.remaining))

		if !d.allowed {
			respondTooManyRequests(ctx, d.retryAfter)
			return
		}
		ctx.Next()
	}
}
