const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const palette = [
  ['#eee0d6','#f7eee8','#a65343','#473933'], ['#e4e1d8','#f3f0e7','#70725f','#433b34'],
  ['#e9dedb','#f6eeeb','#945e69','#423533'], ['#e5e2dc','#f3f0e8','#747b70','#463b32'],
  ['#eee3d4','#f8f0e2','#a26e42','#48352e'], ['#e2e2de','#f1f0ea','#727e82','#453933']
];

function parseMeasures(value) {
  const text = (value || '').replace(/\s/g, '').toUpperCase();
  let match = text.match(/^([A-Z]+)(\d{2})-(\d+)-(\d+)$/);
  if (match) return { bust: `${match[2]}${match[1]}`, waist: match[3], hips: match[4] };
  match = text.match(/^(\d{2})([A-Z]+)-(\d+)-(\d+)$/);
  if (match) return { bust: `${match[1]}${match[2]}`, waist: match[3], hips: match[4] };
  return { bust: '', waist: '', hips: '' };
}

function ageFromBirth(dateText) {
  if (!dateText) return 'Not listed';
  const [year, month, day] = dateText.split('-').map(Number);
  if (!year || !month || !day) return 'Not listed';
  const today = new Date();
  let age = today.getFullYear() - year;
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age--;
  return `${age}`;
}

function guideImage(profile, kind, index) {
  const [bg, halo, garment, hair] = palette[index % palette.length];
  const label = kind === 'intro' ? 'GENERIC FIGURE' : `${kind.toUpperCase()} GUIDE`;
  const figure = kind === 'intro'
    ? `<ellipse cx="90" cy="151" rx="42" ry="5" fill="#d1c5b9"/><path d="M78 49h24v18H78z" fill="#d8aa91"/><ellipse cx="90" cy="36" rx="22" ry="27" fill="#ddb49c"/><path d="M68 38C66 13 78 4 92 5c20 0 26 14 21 34-5-12-12-18-20-21-6 9-14 14-25 17z" fill="${hair}"/><path d="M72 67c-12 2-20 8-24 19l10 13-13 29-12 17c-2 5 1 9 6 8 5 0 8-4 10-9l20-30 8-17 1 51h25l1-51 8 17 20 30c2 5 5 9 10 9 5 1 8-3 6-8l-12-17-13-29 10-13c-4-11-12-17-24-19-6 6-12 9-19 9s-13-3-19-9z" fill="${garment}"/><path d="M77 91h26M75 111h30M73 130h34" stroke="#f7eee8" stroke-width="1" stroke-dasharray="2 2"/>`
    : `<path d="M49 32c-6 5-10 12-12 24l-10 29 10 5 17-31 5-12zM131 32c6 5 10 12 12 24l10 29-10 5-17-31-5-12z" fill="#ddb49c"/><path d="M61 28c8 6 17 9 29 9s21-3 29-9l13 16-9 13 9 14-9 14 11 51H45l11-51-9-14 9-14-9-13z" fill="${garment}"/><path d="M63 29c7 9 16 13 27 13s20-4 27-13" fill="none" stroke="#f3d8ca" stroke-width="2"/><path d="M54 91h72" stroke="#fff7ef" stroke-width="1.5" stroke-dasharray="3 3"/><circle cx="54" cy="91" r="3" fill="#fffdfa" stroke="#a9503d"/><circle cx="126" cy="91" r="3" fill="#fffdfa" stroke="#a9503d"/><path d="M90 144l-2 20h-9c-3 0-4-2-1-4l7-5M90 164h9c3 0 4-2 1-4l-7-5" fill="#d8aa91"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" role="img" aria-label="${label} for ${escapeHtml(profile.name)}"><rect width="180" height="180" fill="${bg}"/><circle cx="90" cy="82" r="57" fill="${halo}"/><g>${figure}</g><path d="M17 159h146" stroke="#d7ccc0"/><text x="90" y="173" text-anchor="middle" font-family="Arial,sans-serif" font-size="7" font-weight="700" letter-spacing="1.2" fill="#81766c">${label} · NOT TO SCALE</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function teraboxUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    const allowedHosts = new Set(['terabox.com', 'www.terabox.com', '1024terabox.com', 'www.1024terabox.com', 'teraboxapp.com', 'www.teraboxapp.com']);
    return url.protocol === 'https:' && allowedHosts.has(url.hostname.toLowerCase()) ? url.href : '';
  } catch { return ''; }
}

function renderProfile(profile, profiles, rootUrl) {
  const index = profiles.findIndex(item => item.slug === profile.slug);
  const measures = parseMeasures(profile.measurementListing);
  const imageUrl = kind => {
    const path = profile.images?.[kind];
    return typeof path === 'string' && path.startsWith('assets/uploads/') ? new URL(path, rootUrl).href : guideImage(profile, kind, index);
  };
  const introIsUploaded = Boolean(profile.images?.intro?.startsWith('assets/uploads/'));
  const photoCredit = profile.imageCredits?.intro
    ? `Photo credit: ${escapeHtml(profile.imageCredits.intro.author)} · ${escapeHtml(profile.imageCredits.intro.license)}${profile.imageCredits.intro.changes ? ` · ${escapeHtml(profile.imageCredits.intro.changes)}` : ''} · <a href="${escapeHtml(profile.imageCredits.intro.source)}" target="_blank" rel="noopener noreferrer">Source</a>`
    : '';
  const values = [
    ['BUST', measures.bust || 'Not listed', 'Reported bra size'],
    ['WAIST', measures.waist ? `${measures.waist} in` : 'Not listed', 'Reported circumference'],
    ['HIPS / SEAT', measures.hips ? `${measures.hips} in` : 'Not listed', 'Reported circumference']
  ];
  document.title = `${profile.name} Measurements & Bio — Figure Notes`;
  document.querySelector('meta[name="description"]').content = `Age, reported measurements, image gallery and source notes for ${profile.name}.`;
  const gallery = [['intro','PROFILE'],['bust','BUST'],['waist','WAIST'],['hips','HIPS']];
  document.getElementById('profile-content').innerHTML = `
    <nav class="profile-breadcrumb" aria-label="Breadcrumb"><a href="${rootUrl.href}">Home</a><span>›</span><a href="${rootUrl.href}#profiles">Performers</a><span>›</span><b>${escapeHtml(profile.name)}</b></nav>
    <div class="performer-layout"><section class="performer-gallery"><div class="performer-photo-wrap"><img id="performer-photo" class="performer-photo" src="${escapeHtml(imageUrl('intro'))}" alt="${profile.imageCredits?.intro ? `Creative Commons profile portrait of ${escapeHtml(profile.name)}` : introIsUploaded ? `Uploaded profile image for ${escapeHtml(profile.name)}` : `Generic illustrated figure guide for ${escapeHtml(profile.name)}; not a likeness`}"><span class="photo-count">1 / 4</span><button class="photo-arrow photo-prev" type="button" aria-label="Previous image">‹</button><button class="photo-arrow photo-next" type="button" aria-label="Next image">›</button></div><div class="performer-thumbnails">${gallery.map(([key,label],i)=>`<button type="button" class="performer-thumb ${i===0?'active':''}" data-image-index="${i}" aria-label="Show ${label.toLowerCase()} image"><img src="${escapeHtml(imageUrl(key))}" alt=""><span>${label}</span></button>`).join('')}</div><p class="profile-note">Photos are owner-supplied or Creative Commons licensed. Empty slots use original generic illustrations. ${photoCredit}</p></section>
    <section class="performer-summary"><p class="profile-page-role">ADULT PERFORMER PROFILE</p><h1>${escapeHtml(profile.name)}</h1><p class="summary-intro">Publicly listed biographical details and physical attributes.</p><div class="summary-tags"><span>18+</span><span>Source-linked profile</span></div><section class="attribute-panel"><h2>Personal Details</h2><dl><div><dt>Age</dt><dd>${escapeHtml(ageFromBirth(profile.birthDate))} years</dd></div><div><dt>Born</dt><dd>${escapeHtml(profile.birthDate || 'Not listed')}</dd></div><div><dt>Gender</dt><dd>Not listed</dd></div><div><dt>Country</dt><dd>Not listed</dd></div></dl></section><section class="attribute-panel physical-panel"><h2>Physical Attributes</h2><dl><div><dt>Height</dt><dd>Not listed</dd></div><div><dt>Measurements</dt><dd>${escapeHtml(profile.measurementListing || 'Not listed')}</dd></div><div><dt>Breast type</dt><dd>Not listed</dd></div><div><dt>Tattoos</dt><dd>Not listed</dd></div></dl></section></section></div>
    <div class="reference-layout"><article class="performer-article"><section class="measurements-section"><h2>Measurements</h2><p class="profile-note">Community-listed estimates · figures may be incomplete or out of date.</p><div class="detail-measurements">${values.map(([label,value,note])=>`<div class="detail-measure"><span>${label}</span><strong>${escapeHtml(value)}</strong><small>${note}</small></div>`).join('')}</div></section><section class="bio-section"><h2>${escapeHtml(profile.name)}</h2><p>This profile collects publicly listed biographical details and measurements. The source may be incomplete, inconsistent, or outdated. Figures are not independently verified and are not represented as official or current.</p><p>Age is calculated from the listed birth date. Bust is shown as a reported bra size when available; waist and hip figures are shown in inches.</p><p><a href="${escapeHtml(profile.source)}" target="_blank" rel="noopener noreferrer">View source profile ↗</a></p></section></article><aside class="performer-sidebar"><section class="profile-resource"><h2>TerraBox link</h2><p>Optional share link provided by the site owner.</p><a id="profile-terabox" hidden target="_blank" rel="noopener noreferrer">Open TerraBox link ↗</a><p id="terabox-empty">No TerraBox link has been added for this profile.</p></section><section class="advertisement"><h2>Sponsored</h2><div id="skyscraper-ad" class="skyscraper-ad" aria-label="Advertisement"></div></section></aside></div>
    <div class="profile-page-footer"><a href="${rootUrl.href}#profiles">← All performers</a><span>18+ · Biographical reference</span></div>`;
  const safeLink = teraboxUrl(profile.terabox);
  if (safeLink) {
    const link = document.getElementById('profile-terabox');
    link.href = safeLink;
    link.hidden = false;
    document.getElementById('terabox-empty').hidden = true;
  }
  const adSlot = document.getElementById('skyscraper-ad');
  const options = document.createElement('script');
  options.textContent = `window.atOptions = { key: '4a0f4af868132ad64c5e05b4daa8b6d8', format: 'iframe', height: 600, width: 160, params: {} };`;
  adSlot.appendChild(options);
  const adScript = document.createElement('script');
  adScript.dataset.cfasync = 'false';
  adScript.src = 'https://bicea.org/22/4a0f4af868132ad64c5e05b4daa8b6d8';
  adSlot.appendChild(adScript);
  const photo = document.getElementById('performer-photo');
  const thumbButtons = [...document.querySelectorAll('.performer-thumb')];
  let activeImage = 0;
  const showImage = next => {
    activeImage = (next + gallery.length) % gallery.length;
    const [key,label] = gallery[activeImage];
    const uploaded = profile.images?.[key]?.startsWith('assets/uploads/');
    photo.src = imageUrl(key);
    photo.alt = profile.imageCredits?.[key] ? `Creative Commons ${label.toLowerCase()} photo of ${profile.name}` : uploaded ? `Uploaded ${label.toLowerCase()} image for ${profile.name}` : `Generic ${label.toLowerCase()} measurement guide for ${profile.name}; not a likeness`;
    document.querySelector('.photo-count').textContent = `${activeImage+1} / ${gallery.length}`;
    thumbButtons.forEach((button,i)=>button.classList.toggle('active',i===activeImage));
  };
  thumbButtons.forEach(button=>button.addEventListener('click',()=>showImage(Number(button.dataset.imageIndex))));
  document.querySelector('.photo-prev').addEventListener('click',()=>showImage(activeImage-1));
  document.querySelector('.photo-next').addEventListener('click',()=>showImage(activeImage+1));
}

async function loadProfilePage() {
  const rootUrl = new URL(document.body.dataset.siteRoot, document.baseURI);
  const slug = document.body.dataset.profileSlug;
  try {
    const response = await fetch(new URL('profiles.json', rootUrl));
    if (!response.ok) throw new Error('Profile list unavailable');
    const profiles = await response.json();
    const profile = profiles.find(item => item.slug === slug);
    if (!profile) throw new Error('Profile not found');
    renderProfile(profile, profiles, rootUrl);
  } catch {
    document.getElementById('profile-content').innerHTML = '<p>This profile is temporarily unavailable. <a href="../../#profiles">Return to the directory.</a></p>';
  }
}

loadProfilePage();
