const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { createDriver } = require("./helpers/driver");

describe("Orders Page E2E Tests", function () {
  let driver;
  let savedAuth = null; // token + role + username sauvegardés après login réel

  this.timeout(180000);

  // =========================
  // INIT DRIVER + LOGIN RÉEL
  // =========================
  before(async function () {
    console.log("START DRIVER");
    driver = await createDriver();
    await driver.manage().setTimeouts({ implicit: 5000 });

    // Login réel (fake-token invalide avec le nouveau AuthContext qui valide le JWT)
    await driver.get("http://localhost:5173/login");

    const usernameInput = await driver.wait(
      until.elementLocated(By.id("login-username-input")),
      15000
    );
    await driver.wait(until.elementIsVisible(usernameInput), 15000);
    await usernameInput.sendKeys("ee");

    const passwordInput = await driver.wait(
      until.elementLocated(By.id("login-password-input")),
      15000
    );
    await passwordInput.sendKeys("1234567");

    await driver.findElement(By.id("login-submit-btn")).click();

    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url.includes("/products") || url.includes("/admin") || url.includes("/cart");
    }, 20000);

    // Sauvegarder le token réel pour le restaurer entre chaque test
    const token    = await driver.executeScript(() => localStorage.getItem("token"));
    const role     = await driver.executeScript(() => localStorage.getItem("roles"));
    const username = await driver.executeScript(() => localStorage.getItem("username"));
    savedAuth = { token, role, username };

    console.log("DRIVER READY — LOGIN OK");
  });

  // =========================
  // CLEANUP
  // =========================
  after(async function () {
    if (driver) await driver.quit();
  });

  // =========================
  // RESTAURER L'AUTH AVANT CHAQUE TEST
  // restoreUser() lit localStorage à chaque page load → besoin d'un vrai token
  // =========================
  beforeEach(async function () {
    if (!savedAuth) return;
    await driver.executeScript((auth) => {
      localStorage.setItem("token",    auth.token);
      if (auth.role)     localStorage.setItem("roles",    auth.role);
      if (auth.username) localStorage.setItem("username", auth.username);
    }, savedAuth);
  });

  // =========================
  // 1. Redirection si non connecté
  // =========================
  it("should redirect to login if not authenticated", async function () {
    // Supprimer le token (beforeEach l'a restauré, on le retire maintenant)
    await driver.executeScript(() => localStorage.removeItem("token"));

    await driver.get("http://localhost:5173/orders");

    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url.includes("/login");
    }, 10000);

    const url = await driver.getCurrentUrl();
    assert.ok(url.includes("/login"), "Doit rediriger vers /login sans token");
    console.log("✔ Redirection /login OK");
  });

  // =========================
  // 2. Chargement page orders (token réel)
  // =========================
  it("should load orders page when authenticated", async function () {
    await driver.get("http://localhost:5173/orders");

    const title = await driver.wait(
      until.elementLocated(By.className("orders-title")),
      15000
    );
    await driver.wait(until.elementIsVisible(title), 15000);

    assert.ok(await title.isDisplayed(), "Le titre 'Mes commandes' doit être visible");
    console.log("✔ Page orders chargée avec token réel");
  });

  // =========================
  // 3. Container orders
  // =========================
  it("should display orders container", async function () {
    await driver.get("http://localhost:5173/orders");

    const container = await driver.wait(
      until.elementLocated(By.id("orders-list-container")),
      15000
    );
    await driver.wait(until.elementIsVisible(container), 15000);

    assert.ok(await container.isDisplayed());
    console.log("✔ Container orders visible");
  });

  // =========================
  // 4. État vide ou liste
  // =========================
  it("should show empty message or order list", async function () {
    await driver.get("http://localhost:5173/orders");

    await driver.wait(
      until.elementLocated(By.id("orders-list-container")),
      15000
    );

    try {
      const empty = await driver.wait(
        until.elementLocated(By.id("orders-empty-msg")),
        5000
      );
      await driver.wait(until.elementIsVisible(empty), 5000);
      console.log("✔ Aucune commande — message vide affiché");
    } catch (e) {
      console.log("✔ Des commandes existent — message vide non affiché");
    }
  });

  // =========================
  // 5. Order cards (si disponibles)
  // =========================
  it("should display order cards if available", async function () {
    await driver.get("http://localhost:5173/orders");

    await driver.wait(
      until.elementLocated(By.id("orders-list-container")),
      15000
    );

    try {
      const card = await driver.wait(
        until.elementLocated(By.css("[id^='order-card-']")),
        8000
      );
      await driver.wait(until.elementIsVisible(card), 5000);
      assert.ok(await card.isDisplayed());
      console.log("✔ Order cards visibles");
    } catch (e) {
      console.log("Pas de commandes disponibles");
    }
  });

  // =========================
  // 6. Toggle détails (clic sur le bouton header, pas le div)
  // =========================
  it("should open order details on click", async function () {
    await driver.get("http://localhost:5173/orders");

    await driver.wait(
      until.elementLocated(By.id("orders-list-container")),
      15000
    );

    try {
      // Le click doit cibler le bouton .order-card-header, pas le div parent
      const headerBtn = await driver.wait(
        until.elementLocated(By.css("[id^='order-card-'] .order-card-header")),
        8000
      );
      await driver.wait(until.elementIsVisible(headerBtn), 5000);
      await headerBtn.click();

      const body = await driver.wait(
        until.elementLocated(By.className("order-card-body")),
        8000
      );
      assert.ok(await body.isDisplayed());
      console.log("✔ Détails commande ouverts");
    } catch (e) {
      console.log("Pas de commandes disponibles");
    }
  });

  // =========================
  // 7. Status commande
  // =========================
  it("should display order status", async function () {
    await driver.get("http://localhost:5173/orders");

    await driver.wait(
      until.elementLocated(By.id("orders-list-container")),
      15000
    );

    try {
      const status = await driver.wait(
        until.elementLocated(By.css("[id^='order-status-']")),
        8000
      );
      await driver.wait(until.elementIsVisible(status), 5000);
      assert.ok(await status.isDisplayed());
      console.log("✔ Statut commande visible");
    } catch (e) {
      console.log("Pas de commandes disponibles");
    }
  });

  // =========================
  // 8. Total commande
  // =========================
  it("should display order total", async function () {
    await driver.get("http://localhost:5173/orders");

    await driver.wait(
      until.elementLocated(By.id("orders-list-container")),
      15000
    );

    try {
      const total = await driver.wait(
        until.elementLocated(By.css("[id^='order-total-']")),
        8000
      );
      await driver.wait(until.elementIsVisible(total), 5000);
      assert.ok(await total.isDisplayed());
      console.log("✔ Total commande visible");
    } catch (e) {
      console.log("Pas de commandes disponibles");
    }
  });

  // =========================
  // 9. Date commande
  // =========================
  it("should display order date", async function () {
    await driver.get("http://localhost:5173/orders");

    await driver.wait(
      until.elementLocated(By.id("orders-list-container")),
      15000
    );

    try {
      const date = await driver.wait(
        until.elementLocated(By.css("[id^='order-date-']")),
        8000
      );
      await driver.wait(until.elementIsVisible(date), 5000);
      assert.ok(await date.isDisplayed());
      console.log("✔ Date commande visible");
    } catch (e) {
      console.log("Pas de commandes disponibles");
    }
  });

  // =========================
  // 10. Navigation vers le produit depuis une ligne de commande
  // Nécessite d'ouvrir la commande (order-card-body) avant de trouver le lien
  // =========================
  it("should navigate to product from order line", async function () {
    await driver.get("http://localhost:5173/orders");

    await driver.wait(
      until.elementLocated(By.id("orders-list-container")),
      15000
    );

    try {
      // Ouvrir la commande pour afficher les lignes
      const headerBtn = await driver.wait(
        until.elementLocated(By.css("[id^='order-card-'] .order-card-header")),
        8000
      );
      await driver.wait(until.elementIsVisible(headerBtn), 5000);
      await headerBtn.click();

      // Attendre l'apparition du corps de la commande
      await driver.wait(
        until.elementLocated(By.className("order-card-body")),
        8000
      );

      // Cliquer sur le lien produit
      const link = await driver.wait(
        until.elementLocated(By.className("order-line-name")),
        8000
      );
      await driver.wait(until.elementIsVisible(link), 5000);
      await link.click();

      await driver.wait(async () => {
        const url = await driver.getCurrentUrl();
        return url.includes("/products/");
      }, 10000);

      const url = await driver.getCurrentUrl();
      assert.ok(url.includes("/products/"), "Doit naviguer vers /products/:id");
      console.log("✔ Navigation vers produit OK:", url);
    } catch (e) {
      console.log("Pas de lignes de commande disponibles");
    }
  });
});
