export type BugCategory =
  | "thinking"
  | "emotional"
  | "behavioral"
  | "social";

export type BugSeverity = "low" | "medium" | "high";

export interface CognitiveBug {
  id: string;
  name: string;
  alias?: string[];
  category: BugCategory;
  severity: BugSeverity;
  description: string;
  examples: string[];
  coping: string[];
  keywords: string[];
  triggers?: string[];
  museumNumber: string;
  icon?: string;
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
