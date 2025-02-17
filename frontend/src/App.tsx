import './App.css';
import LoginPage from "./assets/Pages/LoginPage.tsx";
import HomePage from "./assets/Pages/HomePage.tsx";
import {useState} from "react";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";


function App() {
    const [isLogin, setIsLogin] = useState<boolean>(localStorage.getItem('isLogin') === 'true');
    const logout = () => {
        setIsLogin(false);
        localStorage.setItem('isLogin', 'false');
        localStorage.setItem('activeUser', '')
    }
    const login = () => {
        setIsLogin(true);
        localStorage.setItem('isLogin', 'true');
    }

    return (
        <BrowserRouter>
            <Routes>
            {
                isLogin
                    ? <Route path={"/"} element={<HomePage logout={logout}/>}/>
                    : (
                        <>
                            <Route path={"/login"} element={<LoginPage login={login} />}/>
                            <Route path={"*"} element={<Navigate to={'/login'}/>}/>
                        </>
                    )
            }
            </Routes>
        </BrowserRouter>
    );
}

export default App;
