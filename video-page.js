const videoLinks = {
  "01": "https://1024terabox.com/s/1ntEwEUWmtdJxEQdqNAf4Cg",
  "02": "https://1024terabox.com/s/1nrAsfKppAT0V88ifa288tg",
  "03": "https://1024terabox.com/s/1t0g23Ijewx2VGuTJT__eQA",
  "04": "https://1024terabox.com/s/1IAmp3yyYkBcBLnyJvbH5TQ",
  "05": "https://1024terabox.com/s/1_nDj3hJFC54x7aV5PzY1JA",
  "06": "https://1024terabox.com/s/1zmfOiyAzxKmUWNWFswEX9A"
};
const id = document.body.dataset.video;
const destination = videoLinks[id];
const title = document.getElementById("video-title");
const link = document.getElementById("video-link");
const gallery = document.getElementById("video-gallery");
const count = document.getElementById("video-photo-count");
const photos = window.GALLERY_PHOTOS || [];
if (title) title.textContent = `Full video ${id}`;
if (link && destination) link.href = destination;
if (count) count.textContent = `${photos.length} photographs`;

if (gallery) {
  const fragment = document.createDocumentFragment();
  let series = "";
  let seriesNumber = 0;
  photos.forEach((photo, index) => {
    if (photo.series !== series) {
      series = photo.series;
      seriesNumber += 1;
      const heading = document.createElement("h2");
      heading.className = "album-heading";
      heading.textContent = `Collection ${String(seriesNumber).padStart(2, "0")}`;
      fragment.append(heading);
    }
    const figure = document.createElement("figure");
    figure.className = "photo";
    const frame = document.createElement("div");
    frame.className = "photo-frame";
    const image = document.createElement("img");
    image.src = `../${photo.src}`;
    image.alt = `Photograph ${index + 1} in the collection`;
    image.loading = index < 2 ? "eager" : "lazy";
    image.decoding = "async";
    const caption = document.createElement("figcaption");
    const collection = document.createElement("span");
    collection.textContent = `Collection ${String(seriesNumber).padStart(2, "0")}`;
    const number = document.createElement("span");
    number.textContent = `${String(index + 1).padStart(3, "0")} / ${String(photos.length).padStart(3, "0")}`;
    frame.append(image);
    caption.append(collection, number);
    figure.append(frame, caption);
    fragment.append(figure);
  });
  gallery.append(fragment);
}

const gate = document.getElementById("video-gate");
const countdown = document.getElementById("gate-seconds");
const gateStatus = document.getElementById("gate-status");
if (gate && link && destination) {
  let started = false;
  const waitForPhotos = () => Promise.all([...document.querySelectorAll("#video-gallery img")].map(image => new Promise(resolve => {
    if (image.complete) return resolve();
    image.loading = "eager";
    image.addEventListener("load", resolve, { once: true });
    image.addEventListener("error", resolve, { once: true });
  })));
  const waitForTimer = () => new Promise(resolve => {
    let remaining = 12;
    if (countdown) countdown.textContent = String(remaining);
    const timer = window.setInterval(() => {
      remaining -= 1;
      if (countdown) countdown.textContent = String(Math.max(remaining, 0));
      if (remaining <= 0) {
        window.clearInterval(timer);
        resolve();
      }
    }, 1000);
  });
  const begin = async () => {
    if (started) return;
    started = true;
    if (gateStatus) gateStatus.textContent = "Letting the photo collection and ad finish loading…";
    await Promise.all([waitForPhotos(), waitForTimer()]);
    link.hidden = false;
    const countdownWrap = document.getElementById("gate-countdown");
    if (countdownWrap) countdownWrap.hidden = true;
    if (gateStatus) gateStatus.textContent = "Your video link is ready.";
  };
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        begin();
      }
    }, { threshold: 0.35 });
    observer.observe(gate);
  } else begin();
}
