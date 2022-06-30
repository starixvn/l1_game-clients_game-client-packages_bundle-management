const fs = require("fs");
const path = require("path");
const packageJson = require("../package.json");
const { copyFolderSync } = require("./fs-extra");

const sourceDirectory = path.join(__dirname, "../lib");
const isDebugMode = process.argv.includes("--debug");

const needToInstallExtension = isDebugMode || sourceDirectory.endsWith(path.join("node_modules", packageJson.name, "lib"));

const destinationDirectory = isDebugMode
  ? path.join(__dirname, "../example/packages", packageJson.name)
  : path.join(__dirname, "../../../packages", packageJson.name);

function createPackageJson() {
  const excludeFields = ["scripts", "husky", "commitlint", "jestSonar", "devDependencies", "release", "files"];
  const newPackageJson = Object.assign({}, packageJson, ...excludeFields.map((field) => ({ [field]: undefined })));

  newPackageJson.main = "main.js";

  return newPackageJson;
}

if (needToInstallExtension) {
  if (fs.existsSync(destinationDirectory)) {
    fs.rmdirSync(destinationDirectory, { recursive: true });
  }

  fs.mkdirSync(destinationDirectory, { recursive: true });

  fs.writeFileSync(path.join(destinationDirectory, "package.json"), JSON.stringify(createPackageJson(), null, 2));

  copyFolderSync(sourceDirectory, destinationDirectory);
}
