package utils

import "math/rand"

func GenerateShortCode(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzAbCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	shortCode := make([]byte, length)
	for i := range shortCode {
		shortCode[i] = charset[rand.Intn(len(charset))]
	}
	return string(shortCode)
}
