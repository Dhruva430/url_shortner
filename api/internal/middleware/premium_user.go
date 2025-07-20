package middleware

import (
	"net/http"

	"api/internal/controllers"

	"github.com/gin-gonic/gin"
)

func PremiumOnly(t *controllers.TransactionController) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		userIDVal, exists := ctx.Get("user_id")
		if !exists {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		userID, ok := userIDVal.(int64)
		if !ok {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid user_id"})
			return
		}

		isPremium, err := t.IsUserPremium(ctx, int32(userID))
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "could not check premium status"})
			return
		}

		if !isPremium {
			ctx.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "premium access required"})
			return
		}

		ctx.Next()
	}
}
