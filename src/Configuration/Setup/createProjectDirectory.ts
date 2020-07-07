import ProjectConfiguration from "../ProjectConfiguration";
import fs from "fs-extra";
import { logger } from "../../app";

/**
 *
 * @param config Create the root project directory in the file system
 */
const CreateProjectDirectory = async (config: ProjectConfiguration) => {
  let projectDir = config.projectDirectory;
  try {
    let alreadyExists = fs.existsSync(projectDir);
    if (alreadyExists) throw new Error("Directory already exists");
    await fs.mkdirp(projectDir);
  } catch (err) {
    logger.error(err.message);
    throw err;
  }
};

export default CreateProjectDirectory;
