# IOC landing-page launch

## Calling and DNI
All six prominent buttons initiate a call. The sticky navbar provides the persistent mobile call action, with no duplicate bottom bar. Directions remain a utility link beneath the address. Walk-ins still require no appointment.

The two LeadConnector scripts supplied by Matt are installed once, in their supplied order, immediately before the closing body tag. They load directly from LeadConnector; no provider code is bundled or modified.

- Location: P2u1fEJ2FLpliycVsCGX
- Number pool: z9IXoWHn24BwhcLwZPas
- Number-pool script: https://backend.leadconnectorhq.com/appengine/loc/P2u1fEJ2FLpliycVsCGX/pool/z9IXoWHn24BwhcLwZPas/number_pool.js
- Session script: https://backend.leadconnectorhq.com/appengine/js/user_session.js

All eight clinic phone links use `tel:+13853867026`, with readable `(385) 386-7026` labels. The sticky header button shows the number on desktop and mobile; the other five prominent buttons say `Call · (385) 386-7026`. The duplicate phone links formerly beside the header and closing buttons have been consolidated into those buttons, and the redundant sticky bottom call bar is removed. The provider scans anchor destinations as well as visible number text. No custom swapping listener is needed. Page click tracking reads the current destination and does not restore the original number. If the provider does not assign a number or its script is blocked, the clinic number remains available.

This integration is in the standalone fracture-care landing page. It has not been deployed to the clinic's main website. The supplied DNI scripts can also run in the local preview; the existing GTM loader remains disabled there.

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
The current 4.9 / 97 aggregate is the September 13, 2026 snapshot supplied by the user. Its date appears below the review cards. It is not a live feed; refresh it from verified source data when publishing and maintaining the page.

## Supporting images

Keep all four new WebP files in assets/ when deploying: fracture-care-detail.webp, fracture-care-detail-small.webp, wrist-xray-visit.webp, and wrist-xray-visit-small.webp. The original PNGs are not requested by the page. Both figures reserve their aspect ratio and load lazily.
