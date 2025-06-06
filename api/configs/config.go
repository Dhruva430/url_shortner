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
