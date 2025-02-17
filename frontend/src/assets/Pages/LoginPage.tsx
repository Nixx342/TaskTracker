import {useState} from "react";
import '../Styles/LoginPage.scss'
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {LoginPageProps} from "../Types/TypeComponents.ts";


const LoginPage = ({ login: handleLoginSuccess }: LoginPageProps) => {
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [errorMsg, setErrorMsg] = useState<string>('')
    const navigate = useNavigate()

    const modalOpen = (id: string) => {
        const modal = document.getElementById(id) as HTMLDialogElement | null
        modal?.showModal()
        setErrorMsg('')
    }
    const modalClose = (id: string) => {
        const modal = document.getElementById(id) as HTMLDialogElement | null
        modal?.close()
        setErrorMsg('')
    }
    const loginKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleLogin();
        }
    }
    const registerKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            register();
        }
    }
    const handleLogin = () => {
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
    const register = async (): Promise<void> => {
        setErrorMsg('')
        
        // Валидация полей
        if (!username) {
            setErrorMsg('Введите имя пользователя!')
            return
        }
        if (!password) {
            setErrorMsg('Введите пароль!')
            return
        }
        if (password.length < 6) {
            setErrorMsg('Пароль должен содержать минимум 6 символов!')
            return
        }

        try {
            await registerNewUser(username, password)
            setUsername('')
            setPassword('')
            modalClose('register')
            navigate("/")
            localStorage.setItem('activeUser', username)
            handleLoginSuccess()
        } catch (error) {
            if (error instanceof Error) {
                setErrorMsg(error.message)
            } else {
                setErrorMsg('Произошла неизвестная ошибка')
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
                    handleLoginSuccess()
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
    const registerNewUser = async (username: string, password: string) => {
        try {
            const response = await axios.post('http://localhost:8080/adduser', {
                username: username,
                password: password,
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            return response.data
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.error || 'Ошибка при добавлении пользователя')
            } else {
                throw new Error('Ошибка сети')
            }
        }
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
                    <button onClick={() => handleLogin()}>Войти</button>
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