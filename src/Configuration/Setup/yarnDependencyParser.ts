import child_process from "child_process";

export type yarnDependencies = {
  production?: string[];
  development?: string[];
  prod?: string[];
  dev?: string[];
};

const yarnDependencyParser = async (config: yarnDependencies) => {
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

  console.log(prodDep, devDep);
  try {
    if (prodDep.length) await yarnInstall(prodDep);
    if (devDep.length) await yarnInstall(devDep, true);
  } catch (err) {
    console.log(err);
  }
};

const yarnInstall = (deps: string[], dev?: boolean): Promise<void> => {
  let cmd = deps.join(" ");
  if (dev) cmd = cmd.concat(" -D");
  return new Promise((resolve, reject) => {
    child_process.exec(`yarn add ${cmd}`, (err, stout, stderr) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
      return;
    });
  });
};

export default yarnDependencyParser;
