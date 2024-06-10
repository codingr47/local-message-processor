// jest.config.js
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    setupFiles: ["dotenv/config"],
    transformIgnorePatterns: [
      "!node_modules/"
    ]
  }