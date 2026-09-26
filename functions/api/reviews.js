/*
 * GET /api/reviews
 *
 * Returns the clinic's current review rating and count so the page can update
 * itself as new reviews arrive. Runs as a Cloudflare Pages Function.
 *
 * Source: the public HighLevel (LeadConnector) Reputation review widget for the
 * IOC sub-account. HighLevel syncs the Google Business Profile reviews that Warp
 * Drive connects in Reputation → Settings, and the widget page server-renders an
 * aggregate (total reviews, average rating) inside `window.__SSR_DATA__`. Reading
 * that aggregate needs no API key and incurs no Google Maps Platform billing.
 *
 * Optional environment variables (Pages project → Settings → Variables and Secrets):
 *   GHL_LOCATION_ID  HighLevel sub-account ID. Defaults to IOC's.
 *   GHL_WIDGET_ID    A specific review widget ID, e.g. one configured for Google
 *                    reviews only. Defaults to the sub-account's default widget.
 *
 * Responses are cached at the edge for CACHE_SECONDS.
 */

const CACHE_SECONDS = 60 * 60;
const DEFAULT_LOCATION_ID = 'P2u1fEJ2FLpliycVsCGX';
const WIDGET_BASE = 'https://reputationhub.site/reputation/widgets/review_widget/';

export async function onRequestGet(context) {
  const { request, env } = context;
  const cache = caches.default;
  const cacheKey = new Request(new URL(request.url).origin + '/api/reviews', { method: 'GET' });

  const cached = await cache.match(cacheKey);
  if (cached) return withCors(cached);

  const locationId = env.GHL_LOCATION_ID || DEFAULT_LOCATION_ID;
  const widgetUrl = WIDGET_BASE + encodeURIComponent(locationId) + (env.GHL_WIDGET_ID ? '?widgetId=' + encodeURIComponent(env.GHL_WIDGET_ID) : '');

  try {
    const res = await fetch(widgetUrl, {
      headers: { 'Accept': 'text/html', 'User-Agent': 'IOC-landing-page-rating/1.0 (+https://go.instantorthocare.com)' },
    });
    if (!res.ok) return json({ error: 'upstream_status', status: res.status }, 502, 300);

    const html = await res.text();
    const data = extractSsrData(html);
    const aggregate = data && data.aggregateData;
    const count = aggregate && Number(aggregate.totalReviews);
    const rating = aggregate && Number(aggregate.totalRating);

    if (!(count > 0) || !(rating > 0 && rating <= 5)) {
      // Nothing synced yet (Google not connected in HighLevel Reputation) or an
      // unexpected shape. The page keeps its static snapshot.
      return json({ error: 'no_reviews_synced', count: count || 0 }, 503, 600);
    }

    const body = {
      rating: Math.round(rating * 10) / 10,
      count: count,
      source: 'highlevel_reputation',
      widgetId: (data.widgetConfig && data.widgetConfig.id) || env.GHL_WIDGET_ID || null,
      fetchedAt: new Date().toISOString(),
    };
    const response = json(body, 200, CACHE_SECONDS);
    context.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (err) {
    return json({ error: 'upstream_error', detail: String((err && err.message) || err) }, 502, 300);
  }
}

// Pulls the JSON object assigned to window.__SSR_DATA__ out of the widget HTML.
// Walks braces (string-aware) rather than trusting a regex against arbitrary review text.
function extractSsrData(html) {
  const marker = html.indexOf('__SSR_DATA__');
  if (marker < 0) return null;
  const start = html.indexOf('{', marker);
  if (start < 0) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(html.slice(start, i + 1)); } catch (_) { return null; }
      }
    }
  }
  return null;
}

function json(body, status, maxAge) {
  return withCors(new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}`,
    },
  }));
}

// Public, non-sensitive data; allow the main site to reuse this endpoint later.
function withCors(response) {
  const out = new Response(response.body, response);
  out.headers.set('Access-Control-Allow-Origin', '*');
  out.headers.set('Access-Control-Allow-Methods', 'GET');
  return out;
}
