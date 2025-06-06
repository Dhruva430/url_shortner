package utils

import (
	"api/internal/db"
	"context"
	"regexp"
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
