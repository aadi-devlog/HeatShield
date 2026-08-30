import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function slowClick(page, selector) {
  try {
    const loc = page.locator(selector).first();
    await loc.scrollIntoViewIfNeeded({ timeout: 5000 });
    const box = await loc.boundingBox({ timeout: 5000 });
    if (box) {
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      await page.mouse.move(x, y, { steps: 25 });
      await page.waitForTimeout(300);
      await page.mouse.down();
      await page.waitForTimeout(150);
      await page.mouse.up();
      await page.waitForTimeout(500);
    } else {
      await loc.click({ timeout: 5000 });
    }
  } catch (err) {
    console.log(`Failed slowClick on ${selector}:`, err.message);
  }
}

async function slowHover(page, selector) {
  try {
    const loc = page.locator(selector).first();
    await loc.scrollIntoViewIfNeeded({ timeout: 5000 });
    const box = await loc.boundingBox({ timeout: 5000 });
    if (box) {
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      await page.mouse.move(x, y, { steps: 25 });
      await page.waitForTimeout(500);
    }
  } catch (err) {
    console.log(`Failed slowHover on ${selector}:`, err.message);
  }
}

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: './',
      size: { width: 1280, height: 720 },
    }
  });

  const page = await context.newPage();

  console.log('Navigating to app...');
  await page.goto('http://localhost:5173');
  
  // Wait for loading to finish
  await page.waitForSelector('text=Command Center', { state: 'visible', timeout: 60000 });

  // INJECT FAKE MOUSE CURSOR
  await page.evaluate(() => {
    const cursor = document.createElement('div');
    cursor.id = 'playwright-cursor';
    cursor.style.width = '24px';
    cursor.style.height = '24px';
    cursor.style.borderRadius = '50%';
    cursor.style.backgroundColor = 'rgba(255, 60, 60, 0.7)';
    cursor.style.border = '2px solid white';
    cursor.style.position = 'fixed';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '999999';
    cursor.style.transition = 'transform 0.1s ease';
    cursor.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    cursor.style.left = '-100px';
    cursor.style.top = '-100px';
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
      cursor.style.left = (e.clientX - 12) + 'px';
      cursor.style.top = (e.clientY - 12) + 'px';
    });
    document.addEventListener('mousedown', () => {
      cursor.style.transform = 'scale(0.7)';
      cursor.style.backgroundColor = 'rgba(255, 200, 0, 0.9)';
    });
    document.addEventListener('mouseup', () => {
      cursor.style.transform = 'scale(1)';
      cursor.style.backgroundColor = 'rgba(255, 60, 60, 0.7)';
    });
  });

  await page.mouse.move(640, 360);

  // 0:00-0:20
  console.log('0:00-0:20...');
  await slowHover(page, 'text=HeatShield AI');
  await page.waitForTimeout(18000);

  // 0:20-0:55
  console.log('0:20-0:55...');
  await slowHover(page, 'text=Environmental Conditions');
  await page.waitForTimeout(20000); // Shorter for speed in this re-record

  // 0:55-1:25
  console.log('0:55-1:25...');
  await slowClick(page, 'button:has-text("Facility Analysis")');
  await page.waitForSelector('text=Phoenix Logistics Hub', { state: 'visible', timeout: 10000 }).catch(e => console.log('Timeout Phoenix'));
  await slowHover(page, 'text=Phoenix Logistics Hub');
  await page.waitForTimeout(3000);
  
  console.log('Showing Why explanation...');
  await slowClick(page, 'button:has-text("Why?")');
  await page.waitForTimeout(15000);

  // 1:25-2:00
  console.log('1:25-2:00...');
  await slowHover(page, 'text=What Should We Do?');
  await page.waitForTimeout(15000);

  // 2:00-2:35
  console.log('2:00-2:35...');
  await slowHover(page, 'text=Operational Decision: Before vs. After');
  await page.waitForTimeout(15000);

  // 2:35-2:55
  console.log('2:35-2:55...');
  await slowClick(page, 'button:has-text("Demo")');
  await page.waitForTimeout(1000);
  
  await slowClick(page, 'button:has-text("Simulate Escalation")');
  await page.waitForTimeout(4000);
  
  await slowClick(page, 'button:has-text("Alerts")');
  await page.waitForSelector('text=Alert Center', { timeout: 10000 }).catch(e => {});
  await slowHover(page, 'text=Alert Center');
  await page.waitForTimeout(10000);

  // 2:55-3:10
  console.log('2:55-3:10...');
  await slowClick(page, 'button:has-text("Command Center")');
  await page.waitForSelector('text=Command Center', { timeout: 10000 }).catch(e => {});
  await slowHover(page, 'text=HeatShield AI');
  await page.waitForTimeout(10000);

  console.log('Closing context to save video...');
  const videoPath = await page.video().path();
  await context.close();
  await browser.close();

  const finalPath = path.resolve('HeatShield_AI_Hackathon_Demo.mp4');
  if (fs.existsSync(finalPath)) {
    fs.unlinkSync(finalPath);
  }
  fs.renameSync(videoPath, finalPath);
  console.log(`Video saved to ${finalPath}`);
})();
