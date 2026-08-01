# 🚀 AI Resume Screening & Candidate Relevance Platform

An enterprise-grade, AI-powered **Resume Screening, Ranking, and Candidate Job Relevance Platform** built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma ORM, Neon Serverless PostgreSQL, Gemini 2.0 Flash, and Groq Llama 3.3.

---

## 📸 Platform Preview

![Landing Page](./docs/screenshots/01_landing_page.png)

---

## ✨ Features & Architecture

### 💼 Recruiter Command Center & Screening Hub
- **Position Management:** Create and manage job openings with custom skill requirements and experience thresholds.
- **Strict Recruiter Account Isolation:** Each recruiter sees only their own posted positions and applicants.
- **2-Stage AI Candidate Evaluation:**
  - **40% 768-Dim Vector Embeddings** (Cosine Similarity)
  - **40% LLM Qualitative Evaluation** (Gemini 2.0 Flash / Groq Llama 3.3)
  - **10% Experience Ratio Matching**
  - **10% Skill Coverage Matching**
- **Applicant Analytics & Comparison:** View live applicant counts, average fit scores per position, and side-by-side candidate comparison matrix.

### 🎓 Candidate & Student Portal
- **Profile & Resume Storage:** Check active stored resume content, upload PDF/DOCX documents, or paste resume text manually.
- **Real-Time Job Relevance Insights:** Receive immediate post-application relevance breakdown:
  - **Job Match Alignment Score** (0–100%)
  - **Fit Recommendation:** *Strong Fit*, *Good Fit*, *Potential Fit*, or *Not a Fit*
  - **Matching Qualifications & Strengths**
  - **Recommended Skills to Learn for the Role**
  - **Personalized Career Advice**
- **One-Click Application:** Submit one-click applications with live spinning loader feedback.

### 🤖 Resilient Dual AI Engine & Parsing
- **Primary LLM:** Gemini 2.0 Flash for structured extraction and candidate scoring.
- **Automatic Fallback:** Automatic failover to Groq (`llama-3.3-70b-versatile`) if Gemini hits rate limits or quota caps.
- **Code-First Document Extraction:** Local text extraction via `pdf-parse` (PDF) and `mammoth` (DOCX/Word) with fallback to raw stream parsing.
- **Storage Fallback:** Automatic local disk fallback (`public/uploads`) if Cloudflare R2 / AWS S3 object storage is unconfigured.

---

## 🛠️ Tech Stack

- **Frontend & App Framework:** Next.js (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS, Lucide React Icons
- **Database & ORM:** Neon Serverless PostgreSQL, Prisma ORM
- **AI & Machine Learning:** `@google/genai` (Gemini 2.0 Flash), `groq-sdk` (Llama 3.3 70B), Vector Cosine Similarity
- **Document Parsers:** `pdf-parse`, `mammoth`
- **Testing:** Playwright (End-to-End API Tests)
- **Deployment Target:** Vercel

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18+ & npm
- Neon PostgreSQL database instance (or any PostgreSQL connection URL)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/AI_Resume_Screening_Platform.git
cd AI_Resume_Screening_Platform
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
# Gemini AI API Key (Primary LLM & Embeddings)
GEMINI_API_KEY=your_gemini_api_key_here

# Groq API Key (Fallback LLM Engine)
GROQ_API_KEY=your_groq_api_key_here

# Database Connection URL (Neon Postgres)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Application Environment
NODE_ENV=development
```

### 4. Database Setup & Prisma Generation
Generate the Prisma Client types and sync your schema with Neon PostgreSQL:
```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server
Start the Next.js local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗺️ Step-by-Step Usage Guide

### Step 1 — Landing Page

Visit `http://localhost:3000`. The landing page lets you choose between **Recruiter Command Center** and **Candidate & Student Portal**.

![Landing Page](./docs/screenshots/01_landing_page.png)

---

### Step 2 — Sign In

Click **Sign In** in the top navbar. Select **Recruiter / HR** or **Candidate / Student**, enter your credentials, and click **Sign In**.

![Sign In Page](./docs/screenshots/02_signin_page.png)

---

### Step 3 — Create Account

Switch to the **Create Account** tab. Choose your role, fill in your name, email, and password, then click **Create Account**.

![Create Account](./docs/screenshots/03_signup_page.png)

---

### Step 4 — Recruiter Dashboard

After signing in as a Recruiter, you see the **Command Center** with stats for Open Jobs, Screened Resumes, Average Candidate Score, and AI Engine status. Click **+ Post New Position** to create your first job.

![Recruiter Dashboard](./docs/screenshots/04_recruiter_dashboard.png)

---

### Step 5 — Post a New Job Position

Fill in the **Post New Job Opening** modal with:
- Job Title, Department, Min Experience
- Required Technical Skills (comma-separated)
- Full Job Description

Click **✦ Create Position & Ready AI** to publish the role.

![Create Job Form](./docs/screenshots/05_create_job_form.png)

---

### Step 6 — Job Positions & Screening Hub

The `/jobs` page shows all active positions as cards with department, location, skills, screened count, and average score. Use the search bar to filter by title, department, or skill. Click **Screen Resumes →** to open the candidate screening view for any position.

![Jobs Screening Hub](./docs/screenshots/08_jobs_browse.png)

---

### Step 7 — Candidate Screening Hub

Click **Screen Resumes →** on a job card to open the full screening view where you can upload resumes, inspect AI-ranked candidates, and view per-candidate score breakdowns.

![Candidate Screening](./docs/screenshots/06_screening_hub.png)

---

### Step 8 — Candidate / Student Portal

After signing in as a **Candidate**, you see the **Student Portal** with:
- A drag-and-drop resume upload area (PDF, DOCX, or paste text)
- All available job openings with skill tags and experience requirements
- **Apply** button on each job — triggers instant AI relevance scoring after resume upload

![Candidate Dashboard](./docs/screenshots/07_candidate_dashboard.png)

---

### Step 9 — AI Settings & Scoring Configuration

Navigate to **AI Settings** (top navbar, recruiter only) to view:
- **Primary Evaluation Engine** status (Gemini 2.5 Flash)
- **Failover Engine** status (Groq Llama 3.3 — Standby Ready)
- **Resume Storage** provider (Local Disk or Cloudflare R2)
- **Scoring Formula** breakdown (40% Vector + 40% LLM + 10% Exp + 10% Skill)
- Environment variable reference for deployment

![AI Settings](./docs/screenshots/09_settings_page.png)

---

## 🧪 Running Tests

The project includes a full **End-to-End (E2E) test suite** using Playwright that tests all API routes against the real database — no mocking.

```bash
# Run all tests except AI (fast, ~1 min)
npm run test:api

# Run all tests including AI screening (calls Gemini, ~3–5 min)
npm test

# Open HTML test report
npm run test:report
```

Test suites cover:
| Suite | Tests | Coverage |
|-------|-------|---------|
| `auth.test.ts` | 11 | Signup, login, validation, email normalization |
| `jobs.test.ts` | 10 | GET/POST jobs, filter by recruiter, skills array |
| `applications.test.ts` | 9 | Submit app, idempotency, AI score, auto-resolve resume |
| `settings.test.ts` | 7 | Provider status, default weights, public access |
| `screen.test.ts` | `@ai` | Full AI evaluation, skill parsing, missing params |

---

## 🌐 Deploying to Vercel

The project is pre-configured for one-click deployment on **Vercel**:

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the project into [Vercel](https://vercel.com/new).
3. Set the **Environment Variables** (`DATABASE_URL`, `GEMINI_API_KEY`, `GROQ_API_KEY`).
4. Click **Deploy**!

> **Build Commands Configured:**
> - Build Script: `prisma generate && next build`
> - Postinstall Hook: `prisma generate`
> - Binary Targets: `["native", "rhel-openssl-3.0.x"]`

---

## 📄 License

This project is licensed under the MIT License.
