const bundleManager = require("bundle-manager");

cc.Class({
  extends: cc.Component,

  editor: {
    menu: "Bundle Management/Remote Sprite Frame Loader",
    requireComponent: cc.Sprite,
  },

  properties: {
    bundleId: "",
    spriteFramePath: "",
  },

  onLoad() {
    const bundleInfo = bundleManager.getBundleInfo(this.bundleId);

    if (bundleInfo) {
      const { url, name } = bundleInfo;
      const onSpriteFrameLoaded = (error, spriteFrame) => {
        if (error) {
          cc.error(error);
        } else {
          this._updateNewSpriteFrame(spriteFrame);
        }
      };

      bundleManager.loadRemoteAsset(
        url,
        name,
        this.spriteFramePath,
        cc.SpriteFrame,
        onSpriteFrameLoaded
      );
    }
  },

  _updateNewSpriteFrame(spriteFrame) {
    const sprite = this.node.getComponent(cc.Sprite);

    if (sprite && spriteFrame) {
      sprite.spriteFrame = spriteFrame;
    }
  },
});
