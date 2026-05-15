/*
 * ════════════════════════════════════════════════════════════════════
 * shared.js — Shared Utilities (runs on EVERY page)
 * ════════════════════════════════════════════════════════════════════
 * Includes:
 *   1. Scroll reveal IntersectionObserver
 *   2. Dynamic dashboard date
 *   3. FAQ accordion toggle
 *   4. Sticky CTA show/hide
 *   5. Count-up animation for #final stats
 * ════════════════════════════════════════════════════════════════════
 */

"use strict";

/* ══════════════════════════════════════════════════════════════════
 * 1. SCROLL REVEAL
 * ══════════════════════════════════════════════════════════════════ */
(function initScrollReveal() {
  var revealEls = document.querySelectorAll(".reveal");
  if (!revealEls.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry, index) {
        if (entry.isIntersecting) {
          setTimeout(function () {
            entry.target.classList.add("visible");
          }, index * 60);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  revealEls.forEach(function (el) {
    observer.observe(el);
  });
})();

/* ══════════════════════════════════════════════════════════════════
 * 2. DYNAMIC DASHBOARD DATE
 * ══════════════════════════════════════════════════════════════════ */
(function setDashboardDate() {
  var dateEl = document.getElementById("dashMonth");
  if (!dateEl) return;

  dateEl.textContent = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
})();

/* ══════════════════════════════════════════════════════════════════
 * 3. FAQ ACCORDION TOGGLE
 * ══════════════════════════════════════════════════════════════════ */
function toggleFaq(btn) {
  var item = btn.closest(".faq-item");
  var isOpen = item.classList.contains("open");

  document.querySelectorAll(".faq-item.open").forEach(function (openItem) {
    openItem.classList.remove("open");
  });

  if (!isOpen) {
    item.classList.add("open");
  }
}

/* ══════════════════════════════════════════════════════════════════
 * 4. STICKY MOBILE CTA — SHOW / HIDE
 * ══════════════════════════════════════════════════════════════════ */
(function initStickyCta() {
  var stickyCta = document.querySelector(".sticky-cta");
  var heroSection = document.getElementById("hero");
  var optinSection = document.getElementById("optin");

  if (!stickyCta || !heroSection || !optinSection) return;

  var stickyObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          stickyCta.style.display = "none";
        } else {
          stickyCta.style.display = "flex";
        }
      });
    },
    { threshold: 0.3 },
  );

  stickyObserver.observe(heroSection);
  stickyObserver.observe(optinSection);
})();

/* ══════════════════════════════════════════════════════════════════
 * 5. COUNT-UP ANIMATION — for #final stats
 * ══════════════════════════════════════════════════════════════════
 *
 * FIX: Lowered threshold from 0.4 to 0.1 so it triggers on mobile
 * when even just 10% of the section is visible.
 *
 * Also added rootMargin to start slightly before section enters view,
 * giving the animation time to run as user scrolls.
 * ══════════════════════════════════════════════════════════════════ */
(function initCountUp() {
  /* Only run on pages that have the #final section */
  var statsSection = document.getElementById("final");
  if (!statsSection) return;

  /* Find all stat numbers that have a data-target attribute */
  var statEls = statsSection.querySelectorAll(".final-stat-num[data-target]");
  if (!statEls.length) return;

  /* Flag to ensure animation only runs once */
  var hasAnimated = false;

  /* ── Easing function ──
   * easeOutQuart: Starts fast, decelerates near the end.
   * t = progress from 0 to 1
   * Returns eased value from 0 to 1
   */
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  /* ── Animate a single counter element ──
   * Reads data-target, data-prefix, data-suffix, data-decimals
   * Uses requestAnimationFrame for smooth 60fps animation
   */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-target")) || 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = parseInt(el.getAttribute("data-decimals")) || 0;
    var duration = 1800; /* Total animation time in ms */
    var start = null;

    function step(timestamp) {
      /* Record start time on first frame */
      if (!start) start = timestamp;

      var elapsed = timestamp - start;
      var progress = Math.min(elapsed / duration, 1); /* 0 to 1 */
      var eased = easeOutQuart(progress);
      var current = target * eased;

      /* Update the displayed number */
      el.textContent = prefix + current.toFixed(decimals) + suffix;

      /* Continue animating until progress reaches 1 (100%) */
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        /* Snap to exact final value to avoid floating point issues */
        el.textContent = prefix + target.toFixed(decimals) + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  /* ── IntersectionObserver ──
   * Watches the #final section.
   * Triggers count-up when section scrolls into view.
   *
   * MOBILE FIX:
   * - threshold: 0.1 → triggers when just 10% is visible (was 0.4)
   * - rootMargin: "0px 0px -50px 0px" → triggers 50px before bottom of viewport
   *   This ensures it fires before user scrolls fully past the section
   */
  var countObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;

          /* Stagger each counter by 150ms for a cascading effect */
          statEls.forEach(function (el, index) {
            setTimeout(function () {
              animateCounter(el);
            }, index * 150);
          });

          /* Stop watching — animation only runs once */
          countObserver.disconnect();
        }
      });
    },
    {
      threshold: 0.1 /* MOBILE FIX: Was 0.4, now 0.1 */,
      rootMargin: "0px 0px -50px 0px" /* Trigger 50px before fully in view */,
    },
  );

  countObserver.observe(statsSection);
})();
