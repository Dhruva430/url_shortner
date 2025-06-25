package routes

import (
	"api/internal/controllers"
	"api/internal/db"
	"api/internal/errors"
	"api/internal/middleware"
	"api/internal/oauth"
	"api/internal/utils"
	"database/sql"
	"net/http"

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
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	authController := controllers.NewAuthController(store, conn)
	URLController := controllers.NewURLController(store)

	router := r.Group("/")

	routerAPI := router.Group("/api")

	routerAPI.POST("/register", authController.Register)
	routerAPI.POST("/login", authController.Login)
	routerAPI.GET("/logout", authController.Logout)
	routerAPI.GET("/check-username", authController.CheckUsername)

	routerAPI.GET("/auth/:provider", HandleOAuthRedirect)
	routerAPI.GET("/auth/:provider/callback", HandleOAuthCallback)

	protected := routerAPI.Group("/protected")

	protected.Use(middleware.JWTAuthMiddleware())
	// protected.GET("/user", func(c *gin.Context) {
	// 	username, exists := c.Get("username")
	// 	if !exists {
	// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
	// 		return
	// 	}
	// 	c.JSON(http.StatusOK, gin.H{"username": username})

	// })

	protected.POST("/shorten", URLController.CreateShortURL)
	protected.POST("/shorten/qr", URLController.GetQRCode)
	protected.POST("/shorten/qr-with-logo", URLController.GetQRCodeWithLogo)

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
	// fmt.Println("Redirect URL:", redirectURL.String())
	// fmt.Println("Google Client ID from env:", configs.GetGoogleClientID())

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
