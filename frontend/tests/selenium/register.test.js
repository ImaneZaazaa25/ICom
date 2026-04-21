const { Builder, By, until } = require("selenium-webdriver");
const assert = require("assert");

describe("Register E2E Tests", function () {
  let driver;

  this.timeout(30000);

  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
  });

  after(async () => {
    await driver.quit();
  });

  // =========================
  // 1. Chargement page register
  // =========================
  it("should load register page correctly", async () => {
    await driver.get("http://localhost:5173/register");

    const form = await driver.wait(
      until.elementLocated(By.id("register-form")),
      5000
    );

    assert.ok(await form.isDisplayed());
  });

  // =========================
  // 2. Champs visibles
  // =========================
  it("should display all input fields", async () => {
    const nom = await driver.findElement(By.id("register-lastname-input"));
    const prenom = await driver.findElement(By.id("register-firstname-input"));
    const username = await driver.findElement(By.id("register-username-input"));
    const email = await driver.findElement(By.id("register-email-input"));
    const tel = await driver.findElement(By.id("register-phone-input"));
    const password = await driver.findElement(By.id("register-password-input"));

    assert.ok(await nom.isDisplayed());
    assert.ok(await prenom.isDisplayed());
    assert.ok(await username.isDisplayed());
    assert.ok(await email.isDisplayed());
    assert.ok(await tel.isDisplayed());
    assert.ok(await password.isDisplayed());
  });

  // =========================
  // 3. Validation erreur email
  // =========================
  it("should show error for invalid email", async () => {
    await driver.get("http://localhost:5173/register");

    await driver.findElement(By.id("register-lastname-input")).sendKeys("Test");
    await driver.findElement(By.id("register-firstname-input")).sendKeys("User");
    await driver.findElement(By.id("register-username-input")).sendKeys("testuser");
    await driver.findElement(By.id("register-email-input")).sendKeys("invalid-email");
    await driver.findElement(By.id("register-phone-input")).sendKeys("0612345678");
    await driver.findElement(By.id("register-password-input")).sendKeys("Password123");

    await driver.findElement(By.id("register-submit-btn")).click();

    const error = await driver.wait(
      until.elementLocated(By.className("error-message")),
      5000
    );

    assert.ok(await error.isDisplayed());
  });

  // =========================
  // 4. Validation téléphone
  // =========================
  it("should show error for invalid phone number", async () => {
    await driver.get("http://localhost:5173/register");

    await driver.findElement(By.id("register-email-input")).sendKeys("test@test.com");
    await driver.findElement(By.id("register-phone-input")).sendKeys("123");

    await driver.findElement(By.id("register-submit-btn")).click();

    const error = await driver.wait(
      until.elementLocated(By.id("register-error-msg")),
      5000
    );

    assert.ok(await error.isDisplayed());
  });

  // =========================
  // 5. Succès inscription
  // =========================
  it("should register user successfully and redirect to login", async () => {
    await driver.get("http://localhost:5173/register");

    const random = Math.floor(Math.random() * 10000);

    await driver.findElement(By.id("register-lastname-input")).sendKeys("Test");
    await driver.findElement(By.id("register-firstname-input")).sendKeys("User");
    await driver.findElement(By.id("register-username-input")).sendKeys("user" + random);
    await driver.findElement(By.id("register-email-input")).sendKeys(`user${random}@test.com`);
    await driver.findElement(By.id("register-phone-input")).sendKeys("0612345678");
    await driver.findElement(By.id("register-password-input")).sendKeys("Password123!");

    await driver.findElement(By.id("register-submit-btn")).click();

    // attendre message succès
    const success = await driver.wait(
      until.elementLocated(By.className("success-message")),
      5000
    );

    assert.ok(await success.isDisplayed());

    // attendre redirection login
    await driver.wait(until.urlContains("/login"), 10000);

    const url = await driver.getCurrentUrl();
    assert.ok(url.includes("/login"));
  });

  // =========================
  // 6. Lien login
  // =========================
  it("should navigate to login page from link", async () => {
    await driver.get("http://localhost:5173/register");

    const link = await driver.findElement(By.id("register-login-link"));
    await link.click();

    await driver.wait(until.urlContains("/login"), 5000);

    const url = await driver.getCurrentUrl();
    assert.ok(url.includes("/login"));
  });

  // =========================
  // 7. Password strength visible
  // =========================
  it("should show password strength indicator", async () => {
    await driver.get("http://localhost:5173/register");

    const password = await driver.findElement(By.id("register-password-input"));

    await password.sendKeys("Weak1");

    const strength = await driver.wait(
      until.elementLocated(By.className("password-strength")),
      5000
    );

    assert.ok(await strength.isDisplayed());
  });
});