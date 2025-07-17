package transaction

import (
	"bytes"
	"encoding/json"
	"net/http"

	"api/configs"
	"api/internal/models"
	"api/internal/utils"

	"github.com/gin-gonic/gin"
)

func CreateRazorpayOrder(amount int) (models.RazorpayOrderResponse, error) {
	order := models.RazorpayOrderRequest{
		Amount:   amount * 100,
		Currency: "INR",
		Receipt:  "rcpt_" + utils.GenerateRandomString(),
	}
	body, _ := json.Marshal(order)

	req, _ := http.NewRequest("POST", "https://api.razorpay.com/v1/orders", bytes.NewBuffer(body))
	req.SetBasicAuth(configs.GetRazorpayKeyID(), configs.GetRazorpayKeySecret())
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return models.RazorpayOrderResponse{}, err
	}
	defer resp.Body.Close()

	var result models.RazorpayOrderResponse
	err = json.NewDecoder(resp.Body).Decode(&result)
	return result, err
}

func CreateOrderHandler(c *gin.Context) {
	type ReqBody struct {
		Amount int `json:"amount"`
	}
	var body ReqBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	order, err := CreateRazorpayOrder(body.Amount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"order_id": order.ID,
		"amount":   body.Amount * 100,
		"currency": "INR",
		"key":      configs.GetRazorpayKeyID(),
	})
}
