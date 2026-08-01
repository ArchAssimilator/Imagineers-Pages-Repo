/* ==========================================================================
   proof-stats.js
   Shared behaviour for the .proof-strip on every page.

   ---------------------------------------------------------------------------
   THE NUMBERS ARE NOT IN THIS FILE ANY MORE. They live in stats.json, which is
   the single source of truth for this site AND for the Executive Navigants
   landing page in the other repo. To change a figure, edit stats.json and then
   run sh/check-stats.sh. Read HOW-TO-UPDATE-THE-NUMBERS.md first.
   ---------------------------------------------------------------------------

   How a proof item is wired:

     data-stat="executives"   Shared fact. Value and suffix come from
                              stats.json, and the number counts up on scroll.
                              The text in the HTML is a fallback for crawlers
                              and for no-JS; this script overwrites it and warns
                              in the console if the two have drifted apart.

     data-stat-text="executives"
                              Shared fact written into running prose. Same
                              value, no count-up animation, same drift warning.

     data-count-to="2"        Page-local number. Counts up, but is not a shared
                              fact, so it is not in stats.json. Used where a
                              page wants a figure that only makes sense there.

     (no attribute)           Left completely alone. Used for the slots where a
                              page swaps the number out for a phrase, such as
                              "Day 5" on the engineering page.

   So each page shows the shared facts that support its own argument, and is
   free to substitute its own fourth item. Nothing here assumes four items.

   If stats.json cannot be fetched (offline, opened over file://), the script
   falls back to the numbers already printed in the HTML, so the page never
   shows a blank or a zero.
   ========================================================================== */

(function () {
  'use strict';

  var STATS_URL = 'stats.json';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ */
  /* Helpers                                                            */
  /* ------------------------------------------------------------------ */

  function group(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function render(el, value) {
    el.textContent = (el.dataset.prefix || '') + group(value) + (el.dataset.suffix || '');
  }

  function countUp(el) {
    var target = parseInt(el.dataset.countTo, 10);
    if (isNaN(target)) return;

    if (reduceMotion) {
      render(el, target);
      return;
    }

    var duration = 1500;
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      // easeOutCubic, so the number decelerates into its final value
      var eased = 1 - Math.pow(1 - progress, 3);
      render(el, Math.round(target * eased));
      if (progress < 1) window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
  }

  /* ------------------------------------------------------------------ */
  /* Bind the shared facts onto whatever this page is showing            */
  /* ------------------------------------------------------------------ */

  function warnDrift(el, name, expected) {
    var fallback = el.textContent.trim();
    if (!fallback || fallback === expected) return;
    console.warn(
      'proof-stats: markup says "' + fallback + '" but stats.json says "' + expected +
      '" for "' + name + '". Update the HTML so no-JS visitors and crawlers see the ' +
      'current figure. Run sh/check-stats.sh to find every place that needs it.',
      el
    );
  }

  function bind(stats) {
    document.querySelectorAll('[data-stat], [data-stat-text]').forEach(function (el) {
      var name = el.dataset.stat || el.dataset.statText;
      var stat = stats[name];

      if (stat === undefined) {
        console.warn('proof-stats: no stat named "' + name + '" in stats.json', el);
        return;
      }

      // String stats (the "verified" date) are written straight in.
      if (typeof stat === 'string') {
        warnDrift(el, name, stat);
        el.textContent = stat;
        return;
      }

      var expected = group(stat.value) + (stat.suffix || '');
      warnDrift(el, name, expected);

      // Prose: write it and leave it. No animation mid-sentence.
      if (el.dataset.statText) {
        el.textContent = expected;
        return;
      }

      el.dataset.countTo = stat.value;
      if (stat.suffix) el.dataset.suffix = stat.suffix;
    });
  }

  /* ------------------------------------------------------------------ */
  /* Animate on scroll                                                   */
  /* ------------------------------------------------------------------ */

  function animate() {
    var counters = document.querySelectorAll('[data-count-to]');
    if (!counters.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      counters.forEach(function (el) { render(el, parseInt(el.dataset.countTo, 10)); });
      return;
    }

    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5, rootMargin: '0px 0px 120px 0px' });

    counters.forEach(function (el) {
      var target = parseInt(el.dataset.countTo, 10);

      // A number well below the fold keeps its real value and is left alone.
      // Seeding it to 0 would mean a headline figure reads "0" for as long as
      // the visitor never scrolls that far, which is worse than no animation.
      if (el.getBoundingClientRect().top > window.innerHeight * 1.2) {
        render(el, target);
        return;
      }

      // On or near the first screen: start at 0 so it visibly counts up rather
      // than flashing its final value first.
      render(el, 0);
      countObserver.observe(el);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Fallback: rebuild the stats from what is already printed on the page */
  /* ------------------------------------------------------------------ */

  function statsFromMarkup() {
    var stats = {};
    document.querySelectorAll('[data-stat], [data-stat-text]').forEach(function (el) {
      var name = el.dataset.stat || el.dataset.statText;
      if (stats[name]) return;
      var text = el.textContent.trim();
      // Only "1,400" or "700+" shaped text is a number. Anything else, such as
      // the "July 2026" verified date, is carried through as a plain string.
      stats[name] = /^[\d,\s]+\+?$/.test(text)
        ? { value: parseInt(text.replace(/[^\d]/g, ''), 10), suffix: /\+$/.test(text) ? '+' : '' }
        : text;
    });
    return stats;
  }

  /* ------------------------------------------------------------------ */
  /* Go                                                                  */
  /* ------------------------------------------------------------------ */

  function start(stats) {
    bind(stats);
    animate();
  }

  if (!window.fetch) {
    start(statsFromMarkup());
    return;
  }

  // Default caching on purpose: GitHub Pages serves stats.json with a 4 hour
  // max-age, so repeat views bind instantly from the browser cache instead of
  // paying a round trip before the numbers can render.
  fetch(STATS_URL)
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) { start(data); })
    .catch(function (err) {
      console.warn(
        'proof-stats: could not load ' + STATS_URL + ' (' + err.message + '). ' +
        'Falling back to the numbers printed in the HTML.'
      );
      start(statsFromMarkup());
    });
})();
