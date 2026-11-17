# Ingredient Ledger

**Is it vegan, vegetarian, lacto-vegetarian or non-vegetarian?** Check any food, drink, ingredient, E-number, medicine or vaccine in seconds. You get the verdict and exactly how each ingredient is derived. The app also finds vegetarian restaurants and grocery stores anywhere in the world.

A single static page: no accounts, no tracking, no server of its own. It works offline for the built-in index and calls free public databases straight from your browser.

## The categories

| Verdict | Meaning |
|---|---|
| **Vegan** | Plant, mineral, fungal or microbial. No animal product of any kind. |
| **Vegetarian (no dairy)** | No meat, fish, egg or dairy, but contains a non-dairy by-product of living animals (honey, beeswax, lanolin). Nothing killed. |
| **Lacto-vegetarian** | Contains milk or dairy (ghee, butter, curd, paneer, whey, casein). Taken from a living animal, nothing killed. |
| **Non-vegetarian** | Egg, fish or meat, or any essence, stock, fat, gelatine, extract or by-product of them, plus insects (carmine, shellac) and animal rennet. |
| **Needs checking** | Can come from plants or animals depending on the maker. With **Strict** on (the default), these count as *avoid*. |

**Was an animal killed?** Every entry answers this. If no animal is killed (milk, honey, wool wax, horse-serum antivenoms, vaccines made in cultured cell lines such as Flublok, Flucelvax and Shingrix, and mRNA vaccines), it is listed as **suitable for vegetarians**, with a disclaimer where the product still has an animal origin. Eggs are the one exception by this site's rule.

**Alternatives:** 175+ entries list vegetarian or vegan swaps. Examples: agar or pectin for gelatine, beet red for carmine, microbial rennet cheeses, algal omega-3, lichen D3, HPMC capsules, levothyroxine instead of pig thyroid, egg-free flu vaccines, and Priorix instead of gelatine-containing MMR.

**Cheese is strict:** every cheese counts as non-vegetarian unless the label says microbial, vegetable or "suitable for vegetarians" rennet, because traditional rennet comes from slaughtered calves.

## What it does

- **One search box.** Type an ingredient, E-number, product, dish, medicine or vaccine, or a barcode. It searches the built-in index (330 curated entries with source and process) instantly, then live databases.
- **The index grows.** Scroll and the next entries load automatically. Type in the index filter and, after a short pause, matching ingredients from the Open Food Facts ingredient database that aren't in the index yet are added as **"Added live"** entries. They are classified with this site's rules (egg and cheese count as non-vegetarian) and kept in your browser for next time. The curated built-in entries still work offline.
- **Scan a barcode** with the phone camera, or from a photo.
- **Photo of a label.** On-device text recognition reads the ingredient list, then every ingredient is colour-coded.
- **Paste anything**, such as a label, menu or medicine leaflet, or read a web page.
- **Your diet:** Lacto-vegetarian (dairy, no egg), Lacto-ovo vegetarian (dairy + egg), or Vegan. Every result says "Fine for you / Not for you / Check". The Reference Index puts compatible matches first while keeping all filtered matches visible.
- **Restaurants & food places** worldwide or near you: 100% vegan, pure vegetarian, vegan options, vegetarian options, places whose name says vegetarian, veg-friendly cuisines, and gurdwaras and temples serving free vegetarian langar. Each shows open-now status, menu links and a cuisine-by-cuisine "what to order and what to ask" guide. Results come from three OpenStreetMap services at once (Nominatim, Photon, and Overpass when it isn't overloaded), so local search keeps working when one is down.
- **Any place on Earth:** type a country, state, city, town or village. Suggestions appear as you type (GeoNames via Open-Meteo, including small villages). Pick a whole country or state and the app lists its main towns and cities (from Wikidata) to choose from. Search radius goes up to 50 km.
- **Find a product near you:** "Find near me" on a product lists nearby grocery stores, plus where shoppers recently saw that exact product (Open Prices), sorted by distance.
- **Grocery & food stores:** health/organic, fresh produce and markets, Indian and world grocers, and supermarkets. "Check stock" links search the store's own website, and **"Recently seen here"** shows products shoppers have recently photographed on its shelves (Open Prices).
- **"Where it's been seen"** for any barcode: shops where it was recently on sale, with price and date.
- **Installable** as an app (Add to Home Screen) with light and dark themes.

## Data sources (all free; most need no sign-up)

| Source | Used for | Key |
|---|---|---|
| Open Food Facts (+ search-a-licious, ingredient taxonomy) | Packaged food & drink, barcodes, per-ingredient analysis | none |
| Open Beauty Facts / Open Products Facts | Personal care & other consumables (barcode fallback) | none |
| Open Prices | Where and when a product was on a shop shelf | none |
| USDA FoodData Central | Generic (unbranded) foods and US branded foods with full ingredients | `DEMO_KEY` (or your own free key) |
| openFDA drug labels, NIH DailyMed | Medicine & vaccine excipients (inactive ingredients) | none |
| NIH RxNorm | Medicine name spelling suggestions | none |
| TheMealDB, TheCocktailDB | Recipes & cocktails, every ingredient checked | public test key |
| Fruityvice | Whole-fruit facts | none |
| Wikipedia | Background on what something is | none |
| OpenStreetMap (Overpass, Nominatim, Photon by Komoot), Open-Meteo geocoding | Restaurants, stores, gurdwaras/temples, places | none |
| Wikidata | Main towns and cities of a country or state | none |
| Spoonacular *(optional)* | Products, diet-matched recipes, chain-restaurant dishes | your own free key, stored only in your browser |

Not used: Edamam, API Ninjas, FatSecret and RapidAPI need sign-up. wger re-publishes Open Food Facts nutrition data without ingredient lists.

## Run it

Open `index.html` in a browser. That's it.

## Browser screenshots

Requires Node.js 22 and npm. The Playwright suite checks the search/home flow
and Reference Index in desktop and mobile viewports. It also checks index
filtering and a denied-camera flow using a mocked camera permission response;
external requests are intercepted so tests do not need API credentials,
third-party services, or camera hardware.

```sh
npm ci
npx playwright install chromium
npm run test:visual
```

Named screenshots are saved to `test-results/screenshots/` (for example,
`search-home-desktop.png` and `reference-index-mobile.png`). The directory is
generated output and is git-ignored. In GitHub Actions, download the
`ingredient-ledger-screenshots` artifact from the Visual browser tests run to
inspect the captured images.

## Deploy

**GitHub Pages:** in the repo, go to Settings → Pages → *Deploy from a branch* → `main` / root. The site appears at `https://<user>.github.io/ingredient-ledger/`.

**Cloudflare Pages (recommended):** in the Cloudflare dashboard, go to Workers & Pages → Create → Pages → *Connect to Git* and pick this repo. Set build command to *(none)* and output directory to `/`. Cloudflare also runs `functions/api/proxy.js`, which relays the few allow-listed APIs that browsers can't call directly (for example DailyMed, Fruityvice, and USDA) and caches them for an hour. A visitor-entered USDA key is included in USDA request URLs; if a direct request fails, the site may retry through `/api/proxy`, whose request URL contains the key.

**Spoonacular for every visitor (optional):** in the Cloudflare Pages project, go to Settings → Variables and Secrets and add a secret named `SPOONACULAR_KEY`. `functions/api/spoon.js` then calls Spoonacular server-side with that key. The key never reaches the browser, only the read-only endpoints the site uses are allowed, and answers are cached for 6 hours to save quota. A visitor's own key, if they enter one under API keys, still takes priority.

Or from a terminal: `npx wrangler pages deploy . --project-name ingredient-ledger`

## Honest limits

- **Formulations change.** Treat every verdict as a strong starting point and check the pack in your hand.
- **Sources can vary by maker.** A curated ingredient reference is not product-specific verification; unclear sources are marked for checking (or Avoid with Strict on), and no numeric confidence score is implied.
- **Strict only changes uncertain ingredient sources.** “May contain” and other shared-line warnings are shown separately; Strict does not assess cross-contact risk.
- A clean scan means nothing flagged, not certified.
- Crowd-sourced data (Open Food Facts, OpenStreetMap, Open Prices) can be incomplete or out of date.
- **There is no free public source of live store inventory.** "Recently seen" is proof of a past sighting, not current stock.
- Not medical, religious or allergy advice. Never skip a prescribed medicine or vaccine on this basis; ask your pharmacist for an alternative.

Data © Open Food Facts contributors (ODbL), © OpenStreetMap contributors (ODbL), USDA FoodData Central (public domain), openFDA / NLM (public domain), TheMealDB, Wikipedia (CC BY-SA). Code: GPL-3.0 (see LICENSE).
