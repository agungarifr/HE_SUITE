import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

export async function runCrawler({ url, cookies = [], onProgress = () => {} }) {
  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  onProgress(`[Crawler] Membuka browser stealth untuk: ${targetUrl}`);
  
  const functionalData = {
    url: targetUrl,
    pageTitle: '',
    isBotBlocked: false,
    blockReason: null,
    consoleErrors: [],
    networkErrors: [],
    pageErrors: [],
    interactiveElements: { inputs: [], buttons: [] },
    screenshotPath: null,
    screenshotBase64: null
  };

  let browser;
  try {
    // Launch with stealth & anti-detection flags
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--window-size=1440,900'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Mask puppeteer fingerprints
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="133", "Google Chrome";v="133"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"'
    });

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      window.chrome = { runtime: {} };
    });

    page.on('console', msg => {
      if (msg.type() === 'error') functionalData.consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => functionalData.pageErrors.push(err.message));
    page.on('requestfailed', req => {
      const fail = req.failure();
      if (fail) functionalData.networkErrors.push(`${req.method()} ${req.url()} - ${fail.errorText}`);
    });

    // Inject session cookies if provided (from Chrome Extension / Auth Bridge)
    if (Array.isArray(cookies) && cookies.length > 0) {
      onProgress(`[Crawler] Menginjeksi ${cookies.length} session cookies untuk otentikasi...`);
      try {
        const sanitized = cookies
          .filter(c => c && c.name && c.value)
          .map(c => {
            const clean = {
              name: String(c.name),
              value: String(c.value),
              path: c.path || '/'
            };
            if (c.domain) {
              clean.domain = c.domain.startsWith('.') ? c.domain.slice(1) : c.domain;
            } else {
              clean.url = targetUrl;
            }
            if (c.httpOnly !== undefined) clean.httpOnly = Boolean(c.httpOnly);
            if (c.secure !== undefined) clean.secure = Boolean(c.secure);
            if (['Strict', 'Lax', 'None'].includes(c.sameSite)) clean.sameSite = c.sameSite;
            return clean;
          });

        if (sanitized.length > 0) {
          await page.setCookie(...sanitized);
          onProgress(`[Crawler] Berhasil menginjeksi ${sanitized.length} cookies sesi!`);
        }
      } catch (ckErr) {
        onProgress(`[Crawler Warning] Sebagian cookies gagal diinjeksi (${ckErr.message}), lanjut navigasi...`);
      }
    }

    onProgress(`[Crawler] Mengunjungi halaman web (stealth mode)...`);
    
    // Use domcontentloaded for fast bypass without getting stuck on infinite trackers
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 25000 }).catch(e => {
      onProgress(`[Crawler Info] Melanjutkan proses (timeout/slow network): ${e.message}`);
    });

    await new Promise(r => setTimeout(r, 2000));

    // Check page title for WAF / Cloudflare blocks
    const title = await page.title().catch(() => '');
    functionalData.pageTitle = title;
    
    if (/cloudflare|just a moment|captcha|access denied|ddos|security check|verifikasi/i.test(title)) {
      functionalData.isBotBlocked = true;
      functionalData.blockReason = title;
      onProgress(`[Crawler Notice] Terdeteksi proteksi WAF/Captcha (${title}). Mengaktifkan Fallback Heuristik Berbasis Domain Knowledge...`);
    }

    // Screenshot capture with safe error handling
    try {
      onProgress(`[Crawler] Mengambil tangkapan layar web...`);
      const screenshotPath = path.join(process.cwd(), 'crawler_screenshot.png');
      const screenshotBuffer = await page.screenshot({ fullPage: false, type: 'jpeg', quality: 80 });
      await fs.writeFile(screenshotPath, screenshotBuffer).catch(() => {});
      functionalData.screenshotPath = screenshotPath;
      functionalData.screenshotBase64 = screenshotBuffer.toString('base64');
    } catch (ssErr) {
      onProgress(`[Crawler Info] Screenshot dilewati: ${ssErr.message}`);
    }

    // Extract interactive elements
    onProgress(`[Crawler] Menganalisis elemen interaktif DOM...`);
    const elements = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select, textarea')).map(el => ({
        tag: el.tagName.toLowerCase(),
        type: el.type || 'text',
        name: el.name || '',
        placeholder: el.placeholder || '',
        id: el.id || '',
        isVisible: el.offsetWidth > 0 && el.offsetHeight > 0
      }));

      const buttons = Array.from(document.querySelectorAll('button, a[role="button"], input[type="submit"]')).map(el => ({
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
    await fs.writeFile(reportPath, JSON.stringify(functionalData, null, 2)).catch(() => {});

    onProgress(`[Crawler] Selesai crawling & analisis DOM (${elements.buttons.length} tombol, ${elements.inputs.length} input terdeteksi).`);
  } catch (err) {
    onProgress(`[Crawler Info] ${err.message}. Lanjut ke evaluasi AI.`);
    functionalData.crawlerError = err.message;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }

  return functionalData;
}
