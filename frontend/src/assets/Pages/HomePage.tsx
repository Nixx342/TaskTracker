

const HomePage = (props) => {

    return (
        <>
            <div>
                {props.activeUser}
            </div>
            <button onClick={()=>props.logout()}>Выйти</button>
        </>
    )
}

export default HomePage