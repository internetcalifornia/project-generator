import fs from "fs-extra";
import path from "path";
import os from "os";
import ProjectConfiguration from "../ProjectConfiguration";
import { logger } from "../../app";
import saveExternalFile from "./saveExternalFile";

export type File = string;
export type ConfigContent = (File | CopyFile | CopyDir | CopyResource | Directory)[];
export type Content = File | CopyDir | CopyFile | CopyResource | Directory;
export type Directory = {
  name: string;
  content: ConfigContent;
};

export type CopyFile = {
  name: string;
  copy: string;
};

export type CopyResource = {
  name: string;
  from: string;
};

export type CopyDir = {
  name: string;
  copy: string;
  isDirectory: boolean;
  recursive: boolean;
  depth: number;
};

export const isFile = (file: any): file is File => {
  return typeof file === "string";
};

export const isCopyFile = (copyFile: any): copyFile is CopyFile => {
  if ((copyFile as CopyFile).name && !(copyFile as CopyDir).isDirectory && !(copyFile as CopyDir).recursive && !(copyFile as CopyDir).depth && (copyFile as CopyFile).copy) {
    return true;
  }
  return false;
};

/**
 * @description
 * object is a CopyDirectory if it has properties:
 * - name
 * - copy
 * - and any of the  following:
 *   - isDirectory = true
 *   - recursive = true
 *   - depth > 0
 *   - name string ends with /
 * @param copyDir is this object a CopyDir
 */
export const isCopyDir = (copyDir: any): copyDir is CopyDir => {
  if (
    (copyDir as CopyDir).isDirectory ||
    (copyDir as CopyDir).recursive ||
    (copyDir as CopyDir).depth > 0 ||
    ((copyDir as CopyFile).copy?.match(/\/$/) && (copyDir as CopyDir).copy && (copyDir as CopyDir).name)
  ) {
    return true;
  }
  return false;
};

export const isCopyResource = (copyResource: any): copyResource is CopyResource => {
  if ((copyResource as CopyResource).from) {
    if ((copyResource as CopyResource).from.match(/^https?:\/\//)) {
      return true;
    }
  }
  return false;
};

export const isDirectory = (dir: any): dir is Directory => {
  if ((dir as Directory).content) {
    return true;
  }
  return false;
};

// * Take one object parse that object return Promise<Another Parser|void>

type ConfigFileNext = () => any;

/**
 *
 * @param configContent The configuration file content to parse over.
 * @param parentDirectory The parent directory of the content this is what will be used to determine where the files ultimately will reside
 * @param next This is the call stack for for descending directories.
 */
const ConfigContentParser = (projectConfig: ProjectConfiguration, configContent: ConfigContent, parentDirectory: string, next?: ConfigFileNext[]): ConfigFileNext[] => {
  if (!next) next = [];

  for (let ind in configContent) {
    let content = configContent[ind];

    if (isDirectory(content)) {
      let directoryContent: ConfigContent = content.content;
      let directoryName: string = content.name;
      let fullDirectoryName = parentDirectory.concat("/", directoryName);
      logger.debug(parentDirectory, "/", directoryName);
      // * We know this is directory since it has a content property. This means we need to recursively search it's content further to parse.

      next.push(() => ConfigContentParser(projectConfig, directoryContent, fullDirectoryName, next));
    } else if (isCopyDir(content)) {
      // ? We should have high expectations that this is a dir since our checks determined either by passing isDirectory = true
      // ? the copy ends in /, recursive is defined, or depth is define and greater than 0.
      copyContentTo(parentDirectory, content);
      logger.debug(`${parentDirectory}/ - copy ${content.name} from ${content.copy} ${content.recursive ? "recursively" : ""}`);
    } else if (isCopyFile(content)) {
      copyContentTo(parentDirectory, content);
      // ? need to double check if file or dir, will determine with CopyFile func, if it is a dir should we through an error?
      logger.debug(`${parentDirectory} - copy file ${content.name} from ${content.copy}`);
    } else if (isFile(content)) {
      // * We know this is a file since it is a string value, we should touch this file with the of the string provided in the parentDirectory provided.
      let filepath = path.join(parentDirectory, content);

      // * Test first if the user has access
      createEmptyFile(filepath);
      logger.debug(`${parentDirectory}/${content} - create file ${content}`);
    } else if (isCopyResource(content)) {
      if (projectConfig.allowNetworkFiles) {
        let filepath = path.join(parentDirectory, content.name);
        saveExternalFile(content, filepath);
      } else {
        logger.warn(`External Content Cannot Be Retrieved Because allowNetworkFile flag has not been set.`);
      }
    }
  }
  //console.log("end***", parentDirectory, incrementor);
  return next;
};

export { ConfigContentParser };

const copyContentTo = async (location: string, content: CopyDir | CopyFile) => {
  let tgtPath = path.join(location, content.name);
  let srcPath = path.resolve(content.copy.replace(/^~/, os.homedir()));
  try {
    await fs.access(srcPath);
    await copyFiles(srcPath, tgtPath);
  } catch (err) {
    logger.error(err.message);
  }
};

const copyFiles = async (src: string, directoryPath: string): Promise<void> => {
  try {
    await fs.copy(src, directoryPath, { overwrite: true });
  } catch (err) {
    // passing this error up don't handle here.
    throw err;
  }
};

export default class ConfigFileParser {
  continuousFunctions: ConfigFileNext[];
  config: ProjectConfiguration;

  constructor(projectConfig: ProjectConfiguration) {
    this.continuousFunctions = [];
    this.config = projectConfig;
  }

  async parse() {
    let files = this.config.files;
    console.log(this.config.projectDirectory);
    // this.config.projectDirectory;
    return new Promise<boolean>((resolve, reject) => {
      if (!files) {
        reject("No files");
        return;
      }
      this.continuousFunctions = ConfigContentParser(this.config, files, this.config.projectDirectory);
      while (this.continuousFunctions.length) {
        let next = this.continuousFunctions.shift();
        next();
      }
      resolve(true);
    });
  }
}

const createEmptyFile = async (filePath: string) => {
  let dir = path.dirname(filePath);
  try {
    await fs.mkdirp(dir);
    await fs.writeFile(filePath, "", { encoding: "utf-8" });
  } catch (err) {
    logger.error(err.message);
  }
};
//directoryParser(example, "/Users/scotteremiaroden");
