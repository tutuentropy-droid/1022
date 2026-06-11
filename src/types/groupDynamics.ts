export interface GroupMember {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  color?: string;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  emotion?: string;
  emotionIntensity?: number;
  mentionedUserIds?: string[];
  replyToMessageId?: string;
  isPositive?: boolean;
  conflictLevel?: number;
}

export type GroupCategory = "work" | "family" | "friend" | "community" | "other";

export const groupCategoryLabels: Record<GroupCategory, string> = {
  work: "工作团队",
  family: "家庭",
  friend: "朋友圈",
  community: "社群",
  other: "其他",
};

export const groupCategoryColors: Record<GroupCategory, {
  bg: string;
  border: string;
  text: string;
  gradient: string;
}> = {
  work: {
    bg: "bg-sky-500/10",
    border: "border-sky-400/30",
    text: "text-sky-300",
    gradient: "from-sky-500 to-cyan-500",
  },
  family: {
    bg: "bg-amber-500/10",
    border: "border-amber-400/30",
    text: "text-amber-300",
    gradient: "from-amber-500 to-orange-500",
  },
  friend: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-400/30",
    text: "text-emerald-300",
    gradient: "from-emerald-500 to-teal-500",
  },
  community: {
    bg: "bg-purple-500/10",
    border: "border-purple-400/30",
    text: "text-purple-300",
    gradient: "from-purple-500 to-violet-500",
  },
  other: {
    bg: "bg-gray-500/10",
    border: "border-gray-400/30",
    text: "text-gray-300",
    gradient: "from-gray-500 to-slate-500",
  },
};

export interface Group {
  id: string;
  name: string;
  category: GroupCategory;
  description?: string;
  members: GroupMember[];
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  overallHealth: number;
}

export interface Alliance {
  id: string;
  memberIds: string[];
  memberNames: string[];
  strength: number;
  evidence: string[];
}

export interface PeripheralMember {
  memberId: string;
  memberName: string;
  centralityScore: number;
  participationRate: number;
  reason: string;
}

export interface EmotionalContagion {
  sourceMemberId: string;
  sourceMemberName: string;
  emotion: string;
  affectedMemberIds: string[];
  affectedMemberNames: string[];
  spreadSpeed: number;
  intensity: number;
}

export interface MisunderstandingSpread {
  id: string;
  originMemberId: string;
  originMemberName: string;
  content: string;
  spreadPath: string[];
  spreadMemberNames: string[];
  scope: number;
  harmLevel: number;
}

export interface ConflictAmplifier {
  memberId: string;
  memberName: string;
  amplificationScore: number;
  behaviors: string[];
  triggeredConflicts: number;
}

export interface ConflictBuffer {
  memberId: string;
  memberName: string;
  bufferScore: number;
  behaviors: string[];
  resolvedConflicts: number;
}

export interface GroupDynamicsAnalysis {
  groupId: string;
  groupName: string;
  analysisTime: number;
  overallHealth: number;
  cohesion: number;
  conflictLevel: number;
  alliances: Alliance[];
  peripheralMembers: PeripheralMember[];
  emotionalContagions: EmotionalContagion[];
  misunderstandingSpreads: MisunderstandingSpread[];
  conflictAmplifiers: ConflictAmplifier[];
  conflictBuffers: ConflictBuffer[];
  keyInsights: string[];
}

export interface NetworkNode {
  id: string;
  name: string;
  size: number;
  color: string;
  centrality: number;
  role?: string;
}

export interface NetworkLink {
  source: string;
  target: string;
  value: number;
  type: "alliance" | "conflict" | "neutral" | "support";
}

export interface NetworkGraphData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

export type InputSourceType = "chat" | "meeting" | "conflict";

export const inputSourceTypeLabels: Record<InputSourceType, string> = {
  chat: "群聊记录",
  meeting: "会议记录",
  conflict: "团队冲突",
};

export interface GroupInputData {
  groupId: string;
  sourceType: InputSourceType;
  title?: string;
  rawContent: string;
  parsedMessages: GroupMessage[];
  createdAt: number;
}

export interface MemberInteractionStats {
  memberId: string;
  memberName: string;
  messageCount: number;
  outgoingInteractions: number;
  incomingInteractions: number;
  positiveRatio: number;
  conflictInvolvement: number;
  emotionalExpressiveness: number;
}
