declare var process: any;
/** Is currently node  */
export const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

/** Is currently a browser */
export const isBrowser = !isNode;

/**
 * Check if current browser is Chrome
 */
export const isBrowserChrome = () => {
  if (!isBrowser) {
    return false;
  }

  const ua = window.navigator.userAgent;
  const isChrome = /Chrome/i.test(ua) && !/Edge/i.test(ua);

  return isChrome;
};

/**
 * Check if current browser is Firefox
 */
export const isBrowserFirefox = () => {
  if (!isBrowser) {
    return false;
  }
  const ua = window.navigator.userAgent;
  const isFirefox = /Firefox/i.test(ua);

  return isFirefox;
};

/**
 * Check if current browser is IE
 */
export const isBrowserIE = () => {
  if (!isBrowser) {
    return false;
  }
  const ua = window.navigator.userAgent;
  const isIE = /MSIE|Trident/.test(ua);

  return isIE;
};

/**
 * Check if current browser is a mobile browser
 */
export const isBrowserMobile = () => {
  if (!isBrowser) {
    return false;
  }
  const ua = window.navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);

  return isMobile;
};
