const bundleManager = require("bundle-manager");

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
  },

  onLoad() {
    const bundleInfo = bundleManager.getBundleInfo(this.bundleId);

    if (bundleInfo) {
      const { url, name } = bundleInfo;
      const onPrefabLoaded = (error, prefab) => {
        if (error) {
          cc.error(error);
        } else {
          const node = cc.instantiate(prefab);

          this._onInitialize(node);
        }
      };

      bundleManager.loadRemoteAsset(
        url,
        name,
        this.prefabPath,
        cc.Prefab,
        onPrefabLoaded,
        bundleInfo.useMd5Cache
      );
    }
  },

  _onInitialize(node) {
    this.node.addChild(node);

    this.initializationEventHandlers.forEach((event) => event.emit([node]));
  },
});
