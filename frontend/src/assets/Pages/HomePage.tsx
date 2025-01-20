

const HomePage = (props) => {

    return (
        <>
            HomePage
            <button onClick={()=>props.logout()}>Выйти</button>
        </>
    )
}

export default HomePage