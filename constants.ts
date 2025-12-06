import { ChartPie, Code, Palette, Users, Briefcase, ClipboardList } from "lucide-react";

export const INTEREST_QUESTIONS = [
  {
    id: 'realistic',
    question: "I enjoy working with my hands, tools, or machinery.",
    category: 'Realistic',
    icon: Code // Representative
  },
  {
    id: 'investigative',
    question: "I love solving complex problems and analyzing data.",
    category: 'Investigative',
    icon: ChartPie
  },
  {
    id: 'artistic',
    question: "I prefer unstructured activities where I can express my creativity.",
    category: 'Artistic',
    icon: Palette
  },
  {
    id: 'social',
    question: "I find fulfillment in helping, teaching, or counseling others.",
    category: 'Social',
    icon: Users
  },
  {
    id: 'enterprising',
    question: "I enjoy leading teams, selling ideas, and taking risks.",
    category: 'Enterprising',
    icon: Briefcase
  },
  {
    id: 'conventional',
    question: "I like organization, clear rules, and working with detailed records.",
    category: 'Conventional',
    icon: ClipboardList
  }
];

export const SKILL_QUESTIONS = [
  { id: 'communication', label: "Communication & Storytelling" },
  { id: 'analytical', label: "Analytical Thinking & Logic" },
  { id: 'creativity', label: "Creativity & Design" },
  { id: 'leadership', label: "Leadership & Management" },
  { id: 'technical', label: "Technical & Digital Literacy" },
];

export const CORE_VALUES = [
  "Work-Life Balance",
  "High Earning Potential",
  "Social Impact",
  "Creativity & Innovation",
  "Stability & Security",
  "Remote / Flexible Work",
  "Professional Growth",
  "Autonomy",
  "Teamwork",
  "Travel Opportunities"
];
