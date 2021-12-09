jest.mock("fs");
jest.mock("../src/utils/package");

const path = require("path");
const main = require("../src/main");
const fs = require("fs");

describe("main", () => {
  describe("load", () => {
    it("when register build-finished event, the register method should be called", () => {
      const registerFunction = jest.fn((event, callback) => {
        expect(event).toBe("build-finished");
        expect(callback).toBeDefined();
      });

      global.Editor = {
        Builder: { on: registerFunction },
      };

      main.load();

      expect(registerFunction).toBeCalled();
    });

    describe.each([
      [
        {
          main: "main",
          package: "package",
        },
      ],
      [],
    ])(
      "when trigger build-finished event, the registered method should be called",
      (versions) => {
        const executeEvent = jest.fn((event, callback) => {
          expect(event).toBe("build-finished");
          expect(callback).toBeDefined();

          callback(
            { dest: "", settings: { bundleVers: versions } },
            () => ({})
          );
        });

        fs.writeFileSync.mockImplementation((destination, data) => {
          const expectedDestination = path.join("assets/versions.json");

          expect(destination).toBe(expectedDestination);
          expect(data).toBe(JSON.stringify(versions || {}));
        });

        global.Editor = {
          Builder: { on: executeEvent },
        };

        main.load();

        expect(executeEvent).toBeCalled();
        expect(fs.writeFileSync).toBeCalled();
      }
    );
  });

  describe("unload", () => {
    it("when unregister build-finished event, the unregister method should be called", () => {
      const unregisterFunction = jest.fn((event, callback) => {
        expect(event).toBe("build-finished");
        expect(callback).toBeDefined();
      });

      global.Editor = {
        Builder: { off: unregisterFunction },
      };

      main.unload();

      expect(unregisterFunction).toBeCalled();
    });
  });
});
