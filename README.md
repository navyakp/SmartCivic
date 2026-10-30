# SmartCivic — From Complaints to Action

> **AI-Powered Civic Intelligence & Grievance Management Platform**  
> Built for Civic Technology Demonstrations & Municipal Hackathons.

Transform scattered citizen complaints into prioritized, explainable, geographically intelligent, and trackable civic action.

---

## 🏛️ Executive Overview

Communities regularly encounter critical infrastructure hazards: waterlogging, dangerous potholes, overflowing waste, blocked drainage, failed streetlights, and public safety threats. Traditional grievance channels leave urgent hazards buried among routine complaints, offer no duplicate detection, and keep citizens in the dark.

**SmartCivic** solves this through a four-stage pipeline:
1. **CAPTURE:** Citizens submit complaints with photographs, description, and an exact interactive Leaflet map pin in under one minute.
2. **UNDERSTAND:** AI categorizes issues, produces executive summaries, detects duplicates via text similarity and geographic proximity, and calculates a deterministic, explainable priority score (0–100).
3. **REVEAL:** Geographic visualization shows real-time issue distribution, clustering hotspots, and synthesizes automated AI Action Briefs for municipal authorities.
4. **ACT:** Authorities assign departments and field officers, advance operational milestones, and citizens track progress transparently in real time.

---

## 🎨 Professional Civic Design System

SmartCivic is engineered with the aesthetic and authority of a genuine municipal government platform:
* **Primary Dark Navy:** `#233B53`
* **Primary Blue:** `#315F80`
* **Secondary Blue:** `#547D99`
* **Page Background:** `#F4F6F8`
* **Card Background:** `#FFFFFF`
* **Main Text:** `#263442`
* **Secondary Text:** `#697786`
* **Borders:** `#DCE2E8`
* **Critical Priority:** `#B42318`
* **High Priority:** `#C76B19`
* **Medium Priority:** `#B58A26`
* **Low Priority & Resolved:** `#39734D`

Accessible, high-contrast badges ensure status and priority are never communicated through color alone.

---

## ⚙️ Technology Stack

### Frontend
* **React 18** with **TypeScript** and **Vite**
* **Tailwind CSS** (configured with the municipal civic color palette)
* **React Router v6** (role-protected routes for citizens, officers, and administrators)
* **TanStack Query** (efficient cache invalidation)
* **Leaflet & React Leaflet** (OpenStreetMap geospatial visualization with custom priority markers and hotspot radiuses)
* **Recharts** (responsive analytics, weekly trend charts, category distributions, and department workloads)
* **Lucide React** (accessible, standard iconography)

### Backend
* **Node.js & Express.js** with **TypeScript**
* **MongoDB & Mongoose** (supports local MongoDB, MongoDB Atlas, and zero-config automated in-memory MongoDB fallback)
* **JWT Authentication & bcryptjs** password hashing
* **Multer** for secure image uploads (5MB limit, JPG/PNG/WEBP filter)
* **Zod** schema validation

### AI & Intelligence Engines
* **Google Gemini API** (`@google/generative-ai`) with structured JSON schema outputs
* **Explainable Priority Engine:** Deterministic 0–100 scoring algorithm (Urgency: 0–30, Public Safety: 0–25, Community Impact: 0–20, Geographic Clustering: 0–15, Recurrence: 0–10)
* **Duplicate Detection:** Multi-factor analysis combining token-level Jaccard similarity, Haversine geographic distance in meters, and category matching
* **AI Action Brief Generator:** Synthesizes actionable operational briefs for municipal authorities based on real complaint clusters

---

## 🔑 Demonstration Accounts

The platform comes pre-seeded with 41 realistic civic records and four ready-to-use demonstration accounts:

| Role | Email | Password | Scope |
|---|---|---|---|
| **Administrator** | `admin@SmartCivic.gov` | `Admin@12345` | Municipal Commissioner (Full access to all complaints, assignments, overrides, and analytics) |
| **Drainage Officer** | `drainage.officer@SmartCivic.gov` | `Officer@12345` | Senior Officer Rajesh Kumar (Drainage & Sanitation Department) |
| **Roads Officer** | `roads.officer@SmartCivic.gov` | `Officer@12345` | Chief Inspector David Miller (Road Maintenance Department) |
| **Citizen** | `citizen@example.com` | `Citizen@12345` | John Doe (Submit issues, view private history, track progress) |

*(Quick pre-fill buttons are available directly on the login page for instant demonstration.)*

---

## 🚀 Quick Start & Local Execution

### Prerequisites
* Node.js v18+ (tested on v25)
* npm v9+

### 1. Clone & Install Dependencies
```bash
# Install root, server, and client packages
npm run install:all
```
*(Or navigate to `server` and `client` and run `npm install` in each).*

### 2. Environment Configuration
Create `server/.env` based on `server/.env.example`:
```ini
PORT=5000
MONGODB_URI=
JWT_SECRET=SmartCivic_jwt_super_secret_production_ready_key_2026
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
CLIENT_URL=http://localhost:5173
UPLOAD_DIRECTORY=uploads
```
> **Note:** If `MONGODB_URI` is left blank, the server automatically starts an isolated in-memory MongoDB instance and auto-seeds all 41 complaints! If `GEMINI_API_KEY` is not provided, the platform seamlessly uses its local deterministic NLP heuristic fallback engine.

### 3. Start the Application
In two separate terminals:

**Terminal 1 (Backend API):**
```bash
cd server
npm start
# Server listens at http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Client runs at http://localhost:5173
```

Open your browser at **`http://localhost:5173`**.

---

## 🧪 Five-Minute Hackathon Demonstration Script

Follow this step-by-step sequence to demonstrate the entire integrated workflow to judges:

### Step 1 — Citizen Report
1. Open `http://localhost:5173/login` and click the **Citizen** demo button (`citizen@example.com` / `Citizen@12345`).
2. Go to **Report Issue** (`/citizen/report`).
3. Click the **"Fill Demo 1 (Waterlogging)"** shortcut button to populate the official test scenario:
   > *"There is water accumulating near the main road because the drainage appears to be blocked. Vehicles are having difficulty passing."*
4. Click **"Submit Grievance to Municipal Authority"**.

### Step 2 — AI Understanding
1. Observe the immediate AI analysis results displayed on the confirmation panel:
   * **Predicted Category:** Waterlogging / Drainage and sewage
   * **Calculated Priority Score:** Explainable breakdown (e.g. 70/100) across Urgency, Public Safety, Community Impact, Cluster, and Recurrence.
   * **Duplicate Detection:** Notice that the engine immediately detects existing reports within 50 meters and flags them without destroying citizen records.

### Step 3 — Reveal Insights (Authority Portal)
1. Log in as **Administrator** (`admin@SmartCivic.gov` / `Admin@12345`) or navigate to `/admin`.
2. Open the **Overview Dashboard** (`/admin`) to inspect live database KPIs, category bars, and resolution trends.
3. Open the **Live Issue Map** (`/admin/map`) to see the color-coded priority pins, cluster circles (600m radius), and filter by category or status.
4. Open **AI Intelligence** (`/admin/ai-insights`) to view the synthesized Action Brief recommending culvert desilting on MG Road.

### Step 4 — Take Action
1. Open the newly submitted complaint (`/admin/complaints`).
2. In the **Department Assignment** panel, select **Drainage and Sanitation Department**, choose **Senior Officer Rajesh Kumar**, and click **"Assign & Advance Status"**.
3. Under **Workflow Transitions**, advance the status to **In Progress**.

### Step 5 — Citizen Tracking
1. Open the public tracking page at `http://localhost:5173/track`.
2. Enter the complaint ID (e.g., `CP-2026-00042` or `CP-2026-00001`).
3. Observe the real-time reflecting timeline:
   `SUBMITTED` ➔ `ASSIGNED` (Drainage and Sanitation Department) ➔ `IN_PROGRESS`.
4. Review the chronological audit history ledger verifying the exact supervisor remarks and timestamps.

---

## 🛡️ Responsible AI & Security

* **Deterministic Priority Scoring:** Priority scores (0–100) are computed deterministically from validated civic risk factors and spatial context—never hallucinated by an unconstrained LLM.
* **Audit Trail for Human Overrides:** Municipal administrators can override any AI recommendation or priority, requiring mandatory documentation recorded in the permanent audit ledger.
* **Non-Destructive Deduplication:** Duplicates are flagged for administrative correlation; individual citizen references are never silently dropped or merged.
* **Citizen Privacy Protection:** Citizen contact numbers and emails are never exposed on public tracking endpoints and are restricted to authorized municipal officers.
* **Backend API Key Security:** Generative AI credentials reside solely in backend environment variables and are never transmitted to client code.

---

## 📄 License
Released for Civic Technology and Municipal Governance demonstrations.

