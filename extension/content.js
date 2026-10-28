// Content Script injected into HE Suite web app

// 1. Mark presence of extension on DOM root for React detection
document.documentElement.setAttribute('data-he-suite-extension', 'true');
window.dispatchEvent(new CustomEvent('he-suite-extension-ready'));

// 2. Listen for messages from HE Suite React app
window.addEventListener('message', (event) => {
  // Only accept messages from the current page
  if (event.source !== window || !event.data || event.data.source !== 'HE_SUITE_PAGE') {
    return;
  }

  const { action, payload, requestId } = event.data;

  if (action === 'CHECK_EXTENSION') {
    window.postMessage({
      source: 'HE_SUITE_EXT',
      action: 'EXTENSION_PONG',
      version: '1.0.0',
      requestId
    }, '*');
  }

  if (action === 'GET_TABS') {
    chrome.runtime.sendMessage({ action: 'GET_TABS' }, (response) => {
      window.postMessage({
        source: 'HE_SUITE_EXT',
        action: 'TABS_RESPONSE',
        tabs: response?.tabs || [],
        requestId
      }, '*');
    });
  }

  if (action === 'GET_COOKIES') {
    chrome.runtime.sendMessage({ action: 'GET_COOKIES', url: payload?.url }, (response) => {
      window.postMessage({
        source: 'HE_SUITE_EXT',
        action: 'COOKIES_RESPONSE',
        cookies: response?.cookies || [],
        requestId
      }, '*');
    });
  }
});
