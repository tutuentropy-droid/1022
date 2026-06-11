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

export type DebugMode = "single" | "relationship";

export type ParticipantRole = "A" | "B";

export interface DialogueTurn {
  speaker: ParticipantRole;
  content: string;
  timestamp?: number;
}

export interface RelationshipInput {
  participantA: {
    name: string;
    description?: string;
  };
  participantB: {
    name: string;
    description?: string;
  };
  scenario: string;
  dialogue: DialogueTurn[];
}

export interface EmotionalTrigger {
  keyword: string;
  emotion: string;
  intensity: number;
  description: string;
}

export interface TriggerChainNode {
  step: number;
  speaker: ParticipantRole;
  content: string;
  bug?: CognitiveBug;
  bugMatchScore?: number;
  emotion: string;
  emotionIntensity: number;
  triggers: EmotionalTrigger[];
  interpretation: string;
  underlyingBelief?: string;
}

export interface ParticipantTriggerChain {
  participant: ParticipantRole;
  name: string;
  chain: TriggerChainNode[];
  coreBugs: BugMatchResult[];
  dominantEmotion: string;
  primaryTrigger: string;
}

export interface EscalationStep {
  step: number;
  speaker: ParticipantRole;
  action: string;
  reaction: string;
  intensityChange: number;
  mechanism: string;
}

export interface MisunderstandingPoint {
  id: string;
  whatASaid: string;
  whatAIntended: string;
  whatBHeard: string;
  whatBResponded: string;
  distortion: string;
  missingContext?: string;
}

export interface MisunderstandingFormation {
  origin: string;
  points: MisunderstandingPoint[];
  reinforcementLoop: string;
  alternativeInterpretation: string;
}

export type FuturePathType =
  | "deterioration"
  | "repair"
  | "drifting_apart"
  | "boundary_rebuild"
  | "stagnation";

export interface RelationshipStep {
  id: string;
  round: number;
  speaker: "A" | "B";
  speakerName: string;
  action: string;
  interpretation: string;
  emotion: string;
  emotionIntensity: number;
  mechanism: string;
  isReplaceable?: boolean;
  replacementOptions?: RelationshipReplacementOption[];
}

export interface RelationshipReplacementOption {
  id: string;
  content: string;
  interpretation: string;
  emotion: string;
  emotionIntensity: number;
  description: string;
}

export interface RelationshipFuturePath {
  id: FuturePathType;
  name: string;
  icon: string;
  description: string;
  probability: number;
  steps: RelationshipStep[];
  finalOutcome: string;
  overallTone: "negative" | "neutral" | "positive";
  relationshipHealthScore: number;
}

export interface RelationshipSimulationResult {
  paths: RelationshipFuturePath[];
  baselineHealthScore: number;
  selectedPathId?: FuturePathType;
  modifiedPathId?: FuturePathType;
  originalPathId?: FuturePathType;
}

export interface RelationshipDebugResult {
  input: RelationshipInput;
  chainA: ParticipantTriggerChain;
  chainB: ParticipantTriggerChain;
  escalationPath: EscalationStep[];
  misunderstanding: MisunderstandingFormation;
  systemInsight: string;
  deEscalationSuggestions: string[];
  simulation?: RelationshipSimulationResult;
}

export const emotionLabels: Record<string, string> = {
  anger: "愤怒",
  sadness: "悲伤",
  fear: "恐惧",
  anxiety: "焦虑",
  hurt: "受伤",
  disappointment: "失望",
  frustration: "挫败",
  jealousy: "嫉妒",
  insecurity: "不安",
  rejection: "被拒绝",
  ignored: "被忽视",
  unvalued: "不被重视",
  misunderstood: "被误解",
  attacked: "被攻击",
  controlled: "被控制",
  happy: "开心",
  grateful: "感激",
  relieved: "释然",
};

export const escalationMechanisms: Record<string, string> = {
  retaliation: "以牙还牙",
  generalization: "上纲上线",
  mindreading: "揣测动机",
  catastrophizing: "灾难化",
  defensiveness: "防御反击",
  stonewalling: "冷战回避",
  blaming: "指责推诿",
  invalidation: "否定感受",
};
