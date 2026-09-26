(() => {
  'use strict';
  const localized = {
    zh: { explore:'看看 BiuLog 怎麼陪你', pause:'暫停動態', resume:'開啟動態', caption:'小小日常，慢慢收藏。', more:'展開成長手冊的更多畫面', parentMore:'查看家長端照護畫面', finale:'今天的小事，都是未來的珍藏。', gallery:'選擇要查看的功能', detail:'探索所有功能', hero:'把育兒日常，\n留成成長故事。' },
    en: { explore:'Meet your everyday companion', pause:'Pause motion', resume:'Enable motion', caption:'Little moments, lovingly kept.', more:'Explore more growth journal screens', parentMore:'See the parent care screens', finale:'Small moments today. Memories for tomorrow.', gallery:'Choose a feature to explore', detail:'Explore all features' },
    ja: { explore:'BiuLog のある毎日を見てみる', pause:'動きを止める', resume:'動きを有効に', caption:'小さな毎日を、大切な記録に。', more:'成長手帳の画面をもっと見る', parentMore:'保護者向けケア画面を見る', finale:'今日の小さなできごとが、未来の宝物に。', gallery:'見たい機能を選ぶ', detail:'すべての機能を見る', hero:'育児の毎日を、\n成長の物語に。' },
    ko: { explore:'BiuLog와 함께하는 하루', pause:'동작 멈추기', resume:'동작 켜기', caption:'작은 일상을 소중한 기록으로.', more:'성장 수첩 화면 더 보기', parentMore:'보호자 돌봄 화면 보기', finale:'오늘의 작은 순간이 내일의 추억으로.', gallery:'살펴볼 기능 선택', detail:'모든 기능 살펴보기' },
    de: { explore:'BiuLog im Alltag entdecken', pause:'Animation pausieren', resume:'Animation aktivieren', caption:'Kleine Momente liebevoll bewahren.', more:'Weitere Ansichten im Wachstumsbuch', parentMore:'Betreuungsansichten für Eltern', finale:'Kleine Momente heute. Erinnerungen für morgen.', gallery:'Funktion auswählen', detail:'Alle Funktionen entdecken' },
    it: { explore:'Scopri una giornata con BiuLog', pause:'Ferma animazioni', resume:'Attiva animazioni', caption:'Piccoli momenti da custodire.', more:'Altre schermate del diario di crescita', parentMore:'Le schermate per i genitori', finale:'Piccoli momenti oggi. Ricordi per domani.', gallery:'Scegli una funzione', detail:'Esplora tutte le funzioni' }
  };
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let manuallyPaused = false;
  let currentLang = 'zh';
  let selectedScreen = 0;
  let revealObserver;
  const toolbar = document.querySelector('.experience-toolbar');
  const motionButton = toolbar.querySelector('.motion-toggle');
  const gallery = document.getElementById('screenGallery');
  const showcase = document.querySelector('.showcase');
  const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  function resetTilt() {
    showcase.style.removeProperty('--tilt-x');
    showcase.style.removeProperty('--tilt-y');
  }
  showcase.addEventListener('pointermove',event => {
    if (manuallyPaused || motionPreference.matches || !precisePointer.matches) return;
    const bounds = showcase.getBoundingClientRect();
    const x = Math.max(-1,Math.min(1,(event.clientX-bounds.left)/bounds.width*2-1));
    const y = Math.max(-1,Math.min(1,(event.clientY-bounds.top)/bounds.height*2-1));
    showcase.style.setProperty('--tilt-x',`${-y*3}deg`);
    showcase.style.setProperty('--tilt-y',`${x*4}deg`);
  },{passive:true});
  showcase.addEventListener('pointerleave',resetTilt);

  function updateMotion() {
    const paused = manuallyPaused || motionPreference.matches;
    document.body.classList.toggle('motion-paused', paused);
    document.documentElement.classList.toggle('motion-paused', paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.textContent = paused ? localized[currentLang].resume : localized[currentLang].pause;
    // System reduced motion remains authoritative, including when toggled while open.
    motionButton.disabled = motionPreference.matches;
    if (paused) {
      resetTilt();
      document.querySelectorAll('.reveal-ready').forEach(node => node.classList.add('is-visible'));
    }
  }

  motionButton.addEventListener('click', () => {
    manuallyPaused = !manuallyPaused;
    updateMotion();
  });
  motionPreference.addEventListener('change', updateMotion);

  function decorateReveals() {
    if (revealObserver) revealObserver.disconnect();
    if (!('IntersectionObserver' in window) || motionPreference.matches || manuallyPaused) return;
    revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }, { threshold:0.06, rootMargin:'0px 0px 24px 0px' });
    document.querySelectorAll('.section-head,.feature,.family-proof-head,.parent-care-head,.note,.pricing,.download-finale').forEach((node,index) => {
      // Content already on-screen remains readable, including after a locale change.
      const box = node.getBoundingClientRect();
      if (box.top < window.innerHeight) return;
      node.classList.add('reveal-ready');
      node.style.setProperty('--reveal-delay', `${node.classList.contains('feature') ? index % 3 * 55 : 0}ms`);
      revealObserver.observe(node);
    });
  }

  function buildExplorer(lang) {
    const shots = copy[lang].shots;
    const labels = localized[lang];
    gallery.className = 'screen-explorer';
    gallery.replaceChildren();
    const content = document.createElement('div');
    const choices = document.createElement('div');
    choices.className = 'screen-selector';
    choices.setAttribute('role','tablist');
    choices.setAttribute('aria-label',labels.gallery);
    const panel = document.createElement('div');
    panel.id = 'screen-panel';
    panel.setAttribute('role','tabpanel');
    panel.tabIndex = 0;
    const count = document.createElement('span');
    count.className = 'explorer-index';
    const title = document.createElement('h3');
    title.className = 'explorer-title';
    const description = document.createElement('p');
    description.className = 'explorer-description';
    const more = document.createElement('a');
    more.className = 'cta secondary explorer-more';
    more.href = '#features';
    more.textContent = `${labels.detail} ↓`;
    const visual = document.createElement('div');
    visual.className = 'explorer-visual';
    const frame = document.createElement('div');
    frame.className = 'explorer-phone';
    const img = document.createElement('img');
    img.width = 1290;
    img.height = 2796;
    img.loading = 'lazy';
    img.decoding = 'async';
    frame.append(img);
    visual.append(frame);
    panel.append(count,title,description,more);
    content.append(choices,panel);
    gallery.append(content,visual);
    function select(index,focus = false) {
      selectedScreen = index;
      Array.from(choices.children).forEach((button,i) => {
        button.setAttribute('aria-selected',String(i === index));
        button.tabIndex = i === index ? 0 : -1;
      });
      const [name,body] = shots[index];
      count.textContent = `${String(index+1).padStart(2,'0')} / ${String(shots.length).padStart(2,'0')}`;
      title.textContent = name;
      description.textContent = body;
      img.src = imagePath(lang,index+1);
      img.alt = name;
      panel.setAttribute('aria-labelledby',`screen-tab-${index}`);
      visual.classList.remove('is-changing');
      // Recreate only the image to restart its finite entry animation, without timers.
      const nextImage = img.cloneNode();
      frame.replaceChildren(nextImage);
      visual.classList.add('is-changing');
      if (focus) choices.children[index].focus();
    }
    shots.forEach(([name],index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.id = `screen-tab-${index}`;
      button.textContent = name;
      button.setAttribute('role','tab');
      button.setAttribute('aria-controls','screen-panel');
      button.addEventListener('click',() => select(index));
      button.addEventListener('keydown',event => {
        let next;
        if (event.key === 'ArrowRight') next = (index+1)%shots.length;
        else if (event.key === 'ArrowLeft') next = (index-1+shots.length)%shots.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = shots.length-1;
        if (next !== undefined) { event.preventDefault(); select(next,true); }
      });
      choices.append(button);
    });
    select(Math.min(selectedScreen,shots.length-1));
  }

  function refresh(lang) {
    currentLang = localized[lang] ? lang : 'zh';
    const labels = localized[currentLang];
    document.querySelectorAll('[data-experience]').forEach(node => {
      node.textContent = labels[node.dataset.experience] || '';
    });
    if (labels.hero) document.querySelector('h1').textContent = labels.hero;
    // Use the existing real app screenshot in the central phone where localized.
    const heroImage = document.getElementById('heroShot');
    if (['zh','en','ja','ko'].includes(lang)) heroImage.src = `/assets/showcase/${lang}/family-home.webp`;
    heroImage.alt = copy[lang].shots[0][0];
    document.querySelectorAll('[data-lang]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.lang === lang)));
    buildExplorer(currentLang);
    updateMotion();
    decorateReveals();
  }
  document.addEventListener('biulog:language',event => refresh(event.detail.lang));
  refresh(detectLanguage());
})();
