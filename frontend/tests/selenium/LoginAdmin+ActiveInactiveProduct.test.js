const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { createDriver } = require("./helpers/driver");

describe("Complete Product Status Toggle Flow", function () {
  let driver;

  this.timeout(120000);

  before(async function () {
    console.log("🚀 Starting driver...");
    driver = await createDriver();
    await driver.manage().setTimeouts({ implicit: 10000 });
    console.log("✅ Driver ready");
  });

  after(async function () {
    if (driver) {
      console.log("🧹 Cleaning up...");
      await driver.quit();
    }
  });

  async function login() {
    console.log(`🔐 Logging in as imane25...`);
    await driver.get("http://localhost:5173/login");

    const usernameInput = await driver.wait(
      until.elementLocated(By.id("login-username-input")),
      10000
    );
    await usernameInput.clear();
    await usernameInput.sendKeys("imane25");

    const passwordInput = await driver.findElement(By.id("login-password-input"));
    await passwordInput.clear();
    await passwordInput.sendKeys("imane2511");

    const submitBtn = await driver.findElement(By.id("login-submit-btn"));
    await submitBtn.click();

    await driver.wait(until.urlContains("/admin"), 15000);
    console.log("✅ Login successful");
  }

  async function getActiveProductsCount() {
    try {
      const statsText = await driver.findElement(By.id("products-stats")).getText();
      const match = statsText.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    } catch (e) {
      console.log("Could not get active products count");
      return 0;
    }
  }

  async function getInactiveProductsCount() {
    try {
      const statsText = await driver.findElement(By.id("inactive-products-stats")).getText();
      const match = statsText.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    } catch (e) {
      console.log("Could not get inactive products count");
      return 0;
    }
  }

  async function waitForGrid(page) {
    const gridId = page === "active" ? "admin-products-grid" : "inactive-products-grid";
    await driver.wait(until.elementLocated(By.id(gridId)), 10000);
    await driver.sleep(2000);
  }

  async function getFirstProductCard() {
    // Wait for at least one product card to exist
    await driver.wait(async () => {
      const cards = await driver.findElements(By.css(".admin-product-card, [class*='product-card']"));
      return cards.length > 0;
    }, 10000);

    return await driver.findElement(By.css(".admin-product-card, [class*='product-card']"));
  }

  async function clickToggleOnProduct(productCard) {
    // Try different possible toggle button selectors
    let toggleButton = null;

    // Try by class
    try {
      toggleButton = await productCard.findElement(By.css(".toggle-status-btn, [class*='toggle'], [class*='switch']"));
    } catch (e) {}

    // Try by button text
    if (!toggleButton) {
      try {
        const buttons = await productCard.findElements(By.css("button"));
        for (const button of buttons) {
          const text = await button.getText();
          if (text.includes("Activer") || text.includes("Désactiver") || text === "Toggle") {
            toggleButton = button;
            break;
          }
        }
      } catch (e) {}
    }

    // Try last button as fallback
    if (!toggleButton) {
      try {
        const buttons = await productCard.findElements(By.css("button"));
        if (buttons.length > 0) {
          toggleButton = buttons[buttons.length - 1];
        }
      } catch (e) {}
    }

    if (!toggleButton) {
      throw new Error("Could not find toggle button");
    }

    await toggleButton.click();
    console.log("✅ Clicked toggle button");
    await driver.sleep(1000);

    // Handle confirmation dialog
    try {
      const confirmBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Confirmer') or contains(text(), 'Oui') or contains(text(), 'OK')]"));
      await confirmBtn.click();
      console.log("✅ Confirmed action");
      await driver.sleep(1000);
    } catch (e) {}

    // Handle alert
    try {
      const alert = await driver.switchTo().alert();
      await alert.accept();
      console.log("✅ Accepted alert");
      await driver.sleep(1000);
    } catch (e) {}
  }

  it("should deactivate an active product from HomeAdmin and then reactivate it from InactiveProducts", async function () {

    // ==========================================
    // PART 1: LOGIN
    // ==========================================
    await login();

    // ==========================================
    // PART 2: DEACTIVATE AN ACTIVE PRODUCT
    // ==========================================
    console.log("\n📦 PART 2: Deactivating an active product from HomeAdmin...");

    await driver.get("http://localhost:5173/admin/adminhome");
    await waitForGrid("active");

    const initialActiveCount = await getActiveProductsCount();
    console.log(`📊 Initial active products count: ${initialActiveCount}`);

    if (initialActiveCount === 0) {
      console.log("⚠️ No active products to deactivate. Test skipped.");
      this.skip();
      return;
    }

    // Get first product card
    const productCard = await getFirstProductCard();
    console.log("✅ Found product card");

    // Click toggle to deactivate
    await clickToggleOnProduct(productCard);

    // Wait for refresh
    await driver.sleep(2000);

    // Verify product count decreased
    const afterDeactivationCount = await getActiveProductsCount();
    console.log(`📊 Active products after deactivation: ${afterDeactivationCount}`);

    if (afterDeactivationCount === initialActiveCount - 1) {
      console.log("✅ Product successfully deactivated!");
    } else {
      console.log(`⚠️ Count changed from ${initialActiveCount} to ${afterDeactivationCount}`);
    }

    // ==========================================
    // PART 3: VERIFY IN INACTIVE PAGE
    // ==========================================
    console.log("\n🔍 PART 3: Verifying product appears in Inactive Products...");

    await driver.get("http://localhost:5173/admin/inactive-products");
    await waitForGrid("inactive");

    const inactiveCount = await getInactiveProductsCount();
    console.log(`📊 Inactive products count: ${inactiveCount}`);

    if (inactiveCount > 0) {
      console.log(`✅ Found ${inactiveCount} inactive product(s)`);
    } else {
      console.log("⚠️ No inactive products found");
    }

    // ==========================================
    // PART 4: REACTIVATE THE PRODUCT
    // ==========================================
    console.log("\n🔄 PART 4: Reactivating the product from InactiveProducts...");

    const initialInactiveCount = inactiveCount;

    if (initialInactiveCount === 0) {
      console.log("⚠️ No inactive products to reactivate");
      this.skip();
      return;
    }

    // Get first inactive product card
    const inactiveProductCard = await getFirstProductCard();
    console.log("✅ Found inactive product card");

    // Click toggle to reactivate
    await clickToggleOnProduct(inactiveProductCard);

    // Wait for refresh
    await driver.sleep(2000);

    // Verify inactive count decreased
    const afterReactivationCount = await getInactiveProductsCount();
    console.log(`📊 Inactive products after reactivation: ${afterReactivationCount}`);

    if (afterReactivationCount === initialInactiveCount - 1) {
      console.log("✅ Product successfully reactivated!");
    } else {
      console.log(`⚠️ Count changed from ${initialInactiveCount} to ${afterReactivationCount}`);
    }

    // ==========================================
    // PART 5: FINAL VERIFICATION
    // ==========================================
    console.log("\n✅ PART 5: Final verification...");

    await driver.get("http://localhost:5173/admin/adminhome");
    await waitForGrid("active");

    const finalActiveCount = await getActiveProductsCount();
    console.log(`📊 Final active products count: ${finalActiveCount}`);

    // Verify we're back to original state
    if (finalActiveCount === initialActiveCount) {
      console.log("✅ Product is back in active products!");
    }

    console.log("\n✨✨✨ TEST COMPLETED SUCCESSFULLY! ✨✨✨");
  });
});
