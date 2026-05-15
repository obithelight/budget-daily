/*
 * ════════════════════════════════════════════════════════════════════
 * thank-you.js — Thank-You Page Scripts ONLY
 * ════════════════════════════════════════════════════════════════════
 * Handles:
 *   - Security gate check (MUST run before page renders!)
 *   - Dynamic headline personalization with subscriber's name
 *   - Dynamic email display in the green badge
 *   - Resend email button (calls Netlify function again)
 *   - Error display helpers
 * ════════════════════════════════════════════════════════════════════
 */

"use strict";

/* ══════════════════════════════════════════════════════════════════
 * 1. SECURITY GATE — RUNS IMMEDIATELY (before DOM is ready)
 *
 * This is an IIFE (Immediately Invoked Function Expression).
 * It runs the instant the browser hits this script tag.
 *
 * LOGIC:
 *   - Check sessionStorage for 'bd_gate' === 'unlocked'
 *   - If NOT found → redirect to landing page immediately
 *   - If FOUND → remove the token (one-time use) and allow page
 *
 * WHY sessionStorage is secure:
 *   - It can ONLY be written by JavaScript code running on your site
 *   - Typing a URL directly = empty sessionStorage = bounced ✅
 *   - Opening a new tab = empty sessionStorage = bounced ✅
 *   - Refreshing after first load = token gone = bounced ✅
 *   - Real form submission = token set = page shown ✅
 * ══════════════════════════════════════════════════════════════════ */
(function securityGate() {
  var gate = sessionStorage.getItem("bd_gate");

  /* ── UNAUTHORIZED: bounce visitor back to landing page ── */
  if (gate !== "unlocked") {
    /*
     * window.location.replace() instead of .href:
     * replace() removes /thank-you from browser history so
     * pressing Back doesn't loop back to the protected page.
     */
    window.location.replace("/starter-kit");

    /*
     * Stop rendering immediately.
     * This runs before DOMContentLoaded so the page
     * never visually appears to the unauthorized visitor.
     */
    document.addEventListener("DOMContentLoaded", function () {
      document.body.innerHTML = "";
    });

    return; /* Exit function immediately */
  }

  /* ── AUTHORIZED: remove gate token (one-time use only) ── */
  /*
   * We remove 'bd_gate' so refreshing the thank-you page
   * will also bounce the visitor back (intentional — they
   * should use the Resend button if they need the email again).
   *
   * We KEEP bd_email and bd_name for the resend function below.
   */
  sessionStorage.removeItem("bd_gate");
})(); /* IIFE — runs immediately, not waiting for DOM */

/* ══════════════════════════════════════════════════════════════════
 * 2. PERSONALIZE PAGE CONTENT
 * Reads name + email from URL params (set by landing page redirect)
 * with sessionStorage as fallback.
 * Runs after DOM is fully loaded.
 * ══════════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", function () {
  /* ── Read URL params ── */
  var params = new URLSearchParams(window.location.search);

  /* Prefer URL param, fall back to sessionStorage */
  var email = params.get("email")
    ? decodeURIComponent(params.get("email"))
    : sessionStorage.getItem("bd_email") || "";

  var name = params.get("name")
    ? decodeURIComponent(params.get("name"))
    : sessionStorage.getItem("bd_name") || "";

  /* ── Show email in the green display badge ── */
  if (email) {
    var emailTextEl = document.getElementById("emailText");
    var emailDisplayEl = document.getElementById("emailDisplay");

    if (emailTextEl) emailTextEl.textContent = email;
    if (emailDisplayEl) emailDisplayEl.style.display = "inline-flex";
  }

  /* ── Personalize headline with first name ── */
  if (name) {
    var firstName = name.split(" ")[0]; /* Use first name only */
    var headlineEl = document.querySelector(".card-headline");

    if (headlineEl) {
      headlineEl.innerHTML =
        firstName +
        ", check your inbox &mdash;<br>your Starter Kit is on the way.";
    }
  }
});

/* ══════════════════════════════════════════════════════════════════
 * 3. RESEND EMAIL
 * Called by the resend button's onclick attribute.
 * Re-submits the subscriber's email to our Netlify function,
 * which calls Kit again to re-trigger the welcome email.
 * ══════════════════════════════════════════════════════════════════ */
async function resendEmail() {
  var btn = document.getElementById("resendBtn");
  var orig = btn.innerHTML;

  /* ── Read email from URL or sessionStorage ── */
  var params = new URLSearchParams(window.location.search);

  var email = params.get("email")
    ? decodeURIComponent(params.get("email"))
    : sessionStorage.getItem("bd_email") || "";

  var name = params.get("name")
    ? decodeURIComponent(params.get("name"))
    : sessionStorage.getItem("bd_name") || "";

  /* ── Guard: no email found ── */
  if (!email) {
    showResendError(btn, "No email found. Please go back and sign up again.");
    return;
  }

  /* ── Show loading state ── */
  btn.innerHTML = `
    <span style="
      display:          inline-block;
      width:            15px;
      height:           15px;
      border:           2px solid rgba(255, 255, 255, 0.4);
      border-top-color: white;
      border-radius:    50%;
      animation:        spin 0.7s linear infinite;
    "></span>
    &nbsp; Sending...
  `;
  btn.disabled = true;

  try {
    /* ── Call the same Netlify function as the landing page ── */
    var response = await fetch("/.netlify/functions/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        first_name: name,
      }),
    });

    var data = await response.json();

    if (response.ok && data.success) {
      /* ── Success: show green confirmation state ── */
      btn.classList.add("sent");
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2.5" width="15" height="15">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        &nbsp; Email resent — check your inbox!
      `;

      /* ── Reset button after 9 seconds ── */
      setTimeout(function () {
        btn.classList.remove("sent");
        btn.disabled = false;
        btn.innerHTML = orig;
      }, 9000);
    } else {
      throw new Error(data.error || "Resend failed");
    }
  } catch (err) {
    /* ── Failure: restore button + show error ── */
    btn.innerHTML = orig;
    btn.disabled = false;
    showResendError(btn, "Something went wrong. Please try again.");
    console.error("Resend error:", err);
  }
}

/* ══════════════════════════════════════════════════════════════════
 * 4. RESEND ERROR HELPER
 * Inserts a red error message below the resend button.
 * Removes any existing error first to avoid duplicates.
 * ══════════════════════════════════════════════════════════════════ */
function showResendError(btn, message) {
  /* Remove any existing error */
  var existing = btn.parentNode.querySelector(".__resend-error");
  if (existing) existing.remove();

  /* Create and insert error paragraph */
  var errP = document.createElement("p");
  errP.className = "__resend-error";
  errP.textContent = message;
  btn.after(errP);
}
