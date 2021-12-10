const bundleManager = require("../../src/runtime-scripts/bundle-manager");

const xhrMockObject = {
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
};

window = {};
global.XMLHttpRequest = jest.fn().mockImplementation(() => xhrMockObject);
global.cc = {
  assetManager: {
    loadBundle: jest.fn(),
  },
};

describe("bundle-manager", () => {
  describe("init", () => {
    it("when the global variable is not defined should do nothing", () => {
      window.bundleInfos = undefined;

      expect(() => bundleManager.init()).not.toThrowError();
    });

    it("when the global variable is defined should load all defined bundles", () => {
      window.bundleInfos = {
        id: {
          name: "name",
          url: "url",
        },
      };

      xhrMockObject.send.mockImplementationOnce(() => {
        xhrMockObject.readyState = 4;
        xhrMockObject.status = 200;
        xhrMockObject.responseText = JSON.stringify({
          name: "name",
          internal: "internal",
        });

        xhrMockObject.onreadystatechange();
      });

      bundleManager.init();

      expect(xhrMockObject.open).toBeCalled();
      expect(xhrMockObject.send).toBeCalled();
      expect(cc.assetManager.loadBundle).toBeCalled();
    });

    it("when sending api request failure should load bundle with the old version", () => {
      window.bundleInfos = {
        id: {
          name: "name",
          url: "url",
        },
      };

      xhrMockObject.send.mockImplementationOnce(() => {
        xhrMockObject.readyState = 4;
        xhrMockObject.status = 400;

        xhrMockObject.onreadystatechange();
      });

      bundleManager.init();

      expect(xhrMockObject.open).toBeCalled();
      expect(xhrMockObject.send).toBeCalled();
      expect(cc.assetManager.loadBundle).toBeCalled();
    });

    it("when sending api request error should load bundle with the old version", () => {
      window.bundleInfos = {
        id: {
          name: "name",
          url: "url",
        },
      };

      xhrMockObject.send.mockImplementationOnce(() => {
        xhrMockObject.onerror();
      });

      bundleManager.init();

      expect(xhrMockObject.open).toBeCalled();
      expect(xhrMockObject.send).toBeCalled();
      expect(cc.assetManager.loadBundle).toBeCalled();
    });
  });

  describe("getBundleInfo", () => {
    it("when the global variable is not defined should return undefined value", () => {
      window.bundleInfos = undefined;

      const info = bundleManager.getBundleInfo("id");

      expect(info).toBeUndefined();
    });

    it("when getting the defined bundle info variable should return the bundle info", () => {
      window.bundleInfos = {
        id: {
          name: "name",
          url: "url",
        },
      };

      const info = bundleManager.getBundleInfo("id");

      expect(info).toStrictEqual({ name: "name", url: "url" });
    });

    it("when getting bundle info with a not defined id should return the undefined value", () => {
      window.bundleInfos = {
        id: {
          name: "name",
          url: "url",
        },
      };

      const info = bundleManager.getBundleInfo("other-id");

      expect(info).toBeUndefined();
    });
  });

  describe("loadRemoteAsset", () => {
    beforeEach(() => {
      window.bundleInfos = {
        id: {
          name: "name",
          url: "url",
        },
      };

      xhrMockObject.send.mockImplementationOnce(() => {
        xhrMockObject.readyState = 4;
        xhrMockObject.status = 200;
        xhrMockObject.responseText = JSON.stringify({
          name: "name",
          internal: "internal",
        });

        xhrMockObject.onreadystatechange();
      });
    });

    it("when loading the bundle failure should call the callback with error parameter", () => {
      cc.assetManager.loadBundle.mockImplementationOnce(
        (url, options, callback) => {
          callback(new Error());
        }
      );

      bundleManager.loadRemoteAsset("url", "name", ".", "Prefab", (error) => {
        expect(error).toBeDefined();
      });

      expect(xhrMockObject.open).toBeCalled();
      expect(xhrMockObject.send).toBeCalled();
      expect(cc.assetManager.loadBundle).toBeCalled();
    });

    it("when the bundle is null should do nothing", () => {
      cc.assetManager.loadBundle.mockImplementationOnce(
        (url, options, callback) => {
          callback(null, null);
        }
      );

      bundleManager.loadRemoteAsset("url", "name", ".", "Prefab", (error) => {
        expect(error).toBeDefined();
      });

      expect(xhrMockObject.open).toBeCalled();
      expect(xhrMockObject.send).toBeCalled();
      expect(cc.assetManager.loadBundle).toBeCalled();
    });

    it("when the bundle is defined should load the asset from it", () => {
      const bundle = {
        load: jest.fn(),
      };

      cc.assetManager.loadBundle.mockImplementationOnce(
        (url, options, callback) => {
          callback(null, bundle);
        }
      );

      bundleManager.loadRemoteAsset("url", "name", ".", "Prefab", (error) => {
        expect(error).toBeDefined();
      });

      expect(xhrMockObject.open).toBeCalled();
      expect(xhrMockObject.send).toBeCalled();
      expect(cc.assetManager.loadBundle).toBeCalled();
      expect(bundle.load).toBeCalled();
    });
  });
});
