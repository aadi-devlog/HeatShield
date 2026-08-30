# HeatShield AI 🛡️☀️

**Industrial Heat Risk Intelligence Dashboard**  
Built for the **FortyGuard Hackathon '26** — *Track 3: Industrial & Enterprise*

![HeatShield AI](https://img.shields.io/badge/FortyGuard-Temperature_API-orange)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.0-purple)
![Vercel](https://img.shields.io/badge/Vercel-Serverless-black)

## 📖 Overview

**HeatShield AI** is a real-time, hyperlocal heat risk intelligence platform designed for industrial and logistics enterprise operations. Extreme heat reduces worker safety, degrades equipment, and disrupts supply chains. HeatShield AI consumes the **FortyGuard Temperature API** (providing 20m² resolution at 2m above ground) to offer actionable operational intelligence.

## 🏛️ Architecture & Security

To ensure absolute security of the FortyGuard API key, HeatShield AI uses a **Serverless Proxy Architecture** deployed on Vercel:

```text
Browser (React)  →  Vercel Serverless API (/api/fortyguard)  →  FortyGuard API
```
- The frontend **never** receives or handles the API key.
- The async task submission and status polling happens **entirely server-side** within the Vercel function.
- The browser only receives the final normalized JSON data.

## 🚀 Getting Started

### 1. Installation

Clone the repository and install dependencies:
```bash
cd HeatShield
npm install
```

### 2. Environment Configuration

**LOCAL DEVELOPMENT:**
Create a `.env` file in the root directory and add your FortyGuard API key. **Never commit this file.**
```env
# .env
FORTYGUARD_API_KEY=your_api_key_here
```

**VERCEL PRODUCTION:**
The `FORTYGUARD_API_KEY` must be securely configured directly in your Vercel Project Environment Variables. Do NOT use `VITE_` prefixes.

### 3. Running the Application Locally

Start the local development server (using Vercel CLI to support serverless API routes):
```bash
npm run dev
```
*(Ensure `npm run dev` maps to `vercel dev` if you want local API routing, or use Vite proxy).*

Open [http://localhost:5173](http://localhost:5173) to view the dashboard.
