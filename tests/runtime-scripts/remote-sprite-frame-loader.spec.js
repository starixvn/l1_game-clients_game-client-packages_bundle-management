let component;

global.cc = {
  Class: (options) => {
    component = options;
  },
  Component: jest.fn().mockImplementation(() => ({ EventHandler: jest.fn() })),
  error: jest.fn(),
  SpriteFrame: "SpriteFrame",
};

const bundleManager = {
  loadAsset: jest.fn(),
};

jest.mock("bundle-management", () => ({
  BundleManager: {
    getInstance: () => bundleManager,
  },
}));
require("../../src/runtime-scripts/remote-sprite-frame-loader");

describe("remote-sprite-frame-loader", () => {
  beforeEach(() => {
    Object.defineProperty(global, "CC_EDITOR", { value: false, writable: true });
  });

  it("the component should be loaded", () => {
    expect(component).toBeDefined();
  });

  describe("_updateNewSpriteFrame", () => {
    it("should assign new sprite frame to sprite component", () => {
      // Arrange
      const sprite = { spriteFrame: "" };
      const context = {
        node: {
          getComponent: jest.fn().mockReturnValue(sprite),
        },
      };

      // Act
      component._updateNewSpriteFrame.call(context, "sprite-frame");

      // Assert
      expect(context.node.getComponent).toBeCalled();
      expect(sprite.spriteFrame).toBe("sprite-frame");
    });

    it("should do nothing when sprite is undefined", () => {
      // Arrange
      const context = {
        node: {
          getComponent: jest.fn().mockReturnValue(undefined),
        },
      };

      // Act
      component._updateNewSpriteFrame.call(context, "sprite-frame");

      // Assert
      expect(context.node.getComponent).toBeCalled();
    });

    it("should do nothing when argument is undefined", () => {
      // Arrange
      const sprite = { spriteFrame: "default-frame" };
      const context = {
        node: {
          getComponent: jest.fn().mockReturnValue(sprite),
        },
      };

      // Act
      component._updateNewSpriteFrame.call(context);

      // Assert
      expect(context.node.getComponent).toBeCalled();
      expect(sprite.spriteFrame).toBe("default-frame");
    });
  });

  describe("_onProgress", () => {
    it("should trigger all event handlers when called", () => {
      // Arrange
      const context = {
        onProgressHandlers: [{ emit: jest.fn() }],
      };

      // Act
      component._onProgress.call(context);

      // Assert
      context.onProgressHandlers.forEach((handler) => expect(handler.emit).toBeCalled());
    });
  });

  describe("onLoad", () => {
    beforeEach(() => {
      bundleManager.loadAsset.mockReset();
    });

    it("should call cc.error method when load remote asset failure", async () => {
      // Arrange
      const context = {
        _updateNewSpriteFrame: jest.fn(),
        spriteFramePath: "path",
      };

      bundleManager.loadAsset.mockRejectedValueOnce({});

      // Act
      await component.onLoad.call(context);

      // Assert
      expect(cc.error).toBeCalled();
      expect(context._updateNewSpriteFrame).toBeCalledTimes(0);
    });

    it("should load remote asset when called", async () => {
      // Arrange
      const context = {
        _updateNewSpriteFrame: jest.fn(),
        spriteFramePath: "path",
        _onProgress: jest.fn(),
      };

      bundleManager.loadAsset.mockImplementationOnce((options) => {
        options.onProgress(0, 0);

        return Promise.resolve({});
      });

      // Act
      await component.onLoad.call(context);

      // Assert
      expect(context._updateNewSpriteFrame).toBeCalled();
    });

    describe("when CC_EDITOR is true", () => {
      it("should do nothing", async () => {
        // Arrange
        Object.defineProperty(global, "CC_EDITOR", { value: true, writable: true });
        const context = {
          _updateNewSpriteFrame: jest.fn(),
          spriteFramePath: "path",
          _onProgress: jest.fn(),
        };

        bundleManager.loadAsset.mockImplementationOnce((options) => {
          options.onProgress(0, 0);

          return Promise.resolve({});
        });

        // Act
        await component.onLoad.call(context);

        // Assert
        expect(bundleManager.loadAsset).toBeCalledTimes(0);
      });
    });
  });
});
