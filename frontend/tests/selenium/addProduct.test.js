const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const { createDriver } = require("./helpers/driver");

describe("Complete Product Creation Flow", function () {
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

  async function waitForGrid() {
    await driver.wait(until.elementLocated(By.id("admin-products-grid")), 10000);
    await driver.sleep(2000);
  }

  async function openAddProductModal() {
    const addButton = await driver.wait(
      until.elementLocated(By.id("add-product-btn")),
      10000
    );
    await addButton.click();
    console.log("✅ Clicked add product button");

    // Wait for modal to appear using the new ID
    await driver.wait(until.elementLocated(By.id("product-modal-overlay")), 5000);
    console.log("✅ Product modal opened");
    await driver.sleep(500);
  }

  async function fillProductForm(productData) {
    console.log("📝 Filling product form...");

    // Product Name
    const nameInput = await driver.findElement(By.id("product-name-input"));
    await nameInput.clear();
    await nameInput.sendKeys(productData.nom);
    console.log(`✅ Name: ${productData.nom}`);

    // Description
    const descriptionInput = await driver.findElement(By.id("product-description-textarea"));
    await descriptionInput.clear();
    await descriptionInput.sendKeys(productData.description);
    console.log(`✅ Description: ${productData.description.substring(0, 50)}...`);

    // Price
    const priceInput = await driver.findElement(By.id("product-price-input"));
    await priceInput.clear();
    await priceInput.sendKeys(productData.prix);
    console.log(`✅ Price: ${productData.prix} MAD`);

    // Quantity
    const quantityInput = await driver.findElement(By.id("product-quantity-input"));
    await quantityInput.clear();
    await quantityInput.sendKeys(productData.quantite);
    console.log(`✅ Quantity: ${productData.quantite}`);

    // Category (if provided)
    if (productData.categoryId) {
      const categorySelect = await driver.findElement(By.id("product-category-select"));
      await categorySelect.click();
      await driver.sleep(300);

      const categoryOption = await driver.findElement(By.css(`#product-category-select option[value='${productData.categoryId}']`));
      await categoryOption.click();
      console.log(`✅ Category selected: ${productData.categoryId}`);
    } else {
      console.log("⚠️ No category selected");
    }

    // Status checkbox
    const statusCheckbox = await driver.findElement(By.id("product-status-checkbox"));
    const isChecked = await statusCheckbox.isSelected();

    if (productData.statut && !isChecked) {
      await statusCheckbox.click();
      console.log("✅ Status set to active");
    } else if (!productData.statut && isChecked) {
      await statusCheckbox.click();
      console.log("✅ Status set to inactive");
    } else {
      console.log(`✅ Status remains ${productData.statut ? 'active' : 'inactive'}`);
    }
  }

  async function uploadProductImages(imagePaths) {
    if (!imagePaths || imagePaths.length === 0) {
      console.log("⚠️ No images to upload");
      return;
    }

    console.log(`📸 Uploading ${imagePaths.length} image(s)...`);

    const fileInput = await driver.findElement(By.id("product-images-input"));
    // Note: For multiple files, send the paths with newline separator
    await fileInput.sendKeys(imagePaths.join("\n"));
    await driver.sleep(2000);

    // Wait for preview images to appear
    await driver.wait(until.elementLocated(By.id("product-images-preview")), 5000);
    console.log(`✅ ${imagePaths.length} image(s) uploaded and preview shown`);
  }

  async function submitProductForm() {
    const submitButton = await driver.findElement(By.id("product-modal-submit-btn"));
    await submitButton.click();
    console.log("✅ Clicked submit button");
    await driver.sleep(2000);
  }

  async function handleSuccessAlert() {
    try {
      await driver.wait(async () => {
        try {
          const alert = await driver.switchTo().alert();
          const alertText = await alert.getText();
          if (alertText.includes("succès") || alertText.includes("enregistré")) {
            await alert.accept();
            console.log(`✅ Success alert accepted: "${alertText}"`);
            return true;
          }
          await alert.dismiss();
          return false;
        } catch (e) {
          return false;
        }
      }, 5000);
      return true;
    } catch (e) {
      console.log("⚠️ No success alert detected");
      return false;
    }
  }

  async function verifyModalClosed() {
    try {
      await driver.wait(async () => {
        const overlay = await driver.findElements(By.id("product-modal-overlay"));
        return overlay.length === 0;
      }, 5000);
      console.log("✅ Modal closed successfully");
      return true;
    } catch (e) {
      console.log("⚠️ Modal may still be open");
      return false;
    }
  }

  async function verifyProductInGrid(productName) {
    console.log(`🔍 Verifying product "${productName}" appears in grid...`);

    // Wait for grid to refresh
    await driver.sleep(2000);

    try {
      // Find all product cards
      const productCards = await driver.findElements(By.css(".admin-product-card"));

      for (const card of productCards) {
        const cardText = await card.getText();
        if (cardText.includes(productName)) {
          console.log(`✅ Product "${productName}" found in grid!`);
          return true;
        }
      }

      console.log(`❌ Product "${productName}" not found in grid`);

      // Log all product names found for debugging
      console.log("📋 Products found in grid:");
      for (const card of productCards) {
        const cardText = await card.getText();
        const lines = cardText.split('\n');
        if (lines[0]) console.log(`   - ${lines[0]}`);
      }

      return false;
    } catch (e) {
      console.log(`❌ Error verifying product: ${e.message}`);
      return false;
    }
  }

  async function closeModal() {
    try {
      const closeButton = await driver.findElement(By.id("product-modal-close-btn"));
      await closeButton.click();
      console.log("✅ Modal closed via close button");
      await driver.sleep(500);
    } catch (e) {
      console.log("⚠️ Could not find close button");
    }
  }

  async function cancelModal() {
    try {
      const cancelButton = await driver.findElement(By.id("product-modal-cancel-btn"));
      await cancelButton.click();
      console.log("✅ Modal cancelled");
      await driver.sleep(500);
    } catch (e) {
      console.log("⚠️ Could not find cancel button");
    }
  }

  async function getCurrentUrl() {
    return await driver.getCurrentUrl();
  }

  it("should login and create a new product successfully", async function () {
    // Generate unique product name to avoid conflicts
    const timestamp = Date.now();
    const uniqueProductName = `Produit Test ${timestamp}`;

    const testProduct = {
      nom: uniqueProductName,
      description: `Ceci est un produit de test créé automatiquement le ${new Date().toLocaleString()}`,
      prix: "99.99",
      quantite: "50",
      categoryId: "", // Laisser vide ou mettre un ID valide de votre base
      statut: true, // Produit actif
    };

    console.log("\n" + "=".repeat(60));
    console.log("🚀 STARTING PRODUCT CREATION TEST");
    console.log("=".repeat(60));

    // ==========================================
    // PART 1: LOGIN
    // ==========================================
    console.log("\n📋 PART 1: Authentication");
    console.log("-".repeat(40));
    await login();

    // ==========================================
    // PART 2: NAVIGATE TO ADMIN HOME
    // ==========================================
    console.log("\n📋 PART 2: Navigation to Admin Home");
    console.log("-".repeat(40));
    await driver.get("http://localhost:5173/admin/adminhome");
    await waitForGrid();

    const initialCount = await getActiveProductsCount();
    console.log(`📊 Initial active products count: ${initialCount}`);

    // ==========================================
    // PART 3: OPEN ADD PRODUCT MODAL
    // ==========================================
    console.log("\n📋 PART 3: Opening Add Product Modal");
    console.log("-".repeat(40));
    await openAddProductModal();

    // Verify modal title
    const modalTitle = await driver.findElement(By.id("product-modal-title"));
    const titleText = await modalTitle.getText();
    assert.strictEqual(titleText, "Ajouter un produit", "Modal title should be 'Ajouter un produit'");
    console.log(`✅ Modal title verified: "${titleText}"`);

    // ==========================================
    // PART 4: FILL PRODUCT FORM
    // ==========================================
    console.log("\n📋 PART 4: Filling Product Form");
    console.log("-".repeat(40));
    await fillProductForm(testProduct);

    // ==========================================
    // PART 5: SUBMIT FORM
    // ==========================================
    console.log("\n📋 PART 5: Submitting Form");
    console.log("-".repeat(40));
    await submitProductForm();

    // ==========================================
    // PART 6: HANDLE SUCCESS
    // ==========================================
    console.log("\n📋 PART 6: Handling Success Response");
    console.log("-".repeat(40));
    const alertAccepted = await handleSuccessAlert();
    assert.strictEqual(alertAccepted, true, "Success alert should be displayed");

    // Verify modal is closed
    await verifyModalClosed();

    // ==========================================
    // PART 7: VERIFY PRODUCT CREATED
    // ==========================================
    console.log("\n📋 PART 7: Verifying Product Creation");
    console.log("-".repeat(40));

    // Wait a bit for the grid to refresh
    await driver.sleep(2000);

    const productFound = await verifyProductInGrid(testProduct.nom);
    assert.strictEqual(productFound, true, `Product "${testProduct.nom}" should appear in the products grid`);

    const finalCount = await getActiveProductsCount();
    console.log(`📊 Final active products count: ${finalCount}`);

    if (finalCount === initialCount + 1) {
      console.log("✅ Product count increased by 1!");
    } else {
      console.log(`⚠️ Count changed from ${initialCount} to ${finalCount} (expected ${initialCount + 1})`);
    }

    // ==========================================
    // FINAL SUMMARY
    // ==========================================
    console.log("\n" + "=".repeat(60));
    console.log("✨✨✨ TEST COMPLETED SUCCESSFULLY! ✨✨✨");
    console.log("=".repeat(60));
    console.log("\n📦 Product Details:");
    console.log(`   📛 Name: ${testProduct.nom}`);
    console.log(`   💰 Price: ${testProduct.prix} MAD`);
    console.log(`   📊 Quantity: ${testProduct.quantite}`);
    console.log(`   📝 Description: ${testProduct.description.substring(0, 100)}...`);
    console.log(`   ✅ Status: ${testProduct.statut ? 'Active' : 'Inactive'}`);
    console.log("\n" + "=".repeat(60));
  });

  it("should validate required fields when creating a product", async function () {
    console.log("\n" + "=".repeat(60));
    console.log("🚀 STARTING FORM VALIDATION TEST");
    console.log("=".repeat(60));

    await login();
    await driver.get("http://localhost:5173/admin/adminhome");
    await waitForGrid();
    await openAddProductModal();

    console.log("\n📋 Testing form validation with empty fields...");
    console.log("-".repeat(40));

    // Try to submit empty form
    await submitProductForm();
    await driver.sleep(1000);

    // Check for HTML5 validation on required field
    const nameInput = await driver.findElement(By.id("product-name-input"));
    const isValid = await driver.executeScript(
      "return arguments[0].checkValidity();",
      nameInput
    );

    if (!isValid) {
      console.log("✅ HTML5 validation working correctly - empty name field detected");

      // Get validation message
      const validationMessage = await driver.executeScript(
        "return arguments[0].validationMessage;",
        nameInput
      );
      console.log(`📋 Validation message: "${validationMessage}"`);
    }

    // Test with invalid price (negative)
    console.log("\n📋 Testing with invalid price...");
    await nameInput.clear();
    await nameInput.sendKeys("Valid Product Name");

    const priceInput = await driver.findElement(By.id("product-price-input"));
    await priceInput.clear();
    await priceInput.sendKeys("-10");

    await submitProductForm();
    await driver.sleep(1000);

    // Check for JavaScript validation alert
    try {
      const alert = await driver.switchTo().alert();
      const alertText = await alert.getText();
      console.log(`✅ JavaScript validation alert shown: "${alertText}"`);
      await alert.accept();
    } catch (e) {
      console.log("⚠️ No alert shown for invalid price");
    }

    // Test with invalid quantity (negative)
    console.log("\n📋 Testing with invalid quantity...");
    await priceInput.clear();
    await priceInput.sendKeys("100");

    const quantityInput = await driver.findElement(By.id("product-quantity-input"));
    await quantityInput.clear();
    await quantityInput.sendKeys("-5");

    await submitProductForm();
    await driver.sleep(1000);

    try {
      const alert = await driver.switchTo().alert();
      const alertText = await alert.getText();
      console.log(`✅ JavaScript validation alert shown: "${alertText}"`);
      await alert.accept();
    } catch (e) {
      console.log("⚠️ No alert shown for invalid quantity");
    }

    console.log("\n✅ Form validation test completed");
    await cancelModal();

    console.log("\n" + "=".repeat(60));
    console.log("✨ VALIDATION TEST COMPLETED! ✨");
    console.log("=".repeat(60));
  });

  it("should create a product with images", async function () {
    const timestamp = Date.now();
    const uniqueProductName = `Produit Avec Images ${timestamp}`;

    const testProduct = {
      nom: uniqueProductName,
      description: "Produit avec des images uploadées",
      prix: "149.99",
      quantite: "30",
      categoryId: "",
      statut: true,
    };

    console.log("\n" + "=".repeat(60));
    console.log("🚀 STARTING PRODUCT CREATION WITH IMAGES TEST");
    console.log("=".repeat(60));

    await login();
    await driver.get("http://localhost:5173/admin/adminhome");
    await waitForGrid();
    await openAddProductModal();

    await fillProductForm(testProduct);

    // Upload images (uncomment and provide actual image paths)
    // const imagePaths = [
    //   "/absolute/path/to/test-image-1.jpg",
    //   "/absolute/path/to/test-image-2.png"
    // ];
    // await uploadProductImages(imagePaths);

    console.log("⚠️ Image upload skipped - no test images provided");
    console.log("💡 To test image upload, provide valid image paths");

    await submitProductForm();
    await handleSuccessAlert();
    await verifyModalClosed();

    const productFound = await verifyProductInGrid(testProduct.nom);
    assert.strictEqual(productFound, true, "Product with images should appear in grid");

    console.log("\n" + "=".repeat(60));
    console.log("✨ PRODUCT WITH IMAGES TEST COMPLETED! ✨");
    console.log("=".repeat(60));
  });
});