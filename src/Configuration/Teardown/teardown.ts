import ProjectConfiguration from "../ProjectConfiguration";
import fs from "fs-extra";

const teardown = async (config: ProjectConfiguration) => {
    let projectDirectory = config.projectDirectory;
    return fs.remove(projectDirectory);
}

export default teardown;