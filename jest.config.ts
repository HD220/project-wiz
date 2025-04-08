// Jest configuration
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.test.json",
        target: "es5",
      },
    ],
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  testPathIgnorePatterns: ["/node_modules/"],
  globals: {
    MAIN_WINDOW_VITE_DEV_SERVER_URL: "http://localhost:3000", // Mock the variable
  },
  moduleNameMapper: {
      electron: '<rootDir>/src/core/__mocks__/electron.ts',
    
  },
};
