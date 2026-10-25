const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

async function loadJournal() {
  const body = document.body;
  const root = new URL(body.dataset.siteRoot || './', document.baseURI);
  const response = await fetch(new URL('models.json', root));
  if (!response.ok) throw new Error('Journal data is unavailable');
  const entries = await response.json();
  const homeRoot = new URL('./', root);
  const imageUrl = entry => new URL(entry.image, root).href;
  const href = entry => new URL(entry.categoryPath, root).href;

  if (body.dataset.page === 'home') {
    document.getElementById('home-feed').innerHTML = entries.map((entry, index) => `
      <article class="feed-card" id="story-${escapeHtml(entry.slug)}">
        <a class="feed-image" href="${href(entry)}"><img src="${imageUrl(entry)}" alt="${escapeHtml(entry.alt)}" loading="${index ? 'lazy' : 'eager'}"><span class="image-label">ORIGINAL EDITORIAL ARTWORK</span></a>
        <div class="feed-copy"><p class="eyebrow">${escapeHtml(entry.categoryLabel)} <span>·</span> FICTIONAL STORY</p><h3><a href="${href(entry)}">${escapeHtml(entry.title)}</a></h3><p>${escapeHtml(entry.teaser)}</p><a class="read-story" href="${href(entry)}">Read the story <span aria-hidden="true">↗</span></a></div>
      </article>`).join('');
    return;
  }

  const entry = entries.find(item => item.slug === body.dataset.category);
  const target = document.getElementById('category-story');
  if (!entry || !target) throw new Error('Category not found');
  let terabox = '';
  try {
    const parsedLink = new URL(entry.terabox);
    if (parsedLink.protocol === 'https:' && parsedLink.hostname === 'www.terabox.app') terabox = parsedLink.href;
  } catch { /* Keep the link button unavailable until a valid TerraBox URL is configured. */ }
  document.title = `${entry.label}: ${entry.title} — Model Journal`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', entry.teaser);
  target.innerHTML = `
    <div class="story-layout">
      <article class="story-article">
        <div class="story-heading"><p class="eyebrow">${escapeHtml(entry.categoryLabel)} <span>·</span> FICTIONAL EDITORIAL</p><h1>${escapeHtml(entry.title)}</h1><p class="story-deck">${escapeHtml(entry.teaser)}</p></div>
        <figure class="story-photo"><img src="${imageUrl(entry)}" alt="${escapeHtml(entry.alt)}"><figcaption>Original AI-generated fashion artwork · The model and scene are fictional.</figcaption></figure>
        <div class="story-body"><p>${escapeHtml(entry.story)}</p><p>This image is an original, fully clothed fashion editorial illustration. It is not a photograph of a real model.</p></div>
        <section class="link-gate" data-link-gate>
          <p class="eyebrow">CONTINUE TO TERRABOX</p><h2>Your link is almost ready</h2>
          <p class="gate-note">The button will appear after the visible countdown completes.</p>
          <div class="countdown" aria-live="polite"><span data-countdown-number>12</span><span>seconds remaining</span></div>
          ${terabox ? `<a class="get-link-button" data-terabox-link href="${escapeHtml(terabox)}" target="_blank" rel="noopener noreferrer" hidden>Get TerraBox link <span aria-hidden="true">↗</span></a>` : '<span class="link-unavailable">TerraBox link not set yet.</span>'}
          <p class="link-destination">Destination: terabox.app · opens in a new tab</p>
        </section>
      </article>
      <aside class="journal-sidebar story-sidebar"><section class="ad-card"><p class="eyebrow">SPONSORED</p><div class="skyscraper-ad" aria-label="Advertisement"><script>window.atOptions={key:'4a0f4af868132ad64c5e05b4daa8b6d8',format:'iframe',height:600,width:160,params:{}};</script><script data-cfasync="false" src="https://bicea.org/22/4a0f4af868132ad64c5e05b4daa8b6d8"></script></div></section><a class="back-to-feed" href="${homeRoot.href}#image-feed">← Back to all images</a></aside>
    </div>`;
  startCountdown(target.querySelector('[data-link-gate]'));
}

function startCountdown(gate) {
  if (!gate) return;
  const number = gate.querySelector('[data-countdown-number]');
  const button = gate.querySelector('[data-terabox-link]');
  let remaining = 12;
  let timer;
  const begin = () => {
    if (timer || !button) return;
    timer = window.setInterval(() => {
      remaining -= 1;
      number.textContent = String(Math.max(remaining, 0));
      if (remaining <= 0) {
        window.clearInterval(timer);
        gate.classList.add('is-ready');
        gate.querySelector('.gate-note').textContent = 'Your TerraBox link is ready.';
        button.hidden = false;
      }
    }, 1000);
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(items => {
      if (items.some(item => item.isIntersecting)) { begin(); observer.disconnect(); }
    }, { threshold: 0.35 });
    observer.observe(gate);
  } else begin();
}

loadJournal().catch(() => {
  const target = document.getElementById('home-feed') || document.getElementById('category-story');
  if (target) target.innerHTML = '<p class="loading-note">This page could not load right now. Please try again shortly.</p>';
});
