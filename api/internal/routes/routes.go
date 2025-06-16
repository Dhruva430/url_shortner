package routes

import (
	"api/internal/controllers"
	"api/internal/db"
	"api/internal/middleware"
	"api/internal/oauth"
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func SetupRouter(store *db.Queries, conn *sql.DB) *gin.Engine {

	r := gin.Default()

	authController := controllers.NewAuthController(store, conn)
	URLController := controllers.NewURLController(store)

	router := r.Group("/")
	routerAPI := router.Group("/api")

	routerAPI.POST("/register", authController.Register)
	routerAPI.POST("/login", authController.Login)
	routerAPI.GET("/logout", authController.Logout)

	routerAPI.GET("/auth/:provider", HandleOAuthRedirect)
	routerAPI.GET("/auth/:provider/callback", HandleOAuthCallback)

	protected := routerAPI.Group("/protected")
	protected.Use(middleware.JWTAuthMiddleware())
	protected.GET("/user", func(c *gin.Context) {
		username, exists := c.Get("username")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"username": username})

	})

	routerAPI.POST("/shorten", URLController.CreateShortURL)
	routerAPI.POST("/shorten/qr", URLController.GetQRCode)
	routerAPI.POST("/shorten/qr-with-logo", URLController.GetQRCodeWithLogo)

	router.GET("/s/:shortcode", URLController.RedirectToOriginalURL)

	return r
}

func HandleOAuthRedirect(c *gin.Context) {
	providerName := c.Param("provider")
	prov := oauth.Provider(providerName)
	provider, ok := oauth.GetProvider(oauth.Provider(providerName))
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "unsupported provider"})
		return
	}

	redirectURL, err := provider.RedirectURL(prov)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate redirect URL"})
		return
	}
	// fmt.Println("Redirect URL:", redirectURL.String())
	// fmt.Println("Google Client ID from env:", configs.GetGoogleClientID())

	c.Redirect(http.StatusFound, redirectURL.String())
}

func HandleOAuthCallback(c *gin.Context) {
	providerName := c.Param("provider")
	prov := oauth.Provider(providerName)
	provider, ok := oauth.GetProvider(prov)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "unsupported provider"})
		return
	}
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing code parameter"})
		return
	}
	user, err := provider.Callback(code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to authenticate with provider"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"provider":     user.Provider,
		"provider_id":  user.ProviderID,
		"username":     user.Username,
		"email":        user.Email,
		"avatar_url":   user.AvatarURL,
		"access_token": user.AccessToken,
		"id_token":     user.IdToken,
		"message":      "User authenticated successfully",
	})
}
