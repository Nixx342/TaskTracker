import {useNavigate} from "react-router-dom";
import {HomePageProps} from "../Types/TypeComponents.ts";
import Project from "./Project.tsx";

const HomePage = ({logout: handleLogout} : HomePageProps) => {

    const navigate = useNavigate()
    const logout = () => {
        handleLogout()
        navigate("/login")
    }
    return (
        <>
            <header>
                <div>
                    {localStorage.getItem('activeUser')}
                </div>
                <button onClick={() => logout()}>Выйти</button>
            </header>
            <main>
                <Project name={'Home'} />
                <Project name={'Test'} />
                <Project name={'WoW'} />
            </main>
        </>
    )
}

export default HomePage