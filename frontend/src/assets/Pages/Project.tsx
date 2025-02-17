import {ProjectProps} from "../Types/TypeComponents.ts";

const Project = ({name} : ProjectProps) => {

    return (
        <div>
            <h3>{name}</h3>
        </div>
    )
}

export default Project;