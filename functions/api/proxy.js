// Cloudflare Pages Function: GET /api/proxy?url=<https URL>
// Relays a short allow-list of free public food/medicine APIs that don't send CORS headers,
// identifies the app to them with a proper User-Agent, and caches answers for an hour.
// It is NOT an open proxy: any other host is refused, and only GET is supported.

const ALLOWED_HOSTS = new Set([
  "dailymed.nlm.nih.gov",
  "rxnav.nlm.nih.gov",
  "api.fda.gov",
  "prices.openfoodfacts.org",
  "search.openfoodfacts.org",
  "world.openfoodfacts.org",
  "world.openbeautyfacts.org",
  "world.openproductsfacts.org",
  "www.themealdb.com",
  "www.thecocktaildb.com",
  "api.nal.usda.gov",
  "www.fruityvice.com",
  "wger.de",
  "nominatim.openstreetmap.org",
  "en.wikipedia.org",
]);

const UA = "IngredientLedger/1.0 (+https://github.com/ranjpun/ingredient-ledger)";
const MAX_BYTES = 3 * 1024 * 1024;

const reply = (body, status) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });

export async function onRequestGet({ request, waitUntil }) {
  const raw = new URL(request.url).searchParams.get("url");
  let target;
  try {
    target = new URL(raw);
  } catch {
    return reply({ error: "missing or invalid url" }, 400);
  }
  if (target.protocol !== "https:" || !ALLOWED_HOSTS.has(target.hostname)) {
    return reply({ error: "host not allowed" }, 403);
  }

  const cache = caches.default;
  const cacheKey = new Request(target.toString(), { method: "GET" });
  let res = await cache.match(cacheKey);

  if (!res) {
    let upstream;
    try {
      upstream = await fetch(target.toString(), {
        headers: { "user-agent": UA, accept: request.headers.get("accept") || "*/*" },
      });
    } catch (err) {
      return reply({ error: "upstream unreachable" }, 502);
    }
    const len = Number(upstream.headers.get("content-length") || 0);
    if (len > MAX_BYTES) return reply({ error: "response too large" }, 413);

    res = new Response(upstream.body, upstream);
    res.headers.set("cache-control", "public, max-age=3600");
    res.headers.delete("set-cookie");
    if (upstream.ok) waitUntil(cache.put(cacheKey, res.clone()));
  }

  const out = new Response(res.body, res);
  out.headers.set("access-control-allow-origin", "*");
  out.headers.set("x-proxied-by", "ingredient-ledger");
  return out;
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "accept",
    },
  });
}
