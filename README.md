# Figure Notes

Static directory of 30 adult-performer profiles. The directory is a landing page; each performer has a dedicated, shareable page at `profiles/<slug>/`. Each profile page has age, available reported measurements, an intro image, bust/waist/hip images, a linked data source, and a TerraBox link area.

## Site admin and uploads

1. Open the live site and select **Admin**.
2. Create a fine-grained GitHub personal access token restricted to `FixMates/celeb` with **Contents: Read and write** permission.
3. Paste the token in the Admin panel and connect. The token stays in page memory, is sent only to GitHub’s API, and is cleared when you disconnect or close the page. It is not stored in local storage or the repository.
4. Choose a profile, upload any combination of intro, bust, waist, and hip images, and enter its optional TerraBox HTTPS share link. Select **Save to GitHub**.

The uploads and link are attached to that performer and display on their dedicated profile page. The directory links to each page.

Uploads are resized to a maximum dimension of 1600 pixels, converted to JPEG, and saved under `assets/uploads/<profile-slug>/`. The profile image paths and TerraBox link are written to `profiles.json`. Each save creates commits on `main`; the Pages workflow publishes them after deployment finishes.

Because the repository is public, uploaded images and TerraBox links become public. Use a fine-grained token with access only to this repository and Contents permission only. Do not paste a classic token or a token with access to unrelated repositories.

## Data and illustrations

Profile dates and reported measurements are sourced from the link shown on each card. The source is community-submitted and its profile fields may be incomplete, inconsistent, or outdated. Ages are calculated from listed birth dates. Bust is shown as the listed bra size where available; waist and hip figures are in inches. Missing values are labelled “Not listed.”

Unfilled image slots show generic, fully clothed SVG measurement guides that do not depict or claim to resemble the performer. An Admin upload replaces that guide for that image slot.

## GitHub Pages

The site uses plain HTML, CSS, JavaScript, and JSON. GitHub Pages is configured with the repository’s Actions workflow in `.github/workflows/pages.yml`.
