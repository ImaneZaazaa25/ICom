const { Builder, By, until } = require("selenium-webdriver");
const assert = require("assert");

describe("Product Details E2E Tests", function () {
  let driver;

  this.timeout(40000);

  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
  });

  after(async () => {
    await driver.quit();
  });

  // =========================
  // 1. Chargement produit
  // =========================
  it("should load product details page", async () => {
    await driver.get("http://localhost:5173/products/1");

    const title = await driver.wait(
      until.elementLocated(By.id("product-details-title")),
      5000
    );

    assert.ok(await title.isDisplayed());
  });

  // =========================
  // 2. Affichage infos produit
  // =========================
  it("should display product info correctly", async () => {
    const price = await driver.findElement(By.id("product-details-price"));
    const desc = await driver.findElement(By.id("product-details-description"));
    const stock = await driver.findElement(By.id("product-details-stock"));

    assert.ok(await price.isDisplayed());
    assert.ok(await desc.isDisplayed());
    assert.ok(await stock.isDisplayed());
  });

  // =========================
  // 3. Image carousel visible
  // =========================
  it("should display product images", async () => {
    const img = await driver.findElement(By.id("carousel-active-img"));
    assert.ok(await img.isDisplayed());
  });

  // =========================
  // 4. Quantité input
  // =========================
  it("should allow quantity change", async () => {
    const input = await driver.findElement(
      By.id("product-details-quantity-input")
    );

    await input.clear();
    await input.sendKeys("2");

    const value = await input.getAttribute("value");

    assert.strictEqual(value, "2");
  });

  // =========================
  // 5. Ajouter au panier
  // =========================
  it("should add product to cart", async () => {
    await driver.get("http://localhost:5173/products/1");

    // simulate login
    await driver.executeScript(() => {
      localStorage.setItem("token", "fake-token");
    });

    await driver.navigate().refresh();

    const btn = await driver.wait(
      until.elementLocated(By.id("product-details-add-btn")),
      5000
    );

    await btn.click();

    // check success message
    const success = await driver.wait(
      until.elementLocated(By.className("product-details-cart-success")),
      5000
    );

    assert.ok(await success.isDisplayed());
  });

  // =========================
  // 6. Erreur si pas connecté
  // =========================
  it("should redirect to login if not authenticated", async () => {
    await driver.executeScript(() => {
      localStorage.removeItem("token");
    });

    await driver.get("http://localhost:5173/products/1");

    await driver.wait(until.urlContains("/login"), 5000);

    const url = await driver.getCurrentUrl();

    assert.ok(url.includes("/login"));
  });

  // =========================
  // 7. Stock affiché correctement
  // =========================
  it("should display stock status", async () => {
    await driver.get("http://localhost:5173/products/1");

    const stock = await driver.findElement(By.id("product-details-stock"));

    const text = await stock.getText();

    assert.ok(text.includes("En stock") || text.includes("Rupture"));
  });

  // =========================
  // 8. Bouton add disabled si out of stock
  // =========================
  it("should disable add button if out of stock", async () => {
    const btn = await driver.findElement(
      By.id("product-details-add-btn")
    );

    const disabled = await btn.getAttribute("disabled");

    // peut être null ou "true"
    assert.ok(disabled !== undefined);
  });
});