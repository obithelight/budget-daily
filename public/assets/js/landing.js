/*
 * ════════════════════════════════════════════════════════════════════
 * landing.js — Landing Page Scripts ONLY
 * ════════════════════════════════════════════════════════════════════
 * Handles:
 *   - Email + name field validation (with inline error messages)
 *   - Form submission to Netlify serverless function
 *   - Loading spinner on submit button
 *   - sessionStorage gate token (security for thank-you page)
 *   - Redirect to /thank-you on success
 * ════════════════════════════════════════════════════════════════════
 */

"use strict";

/* ══════════════════════════════════════════════════════════════════
 * 1. EMAIL VALIDATION
 * Regex checks for: something@something.tld (2+ char TLD)
 * Not a full RFC 5322 check — but catches 99% of typos.
 * ══════════════════════════════════════════════════════════════════ */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/* ══════════════════════════════════════════════════════════════════
 * 2. INLINE FIELD ERROR HELPERS
 * showFieldError — adds red border + error message below input
 * clearFieldError — removes error styling and message
 * ══════════════════════════════════════════════════════════════════ */
function showFieldError(inputEl, message) {
  /* Remove any existing error first */
  clearFieldError(inputEl);

  /* Red border on the input */
  inputEl.style.borderColor = "#ef4444";

  /* Create and insert the error message paragraph */
  var err = document.createElement("p");
  err.className = "__field-error";
  err.textContent = message;

  /* Insert directly after the input element */
  inputEl.parentNode.insertBefore(err, inputEl.nextSibling);
}

function clearFieldError(inputEl) {
  /* Reset border color */
  inputEl.style.borderColor = "";

  /* Remove the error message if it exists */
  var existing = inputEl.parentNode.querySelector(".__field-error");
  if (existing) existing.remove();
}

/* ══════════════════════════════════════════════════════════════════
 * 3. SUBMIT TO NETLIFY FUNCTION
 * Sends email + name to our serverless function at:
 *   POST /.netlify/functions/subscribe
 * The function then securely calls the Kit API server-side.
 * Returns: { success: true } or { success: false, error: '...' }
 * ══════════════════════════════════════════════════════════════════ */
async function submitToKit(name, email) {
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
    return { success: true };
  } else {
    return {
      success: false,
      error: data.error || "Subscription failed. Please try again.",
    };
  }
}

/* ══════════════════════════════════════════════════════════════════
 * 4. MAIN FORM SUBMIT HANDLER
 * Called by both the hero form and the optin section form.
 * The "source" param is unused for now but useful for analytics later.
 *
 * Flow:
 *   1. Prevent default form submit
 *   2. Clear previous errors
 *   3. Validate name + email
 *   4. Show loading spinner
 *   5. Submit to Netlify function → Kit API
 *   6. On success: set sessionStorage gate → redirect to /thank-you
 *   7. On failure: restore button + show error
 * ══════════════════════════════════════════════════════════════════ */
async function handleSubmit(event, source) {
  /* Prevent browser default form submission */
  event.preventDefault();

  var form = event.target;
  var nameEl = form.querySelector('input[type="text"]');
  var emailEl = form.querySelector('input[type="email"]');
  var btn = form.querySelector('button[type="submit"]');

  /* ── Step 1: Clear all previous errors ── */
  clearFieldError(nameEl);
  clearFieldError(emailEl);

  var hasError = false;

  /* ── Step 2: Validate name (required, not just whitespace) ── */
  if (!nameEl.value.trim()) {
    showFieldError(nameEl, "Please enter your first name.");
    hasError = true;
  }

  /* ── Step 3: Validate email (required + format check) ── */
  if (!emailEl.value.trim()) {
    showFieldError(emailEl, "Please enter your email address.");
    hasError = true;
  } else if (!isValidEmail(emailEl.value)) {
    showFieldError(
      emailEl,
      "That doesn't look like a valid email. Please check and try again.",
    );
    hasError = true;
  }

  /* ── Stop here if any validation failed ── */
  if (hasError) return;

  /* ── Step 4: Show loading state on button ── */
  var originalHTML = btn.innerHTML;

  btn.innerHTML = `
    <span style="
      display:      inline-block;
      width:        18px;
      height:       18px;
      border:       2.5px solid rgba(255, 255, 255, 0.4);
      border-top-color: white;
      border-radius: 50%;
      animation:    spin 0.8s linear infinite;
    "></span>
    &nbsp; Sending...
  `;
  btn.disabled = true;

  try {
    /* ── Step 5: Submit to Netlify function ── */
    var result = await submitToKit(nameEl.value.trim(), emailEl.value.trim());

    if (result.success) {
      /* ── Step 6: Set security gate in sessionStorage ────────────
       * This token PROVES the user submitted the real form.
       * The thank-you page checks for this token.
       * If it's not there (e.g. direct URL access) → bounced back.
       * sessionStorage cannot be set by typing a URL — only by JS
       * code running on THIS page. ✅
       * ─────────────────────────────────────────────────────────── */
      sessionStorage.setItem("bd_gate", "unlocked");
      sessionStorage.setItem("bd_email", emailEl.value.trim());
      sessionStorage.setItem("bd_name", nameEl.value.trim());

      /* ── Step 7: Redirect to thank-you page ── */
      /* Email + name in URL are for display only — NOT for security */
      var encodedEmail = encodeURIComponent(emailEl.value.trim());
      var encodedName = encodeURIComponent(nameEl.value.trim());
      window.location.href =
        "/thank-you?email=" + encodedEmail + "&name=" + encodedName;
    } else {
      /* ── Submission failed — show error, restore button ── */
      throw new Error(result.error || "Submission failed");
    }
  } catch (err) {
    /* ── Step 8: Error recovery ── */
    btn.innerHTML = originalHTML;
    btn.disabled = false;

    showFieldError(
      emailEl,
      "Something went wrong. Please try again in a moment.",
    );

    console.error("Form submission error:", err);
  }
}
