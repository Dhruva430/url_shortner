package models

type RazorpayOrderResponse struct {
	ID            string         `json:"id"`
	Amount        int64          `json:"amount"`
	Currency      string         `json:"currency"`
	Notes         map[string]any `json:"notes"`
	RazorpayKeyID string         `json:"razorpay_key_id"`
}

type Subscriptions struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Amount      int64  `json:"amount"`
	Interval    string `json:"interval"`
	Currency    string `json:"currency"`
}
