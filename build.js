/* =========================================================================
   EBOO WORLD — build (czysty Node, zero zależności):  node build.js
   Robi: prerender katalogu i okładek (SEO), osobną stronę HTML dla każdego produktu,
   header/footer na każdej stronie, meta/canonical/OG, sitemap.xml, robots.txt oraz
   cache-busting (?v=<hash css+js+data>). Uruchom po KAŻDEJ zmianie w data/, js/ lub css/.
   ========================================================================= */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const R = require("./js/render.js");
const ROOT = __dirname;
const rd = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const wr = (f, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true }); fs.writeFileSync(path.join(ROOT, f), s); };

const SITE = (rd("js/config.js").match(/SITE_URL:\s*"([^"]+)"/) || [])[1].replace(/\/$/, "");
const products = JSON.parse(rd("data/products.json"));
const shown = R.visible(products);

/* wersja assetów = hash plików, które wpływają na wygląd/zachowanie */
const hash = crypto.createHash("sha1");
["css/style.css", "css/motion.css", "js/config.js", "js/render.js", "js/app.js", "data/products.json"].forEach((f) => hash.update(rd(f)));
const V = hash.digest("hex").slice(0, 8);

const h = R.h;
const DESC = "Practical digital tools: spreadsheets, calculators and guides that save you time or money. Download instantly, checkout on Etsy.";
const pages = [
  { f: "index.html", path: "", title: "Eboo World: digital tools that save you time or money", desc: DESC, ld: { "@context": "https://schema.org", "@type": "Organization", name: "Eboo World", url: SITE + "/" } },
  { f: "free-sheet.html", path: "free-sheet.html", title: "Free checklist | Eboo World", desc: "Get a free checklist PDF in exchange for your e-mail." },
  { f: "help.html", path: "help.html", title: "Help: how to download your files from Etsy | Eboo World", desc: "How to download your purchase from Etsy, open the PDF and spreadsheet, and who to ask when something does not work." },
  { f: "contact.html", path: "contact.html", title: "Contact | Eboo World", desc: "How to reach Eboo World." },
  { f: "about.html", path: "about.html", title: "About | Eboo World", desc: "What Eboo World is and how its products are made.", noindex: true, hidden: true },
  { f: "privacy.html", path: "privacy.html", title: "Privacy | Eboo World", desc: "Privacy policy.", noindex: true },
  { f: "cookies.html", path: "cookies.html", title: "Cookies | Eboo World", desc: "Cookie information.", noindex: true },
  { f: "terms.html", path: "terms.html", title: "Terms | Eboo World", desc: "Website terms.", noindex: true },
  { f: "404.html", path: "404.html", title: "Page not found | Eboo World", desc: "Page not found.", noindex: true, hidden: true, baseHref: true }
];

function meta(pg) {
  const url = SITE + "/" + pg.path, img = SITE + "/og-image.png";
  return [
    pg.baseHref ? `<base href="${SITE}/">` : "",
    `<title>${h(pg.title)}</title>`,
    `<meta name="description" content="${h(pg.desc)}" />`,
    pg.noindex ? `<meta name="robots" content="noindex,follow" />` : "",
    `<meta name="theme-color" content="#0E0E0E" />`,
    `<link rel="canonical" href="${h(url)}" />`,
    `<meta property="og:type" content="${pg.og || "website"}" /><meta property="og:locale" content="en_US" /><meta property="og:site_name" content="Eboo World" />`,
    `<meta property="og:title" content="${h(pg.title)}" /><meta property="og:description" content="${h(pg.desc)}" />`,
    `<meta property="og:url" content="${h(url)}" /><meta property="og:image" content="${img}" />`,
    `<meta name="twitter:card" content="summary_large_image" /><meta name="twitter:image" content="${img}" />`,
    pg.ld ? `<script type="application/ld+json">${JSON.stringify(pg.ld)}</script>` : ""
  ].filter(Boolean).join("\n  ");
}

function inject(html, key, content) {
  const re = new RegExp("(<!--PR:" + key + ":start-->)[\\s\\S]*?(<!--PR:" + key + ":end-->)");
  if (!re.test(html)) return html;
  return html.replace(re, (m, a, b) => a + content + b);
}

function stamp(html, pg, base) {
  html = html.replace(/<html lang="en"[^>]*>/, `<html lang="en" data-v="${V}">`);
  html = html.replace(/((?:css|js)\/[\w.-]+\.(?:css|js))\?v=[^"']*/g, `$1?v=${V}`);
  html = inject(html, "meta", "\n  " + meta(pg) + "\n  ");
  html = inject(html, "header", R.header(base));
  html = inject(html, "footer", R.footer(base));
  return html;
}

/* --- zwykłe strony --- */
pages.forEach((pg) => {
  let html = rd(pg.f);
  if (pg.f === "index.html") {
    const fan = R.fan(products);
    html = html.replace(/<div class="waclarz[^"]*" id="hero-fan"/, `<div class="${fan.cls}" id="hero-fan"`);
    html = inject(html, "fan", fan.html);
    html = inject(html, "catalog", R.catalog(products, ""));
  }
  wr(pg.f, stamp(html, pg, ""));
});

/* --- strona na każdy produkt: product/<id>.html --- */
const tpl = rd("_templates/product.html");
const keep = new Set();
shown.forEach((p) => {
  const pg = {
    title: p.tytul + " | Eboo World", desc: p.podtytul && R.has(p.podtytul) ? p.podtytul : DESC,
    path: "product/" + p.id + ".html", og: "product"
  };
  const ld = { "@context": "https://schema.org", "@type": "Product", name: p.tytul, description: pg.desc, brand: { "@type": "Brand", name: "Eboo World" } };
  if (R.isLive(p) && R.has(p.cena_eur)) ld.offers = { "@type": "Offer", price: String(p.cena_eur), priceCurrency: "EUR", url: p.link_kup, availability: "https://schema.org/InStock" };
  pg.ld = ld;
  let html = tpl.replace("{{ID}}", h(p.id));
  html = inject(html, "product", R.productMain(p, "../"));
  wr(pg.path, stamp(html, pg, "../"));
  keep.add(p.id + ".html");
});
if (fs.existsSync(path.join(ROOT, "product"))) {
  fs.readdirSync(path.join(ROOT, "product")).forEach((f) => { if (f.endsWith(".html") && !keep.has(f)) fs.unlinkSync(path.join(ROOT, "product", f)); });
}

/* --- sitemap + robots --- */
const urls = pages.filter((p) => !p.noindex && !p.hidden).map((p) => p.path).concat(shown.map((p) => "product/" + p.id + ".html"));
wr("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u) => `  <url><loc>${SITE}/${u}</loc></url>`).join("\n") + "\n</urlset>\n");
wr("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`build ok | v${V} | produkty: ${shown.length}/${products.length} | live: ${shown.filter(R.isLive).length} | site: ${SITE}`);
