# VeriPure: Web3 Trust Ledger for Water Quality

VeriPure is a decentralized trust ledger designed to ensure 100% transparent, immutable, and verifiable water safety. Built on Web3 principles, it provides a unified platform for maintenance staff to log data and for students/stakeholders to verify water quality in real-time.

---

## 💧 Problem Statement

How might we help **students and maintenance staff** to **access trustworthy and predictable water supply** from **opaque, manually-tracked maintenance records that are prone to errors or loss** to a **100% verifiable, immutable Web3 Trust Ledger with real-time station scores** so as to **guarantee safe drinking water and total health transparency across the campus** despite **relying on manual data entry by technicians instead of fully automated IoT sensors**.

---

## 🏗️ Core Architecture

- **Frontend**: React-based portal with a premium, minimalist design system.
- **Blockchain Interface**: Cryptographically hashed block system (SHA-256) ensuring integrity.
- **Persistence Layer**: Express API backend connecting to a local SQLite database for real-time history and report storage.

## 🚀 Getting Started

### Prerequisites: Node.js (v18+)

### 1. Install dependencies:
```bash
npm install
```

### 2. Set environment variables:
Configure the `GEMINI_API_KEY` in `.env.local`.

### 3. Run the Backend API:
```bash
npm run api
```
*(This starts the SQLite-backed Express server on port 3001)*

### 4. Run the Frontend:
```bash
npm run dev
```
*(This starts the Vite dev server on port 3000)*

---

## 🛠️ Key Features

- **Maintenance Portal**: Securely log pH, TDS levels, and filter changes.
- **Student Access**: Scan station IDs to immediately see a station's custom **Trust Score**.
- **Immutable History**: View every maintenance block and report ever generated for a station.
- **Water Quality Alerts**: Report taste, odor, or hardware issues directly to the ledger.
