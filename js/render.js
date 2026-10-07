/* =========================================================================
   EBOO WORLD — wspólny render (przeglądarka + build.js). Jedno źródło prawdy:
   te same funkcje robią prerender SEO (node build.js) i odświeżenie w przeglądarce.
   Wartości w [NAWIASACH] to placeholdery: nigdy nie trafiają na stronę.
   ========================================================================= */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.EBOO_RENDER = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var AI_NOTE = "Our products are created with the help of AI and reviewed by a human before release.";
  var ZASTRZEZENIA = {
    finance: "This is a calculation tool, not financial advice.",
    health: "This is general information, not medical advice."
  };

  function h(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  var isPH = function (v) { return typeof v === "string" && v.trim().charAt(0) === "["; };
  var has = function (v) { return v != null && v !== "" && !isPH(v); };
  var list = function (a) { return (a || []).filter(has); };
  var color = function (c, d) { return /^#[0-9a-f]{3,8}$/i.test(c || "") ? c : d; };

  /* Produkt z placeholderowym tytułem nie jest publikowany. */
  function visible(products) { return products.filter(function (p) { return has(p.tytul); }); }

  /* Przycisk kupna działa tylko, gdy są oba pola: link_kup i platforma. Inaczej "Coming soon", nigdy martwy przycisk. */
  function isLive(p) { return p.status !== "wkrotce" && has(p.link_kup) && has(p.platforma); }

  function href(p, base) { return (base || "") + "product/" + encodeURIComponent(p.id) + ".html"; }

  /* Okładka jako inline SVG 400x640: skaluje się identycznie w hero, na karcie i na stronie produktu. */
  function wrap(text, max) {
    var lines = [], cur = "";
    String(text).split(/\s+/).forEach(function (w) {
      if (cur && (cur + " " + w).length > max) { lines.push(cur); cur = w; } else { cur = cur ? cur + " " + w : w; }
    });
    if (cur) lines.push(cur);
    return lines.slice(0, 5);
  }
  function cover(p) {
    var t = has(p.tytul_okladka) ? p.tytul_okladka : String(p.tytul).replace(/\s*\(.*$/, "");
    var c = color(p.kolor_okladki, "#1F6F5C"), ak = color(p.kolor_akcent, "#E8FF3A");
    var lines = wrap(t, 12), long = lines.some(function (l) { return l.length > 12; });
    var fs = long ? 46 : 58, gid = "cg" + c.replace(/[^0-9a-f]/gi, "");
    var tspans = lines.map(function (l, i) { return '<tspan x="36" dy="' + (i ? fs * 1.08 : 0) + '">' + h(l) + "</tspan>"; }).join("");
    return '<svg class="cover cover-gen" viewBox="0 0 400 640" role="img" aria-label="Cover: ' + h(p.tytul) + '" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="' + c + '"/><stop offset="1" stop-color="' + c + '" stop-opacity=".55"/></linearGradient></defs>' +
      '<rect width="400" height="640" fill="#0E0E0E"/><rect width="400" height="640" fill="url(#' + gid + ')"/>' +
      '<text x="36" y="64" fill="#fff" fill-opacity=".85" font-size="19" font-weight="700" letter-spacing="5">EBOO WORLD</text>' +
      '<text x="36" y="250" fill="#fff" font-family="Bricolage Grotesque, system-ui, sans-serif" font-size="' + fs + '" font-weight="800" letter-spacing="-1.5">' + tspans + "</text>" +
      '<rect x="36" y="552" width="150" height="40" rx="20" fill="' + ak + '"/>' +
      '<text x="111" y="578" text-anchor="middle" fill="#0E0E0E" font-size="17" font-weight="700" letter-spacing="1.5">PDF + SHEET</text></svg>';
  }

  function price(p) {
    return has(p.cena_eur) ? '<span class="ebook__cena">€' + h(p.cena_eur) + "</span>" : "";
  }

  function buy(p, where, big) {
    var size = big ? "btn--duzy" : "btn--maly";
    if (isLive(p)) {
      return '<a class="btn btn--akcent ' + size + '" href="' + h(p.link_kup) + '" target="_blank" rel="noopener" data-buy="' +
        h(p.id) + '" data-where="' + where + '">Buy on ' + h(p.platforma) + "</a>";
    }
    return '<a class="btn btn--obrys ' + size + '" href="#newsletter">Notify me</a>';
  }

  function badge(p) {
    return isLive(p) ? '<span class="badge">Available</span>' : '<span class="badge badge--wkrotce">Coming soon</span>';
  }

  /* Karta produktu na stronie głównej */
  function card(p, base) {
    var pts = list(p.w_srodku).slice(0, 3).map(function (x) { return "<li>" + h(x) + "</li>"; }).join("");
    return '<article class="karta ebook"><div class="ebook__cover"><a href="' + href(p, base) + '" aria-label="' + h(p.tytul) + '">' + cover(p) + "</a></div>" +
      '<div class="ebook__tresc">' + badge(p) +
      '<h3 class="ebook__tytul"><a href="' + href(p, base) + '">' + h(p.tytul) + "</a></h3>" +
      (has(p.podtytul) ? "<p>" + h(p.podtytul) + "</p>" : "") +
      (pts ? '<ul class="ebook__punkty">' + pts + "</ul>" : "") +
      '<div class="ebook__stopka">' + price(p) + buy(p, "card") + "</div></div></article>";
  }

  function catalog(products, base) {
    var v = visible(products);
    if (!v.length) return '<p class="hero__sub">The first products are on their way. Sign up below to hear when they are live.</p>';
    return v.map(function (p) { return card(p, base); }).join("");
  }

  /* Wachlarz okładek w hero */
  function fan(products) {
    var v = visible(products).slice(0, 3);
    return v.length ? { cls: v.length < 3 ? "waclarz waclarz--n" + v.length : "waclarz", html: v.map(function (p) { return cover(p); }).join("") } : { cls: "waclarz", html: "" };
  }

  /* Cała zawartość <main> strony produktu */
  function productMain(p, base) {
    var ul = function (cls, a) { return '<ul class="' + cls + '">' + a.map(function (x) { return "<li>" + h(x) + "</li>"; }).join("") + "</ul>"; };
    var inside = list(p.w_srodku), forW = list(p.dla_kogo), notF = list(p.nie_dla), faq = (p.faq || []).filter(function (f) { return has(f[0]) && has(f[1]); });
    var meta = [];
    if (has(p.strony)) meta.push(h(p.strony) + " pages");
    if (has(p.arkusze)) meta.push(h(p.arkusze) + " worksheets");
    if (p.druk) meta.push("printable version");
    var live = isLive(p);
    var out = '<section><div class="kontener"><p class="nadtytul"><a href="' + (base || "") + 'index.html#shop">← All products</a></p>' +
      '<div class="produkt__grid"><div class="produkt__cover">' + cover(p) + "</div><div>" +
      badge(p) + '<h1 style="margin-top:12px">' + h(p.tytul) + "</h1>" +
      (has(p.podtytul) ? '<p class="hero__sub">' + h(p.podtytul) + "</p>" : "") +
      (has(p.cena_eur) ? '<div class="produkt__cena">' + price(p) + '<span class="mala">Price in EUR. Etsy may show it in your currency.</span></div>' : "") +
      (has(p.format) ? '<p class="produkt__format">' + h(p.format) + "</p>" : "") +
      '<div class="hero__akcje" style="margin-top:0">' + buy(p, "top", true) + "</div>" +
      (live ? '<p class="mala">Opens the ' + h(p.platforma) + " listing in a new tab. Payment and delivery are handled by " + h(p.platforma) + ".</p>"
            : '<p class="mala">Not on Etsy yet. Leave your e-mail below and we will tell you when it is live.</p>') +
      "</div></div></div></section>";

    if (inside.length) out += '<section><div class="kontener"><div class="sekcja__head"><p class="nadtytul">Inside</p><h2>What\'s inside</h2>' +
      (meta.length ? "<p>" + meta.join(" · ") + "</p>" : "") + "</div>" + ul("lista-ok", inside) + "</div></section>";
    if (forW.length || notF.length) out += '<section><div class="kontener"><div class="dwie-kolumny">' +
      (forW.length ? '<div class="karta"><h3>Who it\'s for</h3>' + ul("lista-ok", forW) + "</div>" : "") +
      (notF.length ? '<div class="karta"><h3>Who it\'s not for</h3>' + ul("lista-nie", notF) + "</div>" : "") + "</div></div></section>";
    if (has(p.probka)) out += '<section><div class="kontener"><div class="sekcja__head"><p class="nadtytul">Try before you buy</p><h2>Free sample</h2><p>A few pages of the guide, so you know what to expect.</p></div>' +
      '<a class="btn btn--obrys" href="' + h((base || "") + p.probka) + '" download>Download sample (PDF)</a></div></section>';
    if (faq.length) out += '<section><div class="kontener"><div class="sekcja__head"><p class="nadtytul">Questions</p><h2>FAQ</h2></div><div class="faq">' +
      faq.map(function (f) { return "<details><summary>" + h(f[0]) + "</summary><p>" + h(f[1]) + "</p></details>"; }).join("") + "</div></div></section>";
    if (live) out += '<section><div class="kontener cta-koniec"><h2>Ready?</h2>' + buy(p, "bottom", true) + "</div></section>";
    out += '<section><div class="kontener"><p class="zastrzezenie">' + (ZASTRZEZENIA[p.zastrzezenie] ? h(ZASTRZEZENIA[p.zastrzezenie]) + " " : "") + h(AI_NOTE) + "</p></div></section>";
    return out;
  }

  /* Wspólne elementy strony (header, stopka) */
  function header(base) {
    base = base || "";
    return '<div class="kontener header__row"><a class="logo" href="' + base + 'index.html" aria-label="Eboo World, home">EBOO WORLD<span class="kropka">.</span></a>' +
      '<button id="nav-toggle" class="nav__toggle" aria-label="Menu" aria-expanded="false" aria-controls="nav">☰</button>' +
      '<nav id="nav" class="nav" aria-label="Main"><ul class="nav__links">' +
      '<li><a href="' + base + 'index.html#shop">Shop</a></li><li><a href="' + base + 'help.html">Help</a></li><li><a href="' + base + 'contact.html">Contact</a></li></ul>' +
      '<a class="btn btn--akcent btn--maly" href="' + base + 'free-sheet.html">Free checklist</a></nav></div>';
  }
  function footer(base) {
    base = base || "";
    return '<div class="kontener"><p class="mala" style="margin:0 0 14px">' + h(AI_NOTE) + " Purchases are handled by Etsy. Prices in EUR; Etsy may show them in your currency.</p>" +
      '<div class="footer__row"><small>© <span id="rok">2026</span> Eboo World</small><ul class="footer__links" id="footer-links">' +
      '<li><a href="' + base + 'help.html">Help</a></li><li><a href="' + base + 'contact.html">Contact</a></li><li><a href="' + base + 'privacy.html">Privacy</a></li>' +
      '<li><a href="' + base + 'cookies.html">Cookies</a></li><li><a href="' + base + 'terms.html">Terms</a></li></ul></div></div>';
  }

  return { h: h, isPH: isPH, has: has, visible: visible, isLive: isLive, href: href, cover: cover, card: card, catalog: catalog, fan: fan,
           productMain: productMain, header: header, footer: footer, AI_NOTE: AI_NOTE };
});
