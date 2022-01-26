const { BundleManager } = require("bundle-management");

cc.Class({
  extends: cc.Component,

  editor: {
    menu: "Bundle Management/Remote Prefab Loader",
  },

  properties: {
    bundleId: "",
    prefabPath: "",
    initializationEventHandlers: {
      default: [],
      type: cc.Component.EventHandler,
    },
    onProgressHandlers: {
      default: [],
      type: cc.Component.EventHandler,
    },
  },

  onLoad() {
    return BundleManager.getInstance()
      .loadAsset({
        bundleId: this.bundleId,
        path: this.prefabPath,
        type: cc.Prefab,
        onProgress: (finished, total) => this._onProgress(finished, total),
      })
      .then((prefab) => {
        const node = cc.instantiate(prefab);

        this._onInitialize(node);
      })
      .catch((error) => {
        cc.error(error);
      });
  },

  _onInitialize(node) {
    this.node.addChild(node);

    this.initializationEventHandlers.forEach((event) => event.emit([node]));
  },

  _onProgress(finished, total) {
    this.onProgressHandlers.forEach((event) => event.emit([finished, total]));
  },
});
