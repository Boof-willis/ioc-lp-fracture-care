/* Live Google rating. Reads /api/reviews (see functions/api/reviews.js) and updates the
   rating blocks in place. The HTML ships with a static snapshot, so if the endpoint is
   unavailable the page simply keeps showing that snapshot. */
(function () {
  'use strict';
  var blocks = document.querySelectorAll('[data-google-rating]');
  if (!blocks.length || !window.fetch) return;

  var controller = 'AbortController' in window ? new AbortController() : null;
  var timer = controller && setTimeout(function () { controller.abort(); }, 4000);

  fetch('/api/reviews', { signal: controller && controller.signal, credentials: 'omit' })
    .then(function (res) { return res.ok ? res.json() : Promise.reject(new Error(res.status)); })
    .then(function (data) {
      if (timer) clearTimeout(timer);
      var rating = Number(data.rating);
      var count = Number(data.count);
      if (!(rating > 0 && rating <= 5) || !(count > 0)) return;

      var ratingText = rating.toFixed(1);
      var countText = count.toLocaleString('en-US');
      var stars = starString(rating);
      var noun = count === 1 ? 'Google review' : 'Google reviews';

      blocks.forEach(function (block) {
        var value = block.querySelector('[data-rating-value]');
        var total = block.querySelector('[data-rating-count]');
        var starEl = block.querySelector('.rating-stars');
        if (value) value.textContent = ratingText;
        if (total) {
          total.textContent = countText;
          var label = total.parentNode;
          if (label) label.lastChild.textContent = ' ' + noun;
        }
        if (starEl) starEl.textContent = stars;
        block.setAttribute('title', 'Live Google rating');
        block.setAttribute('aria-label', ratingText + ' out of 5 from ' + countText + ' ' + noun + '. Updated automatically from Google. Read reviews on Google, opens in a new tab.');
      });

      document.querySelectorAll('[data-rating-note]').forEach(function (note) {
        note.textContent = 'Google rating and review count update automatically from Google.';
      });
    })
    .catch(function () { /* keep the static snapshot */ });

  function starString(rating) {
    var full = Math.floor(rating + 0.25);
    var out = '';
    for (var i = 0; i < 5; i++) out += i < full ? '★' : '☆';
    return out;
  }
})();
