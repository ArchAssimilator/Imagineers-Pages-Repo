/* ==========================================================================
   masterclass-v2.js
   Behaviour unique to the Masterclass page: whiteboard lightbox and the
   sticky CTA bar.
   Runs alongside masterclass-theme.js (nav + scroll reveal) and
   proof-stats.js (the shared proof-strip numbers).
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* 1. Whiteboard lightbox                                             */
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
  /* 2. Sticky CTA, revealed once the hero has scrolled away             */
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
