import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

export async function runCrawler({ url, onProgress = () => {} }) {
  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  onProgress(`[Crawler] Membuka browser untuk: ${targetUrl}`);
  
  const functionalData = {
    url: targetUrl,
    consoleErrors: [],
    networkErrors: [],
    pageErrors: [],
    interactiveElements: { inputs: [], buttons: [] },
    screenshotPath: null,
    screenshotBase64: null
  };

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    page.on('console', msg => {
      if (msg.type() === 'error') functionalData.consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => functionalData.pageErrors.push(err.message));
    page.on('requestfailed', req => {
      const fail = req.failure();
      if (fail) functionalData.networkErrors.push(`${req.method()} ${req.url()} - ${fail.errorText}`);
    });

    onProgress(`[Crawler] Mengunjungi halaman web...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 35000 }).catch(e => {
      onProgress(`[Crawler Warning] Navigasi lambat atau timeout, lanjut proses evaluasi: ${e.message}`);
    });

    await new Promise(r => setTimeout(r, 1500));

    // Screenshot
    onProgress(`[Crawler] Mengambil tangkapan layar full-page...`);
    const screenshotPath = path.join(process.cwd(), 'crawler_screenshot.png');
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    await fs.writeFile(screenshotPath, screenshotBuffer);
    functionalData.screenshotPath = screenshotPath;
    functionalData.screenshotBase64 = screenshotBuffer.toString('base64');

    // Extract interactive elements
    onProgress(`[Crawler] Menganalisis elemen interaktif DOM...`);
    const elements = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select, textarea')).map(el => ({
        tag: el.tagName.toLowerCase(),
        type: el.type,
        name: el.name || '',
        id: el.id || '',
        placeholder: el.placeholder || '',
        isVisible: el.offsetWidth > 0 && el.offsetHeight > 0
      }));
      const buttons = Array.from(document.querySelectorAll('button, a.btn, input[type="submit"]')).map(el => ({
        tag: el.tagName.toLowerCase(),
        text: (el.innerText || el.value || '').trim().substring(0, 50),
        id: el.id || '',
        isVisible: el.offsetWidth > 0 && el.offsetHeight > 0
      }));
      return { inputs, buttons };
    }).catch(() => ({ inputs: [], buttons: [] }));

    functionalData.interactiveElements = elements;

    // Save report to disk
    const reportPath = path.join(process.cwd(), 'crawler_report.json');
    await fs.writeFile(reportPath, JSON.stringify(functionalData, null, 2));

    onProgress(`[Crawler] Selesai crawling & capturing.`);
  } catch (err) {
    onProgress(`[Crawler Error] ${err.message}`);
    functionalData.crawlerError = err.message;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }

  return functionalData;
}
