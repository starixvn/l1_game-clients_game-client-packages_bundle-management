var BundleManager = require("bundle-manager").BundleManager;
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
    onLoad: function () {
        var _this = this;
        BundleManager.getInstance()
            .loadAsset({
            bundleId: this.bundleId,
            path: this.spriteFramePath,
            type: cc.SpriteFrame,
            onProgress: function (finished, total) { return _this._onProgress(finished, total); },
        })
            .then(function (spriteFrame) { return _this._updateNewSpriteFrame(spriteFrame); })
            .catch(function (error) {
            cc.error(error);
        });
    },
    _updateNewSpriteFrame: function (spriteFrame) {
        var sprite = this.node.getComponent(cc.Sprite);
        if (sprite && spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        }
    },
    _onProgress: function (finished, total) {
        this.onProgressHandlers.forEach(function (event) { return event.emit([finished, total]); });
    },
});
