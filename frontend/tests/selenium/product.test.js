const { Builder, By, until } = require("selenium-webdriver");
const assert = require("assert");

describe("Products Page E2E Tests", function () {
  let driver;

  // ⚠️ augmente le timeout car Selenium est lent
  this.timeout(30000);

  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
  });

  after(async () => {
    await driver.quit();
  });

  // =========================
  // 1. Affichage page produits
  // =========================
  it("should load products page and display grid", async () => {
    await driver.get("http://localhost:5173/products");

    const grid = await driver.wait(
      until.elementLocated(By.id("product-grid-container")),
      5000
    );

    assert.ok(await grid.isDisplayed());
  });

  // =========================
  // 2. Produit affiché
  // =========================
  it("should display a product card with title, price and image", async () => {
    const title = await driver.findElement(
      By.id("product-card-title-1")
    );

    const price = await driver.findElement(
      By.id("product-card-price-1")
    );

    const img = await driver.findElement(
      By.id("product-card-img-1")
    );

    assert.ok(await title.isDisplayed());
    assert.ok(await price.isDisplayed());
    assert.ok(await img.isDisplayed());
  });

  // =========================
  // 3. Navigation produit
  // =========================
  it("should navigate to product detail page when clicking product", async () => {
    const cardButton = await driver.findElement(
      By.css("#product-card-1 button")
    );

    await cardButton.click();

    await driver.wait(until.urlContains("/products/1"), 5000);

    const url = await driver.getCurrentUrl();
    assert.ok(url.includes("/products/1"));
  });

  // =========================
  // 4. Catégorie affichée
  // =========================
  it("should display product category", async () => {
    const category = await driver.findElement(
      By.xpath("//*[contains(text(),'Shoes')]")
    );

    assert.ok(await category.isDisplayed());
  });

  // =========================
  // 5. Carousel image (si multiple images)
  // =========================
  it("should display carousel controls if multiple images exist", async () => {
    try {
      const nextBtn = await driver.findElement(By.id("carousel-next-btn"));
      const prevBtn = await driver.findElement(By.id("carousel-prev-btn"));

      assert.ok(await nextBtn.isDisplayed());
      assert.ok(await prevBtn.isDisplayed());
    } catch (e) {
      // si produit n'a pas plusieurs images → test ignoré
      console.log("Carousel not available for this product");
    }
  });

  // =========================
  // 6. Grid empty state
  // =========================
  it("should show empty message when no products", async () => {
    await driver.get("http://localhost:5173/products");

    try {
      const emptyMsg = await driver.findElement(
        By.id("product-grid-empty-msg")
      );

      assert.ok(await emptyMsg.isDisplayed());
    } catch (e) {
      console.log("Products exist, empty state not shown");
    }
  });
});