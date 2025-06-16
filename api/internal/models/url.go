package models

type ShortURLRequest struct {
	OriginalURL string `json:"original_url" binding:"required"`
	Shortcode   string `json:"shortcode,omitempty"`
}
type ShortURLResponse struct {
	ShortURL string `json:"short_url"`
}
