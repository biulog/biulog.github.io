(() => {
  'use strict';
  const current = new URL(window.location.href);
  const language = document.documentElement.lang === 'zh-Hant' ? 'zh' : document.documentElement.lang;
  const labels = { zh: '選擇語言', en: 'Choose a language', ja: '表示言語を選択', ko: '언어 선택', de: 'Sprache auswählen', it: 'Scegli la lingua' };
  const navigation = document.getElementById('download-languages');
  navigation.setAttribute('aria-label', labels[language] || labels.en);
  navigation.querySelectorAll('a[data-download-language]').forEach(link => {
    const chosen = link.getAttribute('data-download-language');
    const target = new URL(current.href);
    // Keep the advertising entry and its click ID intact. Other download links
    // use the static Japanese page so shared Japanese URLs have Japanese previews.
    if (!/^\/biulog-app\//.test(current.pathname)) {
      target.pathname = chosen === 'ja' ? '/ja/download/' : '/download/';
    }
    target.searchParams.set('lang', chosen);
    // A deliberate language change should leave time to read the chosen page.
    target.searchParams.set('preview', '1');
    link.href = target.href;
    if (chosen === language) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
})();
