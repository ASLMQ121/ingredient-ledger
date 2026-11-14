# Ingredient Ledger

**Is it vegan, vegetarian, lacto-vegetarian or non-vegetarian?** Check any food, drink, ingredient, E-number, medicine or vaccine in seconds. You get the verdict and exactly how each ingredient is derived. The app also finds vegetarian restaurants and grocery stores anywhere in the world.

A single static page: no accounts, no tracking, no server of its own. It works offline for the built-in index and calls free public databases straight from your browser.

## The categories

| Verdict | Meaning |
|---|---|
| **Vegan** | Plant, mineral, fungal or microbial. No animal product of any kind. |
| **Vegetarian** | No meat, fish, egg or dairy, but contains a non-dairy by-product of living animals (honey, beeswax, lanolin). Nothing killed. |
| **Lacto-vegetarian** | Contains milk or dairy (ghee, butter, curd, paneer, whey, casein). Taken from a living animal, nothing killed. |
| **Non-vegetarian** | Egg, fish or meat, or any essence, stock, fat, gelatine, extract or by-product of them, plus insects (carmine, shellac) and animal rennet. |
| **Needs checking** | Can come from plants or animals depending on the maker. With **Strict** on (the default), these count as *avoid*. |

**Cheese is strict:** every cheese counts as non-vegetarian unless the label says microbial, vegetable or "suitable for vegetarians" rennet, because traditional rennet comes from slaughtered calves.

## What it does

- **One search box.** Type an ingredient, E-number, product, dish, medicine or vaccine, or a barcode. It searches the built-in index (324 curated entries with source and process) instantly, then live databases.
- **Scan a barcode** with the phone camera, or from a photo.
- **Photo of a label.** On-device text recognition reads the ingredient list, then every ingredient is colour-coded.
- **Paste anything**, such as a label, menu or medicine leaflet, or read a web page.
- **Your diet:** Vegetarian (no egg), Vegetarian + egg, or Vegan. Every result says "Fine for you / Not for you / Check".
- **Restaurants & food places** worldwide or near you: 100% vegan, pure vegetarian, vegan options, vegetarian options, with open-now status, menu links and a cuisine-by-cuisine "what to order and what to ask" guide.
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
| OpenStreetMap (Overpass, Nominatim), Open-Meteo geocoding | Restaurants, stores, places | none |
| Spoonacular *(optional)* | Products, diet-matched recipes, chain-restaurant dishes | your own free key, stored only in your browser |

Not used: Edamam, API Ninjas, FatSecret and RapidAPI need sign-up. wger re-publishes Open Food Facts nutrition data without ingredient lists.

## Run it

Open `index.html` in a browser. That's it.

## Deploy

**GitHub Pages:** in the repo, go to Settings → Pages → *Deploy from a branch* → `main` / root. The site appears at `https://<user>.github.io/ingredient-ledger/`.

**Cloudflare Pages (recommended):** in the Cloudflare dashboard, go to Workers & Pages → Create → Pages → *Connect to Git* and pick this repo. Set build command to *(none)* and output directory to `/`. Cloudflare also runs `functions/api/proxy.js`, which relays the few allow-listed APIs that browsers can't call directly (for example DailyMed and Fruityvice) and caches them for an hour.

Or from a terminal: `npx wrangler pages deploy . --project-name ingredient-ledger`

## Honest limits

- **Formulations change.** Treat every verdict as a strong starting point and check the pack in your hand.
- A clean scan means nothing flagged, not certified.
- Crowd-sourced data (Open Food Facts, OpenStreetMap, Open Prices) can be incomplete or out of date.
- **There is no free public source of live store inventory.** "Recently seen" is proof of a past sighting, not current stock.
- Not medical, religious or allergy advice. Never skip a prescribed medicine or vaccine on this basis; ask your pharmacist for an alternative.

Data © Open Food Facts contributors (ODbL), © OpenStreetMap contributors (ODbL), USDA FoodData Central (public domain), openFDA / NLM (public domain), TheMealDB, Wikipedia (CC BY-SA). Code: GPL-3.0 (see LICENSE).
