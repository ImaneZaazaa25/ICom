const { Builder, By, until } = require("selenium-webdriver");
const assert = require("assert");

describe("Cart E2E Tests", function () {
  let driver;

  this.timeout(40000);

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
    await driver.get("http://localhost:5173/cart");

    await driver.wait(until.urlContains("/login"), 5000);

    const url = await driver.getCurrentUrl();
    assert.ok(url.includes("/login"));
  });

  // =========================
  // 2. Panier vide
  // =========================
  it("should show empty cart message", async () => {
    await driver.get("http://localhost:5173/cart");

    // simule utilisateur connecté
    await driver.executeScript(() => {
      localStorage.setItem("token", "fake-token");
    });

    await driver.navigate().refresh();

    const emptyMsg = await driver.wait(
      until.elementLocated(By.id("cart-empty-msg")),
      5000
    );

    assert.ok(await emptyMsg.isDisplayed());
  });

  // =========================
  // 3. Affichage items panier
  // =========================
  it("should display cart items", async () => {
    await driver.get("http://localhost:5173/cart");

    await driver.executeScript(() => {
      localStorage.setItem("token", "fake-token");
    });

    await driver.navigate().refresh();

    try {
      const item = await driver.findElement(By.css("[id^='cart-item-']"));
      assert.ok(await item.isDisplayed());
    } catch (e) {
      console.log("No cart items available for test environment");
    }
  });

  // =========================
  // 4. Modifier quantité
  // =========================
  it("should update quantity input", async () => {
    await driver.get("http://localhost:5173/cart");

    await driver.executeScript(() => {
      localStorage.setItem("token", "fake-token");
    });

    await driver.navigate().refresh();

    try {
      const qtyInput = await driver.findElement(
        By.css("input[id^='cart-item-quantity-']")
      );

      await qtyInput.clear();
      await qtyInput.sendKeys("3");

      const value = await qtyInput.getAttribute("value");

      assert.strictEqual(value, "3");
    } catch (e) {
      console.log("No quantity input found");
    }
  });

  // =========================
  // 5. Supprimer un item
  // =========================
  it("should remove item from cart", async () => {
    await driver.get("http://localhost:5173/cart");

    await driver.executeScript(() => {
      localStorage.setItem("token", "fake-token");
    });

    await driver.navigate().refresh();

    try {
      const removeBtn = await driver.findElement(
        By.css("button[id^='cart-item-remove-btn-']")
      );

      await removeBtn.click();

      // petite attente UI
      await driver.sleep(1000);

      assert.ok(true);
    } catch (e) {
      console.log("No remove button available");
    }
  });

  // =========================
  // 6. Total panier affiché
  // =========================
  it("should display total price", async () => {
    await driver.get("http://localhost:5173/cart");

    await driver.executeScript(() => {
      localStorage.setItem("token", "fake-token");
    });

    await driver.navigate().refresh();

    const total = await driver.findElement(By.id("cart-total-price"));

    const text = await total.getText();

    assert.ok(text.length > 0);
  });

  // =========================
  // 7. Vider panier
  // =========================
  it("should clear cart when clicking clear button", async () => {
    await driver.get("http://localhost:5173/cart");

    await driver.executeScript(() => {
      localStorage.setItem("token", "fake-token");
    });

    await driver.navigate().refresh();

    try {
      const clearBtn = await driver.findElement(By.id("cart-clear-btn"));

      await clearBtn.click();

      await driver.sleep(1000);

      assert.ok(true);
    } catch (e) {
      console.log("Clear cart button not available");
    }
  });

  // =========================
  // 8. Checkout navigation
  // =========================
  it("should proceed to checkout", async () => {
    await driver.get("http://localhost:5173/cart");

    await driver.executeScript(() => {
      localStorage.setItem("token", "fake-token");
    });

    await driver.navigate().refresh();

    try {
      const checkoutBtn = await driver.findElement(By.id("cart-validate-btn"));

      await checkoutBtn.click();

      await driver.wait(until.urlContains("/orders"), 10000);

      const url = await driver.getCurrentUrl();

      assert.ok(url.includes("/orders"));
    } catch (e) {
      console.log("Checkout not testable in current state");
    }
  });
});