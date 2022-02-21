module.exports = {
  rootDir: "./",
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "jsdom",
  modulePathIgnorePatterns: ["example"],
  testResultsProcessor: "jest-sonar-reporter",
  reporters: ["default", ["jest-junit", { outputDirectory: "coverage" }]],
  coverageReporters: ["clover", "lcov", "text-summary", "cobertura", "text"],
  coverageDirectory: "coverage",
  collectCoverageFrom: ["src/**/*.(t|j)s"],
  moduleNameMapper: {
    "^bundle-management$": "<rootDir>/src/runtime-scripts/bundle-management",
    "^fire-fs$": "<rootDir>/tests/utils/fire-fs.mock.js",
  },
};
