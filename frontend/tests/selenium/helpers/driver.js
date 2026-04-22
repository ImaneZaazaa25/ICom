const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
require("chromedriver"); // 🔥 IMPORTANT

async function createDriver() {
  const options = new chrome.Options();

  options.addArguments("--start-maximized");
  options.addArguments("--disable-gpu");

  return await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
}

module.exports = { createDriver };