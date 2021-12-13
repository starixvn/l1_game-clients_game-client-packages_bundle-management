jest.mock("fire-fs");

const fs = require("fire-fs");
const path = require("path");
const packageUtils = require("../../src/utils/package");

describe("package", () => {
  describe("mount", () => {
    beforeEach(() => {
      fs.existsSync.mockClear();
      fs.copyFileSync.mockClear();
      fs.ensureDirSync.mockClear();
    });

    it("should create a resource file when it is not existed", () => {
      global.Editor = { projectPath: "." };

      fs.existsSync
        .mockImplementationOnce((filePath) => {
          const expectedPath = path.join("assets/resources");

          expect(expectedPath).toBe(filePath);

          return false;
        })
        .mockImplementationOnce((filePath) => {
          const expectedPath = path.join(
            "assets/resources/bundle-information.js"
          );

          expect(expectedPath).toBe(filePath);

          return false;
        });

      fs.copyFileSync.mockImplementation((templatePath, filePath) => {
        const expectedPath = path.join(
          "assets/resources/bundle-information.js"
        );

        expect(expectedPath).toBe(filePath);
      });

      packageUtils.mount();

      expect(fs.existsSync).toBeCalledTimes(2);
      expect(fs.copyFileSync).toBeCalled();
      expect(fs.ensureDirSync).toBeCalled();
    });

    it("should skip process when the file is existed", () => {
      global.Editor = { Project: { path: "." } };

      fs.existsSync
        .mockImplementationOnce((filePath) => {
          const expectedPath = path.join("assets/resources");

          expect(expectedPath).toBe(filePath);

          return true;
        })
        .mockImplementationOnce((filePath) => {
          const expectedPath = path.join(
            "assets/resources/bundle-information.js"
          );

          expect(expectedPath).toBe(filePath);

          return true;
        });

      packageUtils.mount();

      expect(fs.existsSync).toBeCalledTimes(2);
      expect(fs.copyFileSync).toBeCalledTimes(0);
      expect(fs.ensureDirSync).toBeCalledTimes(0);
    });
  });
});
