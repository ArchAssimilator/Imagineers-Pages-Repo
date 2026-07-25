/* ==========================================================================
   masterclass-v2.js
   Behaviour for the rebuilt Masterclass page: count-up proof numbers,
   whiteboard lightbox, and the sticky CTA bar.
   Runs alongside masterclass-theme.js (nav + scroll reveal live there).
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ */
  /* 1. Count-up proof numbers                                          */
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

  var counters = document.querySelectorAll('[data-count-to]');

  if (counters.length) {
    // Seed with 0 so nothing flashes the final value before animating.
    counters.forEach(function (el) {
      render(el, reduceMotion ? parseInt(el.dataset.countTo, 10) : 0);
    });

    if (!reduceMotion && 'IntersectionObserver' in window) {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          countUp(entry.target);
          countObserver.unobserve(entry.target);
        });
      }, { threshold: 0.5 });

      counters.forEach(function (el) { countObserver.observe(el); });
    } else if (!reduceMotion) {
      counters.forEach(countUp);
    }
  }

  /* ------------------------------------------------------------------ */
  /* 2. Whiteboard lightbox                                             */
  /* ------------------------------------------------------------------ */

  var lightbox = document.getElementById('boardLightbox');

  if (lightbox) {
    var lightboxImg = lightbox.querySelector('img');
    var lightboxCaption = lightbox.querySelector('figcaption');
    var lightboxClose = lightbox.querySelector('.lightbox-close');
    var lastFocused = null;

    function openLightbox(trigger) {
      var img = trigger.querySelector('img');
      if (!img) return;

      lastFocused = trigger;
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = trigger.dataset.caption || img.alt || '';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      lightboxClose.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      lightboxImg.removeAttribute('src');
      if (lastFocused) {
        lastFocused.focus();
        lastFocused = null;
      }
    }

    document.querySelectorAll('.board-thumb').forEach(function (thumb) {
      thumb.addEventListener('click', function () { openLightbox(thumb); });
    });

    lightboxClose.addEventListener('click', closeLightbox);

    // Click the backdrop (but not the image itself) to dismiss.
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
  }

  /* ------------------------------------------------------------------ */
  /* 3. Sticky CTA, revealed once the hero has scrolled away             */
  /* ------------------------------------------------------------------ */

  var stickyCta = document.getElementById('stickyCta');
  var hero = document.querySelector('.hero-pitch');

  if (stickyCta && hero && 'IntersectionObserver' in window) {
    var heroObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        stickyCta.classList.toggle('show', !entry.isIntersecting);
      });
    }, { threshold: 0, rootMargin: '-120px 0px 0px 0px' });

    heroObserver.observe(hero);
  }
})();
