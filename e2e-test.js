import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/ELCOT/.gemini/antigravity/brain/08ec4342-6ed1-41e3-b37b-11d4e15802d9';
const SCREENSHOT_PATH = path.join(ARTIFACT_DIR, 'host_match_success.png');
const viteUrl = 'http://localhost:3000';

async function main() {
  console.log('=== STARTING END-TO-END VERIFICATION ===');
  
  // 1. Start Vite development server
  console.log('1. Starting local Vite server on port 3000...');
  const viteProcess = spawn('npm', ['run', 'dev'], {
    shell: true,
    cwd: process.cwd()
  });

  // Log Vite output in the background
  viteProcess.stdout.on('data', (data) => {
    // console.log('[Vite stdout]', data.toString().trim());
  });

  viteProcess.stderr.on('data', (data) => {
    // console.error('[Vite stderr]', data.toString().trim());
  });

  // Wait 3.5 seconds for Vite to be fully ready
  console.log('Waiting 3.5s for Vite server to boot...');
  await new Promise(resolve => setTimeout(resolve, 3500));

  // 2. Launch Puppeteer browser
  console.log('\n2. Launching headless browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Setup console error and request failure listeners
  const consoleErrors = [];
  const networkFailures = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[Console Error] ${msg.text()}`);
    }
  });

  page.on('requestfailed', (req) => {
    networkFailures.push(`[Network Failure] ${req.url()} (${req.failure().errorText})`);
  });

  page.on('dialog', async (dialog) => {
    consoleErrors.push(`[Alert/Dialog] ${dialog.message()}`);
    await dialog.dismiss();
  });

  try {
    // 3. Open Login page
    const loginUrl = `${viteUrl}/#/login`;
    console.log(`\n3. Loading login page: ${loginUrl}`);
    await page.goto(loginUrl, { waitUntil: 'networkidle2' });

    // 4. Click "Register" Tab
    console.log('4. Switching to Register tab...');
    const buttons = await page.$$('button');
    let registerTabBtn = null;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.trim().toLowerCase() === 'register') {
        registerTabBtn = btn;
        break;
      }
    }

    if (!registerTabBtn) {
      throw new Error('Register tab button not found');
    }
    await registerTabBtn.click();
    await new Promise(r => setTimeout(r, 1000)); // wait for transitions

    // 5. Fill Register form
    const randomSuffix = Math.floor(Math.random() * 1000000);
    const email = `e2e_player_${randomSuffix}@example.com`;
    const phone = String(9000000000 + Math.floor(Math.random() * 100000000));
    console.log(`5. Filling registration form (Email: ${email}, Phone: +91 ${phone})...`);

    // Wait for the full name input to appear after transition
    await page.waitForSelector('input[placeholder="Full Name"]', { visible: true, timeout: 5000 });
    await page.type('input[placeholder="Full Name"]', 'E2E Test Player');
    await page.type('input[placeholder="Email Address"]', email);
    await page.type('input[placeholder="Mobile Number"]', phone);
    
    await page.type('input[placeholder="Password (min 6 chars)"]', 'password123');
    await page.type('input[placeholder="Confirm Password"]', 'password123');

    // Click "CREATE ACCOUNT"
    console.log('Submitting registration form...');
    let createAccountBtn = null;
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.trim().toLowerCase() === 'create account') {
        createAccountBtn = btn;
        break;
      }
    }
    if (!createAccountBtn) {
      throw new Error('Create Account button not found');
    }
    await createAccountBtn.click();

    // Wait for localStorage token to populate
    console.log('Waiting for successful authentication and redirect...');
    await page.waitForFunction(() => {
      return localStorage.getItem('playnow_token') !== null;
    }, { timeout: 12000 });

    const token = await page.evaluate(() => localStorage.getItem('playnow_token'));
    const userObj = await page.evaluate(() => localStorage.getItem('playnow_user'));
    console.log('Authentication Successful!');
    console.log('Stored Token:', token.substring(0, 20) + '...');
    console.log('Stored User:', userObj);

    // 6. Navigate to Host Match Page
    const hostMatchUrl = `${viteUrl}/#/host-match`;
    console.log(`\n6. Navigating to Host Match page: ${hostMatchUrl}`);
    await page.goto(hostMatchUrl, { waitUntil: 'networkidle2' });

    // Step 1: Match Details
    console.log('7. Filling Step 1: Match Details...');
    await page.select('select', 'Football Turf');
    await page.type('input[placeholder="Search venue..."]', 'E2E Silicon Turf');
    await page.type('input[type="date"]', '2026-07-20');
    await page.type('input[type="time"]', '20:00');

    // Click Next
    console.log('Clicking Next to Step 2...');
    let nextBtn1 = await page.waitForSelector('button[type="submit"]');
    await nextBtn1.click();
    await new Promise(r => setTimeout(r, 600));

    // Step 2: Players & Split Cost
    console.log('8. Filling Step 2: Cost & Players...');
    
    // Clear and type totalAmount
    const totalAmountInput = await page.$('input[min="100"]');
    await totalAmountInput.click();
    await page.keyboard.press('End');
    for(let i=0; i<10; i++) await page.keyboard.press('Backspace');
    await totalAmountInput.type('1800');

    // Clear and type totalPlayers
    const totalPlayersInput = await page.$('input[min="2"]');
    await totalPlayersInput.click();
    await page.keyboard.press('End');
    for(let i=0; i<10; i++) await page.keyboard.press('Backspace');
    await totalPlayersInput.type('12');

    // Click Next
    console.log('Clicking Next to Step 3...');
    let nextBtn2 = await page.waitForSelector('button[type="submit"]');
    await nextBtn2.click();
    await new Promise(r => setTimeout(r, 600));

    // Step 3: Review & Publish
    console.log('9. Publishing Match...');
    let publishBtn = await page.waitForSelector('button[type="submit"]');
    await publishBtn.click();

    await new Promise(r => setTimeout(r, 2000));
    const domText = await page.evaluate(() => document.body.innerText);
    console.log('--- DOM TEXT AFTER PUBLISH CLICK ---');
    console.log(domText);
    console.log('------------------------------------');

    // 10. Wait for Step 4 (Success Screen)
    console.log('Waiting for Match Created Success Screen...');
    await page.waitForFunction(() => {
      return document.body.innerText.includes('Match Hosted Successfully!');
    }, { timeout: 15000 });

    console.log('Match Hosted Successfully detected on UI!');

    // Capture share link
    const matchLinkText = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('div'));
      const linkContainer = elements.find(el => el.innerText && el.innerText.includes('playnow.app/match/'));
      return linkContainer ? linkContainer.innerText.trim() : 'Link not found';
    });
    console.log('Generated Share Link:', matchLinkText);

    // Save screenshot
    console.log(`\nSaving success screen screenshot to: ${SCREENSHOT_PATH}`);
    await page.screenshot({ path: SCREENSHOT_PATH });
    console.log('Screenshot saved successfully!');

  } catch (err) {
    console.error('\n❌ E2E FLOW FAILED WITH ERROR:', err.message);
  } finally {
    // Close browser & Vite dev server
    console.log('\nCleaning up environment...');
    await browser.close();
    viteProcess.kill('SIGTERM');
    console.log('Headless browser closed. Vite server stopped.');
  }

  // Log summary of any failures
  console.log('\n=== E2E CONSOLE & NETWORK INTEGRITY REPORT ===');
  if (consoleErrors.length > 0) {
    console.log(`⚠️ Captured ${consoleErrors.length} console errors during flow:`);
    consoleErrors.forEach(err => console.log('  ', err));
  } else {
    console.log('✅ 0 Console errors detected.');
  }

  if (networkFailures.length > 0) {
    console.log(`⚠️ Captured ${networkFailures.length} network failures during flow:`);
    networkFailures.forEach(err => console.log('  ', err));
  } else {
    console.log('✅ 0 Network failures detected.');
  }
  console.log('=== END-TO-END VERIFICATION COMPLETED ===');
}

main();
