# Project Builder

An easy way to build out your projects from a configuration file.

## Install

```bin/sh
git clone https://github.com/internetcalifornia/project-generator.git
npm install
npm run package
./bin/project-builder -f ./example.yaml
```

## Config Files

Configuration files have the following schema:

- Name: This is the name of your project and the name of the source project folder (required)
- Author: Your name (required)
- Version: version of your project
- allowNetworkFiles: true/false - allows http(s) requests to download files.
- Repository:
  - type: "git"
  - url: the clone address or project repository page
- description: short note about what the project will do/function
- scripts: what scripts to include
- license: what license is being used
- path: where the project's folder should be created, if omitted will be in the \$PWD
- keywords: keywords for the package json
- files: what files to include in your project, see files schema for details
- dependencies:
  - node: currently only supports node pacakges
    - packageManager: "npm" | "yarn"
    - prod | production: list of prod level dependencies to install
    - dev | development: list of dev level dependencies to install

### File Schema

Files have 4 schemas supported

- String, this will be treated as a file name and create a blank file of that name
- Directory, a mapping with a name key (string) and content key (File Schema)
- Copy, a mapping with a name key (string) and copy key (string) and will copy the contents from local file system to the name provided as the name key.
- CopyResource, a mapping with a name key (string) and from key (string) http(s) resource to download. Need flag either on application launch or in config file.

### Configuration File Formats

Currently supports both YAML and JSON file formats

### Advanced Options

The application supports the follow options:

- --file [filename|path] | -f [filename|path]: The config file to load, can be a path or just a file name, if just a file name is given also use the --directory argument to ensure you get the correct configuration file
- --directory [path] | -d [path]: Used in combonation with --file to find the source of the file.
- --out-dir [path] | -o [path]: This option will override the path parameter in your config file
- --yaml | --yml: Force config file to parse as yaml
- --json: Force config file to parse as json
- --npm: Force to use NPM as package manager
- --yarn: Force to use Yarn as package manager (not supported yet TBD)
- --log-level: output logging default: "error"
