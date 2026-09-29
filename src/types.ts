export type EvaluationType = 'GD' | 'PI';

export type TargetRole = 'Full Stack Developer' | 'Data Analyst' | 'Tech Sales' | 'General';

export type Degree = 'B.Tech' | 'MCA' | 'BCA' | 'Other';

export interface InterviewerProfile {
  name: string;
  phone?: string;
  panel?: string;
  companyOrCollege?: string;
}

export interface AmcatCategory {
  id: string;
  name: string;
  maxScore: number;
}

export interface Candidate {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  phone?: string;
  degree: Degree;
  targetRole: TargetRole;
  amcatScores?: Record<string, number>; // categoryId -> score
  amcatScore: number; // total sum
  status: 'Pending' | 'GD Completed' | 'PI Shortlisted' | 'Selected' | 'Eliminated';
  notes?: string;
}

export interface AutomatedReview {
  verdict: 'Strong Shortlist' | 'Recommended' | 'Borderline' | 'Needs Improvement';
  summary: string;
  strengths: string[];
  growthAreas: string[];
  roleFitNote: string;
  feedbackText: string;
}

export interface EvaluationRecord {
  id: string;
  srNo: number;
  candidateId: string;
  studentName: string;
  rollNo: string;
  degree: Degree;
  targetRole: TargetRole;
  evaluationType: EvaluationType;
  scores: Record<string, number>;
  totalScore: number; // out of 50
  maxScore: number; // 50
  automatedReview: AutomatedReview;
  customFeedback?: string; // Interviewer custom feedback
  aiFeedback?: string; // AI generated feedback
  interviewerRemarks: string; // Final remarks recorded in sheet
  interviewerName: string;
  interviewerPhone?: string;
  timestamp: string;
}

export interface GDTopic {
  id: string;
  title: string;
  category: 'Tech & AI' | 'Business & Industry' | 'Social & Ethics' | 'Career & Education';
  relevantRoles: TargetRole[];
  context: string;
  keyArgumentsFor: string[];
  keyArgumentsAgainst: string[];
  whatToLookFor: string[];
}

export interface InterviewQuestion {
  id: string;
  role: TargetRole;
  category: string;
  question: string;
  difficulty: 'Entry-Level' | 'Moderate' | 'Advanced';
  evaluationHints: string[];
  followUpProbes: string[];
}
