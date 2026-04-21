const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { createDriver } = require("./helpers/driver");

describe("Login E2E Tests", function () {
  let driver;

  this.timeout(60000);

  // ✅ 1 seul driver propre
  before(async function () {
    console.log("START DRIVER");
    driver = await createDriver();
    console.log("DRIVER OK");
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  // =========================
  // 1. Affichage page login
  // =========================
  it("should load login page correctly", async function () {
    await driver.get("http://localhost:5173/login");

    const form = await driver.wait(
      until.elementLocated(By.id("login-form")),
      5000
    );

    assert.ok(await form.isDisplayed());
  });

  // =========================
  // 2. Champs visibles
  // =========================
  it("should display username and password inputs", async function () {
    const username = await driver.findElement(By.id("login-username-input"));
    const password = await driver.findElement(By.id("login-password-input"));

    assert.ok(await username.isDisplayed());
    assert.ok(await password.isDisplayed());
  });

  // =========================
  // 3. Erreur login
  // =========================
  it("should show error message on invalid login", async function () {
    await driver.get("http://localhost:5173/login");

    await driver.findElement(By.id("login-username-input")).sendKeys("wrong");
    await driver.findElement(By.id("login-password-input")).sendKeys("wrong");

    await driver.findElement(By.id("login-submit-btn")).click();

    const error = await driver.wait(
      until.elementLocated(By.id("login-error-msg")),
      5000
    );

    assert.ok(await error.isDisplayed());
  });

  // =========================
  // 4. Navigation login success
  // =========================
  it("should navigate after successful login", async function () {
    await driver.get("http://localhost:5173/login");

    await driver.findElement(By.id("login-username-input")).sendKeys("admin");
    await driver.findElement(By.id("login-password-input")).sendKeys("admin123");

    await driver.findElement(By.id("login-submit-btn")).click();

    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url.includes("/products") || url.includes("/admin");
    }, 10000);

    const url = await driver.getCurrentUrl();

    assert.ok(
      url.includes("/products") || url.includes("/admin/adminhome")
    );
  });

  // =========================
  // 5. Checkbox
  // =========================
  it("should toggle remember me checkbox", async function () {
    await driver.get("http://localhost:5173/login");

    const checkbox = await driver.findElement(
      By.css("input[type='checkbox']")
    );

    await checkbox.click();

    const isChecked = await checkbox.isSelected();
    assert.strictEqual(isChecked, true);
  });

  // =========================
  // 6. Register link
  // =========================
  it("should navigate to register page", async function () {
    await driver.get("http://localhost:5173/login");

    const link = await driver.findElement(By.id("login-register-link"));
    await link.click();

    await driver.wait(until.urlContains("/register"), 5000);

    const url = await driver.getCurrentUrl();
    assert.ok(url.includes("/register"));
  });
});