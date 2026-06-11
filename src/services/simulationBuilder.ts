import type { CognitiveBug, SimulationNode, SimulationResult, ReplacementOption } from "../types/bug";

const positiveReplacements: Record<string, ReplacementOption[]> = {
  self_negation: [
    {
      id: "pos-1",
      content: "这次没做好，不代表我不行",
      description: "把行为和自我价值分开，一件事不定义整个人",
      type: "thought",
    },
    {
      id: "pos-2",
      content: "我可以从这次失败中学到东西",
      description: "把失败看作成长的机会，而不是终点",
      type: "belief",
    },
  ],
  inaction: [
    {
      id: "pos-3",
      content: "先做五分钟试试",
      description: "用微小行动打破惯性，五分钟启动法",
      type: "behavior",
    },
    {
      id: "pos-4",
      content: "完成比完美更重要",
      description: "接受足够好，先做出来再优化",
      type: "belief",
    },
  ],
  catastrophizing: [
    {
      id: "pos-5",
      content: "最坏的结果不一定会发生",
      description: "区分可能性和必然性，大部分担忧不会成真",
      type: "thought",
    },
    {
      id: "pos-6",
      content: "就算真的发生了，我也能应对",
      description: "相信自己的应对能力，你比想象中更坚强",
      type: "belief",
    },
  ],
  comparison: [
    {
      id: "pos-7",
      content: "每个人都有自己的时区",
      description: "不和别人比，和过去的自己比",
      type: "thought",
    },
    {
      id: "pos-8",
      content: "我也有我的闪光点",
      description: "列出自己的成就，别人的高光不代表你的黯淡",
      type: "belief",
    },
  ],
  mind_reading: [
    {
      id: "pos-9",
      content: "我不确定他在想什么，也许应该直接问",
      description: "不猜测，用沟通代替脑补",
      type: "thought",
    },
    {
      id: "pos-10",
      content: "大部分时候别人想的是他们自己",
      description: "每个人最关心的都是自己，不是你",
      type: "belief",
    },
  ],
  should_statements: [
    {
      id: "pos-11",
      content: "我希望能做好，但做不到也没关系",
      description: "把应该换成希望，降低强迫感",
      type: "thought",
    },
    {
      id: "pos-12",
      content: "我可以按照自己的节奏来",
      description: "你的人生不是写好的剧本，不需要按台词来",
      type: "belief",
    },
  ],
  emotional_reasoning: [
    {
      id: "pos-13",
      content: "这是我的感受，不一定是事实",
      description: "命名情绪，区分情绪和真相",
      type: "thought",
    },
    {
      id: "pos-14",
      content: "等情绪平静了再做决定",
      description: "强烈情绪一般20分钟后会下降，先等等",
      type: "behavior",
    },
  ],
  personalization: [
    {
      id: "pos-15",
      content: "这件事可能有很多原因，不全是我的错",
      description: "列出所有可能因素，你通常只是其中一小环",
      type: "thought",
    },
    {
      id: "pos-16",
      content: "我不能控制所有事情",
      description: "区分我的责任和不是我的责任",
      type: "belief",
    },
  ],
  all_or_nothing: [
    {
      id: "pos-17",
      content: "大部分事情都在中间地带",
      description: "用0-10分评价，不是只有0和10",
      type: "thought",
    },
    {
      id: "pos-18",
      content: "99分依然是很好的成绩",
      description: "承认灰色地带的存在，完美不是唯一标准",
      type: "belief",
    },
  ],
  overgeneralization: [
    {
      id: "pos-19",
      content: "这一次不代表永远",
      description: "用有时候代替总是，有些代替所有",
      type: "thought",
    },
    {
      id: "pos-20",
      content: "我可以找找有没有反例",
      description: "寻找例外情况，打破过度概括的逻辑",
      type: "belief",
    },
  ],
  discounting_positive: [
    {
      id: "pos-21",
      content: "这也是我努力的结果",
      description: "认真对待自己的成就，和对待失败一样认真",
      type: "thought",
    },
    {
      id: "pos-22",
      content: "谢谢，我确实做得不错",
      description: "下次被夸只说谢谢，不要急着反驳",
      type: "belief",
    },
  ],
  mental_filter: [
    {
      id: "pos-23",
      content: "让我也看看好的那部分",
      description: "刻意寻找三件正面的事，平衡注意力",
      type: "thought",
    },
    {
      id: "pos-24",
      content: "1%的不好不该盖过99%的好",
      description: "用比例思考，别让一滴墨水染黑整杯水",
      type: "belief",
    },
  ],
  labeling: [
    {
      id: "pos-25",
      content: "我这次没做好，但我不是蠢货",
      description: "描述行为，不评价人——对事不对己",
      type: "thought",
    },
    {
      id: "pos-26",
      content: "人是复杂的，一个行为不能定义我",
      description: "你是多面体，不是一个词就能概括的",
      type: "belief",
    },
  ],
  fortune_telling: [
    {
      id: "pos-27",
      content: "未来还没发生，任何结果都有可能",
      description: "把预测改成假设，给成功留一点空间",
      type: "thought",
    },
    {
      id: "pos-28",
      content: "如果我相信能成功，做法会不一样",
      description: "试试用积极预测指导行动，看看会发生什么",
      type: "belief",
    },
  ],
};

function getReplacementPool(bugId: string): ReplacementOption[] {
  const allReplacements = Object.values(positiveReplacements).flat();
  const key = mapBugIdToKey(bugId);
  const specific = positiveReplacements[key] || [];
  const remaining = allReplacements.filter((r) => !specific.find((s) => s.id === r.id));
  return [...specific, ...remaining.slice(0, 4 - specific.length)].slice(0, 4);
}

function mapBugIdToKey(bugId: string): string {
  const mapping: Record<string, string> = {
    "one-fail-equals-all": "self_negation",
    "one-flop-all-flop": "overgeneralization",
    "doomsday-rehearsal": "catastrophizing",
    "comparison-hell": "comparison",
    "mind-reading-fanfiction": "mind_reading",
    "should-tyrant": "should_statements",
    "feeling-is-fact": "emotional_reasoning",
    "universe-scapegoat": "personalization",
    "binary-life": "all_or_nothing",
    "good-things-discount": "discounting_positive",
    "negative-pixel-lock": "mental_filter",
    "prophet-self-fulfill": "fortune_telling",
    "procrastination-paralysis": "inaction",
  };
  return mapping[bugId] || "self_negation";
}

function buildNegativePath(bug: CognitiveBug): SimulationNode[] {
  const nodes: SimulationNode[] = [];
  const bugId = bug.id;

  nodes.push({
    id: `node-${bugId}-0`,
    type: "thought",
    content: bug.reasoningPath[0]?.thought || "我遇到了一件事",
    isPositive: false,
  });

  nodes.push({
    id: `node-${bugId}-1`,
    type: "belief",
    content: bug.reasoningPath[1]?.thought || bug.name,
    isPositive: false,
    isReplaceable: true,
    replacementOptions: getReplacementPool(bugId),
  });

  if (bug.reasoningPath[2]) {
    nodes.push({
      id: `node-${bugId}-2`,
      type: "emotion",
      content: bug.reasoningPath[2].thought,
      isPositive: false,
    });
  } else {
    const emotionMap: Record<string, string> = {
      thinking: "感到焦虑和不安",
      emotional: "感到低落和沮丧",
      behavioral: "感到无力和无助",
      social: "感到孤独和被排斥",
    };
    nodes.push({
      id: `node-${bugId}-2`,
      type: "emotion",
      content: emotionMap[bug.category] || "感到很糟糕",
      isPositive: false,
    });
  }

  const behaviorMap: Record<string, string> = {
    "comparison-hell": "关闭社交软件，躲起来独自难过",
    "doomsday-rehearsal": "逃避面对，拖延不行动",
    "one-fail-equals-all": "放弃尝试，不再给自己机会",
    "binary-life": "要么追求完美要么干脆不做",
    "one-flop-all-flop": "不再尝试类似的事情，避免再次失败",
    "mind-reading-fanfiction": "疏远对方，避免更多被讨厌的证据",
    "prophet-self-fulfill": "不认真准备，反正也不会成功",
    "universe-scapegoat": "不断道歉、自责，讨好别人",
    "should-tyrant": "用更多应该鞭打自己，越来越焦虑",
    "feeling-is-fact": "按照情绪做冲动的决定",
    "good-things-discount": "回避正面反馈，不相信赞美",
    "negative-pixel-lock": "反复想那件不好的事，停不下来",
    "procrastination-paralysis": "继续拖延，用别的事转移注意力",
  };

  nodes.push({
    id: `node-${bugId}-3`,
    type: "behavior",
    content: behaviorMap[bugId] || "选择逃避，不采取行动",
    isPositive: false,
  });

  nodes.push({
    id: `node-${bugId}-4`,
    type: "outcome",
    content: bug.reasoningPath[3]?.thought || "事情没有变好，反而更糟了",
    isPositive: false,
  });

  nodes.push({
    id: `node-${bugId}-5`,
    type: "belief",
    content: `进一步确认：${bug.tagline || bug.name}`,
    isPositive: false,
    isReplaceable: true,
    replacementOptions: getReplacementPool(bugId).slice(0, 2),
  });

  return nodes;
}

function buildPositivePath(
  originalNodes: SimulationNode[],
  replaceIndex: number,
  replacement: ReplacementOption
): SimulationNode[] {
  const nodes: SimulationNode[] = [];

  for (let i = 0; i < originalNodes.length; i++) {
    if (i < replaceIndex) {
      nodes.push({ ...originalNodes[i] });
    } else if (i === replaceIndex) {
      nodes.push({
        id: `modified-${originalNodes[i].id}`,
        type: replacement.type,
        content: replacement.content,
        isPositive: true,
      });
    } else {
      const transformed = transformNodeToPositive(originalNodes[i], i);
      nodes.push(transformed);
    }
  }

  return nodes;
}

function transformNodeToPositive(node: SimulationNode, index: number): SimulationNode {
  const positiveTransforms: Record<string, string[]> = {
    thought: [
      "换个角度看，这件事也没有那么糟",
      "也许事情会往好的方向发展",
      "我可以找找有没有其他可能性",
    ],
    emotion: [
      "感到平静了一些",
      "内心开始有了一点力量",
      "不再那么焦虑，感觉可以应对",
    ],
    behavior: [
      "决定先迈出一小步试试",
      "开始行动，哪怕做得不够完美",
      "主动寻求帮助和支持",
    ],
    outcome: [
      "事情有了转机，比预期的要好",
      "虽然不完美，但也学到了很多",
      "发现自己比想象中更能应对",
    ],
    belief: [
      "原来我可以打破这个循环",
      "我的想法真的可以改变结果",
      "一次失败不代表什么，我可以重新开始",
    ],
  };

  const options = positiveTransforms[node.type];
  const content = options[index % options.length];

  return {
    id: `positive-${node.id}`,
    type: node.type,
    content,
    isPositive: true,
  };
}

function getOutcome(nodes: SimulationNode[]): string {
  const positiveCount = nodes.filter((n) => n.isPositive).length;
  const totalCount = nodes.length;

  if (positiveCount > totalCount / 2) {
    return "✨ 这个认知改变，让未来走向了更明亮的方向。你看，只是换了一个想法，一切都开始变得不一样了。";
  } else if (positiveCount > 0) {
    return "🌱 有了一些积极的变化。虽然还在惯性的影响下，但那个改变的节点已经埋下了希望的种子。";
  }
  return "🌪️ 这个认知Bug正在把你的未来拉向一个向下的螺旋。每一步都在强化前一步，直到你觉得事实就是如此。但这不是唯一的可能——试试换掉其中一个认知节点？";
}

function getMood(nodes: SimulationNode[]): "negative" | "neutral" | "positive" {
  const positiveCount = nodes.filter((n) => n.isPositive).length;
  const totalCount = nodes.length;
  const ratio = positiveCount / totalCount;

  if (ratio > 0.6) return "positive";
  if (ratio > 0.2) return "neutral";
  return "negative";
}

export function createSimulation(bug: CognitiveBug): SimulationResult {
  const nodes = buildNegativePath(bug);
  return {
    nodes,
    outcome: getOutcome(nodes),
    mood: getMood(nodes),
    isModified: false,
  };
}

export function resimulate(
  originalResult: SimulationResult,
  replaceIndex: number,
  replacement: ReplacementOption,
  originalNodes: SimulationNode[]
): SimulationResult {
  const nodes = buildPositivePath(originalNodes, replaceIndex, replacement);
  return {
    nodes,
    outcome: getOutcome(nodes),
    mood: getMood(nodes),
    isModified: true,
  };
}
