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
	ShortURL string `json:"short_url"`
}
