package utils

import (
	"log"

	"github.com/gin-gonic/gin"
)

func GetIP(c *gin.Context) string {
	ip := c.ClientIP()
	if ip == "::1" || ip == "" {
		log.Fatal("Failed to get client IP, using default ")
	}
	return ip
}
