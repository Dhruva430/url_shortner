package models

type ShortURL struct {
	ShortURL string `json:"short_url"`
}
type ShortURLRequest struct {
	OriginalURL string `json:"original_url"`
	UserID      *int32 `json:"user_id,omitempty"`
}
