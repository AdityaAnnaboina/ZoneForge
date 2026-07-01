# 🌐 ZoneForge — Enterprise DNS Management Console

[![Next.js](https://img.shields.io/badge/Next.js-14.x-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.x-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

> A high-fidelity, pixel-perfect clone of the **AWS Route 53** Management Console. Engineered as a full-stack monorepo featuring a responsive Next.js frontend, a high-performance FastAPI backend, and a dual-database engine (SQLite for local development, PostgreSQL for production).

---

## 📂 Repository Structure

The actual project files, including the frontend and backend codebase, are located inside the nested **[Zoneforge/](Zoneforge/)** directory:

* 📝 **[Main Project README](Zoneforge/README.md)**: Refer here for detailed environment setup, run instructions, and database details.
* 💻 **[Frontend (Next.js)](Zoneforge/frontend/)**: Next.js TypeScript application simulating the AWS console interface.
* ⚙️ **[Backend (FastAPI)](Zoneforge/backend/)**: FastAPI REST API handling hosted zones, DNS records, and IAM authentication sessions.
* 📖 **[Technical Documentation](Zoneforge/technical_documentation.md)**: Deep-dive details on application architecture, state design, and data schemas.

---

## 🚀 Live Deployments

* **Frontend Console**: [https://zone-forge.vercel.app/](https://zone-forge.vercel.app/)
* **Backend REST API**: [https://zoneforge-backend.onrender.com/](https://zoneforge-backend.onrender.com/)
* **API Documentation**: [https://zoneforge-backend.onrender.com/docs](https://zoneforge-backend.onrender.com/docs) (Interactive Swagger UI)

---

## 📸 Screenshots

| AWS-Style Login | Hosted Zones Dashboard |
| :---: | :---: |
| ![Login Screenshot](Zoneforge/screenshots/login.png) | ![Dashboard Screenshot](Zoneforge/screenshots/dashboard.png) |

---

## 🛠️ Quick Start

To run this project locally, navigate into the nested **`Zoneforge`** subdirectory and follow the instructions in [Zoneforge/README.md](Zoneforge/README.md):

```bash
# Clone the repository
git clone https://github.com/AdityaAnnaboina/ZoneForge.git

# Navigate to the project root directory
cd ZoneForge/Zoneforge
```

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Activate Virtual Environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Install Dependencies
pip install -r requirements.txt

# Run Development Server
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.local.example .env.local
npm run dev
```

For more detailed information, please read the **[full project README](Zoneforge/README.md)**.
