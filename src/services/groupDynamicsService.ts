import type {
  Group,
  GroupMessage,
  GroupDynamicsAnalysis,
  Alliance,
  PeripheralMember,
  EmotionalContagion,
  MisunderstandingSpread,
  ConflictAmplifier,
  ConflictBuffer,
  NetworkGraphData,
  NetworkNode,
  NetworkLink,
  MemberInteractionStats,
  GroupMember,
} from "../types/groupDynamics";

const conflictKeywords = [
  "不同意", "反对", "不行", "不对", "错误", "你错了",
  "但是", "可是", "然而", "不过",
  "凭什么", "为什么不", "怎么能",
  "不满意", "有问题", "不行",
  "争吵", "吵架", "争执", "矛盾",
  "抱怨", "投诉", "指责", "批评",
  "不行", "拒绝", "反对",
];

const supportKeywords = [
  "同意", "支持", "好的", "可以", "没问题",
  "赞同", "赞成", "认同",
  "加油", "鼓励", "帮助", "一起",
  "理解", "明白", "懂你",
  "谢谢", "感谢", "感激",
  "好棒", "厉害", "优秀",
  "没问题", "可以的", "没问题",
];

const allianceKeywords = [
  "我们", "咱们", "一起", "共同",
  "支持你", "站你这边", "挺你",
  "和你一样", "同感", "我也是",
];

const bufferKeywords = [
  "冷静一下", "别生气", "消消气",
  "大家都是为了", "换个角度",
  "可以商量", "各让一步",
  "理解双方", "都不容易",
  "先放一放", "缓一缓",
];

const amplifyKeywords = [
  "总是", "从来", "每次都", "永远",
  "根本", "完全", "彻底",
  "就是这样", "肯定是", "一定是",
  "太过分了", "太离谱了", "太夸张了",
  "受不了", "忍不了",
  "必须", "绝对", "一定",
];

const emotionMap: Record<string, string[]> = {
  anger: ["生气", "愤怒", "气死", "恼火", "火大", "不爽", "讨厌"],
  sadness: ["难过", "伤心", "想哭", "失落", "沮丧", "郁闷"],
  joy: ["开心", "高兴", "快乐", "太好了", "棒", "赞", "喜欢"],
  fear: ["害怕", "担心", "焦虑", "不安", "紧张", "恐惧"],
  surprise: ["惊讶", "没想到", "居然", "竟然", "意外"],
  disgust: ["恶心", "讨厌", "嫌弃", "鄙视", "看不起"],
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function detectEmotion(text: string): { emotion: string; intensity: number } {
  const lowerText = text.toLowerCase();
  let strongestEmotion = "neutral";
  let maxIntensity = 0;

  for (const [emotion, keywords] of Object.entries(emotionMap)) {
    let count = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        count++;
      }
    }
    if (count > maxIntensity) {
      maxIntensity = count;
      strongestEmotion = emotion;
    }
  }

  const intensity = Math.min(maxIntensity * 25, 100);
  return { emotion: strongestEmotion, intensity };
}

function detectConflictLevel(text: string): number {
  const lowerText = text.toLowerCase();
  let score = 0;
  for (const keyword of conflictKeywords) {
    if (lowerText.includes(keyword)) {
      score += 15;
    }
  }
  return Math.min(score, 100);
}

function detectSupportLevel(text: string): number {
  const lowerText = text.toLowerCase();
  let score = 0;
  for (const keyword of supportKeywords) {
    if (lowerText.includes(keyword)) {
      score += 15;
    }
  }
  return Math.min(score, 100);
}

function detectAllianceLevel(text: string): number {
  const lowerText = text.toLowerCase();
  let score = 0;
  for (const keyword of allianceKeywords) {
    if (lowerText.includes(keyword)) {
      score += 20;
    }
  }
  return Math.min(score, 100);
}

export function parseChatContent(
  groupId: string,
  content: string
): { messages: GroupMessage[]; members: GroupMember[] } {
  const lines = content.trim().split("\n").filter((l) => l.trim());
  const messages: GroupMessage[] = [];
  const memberMap = new Map<string, GroupMember>();

  const senderPattern = /^(\d{1,2}:\d{2})\s+(.+?)\s*[:：]\s*(.+)$/;
  const simplePattern = /^(.+?)\s*[:：]\s*(.+)$/;

  let defaultTime = Date.now();

  for (const line of lines) {
    let match = senderPattern.exec(line);

    if (!match) {
      match = simplePattern.exec(line);
    }

    if (match) {
      const senderName = match[2] || match[1];
      const messageContent = match[3] || match[2];

      if (!memberMap.has(senderName)) {
        memberMap.set(senderName, {
          id: generateId(),
          name: senderName,
        });
      }

      const member = memberMap.get(senderName)!;
      const { emotion, intensity } = detectEmotion(messageContent);
      const conflictLevel = detectConflictLevel(messageContent);
      const supportLevel = detectSupportLevel(messageContent);

      const mentionedNames: string[] = [];
      for (const name of memberMap.keys()) {
        if (messageContent.includes(name) && name !== senderName) {
          mentionedNames.push(name);
        }
      }

      const mentionedUserIds = mentionedNames
        .map((n) => memberMap.get(n)?.id)
        .filter((id): id is string => !!id);

      messages.push({
        id: generateId(),
        groupId,
        senderId: member.id,
        senderName,
        content: messageContent,
        timestamp: defaultTime + messages.length * 60000,
        emotion,
        emotionIntensity: intensity,
        mentionedUserIds,
        isPositive: supportLevel > conflictLevel,
        conflictLevel,
      });
    }
  }

  const colors = [
    "#f87171",
    "#fbbf24",
    "#34d399",
    "#60a5fa",
    "#a78bfa",
    "#f472b6",
    "#fb923c",
    "#4ade80",
  ];

  const members = Array.from(memberMap.values()).map((m, i) => ({
    ...m,
    color: colors[i % colors.length],
  }));

  return { messages, members };
}

export function analyzeMemberInteractions(
  members: GroupMember[],
  messages: GroupMessage[]
): Map<string, MemberInteractionStats> {
  const statsMap = new Map<string, MemberInteractionStats>();

  for (const member of members) {
    statsMap.set(member.id, {
      memberId: member.id,
      memberName: member.name,
      messageCount: 0,
      outgoingInteractions: 0,
      incomingInteractions: 0,
      positiveRatio: 0.5,
      conflictInvolvement: 0,
      emotionalExpressiveness: 0,
    });
  }

  let positiveCounts = new Map<string, number>();
  let negativeCounts = new Map<string, number>();

  for (const message of messages) {
    const senderStats = statsMap.get(message.senderId);
    if (!senderStats) continue;

    senderStats.messageCount++;

    if (message.mentionedUserIds && message.mentionedUserIds.length > 0) {
      senderStats.outgoingInteractions += message.mentionedUserIds.length;
      for (const mentionedId of message.mentionedUserIds) {
        const targetStats = statsMap.get(mentionedId);
        if (targetStats) {
          targetStats.incomingInteractions++;
        }
      }
    }

    if (message.isPositive) {
      positiveCounts.set(
        message.senderId,
        (positiveCounts.get(message.senderId) || 0) + 1
      );
    } else {
      negativeCounts.set(
        message.senderId,
        (negativeCounts.get(message.senderId) || 0) + 1
      );
    }

    if (message.conflictLevel && message.conflictLevel > 30) {
      senderStats.conflictInvolvement++;
      if (message.mentionedUserIds) {
        for (const mentionedId of message.mentionedUserIds) {
          const targetStats = statsMap.get(mentionedId);
          if (targetStats) {
            targetStats.conflictInvolvement += 0.5;
          }
        }
      }
    }

    if (
      message.emotion &&
      message.emotion !== "neutral" &&
      message.emotionIntensity
    ) {
      senderStats.emotionalExpressiveness += message.emotionIntensity / 100;
    }
  }

  for (const [memberId, stats] of statsMap) {
    const pos = positiveCounts.get(memberId) || 0;
    const neg = negativeCounts.get(memberId) || 0;
    const total = pos + neg;
    stats.positiveRatio = total > 0 ? pos / total : 0.5;

    if (stats.messageCount > 0) {
      stats.emotionalExpressiveness =
        stats.emotionalExpressiveness / stats.messageCount;
    }
  }

  return statsMap;
}

export function detectAlliances(
  members: GroupMember[],
  messages: GroupMessage[]
): Alliance[] {
  const alliances: Alliance[] = [];
  const memberMap = new Map(members.map((m) => [m.id, m]));

  const interactionScores = new Map<string, number>();
  const evidenceMap = new Map<string, string[]>();

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    if (msg.mentionedUserIds && msg.mentionedUserIds.length > 0) {
      for (const targetId of msg.mentionedUserIds) {
        const pairKey = [msg.senderId, targetId].sort().join("-");
        const allianceScore = detectAllianceLevel(msg.content);
        const supportScore = detectSupportLevel(msg.content);
        const combinedScore = (allianceScore + supportScore) / 2;

        interactionScores.set(
          pairKey,
          (interactionScores.get(pairKey) || 0) + combinedScore
        );

        if (combinedScore > 20) {
          const evidence = evidenceMap.get(pairKey) || [];
          if (evidence.length < 3) {
            evidence.push(msg.content.slice(0, 50));
          }
          evidenceMap.set(pairKey, evidence);
        }
      }
    }

    if (i < messages.length - 1) {
      const nextMsg = messages[i + 1];
      if (
        nextMsg.senderId !== msg.senderId &&
        nextMsg.timestamp - msg.timestamp < 5 * 60000
      ) {
        const pairKey = [msg.senderId, nextMsg.senderId].sort().join("-");
        const responseSupport = detectSupportLevel(nextMsg.content);
        interactionScores.set(
          pairKey,
          (interactionScores.get(pairKey) || 0) + responseSupport * 0.3
        );
      }
    }
  }

  const sortedPairs = Array.from(interactionScores.entries())
    .filter(([, score]) => score > 30)
    .sort((a, b) => b[1] - a[1]);

  const usedMembers = new Set<string>();

  for (const [pairKey, score] of sortedPairs) {
    const [id1, id2] = pairKey.split("-");

    if (usedMembers.has(id1) || usedMembers.has(id2)) continue;

    const member1 = memberMap.get(id1);
    const member2 = memberMap.get(id2);
    if (!member1 || !member2) continue;

    alliances.push({
      id: generateId(),
      memberIds: [id1, id2],
      memberNames: [member1.name, member2.name],
      strength: Math.min(score, 100),
      evidence: evidenceMap.get(pairKey) || [],
    });

    usedMembers.add(id1);
    usedMembers.add(id2);
  }

  return alliances.slice(0, 5);
}

export function detectPeripheralMembers(
  members: GroupMember[],
  messages: GroupMessage[]
): PeripheralMember[] {
  const stats = analyzeMemberInteractions(members, messages);
  const peripheral: PeripheralMember[] = [];

  const totalMessages = messages.length || 1;
  const totalMembers = members.length || 1;
  const avgMessageCount = totalMessages / totalMembers;

  for (const member of members) {
    const memberStats = stats.get(member.id);
    if (!memberStats) continue;

    const participationRate = memberStats.messageCount / avgMessageCount;
    const interactionRate =
      (memberStats.outgoingInteractions + memberStats.incomingInteractions) /
      Math.max(totalMessages, 1);

    const centralityScore =
      (participationRate * 0.5 + interactionRate * 0.5) * 100;

    if (centralityScore < 40) {
      let reason = "参与度较低";
      if (memberStats.messageCount === 0) {
        reason = "未发言";
      } else if (memberStats.outgoingInteractions === 0) {
        reason = "很少主动互动";
      } else if (memberStats.incomingInteractions === 0) {
        reason = "很少被他人提及";
      }

      peripheral.push({
        memberId: member.id,
        memberName: member.name,
        centralityScore: Math.round(centralityScore),
        participationRate: Math.round(participationRate * 100),
        reason,
      });
    }
  }

  return peripheral.sort(
    (a, b) => a.centralityScore - b.centralityScore
  );
}

export function detectEmotionalContagion(
  members: GroupMember[],
  messages: GroupMessage[]
): EmotionalContagion[] {
  const contagions: EmotionalContagion[] = [];

  const emotionSequences: Map<string, Array<{ memberId: string; emotion: string; timestamp: number }>> = new Map();

  for (const msg of messages) {
    if (!msg.emotion || msg.emotion === "neutral") continue;
    if (!msg.emotionIntensity || msg.emotionIntensity < 30) continue;

    const seq = emotionSequences.get(msg.emotion) || [];
    seq.push({
      memberId: msg.senderId,
      emotion: msg.emotion,
      timestamp: msg.timestamp,
    });
    emotionSequences.set(msg.emotion, seq);
  }

  const memberMap = new Map(members.map((m) => [m.id, m]));

  for (const [emotion, sequence] of emotionSequences) {
    if (sequence.length < 3) continue;

    const source = sequence[0];
    const affected: string[] = [];
    const affectedNames: string[] = [];

    let spreadSpeed = 0;

    for (let i = 1; i < sequence.length; i++) {
      const current = sequence[i];
      if (current.memberId === source.memberId) continue;
      if (affected.includes(current.memberId)) continue;

      const timeDiff = current.timestamp - source.timestamp;
      if (timeDiff < 30 * 60000) {
        affected.push(current.memberId);
        const member = memberMap.get(current.memberId);
        if (member) {
          affectedNames.push(member.name);
        }
        spreadSpeed += timeDiff;
      }
    }

    if (affected.length >= 2) {
      const sourceMember = memberMap.get(source.memberId);
      contagions.push({
        sourceMemberId: source.memberId,
        sourceMemberName: sourceMember?.name || "未知",
        emotion,
        affectedMemberIds: affected,
        affectedMemberNames: affectedNames,
        spreadSpeed: Math.round(spreadSpeed / affected.length / 60000),
        intensity: Math.round((affected.length / members.length) * 100),
      });
    }
  }

  return contagions
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 3);
}

export function detectMisunderstandingSpread(
  members: GroupMember[],
  messages: GroupMessage[]
): MisunderstandingSpread[] {
  const spreads: MisunderstandingSpread[] = [];
  const memberMap = new Map(members.map((m) => [m.id, m]));

  const conflictMessages = messages.filter(
    (m) => m.conflictLevel && m.conflictLevel > 30
  );

  const clusters: GroupMessage[][] = [];
  const used = new Set<string>();

  for (const msg of conflictMessages) {
    if (used.has(msg.id)) continue;

    const cluster: GroupMessage[] = [msg];
    used.add(msg.id);

    for (const otherMsg of conflictMessages) {
      if (used.has(otherMsg.id)) continue;
      if (otherMsg.senderId === msg.senderId) continue;

      const timeDiff = Math.abs(otherMsg.timestamp - msg.timestamp);
      if (timeDiff < 10 * 60000) {
        cluster.push(otherMsg);
        used.add(otherMsg.id);
      }
    }

    if (cluster.length >= 3) {
      clusters.push(cluster);
    }
  }

  for (const cluster of clusters) {
    const sorted = cluster.sort((a, b) => a.timestamp - b.timestamp);
    const origin = sorted[0];
    const originMember = memberMap.get(origin.senderId);

    const path = sorted.map((m) => m.senderId);
    const uniquePath = Array.from(new Set(path));
    const names = uniquePath
      .map((id) => memberMap.get(id)?.name || "未知")
      .filter((n) => n !== originMember?.name);

    const harmLevel = Math.min(cluster.length * 20, 100);
    const scope = Math.round((uniquePath.length / members.length) * 100);

    spreads.push({
      id: generateId(),
      originMemberId: origin.senderId,
      originMemberName: originMember?.name || "未知",
      content: origin.content.slice(0, 80),
      spreadPath: uniquePath,
      spreadMemberNames: names,
      scope,
      harmLevel,
    });
  }

  return spreads
    .sort((a, b) => b.harmLevel - a.harmLevel)
    .slice(0, 3);
}

export function detectConflictAmplifiers(
  members: GroupMember[],
  messages: GroupMessage[]
): ConflictAmplifier[] {
  const amplifiers: ConflictAmplifier[] = [];
  const memberMap = new Map(members.map((m) => [m.id, m]));

  const memberConflictData = new Map<
    string,
    { score: number; behaviors: string[]; triggered: number }
  >();

  for (const member of members) {
    memberConflictData.set(member.id, {
      score: 0,
      behaviors: [],
      triggered: 0,
    });
  }

  for (const msg of messages) {
    const data = memberConflictData.get(msg.senderId);
    if (!data) continue;

    const conflictLevel = msg.conflictLevel || 0;
    if (conflictLevel === 0) continue;

    let amplification = 0;
    const behaviors: string[] = [];

    const content = msg.content.toLowerCase();

    for (const keyword of amplifyKeywords) {
      if (content.includes(keyword)) {
        amplification += 10;
        if (!behaviors.includes("极端化表达")) {
          behaviors.push("极端化表达");
        }
      }
    }

    if (msg.mentionedUserIds && msg.mentionedUserIds.length > 1) {
      amplification += 15;
      if (!behaviors.includes("多人对质")) {
        behaviors.push("多人对质");
      }
    }

    if (conflictLevel > 60) {
      amplification += 10;
      if (!behaviors.includes("高强度冲突")) {
        behaviors.push("高强度冲突");
      }
    }

    let prevMsg: GroupMessage | null = null;
    for (const m of messages) {
      if (m.timestamp < msg.timestamp && m.senderId !== msg.senderId) {
        if (!prevMsg || m.timestamp > prevMsg.timestamp) {
          prevMsg = m;
        }
      }
    }

    if (prevMsg && prevMsg.conflictLevel && conflictLevel > prevMsg.conflictLevel) {
      const escalation = conflictLevel - prevMsg.conflictLevel;
      amplification += escalation * 0.5;
      if (!behaviors.includes("冲突升级")) {
        behaviors.push("冲突升级");
      }
    }

    data.score += amplification;
    data.behaviors = Array.from(new Set([...data.behaviors, ...behaviors]));
    if (conflictLevel > 50) {
      data.triggered++;
    }
  }

  for (const [memberId, data] of memberConflictData) {
    if (data.score > 20) {
      const member = memberMap.get(memberId);
      amplifiers.push({
        memberId,
        memberName: member?.name || "未知",
        amplificationScore: Math.round(data.score),
        behaviors: data.behaviors,
        triggeredConflicts: data.triggered,
      });
    }
  }

  return amplifiers
    .sort((a, b) => b.amplificationScore - a.amplificationScore)
    .slice(0, 3);
}

export function detectConflictBuffers(
  members: GroupMember[],
  messages: GroupMessage[]
): ConflictBuffer[] {
  const buffers: ConflictBuffer[] = [];
  const memberMap = new Map(members.map((m) => [m.id, m]));

  const memberBufferData = new Map<
    string,
    { score: number; behaviors: string[]; resolved: number }
  >();

  for (const member of members) {
    memberBufferData.set(member.id, {
      score: 0,
      behaviors: [],
      resolved: 0,
    });
  }

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const data = memberBufferData.get(msg.senderId);
    if (!data) continue;

    const content = msg.content.toLowerCase();
    const bufferScore = detectSupportLevel(msg.content);

    let buffering = 0;
    const behaviors: string[] = [];

    for (const keyword of bufferKeywords) {
      if (content.includes(keyword)) {
        buffering += 15;
        if (!behaviors.includes("调解安抚")) {
          behaviors.push("调解安抚");
        }
      }
    }

    if (bufferScore > 30 && msg.mentionedUserIds && msg.mentionedUserIds.length > 0) {
      buffering += bufferScore * 0.3;
      if (!behaviors.includes("支持鼓励")) {
        behaviors.push("支持鼓励");
      }
    }

    const prevMsgs = messages
      .filter((m) => m.timestamp < msg.timestamp && m.conflictLevel && m.conflictLevel > 40)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 2);

    if (prevMsgs.length > 0) {
      const timeDiff = msg.timestamp - prevMsgs[0].timestamp;
      if (timeDiff < 5 * 60000 && (msg.conflictLevel || 0) < 20) {
        buffering += 25;
        if (!behaviors.includes("及时降温")) {
          behaviors.push("及时降温");
        }
        data.resolved++;
      }
    }

    if (
      msg.isPositive &&
      msg.mentionedUserIds &&
      msg.mentionedUserIds.length > 0
    ) {
      buffering += 10;
      if (!behaviors.includes("正向反馈")) {
        behaviors.push("正向反馈");
      }
    }

    data.score += buffering;
    data.behaviors = Array.from(new Set([...data.behaviors, ...behaviors]));
  }

  for (const [memberId, data] of memberBufferData) {
    if (data.score > 15) {
      const member = memberMap.get(memberId);
      buffers.push({
        memberId,
        memberName: member?.name || "未知",
        bufferScore: Math.round(data.score),
        behaviors: data.behaviors,
        resolvedConflicts: data.resolved,
      });
    }
  }

  return buffers
    .sort((a, b) => b.bufferScore - a.bufferScore)
    .slice(0, 3);
}

export function buildNetworkGraph(
  members: GroupMember[],
  messages: GroupMessage[],
  analysis: GroupDynamicsAnalysis
): NetworkGraphData {
  const nodes: NetworkNode[] = [];
  const links: NetworkLink[] = [];

  const stats = analyzeMemberInteractions(members, messages);
  const memberMap = new Map(members.map((m) => [m.id, m]));

  const interactionCounts = new Map<string, number>();
  const linkTypes = new Map<string, "alliance" | "conflict" | "neutral" | "support">();

  for (const msg of messages) {
    if (msg.mentionedUserIds) {
      for (const targetId of msg.mentionedUserIds) {
        const key = [msg.senderId, targetId].sort().join("-");
        const current = interactionCounts.get(key) || 0;
        interactionCounts.set(key, current + 1);

        const currentType = linkTypes.get(key);
        const conflictLevel = msg.conflictLevel || 0;
        const supportLevel = detectSupportLevel(msg.content);

        if (conflictLevel > 50) {
          linkTypes.set(key, "conflict");
        } else if (supportLevel > 50 || currentType === "support") {
          linkTypes.set(key, "support");
        } else if (!currentType) {
          linkTypes.set(key, "neutral");
        }
      }
    }
  }

  for (const alliance of analysis.alliances) {
    for (let i = 0; i < alliance.memberIds.length; i++) {
      for (let j = i + 1; j < alliance.memberIds.length; j++) {
        const key = [alliance.memberIds[i], alliance.memberIds[j]]
          .sort()
          .join("-");
        linkTypes.set(key, "alliance");
        const current = interactionCounts.get(key) || 0;
        interactionCounts.set(key, current + alliance.strength * 0.3);
      }
    }
  }

  let maxInteractions = 0;
  for (const count of interactionCounts.values()) {
    maxInteractions = Math.max(maxInteractions, count);
  }

  for (const member of members) {
    const memberStats = stats.get(member.id);
    const messageCount = memberStats?.messageCount || 0;
    const maxMessages = Math.max(...Array.from(stats.values()).map(s => s.messageCount), 1);
    const size = 30 + (messageCount / maxMessages) * 30;
    const centrality = memberStats
      ? (memberStats.outgoingInteractions + memberStats.incomingInteractions) /
        Math.max(maxInteractions * 2, 1)
      : 0;

    let role: string | undefined;

    if (analysis.conflictAmplifiers.some((a) => a.memberId === member.id)) {
      role = "冲突放大者";
    } else if (analysis.conflictBuffers.some((b) => b.memberId === member.id)) {
      role = "矛盾缓冲者";
    } else if (analysis.alliances.some((a) => a.memberIds.includes(member.id))) {
      role = "联盟成员";
    } else if (
      analysis.peripheralMembers.some((p) => p.memberId === member.id)
    ) {
      role = "边缘角色";
    }

    nodes.push({
      id: member.id,
      name: member.name,
      size,
      color: member.color || "#6b7280",
      centrality: Math.min(centrality * 100, 100),
      role,
    });
  }

  for (const [key, value] of interactionCounts) {
    const [source, target] = key.split("-");
    const type = linkTypes.get(key) || "neutral";

    links.push({
      source,
      target,
      value: (value / Math.max(maxInteractions, 1)) * 10,
      type,
    });
  }

  return { nodes, links };
}

export function generateKeyInsights(
  analysis: GroupDynamicsAnalysis
): string[] {
  const insights: string[] = [];

  if (analysis.overallHealth < 40) {
    insights.push("群体整体健康度较低，存在较明显的张力和矛盾");
  } else if (analysis.overallHealth > 70) {
    insights.push("群体整体氛围积极健康，互动质量良好");
  } else {
    insights.push("群体整体状态中等，存在一些需要关注的互动模式");
  }

  if (analysis.alliances.length >= 2) {
    insights.push(
      `识别出 ${analysis.alliances.length} 个联盟，群体存在一定的分化现象`
    );
  } else if (analysis.alliances.length === 1) {
    insights.push("存在1个明显的盟友关系，双方互动较为密切");
  }

  if (analysis.peripheralMembers.length > 0) {
    insights.push(
      `有 ${analysis.peripheralMembers.length} 位成员处于边缘位置，参与度有待提升`
    );
  }

  if (analysis.conflictAmplifiers.length > 0) {
    const topAmplifier = analysis.conflictAmplifiers[0];
    insights.push(
      `${topAmplifier.memberName} 的冲突放大倾向较明显，可能使矛盾升级`
    );
  }

  if (analysis.conflictBuffers.length > 0) {
    const topBuffer = analysis.conflictBuffers[0];
    insights.push(
      `${topBuffer.memberName} 发挥着矛盾缓冲作用，有助于维持群体和谐`
    );
  }

  if (analysis.emotionalContagions.length > 0) {
    const topContagion = analysis.emotionalContagions[0];
    insights.push(
      `观察到情绪传染现象，${topContagion.sourceMemberName} 的情绪影响了 ${topContagion.affectedMemberNames.length} 位成员`
    );
  }

  if (analysis.misunderstandingSpreads.length > 0) {
    insights.push(
      `存在 ${analysis.misunderstandingSpreads.length} 个误解扩散事件，建议关注沟通清晰度`
    );
  }

  if (analysis.conflictLevel > 50) {
    insights.push("群体冲突水平较高，建议建立更健康的冲突解决机制");
  }

  return insights.slice(0, 6);
}

export function analyzeGroupDynamics(
  group: Group,
  messages: GroupMessage[]
): GroupDynamicsAnalysis {
  const members = group.members;

  const alliances = detectAlliances(members, messages);
  const peripheralMembers = detectPeripheralMembers(members, messages);
  const emotionalContagions = detectEmotionalContagion(members, messages);
  const misunderstandingSpreads = detectMisunderstandingSpread(members, messages);
  const conflictAmplifiers = detectConflictAmplifiers(members, messages);
  const conflictBuffers = detectConflictBuffers(members, messages);

  let totalConflict = 0;
  let totalPositive = 0;
  for (const msg of messages) {
    totalConflict += msg.conflictLevel || 0;
    if (msg.isPositive) totalPositive++;
  }

  const avgConflict = messages.length > 0 ? totalConflict / messages.length : 0;
  const positiveRatio = messages.length > 0 ? totalPositive / messages.length : 0.5;

  const conflictLevel = avgConflict;
  const cohesion = positiveRatio * 100 - conflictLevel * 0.5 + (alliances.length * 10);
  const overallHealth = Math.max(0, Math.min(100, 50 + cohesion * 0.3 + positiveRatio * 20 - avgConflict * 0.3));

  const analysis: GroupDynamicsAnalysis = {
    groupId: group.id,
    groupName: group.name,
    analysisTime: Date.now(),
    overallHealth: Math.round(overallHealth),
    cohesion: Math.round(Math.max(0, Math.min(100, cohesion))),
    conflictLevel: Math.round(conflictLevel),
    alliances,
    peripheralMembers,
    emotionalContagions,
    misunderstandingSpreads,
    conflictAmplifiers,
    conflictBuffers,
    keyInsights: [],
  };

  analysis.keyInsights = generateKeyInsights(analysis);

  return analysis;
}
