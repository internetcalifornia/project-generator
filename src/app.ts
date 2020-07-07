import Project from "./Configuration/Project";

const project = new Project(process.argv);
export let logger = project.logger;
project.compose();
