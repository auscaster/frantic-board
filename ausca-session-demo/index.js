const { Ausca } = require('ausca');
const path = require('path');

async function runAuscaSession() {
  console.log('Starting Ausca Browser Session...');

  let ausca;
  try {
    // Initialize Ausca with a default browser (Chromium)
    ausca = new Ausca();
    await ausca.init();
    console.log('Ausca initialized successfully.');

    // Launch a new browser context
    const page = await ausca.browser.newPage();
    console.log('New browser page launched.');

    // Navigate to a website
    const targetUrl = 'https://www.google.com';
    console.log(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    console.log(`Successfully navigated to ${targetUrl}.`);

    // Take a screenshot
    const screenshotPath = path.join(__dirname, 'google_homepage.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to ${screenshotPath}`);

    // Perform a simple interaction: type into the search box and press Enter
    console.log('Typing "Ausca browser automation" into the search box...');
    await page.fill('textarea[name="q"]', 'Ausca browser automation');
    await page.press('textarea[name="q"]', 'Enter');
    console.log('Search performed.');

    // Wait for navigation after search
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    console.log('Navigated to search results page.');

    // Take another screenshot of the search results
    const searchResultsScreenshotPath = path.join(__dirname, 'google_search_results.png');
    await page.screenshot({ path: searchResultsScreenshotPath });
    console.log(`Search results screenshot saved to ${searchResultsResultsScreenshotPath}`);

    console.log('Ausca Browser Session completed successfully.');

  } catch (error) {
    console.error('An error occurred during the Ausca session:', error);
    process.exit(1);
  } finally {
    // Close the browser
    if (ausca) {
      await ausca.close();
      console.log('Ausca browser closed.');
    }
  }
}

runAuscaSession();
