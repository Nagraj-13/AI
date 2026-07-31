export interface MockJob {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experienceYears: number;
  requiredSkills: string[];
  description: string;
  status: "active" | "closed";
  candidateCount: number;
  avgScore: number;
  createdAt: string;
}

export interface MockCandidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  fileKey: string;
  fileType: string;
  rawText: string;
  parsedResume: {
    totalExperienceYears: number;
    skills: string[];
    experience: Array<{
      company: string;
      title: string;
      years: number;
      description: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      year: string;
    }>;
    certifications: string[];
  };
  scores: {
    overallScore: number;
    embeddingScore: number;
    llmScore: number;
    experienceScore: number;
    skillScore: number;
    recommendation: "Strong Fit" | "Good Fit" | "Potential Fit" | "Not a Fit";
  };
  strengths: string[];
  missingSkills: string[];
  qualitativeSummary: string;
  createdAt: string;
}

export const INITIAL_JOBS: MockJob[] = [
  {
    id: "job-1",
    title: "Senior AI / Full-Stack Engineer",
    department: "Engineering",
    location: "San Francisco, CA (Hybrid)",
    type: "Full-Time",
    experienceYears: 5,
    requiredSkills: ["Next.js", "TypeScript", "React", "Python", "Gemini API", "PostgreSQL", "Docker"],
    description: "We are seeking a Senior AI/Full-Stack Engineer to architect and build our next-generation LLM candidate evaluation engines using Next.js 16, TypeScript, Gemini 2.5 Flash, and Neon Postgres.",
    status: "active",
    candidateCount: 4,
    avgScore: 86,
    createdAt: new Date().toISOString(),
  },
  {
    id: "job-2",
    title: "Lead Machine Learning Researcher",
    department: "AI Research",
    location: "Remote",
    type: "Full-Time",
    experienceYears: 6,
    requiredSkills: ["PyTorch", "Transformers", "LLM Fine-Tuning", "Vector DB", "Python", "RAG"],
    description: "Lead cutting-edge research on domain-adapted embedding models, prompt optimization, and agentic workflows for enterprise talent platforms.",
    status: "active",
    candidateCount: 3,
    avgScore: 78,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "job-3",
    title: "Principal Product Designer",
    department: "Design",
    location: "New York, NY",
    type: "Full-Time",
    experienceYears: 4,
    requiredSkills: ["Figma", "Design Systems", "User Research", "Prototyping", "UI/UX"],
    description: "Transform complex recruitment workflows into simple, elegant, high-impact glassmorphic user experiences for global talent acquisition teams.",
    status: "active",
    candidateCount: 2,
    avgScore: 72,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export const INITIAL_CANDIDATES: MockCandidate[] = [
  {
    id: "cand-1",
    jobId: "job-1",
    name: "Alex Rivera",
    email: "alex.rivera@techdomain.io",
    phone: "+1 (555) 234-5678",
    fileKey: "alex_rivera_resume.pdf",
    fileType: "application/pdf",
    rawText: `Alex Rivera\nSenior Full-Stack & AI Engineer\nalex.rivera@techdomain.io | +1 (555) 234-5678\nSan Francisco, CA\n\nSUMMARY\nStaff level engineer with 6+ years building high-throughput web applications and AI agent systems. Proficient in Next.js 16, TypeScript, React 19, Python, and Gemini API integration.\n\nEXPERIENCE\nSynthetix AI — Staff Software Engineer (2022 - Present)\n- Built LLM workflow engine handling 2M daily evaluations using Next.js App Router & Node.\n- Reduced model latency by 45% using streaming responses and vector indexing.\n\nNebula Systems — Senior Frontend Engineer (2019 - 2022)\n- Led team of 6 engineers building React enterprise dashboard.\n- Designed custom UI components and state management.\n\nEDUCATION\nB.S. in Computer Science, UC Berkeley (2019)\n\nSKILLS\nNext.js, TypeScript, React, Python, Gemini API, PostgreSQL, Docker, Tailwind CSS, GraphQL, AWS`,
    parsedResume: {
      totalExperienceYears: 6,
      skills: ["Next.js", "TypeScript", "React", "Python", "Gemini API", "PostgreSQL", "Docker", "Tailwind CSS", "GraphQL"],
      experience: [
        {
          company: "Synthetix AI",
          title: "Staff Software Engineer",
          years: 3,
          description: "Built LLM workflow engine handling 2M daily evaluations using Next.js App Router.",
        },
        {
          company: "Nebula Systems",
          title: "Senior Frontend Engineer",
          years: 3,
          description: "Led team of 6 engineers building React enterprise dashboard.",
        },
      ],
      education: [
        {
          degree: "B.S. in Computer Science",
          institution: "UC Berkeley",
          year: "2019",
        },
      ],
      certifications: ["AWS Certified Solutions Architect", "Google Cloud Machine Learning Engineer"],
    },
    scores: {
      overallScore: 94,
      embeddingScore: 95,
      llmScore: 96,
      experienceScore: 92,
      skillScore: 90,
      recommendation: "Strong Fit",
    },
    strengths: [
      "Extensive 6+ years experience directly aligning with required tech stack (Next.js, TypeScript, Gemini API).",
      "Demonstrated track record scaling LLM evaluation pipelines in production.",
      "Dual strength in frontend design systems and high-throughput backend architecture.",
    ],
    missingSkills: [],
    qualitativeSummary: "Alex is an exceptional candidate with a flawless skill match, proven staff-level leadership, and direct hands-on experience building production LLM platforms.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cand-2",
    jobId: "job-1",
    name: "Sarah Chen",
    email: "sarah.chen@devstudio.com",
    phone: "+1 (555) 876-5432",
    fileKey: "sarah_chen_resume.pdf",
    fileType: "application/pdf",
    rawText: `Sarah Chen\nFull-Stack AI Developer\nsarah.chen@devstudio.com | +1 (555) 876-5432\n\nSUMMARY\nSoftware Engineer with 4.5 years experience developing modern web applications with TypeScript, React, Python, PostgreSQL, and LLM integrations.\n\nEXPERIENCE\nFlowTech — Full Stack Engineer (2021 - Present)\n- Developed microservices in Node.js & Python.\n- Integrated OpenAI & Gemini APIs for automated document analysis.\n\nEDUCATION\nM.S. Software Engineering, Stanford University (2021)\n\nSKILLS\nTypeScript, React, Python, PostgreSQL, Next.js, Node.js, REST APIs`,
    parsedResume: {
      totalExperienceYears: 4.5,
      skills: ["TypeScript", "React", "Python", "PostgreSQL", "Next.js", "Node.js", "REST APIs"],
      experience: [
        {
          company: "FlowTech",
          title: "Full Stack Engineer",
          years: 3.5,
          description: "Developed microservices in Node.js & Python; integrated OpenAI & Gemini APIs.",
        },
      ],
      education: [
        {
          degree: "M.S. Software Engineering",
          institution: "Stanford University",
          year: "2021",
        },
      ],
      certifications: [],
    },
    scores: {
      overallScore: 86,
      embeddingScore: 88,
      llmScore: 85,
      experienceScore: 84,
      skillScore: 85,
      recommendation: "Strong Fit",
    },
    strengths: [
      "Solid Master's degree foundation from Stanford in Software Engineering.",
      "Proven hands-on API integration experience with LLM providers.",
    ],
    missingSkills: ["Docker"],
    qualitativeSummary: "Sarah is a highly capable full-stack developer with strong academics and solid LLM integration experience.",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "cand-3",
    jobId: "job-1",
    name: "Michael Vance",
    email: "m.vance@cloudsystems.net",
    phone: "+1 (555) 345-6789",
    fileKey: "michael_vance_resume.docx",
    fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    rawText: `Michael Vance\nBackend Engineer\nm.vance@cloudsystems.net\n\nEXPERIENCE\nCloud Analytics — Backend Developer (3 years)\nPython, Django, PostgreSQL, Docker, AWS.\n\nSKILLS\nPython, Django, PostgreSQL, Docker, Redis, C++`,
    parsedResume: {
      totalExperienceYears: 3,
      skills: ["Python", "Django", "PostgreSQL", "Docker", "Redis", "C++"],
      experience: [
        {
          company: "Cloud Analytics",
          title: "Backend Developer",
          years: 3,
          description: "Python API development, database optimization, and Docker deployments.",
        },
      ],
      education: [
        {
          degree: "B.S. Information Technology",
          institution: "State University",
          year: "2020",
        },
      ],
      certifications: [],
    },
    scores: {
      overallScore: 68,
      embeddingScore: 70,
      llmScore: 65,
      experienceScore: 60,
      skillScore: 62,
      recommendation: "Potential Fit",
    },
    strengths: [
      "Strong Python and PostgreSQL backend fundamentals.",
    ],
    missingSkills: ["Next.js", "TypeScript", "React", "Gemini API"],
    qualitativeSummary: "Michael possesses solid backend engineering skills in Python and Docker, but lacks frontend React/TypeScript and LLM framework experience required for this specific role.",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];
