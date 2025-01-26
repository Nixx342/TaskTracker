import Task from "./Task.tsx";


const Board = (props) => {

    return (
        <div>
            {
                props.tasks.map(task => {
                    return (
                        <Task name={task.name} description={task.description}/>
                    )
                })
            }
        </div>
    )
}

export default Board