/*
 * ════════════════════════════════════════════════════════════════════
 * shared.js — Shared Utilities (runs on EVERY page)
 * ════════════════════════════════════════════════════════════════════
 * Includes:
 *   - Scroll reveal IntersectionObserver
 *   - Dynamic dashboard date
 *   - FAQ accordion toggle
 *   - Sticky CTA show/hide logic
 * ════════════════════════════════════════════════════════════════════
 */

"use strict";

/* ══════════════════════════════════════════════════════════════════
 * 1. SCROLL REVEAL
 * Watches elements with class="reveal".
 * Adds class="visible" when they scroll into view.
 * CSS transition in shared.css handles the animation.
 * ══════════════════════════════════════════════════════════════════ */
(function initScrollReveal() {
  /* Select all elements that need reveal animation */
  var revealEls = document.querySelectorAll(".reveal");
  if (!revealEls.length) return; /* Exit if no reveal elements on this page */

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry, index) {
        if (entry.isIntersecting) {
          /* Stagger delay: each element enters 60ms after the previous */
          setTimeout(function () {
            entry.target.classList.add("visible");
          }, index * 60);

          /* Stop watching once revealed — no need to re-animate */
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 } /* Trigger when 12% of element is visible */,
  );

  revealEls.forEach(function (el) {
    observer.observe(el);
  });
})();

/* ══════════════════════════════════════════════════════════════════
 * 2. DYNAMIC DASHBOARD DATE
 * Replaces the hardcoded "May 2025" with the current month/year.
 * Only runs if the dashboard date element exists on the page.
 * ══════════════════════════════════════════════════════════════════ */
(function setDashboardDate() {
  var dateEl = document.getElementById("dashMonth");
  if (!dateEl) return; /* Only on landing page */

  dateEl.textContent = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
})();

/* ══════════════════════════════════════════════════════════════════
 * 3. FAQ ACCORDION TOGGLE
 * Exported as a global function because it's called via onclick=""
 * in the HTML. Opens one FAQ at a time (closes others).
 * ══════════════════════════════════════════════════════════════════ */
function toggleFaq(btn) {
  /* Get the parent .faq-item */
  var item = btn.closest(".faq-item");
  var isOpen = item.classList.contains("open");

  /* Close ALL open FAQ items first */
  document.querySelectorAll(".faq-item.open").forEach(function (openItem) {
    openItem.classList.remove("open");
  });

  /* If the clicked item was closed, open it */
  if (!isOpen) {
    item.classList.add("open");
  }
}

/* ══════════════════════════════════════════════════════════════════
 * 4. STICKY MOBILE CTA — SHOW / HIDE
 * Hides the sticky bottom CTA when the hero or optin
 * sections are visible (no need to double-show CTA).
 * Only runs on the landing page where .sticky-cta exists.
 * ══════════════════════════════════════════════════════════════════ */
(function initStickyCta() {
  var stickyCta = document.querySelector(".sticky-cta");
  var heroSection = document.getElementById("hero");
  var optinSection = document.getElementById("optin");

  /* Exit if elements don't exist on this page */
  if (!stickyCta || !heroSection || !optinSection) return;

  var stickyObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          /* Hide CTA when hero or optin section is visible */
          stickyCta.style.display = "none";
        } else {
          /* Show CTA when both are scrolled out of view */
          stickyCta.style.display = "flex";
        }
      });
    },
    { threshold: 0.3 } /* Trigger when 30% of section is visible */,
  );

  stickyObserver.observe(heroSection);
  stickyObserver.observe(optinSection);
})();
