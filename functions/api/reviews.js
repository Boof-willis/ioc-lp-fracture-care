/*
 * GET /api/reviews
 *
 * Returns the clinic's current Google review count and average rating so the
 * page can update itself as new reviews arrive. Runs as a Cloudflare Pages Function.
 *
 * Source: the public data API behind HighLevel's Reputation review widget for the
 * IOC sub-account. HighLevel syncs the Google Business Profile reviews that Warp
 * Drive connected in Reputation → Settings. We page through the review list and
 * count Google-sourced reviews ourselves rather than trusting the widget's
 * `aggregateData.totalReviews`, which has been observed to overstate the count
 * (149 reported vs 110 actual on 2026-09-27). Counting the list matched Google's
 * public figure exactly. No API key, no Google Maps Platform billing.
 *
 * Optional environment variables (Pages project → Settings → Variables and Secrets):
 *   GHL_LOCATION_ID  HighLevel sub-account ID. Defaults to IOC's.
 *   GHL_WIDGET_ID    A specific review widget ID. Defaults to the sub-account's
 *                    default widget. Whichever widget is used must not filter by
 *                    star rating or cap the review count, or the total will be low.
 *
 * Responses are cached at the edge for CACHE_SECONDS.
 */

const CACHE_SECONDS = 60 * 60;
const DEFAULT_LOCATION_ID = 'P2u1fEJ2FLpliycVsCGX';
const DATA_URL = 'https://services.leadconnectorhq.com/reputation/widgets/data';
const WIDGET_ORIGIN = 'https://reputationhub.site';
const PAGE_SIZE = 50;
const MAX_PAGES = 40;

export async function onRequestGet(context) {
  const { request, env } = context;
  const cache = caches.default;
  const cacheKey = new Request(new URL(request.url).origin + '/api/reviews', { method: 'GET' });

  const cached = await cache.match(cacheKey);
  if (cached) return withCors(cached);

  const locationId = env.GHL_LOCATION_ID || DEFAULT_LOCATION_ID;

  try {
    const reviews = await fetchAllReviews(locationId, env.GHL_WIDGET_ID);
    const google = reviews.filter(isGoogleReview);
    const count = google.length;

    if (count === 0) {
      // Nothing synced yet (Google not connected in HighLevel Reputation) or an
      // unexpected shape. The page keeps its static snapshot.
      return json({ error: 'no_reviews_synced', count: 0 }, 503, 600);
    }

    const rated = google.filter((r) => Number(r.starRating) > 0);
    const rating = rated.length
      ? Math.round((rated.reduce((sum, r) => sum + Number(r.starRating), 0) / rated.length) * 10) / 10
      : null;

    if (!(rating > 0 && rating <= 5)) {
      return json({ error: 'incomplete_response', count }, 502, 300);
    }

    const body = {
      rating,
      count,
      source: 'highlevel_reputation',
      fetchedAt: new Date().toISOString(),
    };
    const response = json(body, 200, CACHE_SECONDS);
    context.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (err) {
    return json({ error: 'upstream_error', detail: String((err && err.message) || err) }, 502, 300);
  }
}

async function fetchAllReviews(locationId, widgetId) {
  const seen = new Set();
  const all = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = new URL(DATA_URL);
    url.searchParams.set('locationId', locationId);
    if (widgetId) url.searchParams.set('widgetId', widgetId);
    url.searchParams.set('projection', 'reviews');
    url.searchParams.set('page', String(page));
    url.searchParams.set('size', String(PAGE_SIZE));

    const res = await fetch(url.toString(), {
      headers: {
        // The widget's own bundle sends these; the API rejects bare requests.
        'channel': 'APP',
        'Origin': WIDGET_ORIGIN,
        'Referer': `${WIDGET_ORIGIN}/reputation/widgets/review_widget/${encodeURIComponent(locationId)}`,
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; IOC-landing-page-rating/1.0; +https://go.instantorthocare.com)',
      },
    });
    if (!res.ok) throw new Error(`widget data ${res.status} on page ${page}`);

    const data = await res.json();
    const reviews = Array.isArray(data && data.reviews) ? data.reviews : [];
    if (reviews.length === 0) break;

    let added = 0;
    for (const r of reviews) {
      const id = r && (r.id || `${r.reviewerName}|${r.dateAdded}`);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      all.push(r);
      added++;
    }
    // A page with no new items means the API is repeating; stop rather than loop.
    if (added === 0 || reviews.length < PAGE_SIZE) break;
  }
  return all;
}

// HighLevel tags Google reviews with source code 247 and a google-icon asset.
function isGoogleReview(r) {
  if (!r) return false;
  if (Number(r.source) === 247) return true;
  return typeof r.iconUrl === 'string' && /google/i.test(r.iconUrl);
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
