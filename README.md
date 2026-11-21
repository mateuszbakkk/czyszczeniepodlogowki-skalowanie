# Mapa potencjału skalowania · czyszczeniepodlogowki.pl

Strona: **https://skalowanie.czyszczeniepodlogowki.pl**

Wewnętrzne narzędzie do planowania, gdzie otwierać kolejne bazy techników czyszczenia podłogówki. Mapa Polski pokazuje, ile w każdym województwie i powiecie jest domów z podłogówką, które są już w wieku do płukania, ile to daje zleceń rocznie i ilu techników taki region udźwignie.

## Co można zrobić na mapie

- przełączać widok: województwa albo powiaty,
- zmieniać, co pokazuje kolor: potencjał w zł, gęstość, wskaźnik skalowania, dynamika, gospodarstwa domowe, zaludnienie, dochód,
- oznaczać regiony statusem (Działamy, Następny, Testujemy, Nie teraz) i dopisywać notatki,
- stawiać bazy techników z promieniem dojazdu i od razu widzieć potencjał w zasięgu,
- regulować założenia rynkowe i kalibrować model wynikami z bazy, w której już działamy.

Oznaczenia, bazy i założenia zapisują się w przeglądarce. Przycisk „Kopiuj link z oznaczeniami” robi link, który przenosi je na inny komputer albo do wspólnika. „Eksport / import” zapisuje je do pliku.

## Dane

| Co | Źródło |
|---|---|
| Mieszkania oddane w budownictwie indywidualnym, 1995–2025, wg powiatów | GUS BDL, zmienne 430 (1995–2004) i 748604 (2005–2025) |
| Nowe budynki jedno- i dwumieszkaniowe 2012–2017 (przeliczenie na wszystkie nowe domy, z deweloperskimi) | GUS BDL, zmienne 377356, 377350 |
| Gospodarstwa domowe, ludność w gospodarstwach | NSP 2021, zmienne 1652549, 1652555 |
| Zamieszkane domy jednorodzinne (budynki z 1 mieszkaniem) | NSP 2021, zmienna 1723984 |
| Powierzchnia | GUS BDL, zmienna 2018 (stan 2024) |
| Dochód rozporządzalny na osobę | GUS, Budżety gospodarstw domowych 2025, zmienne 216968, 288163 |
| Granice województw i powiatów | PRG GUGiK, wersja uproszczona: github.com/ppatrzyk/polska-geojson |

## Jak liczymy

1. Nowe domy w roku = mieszkania oddane w budownictwie indywidualnym × współczynnik województwa (0,99–1,25), który dolicza domy deweloperskie.
2. Domy z podłogówką = nowe domy × udział podłogówki w danym roku budowy (założenie, domyślnie 5% w 1995, 20% w 2005, 45% w 2015, 75% w 2025) + niewielki odsetek starszych domów po remoncie.
3. Do czyszczenia = instalacje mające co najmniej 8 lat (strona: „co 8–10 lat”).
4. Rynek teoretyczny = domy do czyszczenia ÷ cykl 9 lat. Rynek realny = 20% z tego. Twoje zlecenia = 30% rynku realnego albo tempo z kalibracji. Technicy = Twoje zlecenia ÷ 400 rocznie.

Model służy do porównywania regionów. Kwoty zależą od założeń, które można zmieniać w zakładce „Założenia”.

## Pliki

- `index.html`, `style.css`, `app.js` – strona (bez kroku budowania),
- `potencjal.json` – przeliczone dane GUS dla 16 województw i 380 powiatów,
- `wojewodztwa.geojson`, `powiaty.geojson` – granice,
- `leaflet.js`, `leaflet.css` – biblioteka mapy Leaflet 1.9.4,
- `CNAME` – domena dla GitHub Pages, `robots.txt` – strona nie jest indeksowana.

Hosting: GitHub Pages z gałęzi `main`. DNS: rekord CNAME `skalowanie` → `mateuszbakkk.github.io` w Cloudflare (bez proxy).
