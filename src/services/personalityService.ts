import type {
  PersonalityProfile,
  PersonalityArchetype,
  PersonalityAugmentedExplanation,
  BigFiveDimension,
} from "../types/personality";
import type { BugChain, CognitiveBug } from "../types/bug";
import {
  ARCHETYPES,
  BUG_PERSONALITY_MAPPINGS,
  DIMENSION_NAMES,
  getDimensionLevel,
  getDimensionLevelLabel,
} from "../types/personality";

export function createProfileFromArchetype(
  archetype: PersonalityArchetype
): PersonalityProfile {
  const info = ARCHETYPES[archetype];
  return {
    dimensions: { ...info.dimensionDefaults },
    archetype,
  };
}

export function detectArchetype(profile: PersonalityProfile): PersonalityArchetype {
  if (profile.archetype && profile.archetype !== "custom") {
    return profile.archetype;
  }

  const { dimensions } = profile;
  const d = dimensions;

  if (d.conscientiousness > 0.85 && d.neuroticism > 0.55) {
    return "the_perfectionist";
  }
  if (d.neuroticism > 0.85) {
    return "the_worrier";
  }
  if (d.openness > 0.85) {
    return "the_idealist";
  }
  if (d.agreeableness > 0.85) {
    return "the_people_pleaser";
  }
  if (d.extraversion > 0.75 && d.conscientiousness > 0.75) {
    return "the_overachiever";
  }
  if (d.neuroticism > 0.7 && d.agreeableness > 0.65 && d.openness > 0.65) {
    return "the_sensitive_soul";
  }

  return "the_balanced";
}

export function calculateBugPersonalityScore(
  bugId: string,
  profile: PersonalityProfile
): number {
  const mapping = BUG_PERSONALITY_MAPPINGS.find((m) => m.bugId === bugId);
  if (!mapping) return 0.5;

  let score = 0;
  let totalWeight = 0;

  for (const [dim, weight] of Object.entries(mapping.dimensionWeights)) {
    const dimension = dim as BigFiveDimension;
    const value = profile.dimensions[dimension];
    const w = weight as number;

    if ((mapping as any).dimensionWeightsInverse) {
      score += (1 - value) * w;
    } else {
      score += value * w;
    }
    totalWeight += w;
  }

  return totalWeight > 0 ? score / totalWeight : 0.5;
}

export function getTopVulnerableDimensions(
  profile: PersonalityProfile
): { dimension: BigFiveDimension; level: "low" | "medium" | "high" }[] {
  const extremeDims: { dimension: BigFiveDimension; level: "low" | "medium" | "high" }[] = [];

  (Object.keys(profile.dimensions) as BigFiveDimension[]).forEach((dim) => {
    const value = profile.dimensions[dim];
    const level = getDimensionLevel(value);
    if (level === "high" || (level === "low" && dim === "neuroticism" === false)) {
      extremeDims.push({ dimension: dim, level });
    }
  });

  return extremeDims.sort((a, b) => {
    const aVal = profile.dimensions[a.dimension];
    const bVal = profile.dimensions[b.dimension];
    const aExtreme = a.level === "high" ? aVal : 1 - aVal;
    const bExtreme = b.level === "high" ? bVal : 1 - bVal;
    return bExtreme - aExtreme;
  });
}

export function generatePersonalityAugmentedExplanation(
  chain: BugChain,
  profile: PersonalityProfile,
  allBugs: CognitiveBug[]
): PersonalityAugmentedExplanation {
  const archetype = detectArchetype(profile);
  const archetypeInfo = ARCHETYPES[archetype];
  const bugMap = new Map<string, CognitiveBug>();
  allBugs.forEach((bug) => bugMap.set(bug.id, bug));

  const topDims = getTopVulnerableDimensions(profile);

  const personalityIntro = buildPersonalityIntro(archetypeInfo, topDims, profile);

  const dimensionAnalysis = buildDimensionAnalysis(topDims, profile, chain, allBugs);

  const personalizedBugNarratives: Record<string, string> = {};
  for (const node of chain.nodes) {
    if (node.isMatched) {
      personalizedBugNarratives[node.bugId] = buildPersonalizedBugNarrative(
        node.bug,
        profile
      );
    }
  }

  const archetypeInsight = buildArchetypeInsight(archetypeInfo, chain, profile);

  const personalizedCoping = buildPersonalizedCoping(chain, profile, archetypeInfo);

  return {
    personalityIntro,
    dimensionAnalysis,
    personalizedBugNarratives,
    archetypeInsight,
    personalizedCoping,
  };
}

function buildPersonalityIntro(
  archetypeInfo: any,
  topDims: { dimension: BigFiveDimension; level: "low" | "medium" | "high" }[],
  profile: PersonalityProfile
): string {
  let intro = `作为「${archetypeInfo.name}」，`;

  const dimLabels = topDims
    .slice(0, 3)
    .map((d) => {
      const levelLabel = getDimensionLevelLabel(d.dimension, d.level);
      return `${DIMENSION_NAMES[d.dimension]}${levelLabel.replace("偏", "偏")}`;
    });

  if (dimLabels.length > 0) {
    intro += `你的${dimLabels.join("、")}。`;
  }

  intro += `\n\n这些特质让你成为了独一无二的你，但同时也意味着你对某些认知 Bug 有天然的易感倾向。\n`;
  intro += `下面的分析，就是从「${archetypeInfo.name}」的视角出发，看看这些 Bug 在你身上是怎么运作的——\n`;
  intro += `不是"一般人会怎样"，而是"你为什么会这样"。\n`;

  return intro;
}

function buildDimensionAnalysis(
  topDims: { dimension: BigFiveDimension; level: "low" | "medium" | "high" }[],
  profile: PersonalityProfile,
  chain: BugChain,
  allBugs: CognitiveBug[]
): PersonalityAugmentedExplanation["dimensionAnalysis"] {
  const matchedBugIds = new Set(chain.nodes.filter((n) => n.isMatched).map((n) => n.bugId));
  const bugMap = new Map<string, CognitiveBug>();
  allBugs.forEach((bug) => bugMap.set(bug.id, bug));

  return topDims.slice(0, 3).map((d) => {
    const levelLabel = getDimensionLevelLabel(d.dimension, d.level);
    const impact = generateDimensionImpact(d.dimension, d.level, profile, matchedBugIds, bugMap);

    return {
      dimension: d.dimension,
      dimensionName: DIMENSION_NAMES[d.dimension],
      level: d.level,
      impact,
    };
  });
}

function generateDimensionImpact(
  dimension: BigFiveDimension,
  level: "low" | "medium" | "high",
  profile: PersonalityProfile,
  matchedBugIds: Set<string>,
  bugMap: Map<string, CognitiveBug>
): string {
  const value = profile.dimensions[dimension];

  const impacts: Record<BigFiveDimension, Record<string, string>> = {
    conscientiousness: {
      high: `你的尽责性高达 ${Math.round(value * 100)}%，这让你对自己有极高的标准。好处是你靠谱、认真、值得信赖，但代价是——你对错误的容忍度特别低。哪怕一点点疏漏，都会在你心里被放大成"我不够好"的证据。这就是为什么你特别容易陷入自我责备的循环。`,
      medium: `你的尽责性处于中等水平，你有自己的标准但也不会过于苛责自己。不过在压力大的时候，你内心那个"完美主义者"还是会跳出来说话。`,
      low: `你的尽责性偏低，你比较随性灵活，不太会为小事苛责自己。不过有时你可能会缺乏行动力，或者因为标准太低而错过成长的机会。`,
    },
    neuroticism: {
      high: `你的神经质高达 ${Math.round(value * 100)}%，这意味着你的情绪感受力比常人强烈得多。你对危险、负面信号的"雷达"特别灵敏——这在原始社会是生存优势，但在现代社会，它常常让你"未发生先恐慌"。你的大脑会自动放大负面信息，让你觉得"感觉=事实"。`,
      medium: `你的神经质处于中等水平，你有正常的情绪波动但不会过于极端。不过在压力或疲惫的时候，你的情绪敏感度会上升，容易触发焦虑类的认知 Bug。`,
      low: `你的神经质偏低，情绪比较稳定。你不容易被小事干扰，但有时可能会忽略一些重要的情绪信号，或者对他人的情绪感受不够敏感。`,
    },
    openness: {
      high: `你的开放性高达 ${Math.round(value * 100)}%，你的内心世界极其丰富，想象力发达。你能清晰地"看到"事物最理想的样子，但这也意味着现实常常让你失望。你容易陷入"应该是这样"和"实际是这样"的落差中，也容易想得太多而迟迟不行动。`,
      medium: `你的开放性处于中等水平，你既有想象力也能脚踏实地。不过当你特别在意某件事时，理想化的倾向还是会冒出来。`,
      low: `你的开放性偏低，你比较务实，关注实际。你不太会做不切实际的幻想，但有时可能会过于保守，错过一些新的可能性。`,
    },
    agreeableness: {
      high: `你的宜人性高达 ${Math.round(value * 100)}%，你对他人的情绪异常敏感，天生追求和谐。你很难说"不"，总是想让每个人都满意。这让你成为了很好的朋友，但也意味着你特别在意别人怎么看你——别人的一个眼神、一句语气不对，都可能让你在心里演一整部戏。`,
      medium: `你的宜人性处于中等水平，你关心他人但也有自己的边界。不过在关系中，你还是会不自觉地优先考虑别人的感受。`,
      low: `你的宜人性偏低，你比较独立直接，不太会为了迎合别人而委屈自己。不过有时你可能会显得过于强硬，忽略了他人的感受。`,
    },
    extraversion: {
      high: `你的外向性高达 ${Math.round(value * 100)}%，你从人际互动中获取能量，也在意外部评价。你习惯通过和他人比较来定位自己的位置——这让你充满动力，但也意味着你特别容易陷入"比较地狱"。别人的成就，很容易变成你自我否定的标尺。`,
      medium: `你的外向性处于中等水平，你既能享受社交也能独处。不过在群体中，你还是会不自觉地关注他人的评价。`,
      low: `你的外向性偏低，你更倾向于内省和独处。你不太在意外部评价，但有时可能会过度沉浸在自己的内心世界里，忽视了外界的反馈。`,
    },
  };

  let impact = impacts[dimension][level];

  const relatedBugs = getRelatedBugsForDimension(dimension, level);
  const matchedRelated = relatedBugs.filter((id) => matchedBugIds.has(id));

  if (matchedRelated.length > 0) {
    const bugNames = matchedRelated
      .map((id) => {
        const bug = bugMap.get(id);
        return bug ? `「${bug.name}」` : `「${id}」`;
      })
      .join("、");
    impact += `\n\n在你这次检测到的 Bug 中，${bugNames} 就和这个特质直接相关。`;
  }

  return impact;
}

function getRelatedBugsForDimension(
  dimension: BigFiveDimension,
  level: "low" | "medium" | "high"
): string[] {
  return BUG_PERSONALITY_MAPPINGS.filter((mapping) => {
    const weight = mapping.dimensionWeights[dimension];
    if (!weight || weight < 0.5) return false;
    if ((mapping as any).dimensionWeightsInverse) {
      return level === "low";
    }
    return level === "high";
  }).map((m) => m.bugId);
}

function buildPersonalizedBugNarrative(
  bug: CognitiveBug,
  profile: PersonalityProfile
): string {
  const mapping = BUG_PERSONALITY_MAPPINGS.find((m) => m.bugId === bug.id);
  if (!mapping) {
    return `你触发了「${bug.name}」。`;
  }

  let narrative = mapping.personalityExplanationTpl;

  narrative = narrative.replace(/\{bug_name\}/g, `「${bug.name}」`);

  (Object.keys(profile.dimensions) as BigFiveDimension[]).forEach((dim) => {
    const value = profile.dimensions[dim];
    const level = getDimensionLevel(value);
    const levelLabel = getDimensionLevelLabel(dim, level);

    narrative = narrative.replace(
      new RegExp(`\\{${dim}_level\\}`, "g"),
      levelLabel
    );
  });

  const activeTriggers = mapping.personalitySpecificTriggers.filter((trigger) => {
    const [condition] = trigger.split(":");
    const [dim, requiredLevel] = condition.split("_");
    const dimValue = profile.dimensions[dim as BigFiveDimension];
    const dimLevel = getDimensionLevel(dimValue);
    return dimLevel === requiredLevel;
  });

  if (activeTriggers.length > 0) {
    narrative += "\n\n具体来说：";
    activeTriggers.forEach((trigger, i) => {
      const [, text] = trigger.split(":");
      narrative += `\n${i + 1}. ${text}`;
    });
  }

  return narrative;
}

function buildArchetypeInsight(
  archetypeInfo: any,
  chain: BugChain,
  profile: PersonalityProfile
): string {
  const matchedCount = chain.nodes.filter((n) => n.isMatched).length;
  let insight = `作为「${archetypeInfo.name}」，`;

  if (matchedCount >= 3) {
    insight += `你这次触发的 Bug 数量偏多，这其实和你的人格特质高度相关——`;
  } else if (matchedCount >= 2) {
    insight += `你这次触发的几个 Bug，其实都指向了你人格中同一个敏感点——`;
  } else {
    insight += `你这次触发的 Bug，正是你人格特质最容易"中枪"的地方——`;
  }

  const patterns = archetypeInfo.vulnerabilityPatterns;
  const matchedBugIds = new Set(chain.nodes.filter((n) => n.isMatched).map((n) => n.bugId));

  const relevantPatterns = patterns.filter((pattern: string) => {
    if (matchedBugIds.has("should-tyrant") && pattern.includes("应该")) return true;
    if (matchedBugIds.has("universe-scapegoat") && pattern.includes("我的问题")) return true;
    if (matchedBugIds.has("doomsday-rehearsal") && pattern.includes("灾难")) return true;
    if (matchedBugIds.has("feeling-is-fact") && pattern.includes("感受")) return true;
    if (matchedBugIds.has("mind-reading-fanfiction") && pattern.includes("内心戏")) return true;
    if (matchedBugIds.has("comparison-hell") && pattern.includes("比较")) return true;
    if (matchedBugIds.has("one-fail-equals-all") && pattern.includes("错误")) return true;
    if (matchedBugIds.has("negative-pixel-lock") && pattern.includes("盯着")) return true;
    return matchedCount >= 2;
  });

  const finalPatterns = relevantPatterns.length > 0 ? relevantPatterns : patterns.slice(0, 2);

  finalPatterns.forEach((pattern: string, i: number) => {
    insight += `\n${i + 1}. ${pattern}`;
  });

  insight += "\n\n这些都不是你的「缺点」——它们是你的特质走到极端时的副产品。";
  insight += "那个让你成为「你」的东西，同时也是让你容易陷入这些思维陷阱的东西。";

  return insight;
}

function buildPersonalizedCoping(
  chain: BugChain,
  profile: PersonalityProfile,
  archetypeInfo: any
): string[] {
  const coping: string[] = [];
  const archetype = detectArchetype(profile);

  const archetypeSpecificCoping: Record<PersonalityArchetype, string[]> = {
    the_perfectionist: [
      "把'我应该做到完美'换成'我可以做到足够好'——80分和100分之间，差的不是20分的努力，而是你放过自己的勇气",
      "下次想说'这是我的问题'时，先停3秒，问问自己：如果是朋友遇到这件事，我会觉得是他的问题吗？",
      "每周给自己列一个'做得还不错'清单，而不是'待改进'清单——你已经够擅长找不足了，现在练习找闪光点",
    ],
    the_worrier: [
      "下次大脑开始演灾难片时，给剧本加一个结尾：'然后呢？就算真的发生，我就真的扛不住吗？'——90%的情况下，答案是'我能'",
      "把'万一'换成'就算'——'万一失败了'→'就算失败了，我可以……'，把恐惧从一个感叹号变成一个问题",
      "每天给'焦虑时间'设个闹钟，比如晚上8点到8点15分。这之前焦虑了就记下来，告诉自己'等到焦虑时间再想'——大部分焦虑到时候你都不想想了",
    ],
    the_idealist: [
      "把'不够好就是失败'换成'不完美但真实也是一种好'——理想是方向，不是及格线",
      "当你对现实失望时，问问自己：我失望的是真实的现实，还是我想象中应该的样子？",
      "用5分钟启动法对抗'想太多'——不用想好再开始，先做5分钟，想法会在行动中清晰起来",
    ],
    the_people_pleaser: [
      "下次想猜'他是不是不高兴了'时，直接问——你编的内心戏，90%都是错的",
      "练习说一个小小的'不'，比如拒绝一个不太想去的聚会。你会发现，天不会塌下来，别人也不会因此讨厌你",
      "把'别人会不会不开心'换成'我会不会不开心'——你的感受和别人的一样重要",
    ],
    the_overachiever: [
      "把'我要比别人好'换成'我要比昨天的自己好'——比较是偷走快乐的小偷，尤其当你拿自己的日常比别人的高光时",
      "每完成一件事，停下来30秒感受一下'完成了'的感觉，而不是立刻想下一件——你值得为自己已有的成就开心",
      "每周安排一段'无目的时间'——不用学东西、不用提升自己、不用见任何人，就浪费一下时间。你不是一台永动机",
    ],
    the_sensitive_soul: [
      "把'我感受到了就是真的'换成'我感受到了，这是我的感受，但不一定是事实'——给感受和事实之间留一点空隙",
      "当你觉得别人在针对你时，列出3种其他可能的解释——你会发现，大部分时候是你想多了",
      "好事发生时，强迫自己开心至少10秒再想'会不会不长久'——你值得享受快乐，哪怕它不永恒",
    ],
    the_balanced: [
      "因为你比较均衡，可能不会在某一方面特别极端，但也容易忽略轻微的偏差信号。保持觉察就好",
      "你的灵活是优势，意味着你可以尝试多种应对策略，找到最适合当下的那一个",
      "定期回顾一下自己的思维模式，看看在不同场景下有没有反复出现的Bug",
    ],
    custom: [
      "根据你的人格维度，重点关注那些极端维度对应的易感Bug",
      "保持觉察是第一步，看到偏差就已经迈出了改变的一大步",
      "可以尝试不同的应对策略，找到最适合你自己的那一套",
    ],
  };

  coping.push(...archetypeSpecificCoping[archetype]);

  const matchedNodes = chain.nodes.filter((n) => n.isMatched);
  if (matchedNodes.length > 0) {
    const topBug = matchedNodes[0].bug;
    if (topBug.coping && topBug.coping.length > 0) {
      coping.push(`针对你最核心的 Bug「${topBug.name}」：${topBug.coping[0]}`);
    }
  }

  return coping;
}

export function mergePersonalityIntoExplanation(
  originalExplanation: string,
  augmented: PersonalityAugmentedExplanation
): string {
  let result = "";

  result += `【人格档案分析】\n\n`;
  result += augmented.personalityIntro;
  result += "\n\n";

  result += `【你的人格易感点】\n\n`;
  augmented.dimensionAnalysis.forEach((da, i) => {
    result += `${i + 1}. ${da.dimensionName}（${da.level === "high" ? "偏高" : da.level === "low" ? "偏低" : "中等"}）\n`;
    result += `   ${da.impact}\n\n`;
  });

  if (Object.keys(augmented.personalizedBugNarratives).length > 0) {
    result += `【为什么是你？——每个 Bug 在你身上的运作方式】\n\n`;
    let idx = 1;
    for (const [bugId, narrative] of Object.entries(augmented.personalizedBugNarratives)) {
      result += `${idx}. ${narrative}\n\n`;
      idx++;
    }
  }

  result += `【原型洞察】\n\n`;
  result += augmented.archetypeInsight;
  result += "\n\n";

  result += `【为你定制的应对策略】\n\n`;
  augmented.personalizedCoping.forEach((coping, i) => {
    result += `• ${coping}\n`;
  });

  result += "\n";
  result += originalExplanation;

  return result;
}
