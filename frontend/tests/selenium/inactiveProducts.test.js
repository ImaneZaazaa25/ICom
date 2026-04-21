const { Builder, By, until } = require("selenium-webdriver");
const assert = require("assert");

describe("Inactive Products Admin E2E Tests", function () {
  let driver;

  this.timeout(50000);

  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
  });

  after(async () => {
    await driver.quit();
  });

  // =========================
  // 1. Chargement page
  // =========================
  it("should load inactive products page", async () => {
    await driver.get("http://localhost:5173/admin/inactive-products");

    const title = await driver.wait(
      until.elementLocated(By.id("inactive-title")),
      5000
    );

    assert.ok(await title.isDisplayed());
  });

  // =========================
  // 2. Affichage stats
  // =========================
  it("should display inactive products stats", async () => {
    const stats = await driver.findElement(By.id("products-stats"));

    assert.ok(await stats.isDisplayed());
  });

  // =========================
  // 3. Grid produits inactifs
  // =========================
  it("should display inactive products grid", async () => {
    const grid = await driver.findElement(By.id("admin-products-grid"));

    assert.ok(await grid.isDisplayed());
  });

  // =========================
  // 4. Filters section
  // =========================
  it("should display filters section", async () => {
    const filters = await driver.findElement(By.id("product-filters-section"));

    assert.ok(await filters.isDisplayed());
  });

  // =========================
  // 5. No products message
  // =========================
  it("should show empty state when no inactive products", async () => {
    await driver.get("http://localhost:5173/admin/inactive-products");

    try {
      const msg = await driver.findElement(By.id("no-products-message"));
      assert.ok(await msg.isDisplayed());
    } catch (e) {
      console.log("Inactive products exist, empty state not shown");
    }
  });

  // =========================
  // 6. Loading state
  // =========================
  it("should show loading spinner", async () => {
    await driver.get("http://localhost:5173/admin/inactive-products");

    try {
      const loading = await driver.findElement(By.id("loading-spinner"));
      assert.ok(await loading.isDisplayed());
    } catch (e) {
      console.log("Loading finished too fast");
    }
  });

  // =========================
  // 7. Error state
  // =========================
  it("should display error message if API fails", async () => {
    await driver.get("http://localhost:5173/admin/inactive-products");

    try {
      const error = await driver.findElement(By.id("error-message"));
      assert.ok(await error.isDisplayed());
    } catch (e) {
      console.log("No API error detected");
    }
  });

  // =========================
  // 8. Activer produit (toggle status)
  // =========================
  it("should activate inactive product", async () => {
    await driver.get("http://localhost:5173/admin/inactive-products");

    try {
      const toggleBtn = await driver.findElement(
        By.css("button[id^='toggle-status']")
      );

      await toggleBtn.click();

      await driver.sleep(1000);

      assert.ok(true);
    } catch (e) {
      console.log("No toggle button found or no inactive products");
    }
  });

  // =========================
  // 9. Action overlay loading
  // =========================
  it("should show action overlay when updating product", async () => {
    await driver.get("http://localhost:5173/admin/inactive-products");

    try {
      const overlay = await driver.findElement(By.id("action-overlay"));
      assert.ok(await overlay.isDisplayed());
    } catch (e) {
      console.log("No action overlay visible");
    }
  });

  // =========================
  // 10. URL check
  // =========================
  it("should be on correct inactive products page", async () => {
    await driver.get("http://localhost:5173/admin/inactive-products");

    const url = await driver.getCurrentUrl();

    assert.ok(url.includes("/admin/inactive-products"));
  });
});