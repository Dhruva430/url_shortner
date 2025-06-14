package controllers

import (
	"api/internal/db"
	"api/internal/models"
	"api/internal/utils"
	"context"
	"database/sql"
	"errors"

	"github.com/gin-gonic/gin"
)

type URLController struct {
	store *db.Queries
}

func NewURLController(store *db.Queries) *URLController {
	return &URLController{store: store}
}

func (c *URLController) CreateShortURL(ctx *gin.Context) {
	var req models.ShortURLRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

	var code string
	if req.Shortcode != "" {
		// Check if custom shortcode is already taken
		_, err := c.store.GetOriginalURL(ctx, req.Shortcode)
		if err == nil {
			ctx.JSON(409, gin.H{"error": "Shortcode already taken"})
			return
		} else if err != sql.ErrNoRows {
			ctx.JSON(500, gin.H{"error": "Database error"})
			return
		}
		code = req.Shortcode
	} else {
		var err error
		code, err = GetUniqueShortCode(ctx, c.store, 6, 10)
		if err != nil {
			ctx.JSON(500, gin.H{"error": "Failed to generate unique shortcode"})
			return
		}
	}

	arg := db.CreateShortURLParams{
		OriginalUrl: req.OriginalURL,
		ShortCode:   code,
	}
	if req.UserID != nil {
		arg.UserID = sql.NullInt32{Int32: *req.UserID, Valid: true}
	} else {
		arg.UserID = sql.NullInt32{Valid: false}
	}

	url, err := c.store.CreateShortURL(ctx, arg)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "Failed to create short URL"})
		return

	}

	ctx.JSON(200, models.ShortURL{ShortURL: "http://localhost:8080/s/" + url.ShortCode})

}

func (c *URLController) RedirectToOriginalURL(ctx *gin.Context) {
	shortCode := ctx.Param("shortcode")
	url, err := c.store.GetOriginalURL(ctx, shortCode)
	if err != nil {
		ctx.JSON(404, gin.H{"error": "Short URL not found"})
		return
	}
	go func(shortCode string) {
		_ = c.store.IncrementClickCount(context.Background(), shortCode)
	}(shortCode)
	ctx.Redirect(302, url.OriginalUrl)
}

func GetUniqueShortCode(ctx *gin.Context, store *db.Queries, length, maxAttempts int) (string, error) {
	attempts := 0
	for {
		if attempts >= maxAttempts {
			return "", errors.New("failed to generate unique shortcode after multiple attempts")
		}
		code := utils.GenerateShortCode(length)
		_, err := store.GetOriginalURL(ctx, code)
		if err == sql.ErrNoRows {
			return code, nil
		} else if err != nil {
			return "", err
		}
		attempts++
	}
}
