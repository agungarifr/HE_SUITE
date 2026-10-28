// Background Service Worker for HE Suite Extension Bridge

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GET_TABS') {
    chrome.tabs.query({ windowType: 'normal' }, (tabs) => {
      const validTabs = (tabs || [])
        .filter(t => t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('edge://') && !t.url.startsWith('chrome-extension://'))
        .map(t => ({
          id: t.id,
          title: t.title || 'Untitled Tab',
          url: t.url,
          favIconUrl: t.favIconUrl || ''
        }));
      sendResponse({ success: true, tabs: validTabs });
    });
    return true; // async callback
  }

  if (request.action === 'GET_COOKIES') {
    const targetUrl = request.url;
    if (!targetUrl) {
      sendResponse({ success: false, error: 'URL target tidak diberikan' });
      return true;
    }

    try {
      const parsedUrl = new URL(targetUrl);
      chrome.cookies.getAll({ domain: parsedUrl.hostname }, (cookies) => {
        // Also fetch specific url cookies
        chrome.cookies.getAll({ url: targetUrl }, (urlCookies) => {
          const merged = [...(cookies || []), ...(urlCookies || [])];
          // Deduplicate by name and domain
          const uniqueMap = new Map();
          for (const c of merged) {
            const key = `${c.domain}:${c.name}:${c.path}`;
            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, c);
            }
          }
          sendResponse({ success: true, cookies: Array.from(uniqueMap.values()) });
        });
      });
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
    return true; // async callback
  }
});
