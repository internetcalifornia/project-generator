import path from "path";
import ConfigurationLoader from "./ConfigurationLoader";
import ProjectConfiguration from "./ProjectConfiguration";
import BuildPackageJson from "./Setup/BuildPackageJson";
import CreateProjectDirectory from "./Setup/CreateProjectDirectory";
import SavePackageJson from "./Setup/SavePackageJson";
import ConfigFileParser from "./Setup/ConfigContentParser";
import npmDependencyParser from "./Setup/npmDependencyParser";
import teardown from "./Teardown/teardown";
import initializeGit from "./Git/initializeGit";
import addAllGit from "./Git/addGit";
import commitGit from "./Git/commitGit";
import addRemoteGit from "./Git/addRemoteGit";
import pushGit from "./Git/pushGit";
import winston, { Logger, transports, format } from "winston";
import os from "os";
import yarnDependencyParser from "./Setup/yarnDependencyParser";

class Project {
  configurationDirectory: string;
  configurationFile: string = "project-config.json";
  configurationFileExtension: "json" | "yaml";
  packageManager?: "npm" | "yarn";
  //nodePath: string;
  //processExecutionPath: string;
  presentWorkingDirectory: string = process.env.PWD;
  outDirectory?: string;
  projectConfiguration?: ProjectConfiguration;
  logger: Logger;
  allowNetworkFiles: boolean = false;

  /**
   *
   * @param args Process Argv passed from Node
  /**
  */
  constructor(args: string[]) {
    let previousArg: string;
    let currentArg: string;
    let transport: winston.transport;

    this.allowNetworkFiles = false;
    // * setup the logger first by mapping through the args;
    args.map((value, index, array) => {
      if (value == "--log-level") {
        let level = array[index + 1];
        if (!level) transport = new transports.Console({ level: "error" });
        else transport = new transports.Console({ level });
      } else if (value == "--silent" || value == "--quite") {
        transport = new transports.Console({ level: "emerg" });
      }
    });

    if (!transport) transport = new transports.Console({ level: "error" });
    this.logger = winston.createLogger({
      transports: [transport],
      format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.printf((i) => `[${i.timestamp}] ${i.level} - ${i.message}`)
      ),
    });

    for (let arg in args) {
      //let argNum = parseInt(arg);
      currentArg = args[arg];
      // if (argNum == 0) {
      //   this.nodePath = currentArg;
      // } else if (argNum == 1) {
      //   this.processExecutionPath = currentArg;
      // }
      //this.logger.debug(previousArg, currentArg);
      switch (currentArg) {
        case "--yaml":
        case "--yml":
          this.configurationFileExtension = "yaml";
          break;
        case "--json":
          this.configurationFileExtension = "json";
          break;
        case "--npm":
          if (this.packageManager == "yarn") this.logger.warn("please only use 1 package manager and remove --yarn option");
          this.packageManager = "npm";
          break;
        case "--yarn":
          if (this.packageManager == "npm") this.logger.warn("please only use 1 package manager and remove --npm option");
          this.packageManager = "yarn";
          break;
        case "--allow-net":
          this.allowNetworkFiles = true;
      }
      switch (previousArg) {
        case "-d":
        case "--directory":
          this.logger.debug(`set the configuration dir to ${currentArg}`);
          this.configurationDirectory = currentArg;
          break;
        case "--out-dir":
        case "-o":
          this.logger.debug(`set the output dir to ${currentArg}`);
          this.outDirectory = currentArg;
          break;
        case "--file":
        case "-f":
          this.logger.debug(`set the configuration file to ${currentArg}`);
          this.configurationFile = currentArg;
          break;
      }
      previousArg = currentArg;
    }

    if (!this.configurationFileExtension) {
      this.logger.debug("try determining config file type by file extension");
      if (this.configurationFile.match(/^.*\.(?:json)$/)) {
        this.configurationFileExtension = "json";
      } else if (this.configurationFile.match(/^.*\.(?:yaml|yml)$/)) {
        this.configurationFileExtension = "yaml";
      }
    }

    if (!this.configurationDirectory) {
      this.logger.debug(`this.configurationFilePath = ${this.configurationFile}`);
      if (path.dirname(this.configurationFile) != ".") {
        this.configurationDirectory = path.dirname(this.configurationFile);
        this.logger.debug(this.configurationDirectory);
      } else {
        this.logger.debug(`no dir in file so lets use the cwd ${process.env.PWD}`);
        let dir = this.presentWorkingDirectory;
        this.logger.debug(dir);
        this.configurationDirectory = dir;
      }
    }
  }

  private async createProjectFolders() {
    let fileStuctureGenerator = new ConfigFileParser(this.projectConfiguration);
    return fileStuctureGenerator.parse();
  }

  /**
   * @description Setup the configuration of the project
   */
  private async load() {
    let configPath = path.join(this.configurationDirectory, this.configurationFile);
    try {
      this.logger.debug("load config from", configPath);
      let config = await ConfigurationLoader.load(configPath, this.configurationFileExtension);
      this.projectConfiguration = config;
      if (this.allowNetworkFiles) this.projectConfiguration.allowNetworkFiles = this.allowNetworkFiles;
      if (this.outDirectory) {
        this.projectConfiguration.projectPath = this.outDirectory;
        this.projectConfiguration.forceDir = true;
      }
    } catch (err) {
      this.logger.error(err.message);
      throw new Error("Unable to load");
    }
  }

  private async createPackageJson() {
    let project = this.projectConfiguration;
    this.logger.debug("try and create package json");
    if (!project) return false;
    let pkg = BuildPackageJson(project);
    this.logger.debug("package.json ready for fs is the package");
    try {
      let pkgJson = JSON.stringify(pkg);
      await CreateProjectDirectory(project);
      await SavePackageJson(project, pkgJson);
      return true;
    } catch (err) {
      //this.logger.error('*******',err);
      throw err;
    }
  }

  private async prep() {
    try {
      await this.load();
      let wroteJson = await this.createPackageJson();
    } catch (err) {
      //this.logger.error(err.message);
      throw err;
    }
  }

  /**
   * This function creates the project, creates the package.json, inits git, pushes to remote if there is a remote url, installs dependencies
   */
  async compose() {
    try {
      this.logger.debug(`composing new project - ${this.configurationDirectory} ${this.configurationFile}`);
      await this.prep();
      await this.createProjectFolders();
      this.logger.debug("changing dir to project dir");
      process.chdir(this.projectConfiguration.projectDirectory);
      let deps = this.projectConfiguration?.dependencies?.node;
      let packageManager = this.packageManager;

      if (!packageManager && deps) packageManager = deps.packageManager;
      await initializeGit();
      await addAllGit();
      await commitGit();
      let remoteURL = this.projectConfiguration?.repository?.["url"] as string;
      if (remoteURL) {
        await addRemoteGit(remoteURL);
        await pushGit();
      }
      if (packageManager == "npm" && deps) {
        this.logger.debug("running npm dependency installer");
        await npmDependencyParser(deps);
      } else if (packageManager == "yarn" && deps) {
        await yarnDependencyParser(deps);
      } else {
        this.logger.error(`${packageManager ?? "<none>"} is not supported`);
      }
      this.logger.debug("changing back to starting dir");
      process.chdir(this.presentWorkingDirectory);
      this.logger.info(`code ${this.projectConfiguration.projectDirectory}`);
    } catch (err) {
      if (err.message != "Directory already exists") {
        try {
          this.logger.info("teardown app");
          await this.teardownApp();
        } catch (teardownErr) {
          this.logger.error(teardownErr);
        }
        this.logger.error(err);
      } else {
        this.logger.error(`${this.projectConfiguration?.projectDirectory} already exists`);
      }
    }
  }

  private async teardownApp() {
    if (this.projectConfiguration) {
      try {
        await teardown(this.projectConfiguration);
      } catch (err) {
        throw new Error("Teardown Error");
      }
    } else {
      this.logger.warn("No project configuration");
    }
  }
}

export default Project;
