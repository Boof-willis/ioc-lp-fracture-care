/* IOC landing-page measurement. No form values, review text, or visitor details. */
(function () {
  'use strict';
  if (window.__iocMeasurement) return;
  window.__iocMeasurement = true;
  window.dataLayer = window.dataLayer || [];
  var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === 'file:';
  if (!local && !document.querySelector('script[src*="googletagmanager.com/gtm.js"]')) {
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-52DJTWGN';
    document.head.appendChild(tag);
  }
  function placement(element) {
    var region = element.closest('[data-measure-region]');
    return region ? region.dataset.measureRegion : 'other';
  }
  function push(name, element, conversion, extra) {
    var payload = Object.assign({event:name, placement:placement(element), is_conversion:conversion, review_id:null}, extra || {});
    window.dataLayer.push(payload);
  }
  document.addEventListener('click', function (event) {
    var anchor = event.target.closest && event.target.closest('a[href]');
    if (!anchor) return;
    var href = anchor.getAttribute('href');
    var kind = null;
    if (href.indexOf('tel:') === 0) kind = 'ioc_call_click';
    else {
      var url;
      try { url = new URL(href, location.href); } catch (_) { return; }
      if (url.hostname === 'www.google.com' && url.pathname.indexOf('/maps/') === 0) kind = 'ioc_directions_click';
      else if (url.hostname === 'www.google.com' && url.pathname === '/search' && url.hash.indexOf('#lrd=') === 0) kind = 'ioc_google_review_click';
    }
    if (!kind) return;
    // Clicks are supporting signals. Qualified calls come from the DNI provider.
    var extras = {};
    // Give installed tags a bounded delivery window for same-tab navigation.
    if (!event.defaultPrevented && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && (!anchor.target || anchor.target === '_self') && window.google_tag_manager) {
      event.preventDefault();
      var followed = false;
      var timer;
      var follow = function () { if (followed) return; followed = true; clearTimeout(timer); location.assign(anchor.href); };
      extras.eventCallback = follow;
      extras.eventTimeout = 350;
      timer = setTimeout(follow, 350);
    }
    push(kind, anchor, false, extras);
  });
  if (!('IntersectionObserver' in window)) return;
  var seen = new Set();
  var active = new Set();
  var timers = new Map();
  function cancel(el) { clearTimeout(timers.get(el)); timers.delete(el); }
  function start(el) {
    if (seen.has(el) || timers.has(el) || document.visibilityState !== 'visible') return;
    timers.set(el, setTimeout(function () {
      timers.delete(el);
      if (!active.has(el) || document.visibilityState !== 'visible') return;
      seen.add(el);
      observer.unobserve(el);
      push('ioc_review_view', el, false, {review_id:el.dataset.reviewId});
    }, 1000));
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) { active.add(entry.target); start(entry.target); }
      else { active.delete(entry.target); cancel(entry.target); }
    });
  }, {threshold:0.5});
  document.querySelectorAll('[data-review-id]').forEach(function (el) { observer.observe(el); });
  document.addEventListener('visibilitychange', function () {
    active.forEach(function (el) { cancel(el); if (document.visibilityState === 'visible') start(el); });
  });
})();
