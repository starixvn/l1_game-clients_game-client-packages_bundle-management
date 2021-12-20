let component;

global.cc = {
  Class: (options) => {
    component = options;
  },
  Component: jest.fn().mockImplementation(() => ({ EventHandler: jest.fn() })),
  instantiate: jest.fn(),
  error: jest.fn(),
  Prefab: "prefab",
};

jest.mock("bundle-manager");

require("../../src/runtime-scripts/remote-prefab-loader");
const bundleManager = require("bundle-manager");

describe("remote-prefab-loader", () => {
  it("the component should be loaded", () => {
    expect(component).toBeDefined();
  });

  describe("_onInitialize", () => {
    it("should add a new node as a child when the event handler array is empty", () => {
      const context = {
        node: {
          addChild: jest.fn(),
        },
        initializationEventHandlers: [],
      };

      component._onInitialize.call(context);

      expect(context.node.addChild).toBeCalled();
    });

    it("should trigger all event handlers when the event handler array has data", () => {
      const context = {
        node: {
          addChild: jest.fn(),
        },
        initializationEventHandlers: [{ emit: jest.fn() }],
      };

      component._onInitialize.call(context);

      expect(context.node.addChild).toBeCalled();

      context.initializationEventHandlers.forEach((handler) =>
        expect(handler.emit).toBeCalled()
      );
    });
  });

  describe("onLoad", () => {
    it("should do nothing when can't find the bundle info", () => {
      component.onLoad();

      expect(bundleManager.getBundleInfo).toBeCalled();
    });

    it("should call cc.error method when load remote asset failure", () => {
      const context = {
        _onInitialize: jest.fn(),
        prefabPath: "path",
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
          expect(assetType).toBe(cc.Prefab);

          callback(true);
        }
      );

      component.onLoad.call(context);

      expect(bundleManager.getBundleInfo).toBeCalled();
      expect(cc.error).toBeCalled();
    });

    it("should load remote asset when called", () => {
      const context = {
        _onInitialize: jest.fn(),
        prefabPath: "path",
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
          expect(assetType).toBe(cc.Prefab);

          callback(null, true);
        }
      );

      component.onLoad.call(context);

      expect(bundleManager.getBundleInfo).toBeCalled();
      expect(cc.instantiate).toBeCalled();
      expect(context._onInitialize).toBeCalled();
    });
  });
});
