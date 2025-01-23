import {taskType} from "../Types/TypeComponents.ts";

const Task = (props: taskType) => {

    return (
        <div>
            <h3>{props.name}</h3>
            <p>{props.description}</p>
        </div>
    )
}

export default Task;