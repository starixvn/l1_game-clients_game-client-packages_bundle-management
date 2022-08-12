import { BundleManager } from "../../src/runtime-scripts/bundle-management";

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
const loadBundleMock = jest.fn();
Object.defineProperty(global, "cc", {
  value: {
    assetManager: {
      loadBundle: loadBundleMock,
    },
  },
});

describe("bundle-management", () => {
  beforeEach(() => {
    Object.defineProperty(global, "CC_EDITOR", { value: false, writable: true });
  });

  describe("constructor", () => {
    it("when not pass the listener should create an instance without listeners", () => {
      // Arrange
      (BundleManager["instance"] as unknown) = null;

      // Act
      const instance = BundleManager.getInstance({ listeners: undefined, adapters: {} });

      // Assert
      expect(instance["listeners"]).toHaveLength(0);
    });
  });

  describe("getBundleInfo", () => {
    it("when the global variable is not defined should throw an error", () => {
      // Arrange
      window.bundleManagement = {
        bundles: undefined,
      };

      // Act
      const getBundleInfo = () => bundleManager.getBundleInfo("id");

      // Assert
      expect(getBundleInfo).toThrow("Not found bundle 'id'.");
    });

    it("when getting the defined bundle info variable should return the bundle info", () => {
      // Arrange
      window.bundleManagement = {
        bundles: {
          id: {
            name: "name",
            url: "url",
            useMd5Cache: false,
          },
        },
      };

      // Act
      const info = bundleManager.getBundleInfo("id");

      // Assert
      expect(info).toStrictEqual({ name: "name", url: "url", useMd5Cache: false });
    });

    it("when getting bundle info with a not defined id should return the undefined value", () => {
      // Arrange
      window.bundleManagement = {
        bundles: {
          id: {
            name: "name",
            url: "url",
            useMd5Cache: true,
          },
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
      window.bundleManagement = {
        bundles: {
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
          "other-id1": {
            name: "name",
            url: "url",
            useMd5Cache: false,
            dependencies: ["other-id"],
          },
        },
      };

      assetManagerMock.loadBundle.mockReset();
      loadBundleMock.mockReset();
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

    describe("when the bundle has dependencies", () => {
      it("should load all dependencies", async () => {
        // Arrange
        assetManagerMock.loadBundle.mockImplementation((url, options, callback) => {
          callback(null, {});
        });

        // Act
        await bundleManager.loadBundle("other-id1");

        // Assert
        expect(assetManagerMock.loadBundle).toBeCalledTimes(2);
      });
    });

    describe("when CC_EDITOR is true", () => {
      beforeEach(() => {
        Object.defineProperty(global, "CC_EDITOR", { value: true, writable: true });
      });
      describe("when loadBundle without any error", () => {
        it("should load default bundle", async () => {
          // Arrange
          loadBundleMock.mockImplementation((name, type, callback) => {
            callback(false);
          });

          // Act
          await bundleManager.loadBundle("id");

          // Assert
          expect(loadBundleMock).toBeCalled();
        });
      });

      describe("when loadBundle error", () => {
        it("should throw an exception", () => {
          // Arrange
          loadBundleMock.mockImplementation((name, type, callback) => {
            callback("error");
          });

          // Act
          const call = () => bundleManager.loadBundle("id");

          // Assert
          expect(call()).rejects.toMatch("error");
        });
      });
    });
  });

  describe("loadAsset", () => {
    beforeEach(() => {
      window.bundleManagement = {
        bundles: {
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

    describe("when CC_EDITOR is true", () => {
      it("should using pathForDevMode property", async () => {
        // Arrange
        Object.defineProperty(global, "CC_EDITOR", { value: true, writable: true });
        loadBundleMock.mockImplementation((name, type, callback) => {
          callback(false, {
            load: jest.fn().mockImplementation((path, type, onProgress, onComplete) => {
              expect(path).toBe("dev");
              onComplete(null, {});
            }),
          });
        });

        const options = { type: "Prefab", bundleId: "id", path: "path", pathForDevMode: "dev" };

        // Act
        const asset = await bundleManager.loadAsset(options);

        // Assert
        expect(asset).toBeDefined();
      });
    });
  });
});
