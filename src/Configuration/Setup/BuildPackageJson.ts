import ProjectConfiguration from "../ProjectConfiguration";

type npmPackage = {
  author: string;
  version: string;
  name: string;
  main: string;
  scripts: object;
  license: "ISC" | "MIT" | string;
  description: string;
  keywords: string[];
  dependencies: object;
  devDependencies: object;
  repository: object;
};

/**
 * 
 * @param config The project configuration object used to populate the pkg info.
 * @returns an object representing the NPM package.json
 */
const BuildPackageJson = (config: ProjectConfiguration): npmPackage => {
  let pkg: npmPackage = {
    author: config.author ?? process.env.USER ?? "",
    version: config.version,
    name: config.name,
    main: config.entrypoint ?? "",
    scripts: config.scripts ?? {},
    license: config.license ?? "MIT",
    description: config.description ?? "",
    keywords: config.keywords ?? [],
    dependencies: {},
    devDependencies: {},
    repository: config.repository ?? {}
  };
  return pkg;
};

export default BuildPackageJson;
