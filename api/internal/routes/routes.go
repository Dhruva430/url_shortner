package routes

import (
	"database/sql"
	"net/http"

	"api/internal/controllers"
	"api/internal/db"
	"api/internal/errors"
	"api/internal/middleware"
	"api/internal/oauth"
	"api/internal/utils"

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
	router := r.Group("/")

	routerAPI := router.Group("/api")

	routerAPI.POST("/register", authController.Register)
	routerAPI.POST("/login", authController.Login)
	routerAPI.GET("/logout", authController.Logout)
	routerAPI.GET("/check-username", authController.CheckUsername)

	routerAPI.GET("/auth/:provider", authController.ProviderRedirect)
	routerAPI.GET("/auth/:provider/callback", authController.ProviderCallback)

	protected := routerAPI.Group("/protected")

	protected.Use(middleware.JWTAuthMiddleware())

	protected.GET("/shorten/qr/:shortcode", URLController.GetQRCode)
	protected.GET("/links", URLController.GetUserURLs)
	protected.GET("/title", titleController.GetPageTitle)
	protected.DELETE("/links/:shortcode", URLController.DeleteShortURL)
	protected.GET("/shorten/qr-with-logo", URLController.FetchQRCodeWithLogo)

	protected.GET("/analytics/summary", URLController.GetDashboardSummary)
	protected.GET("/analytics/devices/:shortcode", URLController.GetDeviceTypeStats)
	protected.GET("/analytics/devices", URLController.GetDeviceTypeStatsGlobal)
	protected.GET("/analytics/line", URLController.GetLineChartStats)
	protected.GET("/analytics/bar", URLController.GetMonthlyClicks)
	protected.GET("/analytics/worldmap", URLController.GetWorldMapData)

	// protected.POST("/shorten/qr-with-logo", URLController.SaveQRCodeWithLogo)

	protected.POST("/shorten", URLController.CreateShortURL)
	protected.POST("edit/:shortcode", URLController.UpdateShortURL)

	protected.GET("/me", func(ctx *gin.Context) {
		userID, _ := ctx.Get("user_id")
		username, _ := ctx.Get("username")
		ctx.JSON(200, gin.H{
			"user_id":  userID,
			"username": username,
		})
	})
	router.GET("/s/:shortcode", URLController.RedirectToOriginalURL)

	return r
}

func HandleOAuthRedirect(ctx *gin.Context) {
	providerName := ctx.Param("provider")
	prov := oauth.Provider(providerName)
	provider, ok := oauth.GetProvider(oauth.Provider(providerName))
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "unsupported provider"})
		return
	}

	redirectURL, err := provider.RedirectURL(prov)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate redirect URL"})
		return
	}

	ctx.Redirect(http.StatusFound, redirectURL.String())
}

func HandleOAuthCallback(ctx *gin.Context) {
	providerName := ctx.Param("provider")
	prov := oauth.Provider(providerName)
	provider, ok := oauth.GetProvider(prov)
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "unsupported provider"})
		return
	}
	code := ctx.Query("code")
	if code == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "missing code parameter"})
		return
	}
	user, err := provider.Callback(code)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to authenticate with provider"})
		return
	}
	store := ctx.MustGet("store").(*db.Queries)

	dbUser, err := store.GetUserByEmail(ctx, user.Email)
	if err == sql.ErrNoRows {
		username := user.Email
		if user.Username != nil && *user.Username != "" {
			username = *user.Username
		}
		dbUser, err = store.CreateUser(ctx, db.CreateUserParams{
			Username:     username,
			PasswordHash: "",
			Email:        user.Email,
			IpAddress:    ctx.ClientIP(),
		})
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}
	} else if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}

	token, err := utils.GenerateJWT(int64(dbUser.ID), dbUser.Username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}
	redirectURL := "http://localhost:3000/dashboard?token=" + token
	ctx.Redirect(http.StatusFound, redirectURL)
}
