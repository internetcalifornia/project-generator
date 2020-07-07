import child_process from "child_process";
import { logger } from "../../app";

export type npmDependencies = {
  production?: string[];
  development?: string[];
  prod?: string[];
  dev?: string[];
};

const npmDependencyParser = async (config: npmDependencies) => {
  let prodDep: string[] = [];
  let devDep: string[] = [];
  if (config.prod) {
    prodDep = prodDep.concat(config.prod);
  }
  if (config.production) {
    prodDep = prodDep.concat(config.production);
  }
  if (config.dev) {
    devDep = devDep.concat(config.dev);
  }
  if (config.development) {
    devDep = devDep.concat(config.development);
  }

  //console.log(prodDep);
  //console.log(devDep);
  devDep = devDep.filter((value) => !prodDep.includes(value));

  prodDep = [...new Set(prodDep)];
  devDep = [...new Set(devDep)];

  logger.debug({ prodDep, devDep });
  try {
    if (prodDep.length) await npmInstall(prodDep);
    if (devDep.length) await npmInstall(devDep, true);
  } catch (err) {
    logger.error(err);
  }
};

const npmInstall = (deps: string[], dev?: boolean): Promise<void> => {
  let cmd = deps.join(" ");
  if (dev) cmd = cmd.concat(" -D");
  return new Promise((resolve, reject) => {
    child_process.exec(`npm i ${cmd}`, (err, stout, stderr) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
      return;
    });
  });
};

export default npmDependencyParser;
