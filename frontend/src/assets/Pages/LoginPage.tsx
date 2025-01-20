import {useState} from "react";


const LoginPage = (props) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const modalOpen = (id: string) => {
        const modal: HTMLElement | null = document.getElementById(id)
        modal?.showModal()
    }
    const modalClose = (id: string) => {
        const modal: HTMLElement | null = document.getElementById(id)
        modal?.close()
    }

    return (
        <>
            <button onClick={() => modalOpen('login')}>Войти</button>
            <button onClick={() => modalOpen('register')}>Зарегистрироваться</button>

            <dialog id="login">
                <span>Введите имя пользователя:
                    <input
                        type={'text'}
                        onChange={e => setUsername(e.target.value)}
                    />
                </span>
                <span>Введите пароль:
                    <input
                        type={'password'}
                        onChange={e => setPassword(e.target.value)}
                    />
                </span>
                <button onClick={() => props.login()}>Войти</button>
                <button onClick={() => modalClose('login')}>Отмена</button>

            </dialog>
            <dialog id="register">
                <span>Введите имя пользователя: <input/></span>
                <span>Введите пароль: <input/></span>
                <button onClick={() => modalClose('register')}>Зарегистрироваться</button>
                <button onClick={() => modalClose('register')}>Отмена</button>
            </dialog>
        </>
    )
}

export default LoginPage