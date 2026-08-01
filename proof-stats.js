/* ==========================================================================
   proof-stats.js
   Count-up animation for the .proof-strip on every page.

   ---------------------------------------------------------------------------
   THE NUMBERS ARE NOT IN THIS FILE, AND THIS FILE NO LONGER FETCHES THEM.

   They live in stats.json, and sh/apply-stats.mjs writes them into the HTML at
   commit time via the pre-commit hook. By the time a page is deployed, the
   markup is already correct, so this script only has to animate it.

   It used to fetch stats.json at load and overwrite the markup. That was right
   when the HTML was the stale copy, and wrong the moment apply-stats made the
   HTML authoritative, because the two can disagree in the visitor's favour
   only by accident. It bit us for real on 1 Aug 2026: GitHub Pages serves .js
   with a four hour max-age but .html with ten minutes, so for four hours after
   a deploy the CDN handed out a cached older script that confidently rewrote
   the correct numbers back to the previous ones.

   If you find yourself wanting to read stats.json from here again, you are
   reintroducing that bug. The single source of truth is still stats.json; the
   thing that reads it is sh/apply-stats.mjs, at commit time, once.

   stats.json is still published at https://www.imagineers.ai/stats.json,
   because the Executive Navigants landing page in the other repo fetches it.
   That is the only consumer of the published file.
   ---------------------------------------------------------------------------

   How a proof item is wired:

     data-stat="executives"   Shared fact from stats.json. apply-stats keeps the
                              text correct; this script reads that text and
                              counts up to it on scroll.

     data-stat-text="executives"
                              Same shared fact in running prose. apply-stats
                              keeps it correct. Left alone here, because a
                              number should not animate mid-sentence.

     data-count-to="2"        Page-local number. Counts up, but is not a shared
                              fact, so it is not in stats.json.

     (no attribute)           Left completely alone. Used for the slots where a
                              page swaps the number out for a phrase, such as
                              "Day 5" on the engineering page.
   ========================================================================== */

(function () {
  'use strict';

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
  /* Read the target out of the markup                                   */
  /* ------------------------------------------------------------------ */

  /* "1,400" or "725+" is a number we can animate. Anything else, such as the
     "1 Aug 2026" verified date or a "Day 5" phrase, is left exactly as it is. */
  function prepare() {
    document.querySelectorAll('[data-stat]').forEach(function (el) {
      var text = el.textContent.trim();
      if (!/^[\d,\s]+\+?$/.test(text)) return;

      el.dataset.countTo = parseInt(text.replace(/[^\d]/g, ''), 10);
      if (/\+$/.test(text)) el.dataset.suffix = '+';
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

  prepare();
  animate();
})();
