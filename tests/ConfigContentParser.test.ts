import "mocha";
import fs from "fs-extra";
import path from "path";
import { ConfigContent, ConfigContentParser } from "../src/Configuration/Setup/ConfigContentParser";
import { mkdir } from "fs";
import Project from "../src/Configuration/Project";

var example: ConfigContent = [
  // this variable serves as though it is the root, each item in the array can be an directory, or file (either from existing filesystem or just and empty file)
  {
    // this object is a directory because it only has 1 key and the name of the key is not a reserved word of file or from.
    name: "src",
    content: [
      {
        name: "routes",
        content: ["login.ts", "profile.ts"],
      },
      "app.ts",
      {
        name: "horses",
        content: ["horse1.txt", "horseDatabase.db", "horseConfig.json"],
      },
      {
        name: "secrets",
        content: [{ name: "database", content: ["password.txt", "username.txt"] }, "classified.env", "ssh_key"],
      },
    ],
  },
  {
    name: "tests",
    content: ["test1.test.ts", { name: "spec", content: ["special.js", "testing1.ts", { name: "hiddenfolder", content: ["this-is-deep.txt"] }] }],
  },
  ".nprmc", // example of file where we should just create the file with that name
  {
    name: ".babelrc", // the name of the file we should create
    copy: "~/Projects/project-builder/.babelrc", // the relative or absolute location of where data of the file is stored in the filesystem
  },
  {
    name: "build",
    copy: "~/Projects/project-builder/build",
    recursive: true, // if the copy is a directory it will recursively copy files
  },
  {
    name: "node_modules",
    copy: "~/Projects/project-builder/node_modules",
    isDirectory: true,
    recursive: true,
    depth: 4, // when recursive how many levels should the copy handle.
  },
  {
    name: "Junk",
    copy: "~/Projects/project-builder/.git/",
  },
  {
    name: "Spam",
    copy: "~/Projects/project-builder/.docker/",
  },
];

// ! place where temp files will go! This folder is deleted and recreated for tests. Check this path.
const configTestFilesPath = path.join(process.cwd(), "tests", "temp");
const verifiedconfigTestFilesPath = process.env.verifiedConfigTestFilesPath;
describe("Verifed config test files path", () => {
  it("Verfied config file path", (done) => {
    if (verifiedconfigTestFilesPath) done();
    else done(new Error("not verified"));
  });
});

describe("Configuration File Parsing", () => {
  // it("Previous Logic Array built in function", (done) => {
  //   let nextFn = ConfigContentParser(example, configTestFilesPath);
  //   while (nextFn.length) {
  //     let fn = nextFn.pop();
  //     fn();
  //   }
  //   done();
  // });
  it("Class Handling iteration", async () => {
    let project = new Project(["-f", "example.yaml", "-o", "~/Projects/project-builder/tests/temp"]);
    try {
      //console.log(project)
      await project.compose();
      //console.log(project.projectConfiguration)
      return;
      //await project.compose();
      
    } catch (err) {
      throw err;
    }
  }).timeout(90000)
}).beforeEach( async () => {
  if (!verifiedconfigTestFilesPath) {
    throw new Error("Not verified");
  }
  // ! Check the file path before executing tests!
  //console.log("removing test temp files", configTestFilesPath);
  try {
    await fs.remove(configTestFilesPath)
    await fs.mkdirp(configTestFilesPath);
  } catch (err) {
    throw err;
  }
});
