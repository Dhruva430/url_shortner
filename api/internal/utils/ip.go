package utils

import (
	"strings"

	"github.com/gin-gonic/gin"
)

func GetIP(ctx *gin.Context) string {
	if ip := ctx.GetHeader("CF-Connecting-IP"); ip != "" {
		return ip
	}
	if ip := ctx.GetHeader("X-Forwarded-For"); ip != "" {
		parts := strings.Split(ip, ",")
		return strings.TrimSpace(parts[0])
	}
	if ip := ctx.GetHeader("X-Real-IP"); ip != "" {
		return ip
	}
	return ctx.ClientIP()
}
