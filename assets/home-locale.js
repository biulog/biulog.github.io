(() => {
  'use strict';
  const paths = { zh: '/', en: '/en/', ja: '/ja/', ko: '/ko/', de: '/de/', it: '/it/' };
  const current = new URL(window.location.href);
  const requested = current.searchParams.get('lang');
  if (Object.hasOwn(paths, requested)) {
    const target = new URL(current.href);
    target.pathname = paths[requested];
    target.searchParams.delete('lang');
    if (target.href !== current.href) window.location.replace(target.href);
  }
  // Keep campaign parameters and the section anchor on explicit language switches.
  const updateLanguageLinks = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete('lang');
    document.querySelectorAll('a[data-lang]').forEach(link => {
      const target = new URL(link.getAttribute('href'), window.location.origin);
      target.search = params.toString();
      target.hash = window.location.hash;
      link.href = target.href;
    });
  };
  document.addEventListener('DOMContentLoaded', updateLanguageLinks);
  window.addEventListener('hashchange', updateLanguageLinks);
  window.addEventListener('popstate', updateLanguageLinks);
})();
