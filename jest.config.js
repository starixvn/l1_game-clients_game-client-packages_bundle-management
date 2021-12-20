module.exports = {
  rootDir: "./",
  verbose: true,
  modulePathIgnorePatterns: ["example"],
  testResultsProcessor: "jest-sonar-reporter",
  reporters: ["default", ["jest-junit", { outputDirectory: "coverage" }]],
  coverageReporters: ["clover", "lcov", "text-summary", "cobertura"],
  coverageDirectory: "coverage",
  collectCoverageFrom: ["src/**/*.(t|j)s"],
  moduleNameMapper: {
    "^bundle-manager$": "<rootDir>/src/runtime-scripts/bundle-manager",
    "^fire-fs$": "<rootDir>/tests/utils/fire-fs.mock.js",
  },
};
