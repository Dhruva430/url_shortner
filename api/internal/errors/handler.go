package errors

import (
	"net/http"

	"api/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

func GlobalErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
		if len(c.Errors) > 0 {
			err := c.Errors[0].Err
			if appErr, ok := err.(*AppError); ok {
				c.JSON(appErr.Code, appErr)
				return
			}
			if validationErr, ok := err.(validator.ValidationErrors); ok {
				c.JSON(http.StatusBadRequest, utils.FormatValidationError(validationErr))
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		}
	}
}
