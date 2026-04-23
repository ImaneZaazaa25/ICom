const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
require("chromedriver");

async function createDriver() {
  const options = new chrome.Options();

  options.addArguments("--start-maximized");
  options.addArguments("--disable-gpu");

  // 🔥 SUPPRESSION des popups Chrome (password manager, safety check, etc.)
  options.addArguments("--disable-notifications");
  options.addArguments("--disable-infobars");
  options.addArguments("--disable-popup-blocking");

  options.addArguments("--no-default-browser-check");
  options.addArguments("--no-first-run");

  options.addArguments("--disable-save-password-bubble");
  options.addArguments("--disable-extensions");

  // 🔥 désactive le password manager
  options.setUserPreferences({
    "credentials_enable_service": false,
    "profile.password_manager_enabled": false,
  });

  return await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
}

module.exports = { createDriver };