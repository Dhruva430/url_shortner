package models

type AnalyticsRequest struct {
	Shortcode string `json:"shortcode" binding:"required"`
}

type AnalyticsResponse struct {
	Shortcode   string               `json:"shortcode"`
	ClickCount  int64                `json:"click_count"`
	OriginalURL string               `json:"original_url"`
	ClickedAt   string               `json:"clicked_at"`
	UserID      *int32               `json:"user_id"`
	Visits      []VisitAnalyticsItem `json:"visits"`
}

type VisitAnalyticsItem struct {
	IpAddress string `json:"ip_address"`
	UserAgent string `json:"user_agent"`
	Referrer  string `json:"referrer"`
	Country   string `json:"country"`
	Region    string `json:"region"`
	City      string `json:"city"`
	Timestamp string `json:"timestamp"`
}

type PieChart struct {
	ID        int64  `json:"id"`
	Title     string `json:"title"`
	Shortcode string `json:"shortcode"`
}
