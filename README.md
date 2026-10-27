# AgriSync AI — Sindh Smart Agriculture & Field Intelligence Platform

A complete, production-ready hackathon submission built for farmers in **Sindh, Pakistan**. Supports **English**, **Urdu (`اردو`)**, and **Sindhi (`سنڌي`)** with full RTL layout switching, a simulated/live Voice Field Assistant, **Crop Doctor** leaf pathology vision diagnostics, and a **Government of Sindh** Benazir Hari Card & Solar Subsidy registration portal.

---

## Folder Structure

```text
C:\Users\DELL\.gemini\antigravity\scratch\agrisync-ai\
├── index.html                  # Complete standalone HTML website (works directly in browser)
├── styles.css                  # Custom dark emerald & soil earthy CSS + pulse animations
├── script.js                   # Complete interactive JS logic (Multilingual, Voice, Vision, Gov Portal)
├── start-agrisync.bat          # One-click Windows launcher for the full-stack server
├── package.json                # Next.js / React configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── next.config.mjs             # Next.js configuration
├── jsconfig.json               # Path aliases (@/*)
├── app/
│   ├── layout.jsx              # Next.js root layout
│   ├── globals.css             # Next.js global styles
│   └── page.jsx                # Next.js main application page
├── components/
│   ├── Dashboard.jsx           # React Module 1: Multilingual Dashboard & Voice Assistant
│   ├── CropDoctor.jsx          # React Module 2: Crop Doctor Vision Upload & Diagnosis
│   └── GovRegister.jsx         # React Module 3: Government of Sindh Registration Portal
└── backend/
    ├── app.py                  # FastAPI Backend serving both the Frontend & AI API endpoints
    └── requirements.txt        # Python backend dependencies
```

---

## 3 Ways to Run the Website

### Option 1: Instant Browser Launch (Zero Setup)
Simply double-click **`index.html`** in File Explorer, or right-click **`index.html`** in VS Code and select **"Open with Live Server"**. Everything (language toggle, voice pulse & speech synthesis, leaf image drag-and-drop, and Sindh Government subsidy calculator) works immediately!

### Option 2: Full-Stack Python FastAPI Mode (Frontend + Backend on Port 8000)
```bash
cd C:\Users\DELL\.gemini\antigravity\scratch\agrisync-ai\backend
pip install -r requirements.txt
python app.py
```
Then open **`http://localhost:8000`** in your browser.

### Option 3: Next.js / React Mode
```bash
cd C:\Users\DELL\.gemini\antigravity\scratch\agrisync-ai
npm install
npm run dev
```
Then open **`http://localhost:3000`** in your browser.
