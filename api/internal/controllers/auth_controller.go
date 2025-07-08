package controllers

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"time"

	"api/internal/db"
	"api/internal/oauth"
	"api/internal/utils"

	"github.com/gin-gonic/gin"
)

type authController struct {
	store *db.Queries
	db    *sql.DB
}

func NewAuthController(store *db.Queries, dbConn *sql.DB) *authController {
	return &authController{store: store, db: dbConn}
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
}

func (a *authController) Register(ctx *gin.Context) {
	var req RegisterRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	_, err := a.store.GetUserByEmail(ctx, req.Email)
	if err == nil {
		ctx.JSON(400, gin.H{"error": "Email is already registered"})
		return
	}
	if err != sql.ErrNoRows {
		ctx.JSON(500, gin.H{"error": "Internal server error"})
		return
	}

	_, err = a.store.GetUserByUsername(ctx, req.Username)

	if err == nil {
		ctx.JSON(400, gin.H{"error": "Username is already taken"})
		return
	}
	if err != sql.ErrNoRows {
		ctx.JSON(500, gin.H{"error": "Internal server error"})
		return
	}

	if req.Password == "" || req.Username == "" || req.Email == "" {
		ctx.JSON(400, gin.H{"error": "Credentials is required"})
		return
	}

	ip := sql.NullString{String: utils.GetIP(ctx), Valid: true}
	password, err := utils.HashPassword(req.Password)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "Failed to hash password"})
		return
	}

	user, err := a.store.CreateUser(ctx, db.CreateUserParams{
		Username:     req.Username,
		PasswordHash: password,
		Email:        req.Email,
		IpAddress:    ip,
	})
	if err != nil {
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(200, gin.H{
		"message": "User registered successfully",
		"user": gin.H{
			"id":         user.ID,
			"username":   user.Username,
			"email":      user.Email,
			"ip":         user.IpAddress,
			"created_at": user.CreatedAt,
			"updated_at": user.UpdatedAt,
		},
	})
	ctx.SetCookie("email", req.Email, 3600*24*10, "/", "", false, false) // 10 days
}

func (a *authController) CheckUsername(ctx *gin.Context) {
	username := ctx.Query("username")
	if username == "" {
		ctx.JSON(400, gin.H{"error": "Username is required"})
		return
	}

	_, err := a.store.GetUserByUsername(ctx, username)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(200, gin.H{"available": true})
			return
		}
		ctx.JSON(500, gin.H{"error": "Internal server error"})
		return
	}

	ctx.JSON(200, gin.H{"available": false})
}

type LoginRequest struct {
	Identifier string `json:"identifier" binding:"required"`
	Password   string `json:"password" binding:"required"`
}

func (a *authController) Login(ctx *gin.Context) {
	if token, err := ctx.Cookie("token"); err == nil && token != "" {
		if _, err := utils.ValidateToken(token); err == nil {
			ctx.JSON(200, gin.H{
				"message": "Already logged in",
			})
			return
		}
		fmt.Println("Invalid token, continuing login")
	}

	var req LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if req.Password == "" || req.Identifier == "" {
		ctx.JSON(400, gin.H{"error": "Credentials are required"})
		return
	}

	ctxWithTimeout, cancel := context.WithTimeout(ctx.Request.Context(), 3*time.Second)
	defer cancel()

	tx, err := a.db.BeginTx(ctxWithTimeout, nil)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "Failed to start transaction"})
		return
	}
	qtx := db.New(tx)

	user, err := utils.GetUserByIdentifier(ctxWithTimeout, qtx, req.Identifier)
	if err != nil {
		tx.Rollback()
		if utils.IsEmail(req.Identifier) {
			ctx.JSON(401, gin.H{"error": "Email not Found Register First"})
		} else {
			ctx.JSON(401, gin.H{"error": "Username not Found Register First"})
		}
		return
	}
	if !utils.CheckPasswordHash(req.Password, user.PasswordHash) {
		tx.Rollback()
		ctx.JSON(401, gin.H{"error": "Invalid password"})
		return
	}

	token, err := utils.GenerateJWT(int64(user.ID), user.Username)
	if err != nil {
		tx.Rollback()
		ctx.JSON(500, gin.H{"error": "Failed to generate token"})
		return
	}

	if err := tx.Commit(); err != nil {
		ctx.JSON(500, gin.H{"error": "Failed to commit transaction"})
		return
	}
	ctx.SetCookie("token", token, 3600*24*10, "", "", false, true) // 10 days

	ctx.JSON(200, gin.H{
		"message": "Login successful",
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
		},
	})
}

func (a *authController) ProviderRedirect(ctx *gin.Context) {
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

func (a *authController) ProviderCallback(ctx *gin.Context) {
	providerName := ctx.Param("provider")
	prov := oauth.Provider(providerName)

	provider, ok := oauth.GetProvider(prov)
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported provider"})
		return
	}

	code := ctx.Query("code")
	if code == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Missing code parameter"})
		return
	}

	user, err := provider.Callback(code)
	if err != nil {
		log.Printf("OAuth callback error: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to authenticate with provider"})
		return
	}

	store := ctx.MustGet("store").(*db.Queries)

	// Check if user exists by provider_id
	args := db.GetUserByProviderIDParams{
		Provider:   sql.NullString{String: user.Provider, Valid: true},
		ProviderID: sql.NullString{String: user.ProviderID, Valid: true},
	}
	dbUser, err := store.GetUserByProviderID(ctx, args)

	if err == sql.ErrNoRows {
		// Try by email as fallback
		dbUser, err = store.GetUserByEmail(ctx, user.Email)
	}

	if err == sql.ErrNoRows {
		// User doesn't exist, generate unique username
		baseUsername := utils.Slugify(*user.Username)
		username := baseUsername
		i := 1

		for {
			_, err := store.GetUserByUsername(ctx, username)
			if err == sql.ErrNoRows {
				break // username is available
			}
			username = fmt.Sprintf("%s-%d", baseUsername, i)
			i++
		}

		log.Println("Generated username:", username)

		dbUser, err = store.CreateOAuthUser(ctx, db.CreateOAuthUserParams{
			Username:     username,
			Email:        user.Email,
			PasswordHash: "",
			IpAddress:    sql.NullString{String: utils.GetIP(ctx), Valid: true},
			Provider:     sql.NullString{String: user.Provider, Valid: true},
			ProviderID:   sql.NullString{String: user.ProviderID, Valid: true},
			Image: func() sql.NullString {
				if user.AvatarURL != nil && *user.AvatarURL != "" {
					return sql.NullString{String: *user.AvatarURL, Valid: true}
				}
				return sql.NullString{Valid: false}
			}(),
		})
		if err != nil {
			log.Printf("CreateOAuthUser error: %v", err)
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}
	} else if err != nil {
		log.Printf("Error fetching user: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}

	token, err := utils.GenerateJWT(int64(dbUser.ID), dbUser.Username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	ctx.SetCookie("token", token, 3600*24*10, "", "", false, true)

	redirectURL := "http://localhost:3000/dashboard"
	ctx.Redirect(http.StatusFound, redirectURL)
}

func (a *authController) Logout(ctx *gin.Context) {
	if _, err := ctx.Cookie("token"); err != nil {
		ctx.JSON(401, gin.H{"error": "Not logged in"})
		return
	}

	ctx.SetCookie("token", "", -1, "", "", false, true)
	ctx.JSON(200, gin.H{"message": "Logged out successfully"})
}
