package configs

import "os"

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
