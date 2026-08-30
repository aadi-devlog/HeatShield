# HeatShield AI — FortyGuard Hackathon'26 Summary

## Problem
Extreme heat severely threatens industrial safety and supply chain continuity. Heat stress reduces worker safety, degrades equipment, and disrupts operations. Industrial managers often lack actionable, hyperlocal environmental intelligence, relying instead on broad weather forecasts that fail to capture the severe microclimate realities of industrial zones like logistics hubs.

## Who It's For
HeatShield AI is designed for **Industrial Operations Managers** and **HSE (Health, Safety & Environment) Directors** running large-scale logistics, warehousing, and manufacturing facilities where outdoor physical labor is unavoidable.

## FortyGuard Endpoints / Features Used
HeatShield AI integrates the **Temperature API** using the required asynchronous submit-and-poll architecture (`/v1/env_params` to `/v1/status`). 

- **`env_params`**: Used with `filter_type=2` (range of hours) to fetch hyperlocal 20m² resolution Heat Index, Wet-Bulb Temperature, and Relative Humidity across the operational day.
- **`status`**: The system securely polls this endpoint server-side (via Vercel) to await task completion and extract the final environmental payload.

FortyGuard provides the authentic environmental foundation. HeatShield then enriches this data with operational constraints (worker counts, operation types) to calculate a final industrial heat risk score.

## Measured Result
Using FortyGuard's environmental observations at the **Phoenix Logistics Hub**, HeatShield generated a simulated operational outcome:

- **FortyGuard Environmental Data:** Detected afternoon Heat Index spikes exceeding 35°C during the 13:00–16:00 window.
- **HeatShield Operational Simulation:** Identified that the current schedule exposes outdoor loading operations to **82 minutes of high-risk heat exposure** with a "Very High" risk level.
- **Measurable Result:** By shifting intensive operations to the recommended 10:00–12:00 window, the simulation achieves a **65% reduction in high-risk exposure** (reducing exposure from 82 to 29 minutes).

FortyGuard provides the raw environmental intelligence; HeatShield converts it into a measurable operational decision.
