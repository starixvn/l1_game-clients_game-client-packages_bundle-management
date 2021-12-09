const path = require("path");
const fs = require("fs");
const packageUtils = require("./utils/package");
const buildFinishedEvent = "build-finished";

function onBuildFinished(options, callback) {
  const destination = path.join(options.dest, "assets/versions.json");
  const versions = options.settings.bundleVers;

  fs.writeFileSync(destination, JSON.stringify(versions || {}));

  callback();
}

module.exports = {
  load() {
    Editor.Builder.on(buildFinishedEvent, onBuildFinished);
    packageUtils.mount();
  },

  unload() {
    Editor.Builder.off(buildFinishedEvent, onBuildFinished);
  },
};
