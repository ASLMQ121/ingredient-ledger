// Cloudflare Pages Function: GET /api/spoon?path=<spoonacular path>&<params>
// Calls Spoonacular with the site owner's key, which lives only in the Cloudflare secret SPOONACULAR_KEY
// (Pages project → Settings → Variables and Secrets). The key never reaches the browser.
// Only the read-only endpoints the site uses are allowed, and answers are cached to save the daily quota.

const ALLOWED_PATHS = [
  /^\/food\/products\/search$/,
  /^\/food\/products\/\d{1,12}$/,
  /^\/food\/products\/upc\/\d{6,14}$/,
  /^\/recipes\/complexSearch$/,
  /^\/food\/menuItems\/search$/,
];
const ALLOWED_PARAMS = new Set(["query", "number", "diet", "intolerances", "offset"]);
const CACHE_SECONDS = 6 * 60 * 60;

const reply = (body, status, extra) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...(extra || {}) },
  });

export async function onRequestGet({ request, env, waitUntil }) {
  const url = new URL(request.url);
  const path = url.searchParams.get("path") || "";
  const key = env.SPOONACULAR_KEY;

  // the page asks this once to decide whether to offer Spoonacular to every visitor
  if (path === "status") return reply({ configured: !!key }, 200);
  if (!key) return reply({ error: "Spoonacular is not configured on this site" }, 503);
  if (!ALLOWED_PATHS.some(re => re.test(path))) return reply({ error: "path not allowed" }, 403);

  // rebuild the query from allow-listed parameters only (never forward an apiKey from the browser)
  const qs = new URLSearchParams();
  for (const [k, v] of url.searchParams) if (ALLOWED_PARAMS.has(k)) qs.set(k, v.slice(0, 200));
  const number = Number(qs.get("number") || 0);
  if (number > 12) qs.set("number", "12");

  const publicTarget = "https://api.spoonacular.com" + path + (qs.toString() ? "?" + qs : "");
  const cache = caches.default;
  const cacheKey = new Request(publicTarget, { method: "GET" }); // cache key never contains the secret
  const hit = await cache.match(cacheKey);
  if (hit) {
    const r = new Response(hit.body, hit);
    r.headers.set("x-cache", "hit");
    return r;
  }

  qs.set("apiKey", key);
  let upstream;
  try {
    upstream = await fetch("https://api.spoonacular.com" + path + "?" + qs, { headers: { accept: "application/json" } });
  } catch {
    return reply({ error: "Spoonacular unreachable" }, 502);
  }
  // pass quota errors through with their status so the page can explain them, but never cache them
  const body = await upstream.text();
  const res = new Response(body, {
    status: upstream.status,
    headers: { "content-type": "application/json", "cache-control": upstream.ok ? "public, max-age=" + CACHE_SECONDS : "no-store" },
  });
  if (upstream.ok) waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}
