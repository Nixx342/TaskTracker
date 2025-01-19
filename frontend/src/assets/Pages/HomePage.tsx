

const HomePage = (props) => {

    return (
        <>
            HomePage
            <button onClick={()=>props.logout()}>logout</button>
        </>
    )
}

export default HomePage