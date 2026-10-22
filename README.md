# Figure Notes

Static directory of 30 adult-performer profiles. The directory is a landing page; each performer has a dedicated, shareable page at `profiles/<slug>/`. Each profile page has age, available reported measurements, an intro image, bust/waist/hip images, a linked data source, and a TerraBox link area.

## Profile images and TerraBox links

Place profile images under `assets/uploads/<profile-slug>/` and update that performer's `images` paths in `profiles.json`. The `intro`, `bust`, `waist`, and `hips` keys appear in that performer's dedicated page gallery. Set the `terabox` field in `profiles.json` to an optional HTTPS share link.

The repository is public, so committed images and TerraBox links are public too. The directory includes a one-click ZIP containing four image slots for every profile, with generic illustrations for any unfilled slots. Creative Commons portrait credits and license links are included both on the relevant profile page and in the ZIP manifest.

## Data and illustrations

Profile dates and reported measurements are sourced from the link shown on each card. The source is community-submitted and its profile fields may be incomplete, inconsistent, or outdated. Ages are calculated from listed birth dates. Bust is shown as the listed bra size where available; waist and hip figures are in inches. Missing values are labelled “Not listed.”

Unfilled image slots show generic, fully clothed SVG measurement guides that do not depict or claim to resemble the performer. A supplied profile image replaces that guide for its image slot.

## GitHub Pages

The site uses plain HTML, CSS, JavaScript, and JSON. GitHub Pages is configured with the repository’s Actions workflow in `.github/workflows/pages.yml`.
