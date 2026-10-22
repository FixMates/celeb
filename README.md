# Figure Notes

Static directory of 30 adult-performer profiles. Each profile includes age, the available reported bust/waist/hip measurements, four original generic illustrations, a linked public source, and a TerraBox link field.

## GitHub Pages

The site is plain HTML, CSS, and JavaScript. In the repository, open **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save. The site files are all at the repository root, so they work as a GitHub Pages project site.

## Data and images

Profile dates and reported measurements are sourced from the link shown on each card. The source is community-submitted and its profile fields may be incomplete, inconsistent, or outdated. Ages are calculated from listed birth dates. Bust is shown as the listed bra size where available; waist and hip figures are in inches. Missing values are labelled “Not listed.”

All four illustrations per profile are generated as generic, fully clothed SVG measurement guides. They do not depict or claim to resemble the performer. No third-party performer photos are copied into this repository.

TerraBox links entered in a card are validated as HTTPS TerraBox URLs and saved in that browser's local storage. For a link visible to every visitor, edit the profile's `terabox` value in `profiles.js` and commit the change.
