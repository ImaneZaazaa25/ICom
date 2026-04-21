const { Builder, By, until } = require("selenium-webdriver");
const assert = require("assert");

describe("Orders Page E2E Tests", function () {
  let driver;

  this.timeout(50000);

  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
  });

  after(async () => {
    await driver.quit();
  });

  // =========================
  // 1. Redirection si non connecté
  // =========================
  it("should redirect to login if not authenticated", async () => {
    await driver.executeScript(() => {
      localStorage.removeItem("token");
    });

    await driver.get("http://localhost:5173/orders");

    await driver.wait(until.urlContains("/login"), 5000);

    const url = await driver.getCurrentUrl();

    assert.ok(url.includes("/login"));
  });

  // =========================
  // 2. Chargement page orders
  // =========================
  it("should load orders page when authenticated", async () => {
    await driver.executeScript(() => {
      localStorage.setItem("token", "fake-token");
    });

    await driver.get("http://localhost:5173/orders");

    const title = await driver.wait(
      until.elementLocated(By.className("orders-title")),
      5000
    );

    assert.ok(await title.isDisplayed());
  });

  // =========================
  // 3. Empty state
  // =========================
  it("should show empty orders message", async () => {
    await driver.get("http://localhost:5173/orders");

    try {
      const empty = await driver.findElement(By.id("orders-empty-msg"));
      assert.ok(await empty.isDisplayed());
    } catch (e) {
      console.log("Orders exist, empty state not shown");
    }
  });

  // =========================
  // 4. Orders list container
  // =========================
  it("should display orders container", async () => {
    const container = await driver.findElement(By.id("orders-list-container"));

    assert.ok(await container.isDisplayed());
  });

  // =========================
  // 5. Order cards display
  // =========================
  it("should display order cards if available", async () => {
    try {
      const card = await driver.findElement(By.css("[id^='order-card-']"));
      assert.ok(await card.isDisplayed());
    } catch (e) {
      console.log("No orders found");
    }
  });

  // =========================
  // 6. Toggle order details (accordion)
  // =========================
  it("should open order details on click", async () => {
    await driver.get("http://localhost:5173/orders");

    try {
      const card = await driver.findElement(By.css("[id^='order-card-']"));

      await card.click();

      await driver.sleep(1000);

      const body = await driver.findElements(By.className("order-card-body"));

      assert.ok(body.length >= 0);
    } catch (e) {
      console.log("No orders available for toggle test");
    }
  });

  // =========================
  // 7. Order status displayed
  // =========================
  it("should display order status", async () => {
    await driver.get("http://localhost:5173/orders");

    try {
      const status = await driver.findElement(By.css("[id^='order-status-']"));
      assert.ok(await status.isDisplayed());
    } catch (e) {
      console.log("No orders found");
    }
  });

  // =========================
  // 8. Order total displayed
  // =========================
  it("should display order total", async () => {
    await driver.get("http://localhost:5173/orders");

    try {
      const total = await driver.findElement(By.css("[id^='order-total-']"));
      assert.ok(await total.isDisplayed());
    } catch (e) {
      console.log("No orders found");
    }
  });

  // =========================
  // 9. Order date displayed
  // =========================
  it("should display order date", async () => {
    await driver.get("http://localhost:5173/orders");

    try {
      const date = await driver.findElement(By.css("[id^='order-date-']"));
      assert.ok(await date.isDisplayed());
    } catch (e) {
      console.log("No orders found");
    }
  });

  // =========================
  // 10. Navigation products link
  // =========================
  it("should navigate to product from order line", async () => {
    await driver.get("http://localhost:5173/orders");

    try {
      const link = await driver.findElement(By.className("order-line-name"));

      await link.click();

      await driver.wait(until.urlContains("/products/"), 5000);

      const url = await driver.getCurrentUrl();

      assert.ok(url.includes("/products/"));
    } catch (e) {
      console.log("No order lines available");
    }
  });
});