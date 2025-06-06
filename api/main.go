package main

import (
	"api/internal/db"
	"api/internal/routes"
	"database/sql"
	"fmt"
	"log"
	"os"

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
	DB_USER := os.Getenv("DB_USER")
	DB_PASSWORD := os.Getenv("DB_PASSWORD")
	DB_HOST := os.Getenv("DB_HOST")
	DB_PORT := os.Getenv("DB_PORT")
	DB_NAME := os.Getenv("DB_NAME")

	dbURL := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME)

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
	r := routes.SetupRouter(store, conn)

	startServer(r)
}
