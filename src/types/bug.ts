export type BugCategory =
  | "thinking"
  | "emotional"
  | "behavioral"
  | "social";

export type BugSeverity = "low" | "medium" | "high";

export interface TriggerCondition {
  scenario: string;
  description?: string;
}

export interface ReasoningStep {
  step: number;
  thought: string;
  cognitiveLeap: string;
}

export interface RealCase {
  title: string;
  context: string;
  bugManifestation: string;
  consequence?: string;
}

export interface CognitiveBug {
  id: string;
  name: string;
  tagline?: string;
  scientificName?: string;
  alias?: string[];
  category: BugCategory;
  severity: BugSeverity;
  description: string;
  commonPhrases: string[];
  triggerConditions: TriggerCondition[];
  reasoningPath: ReasoningStep[];
  realCases: RealCase[];
  coping: string[];
  keywords: string[];
  museumNumber: string;
  icon?: string;
  version?: string;
  tags?: string[];
}

export interface BugMatchResult {
  bug: CognitiveBug;
  matchScore: number;
  matchedKeywords: string[];
  matchReason?: string;
}

export interface BugMatcher {
  match(input: string, bugs: CognitiveBug[]): Promise<BugMatchResult[]>;
}

export const categoryLabels: Record<BugCategory, string> = {
  thinking: "思维偏差",
  emotional: "情绪偏差",
  behavioral: "行为偏差",
  social: "社交偏差",
};

export const severityLabels: Record<BugSeverity, string> = {
  low: "轻微",
  medium: "中等",
  high: "严重",
};
