package controllers

import (
	"bytes"
	"context"
	"io"
	"net/http"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/gin-gonic/gin"
)

type titleController struct{}

func NewTitleController() *titleController {
	return &titleController{}
}

type TitleResult struct {
	Title string
	URL   string
}

func getTitleFromURL(rawURL string) TitleResult {
	// Set timeout
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, rawURL, nil)
	if err != nil {
		// Invalid URL
		return TitleResult{Title: "", URL: rawURL}
	}

	client := http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		// Could be timeout or unreachable
		return TitleResult{Title: "", URL: rawURL}
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return TitleResult{Title: "", URL: rawURL}
	}

	doc, err := goquery.NewDocumentFromReader(io.NopCloser(io.MultiReader(io.LimitReader(resp.Body, int64(len(body))))))
	if err != nil {
		return TitleResult{Title: "", URL: rawURL}
	}

	doc, err = goquery.NewDocumentFromReader(io.NopCloser(io.MultiReader(io.LimitReader(io.NopCloser(io.Reader(bytes.NewReader(body))), int64(len(body))))))
	if err != nil {
		return TitleResult{Title: "", URL: rawURL}
	}

	title := doc.Find("title").First().Text()

	return TitleResult{Title: title, URL: resp.Request.URL.String()}
}

func (c *titleController) GetPageTitle(ctx *gin.Context) {
	rawURL := ctx.Query("url")
	if rawURL == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "URL is required"})
		return
	}

	result := getTitleFromURL(rawURL)
	if result.Title == "" {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch title"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"title": result.Title,
		"url":   result.URL,
	})
}
