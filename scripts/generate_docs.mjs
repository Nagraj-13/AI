import fs from 'fs';
import path from 'path';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const baseDir = process.cwd();
const resumesDir = path.join(baseDir, 'sample_resumes');
const targetDir = path.join(baseDir, 'sample_documents');
const targetResumesDir = path.join(targetDir, 'resumes');
const targetJdsDir = path.join(targetDir, 'job_descriptions');

if (!fs.existsSync(targetResumesDir)) {
  fs.mkdirSync(targetResumesDir, { recursive: true });
}
if (!fs.existsSync(targetJdsDir)) {
  fs.mkdirSync(targetJdsDir, { recursive: true });
}

// 1. Define Candidate Resume Texts
const candidateResumes = [
  {
    filename: '01_alex_chen_senior_ai_engineer',
    name: 'Alex Chen',
    title: 'Senior AI & Machine Learning Engineer',
    lines: [
      "ALEX CHEN",
      "San Francisco, CA | (555) 234-5678 | alex.chen@example.com | github.com/alexchen-ai",
      "",
      "SUMMARY",
      "Senior Full-Stack AI Engineer with 6+ years of experience building scalable machine learning pipelines, LLM-powered enterprise web applications, and vector search engines. Expert in Python, Next.js, TypeScript, PyTorch, LangChain, and PostgreSQL.",
      "",
      "SKILLS",
      "• Programming: Python, TypeScript, JavaScript, SQL, C++",
      "• Frameworks & Libraries: Next.js, React, Node.js, PyTorch, Transformers, FastAPI, Express",
      "• AI & Vector Databases: OpenAI API, Gemini API, LangChain, Pinecone, Qdrant, Cosine Embeddings",
      "• Infrastructure & Storage: PostgreSQL, Redis, Docker, AWS (S3, EC2, Lambda), Vercel",
      "",
      "PROFESSIONAL EXPERIENCE",
      "",
      "Senior AI Engineer | NeuralScale Technologies (2022 - Present)",
      "• Architected a two-stage vector retrieval and LLM scoring pipeline processing 50,000+ candidate resumes monthly with 94% accuracy.",
      "• Built full-stack Next.js 15 dashboard with real-time SSE progress streaming and automated fallback to secondary LLM endpoints.",
      "• Reduced LLM latency by 45% using Redis embedding caching and quantized model inference.",
      "",
      "Full-Stack Developer | DataPulse Inc. (2019 - 2022)",
      "• Developed responsive web applications using React, TypeScript, and Node.js for high-volume enterprise analytics.",
      "• Integrated PostgreSQL with Prisma ORM, optimizing complex relational queries and database indexing for 3x throughput.",
      "",
      "EDUCATION",
      "B.S. in Computer Science | Stanford University (2015 - 2019)",
      "• Focus on Artificial Intelligence & Distributed Systems"
    ]
  },
  {
    filename: '02_sarah_jenkins_frontend_react_developer',
    name: 'Sarah Jenkins',
    title: 'Lead Frontend React Developer',
    lines: [
      "SARAH JENKINS",
      "Austin, TX | (555) 345-6789 | sarah.jenkins@example.com | portfolio.sarahjenkins.dev",
      "",
      "SUMMARY",
      "Creative Senior Frontend Developer with 5 years of experience building modern, responsive, high-performance web applications using React, Next.js, TypeScript, and Tailwind CSS. Specialized in UI/UX design systems and state management.",
      "",
      "TECHNICAL SKILLS",
      "• Frontend Core: React, Next.js, TypeScript, HTML5, CSS3, Tailwind CSS, JavaScript (ES6+)",
      "• State & Data Fetching: Redux Toolkit, Zustand, TanStack Query (React Query)",
      "• Testing & Tools: Jest, React Testing Library, Cypress, Git, Figma, Webpack, Vite",
      "",
      "WORK EXPERIENCE",
      "",
      "Lead Frontend Engineer | PixelCraft Solutions (2021 - Present)",
      "• Led UI engineering team of 4 to design and ship customer-facing web dashboard used by 120,000+ daily active users.",
      "• Built reusable atomic UI component design system in Next.js & Tailwind CSS, reducing front-end development cycle time by 30%.",
      "• Achieved 98+ Google Lighthouse performance scores through aggressive image optimization, code splitting, and server component rendering.",
      "",
      "Frontend Developer | CloudApp Tech (2019 - 2021)",
      "• Developed interactive web features using React.js, Redux, and RESTful APIs.",
      "• Improved accessibility (WCAG 2.1 AA compliance) across 50+ core application views.",
      "",
      "EDUCATION",
      "B.S. in Software Engineering | University of Texas at Austin (2015 - 2019)"
    ]
  },
  {
    filename: '03_marcus_vance_backend_python_cloud_engineer',
    name: 'Marcus Vance',
    title: 'Senior Backend Python & Cloud Engineer',
    lines: [
      "MARCUS VANCE",
      "Seattle, WA | (555) 456-7890 | marcus.vance@example.com | github.com/marcus-vance",
      "",
      "SUMMARY",
      "Senior Backend & Cloud Infrastructure Engineer with 7 years of expertise in Python, Node.js, PostgreSQL, Docker, AWS, and Microservices Architecture. Proven track record of building resilient distributed microservices handling millions of API requests daily.",
      "",
      "CORE COMPETENCIES",
      "• Backend Languages: Python (FastAPI, Django, Flask), Node.js, Go, SQL",
      "• Cloud & DevOps: AWS (EC2, ECS, S3, RDS, CloudFront), Docker, Kubernetes, Terraform, CI/CD",
      "• Databases: PostgreSQL, MySQL, Redis, MongoDB, Prisma ORM",
      "• Architecture: REST APIs, GraphQL, Microservices, Event-Driven Systems (Kafka, RabbitMQ)",
      "",
      "EXPERIENCE",
      "",
      "Senior Backend Engineer | CloudScale Systems (2020 - Present)",
      "• Designed and maintained high-throughput REST & GraphQL backend services handling 15M+ daily requests.",
      "• Migrated legacy monolithic architecture to containerized Kubernetes microservices on AWS, lowering cloud infrastructure expenditure by 35%.",
      "• Implemented robust PostgreSQL database indexing and query optimizations for complex multi-table joins.",
      "",
      "Backend Software Developer | Apex Solutions (2017 - 2020)",
      "• Developed secure authentication services and API endpoints using Python FastAPI and Node.js.",
      "• Configured automated CI/CD deployment pipelines using GitHub Actions and Docker.",
      "",
      "EDUCATION",
      "B.S. in Computer Engineering | University of Washington (2013 - 2017)"
    ]
  },
  {
    filename: '04_priya_sharma_data_scientist_ml',
    name: 'Priya Sharma',
    title: 'Data Scientist & ML Specialist',
    lines: [
      "PRIYA SHARMA",
      "New York, NY | (555) 567-8901 | priya.sharma@example.com | linkedin.com/in/priyasharma-ml",
      "",
      "SUMMARY",
      "Data Scientist & Machine Learning Specialist with 4 years of experience building predictive models, NLP text classifiers, and recommendation engines. Proficient in Python, PyTorch, Scikit-Learn, SQL, and LLM fine-tuning.",
      "",
      "TECHNICAL SKILLS",
      "• Machine Learning & AI: PyTorch, TensorFlow, Scikit-Learn, XGBoost, NLP, Transformers, LLM Fine-Tuning",
      "• Languages & Tools: Python, R, SQL, Pandas, NumPy, Jupyter, Git",
      "• Big Data & Cloud: Apache Spark, Snowflake, AWS SageMaker, Docker",
      "",
      "PROFESSIONAL EXPERIENCE",
      "",
      "Data Scientist | DataVision AI (2022 - Present)",
      "• Developed NLP sentiment and entity extraction model for customer support tickets, improving automated routing accuracy to 91%.",
      "• Built customer churn prediction model using XGBoost that saved an estimated $1.2M in annual recurring revenue.",
      "• Conducted A/B experimentation and statistical modeling for new feature releases.",
      "",
      "Junior Data Analyst | FinAnalytics Group (2020 - 2022)",
      "• Extracted and cleaned multi-gigabyte datasets using SQL queries and Python Pandas.",
      "• Designed interactive Tableau and PowerBI executive dashboards for financial metric tracking.",
      "",
      "EDUCATION",
      "M.S. in Data Science | Columbia University (2018 - 2020)",
      "B.S. in Statistics | NYU (2014 - 2018)"
    ]
  },
  {
    filename: '05_david_miller_devops_sre',
    name: 'David Miller',
    title: 'DevOps & Site Reliability Engineer',
    lines: [
      "DAVID MILLER",
      "Chicago, IL | (555) 678-9012 | david.miller@example.com | github.com/dmiller-ops",
      "",
      "SUMMARY",
      "DevOps & Site Reliability Engineer with 6 years of experience implementing Infrastructure as Code (IaC), container orchestration, zero-downtime deployment pipelines, and cloud security monitoring.",
      "",
      "CORE SKILLS",
      "• Infrastructure as Code: Terraform, Ansible, CloudFormation",
      "• Container Orchestration: Kubernetes, Docker, Helm",
      "• CI/CD Pipelines: GitHub Actions, GitLab CI, Jenkins",
      "• Monitoring & Logging: Prometheus, Grafana, Datadog, ELK Stack",
      "• Cloud & Scripting: AWS, GCP, Bash, Python, Go",
      "",
      "WORK EXPERIENCE",
      "",
      "Senior DevOps Engineer | InfraCloud Inc. (2021 - Present)",
      "• Automated multi-region AWS Kubernetes (EKS) cluster provisioning using Terraform, serving 99.99% uptime SLA.",
      "• Reduced build deployment pipeline execution time from 25 minutes to 4 minutes using GitHub Actions runner optimization.",
      "• Implemented Datadog alert triggers and automated incident escalation protocols.",
      "",
      "DevOps Systems Admin | NetWorks Global (2018 - 2021)",
      "• Managed 200+ Linux servers (Ubuntu/RHEL) across AWS and hybrid environments.",
      "• Implemented SSL/TLS automated certificate renewal scripts and vulnerability scanning tools.",
      "",
      "EDUCATION",
      "B.S. in Information Technology | University of Illinois Chicago (2014 - 2018)"
    ]
  },
  {
    filename: '06_emily_watson_product_manager',
    name: 'Emily Watson',
    title: 'Principal Product Manager',
    lines: [
      "EMILY WATSON",
      "Boston, MA | (555) 789-0123 | emily.watson@example.com | linkedin.com/in/emilywatson-pm",
      "",
      "SUMMARY",
      "Technical Product Manager with 5 years of experience leading cross-functional engineering, UX design, and data science teams to build SaaS software products. Passionate about user-centric product roadmap planning, metric analytics, and Agile sprints.",
      "",
      "SKILLS & SPECIALTIES",
      "• Product Management: Product Roadmap, User Story Mapping, Agile/Scrum, Sprint Planning, PRD Creation",
      "• Analytics & Tools: Jira, Confluence, Mixpanel, Amplitude, Figma, SQL, Tableau",
      "• Industry Focus: B2B SaaS, Artificial Intelligence, Recruiting & HR Tech Tools",
      "",
      "EXPERIENCE",
      "",
      "Senior Product Manager | TalentFlow Tech (2022 - Present)",
      "• Owned product strategy and execution for enterprise HR applicant tracking features used by over 300 corporate recruiting teams.",
      "• Defined product requirements (PRDs) for AI candidate match scoring feature, increasing recruiter workflow speed by 40%.",
      "• Managed two 6-person Agile engineering squads across 2-week sprint cycles.",
      "",
      "Product Manager | WebLaunch Media (2019 - 2022)",
      "• Launched customer feedback portal that grew user engagement metrics by 28% within 6 months.",
      "• Conducted 50+ customer discovery interviews to synthesize product backlog priorities.",
      "",
      "EDUCATION",
      "B.A. in Business Administration & Computer Science | Boston University (2015 - 2019)"
    ]
  }
];

// 2. Define Job Description Texts (4 JDs)
const jobDescriptions = [
  {
    filename: 'jd_01_senior_ai_engineer',
    title: 'Senior AI & Machine Learning Engineer - Job Description',
    lines: [
      "JOB TITLE: Senior AI & Machine Learning Engineer",
      "LOCATION: San Francisco, CA / Remote",
      "DEPARTMENT: Engineering & AI Innovation",
      "EMPLOYMENT TYPE: Full-Time",
      "",
      "JOB OVERVIEW",
      "We are seeking an experienced Senior AI & Machine Learning Engineer to lead the design and deployment of our next-generation AI resume screening and candidate evaluation platform. In this role, you will architect retrieval-augmented generation (RAG) pipelines, optimize large language model (LLM) inference, and integrate intelligent search and ranking capabilities into our web platform.",
      "",
      "KEY RESPONSIBILITIES",
      "• Design, build, and deploy end-to-end LLM scoring and candidate matching pipelines.",
      "• Implement high-performance vector search algorithms using Pinecone, Qdrant, or Pgvector for semantic resume retrieval.",
      "• Develop full-stack features using Next.js, React, TypeScript, and Python (FastAPI/Flask).",
      "• Optimize prompt engineering and model fine-tuning workflows for maximum accuracy and minimal latency.",
      "• Collaborate with product managers and backend engineers to integrate AI models into microservices.",
      "",
      "REQUIRED QUALIFICATIONS",
      "• 4+ years of professional experience in software engineering and applied AI/ML.",
      "• Strong proficiency in Python, TypeScript, and modern JS frameworks (Next.js / React).",
      "• Direct hands-on experience with LLM APIs (OpenAI, Google Gemini, Anthropic) and vector databases.",
      "• Solid understanding of relational databases (PostgreSQL, Prisma ORM) and caching (Redis).",
      "• Experience deploying containerized applications with Docker and AWS.",
      "",
      "PREFERRED QUALIFICATIONS",
      "• B.S. or M.S. in Computer Science, Artificial Intelligence, or related technical field.",
      "• Published work or open-source contributions in NLP or RAG systems."
    ]
  },
  {
    filename: 'jd_02_lead_frontend_react_developer',
    title: 'Lead Frontend React Developer - Job Description',
    lines: [
      "JOB TITLE: Lead Frontend React Developer",
      "LOCATION: Austin, TX / Remote",
      "DEPARTMENT: Product Engineering",
      "EMPLOYMENT TYPE: Full-Time",
      "",
      "JOB OVERVIEW",
      "We are looking for a highly skilled Lead Frontend React Developer to spearhead our UI architecture. You will be responsible for creating intuitive, lightning-fast, visually stunning user interfaces for enterprise hiring managers and recruiters using React 19, Next.js 15, TypeScript, and Tailwind CSS.",
      "",
      "KEY RESPONSIBILITIES",
      "• Lead frontend architecture and establish visual design systems and reusable component libraries.",
      "• Build responsive, accessible (WCAG compliant) dashboards and interactive data visualizations.",
      "• Optimize application performance, rendering speeds, and bundle sizes across web and mobile viewports.",
      "• Mentor junior frontend developers and enforce high standards of code quality and component testing.",
      "",
      "REQUIRED QUALIFICATIONS",
      "• 5+ years of software engineering experience focusing on frontend web development.",
      "• Mastery of React, Next.js, TypeScript, HTML5, CSS3, and Tailwind CSS.",
      "• Deep understanding of modern state management (Zustand, Redux, React Query).",
      "• Proven track record of optimizing Web Vitals and performance scores.",
      "• Experience writing automated unit and integration tests (Jest, React Testing Library, Cypress).",
      "",
      "PREFERRED QUALIFICATIONS",
      "• Experience with dark mode, glassmorphism, and modern UI micro-animations.",
      "• Familiarity with Figma design file translation."
    ]
  },
  {
    filename: 'jd_03_senior_backend_python_cloud_engineer',
    title: 'Senior Backend Python & Cloud Engineer - Job Description',
    lines: [
      "JOB TITLE: Senior Backend Python & Cloud Engineer",
      "LOCATION: Seattle, WA / Hybrid",
      "DEPARTMENT: Infrastructure & Platform Engineering",
      "EMPLOYMENT TYPE: Full-Time",
      "",
      "JOB OVERVIEW",
      "Join our platform team to build scalable, resilient backend services and database systems supporting millions of API requests. You will design RESTful APIs, manage PostgreSQL schema migrations, implement Redis caching strategies, and automate cloud infrastructure deployments.",
      "",
      "KEY RESPONSIBILITIES",
      "• Develop microservices and RESTful / GraphQL APIs using Python (FastAPI, Django) and Node.js.",
      "• Design complex PostgreSQL database schemas, indexing strategies, and ORM abstractions.",
      "• Architect cloud infrastructure on AWS using Docker, Kubernetes (EKS), and Terraform.",
      "• Ensure system security, data encryption, and role-based access control across all API endpoints.",
      "",
      "REQUIRED QUALIFICATIONS",
      "• 5+ years of backend engineering experience with Python and relational databases.",
      "• Strong expertise in PostgreSQL, query optimization, and Redis caching.",
      "• Proven experience with containerization (Docker) and Kubernetes orchestration.",
      "• Solid knowledge of CI/CD pipelines (GitHub Actions, GitLab CI) and AWS services.",
      "",
      "PREFERRED QUALIFICATIONS",
      "• Experience in HR Tech, resume parsing pipelines, or high-concurrency SaaS applications."
    ]
  },
  {
    filename: 'jd_04_senior_devops_sre_engineer',
    title: 'Senior DevOps & Site Reliability Engineer - Job Description',
    lines: [
      "JOB TITLE: Senior DevOps & Site Reliability Engineer",
      "LOCATION: Chicago, IL / Remote",
      "DEPARTMENT: Site Reliability & Infrastructure",
      "EMPLOYMENT TYPE: Full-Time",
      "",
      "JOB OVERVIEW",
      "We are seeking a Senior DevOps & Site Reliability Engineer to maintain and scale our multi-region cloud infrastructure. You will manage automated Kubernetes clusters, establish continuous integration and deployment (CI/CD) pipelines, and implement real-time monitoring and alert escalation.",
      "",
      "KEY RESPONSIBILITIES",
      "• Provision and maintain cloud resources on AWS using Infrastructure as Code (Terraform).",
      "• Build and optimize fast, secure CI/CD pipelines for Next.js, Node.js, and Python microservices.",
      "• Configure observability stacks using Prometheus, Grafana, Datadog, and ELK.",
      "• Maintain 99.99% system availability and participate in automated on-call escalation rotation.",
      "",
      "REQUIRED QUALIFICATIONS",
      "• 4+ years of hands-on experience in DevOps, SRE, or Infrastructure Engineering.",
      "• Deep knowledge of Kubernetes, Docker, Terraform, and AWS cloud ecosystem.",
      "• Strong shell scripting skills (Bash, Python, Go).",
      "• Demonstrated experience managing zero-downtime blue/green or canary deployments.",
      "",
      "PREFERRED QUALIFICATIONS",
      "• AWS Certified Solutions Architect or Certified Kubernetes Administrator (CKA)."
    ]
  }
];

// Helper to generate DOCX document
async function generateDocx(docData, outputPath) {
  const paragraphs = docData.lines.map(line => {
    if (!line.trim()) {
      return new Paragraph({ children: [new TextRun({ text: '' })] });
    }
    
    // Header line
    if (line === docData.lines[0]) {
      return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: line, bold: true, size: 28, color: '1A365D' })]
      });
    }
    
    // Subheaders / Sections
    if (/^[A-Z\s&]{4,}:?$/.test(line) || line.startsWith('JOB TITLE:') || line.startsWith('LOCATION:')) {
      const isMeta = line.includes(':');
      return new Paragraph({
        heading: isMeta ? undefined : HeadingLevel.HEADING_2,
        children: [new TextRun({ text: line, bold: true, size: isMeta ? 20 : 24, color: '2B6CB0' })]
      });
    }
    
    // Bullet lines
    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      const text = line.replace(/^[•\-]\s*/, '');
      return new Paragraph({
        bullet: { level: 0 },
        children: [new TextRun({ text: text, size: 20 })]
      });
    }

    return new Paragraph({
      children: [new TextRun({ text: line, size: 20 })]
    });
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
}

// Helper to generate PDF document using pdf-lib
async function generatePdf(docData, outputPath) {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  
  let y = height - 50;
  const margin = 50;
  const maxWidth = width - margin * 2;
  const lineHeight = 14;

  for (let i = 0; i < docData.lines.length; i++) {
    const line = docData.lines[i];

    if (y < margin + 20) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = height - 50;
    }

    if (!line.trim()) {
      y -= lineHeight / 2;
      continue;
    }

    let font = fontRegular;
    let fontSize = 10;
    let textColor = rgb(0.1, 0.1, 0.1);

    // Title / Candidate Name
    if (i === 0) {
      font = fontBold;
      fontSize = 18;
      textColor = rgb(0.1, 0.25, 0.5);
      page.drawText(line, { x: margin, y, size: fontSize, font, color: textColor });
      y -= fontSize + 8;
      continue;
    }

    // Subtitle / Contact info
    if (i === 1) {
      fontSize = 9.5;
      textColor = rgb(0.3, 0.3, 0.3);
      page.drawText(line, { x: margin, y, size: fontSize, font, color: textColor });
      y -= fontSize + 10;
      continue;
    }

    // Section Titles
    if (/^[A-Z\s&]{4,}:?$/.test(line)) {
      font = fontBold;
      fontSize = 12;
      textColor = rgb(0.15, 0.4, 0.7);
      
      // Draw section header bar
      page.drawText(line, { x: margin, y, size: fontSize, font, color: textColor });
      y -= fontSize + 4;
      page.drawLine({
        start: { x: margin, y: y + 2 },
        end: { x: width - margin, y: y + 2 },
        thickness: 0.75,
        color: rgb(0.8, 0.85, 0.9)
      });
      y -= 6;
      continue;
    }

    // Bullet points & normal text wrapping
    let textToDraw = line;
    let xOffset = margin;
    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      xOffset = margin + 10;
      textToDraw = line;
    }

    // Simple text wrapping if string is long
    const words = textToDraw.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (textWidth > (maxWidth - (xOffset - margin))) {
        page.drawText(currentLine, { x: xOffset, y, size: fontSize, font, color: textColor });
        y -= lineHeight;
        currentLine = word;
        if (y < margin + 20) {
          page = pdfDoc.addPage([595.28, 841.89]);
          y = height - 50;
        }
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      page.drawText(currentLine, { x: xOffset, y, size: fontSize, font, color: textColor });
      y -= lineHeight;
    }
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
}

// 3. Process Resumes
console.log('Generating Resumes...');
for (const item of candidateResumes) {
  const docxPath = path.join(targetResumesDir, `${item.filename}.docx`);
  const pdfPath = path.join(targetResumesDir, `${item.filename}.pdf`);
  const txtPath = path.join(targetResumesDir, `${item.filename}.txt`);

  // Write TXT
  fs.writeFileSync(txtPath, item.lines.join('\n'));
  // Write DOCX
  await generateDocx(item, docxPath);
  // Write PDF
  await generatePdf(item, pdfPath);
  console.log(`Generated resume: ${item.filename} (.docx, .pdf, .txt)`);
}

// 4. Process Job Descriptions
console.log('\nGenerating Job Descriptions...');
for (const item of jobDescriptions) {
  const docxPath = path.join(targetJdsDir, `${item.filename}.docx`);
  const pdfPath = path.join(targetJdsDir, `${item.filename}.pdf`);
  const txtPath = path.join(targetJdsDir, `${item.filename}.txt`);

  // Write TXT
  fs.writeFileSync(txtPath, item.lines.join('\n'));
  // Write DOCX
  await generateDocx(item, docxPath);
  // Write PDF
  await generatePdf(item, pdfPath);
  console.log(`Generated JD: ${item.filename} (.docx, .pdf, .txt)`);
}

console.log('\nDone generating all sample resumes and JDs in DOCX and PDF formats!');
