window.createGalleryAd = function () {
  const ad = document.createElement("aside");
  ad.className = "gallery-ad";
  ad.setAttribute("aria-label", "Advertisement");

  const label = document.createElement("span");
  label.className = "gallery-ad-label";
  label.textContent = "Advertisement";

  const container = document.createElement("div");
  container.id = "container-d3fb79f238d9dbd2a3a5010090265624";

  const script = document.createElement("script");
  script.async = true;
  script.setAttribute("data-cfasync", "false");
  script.src = "https://brijmohan.org/21/d3fb79f238d9dbd2a3a5010090265624";

  ad.append(label, container, script);
  return ad;
};
