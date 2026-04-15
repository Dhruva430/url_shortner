package configs

import (
	"os"
	"strings"
)

func GetGoogleClientID() string {
	return os.Getenv("GOOGLE_CLIENT_ID")
}

func GetGoogleClientSecret() string {
	return os.Getenv("GOOGLE_CLIENT_SECRET")
}

func GetJWTSecret() string {
	return os.Getenv("JWT_SECRET")
}

func GetAPIURL() string {
	return os.Getenv("API_URL")
}

func GetDBSource() string {
	return os.Getenv("DB_SOURCE")
}

func GetRazorpayKeyID() string {
	return os.Getenv("RAZORPAY_KEY_ID")
}

func GetRazorpayKeySecret() string {
	return os.Getenv("RAZORPAY_KEY_SECRET")
}

func GetRazorpayWebhookSecret() string {
	return os.Getenv("RAZORPAY_WEBHOOK_SECRET")
}

func GetPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default port if not specified
	}
	return port
}

func GetAllowedOrigins() []string {
	raw := os.Getenv("CORS_ALLOWED_ORIGINS")
	if strings.TrimSpace(raw) == "" {
		return []string{"http://localhost:3000", "https://dhruvakushwaha.in"}
	}

	parts := strings.Split(raw, ",")
	origins := make([]string, 0, len(parts))
	for _, p := range parts {
		origin := strings.TrimSpace(p)
		if origin != "" {
			origins = append(origins, origin)
		}
	}

	if len(origins) == 0 {
		return []string{"http://localhost:3000", "https://dhruvakushwaha.in"}
	}

	return origins
}
