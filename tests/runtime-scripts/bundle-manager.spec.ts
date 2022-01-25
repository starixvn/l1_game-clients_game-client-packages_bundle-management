import { BundleManager } from "../../src/runtime-scripts/bundle-manager";

const listenerMock = {
  onVersionChanged: jest.fn(),
};
const assetManagerMock = {
  loadBundle: jest.fn(),
};
const httpMock = {
  get: jest.fn().mockResolvedValue({ name: "version" }),
};
const options = {
  listeners: [listenerMock],
  adapters: {
    assetManager: () => assetManagerMock,
    http: () => httpMock,
  },
};
const bundleManager = BundleManager.getInstance(options);

describe("bundle-manager", () => {
  describe("constructor", () => {
    it("when not pass the listener should create an instance without listeners", () => {
      // Arrange
      BundleManager["instance"] = null;

      // Act
      const instance = BundleManager.getInstance({ listeners: null, adapters: {} });

      // Assert
      expect(instance["listeners"]).toHaveLength(0);
    });
  });

  describe("getBundleInfo", () => {
    it("when the global variable is not defined should throw an error", () => {
      // Arrange
      window.bundleInfos = undefined;

      // Act
      const getBundleInfo = () => bundleManager.getBundleInfo("id");

      // Assert
      expect(getBundleInfo).toThrow("Not found bundle 'id'.");
    });

    it("when getting the defined bundle info variable should return the bundle info", () => {
      // Arrange
      window.bundleInfos = {
        id: {
          name: "name",
          url: "url",
          useMd5Cache: false,
        },
      };

      // Act
      const info = bundleManager.getBundleInfo("id");

      // Assert
      expect(info).toStrictEqual({ name: "name", url: "url", useMd5Cache: false });
    });

    it("when getting bundle info with a not defined id should return the undefined value", () => {
      // Arrange
      window.bundleInfos = {
        id: {
          name: "name",
          url: "url",
          useMd5Cache: true,
        },
      };

      // Act
      const getBundleInfo = () => bundleManager.getBundleInfo("other-id");

      // Assert
      expect(getBundleInfo).toThrow("Not found bundle 'other-id'.");
    });
  });

  describe("loadBundle", () => {
    beforeEach(() => {
      window.bundleInfos = {
        id: {
          name: "name",
          url: "url",
          useMd5Cache: true,
        },
        "other-id": {
          name: "name",
          url: "url",
          useMd5Cache: false,
        },
      };

      assetManagerMock.loadBundle.mockReset();
    });

    it("when loading the bundle failure should throw an error", async () => {
      // Arrange
      assetManagerMock.loadBundle.mockImplementationOnce((url, options, callback) => {
        callback(new Error());
      });

      // Act
      const bundle = bundleManager.loadBundle("id");

      // Assert
      await expect(bundle).rejects.toThrowError();
    });

    it("when the bundle is null should return null value", async () => {
      // Arrange
      assetManagerMock.loadBundle.mockImplementationOnce((url, options, callback) => {
        callback(null, null);
      });

      // Act
      const bundle = await bundleManager.loadBundle("id");

      // Assert
      expect(bundle).toBeFalsy();
    });

    it("when the bundle is defined should return it", async () => {
      // Arrange
      assetManagerMock.loadBundle.mockImplementationOnce((url, options, callback) => {
        callback(null, {});
      });

      // Act
      const bundle = await bundleManager.loadBundle("other-id");

      // Assert
      expect(bundle).toBeDefined();
    });
  });

  describe("loadAsset", () => {
    beforeEach(() => {
      window.bundleInfos = {
        id: {
          name: "name",
          url: "url",
          useMd5Cache: true,
        },
        "other-id": {
          name: "name",
          url: "url",
          useMd5Cache: false,
        },
      };
    });

    test.each([
      [{ type: "Prefab", bundleId: "id", path: null }],
      [{ type: null, bundleId: "id", path: "path" }],
      [{ type: "Prefab", bundleId: null, path: "path" }],
    ])("when an options is null should throw an error", async (options) => {
      // Act
      const loadAsset = bundleManager.loadAsset(options);

      // Assert
      await expect(loadAsset).rejects.toThrowError();
    });

    it("when the bundle is loaded should load asset from bundle", async () => {
      // Arrange
      assetManagerMock.loadBundle.mockImplementationOnce((url, options, callback) => {
        callback(null, {
          load: jest.fn().mockImplementation((path, type, onProgress, onComplete) => {
            onComplete(null, {});
          }),
        });
      });

      const options = { type: "Prefab", bundleId: "id", path: "path" };

      // Act
      const asset = await bundleManager.loadAsset(options);

      // Assert
      expect(asset).toBeDefined();
    });

    it("when load asset from bundle error should throw an error", async () => {
      // Arrange
      assetManagerMock.loadBundle.mockImplementationOnce((url, options, callback) => {
        callback(null, {
          load: jest.fn().mockImplementation((path, type, onProgress, onComplete) => {
            onComplete(new Error());
          }),
        });
      });

      const options = { type: "Prefab", bundleId: "id", path: "path" };

      // Act
      const asset = bundleManager.loadAsset(options);

      // Assert
      await expect(asset).rejects.toThrowError();
    });
  });
});
