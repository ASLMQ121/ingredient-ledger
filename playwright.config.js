const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  outputDir: "test-results",
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    viewport: { width: 1440, height: 1000 },
    serviceWorkers: "block",
    trace: "retain-on-failure"
  },
  webServer: {
    command: "node tests/browser/server.js",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI
  }
});
