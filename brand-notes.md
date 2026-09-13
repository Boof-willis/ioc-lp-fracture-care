# Landing-page conversion update

Sources reviewed September 13, 2026:
- https://instantorthocare.com/ — clinic details. Earlier IOC-published testimonial replaced with Google excerpts supplied by the user.
- https://instantorthocare.com/team/ — provider names, credentials, and actual provider photos. Availability varies by day.

The HTML references the adjacent assets folder; keep both together when moving or deploying the page. No image data is embedded in the HTML. Responsive hero WebP images, a compressed logo, and lazy-loaded provider images reduce the initial document and image payload. Google Fonts supplies Manrope, with a system fallback.

Calls are the prominent action throughout. The sticky navbar keeps the clinic number visible on mobile; there is no duplicate sticky call bar at the bottom. Directions remain a small utility link beneath the clinic address. The hero keeps the walk-in offer and has no intake link. Logo links stay on this page. Named providers replace the generic portrait and off-page team link.

Today’s regular hours are calculated in America/Denver and refreshed every minute. These are not holiday overrides or live clinic-status data. The full weekly schedule remains available without JavaScript.

Google rating, count, and review excerpts are sourced from the Google Business Profile text supplied by the user: 4.9/5 from 97 reviews. No actual field load-time or conversion-rate claim is made.

## Visual direction
Clinical precision with an editorial layout: deep navy opening and closing, a lime treatment accent, open comparison columns, a numbered care sequence, and restrained provider profiles. Responsive layout prioritizes calling, while directions and clinical guidance remain available. Existing assets, sourced proof, and local-only delivery are preserved.

## Google reviews update

Source: https://www.google.com/search?q=instant+orthopedic+care#lrd=0x8752873d7ccc3bd9:0x633ce9cffc44eef6,1,,,,

Rating and count: 4.9 out of 5, 97 reviews, as pasted by the user. The concatenated source heading reads “4.997 reviews.” This is a static snapshot, not a live feed. Selected excerpts preserve the supplied wording and reviewer names; omitted text is not reconstructed. No individual star ratings were added because the pasted review entries did not preserve them. Links open the supplied Google Business Profile.

## Supporting imagery

The cast-care image accompanies the visit steps, and the wrist X-ray image replaces the previous text panel in the X-ray section. Both are AI-generated illustrations of generic care, with provenance documented here and descriptive alt text on the page. They do not depict actual IOC staff, patients, or premises. Responsive, lazy-loaded WebP assets are derived from the original PNGs in generated-images/. The surrounding copy is shortened; the existing section order and call actions remain.
