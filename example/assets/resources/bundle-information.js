"use strict";

if (!window.bundleManagement) window.bundleManagement = {};

window.bundleManagement.bundles = {
  local: {
    useMd5Cache: location.href.endsWith("/build/"),
    url: "assets",
    name: "remote-package",
    dependencies: ["local1"],
  },
  local1: {
    useMd5Cache: location.href.endsWith("/build/"),
    url: "assets",
    name: "remote-package",
  },
};
