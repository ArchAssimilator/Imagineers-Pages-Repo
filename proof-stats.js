/* ==========================================================================
   proof-stats.js
   Shared behaviour for the .proof-strip on every page.

   ---------------------------------------------------------------------------
   TO UPDATE THE HEADLINE NUMBERS, EDIT THE `STATS` OBJECT BELOW. THAT IS THE
   ONLY PLACE THEY LIVE. Every page picks them up automatically.
   ---------------------------------------------------------------------------

   How a proof item is wired:

     data-stat="executives"   Shared fact. Value and suffix come from STATS,
                              and the number counts up on scroll. The text in
                              the HTML is a fallback for crawlers and for
                              no-JS; this script overwrites it and warns in the
                              console if the two have drifted apart.

     data-count-to="2"        Page-local number. Counts up, but is not a shared
                              fact, so it is not in STATS. Used where a page
                              wants a figure that only makes sense on that page.

     (no attribute)           Left completely alone. Used for the slots where a
                              page swaps the number out for a phrase, such as
                              "Day 5" on the engineering page.

   So each page shows the shared facts that support its own argument, and is
   free to substitute its own fourth item. Nothing here assumes four items.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* The numbers. Edit here, nowhere else.                              */
  /* ------------------------------------------------------------------ */

  var STATS = {
    courses:    { value: 60,   suffix: '' },
    executives: { value: 700,  suffix: '+' },
    execDays:   { value: 1400, suffix: '' },
    hours:      { value: 6500, suffix: '' },

    // Plain text, not animated. Bump this whenever the figures above change.
    verified:   'July 2026'
  };

  /* ------------------------------------------------------------------ */
  /* Rendering                                                          */
  /* ------------------------------------------------------------------ */

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  document.querySelectorAll('[data-stat]').forEach(function (el) {
    var stat = STATS[el.dataset.stat];

    if (stat === undefined) {
      console.warn('proof-stats: no stat named "' + el.dataset.stat + '"', el);
      return;
    }

    // String stats (the "verified" date) are written straight in.
    if (typeof stat === 'string') {
      el.textContent = stat;
      return;
    }

    var fallback = el.textContent.trim();
    var expected = group(stat.value) + (stat.suffix || '');

    if (fallback && fallback !== expected) {
      console.warn(
        'proof-stats: markup says "' + fallback + '" but STATS.' + el.dataset.stat +
        ' is "' + expected + '". Update the HTML fallback so no-JS visitors and ' +
        'crawlers see the current figure.',
        el
      );
    }

    el.dataset.countTo = stat.value;
    if (stat.suffix) el.dataset.suffix = stat.suffix;
  });

  /* ------------------------------------------------------------------ */
  /* Animate on scroll                                                   */
  /* ------------------------------------------------------------------ */

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
})();
