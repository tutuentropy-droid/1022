import type { PersonalityProfile, PersonalityAugmentedExplanation } from "./personality";

export type BugCategory =
  | "thinking"
  | "emotional"
  | "behavioral"
  | "social";

export type BugSeverity = "low" | "medium" | "high";

export type BugRank = "S" | "A" | "B" | "C" | "D";

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

export interface BugPropagation {
  targetId: string;
  reason: string;
  strength: number;
}

export interface CognitiveBug {
  id: string;
  name: string;
  tagline?: string;
  scientificName?: string;
  alias?: string[];
  category: BugCategory;
  severity: BugSeverity;
  rank: BugRank;
  recurrenceRate: number;
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
  triggers?: BugPropagation[];
  triggeredBy?: string[];
}

export type EdgeType = "matched" | "potential";

export type SpiralSeverity = "mild" | "moderate" | "severe";

export interface ChainNode {
  bugId: string;
  bug: CognitiveBug;
  matchScore: number;
  isTrigger: boolean;
  level: number;
  isMatched: boolean;
  propagationStrength: number;
}

export interface ChainEdge {
  from: string;
  to: string;
  reason: string;
  strength: number;
  type: EdgeType;
}

export interface PropagationPath {
  bugIds: string[];
  nodes: ChainNode[];
  edges: ChainEdge[];
  totalStrength: number;
}

export interface BugChain {
  nodes: ChainNode[];
  edges: ChainEdge[];
  triggerBugId: string;
  chainLength: number;
  potentialCount: number;
  explanation: string;
  dominantPath: PropagationPath | null;
  spiralSeverity: SpiralSeverity;
  personalityProfile?: PersonalityProfile;
  personalityAugmented?: PersonalityAugmentedExplanation;
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

export const rankLabels: Record<BugRank, string> = {
  S: "S级 · 标本级",
  A: "A级 · 珍贵级",
  B: "B级 · 馆藏级",
  C: "C级 · 普通级",
  D: "D级 · 观测级",
};

export const rankColors: Record<BugRank, string> = {
  S: "#ff6b6b",
  A: "#ffa94d",
  B: "#c9a962",
  C: "#69db7c",
  D: "#74c0fc",
};

export type SimulationNodeType = "thought" | "emotion" | "behavior" | "outcome" | "belief";

export interface SimulationNode {
  id: string;
  type: SimulationNodeType;
  content: string;
  isPositive?: boolean;
  isReplaceable?: boolean;
  replacementOptions?: ReplacementOption[];
}

export interface ReplacementOption {
  id: string;
  content: string;
  description: string;
  type: SimulationNodeType;
}

export interface SimulationPath {
  bugId: string;
  originalPath: SimulationNode[];
  generatedAt: number;
}

export interface SimulationResult {
  nodes: SimulationNode[];
  outcome: string;
  mood: "negative" | "neutral" | "positive";
  isModified: boolean;
}

export const nodeTypeLabels: Record<SimulationNodeType, string> = {
  thought: "想法",
  emotion: "情绪",
  behavior: "行为",
  outcome: "结果",
  belief: "信念",
};

export const nodeTypeColors: Record<SimulationNodeType, { bg: string; border: string; icon: string }> = {
  thought: { bg: "bg-blue-500/15", border: "border-blue-400/40", icon: "💭" },
  emotion: { bg: "bg-pink-500/15", border: "border-pink-400/40", icon: "💗" },
  behavior: { bg: "bg-amber-500/15", border: "border-amber-400/40", icon: "🎬" },
  outcome: { bg: "bg-purple-500/15", border: "border-purple-400/40", icon: "🎯" },
  belief: { bg: "bg-emerald-500/15", border: "border-emerald-400/40", icon: "🌟" },
};
