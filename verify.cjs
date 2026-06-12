const puppeteer = require('puppeteer');
const fs = require('fs');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('Starting Puppeteer verification...');
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();

  const takeScreenshot = async (name) => {
    await page.screenshot({ path: `../${name}.png`, fullPage: true });
    console.log(`Saved screenshot: ${name}.png`);
  };

  try {


    // ==========================================
    // 2. Verify Admin OTP Flow
    // ==========================================
    console.log('\\n--- Testing Admin OTP Login ---');
    await page.goto('http://localhost:3000/#/admin-login', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[type="tel"]', { timeout: 10000 });
    await takeScreenshot('admin_login_page');

    await page.type('input[type="tel"]', '9999999999');
    await takeScreenshot('admin_login_filled');

    await page.click('button[type="submit"]'); // Send OTP
    await page.waitForSelector('input[type="text"]', { timeout: 10000 });
    await sleep(2000);
    await takeScreenshot('admin_otp_sent');

    // OTP is mocked as 123456
    const otpInputs = await page.$$('input[type="text"]');
    const otp = '123456';
    for (let i = 0; i < 6; i++) {
      if (otpInputs[i]) {
        await otpInputs[i].type(otp[i]);
      }
    }
    await takeScreenshot('admin_otp_filled');

    await page.click('button[type="submit"]'); // Verify & Login
    await page.waitForFunction(() => window.location.pathname.includes('/admin'), { timeout: 10000 });
    await sleep(3000);
    await takeScreenshot('admin_dashboard');
    
    // Logout
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    console.log('Admin OTP flow verified.');

    // ==========================================
    // 3. Verify Owner OTP Flow
    // ==========================================
    console.log('\n--- Testing Owner OTP Login ---');
    await page.goto('http://localhost:3000/#/partner/login', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[type="tel"]', { timeout: 10000 });
    
    await page.type('input[type="tel"]', '8888888888');
    await page.click('button[type="submit"]'); // Send OTP
    await page.waitForSelector('input[type="text"]', { timeout: 10000 });
    await sleep(2000);
    
    const otpInputsOwner = await page.$$('input[type="text"]');
    for (let i = 0; i < 6; i++) {
      if (otpInputsOwner[i]) {
        await otpInputsOwner[i].type(otp[i]);
      }
    }
    await takeScreenshot('owner_otp_filled');

    await page.click('button[type="submit"]'); // Verify & Login
    await page.waitForFunction(() => window.location.pathname.includes('/owner'), { timeout: 10000 });
    await sleep(3000);
    await takeScreenshot('owner_dashboard');

    console.log('Owner OTP flow verified.');
    console.log('\nAll flows tested successfully!');

  } catch (error) {
    console.error('Test failed:', error);
    await takeScreenshot('error_state');
  } finally {
    await browser.close();
  }
})();
