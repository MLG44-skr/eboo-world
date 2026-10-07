# Eboo World – website

Static site (HTML/CSS/JS, no build). Storefront only: payment and delivery happen on Etsy.

## Edit
Everything you change lives in `data/site.js`:
- `link_kup` + `platforma` per product → the "Buy on Etsy" button. Empty link = "Coming soon" badge + e-mail signup (a dead button never shows).
- `site.email`, `site.url`, `site.newsletterAction`, `site.goatcounter` (cookie-free click counting, off when empty).

## Preview
`python3 -m http.server` and open http://localhost:8000

## Publish
GitHub Pages: Settings → Pages → deploy from this branch, root folder.

## Rules
- Never commit paid files. `samples/` holds only 2–3 page free samples.
- Don't link from Etsy listings to a paid version outside Etsy (Etsy policy).
- Legal pages are templates: review with your accountant/lawyer.
