package controllers

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"api/configs"
	"api/internal/db"
	"api/internal/models"
	"api/internal/transaction"

	"github.com/gin-gonic/gin"
)

type TransactionController struct {
	store *db.Queries
	db    *sql.DB
}

func NewTransactionController(store *db.Queries, dbConn *sql.DB) *TransactionController {
	return &TransactionController{store: store, db: dbConn}
}

func createOrder(amount int64, currency string, notes map[string]any) (*models.RazorpayOrderResponse, error) {
	razorPayOrder := models.RazorpayOrderResponse{
		RazorpayKeyID: configs.GetRazorpayKeyID(),
	}
	{
		body := map[string]any{
			"amount":   amount,
			"currency": currency,
			"notes":    notes,
		}

		payload, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}

		req, _ := http.NewRequest("POST", "https://api.razorpay.com/v1/orders", bytes.NewBuffer(payload))
		req.SetBasicAuth(configs.GetRazorpayKeyID(), configs.GetRazorpayKeySecret())
		req.Header.Set("Content-Type", "application/json")
		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			return nil, err
		}
		if resp.StatusCode != http.StatusOK {
			return nil, fmt.Errorf("failed to create Razorpay order: %s", resp.Status)
		}

		defer resp.Body.Close()
		respBody, err := io.ReadAll(resp.Body)
		if err != nil {
			return nil, err
		}

		if err := json.Unmarshal(respBody, &razorPayOrder); err != nil {
			fmt.Printf("Error unmarshalling Razorpay order response: %s", err)
			return nil, fmt.Errorf("failed to unmarshal Razorpay order response: %w", err)
		}
		// fmt.Printf(`order state in createOrder: %s`, string(respBody))
		// fmt.Printf(`order state in createOrder: %v`, razorPayOrder)

	}
	return &razorPayOrder, nil
}

func (t *TransactionController) CreateRazorpayOrder(ctx *gin.Context) {
	var req struct {
		Plan string `json:"plan"`
	}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	sub, ok := transaction.Subscriptions[req.Plan]
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subscription plan"})
		return
	}
	userID := int32(ctx.MustGet("user_id").(int64))

	order, err := createOrder(
		sub.Amount,
		sub.Currency,
		map[string]any{
			"plan":    req.Plan,
			"user_id": userID,
		},
	)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Razorpay order"})
		return
	}

	_, err = t.store.CreateTransaction(ctx, db.CreateTransactionParams{
		UserID:          userID,
		RazorpayOrderID: order.ID,
		Amount:          order.Amount,
		Currency:        order.Currency,
		Plan:            req.Plan,
		Status:          "created",
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save transaction"})
		return
	}

	ctx.JSON(http.StatusOK, order)
}

func GetUserByContext(ctx *gin.Context) (int32, error) {
	userIDVal, exists := ctx.Get("user_id")
	if !exists {
		return 0, errors.New("user_id not found in context")
	}

	userID, ok := userIDVal.(int32)
	if !ok {
		return 0, errors.New("invalid user_id type")
	}
	return userID, nil
}

// func (t *transactionController) GetUserTransactions(ctx *gin.Context) {
// 	userID, _ := GetUserByContext(ctx)

// 	transactions, err := t.store.GetUserTransactions(ctx, userID)
// 	if err != nil {
// 		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transactions"})
// 		return
// 	}

// 	ctx.JSON(http.StatusOK, transactions)
// }

func (t *TransactionController) RazorpayWebhook(ctx *gin.Context) {
	body, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}

	// 1. Verify Signature
	signature := ctx.GetHeader("X-Razorpay-Signature")
	secret := configs.GetRazorpayWebhookSecret() // From your env/config

	if !verifyRazorpaySignature(body, signature, secret) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid signature"})
		return
	}

	// 2. Process Event
	var event struct {
		Event   string                 `json:"event"`
		Payload map[string]interface{} `json:"payload"`
	}

	if err := json.Unmarshal(body, &event); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON"})
		return
	}

	if event.Event == "payment.captured" || event.Event == "payment.failed" {
		payment := event.Payload["payment"].(map[string]interface{})["entity"].(map[string]interface{})

		orderID, _ := payment["order_id"].(string)
		status, _ := payment["status"].(string)
		paymentID, _ := payment["id"].(string)

		var finalStatus string
		switch status {
		case "captured":
			finalStatus = "success"
		case "failed":
			finalStatus = "failed"
		default:
			finalStatus = "unknown"
		}

		err := t.store.UpdateTransactionPayment(ctx, db.UpdateTransactionPaymentParams{
			RazorpayOrderID: orderID,
			Status:          finalStatus,
			RazorpayPaymentID: sql.NullString{
				String: paymentID,
				Valid:  true,
			},
		})
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update transaction"})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{"message": "transaction status updated"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "ignored event"})
}

func verifyRazorpaySignature(payload []byte, signature, secret string) bool {
	expectedSignature := generateRazorpaySignature(payload, secret)
	return expectedSignature == signature
}

func generateRazorpaySignature(payload []byte, secret string) string {
	h := hmac.New(sha256.New, []byte(secret))
	h.Write(payload)
	return hex.EncodeToString(h.Sum(nil))
}

func (t *TransactionController) IsUserPremium(ctx *gin.Context, userID int32) (bool, error) {
	transactions, err := t.store.GetUserTransactionsByStatus(ctx, db.GetUserTransactionsByStatusParams{
		UserID: userID,
		Status: "success",
	})
	if err != nil {
		return false, err
	}

	if len(transactions) == 0 {
		// No successful transactions = not premium
		return false, nil
	}

	latest := transactions[0]
	if latest.Plan == "lifetime" {
		return true, nil
	}

	if latest.Plan == "monthly" {
		if time.Now().Before(latest.CreatedAt.Time.AddDate(0, 1, 0)) {
			return true, nil
		}
	}

	return false, nil
}

func (t *TransactionController) CheckPremiumStatus(ctx *gin.Context) {
	userIDVal, exists := ctx.Get("user_id")
	if !exists {
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userID, ok := userIDVal.(int64)
	if !ok {
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid user_id"})
		return
	}

	isPremium, err := t.IsUserPremium(ctx, int32(userID))
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "error checking premium status"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"isPremium": isPremium})
}
