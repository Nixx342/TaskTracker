import {useState} from "react";
import { UserType } from '../Types/UserType.ts';

const LoginPage = (props) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<boolean>(false)

    const modalOpen = (id: string) => {
        const modal: HTMLElement | null = document.getElementById(id)
        modal?.showModal()
    }
    const modalClose = (id: string) => {
        const modal: HTMLElement | null = document.getElementById(id)
        modal?.close()
    }
    const register =(): void => {

        const user: UserType  = {
            username: username,
            password: password,
        }
        props.register(user)
        setUsername('')
        setPassword('')
        modalClose('register')
    }
    const login = () => {
        const user: UserType  = {
            username: username,
            password: password
        }
        props.login(user)
        setUsername('')
        setPassword('')
        modalClose('login')
    }

    return (
        <>
            <button onClick={() => modalOpen('login')}>Войти</button>
            <button onClick={() => modalOpen('register')}>Зарегистрироваться</button>

            <dialog id="login">
                {
                    errorMsg
                        ? <span></span>
                        : null
                }
                <span>Введите имя пользователя:
                    <input
                        type={'text'}
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                </span>
                <span>Введите пароль:
                    <input
                        type={'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </span>
                <button onClick={() => login()}>Войти</button>
                <button onClick={() => modalClose('login')}>Отмена</button>

            </dialog>
            <dialog id="register">
                <span>Введите имя пользователя:
                    <input
                        type={'text'}
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                </span>
                <span>Введите пароль:
                    <input
                        type={'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </span>
                <button onClick={() => register()}>Зарегистрироваться</button>
                <button onClick={() => modalClose('register')}>Отмена</button>
            </dialog>
        </>
    )
}

export default LoginPage