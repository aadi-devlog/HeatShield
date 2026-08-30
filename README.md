# HeatShield AI 🛡️☀️

**Industrial Heat Risk Intelligence Dashboard**  
Built for the **FortyGuard Hackathon '26** — *Track 3: Industrial & Enterprise*

![HeatShield AI](https://img.shields.io/badge/FortyGuard-Temperature_API-orange)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.0-purple)

## 📖 Overview

**HeatShield AI** is a real-time, hyperlocal heat risk intelligence platform designed for industrial and logistics enterprise operations. Extreme heat reduces worker safety, degrades equipment, and disrupts supply chains. HeatShield AI consumes the **FortyGuard Temperature API** (providing 20m² resolution at 2m above ground) to offer actionable operational intelligence.

The prototype specifically monitors the **Phoenix Logistics Hub**, transforming raw environmental data into concrete operational decisions (e.g., shifting heavy manual labor to cooler hours, increasing hydration protocols).

## ✨ Key Features

- **Live FortyGuard API Integration:** Uses the authentic asynchronous submit-and-poll pattern (`/v1/env_params` -> `/v1/status`) to fetch real-world hyperlocal environmental data.
- **Facility Heat Risk Gauge:** Calculates a weighted risk score based on temperature, humidity, and operational intensity.
- **"Why?" Explainer & Before/After Panels:** Transparently explains the AI's risk calculation and provides measurable operational recommendations.
- **Demo vs. Live Mode:** Seamlessly toggles between real API data and simulated demo data for judging and presentation purposes.
- **Escalation Simulation:** A dedicated testing flow that triggers a critical heat spike to demonstrate the system's emergency alert capabilities.
- **Data Provenance:** Provides complete transparency on data source, task ID, endpoint, and capability.

## 🛠️ Technology Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Demo Recording:** Playwright (for automated UI walkthroughs)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- A valid [FortyGuard Hackathon](https://www.fortyguard.com/) API Key.

### 1. Installation

Clone the repository and install dependencies:
```bash
cd HeatShield
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory and add your FortyGuard API key. **Never commit this file.**

```env
# .env
FORTYGUARD_API_KEY=your_api_key_here
```

### 3. Running the Application

Start the local Vite development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the dashboard in your browser.

## 📡 API Implementation Details

HeatShield AI integrates the **NVIDIA-recognized Temperature API** using the required asynchronous pattern:

1. **Submission:** `POST /v1/env_params` 
   - *Note:* Our implementation successfully handles FortyGuard payload requirements by passing explicit parameters (including the required root `temperature` field for this specific capability layer).
2. **Polling:** `GET /v1/status/{id}`
   - The application polls this endpoint every 2 seconds until it receives the `Completed` message, after which it extracts the nested JSON data from the `data.result.locations[0].parameters` array.

## 🎬 Demo Video

A fully automated, choreographed 3-minute video demonstration of the application was recorded using sceen recorder. 

The demo covers:
1. The Command Center and real-time environmental data fetching.
2. The Facility Analysis deep-dive for the Phoenix Logistics Hub.
3. The AI's risk explanation and Before/After operational decisions.
4. A simulated Heat Escalation event triggering the Alert Center.

## ⚖️ Hackathon Compliance

This project strictly adheres to the FortyGuard Hackathon '26 rules:
- **Track Alignment:** Purpose-built for Track 3 (Industrial & Enterprise).
- **API Security:** The API key is heavily sandboxed locally via Vite's `import.meta.env` and never exposed in client-side code, logs, or documentation.
- **Team Size:** Developed as a solo project (assisted by AI).

---
*Built with ❤️ for a cooler, safer, and more resilient industrial future.*
