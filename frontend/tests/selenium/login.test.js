const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { createDriver } = require("./helpers/driver");

describe("Login E2E Tests", function () {
  let driver;

  // 🔥 IMPORTANT : donner plus de temps à Mocha
  this.timeout(180000);

  // =========================
  // INIT DRIVER
  // =========================
 before(async function () {
  console.log("START DRIVER");

  driver = await createDriver();

  console.log("DRIVER CREATED");

  await driver.manage().setTimeouts({ implicit: 5000 });

  console.log("DRIVER READY");
});

  // =========================
  // CLEANUP
  // =========================
  after(async function () {
    if (driver) await driver.quit();
  });

  // =========================
  // RESET PAGE
  // =========================
  beforeEach(async function () {
    await driver.get("http://localhost:5173/login");
  });

  // =========================
  // 1. PAGE LOAD
  // =========================
  it("should load login page correctly", async function () {
    const form = await driver.wait(
      until.elementLocated(By.id("login-form")),
      10000
    );

    assert.ok(await form.isDisplayed());
  });

  // =========================
  // 2. INPUTS
  // =========================
it("should display username and password inputs", async function () {
  const username = await driver.wait(
    until.elementLocated(By.id("login-username-input")),
    10000
  );

  const password = await driver.wait(
    until.elementLocated(By.id("login-password-input")),
    10000
  );

  await driver.wait(until.elementIsVisible(username), 10000);
  await driver.wait(until.elementIsVisible(password), 10000);

  assert.ok(true);
});

  // =========================
  // 3. INVALID LOGIN
  // =========================
  it("should show error message on invalid login", async function () {
    await driver.findElement(By.id("login-username-input")).sendKeys("wrong");
    await driver.findElement(By.id("login-password-input")).sendKeys("wrong");

    await driver.findElement(By.id("login-submit-btn")).click();

    const error = await driver.wait(
      until.elementLocated(By.id("login-error-msg")),
      10000
    );

    assert.ok(await error.isDisplayed());
  });

  // =========================
  // 4. SUCCESS LOGIN
  // =========================
 

  it("should navigate after successful login", async function () {
  await driver.findElement(By.id("login-username-input")).sendKeys("ee");
  await driver.findElement(By.id("login-password-input")).sendKeys("1234567");

  await driver.findElement(By.id("login-submit-btn")).click();

  await driver.wait(async () => {
    const url = await driver.getCurrentUrl();
    return url.includes("/products") || url.includes("/admin/adminhome");
  }, 20000);

  const url = await driver.getCurrentUrl();

  assert.ok(
    url.includes("/products") || url.includes("/admin/adminhome")
  );
});

  // =========================
  // 5. CHECKBOX
  // =========================
  it("should toggle remember me checkbox", async function () {
    const checkbox = await driver.wait(
      until.elementLocated(By.css("input[type='checkbox']")),
      10000
    );

    await checkbox.click();

    const isChecked = await checkbox.isSelected();
    assert.strictEqual(isChecked, true);
  });

  // =========================
  // 6. REGISTER LINK
  // =========================
  it("should navigate to register page", async function () {
    const link = await driver.wait(
      until.elementLocated(By.id("login-register-link")),
      10000
    );

    await link.click();

    await driver.wait(until.urlContains("/register"), 10000);

    const url = await driver.getCurrentUrl();
    assert.ok(url.includes("/register"));
  });
});