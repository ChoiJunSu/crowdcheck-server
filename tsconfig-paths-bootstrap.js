const path = require('path');
const tsConfig = require('./tsconfig.paths.json');
const tsConfigPaths = require('tsconfig-paths');
const baseUrl = tsConfig.compilerOptions.baseUrl;
const outDir = tsConfig.compilerOptions.outDir;

const paths = {};
Object.keys(tsConfig.compilerOptions.paths).forEach(
  (key) =>
    (paths[key] = [
      tsConfig.compilerOptions.paths[key][0].replace('./src', './'),
    ])
);

const explicitParams = {
  baseUrl: path.resolve(baseUrl, outDir),
  paths,
};

const cleanup = tsConfigPaths.register(explicitParams);

// clean-up when path registration is no longer needed
// cleanup();
