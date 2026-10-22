const cards = document.getElementById('profile-grid');
const search = document.getElementById('search');
const resultCount = document.getElementById('result-count');
const noResults = document.getElementById('no-results');

const palette = [
  ['#eee0d6','#f7eee8','#a65343','#473933'], ['#e4e1d8','#f3f0e7','#70725f','#433b34'],
  ['#e9dedb','#f6eeeb','#945e69','#423533'], ['#e5e2dc','#f3f0e8','#747b70','#463b32'],
  ['#eee3d4','#f8f0e2','#a26e42','#48352e'], ['#e2e2de','#f1f0ea','#727e82','#453933']
];

let currentProfiles = [];

function ageFromBirth(dateText) {
  if (!dateText) return 'Not listed';
  const [year, month, day] = dateText.split('-').map(Number);
  if (!year || !month || !day) return 'Not listed';
  const today = new Date();
  let age = today.getFullYear() - year;
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age--;
  return `${age}`;
}

function parseMeasures(value) {
  const text = (value || '').replace(/\s/g, '').toUpperCase();
  let match = text.match(/^([A-Z]+)(\d{2})-(\d+)-(\d+)$/);
  if (match) return { bust: `${match[2]}${match[1]}`, waist: match[3], hips: match[4] };
  match = text.match(/^(\d{2})([A-Z]+)-(\d+)-(\d+)$/);
  if (match) return { bust: `${match[1]}${match[2]}`, waist: match[3], hips: match[4] };
  return { bust: '', waist: '', hips: '' };
}

function escapeText(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function illustration(profile, type, index) {
  const [bg, halo, garment, hair] = palette[index % palette.length];
  let figure;
  if (type === 'intro') {
    figure = `<ellipse cx="90" cy="151" rx="42" ry="5" fill="#d1c5b9"/><path d="M78 49h24v18H78z" fill="#d8aa91"/><ellipse cx="90" cy="36" rx="22" ry="27" fill="#ddb49c"/><path d="M68 38C66 13 78 4 92 5c20 0 26 14 21 34-5-12-12-18-20-21-6 9-14 14-25 17z" fill="${hair}"/><path d="M72 67c-12 2-20 8-24 19l10 13-13 29-12 17c-2 5 1 9 6 8 5 0 8-4 10-9l20-30 8-17 1 51h25l1-51 8 17 20 30c2 5 5 9 10 9 5 1 8-3 6-8l-12-17-13-29 10-13c-4-11-12-17-24-19-6 6-12 9-19 9s-13-3-19-9z" fill="${garment}"/><path d="M77 91h26M75 111h30M73 130h34" stroke="#f7eee8" stroke-width="1" stroke-dasharray="2 2"/>`;
  } else {
    const lineY = type === 'Bust' ? 79 : type === 'Waist' ? 99 : 116;
    figure = `<path d="M49 32c-6 5-10 12-12 24l-10 29 10 5 17-31 5-12zM131 32c6 5 10 12 12 24l10 29-10 5-17-31-5-12z" fill="#ddb49c"/><path d="M61 28c8 6 17 9 29 9s21-3 29-9l13 16-9 13 9 14-9 14 11 51H45l11-51-9-14 9-14-9-13z" fill="${garment}"/><path d="M63 29c7 9 16 13 27 13s20-4 27-13" fill="none" stroke="#f3d8ca" stroke-width="2"/><path d="M54 ${lineY}h72" stroke="#fff7ef" stroke-width="1.5" stroke-dasharray="3 3"/><circle cx="54" cy="${lineY}" r="3" fill="#fffdfa" stroke="#a9503d"/><circle cx="126" cy="${lineY}" r="3" fill="#fffdfa" stroke="#a9503d"/><path d="M90 144l-2 20h-9c-3 0-4-2-1-4l7-5M90 164h9c3 0 4-2 1-4l-7-5" fill="#d8aa91"/>`;
  }
  const displayName = escapeText(profile.name);
  const label = type === 'intro' ? 'GENERIC FIGURE' : `${type.toUpperCase()} GUIDE`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" role="img" aria-label="${label} for ${displayName}"><rect width="180" height="180" fill="${bg}"/><circle cx="90" cy="82" r="57" fill="${halo}"/><g>${figure}</g><path d="M17 159h146" stroke="#d7ccc0"/><text x="90" y="173" text-anchor="middle" font-family="Arial,sans-serif" font-size="7" font-weight="700" letter-spacing="1.2" fill="#81766c">${label} · NOT TO SCALE</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function imagePath(profile, kind) {
  const path = profile.images?.[kind];
  return typeof path === 'string' && path.startsWith('assets/uploads/') ? new URL(path, document.baseURI).href : '';
}

function teraboxUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return '';
    const host = url.hostname.toLowerCase();
    const allowedHosts = new Set(['terabox.com', 'www.terabox.com', '1024terabox.com', 'www.1024terabox.com', 'teraboxapp.com', 'www.teraboxapp.com']);
    return allowedHosts.has(host) ? url.href : '';
  } catch { return ''; }
}

function cardMarkup(profile, index) {
  const measures = parseMeasures(profile.measurementListing);
  const introFallback = illustration(profile, 'intro', index);
  const introUrl = imagePath(profile, 'intro') || introFallback;
  const bustValue = measures.bust || 'Not listed';
  const waistValue = measures.waist ? `${measures.waist} in` : 'Not listed';
  const hipsValue = measures.hips ? `${measures.hips} in` : 'Not listed';
  const introAlt = imagePath(profile, 'intro') ? `Uploaded intro image for ${profile.name}` : `Original generic illustrated profile image for ${profile.name}; not a likeness`;
  return `<article class="profile-card" data-name="${escapeText(profile.name.toLowerCase())}">
    <a class="profile-directory-link" href="profiles/${escapeText(profile.slug)}/"><div class="profile-top"><img class="profile-image ${imagePath(profile, 'intro') ? 'user-image' : ''}" loading="lazy" src="${escapeText(introUrl)}" data-generic="${escapeText(introFallback)}" alt="${escapeText(introAlt)}"><div class="profile-summary"><span class="profile-overline">ADULT PERFORMER · PROFILE ${String(index+1).padStart(2,'0')}</span><h3>${escapeText(profile.name)}</h3><p class="profile-role">Actress · Model · Creator</p><div class="profile-facts"><span><b>Age</b> ${escapeText(ageFromBirth(profile.birthDate))}</span><span><b>Born</b> ${escapeText(profile.birthDate || 'Not listed')}</span></div></div></div>
    <div class="stat-strip"><div class="stat-mini"><span>BUST</span><strong>${escapeText(bustValue)}</strong><em>listed bra size</em></div><div class="stat-mini"><span>WAIST</span><strong>${escapeText(waistValue)}</strong><em>directory figure</em></div><div class="stat-mini"><span>HIPS / SEAT</span><strong>${escapeText(hipsValue)}</strong><em>circumference</em></div></div><span class="directory-cta">View profile <span aria-hidden="true">↗</span></span></a>
    <div class="source-link"><span>Community-listed data · unverified</span><a href="${escapeText(profile.source)}" target="_blank" rel="noopener noreferrer">View source ↗</a></div>
  </article>`;
}

function render() {
  const term = search.value.trim().toLowerCase();
  const visible = currentProfiles.map((profile, index) => ({ profile, index })).filter(({ profile }) => profile.name.toLowerCase().includes(term));
  cards.innerHTML = visible.map(({ profile, index }) => cardMarkup(profile, index)).join('');
  resultCount.textContent = `${visible.length} profile${visible.length === 1 ? '' : 's'}`;
  noResults.hidden = visible.length !== 0;
}

async function loadPublicProfiles() {
  try {
    const response = await fetch(`profiles.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Profile data returned ${response.status}.`);
    currentProfiles = await response.json();
    render();
  } catch (error) {
    cards.innerHTML = '<p class="load-error">The profile list could not be loaded. Refresh the page in a moment.</p>';
    console.error('Could not load the public profile list.', error);
  }
}


search.addEventListener('input', render);
cards.addEventListener('error', event => {
  const image = event.target;
  if (image instanceof HTMLImageElement && image.classList.contains('user-image') && image.dataset.generic) {
    image.classList.remove('user-image');
    image.src = image.dataset.generic;
  }
}, true);

loadPublicProfiles();
