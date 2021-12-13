let component;

global.cc = {
  Class: (options) => {
    component = options;
  },
  Component: jest.fn().mockImplementation(() => ({ EventHandler: jest.fn() })),
  error: jest.fn(),
  SpriteFrame: "SpriteFrame",
};

jest.mock("bundle-manager");

require("../../src/runtime-scripts/remote-sprite-frame-loader");
const bundleManager = require("bundle-manager");

describe("remote-sprite-frame-loader", () => {
  it("the component should be loaded", () => {
    expect(component).toBeDefined();
  });

  describe("_updateNewSpriteFrame", () => {
    it("should assign new sprite frame to sprite component", () => {
      const sprite = { spriteFrame: "" };
      const context = {
        node: {
          getComponent: jest.fn().mockReturnValue(sprite),
        },
      };

      component._updateNewSpriteFrame.call(context, "sprite-frame");

      expect(context.node.getComponent).toBeCalled();
      expect(sprite.spriteFrame).toBe("sprite-frame");
    });

    it("should do nothing when sprite is undefined", () => {
      const context = {
        node: {
          getComponent: jest.fn().mockReturnValue(undefined),
        },
      };

      component._updateNewSpriteFrame.call(context, "sprite-frame");

      expect(context.node.getComponent).toBeCalled();
    });

    it("should do nothing when argument is undefined", () => {
      const sprite = { spriteFrame: "default-frame" };
      const context = {
        node: {
          getComponent: jest.fn().mockReturnValue(sprite),
        },
      };

      component._updateNewSpriteFrame.call(context);

      expect(context.node.getComponent).toBeCalled();
      expect(sprite.spriteFrame).toBe("default-frame");
    });
  });

  describe("onLoad", () => {
    it("should do nothing when can't find the bundle info", () => {
      component.onLoad();

      expect(bundleManager.getBundleInfo).toBeCalled();
    });

    it("should call cc.error method when load remote asset failure", () => {
      const context = {
        _updateNewSpriteFrame: jest.fn(),
        spriteFramePath: "path",
      };

      bundleManager.getBundleInfo.mockReturnValueOnce({
        url: "url",
        name: "name",
      });

      bundleManager.loadRemoteAsset.mockImplementation(
        (url, name, path, assetType, callback) => {
          expect(url).toBe("url");
          expect(name).toBe("name");
          expect(path).toBe("path");
          expect(assetType).toBe(cc.SpriteFrame);

          callback(true);
        }
      );

      component.onLoad.call(context);

      expect(bundleManager.getBundleInfo).toBeCalled();
      expect(cc.error).toBeCalled();
      expect(context._updateNewSpriteFrame).toBeCalledTimes(0);
    });

    it("should load remote asset when called", () => {
      const context = {
        _updateNewSpriteFrame: jest.fn(),
        spriteFramePath: "path",
      };

      bundleManager.getBundleInfo.mockReturnValueOnce({
        url: "url",
        name: "name",
      });

      bundleManager.loadRemoteAsset.mockImplementation(
        (url, name, path, assetType, callback) => {
          expect(url).toBe("url");
          expect(name).toBe("name");
          expect(path).toBe("path");
          expect(assetType).toBe(cc.SpriteFrame);

          callback(null, true);
        }
      );

      component.onLoad.call(context);

      expect(bundleManager.getBundleInfo).toBeCalled();
      expect(context._updateNewSpriteFrame).toBeCalled();
    });
  });
});
