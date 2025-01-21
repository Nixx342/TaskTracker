import {useState} from "react";
import { UserType } from '../Types/UserType.ts';
import '../Styles/LoginPage.scss'

const LoginPage = (props) => {
// const LoginPage = (props: LoginPageType) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('')

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
            const user: UserType  = {
                username: username,
                password: password,
            }
            props.register(user)
            setUsername('')
            setPassword('')
            modalClose('register')
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
    const login = () => {
        setErrorMsg('')
        if (username && password) {
            const user: UserType  = {
                username: username,
                password: password
            }
            props.login(user)
            setUsername('')
            setPassword('')
            modalClose('login')
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
                            onChange={e => setUsername(e.target.value)}
                        />
                    </div>
                    <div className={'input-area'}>
                        <span>Пароль:</span>
                        <input
                            type={'password'}
                            value={password}
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
                {
                    errorMsg
                        ? <div className={'error-msg'}>{errorMsg}</div>
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
                <button onClick={() => register()}>Зарегистрироваться</button>
                <button onClick={() => modalClose('register')}>Отмена</button>
            </dialog>
        </>
    )
}

export default LoginPage