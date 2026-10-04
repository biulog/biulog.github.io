(() => {
  'use strict';
  // URL-only attribution for owned social posts. No network, cookies or storage.
  // Apple provider token was generated in App Store Connect on 2026-10-05.
  const campaigns = Object.freeze({ threads: 'threads_organic', x: 'x_organic', site: 'site_organic' });
  const approvedCampaigns = new Set([...Object.values(campaigns), 'handoff_20261005']);
  const approvedMedia = new Set(['social', 'organic_social', 'referral']);
  const marketingKeys = ['utm_source', 'utm_medium', 'utm_campaign'];
  const languages = new Set(['zh_TW', 'en', 'ja', 'ko', 'de', 'it']);
  const ownedPaths = /^\/(?:$|(?:en|ja|ko|de|it|about|download|biulog-app)\/$|guides\/(?:[a-z0-9-]+\/)?)$/;

  function context() {
    const params = new URLSearchParams(window.location.search);
    // Even a malformed/duplicate OpenAI click ID keeps the original route intact.
    if (params.has('oppref') || marketingKeys.some(key => params.getAll(key).length > 1)) return null;
    const source = params.get('utm_source');
    if (!Object.hasOwn(campaigns, source)) return null;
    const medium = params.get('utm_medium');
    const campaign = params.get('utm_campaign');
    if ((medium !== null && !approvedMedia.has(medium)) ||
        (campaign !== null && !approvedCampaigns.has(campaign))) return null;
    return { source, medium: medium || (source === 'site' ? 'referral' : 'organic_social'),
      campaign: campaign || campaigns[source] };
  }

  function protectReferrer() {
    // Protect marked auto-redirects as well as manually clicked store links.
    // No current URL or document.referrer is sent as an attribution parameter.
    if (!document.head.querySelector('meta[data-biulog-social-referrer]')) {
      const meta = document.createElement('meta');
      meta.name = 'referrer';
      meta.content = 'no-referrer';
      meta.setAttribute('data-biulog-social-referrer', '');
      document.head.appendChild(meta);
    }
  }

  function storeUrl(raw) {
    const mark = context();
    if (!mark) return raw;
    const url = new URL(raw, window.location.origin);
    if (url.protocol !== 'https:' || url.username || url.password) return raw;
    let target;
    if (url.hostname === 'apps.apple.com' && /\/id6766629143$/.test(url.pathname)) {
      target = new URL(url.origin + url.pathname);
      target.searchParams.set('pt', '128852368');
      target.searchParams.set('ct', campaigns[mark.source]);
      target.searchParams.set('mt', '8');
    } else if (url.hostname === 'play.google.com' && url.pathname === '/store/apps/details' &&
        url.searchParams.getAll('id').length === 1 && url.searchParams.get('id') === 'com.chy.biulog') {
      target = new URL('https://play.google.com/store/apps/details');
      target.searchParams.set('id', 'com.chy.biulog');
      const locale = url.searchParams.get('hl');
      if (languages.has(locale)) target.searchParams.set('hl', locale);
      // Same nested encoding as Google's official Play Campaign URL Builder.
      const referrer = new URLSearchParams({ utm_source: mark.source,
        utm_medium: mark.source === 'site' ? 'referral' : 'organic_social',
        utm_campaign: campaigns[mark.source] });
      target.searchParams.set('referrer', referrer.toString());
    } else return raw;
    protectReferrer();
    return target.href;
  }

  function decorateLink(link) {
    const mark = context();
    if (!mark) return;
    const raw = link.getAttribute('href');
    if (!raw || raw.startsWith('#') || link.hasAttribute('download')) return;
    const store = storeUrl(raw);
    if (store !== raw) {
      link.href = store;
      link.referrerPolicy = 'no-referrer';
      return;
    }
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin || !ownedPaths.test(url.pathname) || url.searchParams.has('oppref')) return;
    // Preserve a link's own explicit campaign. Never transfer arbitrary incoming query values.
    if (marketingKeys.some(key => url.searchParams.has(key))) return;
    url.searchParams.set('utm_source', mark.source);
    url.searchParams.set('utm_medium', mark.medium);
    url.searchParams.set('utm_campaign', mark.campaign);
    link.href = url.href;
  }

  function decorate() {
    if (!context()) return;
    document.querySelectorAll('a[href]').forEach(link => {
      try { decorateLink(link); } catch (_) { /* Native link stays usable. */ }
    });
  }

  window.BiuLogSocialAttribution = Object.freeze({ storeUrl });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', decorate);
  else decorate();
  // Covers existing page scripts updating links after the first render; never intercept navigation.
  for (const eventName of ['click', 'auxclick']) document.addEventListener(eventName, event => {
    const link = event.target.closest && event.target.closest('a[href]');
    if (link) try { decorateLink(link); } catch (_) { /* Keep native fallback. */ }
  }, true);
})();
