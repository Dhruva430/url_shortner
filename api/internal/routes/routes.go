package routes

import (
	"api/internal/controllers"
	"api/internal/db"

	"github.com/gin-gonic/gin"
)

func SetupRouter(store *db.Queries) *gin.Engine {

	r := gin.Default()

	authController := controllers.NewAuthController(store)

	router := r.Group("/api")

	router.POST("/register", authController.Register)
	router.POST("/login", authController.Login)
	return r

}
