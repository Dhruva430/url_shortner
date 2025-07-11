package main

import (
	"database/sql"
	"fmt"
	"log"

	"api/configs"
	"api/internal/db"
	"api/internal/routes"
	"api/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func startServer(r *gin.Engine) {
	fmt.Println("Server started successfully http://localhost:8080")

	if err := r.Run(":8080"); err != nil {
		fmt.Println("Error starting server")
	}
}

func loadEnvVariables() error {
	err := godotenv.Load(".env")
	if err != nil {
		return fmt.Errorf("error loading .env file: %w", err)
	}
	return nil
}

func connectDB() *sql.DB {
	dbURL := configs.GetDBSource()

	conn, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("Error connecting to the database:", err)
	}
	if err := conn.Ping(); err != nil {
		log.Fatal("Database ping failed:", err)
	}
	return conn
}

func main() {
	if err := loadEnvVariables(); err != nil {
		log.Fatal(err)
	}
	conn := connectDB()

	store := db.New(conn)

	if err := utils.RegisterValidator(); err != nil {
		log.Fatalf("Failed to register validator: %v", err)
	}

	r := routes.SetupRouter(store, conn)

	startServer(r)
}
