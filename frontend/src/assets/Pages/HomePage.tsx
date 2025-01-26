import {useNavigate} from "react-router-dom";


const HomePage = (props) => {

    const navigate = useNavigate()
    const logout = () => {
        props.logout()
        navigate("/login")
    }
    return (
        <>
            <div>
                {props.activeUser}
            </div>
            <button onClick={()=>logout()}>Выйти</button>
        </>
    )
}

export default HomePage