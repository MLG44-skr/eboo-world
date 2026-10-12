# minttext.world — strona

Wizytówka marki z produktami cyfrowymi. **Strona nie sprzedaje**: płatność, plik, VAT i faktury robi Etsy.
Kupujący idzie z karty produktu prosto do konkretnej oferty na Etsy ("Buy on Etsy").
Baza techniczna i wygląd: strona "Buduj z AI" (ciemny motyw, akcent limonkowy, dane w JSON, prerender SEO).

## Najważniejsze: jak podpiąć Etsy
Otwórz `data/products.json`, przy produkcie ustaw:
```
"link_kup": "https://www.etsy.com/listing/XXXX/...",
"platforma": "Etsy",
"status": "dostepny",
"cena_eur": 9
```
Potem `node build.js`, commit, push. Przycisk "Buy on Etsy" otwiera ofertę w nowej karcie (`target="_blank" rel="noopener"`).
Jeśli `link_kup` albo `platforma` jest puste / w `[NAWIASIE]` albo `status` = `wkrotce`, pokazuje się **"Coming soon" + "Notify me"**. Martwy przycisk nigdy się nie pojawia.

## Dodanie produktu
Dopisz blok w `data/products.json` (wzór: pierwszy produkt) i uruchom `node build.js`.
Okładka rysuje się w kodzie z `tytul_okladka`, `kolor_okladki`, `kolor_akcent`. Każdy produkt dostaje własną stronę `product/<id>.html`.
Wartości w `[NAWIASACH]` są ukryte na stronie, dopóki ich nie uzupełnisz.

## Build (obowiązkowo po każdej zmianie w `data/`, `js/`, `css/`)
```
node build.js
```
Bez zależności (czysty Node). Robi: prerender katalogu i okładek (widoczne dla Google bez JS), strony produktów,
header/footer na każdej stronie, canonical/OG, `sitemap.xml`, `robots.txt` i cache-busting (`?v=<hash>`).

## Podgląd lokalny
```
python3 -m http.server 8080
```
i `http://localhost:8080/`.

## Konfiguracja: `js/config.js`
| pole | co robi |
|---|---|
| `SITE_URL` | adres strony (canonical, OG, sitemap). Po wpięciu domeny podmień i zrób build |
| `CONTACT_EMAIL` | e-mail na własnej domenie (Kontakt, Pomoc) |
| `NEWSLETTER_ACTION` | adres formularza z MailerLite/Buttondown/Formspree. Puste = "Sign-ups open soon" |
| `ANALYTICS_GOATCOUNTER` | URL licznika GoatCounter. Puste = wyłączone. Włączone liczy kliknięcia "Buy on Etsy" (bez cookies) |

## GitHub Pages
Settings → Pages → Deploy from a branch → wybierz branch, folder `/ (root)`. Wygenerowane pliki są w repo, więc nic więcej nie trzeba.

## Zasady
- Płatne pliki **nie** leżą w publicznym repo. `samples/` to tylko 2–3 stronowe próbki.
- Z ofert na Etsy nie linkuj do płatnej wersji poza Etsy (zasady Etsy).
- Nie dodawaj obietnic zarobków, wymyślonych opinii ani liczników sprzedaży.
- Strony prawne (`privacy`, `cookies`, `terms`) to szablony: uzupełnij po rozmowie z księgową. Są `noindex` do czasu uzupełnienia.
- `about.html` jest zbudowana, ale ukryta (poza menu i sitemapą), dopóki nie zdecydujesz o wersji anonimowej.
