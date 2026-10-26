const photos = window.GALLERY_PHOTOS || [];
const gallery = document.getElementById("gallery-list");
const count = document.getElementById("photo-count");
if (count) count.textContent = `${photos.length} photographs · scroll to explore`;
if (gallery) {
  const fragment = document.createDocumentFragment();
  let currentSeries = "";
  let seriesNumber = 0;
  photos.forEach((photo, index) => {
    if (photo.series !== currentSeries) {
      currentSeries = photo.series;
      seriesNumber += 1;
      const heading = document.createElement("h3");
      heading.className = "album-heading";
      heading.textContent = `Collection ${String(seriesNumber).padStart(2, "0")}`;
      fragment.append(heading);
    }
    const figure = document.createElement("figure");
    figure.className = "photo";
    const frame = document.createElement("div");
    frame.className = "photo-frame";
    const image = document.createElement("img");
    image.src = photo.src;
    image.alt = `Photograph ${index + 1} in the collection`;
    image.loading = index < 2 ? "eager" : "lazy";
    image.decoding = "async";
    image.fetchPriority = index === 0 ? "high" : "auto";
    const caption = document.createElement("figcaption");
    const series = document.createElement("span");
    series.textContent = `Collection ${String(seriesNumber).padStart(2, "0")}`;
    const number = document.createElement("span");
    number.textContent = `${String(index + 1).padStart(3, "0")} / ${String(photos.length).padStart(3, "0")}`;
    frame.append(image);
    caption.append(series, number);
    figure.append(frame, caption);
    fragment.append(figure);
    if (index === 0 && window.createGalleryAd) fragment.append(window.createGalleryAd());
  });
  gallery.append(fragment);
}
