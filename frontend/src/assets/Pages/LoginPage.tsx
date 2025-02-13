import {useState, useEffect} from "react";
// import { TypeComponents } from '../Types/TypeComponents.ts';
import '../Styles/LoginPage.scss'
import {useNavigate} from "react-router-dom";
import axios from "axios";

const LoginPage = (props) => {
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [errorMsg, setErrorMsg] = useState<string>('')
    const navigate = useNavigate()

    const modalOpen = (id: string) => {
        const modal: HTMLElement | null = document.getElementById(id)
        modal?.showModal()
        setErrorMsg('')
    }
    const modalClose = (id: string) => {
        const modal: HTMLElement | null = document.getElementById(id)
        modal?.close()
        setErrorMsg('')
    }
    const register =(): void => {
        setErrorMsg('')
        if (username && password) {
            const user: TypeComponents  = {
                username: username,
                password: password,
            }
            props.register(user)
            setUsername('')
            setPassword('')
            modalClose('register')
            navigate("/")
        } else {
            if (!username) {
                setErrorMsg('Введите имя пользователя!')
            }
            if (!password) {
                setErrorMsg('Введите пароль!')
            }
            if (!username && !password) {
                setErrorMsg('Заполните все поля!')
            }
        }
    }
    const loginKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            login();
        }
    }
    const registerKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            register();
        }
    }
    const login = () => {
        setErrorMsg('')
        if (username && password) {
            checkLoginData(username)

        } else {
            if (!username) {
                setErrorMsg('Введите имя пользователя!')
            }
            if (!password) {
                setErrorMsg('Введите пароль!')
            }
            if (!username && !password) {
                setErrorMsg('Заполните все поля!')
            }
        }
    }
    const checkLoginData = async (username: string) => {
        const url = `http://localhost:8080/users/${username}`
        await axios.get(url)
            .then((resp) => {
                const data = resp.data
                if(data.password === password) {
                    setUsername('')
                    setPassword('')
                    props.login()
                    localStorage.setItem('activeUser', username)
                    modalClose('login')
                    navigate("/")
                } else {
                    setErrorMsg('Неверный пароль')
                }
            })
            .catch(() => {
                setErrorMsg('Пользователь не существует')
            })
    }



    return (
        <>
            <button onClick={() => modalOpen('login')}>Войти</button>
            <button onClick={() => modalOpen('register')}>Зарегистрироваться</button>

            <dialog id="login">
                <div className={'main-modal-block'}>
                    <div className={'input-area'}>
                        <span>Имя пользователя:</span>
                        <input
                            type={'text'}
                            value={username}
                            onKeyDown={loginKeyDown}
                            onChange={e => setUsername(e.target.value)}
                        />
                    </div>
                    <div className={'input-area'}>
                        <span>Пароль:</span>
                        <input
                            type={'password'}
                            value={password}
                            onKeyDown={loginKeyDown}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                </div>
                <div className={'button-block'}>
                    <button onClick={() => login()}>Войти</button>
                    <button onClick={() => modalClose('login')}>Отмена</button>
                </div>
                {
                    errorMsg
                        ? <div className={`error-msg ${errorMsg ? 'visible' : ''}`}>{errorMsg}</div>
                        : null
                }
            </dialog>
            <dialog id="register">
                <div className={'main-modal-block'}>
                    <div className={'input-area'}>
                        <span>Имя пользователя:</span>
                        <input
                            type={'text'}
                            value={username}
                            onKeyDown={registerKeyDown}
                            onChange={e => setUsername(e.target.value)}
                        />
                    </div>
                    <div className={'input-area'}>
                        <span>Пароль:</span>
                        <input
                            type={'password'}
                            value={password}
                            onKeyDown={registerKeyDown}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                </div>
                <div className={'button-block'}>
                    <button onClick={() => register()}>Зарегистрироваться</button>
                    <button onClick={() => modalClose('register')}>Отмена</button>
                </div>
                {
                    errorMsg
                        ? <div className={`error-msg ${errorMsg ? 'visible' : ''}`}>{errorMsg}</div>
                        : null
                }
            </dialog>
        </>
    )
}

export default LoginPage