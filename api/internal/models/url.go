package models

type ShortURLResponse struct {
	ShortURL string `json:"short_url"`
}
type ShortURLRequest struct {
	OriginalURL string `json:"original_url"`
	UserID      *int32 `json:"user_id,omitempty"`
	Shortcode   string `json:"shortcode,omitempty"`
}
type QRCodeResponse struct {
	ShortURL string `json:"short_url"`
	QRcode   string `json:"qrcode"`
}
