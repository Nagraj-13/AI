# 🚀 AI Resume Screening & Candidate Relevance Platform

An enterprise-grade, AI-powered **Resume Screening, Ranking, and Candidate Job Relevance Platform** built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma ORM, Neon Serverless PostgreSQL, Gemini 2.0 Flash, and Groq Llama 3.3.

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
DATABASE_URL=""

# Application Environment
NODE_ENV=development
```

### 4. Database Setup & Prisma Generation
Generate the Prisma Client types and sync your schema with Neon PostgreSQL:
```bash
npx prisma generate
npx prisma db push
```

*Note: `npx prisma generate` creates the TypeScript types for your database models in `node_modules/@prisma/client`.*

### 5. Run Development Server
Start the Next.js local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

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
