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
  const values = [
    ['BUST', measures.bust || 'Not listed', 'Reported bra size'],
    ['WAIST', measures.waist ? `${measures.waist} in` : 'Not listed', 'Reported circumference'],
    ['HIPS / SEAT', measures.hips ? `${measures.hips} in` : 'Not listed', 'Reported circumference']
  ];
  document.title = `${profile.name} Measurements & Bio — Figure Notes`;
  document.querySelector('meta[name="description"]').content = `Age, reported measurements, image gallery and source notes for ${profile.name}.`;
  document.getElementById('profile-content').innerHTML = `
    <a class="profile-back" href="${rootUrl.href}#profiles">← Back to all profiles</a>
    <section class="profile-page-hero"><div><p class="profile-page-role">ADULT PERFORMER · PROFILE</p><h1>${escapeHtml(profile.name)}</h1><p>Biographical details and community-listed measurements, with source context.</p><div class="profile-details-facts"><span><b>Age</b> ${escapeHtml(ageFromBirth(profile.birthDate))}</span><span><b>Born</b> ${escapeHtml(profile.birthDate || 'Not listed')}</span><span><b>Updated</b> ${escapeHtml(profile.reportedAge ? 'Source listing' : 'Not listed')}</span></div></div><img class="profile-page-portrait" src="${escapeHtml(imageUrl('intro'))}" alt="${introIsUploaded ? `Uploaded intro image for ${escapeHtml(profile.name)}` : `Generic illustrated figure guide for ${escapeHtml(profile.name)}; not a likeness`}"></section>
    <section class="measurements-section"><h2>Reported measurements</h2><p class="profile-note">Community-listed estimates · figures may be incomplete or out of date.</p><div class="detail-measurements">${values.map(([label, value, note]) => `<div class="detail-measure"><span>${label}</span><strong>${escapeHtml(value)}</strong><small>${note}</small></div>`).join('')}</div></section>
    <section class="profile-gallery-section"><h2>Profile image gallery</h2><div class="detail-gallery">${[['intro','INTRO'],['bust','BUST'],['waist','WAIST'],['hips','HIP']].map(([key,label]) => `<figure><img loading="lazy" src="${escapeHtml(imageUrl(key))}" alt="${profile.images?.[key]?.startsWith('assets/uploads/') ? `Uploaded ${label.toLowerCase()} image for ${escapeHtml(profile.name)}` : `Generic ${label.toLowerCase()} measurement guide for ${escapeHtml(profile.name)}; not a likeness`}"><figcaption>${label} ${profile.images?.[key]?.startsWith('assets/uploads/') ? '· UPLOADED' : '· GUIDE'}</figcaption></figure>`).join('')}</div><p class="profile-note">Empty slots use original, fully clothed illustrations that do not depict or resemble the performer.</p></section>
    <div class="profile-lower"><section class="bio-section"><h2>About this profile</h2><p>This page collects publicly listed biographical details and measurements. Birth date and measurement figures are attributed to the linked community profile; they are not independently verified, official, or necessarily current. Age is calculated from the listed birth date.</p><p><a href="${escapeHtml(profile.source)}" target="_blank" rel="noopener noreferrer">View listed source ↗</a></p></section><section class="profile-resource"><h2>TerraBox link</h2><p>Optional share link provided by the site owner.</p><a id="profile-terabox" hidden target="_blank" rel="noopener noreferrer">Open TerraBox link ↗</a><p id="terabox-empty">No TerraBox link has been added for this profile.</p></section></div>
    <div class="profile-page-footer"><a href="${rootUrl.href}#profiles">← Directory</a><a href="${rootUrl.href}#admin-panel">Site owner admin</a><span>18+ · Biographical reference</span></div>`;
  const safeLink = teraboxUrl(profile.terabox);
  if (safeLink) {
    const link = document.getElementById('profile-terabox');
    link.href = safeLink;
    link.hidden = false;
    document.getElementById('terabox-empty').hidden = true;
  }
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
