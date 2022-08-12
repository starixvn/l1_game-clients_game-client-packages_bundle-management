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

const bundleManager = {
  loadAsset: jest.fn(),
};

jest.mock("bundle-management", () => ({
  BundleManager: {
    getInstance: () => bundleManager,
  },
}));

require("../../src/runtime-scripts/remote-prefab-loader");

describe("remote-prefab-loader", () => {
  beforeEach(() => {
    Object.defineProperty(global, "CC_EDITOR", { value: false, writable: true });
  });

  it("the component should be loaded", () => {
    // Assert
    expect(component).toBeDefined();
  });

  describe("_onInitialize", () => {
    it("should add a new node as a child when the event handler array is empty", () => {
      // Arrange
      const context = {
        node: {
          addChild: jest.fn(),
        },
        initializationEventHandlers: [],
      };

      // Act
      component._onInitialize.call(context);

      // Assert
      expect(context.node.addChild).toBeCalled();
    });

    it("should trigger all event handlers when the event handler array has data", () => {
      // Arrange
      const context = {
        node: {
          addChild: jest.fn(),
        },
        initializationEventHandlers: [{ emit: jest.fn() }],
      };

      // Act
      component._onInitialize.call(context);

      // Assert
      expect(context.node.addChild).toBeCalled();
      context.initializationEventHandlers.forEach((handler) => expect(handler.emit).toBeCalled());
    });

    describe("when CC_EDITOR is true", () => {
      it("should do nothing", () => {
        // Arrange
        Object.defineProperty(global, "CC_EDITOR", { value: true, writable: true });
        const context = {
          node: {
            addChild: jest.fn(),
          },
          initializationEventHandlers: [],
        };

        // Act
        component._onInitialize.call(context);

        // Assert
        expect(context.node.addChild).toBeCalledTimes(0);
      });
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
      bundleManager.loadAsset.mockClear();
    });

    it("without call initialize method when load remote asset failure", async () => {
      // Arrange
      const context = {
        _onInitialize: jest.fn(),
        prefabPath: "path",
      };

      bundleManager.loadAsset.mockRejectedValueOnce({});

      // Act
      await component.onLoad.call(context);

      // Assert
      expect(context._onInitialize).toBeCalledTimes(0);
    });

    it("should load remote asset when called", async () => {
      // Arrange
      const context = {
        _onInitialize: jest.fn(),
        _onProgress: jest.fn(),
        prefabPath: "path",
      };

      bundleManager.loadAsset.mockImplementationOnce((options) => {
        options.onProgress(0, 0);

        return Promise.resolve({});
      });

      // Act
      await component.onLoad.call(context);

      // Assert
      expect(context._onInitialize).toBeCalled();
    });
  });
});
