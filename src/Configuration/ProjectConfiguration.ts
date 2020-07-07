import path from "path";
import os from "os";
import { ConfigContent } from "./Setup/ConfigContentParser";

class ProjectConfiguration {
  name: string;
  version: string = "1.0.0";
  repository?: object;
  author?: string;
  files?: ConfigContent;
  dependencies?: {
    node?: {
      packageManager: "yarn" | "npm";
      production: string[];
      development: string[];
    };
  };
  keywords?: string[];
  description?: string;
  scripts?: {
    name: string;
    command: string;
  }[];
  entrypoint?: string;
  license?: string;
  projectPath: string;
  allowNetworkFiles: boolean = false;
  forceDir: boolean = false;

  constructor(config: ProjectConfig) {
    this.allowNetworkFiles = config.allowNetworkFiles ?? false;
    this.name = config.name;
    this.version = config.version ?? "1.0.0";
    this.repository = config.repository;
    this.files = config.files;
    this.dependencies = config.dependencies;
    this.keywords = config.keywords;
    this.scripts = config.scripts;
    this.entrypoint = config.entrypoint;
    this.license = config.license;
    this.author = config.author;
    this.description = config.description;
    this.projectPath = config.path as string;
    this.forceDir = false;
    if (!this.name) throw new Error("Invalid Configuration, Cannot Continue, Must Have a Project Name");
  }
  /**
   *
   * @name projectDirectory
   * @readonly
   * @type {string}
   * @memberof ProjectConfiguration
   * @description This is the directory path of where the projects source files will be retained.
   */
  get projectDirectory(): string {
    let expandedRootDir = this.projectPath.replace(/^~/, os.homedir());
    // * this flag is set from project when --out-dir is set
    if (this.forceDir) return path.resolve(expandedRootDir);

    let projectDir = path.join(expandedRootDir, "/", this.name);
    return path.resolve(projectDir);
  }

  /**
   *
   * @name projectParentDirectory
   * @readonly
   * @type {string}
   * @memberof ProjectConfiguration
   * @description This is the directory where the Projects Root
   */
  get projectParentDirectory(): string {
    let expandedPath = this.projectPath.replace(/^~/, os.homedir());
    let rootDir = path.resolve(expandedPath);
    return rootDir;
  }
}
export type ProjectConfig = {
  name: string;
  version?: string;
  repository?: object;
  files?: ConfigContent;
  author?: string;
  dependencies?: {
    node?: {
      packageManager: "yarn" | "npm";
      production: string[];
      development: string[];
    };
  };
  keywords?: string[];
  description?: string;
  scripts?: {
    name: string;
    command: string;
  }[];
  entrypoint?: string;
  license?: string;
  path: string;
  allowNetworkFiles: boolean;
};
export default ProjectConfiguration;
