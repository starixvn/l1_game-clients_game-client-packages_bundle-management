const main = require("../src/main");

describe("main", () => {
  describe("load", () => {
    it("register build-finished event", () => {
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
  });
});
