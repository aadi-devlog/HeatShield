# HeatShield AI 🛡️☀️

HeatShield AI is a real-time, hyperlocal heat risk intelligence platform designed for industrial and logistics operations.

![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.0-purple)
![Vercel](https://img.shields.io/badge/Vercel-Serverless-black)

## Problem
Extreme heat severely threatens industrial safety and supply chain continuity. Heat stress reduces worker safety, degrades equipment, and disrupts operations. Industrial managers often lack actionable, hyperlocal environmental intelligence, relying instead on broad weather forecasts that fail to capture the severe microclimate realities of industrial zones like logistics hubs.

## Who It's For
HeatShield AI is designed for **Industrial Operations Managers** and **HSE (Health, Safety & Environment) Directors** running large-scale logistics, warehousing, and manufacturing facilities where outdoor physical labor is unavoidable.

## Solution
HeatShield transforms FortyGuard's environmental intelligence into actionable industrial operational decisions. 

**Central Flow:**
`FortyGuard Environmental Data` → `Heat Intelligence` → `Industrial Risk Engine` → `Operational Decision` → `Measurable Outcome`

## Why FortyGuard
FortyGuard is central to HeatShield because broad regional weather data is insufficient for industrial safety. We require FortyGuard's **20m² hyperlocal resolution** at 2 meters above ground to understand the exact microclimate stress workers face in concrete logistics yards. FortyGuard provides the authentic environmental foundation necessary to calculate genuine operational risk.

## FortyGuard Integration
HeatShield integrates the **Temperature API** using the authentic asynchronous submit-and-poll architecture.

- **Endpoint**: `POST /v1/env_params`
  - **Purpose**: Submit a task to fetch temperature, heat index, relative humidity, and wet-bulb temperature.
  - **How we use it**: Using `filter_type=2` (range of hours), we fetch the hourly environmental curve for a specific industrial coordinate (Phoenix Logistics Hub).
- **Endpoint**: `GET /v1/status/{id}`
  - **Purpose**: Poll the task status until completion.
  - **How we use it**: Our backend securely polls this endpoint to retrieve the final environmental payload once processed.

## Architecture
To ensure absolute security of the FortyGuard API key, HeatShield AI uses a **Server-Side Proxy Architecture**:

```
Browser / React  →  Vercel server-side API (/api/fortyguard)  →  FortyGuard API
```
The FortyGuard API key is stored entirely server-side in the environment and is **never** exposed to the client bundle.

## Features
- **Command Center**: Real-time overview of active facilities and risk scores.
- **Live Mode**: Authentic, real-time integration with the FortyGuard Temperature API.
- **Demo Mode**: Simulated data toggle for offline presentations.
- **Heat Risk Analysis**: Weighted facility risk scoring based on environmental severity and operational intensity.
- **Explainable Risk Factors**: Transparent "Why?" panel detailing the logic behind the risk score.
- **Operational Recommendations**: Automated mitigation strategies (e.g., rescheduling operations).
- **Before/After Analysis**: Measurable comparison of exposure times between current and recommended schedules.
- **Heat Escalation Simulation**: A dedicated testing flow that triggers a critical heat spike to demonstrate the system's emergency alert capabilities.
- **Alerts**: A centralized dashboard for operational warnings and safety mandates.

## Live Demo
LIVE DEMO:
[INSERT FINAL VERCEL URL HERE]

## Demo Video
The project includes a choreographed walkthrough video: `HeatShield_AI_Hackathon_Demo.mp4`. 
This video demonstrates the fully working product from end to end.

## Local Setup

### 1. Prerequisites
- Node.js (v18+ recommended)
- A valid FortyGuard Temperature API key

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory. 
```env
# .env
FORTYGUARD_API_KEY=your_real_api_key_here
```
*Note: The key must be provided through the local environment. Never commit the `.env` file. The `.env.example` file contains placeholders only.*

### 4. Start Development Server
Because we use Vercel Serverless Functions locally, we use Vite's internal plugin middleware or Vercel CLI to serve the backend.
```bash
npm run dev
```

### 5. Build Command
```bash
npm run build
```

## Vercel Deployment
HeatShield AI is designed for seamless deployment on Vercel. 
The `FORTYGUARD_API_KEY` must be configured securely as a **Vercel server-side environment variable**. 
We deliberately do **not** use `VITE_FORTYGUARD_API_KEY` to ensure the secret is never exposed in the client-side JavaScript bundle.

## Demo Scenario
The prototype demonstration monitors the **Phoenix Logistics Hub** in Phoenix, Arizona.
- **FortyGuard Environmental Observations**: The system detects an afternoon heat index spike exceeding 35°C during the 13:00–16:00 window.
- **HeatShield Operational Calculations**: The engine identifies that the current logistics schedule exposes workers to 82 minutes of high-risk heat exposure.
- **Measurable Outcome**: HeatShield recommends shifting heavy loading operations to the morning (10:00–12:00 window), resulting in a **65% reduction in high-risk exposure** (saving 53 high-risk minutes).

## Project Structure
```text
HeatShield/
├── api/                  # Vercel server-side API proxy routes
├── docs/                 # Hackathon summary and documentation
├── public/               # Static assets
├── src/                  # React frontend source code
├── .env.example          # Environment variable placeholders
├── .gitignore            # Git ignore rules (ignores .env, dist, etc.)
├── package.json          # Node dependencies and scripts
└── README.md             # Project documentation
```

## Security
- **Server-Side Integration**: All FortyGuard API communication and async polling occurs server-side in `/api/fortyguard.js`.
- **Environment Secrets**: The API key is heavily sandboxed locally via `process.env`.
- **No Client Exposure**: The API key is completely absent from the frontend Vite build bundle (`dist/`).
- **Git Safety**: The `.env` file is excluded from the repository.
