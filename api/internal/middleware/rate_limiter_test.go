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
