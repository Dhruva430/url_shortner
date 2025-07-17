package models

type RazorpayOrderRequest struct {
	Amount   int    `json:"amount"`
	Currency string `json:"currency"`
	Receipt  string `json:"receipt"`
}

type RazorpayOrderResponse struct {
	ID     string `json:"id"`
	Status string `json:"status"`
}
