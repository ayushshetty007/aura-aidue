# AURA (AIDue) — Institutional Investment Copilot & Due Diligence Platform

AI-powered Virtual Data Room (VDR) document intelligence, single-call Gemini due-diligence extraction, grounded RAG Q&A, live `yahoo-finance2` stock quotes & present-FY Profit/Loss lookup, and Buy/Hold/Sell advisory.

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure `.env.local` (Only 1 API Key Required)**
   `.env.local` comes pre-seeded with a safe placeholder key so the app boots immediately in demo fallback mode without crashing. To enable live Gemini AI RAG and single-call PDF analysis:
   - Get a free API key from Google AI Studio: https://aistudio.google.com/apikey
   - Open `.env.local` in the project root and replace:
     ```env
     GOOGLE_GENERATIVE_AI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
     ```
     with your actual Gemini API key.
   - Live Indian (`NSE`/`BSE` `.NS`/`.BO`) and US stock quotes, historical charts, gold futures (`GC=F`), and present-FY Profit/Loss statements use `yahoo-finance2` and require **no API key**.

3. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Verifying Each Integration
- **System Health:** Visit `/api/health` or open the **Settings** tab to verify whether Gemini is running in Live mode or Demo Fallback mode.
- **VDR Upload & Single-Call Analysis:** Open **Due Diligence -> Documents (VDR)**, upload any text-based financial PDF, and inspect **Company Analysis**, **Risks**, **Opportunities**, **Cross-Doc Comparison**, **Investment Assessment**, and **AI Q&A**.
- **Live Stock & Buy/Hold/Sell Advisory:** Open **Market Intelligence -> Stock Analysis & Buy/Sell** and search any ticker (e.g. `TCS`, `RELIANCE`, `TATAMOTORS`, `NVDA`, `AAPL`).
- **Global Search (`Cmd+K` / `Ctrl+K`):** Press `⌘K` / `Ctrl+K` to search any Indian or global company and inspect its **Present FY Profit/Loss**, revenue, live share price, and AI verdict.
