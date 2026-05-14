/*
 * ════════════════════════════════════════════════════════════════════
 * subscribe.js — Netlify Serverless Function
 * ════════════════════════════════════════════════════════════════════
 *
 * PURPOSE:
 *   Acts as a secure middleman between the landing page form
 *   and the Kit (ConvertKit) API.
 *
 * WHY THIS EXISTS:
 *   Browsers block direct API calls to Kit due to CORS policy.
 *   More importantly — calling Kit directly from the browser
 *   would expose your API key to anyone who inspects the page.
 *   This function runs on Netlify's servers, keeping keys hidden.
 *
 * ENDPOINT (called by landing.js):
 *   POST /.netlify/functions/subscribe
 *
 * REQUEST BODY (JSON):
 *   { "email": "user@example.com", "first_name": "John" }
 *
 * RESPONSE (JSON):
 *   Success: { "success": true }
 *   Failure: { "error": "reason here" }
 *
 * ENVIRONMENT VARIABLES:
 *
 *   LOCAL DEVELOPMENT:
 *     Set in .env file (never commit this file!)
 *     Run with: netlify dev (not Live Server!)
 *     Netlify CLI reads .env and injects variables automatically.
 *
 *   PRODUCTION (Netlify):
 *     Set in Netlify Dashboard →
 *     Site Configuration → Environment Variables
 *     Never stored in code files.
 *
 *   KIT_API_KEY  — Your Kit API key (Settings → Developer)
 *   KIT_FORM_ID  — Your Kit form ID (from form URL)
 * ════════════════════════════════════════════════════════════════════
 */

exports.handler = async function (event) {
  /* ── 1. Only allow POST requests ─────────────────────────────────── */
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  /* ── 2. Parse the incoming request body ──────────────────────────────────────── */
  let data;
  try {
    data = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request body" }),
    };
  }

  const { email, first_name } = data;

  /* ── 3. Server-side validation (second line of defense) ────────
   * The landing page already validates, but we validate again
   * here in case someone tries to call this function directly.
   * ─────────────────────────────────────────────────────────── */
  if (!email || !first_name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Email and name are required" }),
    };
  }

  /* Basic email format check */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid email format" }),
    };
  }

  /* ── 4. Read API credentials from environment variables ─────────────────────────────
   *
   * LOCAL:       comes from your .env file (via netlify dev)
   * PRODUCTION:  comes from Netlify Dashboard env vars
   * Set them in: Netlify → Site Configuration → Environment Variables
   *
   * NEVER hardcode real values here — always use process.env
   *
   * ──────────────────────────────────────────────────────────────── */
  const KIT_API_KEY = process.env.KIT_API_KEY;
  const KIT_FORM_ID = process.env.KIT_FORM_ID;

  /* Guard: crash early if env vars are missing */
  /* ── Helpful error if env vars are missing ───────────────────────
   * Most likely cause locally: running with Live Server instead
   * of Netlify CLI, OR forgot to fill in .env file values.
   * ──────────────────────────────────────────────────────────────── */
  if (!KIT_API_KEY || !KIT_FORM_ID) {
    const isDev = process.env.NETLIFY_DEV === "true";

    console.error(
      isDev
        ? 'LOCAL DEV ERROR: Missing env vars. Check your .env file and make sure you ran "netlify dev" not "Live Server".'
        : "PRODUCTION ERROR: Missing KIT_API_KEY or KIT_FORM_ID. Set them in Netlify Dashboard → Environment Variables.",
    );

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: isDev
          ? 'Local config missing. Check .env file and use "netlify dev" to run locally.'
          : "Server configuration error. Please try again later.",
      }),
    };
  }

  /* ── 5. Submit subscriber to Kit API ────────────────────────────
   * Kit API docs: https://developers.kit.com/
   * Endpoint: POST /v3/forms/{form_id}/subscribe
   * ─────────────────────────────────────────────────────────────── */
  try {
    const kitResponse = await fetch(
      `https://api.convertkit.com/v3/forms/${KIT_FORM_ID}/subscribe`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: KIT_API_KEY,
          email: email.trim().toLowerCase(),
          first_name: first_name.trim(),
        }),
      },
    );

    const kitData = await kitResponse.json();

    /* ── Kit returned an error ─────────────────────────────────── */
    if (!kitResponse.ok) {
      console.error("Kit API error:", kitData);
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: kitData.message || "Subscription failed. Please try again.",
        }),
      };
    }

    /* ── 6. SUCCESS ─────────────────────────────────────────────────── */
    console.log(`New subscriber added to Kit: ${email}`);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        /* Allow only YOUR domain to call this function */
        "Access-Control-Allow-Origin": "https://kennethonu.com",
      },
      body: JSON.stringify({
        success: true,
        message: "Successfully subscribed!",
      }),
    };
  } catch (err) {
    /* ── Unexpected network or runtime error ────────────────────── */
    console.error("Unexpected error in subscribe function:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Something went wrong. Please try again in a moment.",
      }),
    };
  }
}; /* end exports.handler */
