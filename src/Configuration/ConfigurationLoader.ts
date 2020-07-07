import ProjectConfiguration, { ProjectConfig } from "./ProjectConfiguration";
import fs from "fs";
import YAML from "yaml";

class ConfigurationLoader {
  static async load(configPath: string, fileExt: "yaml" | "json"): Promise<ProjectConfiguration> {
    let rawConfig: string = await ConfigurationLoader.loadRawConfig(configPath);

    let config: ProjectConfig;
    switch (fileExt) {
      case "json":
        config = JSON.parse(rawConfig);
        break;
      case "yaml":
        config = YAML.parse(rawConfig);
        break;
    }
    return new ProjectConfiguration(config);
  }

  static async loadRawConfig(configPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(configPath, { encoding: "utf-8" }, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        if (!data) {
          reject(new Error("NODATA"));
          return;
        }
        resolve(data);
        return;
      });
    });
  }
}

export default ConfigurationLoader;
