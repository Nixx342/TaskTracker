import {useNavigate} from "react-router-dom";
import {HomePageProps} from "../Types/TypeComponents.ts";

const HomePage = ({logout: handleLogout} : HomePageProps) => {

    const navigate = useNavigate()
    const logout = () => {
        // props.logout()
        handleLogout()
        navigate("/login")
    }
    return (
        <>
            <div>
                {localStorage.getItem('activeUser')}
            </div>
            <button onClick={()=>logout()}>Выйти</button>
        </>
    )
}

export default HomePage