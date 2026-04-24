const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { createDriver } = require("./helpers/driver");

describe("Order Scenario E2E Tests", function () {
  let driver;

  this.timeout(180000);

  // =========================
  // INIT DRIVER
  // =========================
  before(async function () {
    console.log("START DRIVER");
    driver = await createDriver();
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
  // SCÉNARIO E2E COMPLET
  // =========================
  it("should complete full purchase flow: login → product → cart → order", async function () {

    // =========================
    // 🔥 CLEAN STATE
    // =========================
    await driver.get("http://localhost:5173");

    await driver.executeScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await driver.manage().deleteAllCookies();
    await driver.navigate().refresh();

    // =========================
    // STEP 1 : Catalogue produits
    // =========================
    await driver.get("http://localhost:5173/products");

    const productGrid = await driver.wait(
      until.elementLocated(By.id("product-grid-container")),
      15000
    );
    await driver.wait(until.elementIsVisible(productGrid), 15000);

    console.log("✔ Étape 1 : grille produits chargée");

    // =========================
    // STEP 2 : Cliquer sur un produit
    // =========================
    const firstProductBtn = await driver.wait(
      until.elementLocated(By.css("[id^='product-card-'] button")),
      15000
    );
    await firstProductBtn.click();

    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return /\/products\/\w+/.test(url);
    }, 15000);

    const detailContainer = await driver.wait(
      until.elementLocated(By.id("product-details-container")),
      15000
    );
    await driver.wait(until.elementIsVisible(detailContainer), 15000);

    console.log("✔ Étape 2 : page détail produit OK");

    // =========================
    // STEP 3 : Ajouter au panier → redirection /login (non connecté)
    // Notre fix : pendingCart est sauvegardé dans localStorage avant le redirect
    // =========================
    const addToCartBtn = await driver.wait(
      until.elementLocated(By.id("product-details-add-btn")),
      15000
    );

    const isBtnEnabled = await addToCartBtn.isEnabled();
    assert.ok(isBtnEnabled, "Le bouton 'Ajouter au panier' doit être activé (produit en stock)");

    await addToCartBtn.click();

    // Après le clic, le frontend sauvegarde pendingCart dans localStorage
    // et redirige vers /login (car user non connecté)
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      console.log("  URL après add to cart:", url);
      return url.includes("/login");
    }, 15000);

    assert.ok(
      (await driver.getCurrentUrl()).includes("/login"),
      "Doit être redirigé vers /login après clic sur 'Ajouter au panier' sans être connecté"
    );

    console.log("✔ Étape 3 : redirection vers /login OK, pendingCart sauvegardé");

    // =========================
    // STEP 4 : Login
    // Après login : flushPendingCart() est appelé → produit ajouté en state
    //              → navigate("/cart") via SPA (state React préservé)
    // =========================
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

    const submitBtn = await driver.wait(
      until.elementLocated(By.id("login-submit-btn")),
      15000
    );
    await submitBtn.click();

    // Avec pendingCart : Login redirige vers /cart (navigation SPA, state préservé)
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      console.log("  URL après login:", url);
      return url.includes("/cart") || url.includes("/products") || url.includes("/admin");
    }, 20000);

    const afterLoginUrl = await driver.getCurrentUrl();
    console.log("✔ Étape 4 : login OK → URL:", afterLoginUrl);

    // =========================
    // STEP 5 : Panier — NE PAS recharger si déjà sur /cart
    // Un driver.get() ferait un full reload qui effacerait le state React (CartProvider)
    // =========================
    if (!afterLoginUrl.includes("/cart")) {
      // Cas rare : admin ou redirect inattendu — navigation SPA via lien navbar
      const cartLink = await driver.wait(
        until.elementLocated(By.css("a[href='/cart'], [data-testid='cart-link']")),
        10000
      );
      await cartLink.click();

      await driver.wait(async () => {
        const url = await driver.getCurrentUrl();
        return url.includes("/cart");
      }, 10000);
    }

    // Vérifier le container du panier
    const cartContainer = await driver.wait(
      until.elementLocated(By.id("cart-container")),
      15000
    );
    await driver.wait(until.elementIsVisible(cartContainer), 15000);

    // Vérifier qu'un article est présent (ajouté via pendingCart → flushPendingCart)
    const cartItem = await driver.wait(
      until.elementLocated(By.css("[id^='cart-item-']")),
      10000
    );
    await driver.wait(until.elementIsVisible(cartItem), 10000);

    console.log("✔ Étape 5 : produit présent dans le panier via pendingCart");

    // =========================
    // STEP 6 : Passer la commande
    // =========================
    const validateBtn = await driver.wait(
      until.elementLocated(By.id("cart-validate-btn")),
      15000
    );
    await driver.wait(until.elementIsVisible(validateBtn), 15000);
    await validateBtn.click();

    // Attendre que l'API traite la commande
    try {
      await driver.wait(async () => {
        const url = await driver.getCurrentUrl();
        return url.includes("/orders") || !url.includes("/cart");
      }, 10000);
    } catch (e) {
      // Pas de redirect automatique — on navigue manuellement vers /orders
    }

    console.log("✔ Étape 6 : commande envoyée");

    // =========================
    // STEP 7 : Vérifier la commande dans /orders
    // (full reload OK ici — la page charge depuis le backend)
    // =========================
 console.log("🔎 STEP 7 : ouverture /orders");

await driver.get("http://localhost:5173/orders");

const url = await driver.getCurrentUrl();
console.log("🔎 URL finale:", url);

// 🔥 DEBUG IMPORTANT
const html = await driver.getPageSource();
console.log("📄 contains orders-list-container ?", html.includes("orders-list-container"));
console.log("📄 contains order-card ?", html.includes("order-card"));
console.log("📄 HTML size:", html.length);

    const ordersContainer = await driver.wait(
      until.elementLocated(By.id("orders-list-container")),
      15000
    );
    await driver.wait(until.elementIsVisible(ordersContainer), 15000);

    const orderCard = await driver.wait(
      until.elementLocated(By.css("[id^='order-card-']")),
      15000
    );
    await driver.wait(until.elementIsVisible(orderCard), 15000);

    console.log("✔ Étape 7 : commande visible dans /orders");

    console.log("🎉 TEST COMPLET RÉUSSI");
  });
});
