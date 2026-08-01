# 📸 Platform Screenshots — Step-by-Step User Guide

A visual walkthrough of the **TalentAI — AI Resume Screening Platform** showing every key screen in the application.

> All screenshots are captured from the live app running at `http://localhost:3000`.

---

## Step 1 — Landing Page

The home page introduces both portals. Choose **Recruiter Command Center** or **Candidate & Student Portal** to get started.

![Landing Page](./screenshots/01_landing_page.png)

---

## Step 2 — Sign In

Click **Sign In** in the top navbar. Select your account type (**Recruiter / HR** or **Candidate / Student**), enter your email and password, then click **Sign In as Recruiter** or **Sign In as Candidate**.

![Sign In Page](./screenshots/02_signin_page.png)

---

## Step 3 — Create Account

Switch to the **Create Account** tab on the auth page. Choose your role (Recruiter or Candidate/Student), fill in your name, email, and password, then click **Create Account**.

![Create Account Page](./screenshots/03_signup_page.png)

---

## Step 4 — Recruiter Dashboard (Command Center)

After signing in as a Recruiter, you land on the **Command Center** showing:
- **Open Jobs** count
- **Screened Resumes** count  
- **Avg Candidate Score** across all positions
- **AI Engine** status (Intelligent AI Engine — active)

Click **+ Post New Position** to create your first job opening.

![Recruiter Dashboard](./screenshots/04_recruiter_dashboard.png)

---

## Step 5 — Post a New Job Position

The **Post New Job Opening** modal lets you define:
- **Job Title** (e.g., Senior Full-Stack AI Engineer)
- **Department** and **Min Experience (Years)**
- **Required Technical Skills** (comma-separated)
- **Full Job Description**

Click **✦ Create Position & Ready AI** to publish the role and prime the AI evaluation pipeline.

![Create Job Form](./screenshots/05_create_job_form.png)

---

## Step 6 — Job Positions & Screening Hub

The **Job Positions & Screening Hub** (`/jobs`) shows all active positions with:
- Department badge and Active status
- Location, experience requirement, job type
- Required skill tags
- **Screened** count and **Avg score** per position
- **Screen Resumes →** button to open the candidate screening view for that job

Use the search bar to filter by title, department, or skill.

![Jobs & Screening Hub](./screenshots/08_jobs_browse.png)

---

## Step 7 — Candidate Screening Hub

Click **Screen Resumes →** on any job card to open the full **Candidate Screening Hub** for that position. Here you can:
- Upload resume PDFs/DOCX files in batch
- View all screened candidates ranked by AI fit score
- See per-candidate breakdown: embedding score, LLM score, experience, skills

![Candidate Screening Hub](./screenshots/06_screening_hub.png)

---

## Step 8 — Candidate Dashboard (Student Portal)

After signing in as a **Candidate / Student**, you see the **Student Portal** which shows:
- **Resume Upload section** — drag-and-drop PDF/DOCX or paste text manually
- **Available Job Openings** — all active positions with skill tags and experience level
- Each job card shows a **"Resume Required"** notice until a resume is uploaded

Upload your resume first, then click **Apply** on any job to get instant AI relevance scores.

![Candidate Dashboard](./screenshots/07_candidate_dashboard.png)

---

## Step 9 — AI Settings & Scoring Configuration

Navigate to **AI Settings** (top navbar) to inspect the system configuration:
- **Primary Candidate Evaluation Engine** — Active status + semantic vector matcher
- **High-Availability Failover Engine** — Standby Ready (auto-activates if primary hits limits)
- **Encrypted Resume Repository** — Local Disk Storage or Cloudflare R2
- **Scoring Formula Preset** — `40% Vector + 40% LLM + 10% Exp + 10% Skill`
- **Environment Variable Keys** — reference for `.env` configuration

![AI Settings](./screenshots/09_settings_page.png)

---

## Screenshot Index

| # | File | Description |
|---|------|-------------|
| 1 | [01_landing_page.png](./screenshots/01_landing_page.png) | Home / Landing Page |
| 2 | [02_signin_page.png](./screenshots/02_signin_page.png) | Sign In — Recruiter & Candidate |
| 3 | [03_signup_page.png](./screenshots/03_signup_page.png) | Create Account Form |
| 4 | [04_recruiter_dashboard.png](./screenshots/04_recruiter_dashboard.png) | Recruiter Command Center Dashboard |
| 5 | [05_create_job_form.png](./screenshots/05_create_job_form.png) | Post New Job Opening Modal |
| 6 | [08_jobs_browse.png](./screenshots/08_jobs_browse.png) | Job Positions & Screening Hub |
| 7 | [06_screening_hub.png](./screenshots/06_screening_hub.png) | Candidate Screening View |
| 8 | [07_candidate_dashboard.png](./screenshots/07_candidate_dashboard.png) | Candidate / Student Portal |
| 9 | [09_settings_page.png](./screenshots/09_settings_page.png) | AI Settings & Scoring Config |
