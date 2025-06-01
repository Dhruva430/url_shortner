package controllers

import (
	"api/internal/db"
	"api/internal/utils"

	"github.com/gin-gonic/gin"
)

type authController struct {
	store *db.Queries
}

func NewAuthController(store *db.Queries) *authController {
	return &authController{store: store}
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

	if req.Password == "" || req.Username == "" || req.Email == "" {
		ctx.JSON(400, gin.H{"error": "Credentials is required"})
		return
	}

	ip := utils.GetIP(ctx)

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
		ctx.JSON(500, gin.H{"error": "Failed to create user"})
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
}

type LoginRequest struct {
	Identifier string `json:"identifier" binding:"required"`
	Password   string `json:"password" binding:"required"`
}

func (a *authController) Login(ctx *gin.Context) {
	var req LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if req.Password == "" || req.Identifier == "" {
		ctx.JSON(400, gin.H{"error": "Credentials are required"})
		return
	}

	user, err := utils.GetUserByIdentifier(ctx, a.store, req.Identifier)
	if err != nil {
		if utils.IsEmail(req.Identifier) {
			ctx.JSON(401, gin.H{"error": "Email not Found Register First"})
		} else {
			ctx.JSON(401, gin.H{"error": "Username not Found Register First"})
		}
		return
	}
	if !utils.CheckPasswordHash(req.Password, user.PasswordHash) {
		ctx.JSON(401, gin.H{"error": "Invalid password"})
		return
	}

}
