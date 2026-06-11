export type RelationshipCategory =
  | "intimate"
  | "work"
  | "family"
  | "friend"
  | "acquaintance";

export const relationshipCategoryLabels: Record<RelationshipCategory, string> = {
  intimate: "亲密关系",
  work: "工作关系",
  family: "家庭关系",
  friend: "朋友关系",
  acquaintance: "其他关系",
};

export const relationshipCategoryColors: Record<RelationshipCategory, {
  bg: string;
  border: string;
  text: string;
  iconBg: string;
  gradient: string;
}> = {
  intimate: {
    bg: "bg-rose-500/10",
    border: "border-rose-400/30",
    text: "text-rose-300",
    iconBg: "from-rose-500/30 to-rose-500/10",
    gradient: "from-rose-500 to-pink-500",
  },
  work: {
    bg: "bg-sky-500/10",
    border: "border-sky-400/30",
    text: "text-sky-300",
    iconBg: "from-sky-500/30 to-sky-500/10",
    gradient: "from-sky-500 to-cyan-500",
  },
  family: {
    bg: "bg-amber-500/10",
    border: "border-amber-400/30",
    text: "text-amber-300",
    iconBg: "from-amber-500/30 to-amber-500/10",
    gradient: "from-amber-500 to-orange-500",
  },
  friend: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-400/30",
    text: "text-emerald-300",
    iconBg: "from-emerald-500/30 to-emerald-500/10",
    gradient: "from-emerald-500 to-teal-500",
  },
  acquaintance: {
    bg: "bg-purple-500/10",
    border: "border-purple-400/30",
    text: "text-purple-300",
    iconBg: "from-purple-500/30 to-purple-500/10",
    gradient: "from-purple-500 to-violet-500",
  },
};

export type RelationshipStatus = "improving" | "stable" | "deteriorating" | "unknown";

export const relationshipStatusLabels: Record<RelationshipStatus, string> = {
  improving: "正在改善",
  stable: "保持稳定",
  deteriorating: "有所恶化",
  unknown: "数据不足",
};

export const relationshipStatusColors: Record<RelationshipStatus, string> = {
  improving: "text-emerald-400",
  stable: "text-museum-gold",
  deteriorating: "text-museum-warningLight",
  unknown: "text-museum-paper/40",
};

export interface Relationship {
  id: string;
  personName: string;
  category: RelationshipCategory;
  description?: string;
  startDate?: string;
  createdAt: number;
  updatedAt: number;
  currentHealthScore: number;
  status: RelationshipStatus;
  tags?: string[];
}

export interface InteractionLog {
  id: string;
  relationshipId: string;
  date: number;
  summary: string;
  dialogue?: string;
  healthScore: number;
  healthScoreChange: number;
  detectedBugIds: string[];
  bugNames: string[];
  patterns: string[];
  emotion: string;
  emotionIntensity: number;
  notes?: string;
  wasPositive: boolean;
}

export interface PatternFrequency {
  patternName: string;
  bugId?: string;
  count: number;
  relationshipCategories: RelationshipCategory[];
  firstOccurrence: number;
  lastOccurrence: number;
}

export interface CategoryStats {
  category: RelationshipCategory;
  relationshipCount: number;
  totalInteractions: number;
  averageHealthScore: number;
  topPatterns: PatternFrequency[];
  overallTrend: number;
}

export interface RelationshipMapData {
  relationships: Relationship[];
  interactions: InteractionLog[];
}

export const commonRelationshipPatterns = [
  {
    id: "people-pleasing",
    name: "讨好模式",
    description: "习惯性迎合他人需求，忽略自己的感受",
    bugKeywords: ["讨好", "迎合", "委屈自己", "怕对方不高兴", "不敢拒绝"],
    icon: "🎭",
  },
  {
    id: "over-explaining",
    name: "过度解释",
    description: "需要反复解释自己的立场，害怕不被理解",
    bugKeywords: ["解释", "说明", "你听我说", "我不是那个意思", "其实"],
    icon: "💬",
  },
  {
    id: "conflict-avoidance",
    name: "回避冲突",
    description: "遇到分歧时选择沉默或逃避，不表达真实想法",
    bugKeywords: ["算了", "没事", "无所谓", "都可以", "随便"],
    icon: "🙈",
  },
  {
    id: "mind-reading",
    name: "揣测动机",
    description: "假设自己知道对方在想什么，不做确认",
    bugKeywords: ["你一定是", "你就是想", "我就知道", "你肯定", "你明明"],
    icon: "🧠",
  },
  {
    id: "catastrophizing",
    name: "灾难化思维",
    description: "把小事放大，往最坏的方向想",
    bugKeywords: ["完了", "完蛋了", "永远", "再也", "一直都这样"],
    icon: "🌋",
  },
  {
    id: "defensiveness",
    name: "防御反击",
    description: "感受到批评时立刻反击，不倾听对方",
    bugKeywords: ["可是", "但是", "不是我", "凭什么", "你才"],
    icon: "🛡️",
  },
  {
    id: "stonewalling",
    name: "冷战回避",
    description: "用沉默和抽离来表达不满或保护自己",
    bugKeywords: ["不想说", "没什么好说的", "随便你", "你爱怎么想怎么想"],
    icon: "🧊",
  },
  {
    id: "generalization",
    name: "上纲上线",
    description: "从具体事件上升到对人的整体否定",
    bugKeywords: ["你总是", "你从来都", "每次都", "永远都是", "你这个人"],
    icon: "📈",
  },
  {
    id: "emotional-reasoning",
    name: "情绪推理",
    description: "把感受当事实，因为我有这种感觉所以一定是真的",
    bugKeywords: ["我觉得", "我感觉", "好像", "似乎", "有种感觉"],
    icon: "💭",
  },
  {
    id: "should-statement",
    name: "应该思维",
    description: "用「应该」「必须」来要求自己和别人",
    bugKeywords: ["应该", "必须", "要", "得", " ought to"],
    icon: "⚖️",
  },
];
