/* =========================================================================
   MINTTEXT.WORLD — interakcje strony (vanilla JS). Treść jest już prerenderowana
   przez build.js; tu: odświeżenie z JSON, menu, newsletter, analityka, kontakt.
   ========================================================================= */
(function () {
  "use strict";
  var R = window.EBOO_RENDER, cfg = window.EBOO_CONFIG || {};
  var V = document.documentElement.getAttribute("data-v") || "1";
  var BASE = document.body.getAttribute("data-base") || "";
  var qs = function (s, r) { return (r || document).querySelector(s); };

  function loadProducts() {
    return fetch(BASE + "data/products.json?v=" + V, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("products.json");
      return r.json();
    });
  }

  /* Odśwież listę/stronę produktu z JSON (prerender zostaje jako fallback bez JS). */
  function hydrate() {
    var catalog = qs("#catalog"), root = qs("#product-root"), fan = qs("#hero-fan");
    if (!catalog && !root) return;
    loadProducts().then(function (products) {
      if (catalog) catalog.innerHTML = R.catalog(products, BASE);
      if (fan) { var f = R.fan(products); fan.className = f.cls; fan.innerHTML = f.html; }
      if (root) {
        var p = R.visible(products).filter(function (x) { return x.id === document.body.getAttribute("data-product"); })[0];
        if (p) root.innerHTML = R.productMain(p, BASE);
      }
    }).catch(function (e) { if (window.console) console.warn(e); });
  }

  function initNav() {
    var t = qs("#nav-toggle"), n = qs("#nav");
    if (!t || !n) return;
    t.addEventListener("click", function () {
      var open = n.classList.toggle("otwarte");
      t.setAttribute("aria-expanded", open ? "true" : "false");
    });
    n.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { n.classList.remove("otwarte"); t.setAttribute("aria-expanded", "false"); }
    });
  }

  /* Newsletter: formularz pojawia się dopiero, gdy jest NEWSLETTER_ACTION. Zwykły POST do dostawcy, bez własnego backendu. */
  function initNewsletter() {
    var slot = qs("#newsletter-slot");
    if (!slot || !R.has(cfg.NEWSLETTER_ACTION)) return;
    slot.innerHTML =
      '<form class="newsletter__form" method="post" action="' + R.h(cfg.NEWSLETTER_ACTION) + '" target="_blank">' +
      '<div class="pole"><label for="nl-email">Your e-mail</label>' +
      '<input type="email" id="nl-email" name="email" autocomplete="email" placeholder="you@example.com" required></div>' +
      '<div class="zgoda"><input type="checkbox" id="nl-consent" name="consent" required>' +
      '<label for="nl-consent">I agree to receive e-mails from minttext.world and I know I can unsubscribe at any time. <a href="' + BASE + 'privacy.html">Privacy</a></label></div>' +
      '<button type="submit" class="btn btn--ciemny">Subscribe</button></form>';
  }

  function initContact() {
    if (!R.has(cfg.CONTACT_EMAIL)) return;
    var els = document.querySelectorAll("[data-contact-email]");
    Array.prototype.forEach.call(els, function (a) {
      a.textContent = cfg.CONTACT_EMAIL;
      if (a.tagName === "A") a.setAttribute("href", "mailto:" + cfg.CONTACT_EMAIL);
    });
  }

  /* Analityka bez cookies (GoatCounter). Liczy też kliknięcia "Buy on Etsy": jedyna liczba, której Etsy nie pokaże. */
  function initAnalytics() {
    if (!R.has(cfg.ANALYTICS_GOATCOUNTER)) return;
    var s = document.createElement("script");
    s.async = true; s.src = "//gc.zgo.at/count.js";
    s.setAttribute("data-goatcounter", cfg.ANALYTICS_GOATCOUNTER);
    document.body.appendChild(s);
    var note = qs("[data-analytics-note]"); if (note) note.hidden = false;
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("[data-buy]");
      if (a && window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: "buy/" + a.getAttribute("data-buy") + "/" + a.getAttribute("data-where"), title: "Buy click", event: true });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var y = qs("#rok"); if (y) y.textContent = new Date().getFullYear();
    initNav(); initNewsletter(); initContact(); initAnalytics(); hydrate();
  });
})();
