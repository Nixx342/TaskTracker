// import './App.css'
// import LoginPage from "./assets/Pages/LoginPage.tsx";
// import HomePage from "./assets/Pages/HomePage.tsx";
// import {UserType} from './assets/Types/UserType.ts'
//
// function App() {
//
//     const registerUser =(user: UserType): void => {
//         const openRequest = indexedDB.open('TaskTracker',1)
//         openRequest.onerror = () => {
//             console.error("Error: ", openRequest.error)
//         }
//         openRequest.onupgradeneeded = (event) => {
//             const db = event.target.result;
//             if (!db.objectStoreNames.contains('users')) {
//                 db.createObjectStore('users', { keyPath: 'id' });
//             }
//         };
//         openRequest.onsuccess = ()=> {
//             const db = openRequest.result
//
//             db.createObjectStore('users',{keyPath: 'id'})
//             const transaction = db.transaction('users', 'readwrite')
//             const users = transaction.objectStore('users')
//             const request = users.add(user)
//             request.onsuccess = () => {
//                 console.log('Пользователь ', user.username, ' успешно добавлен')
//             }
//             request.onerror = () => {
//                 console.error('Error: ', request.error)
//             }
//         }
//     }
//
//   return (
//     <>
//         <button onClick={()=>registerUser({id:Date.now(),username:'testUser',password:'123'})}>add</button>
//         <LoginPage />
//         <HomePage />
//     </>
//   )
// }
//
// export default App





import './App.css';
import LoginPage from "./assets/Pages/LoginPage.tsx";
import HomePage from "./assets/Pages/HomePage.tsx";
import { UserType } from './assets/Types/UserType.ts';
import {useEffect, useState} from "react";


function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject): void => {
        const request: IDBOpenDBRequest = indexedDB.open("TaskTracker", 1)
        request.onupgradeneeded = (event: IDBVersionChangeEvent): void => {
            const db: IDBDatabase = (event.target as IDBOpenDBRequest).result
            const objectStore: IDBObjectStore = db.createObjectStore("users", { keyPath: "id" })
            objectStore.createIndex("username", "username", { unique: false })
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

    const registerUser = (user: UserType): void => {
        try {
            const transaction = db.transaction("users", "readwrite")
            const objectStore: IDBObjectStore = transaction.objectStore("users");
            const addRequest = objectStore.add(user)

            addRequest.onsuccess = (): void => {

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

    return (
        <>
            <button onClick={() => registerUser({id: 'qwe' ,username: 'testUser', password: '123' })}>add</button>
            <LoginPage />
            <HomePage />
        </>
    );
}

export default App;
