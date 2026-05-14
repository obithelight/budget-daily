# Budget Daily — Kenneth Onu

## 🌐 Live URL
https://kennethonu.com

## 📁 Project Structure
- `/public`              → All publicly served pages & assets
- `/netlify/functions`   → Serverless API functions (Kit integration)
- `/index.html`          → Temporary root redirect to /starter-kit
- `/netlify.toml`        → Netlify config (redirects, headers, caching)

## 📄 Pages
| URL                            | File                            |
|--------------------------------|---------------------------------|
| kennethonu.com/                | Redirects → /starter-kit        |
| kennethonu.com/starter-kit     | public/starter-kit/index.html   |
| kennethonu.com/thank-you       | public/thank-you/index.html     |
| kennethonu.com/privacy         | public/privacy/index.html       |
| kennethonu.com/terms           | public/terms/index.html         |
| kennethonu.com/contact         | public/contact/index.html       |
| kennethonu.com/unsubscribe     | public/unsubscribe/index.html   |

## 🔐 Environment Variables (Setup in Netlify dashboard)
| Variable       | Description              |
|----------------|--------------------------|
| KIT_API_KEY    | Kit (ConvertKit) API key |
| KIT_FORM_ID    | Kit opt-in form ID       |

## 🔐 Environment Variables (Setup For Local Development)
1. Copy the example file: 
   cp .env.example .env

2. Open `.env` and fill in your real values: 
   KIT_API_KEY=your_real_api_key 
   KIT_FORM_ID=your_real_form_id

3. Install Netlify CLI:
   npm install -g netlify-cli

4. Run locally (reads .env automatically):
   netlify dev

5. Open browser at: `http://localhost:8888/starter-kit`

### For Production (Netlify):
Set variables in Netlify Dashboard:
→ Site Configuration → Environment Variables
→ Add: KIT_API_KEY and KIT_FORM_ID

## 🚀 Deploy
Drag the entire `budgetdaily/` folder onto Netlify's deploy zone.

## 📧 Email
Sent from: hello@kennethonu.com (hosted on Zoho Mail)
Platform:  Kit (app.kit.com)

## 💰 Product
$17 — Personal Budget Tracker & Debt Payoff Spreadsheet