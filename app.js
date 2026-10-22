const cards = document.getElementById('profile-grid');
const search = document.getElementById('search');
const resultCount = document.getElementById('result-count');
const noResults = document.getElementById('no-results');
const adminPanel = document.getElementById('admin-panel');
const connectView = document.getElementById('admin-connect-view');
const adminWorkspace = document.getElementById('admin-workspace');
const profileList = document.getElementById('admin-profile-list');
const API_ROOT = 'https://api.github.com/repos/FixMates/celeb/contents';
const API_VERSION = '2026-03-10';
const uploadKinds = [
  { key: 'intro', label: 'Intro' },
  { key: 'bust', label: 'Bust' },
  { key: 'waist', label: 'Waist' },
  { key: 'hips', label: 'Hip' }
];
const palette = [
  ['#eee0d6','#f7eee8','#a65343','#473933'], ['#e4e1d8','#f3f0e7','#70725f','#433b34'],
  ['#e9dedb','#f6eeeb','#945e69','#423533'], ['#e5e2dc','#f3f0e8','#747b70','#463b32'],
  ['#eee3d4','#f8f0e2','#a26e42','#48352e'], ['#e2e2de','#f1f0ea','#727e82','#453933']
];

let currentProfiles = [];
let profileDataSha = '';
let githubToken = '';
let editingSlug = '';
const previewUrls = new Map();

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

function setStatus(element, message, state = '') {
  element.textContent = message;
  element.dataset.state = state;
}

async function githubRequest(path, { method = 'GET', body = null } = {}) {
  if (!githubToken) throw new Error('Connect to GitHub before saving changes.');
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  const url = `https://api.github.com/repos/FixMates/celeb/contents/${encodedPath}${method === 'GET' ? '?ref=main' : ''}`;
  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${githubToken}`,
      'X-GitHub-Api-Version': API_VERSION,
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.message || `GitHub returned ${response.status}.`);
    error.status = response.status;
    throw error;
  }
  return result;
}

function decodeGitHubFile(content) {
  const binary = atob(content.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

function encodeBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let start = 0; start < bytes.length; start += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(start, start + chunkSize));
  }
  return btoa(binary);
}

function updateRoster() {
  document.getElementById('admin-profile-count').textContent = currentProfiles.length;
  profileList.innerHTML = currentProfiles.map(profile => {
    const count = uploadKinds.filter(({ key }) => imagePath(profile, key)).length;
    return `<li><button type="button" data-profile-slug="${escapeText(profile.slug)}" class="roster-button ${profile.slug === editingSlug ? 'selected' : ''}"><span>${escapeText(profile.name)}</span><small>${count}/4 images</small></button></li>`;
  }).join('');
}

function selectedProfile() {
  return currentProfiles.find(profile => profile.slug === editingSlug) || null;
}

function previewFor(profile, kind) {
  const index = Math.max(0, currentProfiles.findIndex(item => item.slug === profile.slug));
  return imagePath(profile, kind) || illustration(profile, kind === 'hips' ? 'Hips' : kind[0].toUpperCase() + kind.slice(1), index);
}

function selectProfile(slug) {
  const profile = currentProfiles.find(item => item.slug === slug);
  if (!profile) return;
  editingSlug = slug;
  document.getElementById('editor-profile-name').textContent = profile.name;
  document.getElementById('admin-terabox').value = profile.terabox || '';
  for (const { key } of uploadKinds) {
    const input = document.querySelector(`[data-upload="${key}"]`);
    const preview = document.querySelector(`[data-preview="${key}"]`);
    const label = document.querySelector(`[data-file-label="${key}"]`);
    input.value = '';
    preview.src = previewFor(profile, key);
    label.textContent = profile.images?.[key] ? 'Current image saved · choose to replace' : 'No image uploaded yet';
  }
  updateRoster();
  setStatus(document.getElementById('save-status'), 'Select images and/or add a TerraBox share link.');
}

async function readProfilesFromGitHub() {
  const file = await githubRequest('profiles.json');
  const profiles = JSON.parse(decodeGitHubFile(file.content));
  if (!Array.isArray(profiles) || profiles.length === 0) throw new Error('profiles.json does not contain a profile list.');
  profileDataSha = file.sha;
  currentProfiles = profiles;
  render();
  updateRoster();
  if (!editingSlug || !currentProfiles.some(profile => profile.slug === editingSlug)) editingSlug = currentProfiles[0].slug;
  selectProfile(editingSlug);
}

function resizeUpload(file) {
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return Promise.reject(new Error('Choose a JPG, PNG, or WebP image.'));
  }
  return createImageBitmap(file).then(bitmap => {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d', { alpha: false });
    context.fillStyle = '#f6f2ec';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return new Promise((resolve, reject) => canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error(`Could not prepare ${file.name}.`));
    }, 'image/jpeg', 0.84));
  });
}

async function saveBlob(path, blob, message) {
  let sha;
  try { sha = (await githubRequest(path)).sha; }
  catch (error) { if (error.status !== 404) throw error; }
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const result = await githubRequest(path, {
    method: 'PUT',
    body: { message, content: encodeBase64(bytes), branch: 'main', ...(sha ? { sha } : {}) }
  });
  return result.content?.path || path;
}

async function saveProfile(event) {
  event.preventDefault();
  const profile = selectedProfile();
  const status = document.getElementById('save-status');
  const button = document.getElementById('save-profile');
  if (!profile) { setStatus(status, 'Choose a profile first.', 'error'); return; }
  const linkInput = document.getElementById('admin-terabox').value.trim();
  const safeLink = linkInput ? teraboxUrl(linkInput) : '';
  if (linkInput && !safeLink) { setStatus(status, 'Enter a valid HTTPS TerraBox link, or leave it blank to remove it.', 'error'); return; }
  const files = uploadKinds.map(({ key, label }) => ({ key, label, file: document.querySelector(`[data-upload="${key}"]`).files[0] })).filter(item => item.file);
  if (!files.length && safeLink === (profile.terabox || '')) { setStatus(status, 'There are no changes to save.'); return; }
  button.disabled = true;
  const updatedImages = { ...(profile.images || {}) };
  try {
    for (let index = 0; index < files.length; index++) {
      const item = files[index];
      setStatus(status, `Preparing ${item.label} image (${index + 1} of ${files.length})…`);
      const blob = await resizeUpload(item.file);
      const path = `assets/uploads/${profile.slug}/${item.key}.jpg`;
      await saveBlob(path, blob, `Upload ${item.label.toLowerCase()} image for ${profile.name}`);
      updatedImages[item.key] = path;
    }
    profile.images = updatedImages;
    profile.terabox = safeLink;
    setStatus(status, 'Saving profile information…');
    const content = new TextEncoder().encode(`${JSON.stringify(currentProfiles, null, 2)}\n`);
    const result = await githubRequest('profiles.json', {
      method: 'PUT',
      body: {
        message: `Update ${profile.name} profile`,
        content: encodeBase64(content),
        branch: 'main',
        sha: profileDataSha
      }
    });
    profileDataSha = result.content?.sha || profileDataSha;
    render();
    updateRoster();
    selectProfile(profile.slug);
    setStatus(status, 'Saved to GitHub. The public page will update after Pages deploys.', 'success');
  } catch (error) {
    setStatus(status, `Could not finish saving: ${error.message}`, 'error');
  } finally {
    button.disabled = false;
  }
}

document.getElementById('admin-toggle').addEventListener('click', () => {
  adminPanel.hidden = !adminPanel.hidden;
  if (!adminPanel.hidden) adminPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
document.getElementById('admin-close').addEventListener('click', () => { adminPanel.hidden = true; });
document.getElementById('github-connect-form').addEventListener('submit', async event => {
  event.preventDefault();
  const tokenInput = document.getElementById('github-token');
  const status = document.getElementById('connect-status');
  const candidate = tokenInput.value.trim();
  if (!candidate) return;
  setStatus(status, 'Checking repository access…');
  githubToken = candidate;
  try {
    await readProfilesFromGitHub();
    tokenInput.value = '';
    connectView.hidden = true;
    adminWorkspace.hidden = false;
    setStatus(document.getElementById('save-status'), 'Connected. Choose a profile to edit.');
  } catch (error) {
    githubToken = '';
    setStatus(status, `Could not connect: ${error.message}`, 'error');
  }
});
document.getElementById('github-disconnect').addEventListener('click', () => {
  githubToken = '';
  profileDataSha = '';
  adminWorkspace.hidden = true;
  connectView.hidden = false;
  document.getElementById('github-token').value = '';
  setStatus(document.getElementById('connect-status'), 'Disconnected. Token cleared from page memory.');
});
profileList.addEventListener('click', event => {
  const button = event.target.closest('[data-profile-slug]');
  if (button) selectProfile(button.dataset.profileSlug);
});
document.getElementById('profile-editor').addEventListener('submit', saveProfile);
search.addEventListener('input', render);
cards.addEventListener('error', event => {
  const image = event.target;
  if (image instanceof HTMLImageElement && image.classList.contains('user-image') && image.dataset.generic) {
    image.classList.remove('user-image');
    image.src = image.dataset.generic;
  }
}, true);
for (const input of document.querySelectorAll('[data-upload]')) {
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const kind = input.dataset.upload;
    const previous = previewUrls.get(kind);
    if (previous) URL.revokeObjectURL(previous);
    const objectUrl = URL.createObjectURL(file);
    previewUrls.set(kind, objectUrl);
    document.querySelector(`[data-preview="${kind}"]`).src = objectUrl;
    document.querySelector(`[data-file-label="${kind}"]`).textContent = file.name;
  });
}

loadPublicProfiles();
