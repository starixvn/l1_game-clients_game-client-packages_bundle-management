const fse = require("fs-extra");
const { join } = require("path");
const packageJson = require("./package.json");
const sourcePath = join(__dirname, "src");
const destinationPath = join(__dirname, "dist", packageJson.name);
const excludeFields = [
  "scripts",
  "husky",
  "commitlint",
  "jestSonar",
  "devDependencies",
];
const destinationPackageJson = Object.assign(
  {},
  packageJson,
  ...excludeFields.map((field) => ({ [field]: undefined }))
);

fse.copySync(sourcePath, join(destinationPath, "src"), { overwrite: true });
fse.writeFileSync(
  join(destinationPath, "package.json"),
  JSON.stringify(destinationPackageJson, null, 2)
);
