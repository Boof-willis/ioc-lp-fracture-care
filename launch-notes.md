# IOC landing-page launch

## Calling and DNI
All prominent buttons initiate a call. The sticky navbar provides the persistent mobile call action, with no duplicate bottom bar. Directions remain a utility link beneath the address. Walk-ins still require no appointment.

The two LeadConnector number-pool scripts supplied by Matt are injected, unmodified and in their supplied order, at the end of the body by the same gating snippet used on instantorthocare.com: they load only when the visit carries an ad-click parameter (gclid, gbraid, wbraid, fbclid, msclkid, ttclid, utm_source, utm_medium, utm_campaign) or the visitor already holds the 30-day `ioc_ad_visitor` cookie. The cookie is scoped to `.instantorthocare.com`, so a visitor who lands here from an ad and then browses the main site keeps the tracking number there too. Direct and organic visits show the clinic number as written. To exercise the swap in a preview, append `?utm_source=test` to the URL.

- Location: P2u1fEJ2FLpliycVsCGX
- Number pool: z9IXoWHn24BwhcLwZPas
- Number-pool script: https://backend.leadconnectorhq.com/appengine/loc/P2u1fEJ2FLpliycVsCGX/pool/z9IXoWHn24BwhcLwZPas/number_pool.js
- Session script: https://backend.leadconnectorhq.com/appengine/js/user_session.js

All ten clinic phone links use `tel:+13853867026`, with readable `(385) 386-7026` labels. The sticky header button shows the number on desktop and mobile; the other prominent buttons say `Call · (385) 386-7026`. The provider scans anchor destinations as well as visible number text. No custom swapping listener is needed. Page click tracking reads the current destination and does not restore the original number. If the provider does not assign a number or its script is blocked, the clinic number remains available.

The main website runs the same gating snippet in its shared footer, so attribution behaves identically on both properties. The existing GTM loader remains disabled in local previews.

## Chat and SMS compliance
The Kira Live Chat Widget and the A2P SMS Compliance tag from the Warp Drive handoff are installed, unmodified, immediately before the closing body tag, matching the main website. The chat bubble renders bottom-right; on phones its greeting prompt overlaps page content until dismissed, which is controlled in the HighLevel widget settings, not here. Both tags call widgets.leadconnectorhq.com and beta.leadconnectorhq.com.

## Insurance
An insurance section sits directly beneath the hero and trust strip, mirroring the main website: heading, a continuous carousel of accepted plans (paused on hover, static and scrollable under prefers-reduced-motion), HSA/FSA and workers' compensation notes, and a call CTA. The plan list is the main website's list plus Federal Workers' Compensation (OWCP); keep both lists in sync when plans change. The hero proof row, trust strip, cost section, and FAQ also reference insurance.

Validation: An isolated test using the downloaded, unmodified provider scripts and this page's DOM verified replacement of all eight E.164 phone destinations and all eight displayed numbers. The six button labels retained their wording around the updated number; non-phone links were preserved. The browser preview also received a real assigned number from LeadConnector, with displayed numbers matching their corresponding E.164 call links. Responsive layout checks confirmed a visible header call button, no duplicate bottom bar, and no button or page overflow. No live call or reporting verification was performed.

Before sending traffic, verify a visit that qualifies under the pool's targeting rules on the published URL, then confirm call forwarding and source attribution in HighLevel with a test call. A local number swap or a clicked call button alone cannot verify forwarding, recording, or reporting. Qualified-call reporting must come from the call-tracking platform using an agreed qualification rule. Installing the snippet does not configure Google Ads conversion imports.

Provider reference: [HighLevel number-pool setup and button swapping](https://help.gohighlevel.com/support/solutions/articles/48000981393).

## Measurement
The page emits these events into the existing Google Tag Manager container, GTM-52DJTWGN (identified on the clinic website):

| Event | Intended reporting | Parameters |
|---|---|---|
| ioc_call_click | Supporting engagement; not a primary conversion | placement, is_conversion=false |
| ioc_directions_click | Supporting engagement; not a primary conversion | placement, is_conversion=false |
| ioc_google_review_click | Engagement only | placement, is_conversion=false |
| ioc_review_view | Engagement only | placement, review_id, is_conversion=false |

A review-view event fires once per block per page load when at least 50% of the block remains visible for one second in a visible tab. Call clicks do not prove a connected call. Directions clicks do not prove arrivals. No phone numbers, review text, medical form values, or visitor identifiers are included in these custom event payloads.

GTM/GA4 setup still requires account access: create custom-event triggers and GA4 event tags for the four supporting events; register placement and review_id as event-scoped custom dimensions. Do not mark these page events as primary conversions. The is_conversion field is descriptive; it does not change GA4 or Google Ads settings. If call clicks or directions clicks were previously configured as primary conversions, change that in the analytics/ad account. Import qualified calls from the chosen DNI provider as the primary conversion, avoiding duplicate counting of the click and resulting call.

The dataLayer is an event interface, not an analytics database. The page does not load GTM on localhost or file previews.

## Release changes
Preserved the approved design, 4:5 provider frames, review excerpts, and compressed assets. Removed the optional hero intake line and corrected empty CSS declarations. All prominent actions now call the clinic.

## Review data
The HTML ships a static snapshot (4.9 / 102, September 26, 2026, supplied by the client) so the page is complete without JavaScript or the API. On load, `assets/live-rating.js` requests `/api/reviews` and, on success, rewrites the three rating blocks (value, count, stars, aria-label) and the footnote to say the figures update automatically. On any failure it leaves the snapshot untouched.

`/api/reviews` is a Cloudflare Pages Function (`functions/api/reviews.js`). It pages through the public data API behind HighLevel's Reputation review widget for IOC's sub-account (`services.leadconnectorhq.com/reputation/widgets/data?locationId=P2u1fEJ2FLpliycVsCGX`), which lists the reviews HighLevel syncs from Google Business Profile. The function counts Google-sourced reviews itself and averages their star ratings. It deliberately ignores the widget's own `aggregateData.totalReviews`: on September 27, 2026 that figure said 149 while the review list, and Google's public panel, both said 110. No API key, no Google Cloud project, no billing. Results are cached at the edge for one hour, so a new review appears on the page within about an hour.

Google Business Profile was connected in HighLevel Reputation on September 27, 2026 and the endpoint returned `{"rating":4.9,"count":110}`, matching Google. If reviews ever stop syncing, the function returns 503 `no_reviews_synced` and the page keeps its static snapshot.

Keep the sub-account's default review widget unfiltered (no minimum-star filter, no review cap); the data API applies the widget's filters, so a filtered widget would under-count. If a dedicated widget is preferred, set its ID as `GHL_WIDGET_ID` in Pages → Settings → Variables and Secrets.

Because the source is an unofficial HighLevel API, a future change could break it; the failure mode is the static snapshot, never a blank or wrong number. The endpoint allows cross-origin GET, so the main website can read it later. Review excerpts remain hand-curated.

## Supporting images

Keep all four new WebP files in assets/ when deploying: fracture-care-detail.webp, fracture-care-detail-small.webp, wrist-xray-visit.webp, and wrist-xray-visit-small.webp. The original PNGs are not requested by the page. Both figures reserve their aspect ratio and load lazily.
