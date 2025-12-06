export interface UserProfile {
  name: string;
  currentRole: string;
  motivation: string;
  dreamJob?: string;
}

export interface AssessmentScores {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
  [key: string]: number;
}

export interface SkillSet {
  communication: number;
  leadership: number;
  creativity: number;
  analytical: number;
  technical: number;
  [key: string]: number;
}

export interface CareerRecommendation {
  title: string;
  matchPercentage: number;
  description: string;
  salaryRange: string;
  educationPath: string;
  pros: string[];
  cons: string[];
  nextSteps: string[];
}

export interface AnalysisResult {
  summary: string;
  personalityType: string;
  topValues: string[];
  recommendations: CareerRecommendation[];
}

export enum AppStep {
  WELCOME = 'WELCOME',
  PROFILING = 'PROFILING',
  ASSESSMENT_INTERESTS = 'ASSESSMENT_INTERESTS',
  ASSESSMENT_SKILLS = 'ASSESSMENT_SKILLS',
  ASSESSMENT_VALUES = 'ASSESSMENT_VALUES',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  CHAT = 'CHAT'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}
