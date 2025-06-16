package models

type QRCodeRequest struct {
	OriginalURL string `json:"original_url" binding:"required"`
	ExpiryDays  int    `json:"expiry_days"`
}

type QRCodeResponse struct {
	ShortURL string `json:"short_url"`
	QRcode   string `json:"qrcode"`
}

// #TODO: Add user logo link struct ****premium feature****
type QRCodeWithLogoRequest struct {
	OriginalURL string `json:"original_url" binding:"required"`
	Shortcode   string `json:"shortcode,omitempty"`
	LogoURL     string `json:"logo_url,omitempty"`
	FgColor     string `json:"fg_color,omitempty"`
	BgColor     string `json:"bg_color,omitempty"`
	Format      string `json:"format,omitempty"` // e.g., "png", "jpeg"
	ExpiryDays  int    `json:"expiry_days"`
}
