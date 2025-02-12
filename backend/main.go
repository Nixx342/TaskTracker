package main

import (
	"backend/DB"
	"database/sql"
	"fmt"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
	"log"
	"net/http"
)

const (
	host     = DB.Host
	port     = DB.Port
	user     = DB.User
	password = DB.Password
	dbname   = DB.DBName
)

type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
}

func main() {

	// Подключение к базе данных
	psqlInfo := "host=%s port=%d user=%s password=%s dbname=%s sslmode=disable"
	psqlInfo = fmt.Sprintf(psqlInfo, host, port, user, password, dbname)

	DB, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatalf("Не удалось подключиться к базе данных: %v", err)
	}
	defer DB.Close()
	if err := DB.Ping(); err != nil {
		log.Fatalf("База данных недоступна: %v", err)
	}
	log.Println("Подключение к базе данных успешно!")
	r := gin.Default()

	// Добавляем middleware для CORS
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	setupRoutes(r, DB)

	if err := r.Run("0.0.0.0:8080"); err != nil {
		log.Fatalf("Ошибка запуска сервера: %v", err)
	}
}

func setupRoutes(r *gin.Engine, db *sql.DB) {
	r.GET("/users", getUsersHandler(db))
	r.GET("/users/:username", getUserByUsernameHandler(db))
	r.POST("/adduser", addUserHandler(db))
}

func getUsersHandler(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		//rows, err := db.Query("SELECT id, username, password FROM public.users")
		rows, err := db.Query("SELECT id, username FROM public.users")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить пользователей"})
			return
		}
		defer rows.Close()

		var users []User
		for rows.Next() {
			var user User
			if err := rows.Scan(&user.ID, &user.Username); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обработке пользователя"})
				return
			}
			users = append(users, user)
		}
		c.JSON(http.StatusOK, users)
	}
}

func getUserByUsernameHandler(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")

		row := db.QueryRow("SELECT id, username, password FROM public.users WHERE username = $1", username)

		var user User
		if err := row.Scan(&user.ID, &user.Username, &user.Password); err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при выполнении запроса"})
			}
			return
		}

		c.JSON(http.StatusOK, user)
	}
}

func addUserHandler(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var user User
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные"})
			return
		}

		if len(user.Password) < 6 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Пароль должен содержать минимум 6 символов"})
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обработке пароля"})
			return
		}

		row := db.QueryRow(
			"INSERT INTO public.users (username, password) VALUES ($1, $2) RETURNING id",
			user.Username, string(hashedPassword),
		)

		if err := row.Scan(&user.ID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при добавлении пользователя"})
			return
		}

		user.Password = ""
		c.JSON(http.StatusCreated, user)
	}
}
