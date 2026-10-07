(function () {
  var E = window.EBOO, S = E.site;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (t) { var d = document.createElement("div"); d.textContent = t == null ? "" : t; return d.innerHTML; };
  var attr = function (t) { return esc(t).replace(/"/g, "&quot;"); };

  var AI_NOTE = "Our products are created with the help of AI and reviewed by a human before release.";
  var DISCLAIMERS = {
    finance: "This is a calculation tool, not financial advice.",
    health: "This is general information, not medical advice."
  };

  function product(slug) {
    return E.products.filter(function (p) { return p.slug === slug; })[0] || E.products[0];
  }
  function isLive(p) { return !!(p.link_kup && p.platforma); }
  function price(p) { return "€" + p.price_eur; }

  function cover(p, big) {
    return '<div class="cover' + (big ? " big" : "") + '" style="--c1:' + attr(p.cover[0]) + ';--c2:' + attr(p.cover[1]) + '" role="img" aria-label="Cover of ' + attr(p.title) + '">' +
      '<span class="cover-brand">' + esc(S.name) + '</span><span class="cover-title">' + esc(p.title.split(" (")[0]) + '</span><span class="cover-fmt">PDF + Sheet</span></div>';
  }

  function newsletter(id, intro) {
    return '<form class="nl" data-nl="' + id + '"' + (S.newsletterAction ? ' action="' + attr(S.newsletterAction) + '" method="post"' : "") + '>' +
      (intro ? '<p>' + intro + '</p>' : "") +
      '<label class="sr" for="em-' + id + '">E-mail</label>' +
      '<div class="row"><input id="em-' + id + '" name="email" type="email" required placeholder="you@example.com" autocomplete="email">' +
      '<button class="btn" type="submit">Subscribe</button></div>' +
      '<label class="consent"><input type="checkbox" required> I agree to receive e-mails from ' + esc(S.name) + ' and know I can unsubscribe with one click. <a href="privacy.html">Privacy</a></label></form>';
  }

  function buyButton(p, where) {
    if (isLive(p)) {
      return '<a class="btn big" href="' + attr(p.link_kup) + '" target="_blank" rel="noopener" data-buy="' + attr(p.slug) + '" data-where="' + where + '">Buy on ' + esc(p.platforma) + '</a>';
    }
    return '<span class="badge">Coming soon</span>';
  }

  function card(p) {
    return '<article class="card">' + '<a href="product.html?p=' + encodeURIComponent(p.slug) + '">' + cover(p) + '</a>' +
      '<h3><a href="product.html?p=' + encodeURIComponent(p.slug) + '">' + esc(p.title) + '</a></h3>' +
      '<p class="muted">' + esc(p.subtitle) + '</p>' +
      '<div class="card-foot"><strong>' + price(p) + '</strong>' +
      (isLive(p) ? buyButton(p, "card") : '<span class="badge">Coming soon</span>') + '</div></article>';
  }

  function chrome() {
    var nav = [["index.html", "Shop"], ["free-sheet.html", "Free sheet"], ["help.html", "Help"], ["about.html", "About"], ["contact.html", "Contact"]];
    var here = location.pathname.split("/").pop() || "index.html";
    $("#site-header").innerHTML = '<div class="wrap bar"><a class="logo" href="index.html">' + esc(S.name) + '</a><nav aria-label="Main">' +
      nav.map(function (n) { return '<a href="' + n[0] + '"' + (n[0] === here ? ' aria-current="page"' : "") + ">" + n[1] + "</a>"; }).join("") + "</nav></div>";
    $("#site-footer").innerHTML = '<div class="wrap"><p>' + esc(AI_NOTE) + '</p>' +
      '<p><a href="privacy.html">Privacy</a> · <a href="cookies.html">Cookies</a> · <a href="terms.html">Terms</a> · <a href="help.html">Help</a> · <a href="contact.html">Contact</a></p>' +
      '<p class="muted">Purchases are handled by Etsy. Prices in EUR; Etsy may show the price in your currency. © ' + new Date().getFullYear() + " " + esc(S.name) + ".</p></div>";
  }

  var pages = {
    home: function () {
      $("#catalog").innerHTML = E.products.map(card).join("");
      $("#home-nl").innerHTML = newsletter("home", "Get the free checklist and a note when the next tool is out.");
    },
    product: function () {
      var p = product(new URLSearchParams(location.search).get("p"));
      document.title = p.title + " · " + S.name;
      var d = $("meta[name=description]"); if (d) d.content = p.subtitle;
      var list = function (a) { return "<ul>" + a.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; };
      var buy = isLive(p)
        ? buyButton(p, "top") + '<p class="small muted">Opens the listing on ' + esc(p.platforma) + ' in a new tab.</p>'
        : '<span class="badge">Coming soon</span>' + newsletter("prod", "Not on Etsy yet. Leave your e-mail and we will tell you the day it is live.");
      $("#product").innerHTML =
        '<div class="grid2"><div>' + cover(p, true) + '</div><div>' +
        "<h1>" + esc(p.title) + '</h1><p class="lead">' + esc(p.subtitle) + '</p>' +
        '<p class="price">' + price(p) + ' <span class="small muted">Etsy may show the price in your currency.</span></p>' +
        '<p>' + esc(p.format) + '</p>' + buy + "</div></div>" +
        '<section><h2>What\'s inside</h2><p>' + p.pages + ' pages · ' + p.sheets + ' worksheets' + (p.print ? " · printable version included" : "") + "</p>" + list(p.contents) + "</section>" +
        '<section class="grid2"><div><h2>Who it\'s for</h2>' + list(p.forWho) + '</div><div><h2>Who it\'s not for</h2>' + list(p.notFor) + "</div></section>" +
        (p.sample ? '<section><h2>Free sample</h2><p>See 2–3 pages before you buy.</p><a class="btn ghost" href="' + attr(p.sample) + '" download>Download sample (PDF)</a></section>' : "") +
        '<section><h2>FAQ</h2>' + p.faq.map(function (f) { return "<details><summary>" + esc(f[0]) + "</summary><p>" + esc(f[1]) + "</p></details>"; }).join("") + "</section>" +
        (isLive(p) ? '<section class="cta"><h2>Ready?</h2>' + buyButton(p, "bottom") + "</section>" : "") +
        '<p class="small muted note">' + (DISCLAIMERS[p.disclaimer] ? esc(DISCLAIMERS[p.disclaimer]) + " " : "") + esc(AI_NOTE) + "</p>";
    },
    free: function () {
      $("#free-nl").innerHTML = newsletter("free", "One checklist (PDF) in exchange for your e-mail. No spam, one-click unsubscribe.");
    },
    contact: function () {
      $("#mail").innerHTML = '<a href="mailto:' + attr(S.email) + '">' + esc(S.email) + "</a>";
      $("#reply").textContent = S.replyTime;
    }
  };

  function wire() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("[data-buy]");
      if (a && window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: "buy-" + a.dataset.buy + "-" + a.dataset.where, title: "Buy click", event: true });
      }
    });
    document.addEventListener("submit", function (e) {
      var f = e.target.closest && e.target.closest("form.nl");
      if (!f || S.newsletterAction) return;       // real endpoint: normal submit
      e.preventDefault();
      var m = f.email.value;
      location.href = "mailto:" + S.email + "?subject=" + encodeURIComponent("Subscribe me") + "&body=" + encodeURIComponent("Please add me to the list: " + m);
    });
    if (S.goatcounter) {
      var s = document.createElement("script");
      s.async = true; s.src = "https://gc.zgo.at/count.js";
      s.setAttribute("data-goatcounter", "https://" + S.goatcounter + ".goatcounter.com/count");
      document.head.appendChild(s);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    chrome();
    var k = document.body.dataset.page;
    if (pages[k]) pages[k]();
    document.querySelectorAll("[data-site-email]").forEach(function (n) { n.textContent = S.email; });
    wire();
  });
})();
