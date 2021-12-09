jest.mock("fs");

const fs = require("fs");
const path = require("path");
const packageUtils = require("../../src/utils/package");

describe("package", () => {
  describe("mount", () => {
    it("the file is not existed", () => {
      global.Editor = { projectPath: "." };
      const expectedPath = path.join("assets/resources/bundle-information.js");

      fs.existsSync.mockImplementation((filePath) => {
        expect(expectedPath).toBe(filePath);

        return false;
      });

      packageUtils.mount();

      expect(fs.existsSync).toBeCalled();
    });

    it("the file is existed", () => {
      global.Editor = { Project: { path: "." } };
      const expectedPath = path.join("assets/resources/bundle-information.js");

      fs.existsSync.mockImplementation((filePath) => {
        expect(expectedPath).toBe(filePath);

        return true;
      });

      fs.copyFileSync.mockImplementation((templatePath, filePath) => {
        expect(expectedPath).toBe(filePath);
      });

      packageUtils.mount();

      expect(fs.existsSync).toBeCalled();
      expect(fs.copyFileSync).toBeCalled();
    });
  });
});
