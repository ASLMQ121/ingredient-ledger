const fs = require("node:fs/promises");
const path = require("node:path");
const { test, expect } = require("@playwright/test");

const appOrigin = "http://127.0.0.1:4173";
const screenshotDir = path.resolve("test-results/screenshots");
const viewports = [
  { name: "desktop", size: { width: 1440, height: 1000 } },
  { name: "mobile", size: { width: 390, height: 844 } }
];

test.beforeEach(async ({ page }) => {
  await page.route("**/*", async route => {
    const url = new URL(route.request().url());
    if (url.origin === appOrigin) {
      if (url.pathname.startsWith("/api/")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "{}"
        });
      }
      return route.continue();
    }

    if (/\.(css|woff2?|ttf|otf)$/.test(url.pathname)) return route.abort();
    if (/\.(js|mjs)$/.test(url.pathname)) return route.abort();
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "{}"
    });
  });
  await fs.mkdir(screenshotDir, { recursive: true });
});

async function capture(page, name) {
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: path.join(screenshotDir, name),
    fullPage: true,
    animations: "disabled"
  });
}

for (const viewport of viewports) {
  test(`captures search home at ${viewport.name} size`, async ({ page }) => {
    await page.setViewportSize(viewport.size);
    await page.goto("/#search");

    await expect(page.getByRole("heading", { name: /Is it vegetarian\?/ })).toBeVisible();
    await expect(page.locator("#home")).toBeVisible();
    await expect(page.locator("#tiles .tile").first()).toBeVisible();
    await capture(page, `search-home-${viewport.name}.png`);
  });

  test(`captures search results at ${viewport.name} size`, async ({ page }) => {
    await page.setViewportSize(viewport.size);
    await page.goto("/#search");
    await page.getByRole("searchbox", { name: /Search any ingredient/ }).fill("gelatin");
    await page.getByRole("searchbox", { name: /Search any ingredient/ }).press("Enter");

    await expect(page.locator("#results")).toBeVisible();
    await expect(page.locator("#sec-local")).toContainText("In the index");
    await expect(page.locator("#sec-local")).toContainText("E441 Gelatine");
    await capture(page, `search-results-${viewport.name}.png`);
  });

  test(`captures Reference Index at ${viewport.name} size`, async ({ page }) => {
    await page.setViewportSize(viewport.size);
    await page.goto("/#search");
    await page.getByRole("tab", { name: "Index" }).click();

    await expect(page.locator("#view-index")).toBeVisible();
    await expect(page.locator("#ilist .card").first()).toBeVisible();
    await expect(page.locator("#total")).not.toHaveText("0");
    await capture(page, `reference-index-${viewport.name}.png`);
  });
}

test("filters the Reference Index and handles denied camera access without hardware", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: async () => {
          throw new DOMException("Permission denied", "NotAllowedError");
        }
      }
    });
    window.BarcodeDetector = class {
      async detect() {
        return [];
      }
    };
  });
  await page.goto("/#search");
  await page.getByRole("tab", { name: "Index" }).click();
  await page.getByRole("searchbox", { name: "Filter the index" }).fill("gelatine");
  await expect(page.locator("#ilist .card").filter({ hasText: "E441 Gelatine" })).toBeVisible();

  await page.getByRole("tab", { name: "Search" }).click();
  await page.locator("#cambtn").click();
  await expect(page.locator("#camdlg")).toBeVisible();
  await expect(page.locator("#camstatus")).toContainText("Camera permission was refused");
});

test("shows restaurant-chain scope and filters entries by region", async ({ page }) => {
  await page.goto("/#search");
  await page.getByRole("tab", { name: "Index" }).click();
  const regionFilterRow = page.locator("#regionfilterrow");
  const verdictFilters = page.locator("#kchips");
  const vaccines = page.locator("#catchips").getByRole("button", { name: /Vaccines/ });
  await expect(regionFilterRow).toBeHidden();
  await vaccines.click();
  await expect(regionFilterRow).toBeHidden();
  await expect(verdictFilters).toBeVisible();

  await page.locator("#catchips").getByRole("button", { name: /Restaurant chains/ }).click();

  const regionFilter = page.getByRole("combobox", { name: "Filter restaurant chains by region" });
  const chains = page.locator("#ilist .card");
  await expect(regionFilterRow).toBeVisible();
  await expect(regionFilterRow).not.toContainText("Any verdict");
  await expect(regionFilter).toHaveValue("all");
  const indiaChain = chains.filter({ hasText: "McDonald's India (veg menu)" });
  await expect(indiaChain.locator(".badges")).toContainText("India");
  await expect(indiaChain).toContainText("menus and preparation can vary by location");
  await expect(chains.filter({ hasText: "Taco Bell" })).toBeVisible();

  await regionFilter.selectOption("India");
  await expect(chains.filter({ hasText: "Domino's India" })).toBeVisible();
  await expect(chains.filter({ hasText: "Taco Bell" })).toHaveCount(0);

  await vaccines.click();
  await expect(regionFilterRow).toBeHidden();
  await expect(regionFilter).toHaveValue("all");
  await expect(page.locator("#activetag")).not.toContainText("India");
  await expect(page.locator("#ilist .card").first()).toBeVisible();
});
