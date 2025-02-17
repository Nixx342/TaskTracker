package main

import (
	"backend/DB"
	"database/sql"
	"fmt"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
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

func init() {
	// Проверка параметров подключения
	log.Printf("Database connection params: host=%s port=%d user=%s dbname=%s", host, port, user, dbname)

	// Подключение к базе данных
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatalf("Ошибка при подключении к БД: %v", err)
	}
	defer db.Close()

	// Обновляем последовательность на основе максимального существующего id
	_, err = db.Exec(`
		DO $$ 
		BEGIN 
			-- Создаем таблицу, если она не существует
			CREATE TABLE IF NOT EXISTS public.users (
				id SERIAL PRIMARY KEY,
				username VARCHAR(50) UNIQUE NOT NULL,
				password VARCHAR(255) NOT NULL
			);
			
			-- Обновляем последовательность
			PERFORM setval('users_id_seq', COALESCE((SELECT MAX(id) FROM public.users), 0) + 1, false);
		END $$;
	`)
	if err != nil {
		log.Printf("Ошибка при обновлении последовательности: %v", err)
	}
}

func main() {
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	log.Println("Попытка подключения к базе данных...")
	DB, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatalf("Ошибка при открытии соединения с БД: %v", err)
	}
	defer DB.Close()

	log.Println("Проверка соединения с базой данных...")
	if err := DB.Ping(); err != nil {
		log.Fatalf("Ошибка при проверке соединения с БД: %v", err)
	}
	log.Println("Успешное подключение к базе данных!")

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
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Некорректные данные: %v", err)})
			return
		}
		var exists bool
		err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM public.users WHERE username = $1)", user.Username).Scan(&exists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Ошибка при проверке пользователя: %v", err)})
			return
		}
		if exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Пользователь с таким именем уже существует"})
			return
		}

		// Добавляем пользователя в базу данных напрямую с исходным паролем
		var userID int
		err = db.QueryRow(
			"INSERT INTO public.users (username, password) VALUES ($1, $2) RETURNING id",
			user.Username, user.Password, // Используем исходный пароль
		).Scan(&userID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Ошибка при добавлении пользователя: %v", err)})
			return
		}

		user.ID = userID
		user.Password = "" // Не возвращаем пароль в ответе
		c.JSON(http.StatusCreated, user)
	}
}
