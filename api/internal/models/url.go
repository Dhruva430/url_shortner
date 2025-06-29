package models

import "time"

type ShortURLRequest struct {
	OriginalURL string     `json:"original_url" binding:"required,url"`
	Shortcode   string     `json:"shortcode,omitempty"`
	Title       string     `json:"title,omitempty"`
	Password    string     `json:"password,omitempty"`
	ExpireAt    *time.Time `json:"expire_at,omitempty"`
}
type ShortURLResponse struct {
	ShortURL  string `json:"short_url"`
	Thumbnail string `json:"thumbnail,omitempty"`
	Format    string `json:"format,omitempty"`
}

type ShortURLDashboardItem struct {
	ID          int64  `json:"id"`
	Title       string `json:"title"`
	OriginalURL string `json:"original_url"`
	ShortURL    string `json:"short_url"`
	Clicks      int    `json:"clicks"`
	CreatedAt   string `json:"created_at"`
	Thumbnail   string `json:"thumbnail"`
	Status      string `json:"status"`
}
type EditURLRequest struct {
	Title       string `json:"title"`
	OriginalURL string `json:"original_url"`
	ExpireAt    string `json:"expire_at"`
	Password    string `json:"password"`
}
