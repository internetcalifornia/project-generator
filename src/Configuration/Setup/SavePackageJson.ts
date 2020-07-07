import fs from "fs";
import path from "path";
import ProjectConfiguration from "../ProjectConfiguration";
import { logger } from "../../app";

const savePackageJson = (config: ProjectConfiguration, pkg) => {
  let packagePath = path.join(config.projectDirectory, "package.json");
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(packagePath, pkg, { encoding: "utf-8" }, (err) => {
      if (err) {
        logger.error("Error when writing package.json");
        reject(err.message);
      } else {
        resolve();
        //console.log(`Saved ${packagePath}`);
      }
    });
  });
};

export default savePackageJson;
