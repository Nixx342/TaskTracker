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
	//
	//connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)
	//db, err := sql.Open("postgres", connStr)
	//if err != nil {
	//	panic(err)
	//}
	//defer db.Close()
	//result, err := db.Exec("insert into users(id, username, password) values($1, $2, $3)", 5, "newUser2", "newPassword2")
	//if err != nil {
	//	panic(err)
	//}
	//fmt.Println(result.LastInsertId())
	//fmt.Println(result.RowsAffected())

	// Подключение к базе данных
	psqlInfo := "host=%s port=%d user=%s password=%s dbname=%s sslmode=disable"
	psqlInfo = fmt.Sprintf(psqlInfo, host, port, user, password, dbname)

	DB, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatalf("Не удалось подключиться к базе данных: %v", err)
	}
	defer DB.Close()

	// Проверяем подключение
	if err := DB.Ping(); err != nil {
		log.Fatalf("База данных недоступна: %v", err)
	}
	log.Println("Подключение к базе данных успешно!")

	// Создаем сервер
	r := gin.Default()

	// Роут для проверки работы API
	r.GET("/users", func(c *gin.Context) {
		rows, err := DB.Query("SELECT id, username, password FROM public.users")
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
	r.GET("/users/:username", func(c *gin.Context) {
		username := c.Param("username")

		//row := DB.QueryRow("SELECT id, username, password FROM public.users WHERE username = 'nixx'", username)
		row := DB.QueryRow("SELECT id, username, password FROM public.users WHERE username = $1", username)

		var user User
		if err := row.Scan(&user.ID, &user.Username, &user.Password); err != nil {
			// Если пользователь не найден
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
			} else {
				// Другая ошибка
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при выполнении запроса"})
			}
			return
		}

		c.JSON(http.StatusOK, user)
	})

	r.POST("/adduser", func(c *gin.Context) {
		var user User
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные"})
			return
		}

		// Хешируем пароль перед сохранением
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)

		// SQL-запрос на добавление пользователя
		row := DB.QueryRow(
			"INSERT INTO public.users (username, password) VALUES ($1, $2) RETURNING id",
			user.Username, string(hashedPassword),
		)

		if err := row.Scan(&user.ID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при добавлении пользователя"})
			return
		}

		c.JSON(http.StatusCreated, user)
	})

	// Стартуем сервер
	if err := r.Run("0.0.0.0:8080"); err != nil {
		//if err := r.Run(":8080"); err != nil {
		log.Fatalf("Ошибка запуска сервера: %v", err)
	}
}
