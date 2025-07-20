package transaction

import "api/internal/models"

var Subscriptions = map[string]models.Subscriptions{
	"monthly": {
		Name:        "Monthly Subscription",
		Description: "Monthly subscription plan",
		Amount:      89 * 100,
		Interval:    "month",
		Currency:    "INR",
	},
	"lifetime": {
		Name:        "Lifetime Subscription",
		Description: "Lifetime subscription plan",
		Amount:      999 * 100,
		Interval:    "lifetime",
		Currency:    "INR",
	},
}
