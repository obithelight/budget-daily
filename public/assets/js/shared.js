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
 * HOW IT WORKS:
 *   - Each .final-stat-num element gets a data-target attribute
 *     with the final number to count to.
 *   - When the stats section scrolls into view, numbers count up
 *     from 0 to their target over ~1.8 seconds.
 *   - Runs only once (observer disconnects after firing).
 *
 * DATA ATTRIBUTES on each .final-stat-num:
 *   data-target="340"     → counts to 340
 *   data-prefix="$"       → shows "$" before number (e.g. $340)
 *   data-suffix=" min"    → shows " min" after number
 *   data-suffix=" Tools"  → shows " Tools" after
 *   data-suffix="%"       → shows "%" after
 * ══════════════════════════════════════════════════════════════════ */
(function initCountUp() {
  var statsSection = document.getElementById("final");
  if (!statsSection) return;

  var statEls = statsSection.querySelectorAll(".final-stat-num[data-target]");
  if (!statEls.length) return;

  var hasAnimated = false;

  /* Easing function — starts fast, slows near end */
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-target")) || 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = el.getAttribute("data-decimals") || 0;
    var duration = 1800; /* ms */
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;

      var elapsed = timestamp - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased = easeOutQuart(progress);
      var current = target * eased;

      el.textContent = prefix + current.toFixed(decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        /* Ensure exact final value */
        el.textContent = prefix + target.toFixed(decimals) + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  var countObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;

          /* Stagger each number slightly for a premium feel */
          statEls.forEach(function (el, index) {
            setTimeout(function () {
              animateCounter(el);
            }, index * 150);
          });

          countObserver.disconnect();
        }
      });
    },
    { threshold: 0.4 } /* Trigger when 40% of section visible */,
  );

  countObserver.observe(statsSection);
})();
