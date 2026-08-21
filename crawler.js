import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function crawl(targetUrl, id, pass) {
  console.log(`[Crawler] Starting evaluation for: ${targetUrl}`);
  
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1440, height: 900 });

  const functionalData = {
    url: targetUrl,
    consoleErrors: [],
    networkErrors: [],
    pageErrors: [],
    interactiveElements: [],
    knowledgeBase: {}
  };

  // 0. Load KMS (Knowledge Base) so AI is forced to use it as the source of truth
  try {
    const kbPath = path.join(__dirname, 'public', 'knowledge_base');
    const files = await fs.readdir(kbPath);
    for (const file of files) {
      if (file.endsWith('.md')) {
        const content = await fs.readFile(path.join(kbPath, file), 'utf-8');
        functionalData.knowledgeBase[file] = content;
      }
    }
    console.log(`[Crawler] Loaded ${Object.keys(functionalData.knowledgeBase).length} KMS rules.`);
  } catch (err) {
    console.log(`[Crawler] Warning: Could not load KMS: ${err.message}`);
  }

  // 1. Capture Console Errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      functionalData.consoleErrors.push(msg.text());
    }
  });

  // 2. Capture Uncaught Page Errors
  page.on('pageerror', err => {
    functionalData.pageErrors.push(err.message);
  });

  // 3. Capture Network Failures
  page.on('requestfailed', request => {
    const failure = request.failure();
    if (failure) {
      functionalData.networkErrors.push(`${request.method()} ${request.url()} - ${failure.errorText}`);
    }
  });

  try {
    console.log("[Crawler] Navigating to target...");
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Allow JS/SPA to finish rendering
    await new Promise(r => setTimeout(r, 2000));

    if (id && pass) {
      console.log("[Crawler] Credentials provided, looking for login link...");
      const loginLink = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a, button'));
        const login = links.find(el => el.textContent.toLowerCase().includes('login') || el.textContent.toLowerCase().includes('masuk'));
        if (login) {
          login.click();
          return true;
        }
        return false;
      });

      if (loginLink) {
        console.log("[Crawler] Login link clicked. Waiting for navigation...");
        await new Promise(r => setTimeout(r, 3000));
        
        console.log("[Crawler] Attempting to fill login form...");
        const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
        const passInput = await page.$('input[type="password"], input[name="password"]');
        
        if (emailInput && passInput) {
          await emailInput.type(id);
          await passInput.type(pass);
          
          const submitBtn = await page.$('button[type="submit"], form button');
          if (submitBtn) {
            await submitBtn.click();
            console.log("[Crawler] Form submitted. Waiting for navigation...");
            await new Promise(r => setTimeout(r, 3000));
          }
        } else {
          console.log("[Crawler] Could not find standard email/password inputs.");
        }
      } else {
        console.log("[Crawler] Could not find a login or masuk link on the landing page.");
      }
    }
    
    // 4. Capture Screenshot for UX Evaluation
    console.log("[Crawler] Capturing full page screenshot...");
    const screenshotPath = path.join(process.cwd(), 'crawler_screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // 5. Extract Interactive Elements DOM for Fuzzing/Functional Analysis
    console.log("[Crawler] Extracting interactive elements...");
    const elements = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select, textarea')).map(el => ({
        tag: el.tagName.toLowerCase(),
        type: el.type,
        name: el.name || '',
        id: el.id || '',
        placeholder: el.placeholder || '',
        isVisible: el.offsetWidth > 0 && el.offsetHeight > 0
      }));
      
      const buttons = Array.from(document.querySelectorAll('button, a.btn')).map(el => ({
        tag: el.tagName.toLowerCase(),
        text: el.innerText.trim().substring(0, 50),
        id: el.id || '',
        isVisible: el.offsetWidth > 0 && el.offsetHeight > 0
      }));

      return { inputs, buttons };
    });
    
    functionalData.interactiveElements = elements;

    // Save Functional Context
    console.log("[Crawler] Saving functional context...");
    const reportPath = path.join(process.cwd(), 'crawler_report.json');
    await fs.writeFile(reportPath, JSON.stringify(functionalData, null, 2));

    console.log("[Crawler] Done. Report saved to crawler_report.json and screenshot to crawler_screenshot.png");
  } catch (error) {
    console.error("[Crawler] Fatal error:", error);
  } finally {
    await browser.close();
  }
}

const url = process.argv[2];
const id = process.argv[3];
const pass = process.argv[4];

if (!url) {
  console.error("Usage: node crawler.js <URL> [ID] [PASS]");
  process.exit(1);
}

crawl(url, id, pass);
