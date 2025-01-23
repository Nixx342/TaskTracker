import './App.css';
import LoginPage from "./assets/Pages/LoginPage.tsx";
import HomePage from "./assets/Pages/HomePage.tsx";
import { userType } from './assets/Types/TypeComponents.ts';
import {useEffect, useState} from "react";


function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject): void => {
        const request: IDBOpenDBRequest = indexedDB.open("TaskTracker", 1)
        request.onupgradeneeded = (event: IDBVersionChangeEvent): void => {
            const db: IDBDatabase = (event.target as IDBOpenDBRequest).result
            // использует username как уникальный ключ т.к. username не может повторяться
            const objectStore: IDBObjectStore = db.createObjectStore("users", { keyPath: "username" })
            // username уникальный
            objectStore.createIndex("username", "username", { unique: true })
            // password у разных username может повторяться
            objectStore.createIndex("password", "password", { unique: false })
            console.log("Хранилище users создано")
        };
        request.onsuccess = (event: Event): void => {
            const db: IDBDatabase = (event.target as IDBOpenDBRequest).result
            resolve(db)
        };
        request.onerror = (event: Event): void => {
            reject((event.target as IDBOpenDBRequest).error)
        };
    });
}



function App() {
    const [db, setDb] = useState<IDBDatabase | null>(null);
    const [isLogin, setIsLogin] = useState<boolean>(localStorage.getItem('isLogin') === 'true');
    const [activeUser, setActiveUser] = useState<string>('')
    useEffect(():() => void => {
        openDatabase()
            .then((database: IDBDatabase):void => {
                setDb(database)
                console.log("БД успешно подключена")
            })
            .catch((err: Error): void => {
                console.error("Ошибка при подключении к БД: ",err);
            })
        return (): void => {
            if (db) {
                db.close()
                console.log("Соединение с БД закрыто")
            }
        }
    }, [])

    const registerUser = (user: userType): void => {
        if(db){
            try {
                const transaction = db.transaction("users", "readwrite")
                const objectStore: IDBObjectStore = transaction.objectStore("users");
                const addRequest = objectStore.add(user)

                addRequest.onsuccess = (): void => {
                    setActiveUser(user.username)
                    login()
                    console.log(`Пользователь "${user.username}" успешно добавлена`)
                }
                transaction.oncomplete = (): void => {
                    console.log('Транзакция успешно завершена')
                }
                transaction.onerror = (): void => {
                    console.error('Ошибка при выполнении транзакции: ',transaction.error)
                }
            } catch (err) {
                console.error('Ошибка при добавлении Пользователя:', err)
            }
        }
    }
    const loginUser = (user: userType): void => {
        if(db) {
            const transaction: IDBTransaction = db.transaction("users", "readonly")
            const objectStore: IDBObjectStore = transaction.objectStore("users");
            const request = objectStore.get(user.username)
            request.onsuccess = (event: Event): void => {
                const data = (event.target as IDBRequest).result;
                if (data && data.password === user.password) {
                    setActiveUser(user.username)
                    login()
                } else {
                    console.log("Неверный пароль")
                }
            }
            request.onerror = (event: Event): void => {
                console.error("Ошибка при получении записи:", (event.target as IDBRequest).error);
            }
        }
    }
    const logout = () => {
        setIsLogin(false);
        localStorage.setItem('isLogin', 'false');
    }
    const login = () => {
        setIsLogin(true);
        localStorage.setItem('isLogin', 'true');
    }

    return (
        <>
            {
                isLogin
                    ? <HomePage logout={logout} activeUser={activeUser}/>
                    : <LoginPage register={registerUser} login={loginUser} />
            }

        </>
    );
}

export default App;
