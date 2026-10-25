# Model Journal

A lightweight, mobile-friendly model image journal for GitHub Pages. The homepage displays the featured image stories vertically. Each story also has its own shareable category page:

- `categories/trending/`
- `categories/hottest/`
- `categories/new/`
- `categories/classic/`

The current gallery art is original AI-generated fashion artwork depicting fictional, fully clothed adults. The accompanying story text is fictional and does not describe a real model. The additional photos in the folders beside this repository are not included in the public site; add them only after confirming that everyone shown is an adult and the images are cleared for publication.

## TerraBox call-to-action

Each category page has a TerraBox panel after its story. The 12-second countdown starts when the panel is scrolled into view. The same share link is configured per story in `models.json`.

## Ads

The provided ad scripts are included on the homepage and each category page. A 160×600 banner slot appears in the sidebar on wide screens and below the story on smaller screens.

## Editing stories

Edit `models.json` to change a category title, story, image path, or TerraBox link. Add optimized image files under `assets/models/`. The site is static HTML, CSS, JavaScript, and JSON; no server or database is required.
