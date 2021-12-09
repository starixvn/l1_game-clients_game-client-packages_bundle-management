module.exports = {
  rootDir: "./",
  verbose: true,
  modulePathIgnorePatterns: ["example"],
  testResultsProcessor: "jest-sonar-reporter",
  reporters: ["default", ["jest-junit", { outputDirectory: "coverage" }]],
  coverageReporters: ["clover", "lcov", "text-summary", "cobertura"],
  coverageDirectory: "coverage",
};
