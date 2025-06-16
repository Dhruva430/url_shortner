package models

type ShortURLResponse struct {
	ShortURL string `json:"short_url"`
}
type ShortURLRequest struct {
	OriginalURL string `json:"original_url" binding:"required"`
	UserID      *int32 `json:"user_id,omitempty"`
	Shortcode   string `json:"shortcode,omitempty"`
}

