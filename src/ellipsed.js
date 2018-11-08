/*
 *   Copyright (C) 2017  Nicola Zambello
 *
 *    The JavaScript code in this page is open source software licensed under MIT license
 *    References about this code and its license, see:
 *
 *    https://github.com/nzambello/ellipsed
 *
 */

function tokensReducer(acc, token) {
  const { el, elStyle, elHeight, rowsLimit, rowsWrapped, options } = acc;
  if (rowsWrapped === rowsLimit + 1) {
    return { ...acc };
  }
  const textBeforeWrap = el.textContent;
  let newRowsWrapped = rowsWrapped;
  let newHeight = elHeight;
  el.innerHTML = el.innerHTML.length
    ? `${el.innerHTML}${options.delimiter}${token}${options.replaceStr}`
    : `${token}${options.replaceStr}`;

  if (parseFloat(elStyle.height) > parseFloat(elHeight)) {
    newRowsWrapped++;
    newHeight = elStyle.height;

    if (newRowsWrapped === rowsLimit + 1) {
      el.innerHTML =
        textBeforeWrap[textBeforeWrap.length - 1] === '.' && options.replaceStr === '...'
          ? `${textBeforeWrap}..`
          : `${textBeforeWrap}${options.replaceStr}`;

      return { ...acc, elHeight: newHeight, rowsWrapped: newRowsWrapped };
    }
  }

  el.textContent = textBeforeWrap.length ? `${textBeforeWrap}${options.delimiter}${token}` : `${token}`;

  return { ...acc, elHeight: newHeight, rowsWrapped: newRowsWrapped };
}

function ellipsis(selector = '', rows = 1, options = {}) {
  const defaultOptions = {
    replaceStr: '...',
    responsive: false,
    debounceDelay: 250,
    delimiter: ' ',
  };

  const opts = { ...defaultOptions, ...options };

  const elements = document.querySelectorAll(selector);
  const originalTexts = [];

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    originalTexts[i] = el.innerHTML;
    const splittedText = el.innerHTML.split(opts.delimiter);

    el.innerHTML = '';
    const elStyle = window.getComputedStyle(el);

    splittedText.reduce(tokensReducer, {
      el,
      elStyle,
      elHeight: 0,
      rowsLimit: rows,
      rowsWrapped: 0,
      options: opts,
    });
  }

  if (opts.responsive) {
    let resizeTimeout = false;

    const resizeHandler = () => {
      for (let i = 0; i < elements.length; i++) {
        elements[i].innerHTML = originalTexts[i];
      }
      ellipsis(selector, rows, { ...options, responsive: false });
    };

    const resizeListener = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeHandler, opts.debounceDelay);
    };

    window.addEventListener('resize', resizeListener);

    return resizeListener;
  }
}

function disableResponsive(listener) {
  window.removeEventListener('resize', listener);
}

export { disableResponsive, ellipsis };
