package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

const (
	//host     = "localhost"
	host     = "46.146.232.41"
	port     = 5432       // стандартный порт PostgreSQL
	user     = "postgres" // замени на своего пользователя
	password = "Sze_55gf" // замени на свой пароль
	dbname   = "TaskTracker"
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

	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatalf("Не удалось подключиться к базе данных: %v", err)
	}
	defer db.Close()

	// Проверяем подключение
	if err := db.Ping(); err != nil {
		log.Fatalf("База данных недоступна: %v", err)
	}
	log.Println("Подключение к базе данных успешно!")

	// Создаем сервер
	r := gin.Default()

	// Роут для проверки работы API
	r.GET("/users", func(c *gin.Context) {
		rows, err := db.Query("SELECT id, username, password FROM public.users")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить пользователей"})
			return
		}
		defer rows.Close()

		var users []User
		for rows.Next() {
			var user User
			if err := rows.Scan(&user.ID, &user.Username, &user.Password); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обработке пользователя"})
				return
			}
			users = append(users, user)
		}
		c.JSON(http.StatusOK, users)
	})

	// Стартуем сервер
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Ошибка запуска сервера: %v", err)
	}
}
