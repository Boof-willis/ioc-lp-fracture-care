# IOC landing-page launch

## Calling and DNI
All prominent buttons initiate a call. The sticky navbar provides the persistent mobile call action, with no duplicate bottom bar. Directions sit on the hero photo card, beside the clinic address, and in the closing location card; both open Google Maps and fire ioc_directions_click. Walk-ins still require no appointment.

The two LeadConnector number-pool scripts supplied by Matt are injected, unmodified and in their supplied order, at the end of the body by the same gating snippet used on instantorthocare.com: they load only when the visit carries an ad-click parameter (gclid, gbraid, wbraid, fbclid, msclkid, ttclid, utm_source, utm_medium, utm_campaign) or the visitor already holds the 30-day `ioc_ad_visitor` cookie. The cookie is scoped to `.instantorthocare.com`, so a visitor who lands here from an ad and then browses the main site keeps the tracking number there too. Direct and organic visits show the clinic number as written. To exercise the swap in a preview, append `?utm_source=test` to the URL.

- Location: P2u1fEJ2FLpliycVsCGX
- Number pool: z9IXoWHn24BwhcLwZPas
- Number-pool script: https://backend.leadconnectorhq.com/appengine/loc/P2u1fEJ2FLpliycVsCGX/pool/z9IXoWHn24BwhcLwZPas/number_pool.js
- Session script: https://backend.leadconnectorhq.com/appengine/js/user_session.js

All nine clinic phone links use `tel:+13853867026`, with readable `(385) 386-7026` labels. The sticky header button shows the number on desktop and mobile; the other prominent buttons say `Call · (385) 386-7026`. The provider scans anchor destinations as well as visible number text. No custom swapping listener is needed. Page click tracking reads the current destination and does not restore the original number. If the provider does not assign a number or its script is blocked, the clinic number remains available.

The main website runs the same gating snippet in its shared footer, so attribution behaves identically on both properties. The existing GTM loader remains disabled in local previews.

## Chat and SMS compliance
On October 28, 2026 the Kira Live Chat Widget (HighLevel, beta.leadconnectorhq.com) was removed at the clinic's request and replaced with the IOC AI chatbot that accompanies the move to the Athelas/Commure EMR. The new widget is the script supplied by Deven, with its source and widget ID unchanged. Since the CRO pass below, the page loads it only while the clinic is closed:
`https://ehr-ai-agents-production-frontend.onrender.com/chat-widget.js` with `data-widget-id="1c00fcec-5c15-466c-8e0a-26200a78bd03"`. Its appearance and greeting behavior are controlled in the Athelas chatbot admin, not here.

The A2P SMS Compliance tag from the Warp Drive handoff (HighLevel widget 6a18e7e4d37f04944ac5ae45, widgets.leadconnectorhq.com) was also removed the same day. On the live domain it rendered HighLevel's text-message chat widget, a second bubble with its own greeting beside the new chatbot; it does not render on localhost, so a local preview cannot show it. If HighLevel A2P/10DLC registration relied on that widget as the website opt-in method, confirm the replacement opt-in path with the HighLevel admin. The main website still carries the same tag in its A2PCompliance component.

## Insurance
Insurance and cost share one pale section directly beneath the hero and trust strip: heading, a continuous carousel of accepted plans (paused on hover, static and scrollable under prefers-reduced-motion), three cards for the $200–$400 self-pay range, HSA/FSA, and workers' compensation including Federal (OWCP), then a call bar for unlisted plans. The plan list is the main website's list plus Federal Workers' Compensation (OWCP); keep both lists in sync when plans change. The hero checks and FAQ also reference insurance.

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

## Conversion and design pass (October 28, 2026)
A styling layer at the end of the page stylesheet, marked "Conversion and polish layer," overrides the earlier rules; deleting that block restores the previous look. Markup changes:
- Hero: the call button now follows the headline, lede, and three checks, with a live open status beside it. The duplicate address block and the "Call the Draper clinic" note are removed; rating and the patient quote sit below a divider. The third check reads "No appointment" so all three fit on one line.
- Hero photo card: shows the address, a compact weekly schedule, and a Directions pill (Google Maps directions) instead of repeating "Walk in. Leave knowing."
- Trust strip: four facts the hero does not already state (no referral needed, on-site X-ray and casting, open 7 days, kids through adults).
- "Pick a door": the fourth door is now a highlighted card beside the other three, each with a one-line tradeoff, replacing the separate grey callout.
- Benefits: superseded by the trim pass below.
- Reviews moved up to follow "How a visit goes," with a large rating figure and reviewer initials. Nav gains a Reviews link.
- X-ray body-part icons render in brand navy via CSS masks; the SVG files are unchanged.
- FAQ phone link is now a button. The closing card shows open status and highlights today's hours row.
- Content eases in on scroll, skipped under reduced-motion and visible without JavaScript.

## Trim pass (October 28, 2026)
Page length went from about 11,070px to 8,420px on desktop and from 16,160px to 12,310px on a 390px phone, about 24% shorter, without dropping any unique content.
- Insurance and cost merged into one section under the hero; the separate cost section and its repeated plan list are gone. Nav reads "Insurance & cost". The "costs" measurement placement no longer exists; those clicks now report as "insurance".
- The navy benefits band is folded into "How a visit goes," which is now the navy band. Its surgery-coordination point moved into step 4, and the "benefits" placement is gone.
- The X-ray section became a compact bar inside "Sprain or break?" (id="xray" kept, so old links still land). That section is tagged data-measure-region="triage".
- Kids drops its generic four-item checklist. Team profiles are compact cards. FAQ drops the X-ray-and-cast and location-and-hours questions, which the page answers directly around them.
- Phones: reviews scroll sideways one card at a time, and the cast illustration is hidden.

## CRO pass (October 28, 2026)

### Chatbot only after hours
The Athelas chatbot loads only when the regular schedule says the clinic is closed (weekdays after 8 pm, Saturday after 4 pm, Sunday after 2 pm, and before opening). During open hours it competed with the call button, covered the hero Directions button at some window sizes, and its "Schedule an appointment" greeting contradicted "no appointment needed." After hours the call button reaches a closed clinic, so chat is the one way to capture that visitor. The loader lives in the open-status script; it is not holiday-aware, so on a holiday during regular hours the chat stays off. To show it at all times, restore the plain script tag before the closing body tag.

### Injury-matched headlines
The hero question and intro line change to match the ad. Use `?injury=` on the final URL, or let Google Ads pass the keyword with a tracking template such as `{lpurl}?utm_term={keyword}`; the page reads utm_term, utm_content, and utm_campaign. Only these fixed variants exist, and URL text is never written to the page.

| Value | Also matched in UTM text | Headline |
|---|---|---|
| arm | wrist, hand, elbow, finger | Broken arm or wrist? |
| ankle | foot, feet, toe | Broken ankle or foot? |
| knee | leg, shin | Hurt your knee or leg? |
| kids | kid, child, children, pediatric, teen | Did your kid break a bone? |
| sports | sport, athlete, athletic | Hurt playing sports? |

Anything else keeps "Think it's broken?". The hero photo does not change; injury-specific photos would strengthen the match.

### Reporting additions
- Before GTM loads, the page pushes `ioc_page_version` ("redesign-2026-10" or "classic") and `ioc_hero_variant` to the dataLayer. Register both as Data Layer Variables and attach them to the GA4 event tags.
- `ioc_section_view` fires once per section per page load when the section is half visible or fills half the screen, with the section's placement: hero, insurance, doors, visit_steps, reviews, triage, children, team, faq, closing. A GA4 funnel or free-form report on it shows where visitors stop. Create its trigger and GA4 tag like the other ioc_ events.

### A/B test against the previous page
`classic/index.html` is the version that was live before this redesign (commit f0d8097), served at /classic/ with noindex and a canonical pointing to the root. Asset paths are absolute so it shares /assets and /api/reviews. To test, use Google Ads Experiments > Ad variations > Update URLs to send half of ad traffic to https://go.instantorthocare.com/classic/, and judge on qualified calls imported from the call-tracking platform, not on page events. The two arms also differ in chatbot behavior: classic shows the chat at all hours. Delete the classic folder when the test ends.
