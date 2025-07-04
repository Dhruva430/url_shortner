package utils

import (
	"fmt"
	"regexp"

	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
)

var errorMessages = map[string]string{
	"required": "The %s field is required",
	"email":    "The %s field must be a valid email address",
	"username": "The %s field must be a valid username",
}

func validateUsername(fl validator.FieldLevel) bool {
	username := fl.Field().String()
	if len(username) < 3 || len(username) > 32 {
		return false
	}
	for _, r := range username {
		if !(r >= 'a' && r <= 'z' || r >= 'A' && r <= 'Z' || r >= '0' && r <= '9' || r == '_') {
			return false
		}
	}
	return true
}

func validatePassword(fl validator.FieldLevel) bool {
	password := fl.Field().String()
	if len(password) < 8 || len(password) > 32 {
		return false
	}
	return true
}

func validateSlug(fl validator.FieldLevel) bool {
	slug := fl.Field().String()
	matched, _ := regexp.MatchString(`^[a-zA-Z0-9_-]+$`, slug)

	return matched

}
func RegisterValidator() error {
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		v.RegisterValidation("username", validateUsername)
		v.RegisterValidation("password", validatePassword)
		v.RegisterValidation("slug", validateSlug)
	} else {
		return fmt.Errorf("Failed to register validator")
	}
	return nil
}

func FormatValidationError(err error) map[string]string {
	errors := make(map[string]string)
	for _, e := range err.(validator.ValidationErrors) {
		tag := e.Tag()
		if message, ok := errorMessages[tag]; ok {
			errors[e.Field()] = fmt.Sprintf(message, e.Field())
			continue
		}
		errors[e.Field()] = fmt.Sprintf("The %s field is invalid", e.Field())
	}
	return errors
}
