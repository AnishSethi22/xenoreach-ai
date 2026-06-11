const puppeteer = require('puppeteer');
const path = require('path');

async function capture() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const screens = [
    { name: 'Dashboard', url: 'http://localhost:3000/' },
    { name: 'Customer_360', url: 'http://localhost:3000/customers' },
    { name: 'Campaign_Builder', url: 'http://localhost:3000/campaigns/new' },
    { name: 'Analytics', url: 'http://localhost:3000/analytics' },
    { name: 'AI_Copilot', url: 'http://localhost:3000/insights' }
  ];

  for (const screen of screens) {
    console.log("Capturing " + screen.name + "...");
    try {
      await page.goto(screen.url, { waitUntil: 'networkidle2', timeout: 30000 });
      if (screen.name === 'Customer_360') {
        await page.waitForSelector('table tr:nth-child(2)', { timeout: 5000 }).catch(() => {});
        await page.click('table tr:nth-child(2)').catch(() => {});
        // using waitForFunction instead of waitForTimeout
        await new Promise(r => setTimeout(r, 2000));
      } else {
        await new Promise(r => setTimeout(r, 2000));
      }
      const filename = path.join(__dirname, screen.name + "_screenshot.png");
      await page.screenshot({ path: filename, fullPage: true });
      console.log("Saved " + filename);
    } catch (e) {
      console.error("Failed to capture " + screen.name + ":", e.message);
    }
  }

  await browser.close();
  console.log('Screenshots completed.');
}

capture().catch(console.error);
