package middleware

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
)

func TestRateLimitMiddlewareReturns429(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.POST("/login", RateLimit(2, time.Minute), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"ok": true})
	})

	do := func() *httptest.ResponseRecorder {
		req := httptest.NewRequest(http.MethodPost, "/login", nil)
		req.RemoteAddr = "203.0.113.7:1234"
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		return w
	}

	if got := do().Code; got != http.StatusOK {
		t.Fatalf("request 1: got %d, want 200", got)
	}
	if got := do().Code; got != http.StatusOK {
		t.Fatalf("request 2: got %d, want 200", got)
	}

	w := do()
	if w.Code != http.StatusTooManyRequests {
		t.Fatalf("request 3: got %d, want 429", w.Code)
	}
	if w.Header().Get("Retry-After") == "" {
		t.Fatal("429 response should include a Retry-After header")
	}
	if w.Header().Get("X-RateLimit-Remaining") != "0" {
		t.Fatalf("X-RateLimit-Remaining on 429 = %q, want \"0\"", w.Header().Get("X-RateLimit-Remaining"))
	}
	if body := w.Body.String(); !strings.Contains(body, `"code":"rate_limited"`) {
		t.Fatalf("429 body should carry the rate_limited code, got %s", body)
	}
}

func TestRateLimiterAllowsUpToLimit(t *testing.T) {
	rl := &rateLimiter{
		visitors: make(map[string]*visitor),
		limit:    3,
		window:   time.Minute,
	}
	now := time.Now()

	for i := 1; i <= 3; i++ {
		if d := rl.allow("1.2.3.4", now); !d.allowed {
			t.Fatalf("request %d should be allowed", i)
		}
	}

	d := rl.allow("1.2.3.4", now)
	if d.allowed {
		t.Fatal("4th request within window should be blocked")
	}
	if d.retryAfter < 1 {
		t.Fatalf("retryAfter should be >= 1, got %d", d.retryAfter)
	}
	if d.remaining != 0 {
		t.Fatalf("remaining should be 0 when blocked, got %d", d.remaining)
	}
}

func TestRateLimiterReportsRemaining(t *testing.T) {
	rl := &rateLimiter{
		visitors: make(map[string]*visitor),
		limit:    3,
		window:   time.Minute,
	}
	now := time.Now()

	want := []int{2, 1, 0}
	for i, expect := range want {
		if d := rl.allow("9.9.9.9", now); d.remaining != expect {
			t.Fatalf("request %d: remaining = %d, want %d", i+1, d.remaining, expect)
		}
	}
}

func TestRateLimiterResetsAfterWindow(t *testing.T) {
	rl := &rateLimiter{
		visitors: make(map[string]*visitor),
		limit:    1,
		window:   time.Minute,
	}
	start := time.Now()

	if d := rl.allow("1.2.3.4", start); !d.allowed {
		t.Fatal("first request should be allowed")
	}
	if d := rl.allow("1.2.3.4", start); d.allowed {
		t.Fatal("second request in window should be blocked")
	}
	if d := rl.allow("1.2.3.4", start.Add(time.Minute)); !d.allowed {
		t.Fatal("request after window reset should be allowed")
	}
}

func TestRateLimiterIsolatesKeys(t *testing.T) {
	rl := &rateLimiter{
		visitors: make(map[string]*visitor),
		limit:    1,
		window:   time.Minute,
	}
	now := time.Now()

	if d := rl.allow("1.1.1.1", now); !d.allowed {
		t.Fatal("first key should be allowed")
	}
	if d := rl.allow("2.2.2.2", now); !d.allowed {
		t.Fatal("different key should have its own budget")
	}
}
