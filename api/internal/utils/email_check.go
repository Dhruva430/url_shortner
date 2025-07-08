package utils

import (
	"context"
	"regexp"
	"strings"

	"api/internal/db"
)

func IsEmail(input string) bool {
	// Simple regex for email validation
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	return re.MatchString(input)
}

func GetUserByIdentifier(ctx context.Context, store *db.Queries, identifier string) (*db.User, error) {
	if IsEmail(identifier) {
		user, err := store.GetUserByEmail(ctx, identifier)
		if err != nil {
			return nil, err
		}
		return &user, nil
	}
	user, err := store.GetUserByUsername(ctx, identifier)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func Slugify(input string) string {
	input = strings.ToLower(input)
	input = strings.TrimSpace(input)
	input = strings.ReplaceAll(input, " ", "_")
	re := regexp.MustCompile(`[^a-z0-9_]+`)
	return re.ReplaceAllString(input, "")
}
