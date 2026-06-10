package middleware

import (
	"testing"
	"time"
)

func TestRateLimiterAllowsUpToLimit(t *testing.T) {
	rl := &rateLimiter{
		visitors: make(map[string]*visitor),
		limit:    3,
		window:   time.Minute,
	}
	now := time.Now()

	for i := 1; i <= 3; i++ {
		if allowed, _ := rl.allow("1.2.3.4", now); !allowed {
			t.Fatalf("request %d should be allowed", i)
		}
	}

	allowed, retryAfter := rl.allow("1.2.3.4", now)
	if allowed {
		t.Fatal("4th request within window should be blocked")
	}
	if retryAfter < 1 {
		t.Fatalf("retryAfter should be >= 1, got %d", retryAfter)
	}
}

func TestRateLimiterResetsAfterWindow(t *testing.T) {
	rl := &rateLimiter{
		visitors: make(map[string]*visitor),
		limit:    1,
		window:   time.Minute,
	}
	start := time.Now()

	if allowed, _ := rl.allow("1.2.3.4", start); !allowed {
		t.Fatal("first request should be allowed")
	}
	if allowed, _ := rl.allow("1.2.3.4", start); allowed {
		t.Fatal("second request in window should be blocked")
	}
	if allowed, _ := rl.allow("1.2.3.4", start.Add(time.Minute)); !allowed {
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

	if allowed, _ := rl.allow("1.1.1.1", now); !allowed {
		t.Fatal("first key should be allowed")
	}
	if allowed, _ := rl.allow("2.2.2.2", now); !allowed {
		t.Fatal("different key should have its own budget")
	}
}
