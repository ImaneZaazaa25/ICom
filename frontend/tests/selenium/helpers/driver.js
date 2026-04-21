const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

async function createDriver() {
  const options = new chrome.Options();

  // IMPORTANT pour éviter blocage Windows
  options.addArguments("--start-maximized");
  options.addArguments("--disable-dev-shm-usage");
  options.addArguments("--no-sandbox");

  return await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
}

module.exports = { createDriver };