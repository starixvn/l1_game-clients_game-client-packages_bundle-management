const { BundleManager } = require("bundle-manager");

cc.Class({
  extends: cc.Component,

  editor: {
    menu: "Bundle Management/Remote Sprite Frame Loader",
    requireComponent: cc.Sprite,
  },

  properties: {
    bundleId: "",
    spriteFramePath: "",
    onProgressHandlers: {
      default: [],
      type: cc.Component.EventHandler,
    },
  },

  onLoad() {
    return BundleManager.getInstance()
      .loadAsset({
        bundleId: this.bundleId,
        path: this.spriteFramePath,
        type: cc.SpriteFrame,
        onProgress: (finished, total) => this._onProgress(finished, total),
      })
      .then((spriteFrame) => this._updateNewSpriteFrame(spriteFrame))
      .catch((error) => {
        cc.error(error);
      });
  },

  _updateNewSpriteFrame(spriteFrame) {
    const sprite = this.node.getComponent(cc.Sprite);

    if (sprite && spriteFrame) {
      sprite.spriteFrame = spriteFrame;
    }
  },

  _onProgress(finished, total) {
    this.onProgressHandlers.forEach((event) => event.emit([finished, total]));
  },
});
