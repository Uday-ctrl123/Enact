# ⚖️ ENACT Legal Assistant (Pichaku)

An intelligent, real-time Legal Assistant built for Indian Law (BNS, BSA, and BNSS 2023). This application leverages bleeding-edge generative AI models via Groq to provide immediate, compliant legal guidance natively in the browser.

## 🚀 Features
- **Lightning Fast AI**: Powered by Groq's LPUs running LLaMA 3.3 for near-instant streaming responses and eliminating token/rate limits.
- **Robust Legal Knowledge**: Hardcoded context specifically focusing on India's new criminal codes (Bharatiya Nyaya Sanhita, Bharatiya Sakshya Adhiniyam, and Bharatiya Nagarik Suraksha Sanhita).
- **Secure Authentication**: Passwordless & OAuth options managed seamlessly through Supabase.
- **Persistent Chat History**: All conversations are synced securely to a PostgreSQL database via Supabase.
- **Dynamic Fallbacks**: Engineered to route traffic cleanly through multiple AI providers (Groq, Gemini, OpenRouter) to ensure 100% uptime regardless of provider rate limits.
- **Responsive & Modern UI**: Built with React, TailwindCSS, and shadcn/ui for a premium user experience across all devices.

## 🛠️ Tech Stack
- **Frontend Framework:** React + Vite + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend & Database:** Supabase (Auth, PostgreSQL, Row Level Security)
- **AI Inference Engine:** Groq (primary), Google Gemini (secondary)
- **Translation / i18n:** `react-i18next` localized chat inputs.

## 💻 Getting Started

### Prerequisites
- Node.js `v18+`
- A [Supabase](https://supabase.com) Account
- A [Groq API Key](https://console.groq.com/keys)

### Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Rename `.env.example` to `.env` and fill in the following credentials:
   ```env
   VITE_SUPABASE_PROJECT_ID=your_project_id
   VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   VITE_SUPABASE_URL=https://your_project.supabase.co
   VITE_GROQ_API_KEY=your_groq_api_key
   VITE_GEMINI_API_KEY=your_gemini_key (optional)
   VITE_OPENROUTER_API_KEY=your_openrouter_key (optional)
   ```

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:** Navigate to `http://localhost:8080`.

## 🔒 Security
- Strict API Key bundling protections included in `src/lib/env.ts`.
- All requests communicate securely over HTTPS/SSE bypassing standard client restrictions.
