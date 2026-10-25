const photos = window.GALLERY_PHOTOS;
const gallery = document.getElementById("gallery");
const count = document.getElementById("photo-count");
count.textContent = `${photos.length} photographs · scroll to explore`;

const fragment = document.createDocumentFragment();
let activeAlbum = "";
photos.forEach((photo, index) => {
  if (photo.album !== activeAlbum) {
    activeAlbum = photo.album;
    const heading = document.createElement("h2");
    heading.className = "album-heading";
    heading.textContent = activeAlbum;
    fragment.append(heading);
  }
  const figure = document.createElement("figure");
  figure.className = "photo";
  const frame = document.createElement("div");
  frame.className = "photo-frame";
  const image = document.createElement("img");
  image.src = photo.src;
  image.alt = `Photograph ${index + 1}`;
  image.loading = index < 2 ? "eager" : "lazy";
  image.decoding = "async";
  image.fetchPriority = index === 0 ? "high" : "auto";
  const caption = document.createElement("figcaption");
  const album = document.createElement("span");
  album.textContent = activeAlbum;
  const number = document.createElement("span");
  number.textContent = `${String(index + 1).padStart(3, "0")} / ${String(photos.length).padStart(3, "0")}`;
  frame.append(image);
  caption.append(album, number);
  figure.append(frame, caption);
  fragment.append(figure);
});
gallery.append(fragment);
