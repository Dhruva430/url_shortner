package routes

import (
	"database/sql"

	"api/internal/controllers"
	"api/internal/db"
	"api/internal/errors"
	"api/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter(store *db.Queries, conn *sql.DB) *gin.Engine {
	r := gin.Default()

	r.Use(errors.GlobalErrorHandler())

	r.Use(func(c *gin.Context) {
		c.Set("store", store)
		c.Set("conn", conn)
		c.Next()
	})

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "https://uhxnpmnnw4r7.share.zrok.io"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length", "Content-Disposition"},
		AllowCredentials: true,
	}))

	authController := controllers.NewAuthController(store, conn)
	URLController := controllers.NewURLController(store)
	titleController := controllers.NewTitleController()
	transactionController := controllers.NewTransactionController(store, conn)
	router := r.Group("/")

	routerAPI := router.Group("/api")

	routerAPI.POST("/register", authController.Register)
	routerAPI.POST("/login", authController.Login)
	routerAPI.GET("/logout", authController.Logout)
	routerAPI.GET("/check-username", authController.CheckUsername)
	routerAPI.GET("/check-email", authController.CheckEmail)

	routerAPI.GET("/auth/:provider/callback", authController.ProviderCallback)
	routerAPI.GET("/auth/:provider", authController.ProviderRedirect)

	protected := routerAPI.Group("/protected")

	protected.Use(middleware.JWTAuthMiddleware())

	protected.GET("/shorten/qr/:shortcode", URLController.GetQRCode)
	protected.GET("/links", URLController.GetUserURLs)
	protected.GET("/title", titleController.GetPageTitle)
	protected.DELETE("/links/:shortcode", URLController.DeleteShortURL)
	protected.GET("/shorten/qr-with-logo", URLController.FetchQRCodeWithLogo)

	protected.GET("/titles", URLController.GetTitleAndUrlByUser)

	protected.GET("/analytics/summary", URLController.GetDashboardData)
	protected.GET("/analytics/devices", URLController.GetDeviceTypeStats)
	protected.GET("/analytics/line", URLController.GetLineChartStats)
	protected.GET("/analytics/bar", URLController.GetMonthlyClicks)
	protected.GET("/analytics/worldmap", URLController.GetWorldMapData)

	premiumOnly := middleware.PremiumOnly(transactionController)

	protected.GET("/analytics/piechart/:shortcode", premiumOnly, URLController.GetPieChartDataByShorcode)
	protected.GET("/analytics/linechart/:shortcode", premiumOnly, URLController.LineChartStatsByShortcode)
	protected.GET("/analytics/worldchart/:shortcode", premiumOnly, URLController.GetWorldMapStatsByShortcode)
	protected.GET("/analytics/barchart/:shortcode", premiumOnly, URLController.GetBarChartStatsByShortcode)

	protected.POST("/shorten", URLController.CreateShortURL)
	protected.POST("edit/:shortcode", URLController.UpdateShortURL)

	protected.GET("/premium", transactionController.CheckPremiumStatus)
	routerAPI.POST("/razorpay/webhook", transactionController.RazorpayWebhook)
	protected.POST("/createorder", transactionController.CreateRazorpayOrder)

	// protected.GET("/transactions", transactionController.GetUserTransactions)

	protected.GET("/account", transactionController.GetUserAccount)
	protected.GET("/bills", transactionController.GetUserBills)

	protected.GET("/me", func(ctx *gin.Context) {
		userID, _ := ctx.Get("user_id")
		username, _ := ctx.Get("username")
		ctx.JSON(200, gin.H{
			"user_id":  userID,
			"username": username,
		})
	})
	router.GET("/s/:shortcode", URLController.RedirectToOriginalURL)
	router.POST("/s/:shortcode/unlock", URLController.VerifyAndRedirect)

	return r
}
