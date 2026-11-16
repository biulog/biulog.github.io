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
    // use static language pages so shared URLs have matching language previews.
    if (!/^\/biulog-app\//.test(current.pathname)) {
      target.pathname = chosen === 'zh' ? '/download/' : '/' + chosen + '/download/';
    }
    target.searchParams.set('lang', chosen);
    // A deliberate language change should leave time to read the chosen page.
    target.searchParams.set('preview', '1');
    link.href = target.href;
    if (chosen === language) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  const circleCopy = document.getElementById('circle-copy');
  const circleLink = document.getElementById('circle-link');
  if (!circleCopy || !circleLink) return;

  const circleLocales = {
    "zh": {
      "description": "BiuLog 爸媽圈可分享寶寶日常與育兒好物。",
      "heading": "爸媽聊天室與 BiuLog 爸媽圈",
      "copy": "爸媽圈可以分享寶寶日常與育兒好物。使用 3.3.5 或更新版本，登入後從爸媽聊天室進入。",
      "href": "/about/#parents-circle"
    },
    "en": {
      "description": "Share baby moments and parenting finds in BiuLog Parents Circle.",
      "heading": "Parent Chat and BiuLog Parents Circle",
      "copy": "Share baby moments and parenting finds in BiuLog Parents Circle. Use version 3.3.5 or later and open it from Parent Chat after signing in.",
      "href": "/en/#parents-circle"
    },
    "ja": {
      "description": "BiuLog パパママ広場で赤ちゃんの日常や育児用品の情報を共有できます。",
      "heading": "育児チャットと BiuLog パパママ広場",
      "copy": "BiuLog パパママ広場で赤ちゃんの日常や育児用品の情報をシェア。バージョン 3.3.5 以降でログインし、育児チャットから開けます。",
      "href": "/ja/#parents-circle"
    },
    "ko": {
      "description": "BiuLog 부모 모임에서 아기 일상과 육아용품 정보를 나눌 수 있어요.",
      "heading": "부모 채팅과 BiuLog 부모 모임",
      "copy": "BiuLog 부모 모임에서 아기 일상과 육아용품 정보를 나눠 보세요. 3.3.5 이상 버전에서 로그인 후 부모 채팅을 통해 들어갈 수 있어요.",
      "href": "/ko/#parents-circle"
    },
    "de": {
      "description": "Teile Babymomente und Tipps zu Babyartikeln im BiuLog Parents Circle.",
      "heading": "Elternchat und BiuLog Parents Circle",
      "copy": "Teile Babymomente und Tipps zu Babyartikeln im BiuLog Parents Circle. Melde dich ab Version 3.3.5 an und öffne ihn im Elternchat.",
      "href": "/de/#parents-circle"
    },
    "it": {
      "description": "Condividi i momenti del bebè e consigli sugli articoli per l’infanzia nel BiuLog Parents Circle.",
      "heading": "Chat genitori e BiuLog Parents Circle",
      "copy": "Condividi i momenti del bebè e consigli sugli articoli per l’infanzia nel BiuLog Parents Circle. Dalla versione 3.3.5, accedi e aprilo dalla chat genitori.",
      "href": "/it/#parents-circle"
    }
  };
  const circle = circleLocales[language] || circleLocales.en;
  circleCopy.textContent = circle.copy;
  circleLink.textContent = circle.heading;
  circleLink.href = circle.href;

  const descriptionMeta = document.querySelector('meta[name="description"]');
  const originalDescription = descriptionMeta.content;
  if (!originalDescription.endsWith(circle.description)) {
    const separator = originalDescription.endsWith('。') ? '' : ' ';
    const description = originalDescription + separator + circle.description;
    descriptionMeta.content = description;
    document.querySelector('meta[property="og:description"]').content = description;
    document.querySelector('meta[name="twitter:description"]').content = description;
    const appSchema = document.getElementById('app-schema');
    const schema = JSON.parse(appSchema.textContent);
    const app = schema['@graph'].find(item => item['@type'] === 'SoftwareApplication');
    app.description = description;
    appSchema.textContent = JSON.stringify(schema);
  }

})();
