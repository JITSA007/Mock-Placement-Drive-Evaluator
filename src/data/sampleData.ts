import { Candidate, GDTopic, InterviewQuestion, EvaluationRecord, AmcatCategory } from '../types';

export const DEFAULT_AMCAT_CATEGORIES: AmcatCategory[] = [
  { id: 'cat-quant', name: 'Quantitative Ability', maxScore: 300 },
  { id: 'cat-logical', name: 'Logical Reasoning', maxScore: 300 },
  { id: 'cat-verbal', name: 'Verbal Ability (English)', maxScore: 300 },
  { id: 'cat-domain', name: 'Domain & Technical Automata', maxScore: 100 },
];

export const GD_CRITERIA = [
  'Content Knowledge',
  'Communication Skills',
  'Leadership / Initiative',
  'Teamwork / Behavior',
  'Body Language',
] as const;

export const PI_CRITERIA = [
  'Professionalism',
  'Communication Skills',
  'Confidence & Energy',
  'Mobility',
  'Domain Knowledge',
] as const;

export const ROLES_CONFIG = {
  'Full Stack Developer': {
    company: 'Nexora Digital Technologies Pvt. Ltd.',
    location: 'Ahmedabad, Gujarat – On-site',
    package: '7 LPA',
    openings: 3,
    eligibility: 'BCA / MCA / B.Tech (Min 60% in 10th or 12th)',
    skills: ['HTML, CSS, JavaScript', 'React.js / Angular', 'Node.js / Python / Java', 'SQL & Databases', 'REST APIs & Git'],
  },
  'Data Analyst': {
    company: 'InsightEdge Analytics Pvt. Ltd.',
    location: 'Jaipur, Rajasthan – Hybrid',
    package: '5 LPA',
    openings: 2,
    eligibility: 'BCA / MCA / B.Tech (Min 60% in 10th or 12th)',
    skills: ['Advanced Excel / Google Sheets', 'SQL Fundamentals', 'Power BI / Tableau', 'Statistics & Interpretation', 'Data Cleaning & Validation'],
  },
  'Tech Sales': {
    company: 'CloudVantage Solutions Pvt. Ltd.',
    location: 'Noida, Uttar Pradesh – On-site',
    package: '8 LPA Fixed + 3 LPA Variable',
    openings: 3,
    eligibility: 'BCA / MCA / B.Tech (Min 60% in 10th or 12th)',
    skills: ['Strong Verbal & Written Communication', 'SaaS & Cloud Solutions Basics', 'Lead Generation & Prospecting', 'CRM & Pipeline Management', 'Objection Handling & Negotiation'],
  },
  'General': {
    company: 'Campus Placement Cell',
    location: 'Pan India',
    package: 'Competitive',
    openings: 10,
    eligibility: 'All eligible final year students',
    skills: ['Aptitude & Problem Solving', 'Communication & Teamwork', 'Domain Fundamentals', 'Professional Etiquette'],
  },
};

// CLEAN DATABASE: 0 Demo records. Ready for real placement drive evaluations!
export const INITIAL_CANDIDATES: Candidate[] = [];

export const INITIAL_EVALUATIONS: EvaluationRecord[] = [];

export const GD_TOPICS: GDTopic[] = [
  {
    id: 'gdt-1',
    title: 'Generative AI & LLMs in Software Engineering: Career Acceleration or Job Cannibalization?',
    category: 'Tech & AI',
    relevantRoles: ['Full Stack Developer', 'Data Analyst'],
    context: 'With GitHub Copilot and AI coding agents writing boilerplate, is coding becoming prompt engineering or higher-level architecture?',
    keyArgumentsFor: [
      'Increases developer productivity by automating boilerplate code and unit tests.',
      'Allows developers to focus on system design, security, and complex business logic.',
      'Democratizes software creation for fast prototyping in startups.',
    ],
    keyArgumentsAgainst: [
      'Risk of reduced fundamental problem-solving and algorithmic thinking.',
      'Potential junior developer hiring shrinkage in traditional IT services.',
      'IP, security vulnerabilities, and copyright hallucinations in generated code.',
    ],
    whatToLookFor: [
      'Balanced viewpoint rather than extreme panic or blind tech-enthusiasm.',
      'Concrete engineering examples (APIs, testing, architecture).',
      'Respectful acknowledgement of contradictory perspectives.',
    ],
  },
  {
    id: 'gdt-2',
    title: 'Data-Driven Decision Making vs Human Intuition in Modern Enterprise Management',
    category: 'Business & Industry',
    relevantRoles: ['Data Analyst', 'Tech Sales'],
    context: 'Companies like Amazon and Netflix rely entirely on telemetry and A/B testing, whereas historic breakthroughs often came from founder intuition.',
    keyArgumentsFor: [
      'Eliminates cognitive biases, gut feelings, and costly subjective errors.',
      'Provides repeatable, audit-ready operational frameworks.',
      'Enables real-time customer personalization at massive scale.',
    ],
    keyArgumentsAgainst: [
      'Over-reliance on historical data fails in unprecedented black swan events.',
      'Analysis paralysis can kill fast first-mover market speed.',
      'Metrics often measure proxies rather than genuine customer delight.',
    ],
    whatToLookFor: [
      'Understanding of statistical caveats (correlation vs causation).',
      'Ability to articulate hybrid decision frameworks (data informs, humans decide).',
      'Active listening when team members introduce counter-examples.',
    ],
  },
  {
    id: 'gdt-3',
    title: 'Mandatory Return-to-Office (RTO) vs Permanent Remote/Hybrid: The Future of Tech Workspaces',
    category: 'Career & Education',
    relevantRoles: ['Full Stack Developer', 'Data Analyst', 'Tech Sales'],
    context: 'Tech giants are enforcing 3-5 days in-office, citing culture and mentorship, while tech talent values location flexibility.',
    keyArgumentsFor: [
      'Spontaneous cross-functional collaboration and faster junior mentorship.',
      'Stronger corporate cohesion and clearer separation of work vs personal life.',
      'Better compliance, hardware access, and enterprise data security.',
    ],
    keyArgumentsAgainst: [
      'Massive reduction in commute fatigue, cost of living, and carbon footprint.',
      'Access to national and global talent regardless of Tier-1 city relocation.',
      'Individual contributor productivity is often higher in quiet home setups.',
    ],
    whatToLookFor: [
      'Empathy toward both employee well-being and company business realities.',
      'Structured arguments referencing team communication tools (Slack, Jira, async docs).',
      'Positive, solutions-oriented tone regarding relocation adaptability.',
    ],
  },
  {
    id: 'gdt-4',
    title: 'Subscription Fatigue & SaaS Pricing Models: Are Customers Pushing Back?',
    category: 'Business & Industry',
    relevantRoles: ['Tech Sales', 'Data Analyst'],
    context: 'With rising cloud bills and tool consolidation, enterprise software vendors face growing demands for usage-based vs seat-based pricing.',
    keyArgumentsFor: [
      'SaaS predictable recurring revenue aligns long-term product maintenance.',
      'Low initial capital expenditure lets startups access top-tier infrastructure.',
      'Continuous feature updates and managed cloud security without on-prem patching.',
    ],
    keyArgumentsAgainst: [
      'Hidden cumulative costs; enterprises paying for inactive software seats ("shelfware").',
      'Vendor lock-in and high switching friction.',
      'Growing corporate mandates to consolidate tool suites and slash variable software spend.',
    ],
    whatToLookFor: [
      'Commercial acumen and understanding of ARR, churn, and sales cycles.',
      'Practical role-play on explaining value over price tag.',
      'Ability to articulate customer pain points cleanly.',
    ],
  },
];

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // Full Stack Developer
  {
    id: 'iq-fs-1',
    role: 'Full Stack Developer',
    category: 'Frontend & React',
    question: 'Explain how React state batching and the virtual DOM reconciliation work. When would you use useMemo or useCallback?',
    difficulty: 'Moderate',
    evaluationHints: [
      'Explains virtual DOM diffing and fiber tree updates concisely.',
      'Mentions that React batches multiple setState calls inside event handlers.',
      'Knows premature optimization is bad: useMemo is for expensive calculations, useCallback is to prevent child re-renders with stable references.',
    ],
    followUpProbes: [
      'What happens if you mutate state directly instead of calling setState?',
      'How does server-side rendering (SSR) compare with client-side SPA rendering?',
    ],
  },
  {
    id: 'iq-fs-2',
    role: 'Full Stack Developer',
    category: 'Backend & APIs',
    question: 'How do you design a scalable REST API with authentication? Explain the difference between session cookies and JWT bearer tokens.',
    difficulty: 'Moderate',
    evaluationHints: [
      'Articulates stateless JWT vs stateful session lookup in Redis/DB.',
      'Addresses token expiration, refresh tokens, and CSRF / XSS security practices.',
      'Mentions HTTP status codes (200, 201, 400, 401, 403, 500) and structured error bodies.',
    ],
    followUpProbes: [
      'Where should JWT tokens be stored securely in the browser?',
      'How do you handle database connection pooling in a Node.js Express server?',
    ],
  },
  {
    id: 'iq-fs-3',
    role: 'Full Stack Developer',
    category: 'Database & SQL',
    question: 'Write or explain a query to find the 2nd highest salary from an Employee table. How would you index this table for high-read performance?',
    difficulty: 'Entry-Level',
    evaluationHints: [
      'Knows LIMIT OFFSET approach: SELECT DISTINCT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET 1 (or DENSE_RANK() OVER()).',
      'Explains B-tree index on salary column.',
      'Considers NULL edge cases and duplicate salaries.',
    ],
    followUpProbes: [
      'What is an SQL JOIN vs a subquery? Which one performs better on indexed tables?',
      'What is database normalization and when do we denormalize in NoSQL?',
    ],
  },

  // Data Analyst
  {
    id: 'iq-da-1',
    role: 'Data Analyst',
    category: 'SQL & Data Wrangling',
    question: 'What is the difference between WHERE and HAVING in SQL? Give an example involving GROUP BY.',
    difficulty: 'Entry-Level',
    evaluationHints: [
      'Clear definition: WHERE filters rows before aggregation; HAVING filters groups after aggregation.',
      'Constructs valid query: SELECT department, COUNT(*) FROM emp GROUP BY department HAVING COUNT(*) > 5.',
    ],
    followUpProbes: [
      'What is the difference between UNION and UNION ALL?',
      'How do you replace NULL values in SQL (COALESCE / IFNULL)?',
    ],
  },
  {
    id: 'iq-da-2',
    role: 'Data Analyst',
    category: 'Data Modeling & BI',
    question: 'In Power BI or Excel, what is the difference between Star Schema and Snowflake Schema? Why does Star Schema offer better dashboard performance?',
    difficulty: 'Moderate',
    evaluationHints: [
      'Explains central Fact table with surrounded denormalized Dimension tables (Star).',
      'Recognizes Snowflake normalizes dimensions, creating extra JOIN relationships.',
      'Identifies fewer JOIN operations translate directly to faster DAX queries and responsive visuals.',
    ],
    followUpProbes: [
      'What are measures vs calculated columns in Power BI?',
      'How do you clean dirty survey data with missing phone numbers or duplicated emails?',
    ],
  },

  // Tech Sales
  {
    id: 'iq-ts-1',
    role: 'Tech Sales',
    category: 'Pitching & Value Proposition',
    question: 'How do you structure a 2-minute elevator pitch for a cloud-based CRM solution to a traditional manufacturing SME client?',
    difficulty: 'Moderate',
    evaluationHints: [
      'Starts with the client pain point (missed buyer inquiries, scattered Excel diaries).',
      'Articulates tangible ROI (25% faster order turnaround, automated WhatsApp follow-ups).',
      'Ends with a clear, low-friction call-to-action (complimentary pilot, demo audit).',
    ],
    followUpProbes: [
      'If the business owner says "My staff is not tech-savvy", how do you handle that objection?',
      'How do you qualify whether a lead has real budget authority?',
    ],
  },

  // General & Behavioral
  {
    id: 'iq-gen-1',
    role: 'General',
    category: 'Mobility & Relocation',
    question: 'Nexora is on-site in Ahmedabad, InsightEdge is hybrid in Jaipur, and CloudVantage is in Noida. How prepared are you to relocate, and what are your expectations?',
    difficulty: 'Entry-Level',
    evaluationHints: [
      'Direct, unequivocal answer on relocation readiness.',
      'Demonstrates self-reliance regarding accommodation and family support.',
      'Positive curiosity about the city and company working culture.',
    ],
    followUpProbes: [
      'What would you do if required to work extra hours during a sprint or deployment weekend?',
      'Where do you see yourself professionally 2 years from joining?',
    ],
  },
];
