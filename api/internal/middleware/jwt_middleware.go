package middleware

import (
	"api/internal/utils"

	"github.com/gin-gonic/gin"
)

func JWTAuthMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		if ctx.Request.URL.Path == "/api/logout" {
			ctx.Next()
			return
		}
		token, err := ctx.Cookie("token")
		if token == "" || err != nil {
			ctx.JSON(401, gin.H{"error": "Authentication required"})
			ctx.Abort()
			return
		}

		claims, err := utils.ValidateToken(token)
		if err != nil {
			ctx.JSON(401, gin.H{"error": "Invalid or Expired token"})
			ctx.Abort()
			return
		}
		ctx.Set("username", claims.Username)
		ctx.Set("user_id", claims.UserID)
		ctx.Next()
	}
}
