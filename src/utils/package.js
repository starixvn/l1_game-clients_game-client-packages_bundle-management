"use strict";

const fs = require("fs");
const path = require("path");

const mount = function () {
  const projectPath = Editor.projectPath || Editor.Project.path;
  const bundleInfoPath = "assets/resources/bundle-information.js";
  const filePath = path.join(projectPath, bundleInfoPath);
  const templatePath = path.join(__dirname, "template.txt");

  if (!fs.existsSync(filePath)) {
    fs.copyFileSync(templatePath, filePath);
  }
};

exports.mount = mount;
