import "mocha"
import npmDependencyParser, {npmDependencies} from "../src/Configuration/Setup/DependencyParser";



var node: npmDependencies = {
    production: ["mssql", "react", "mssql", "@babel/cli", "typescript", "express"],
    development: ["@types/mssql", "mssql", "@babel/cli", "@types/express"]
}

var example = {
    node
}

// describe('Tests Dependency Parsing', () => {
//     it('Testing Parsing', () => {
//         return npmDependencyParser(node)
//     })
// })

