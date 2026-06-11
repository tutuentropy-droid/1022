export type BigFiveDimension =
  | "openness"
  | "conscientiousness"
  | "extraversion"
  | "agreeableness"
  | "neuroticism";

export interface PersonalityDimension {
  id: BigFiveDimension;
  name: string;
  description: string;
  lowLabel: string;
  highLabel: string;
  value: number;
}

export interface PersonalityProfile {
  dimensions: Record<BigFiveDimension, number>;
  archetype?: PersonalityArchetype;
}

export type PersonalityArchetype =
  | "the_perfectionist"
  | "the_worrier"
  | "the_idealist"
  | "the_people_pleaser"
  | "the_overachiever"
  | "the_sensitive_soul"
  | "the_balanced"
  | "custom";

export interface ArchetypeInfo {
  id: PersonalityArchetype;
  name: string;
  tagline: string;
  description: string;
  dimensionDefaults: Record<BigFiveDimension, number>;
  vulnerabilityPatterns: string[];
}

export interface PersonalityBugMapping {
  bugId: string;
  dimensionWeights: Partial<Record<BigFiveDimension, number>>;
  dimensionWeightsInverse?: boolean;
  personalitySpecificTriggers: string[];
  personalityExplanationTpl: string;
}

export interface PersonalityAugmentedExplanation {
  personalityIntro: string;
  dimensionAnalysis: {
    dimension: BigFiveDimension;
    dimensionName: string;
    level: "low" | "medium" | "high";
    impact: string;
  }[];
  personalizedBugNarratives: Record<string, string>;
  archetypeInsight: string;
  personalizedCoping: string[];
}

export const DIMENSION_NAMES: Record<BigFiveDimension, string> = {
  openness: "开放性",
  conscientiousness: "尽责性",
  extraversion: "外向性",
  agreeableness: "宜人性",
  neuroticism: "神经质",
};

export const DIMENSION_DESCRIPTIONS: Record<BigFiveDimension, string> = {
  openness: "对新体验、新想法的接受程度",
  conscientiousness: "自律、责任感、追求完美的程度",
  extraversion: "从外界互动获取能量的倾向",
  agreeableness: "在意他人感受、追求和谐的程度",
  neuroticism: "情绪敏感性和负面情绪的易发性",
};

export const DIMENSION_LABELS: Record<BigFiveDimension, { low: string; high: string }> = {
  openness: { low: "务实保守", high: "想象丰富" },
  conscientiousness: { low: "随性灵活", high: "严谨自律" },
  extraversion: { low: "内省安静", high: "社交活跃" },
  agreeableness: { low: "独立直接", high: "和善共情" },
  neuroticism: { low: "情绪稳定", high: "敏感细腻" },
};

export const ARCHETYPES: Record<PersonalityArchetype, ArchetypeInfo> = {
  the_perfectionist: {
    id: "the_perfectionist",
    name: "完美主义者",
    tagline: "不做到最好，等于没做",
    description: "你对自己有极高的标准，责任感极强。事情不做到完美你就不会安心，别人做的事你也常常不太放心。",
    dimensionDefaults: {
      openness: 0.6,
      conscientiousness: 0.95,
      extraversion: 0.4,
      agreeableness: 0.5,
      neuroticism: 0.7,
    },
    vulnerabilityPatterns: [
      "哪怕是很小的错误，也会在你心里被放大成严重的失败",
      "你习惯用'应该'来鞭打自己——'我应该做得更好'",
      "事情出问题时，你的第一反应是'是不是我的问题'",
    ],
  },
  the_worrier: {
    id: "the_worrier",
    name: "忧心忡忡者",
    tagline: "凡事往最坏处想，这样真的发生了也不会太意外",
    description: "你的想象力在预测灾难方面特别发达。对不确定性感到不安，习惯提前演练所有可能的坏结果。",
    dimensionDefaults: {
      openness: 0.5,
      conscientiousness: 0.7,
      extraversion: 0.3,
      agreeableness: 0.6,
      neuroticism: 0.95,
    },
    vulnerabilityPatterns: [
      "一件小事还没发生，你已经在脑子里经历了完整的灾难剧本",
      "你的感受特别强烈，而且容易把感受当成事实",
      "你总是盯着事情可能出错的地方看",
    ],
  },
  the_idealist: {
    id: "the_idealist",
    name: "理想主义者",
    tagline: "现实配不上我的想象",
    description: "你的内心世界极其丰富，对事物有很高的理想期待。当现实与想象不符时，你会感到深深的失落。",
    dimensionDefaults: {
      openness: 0.95,
      conscientiousness: 0.5,
      extraversion: 0.5,
      agreeableness: 0.7,
      neuroticism: 0.6,
    },
    vulnerabilityPatterns: [
      "你容易把人和事理想化，然后在现实面前失望",
      "事情不是非黑即白的，但你有时会觉得'不够好就是失败'",
      "你想得太多，以至于迟迟无法开始行动",
    ],
  },
  the_people_pleaser: {
    id: "the_people_pleaser",
    name: "讨好型人格",
    tagline: "你开心就好，我没关系的（其实有关系）",
    description: "你对他人的情绪异常敏感，总是想让每个人都满意。你很难说'不'，因为害怕让别人失望。",
    dimensionDefaults: {
      openness: 0.5,
      conscientiousness: 0.6,
      extraversion: 0.5,
      agreeableness: 0.95,
      neuroticism: 0.7,
    },
    vulnerabilityPatterns: [
      "你特别在意别人怎么看你，习惯在心里'读'别人的想法",
      "别人没回消息，你可能已经脑补了一整部内心戏",
      "冲突会让你非常不安，你宁愿委屈自己也不想得罪人",
    ],
  },
  the_overachiever: {
    id: "the_overachiever",
    name: "过度上进者",
    tagline: "不进则退，停下来就是落后",
    description: "你精力充沛、目标感极强，总是在追求下一个成就。但你也习惯拿自己和别人比较，永远觉得还不够。",
    dimensionDefaults: {
      openness: 0.6,
      conscientiousness: 0.85,
      extraversion: 0.8,
      agreeableness: 0.5,
      neuroticism: 0.5,
    },
    vulnerabilityPatterns: [
      "你忍不住和别人比较，而且总是拿自己的短板比别人的长处",
      "你很难为已有的成就感到满足，总觉得应该做得更多",
      "停下来会让你焦虑，好像自己在'浪费时间'",
    ],
  },
  the_sensitive_soul: {
    id: "the_sensitive_soul",
    name: "敏感星人",
    tagline: "感觉太真实了，不可能是错的",
    description: "你的情绪感受力极强，内心世界丰富而细腻。你相信自己的直觉，但也容易被情绪带着走。",
    dimensionDefaults: {
      openness: 0.8,
      conscientiousness: 0.4,
      extraversion: 0.3,
      agreeableness: 0.8,
      neuroticism: 0.85,
    },
    vulnerabilityPatterns: [
      "你的感受特别强烈，你会觉得'我感受到了，就一定是真的'",
      "别人的一点点冷淡，在你这里可能被放大成'他讨厌我'",
      "好事发生时，你会下意识地想'这不会长久的'",
    ],
  },
  the_balanced: {
    id: "the_balanced",
    name: "平衡型人格",
    tagline: "凡事有度，不偏不倚",
    description: "你在各个维度上都比较均衡，没有特别极端的倾向。这让你看问题比较全面，但也意味着你可能在多个方面都有轻微的易感点。",
    dimensionDefaults: {
      openness: 0.55,
      conscientiousness: 0.55,
      extraversion: 0.5,
      agreeableness: 0.55,
      neuroticism: 0.45,
    },
    vulnerabilityPatterns: [
      "你不会在某个方面特别极端，但可能同时受到多种偏差的轻微影响",
      "你的思维模式比较灵活，意味着你也可能在不同场景下触发不同的Bug",
      "因为你不极端，你可能不太容易觉察到自己的偏差",
    ],
  },
  custom: {
    id: "custom",
    name: "自定义人格",
    tagline: "你是独一无二的",
    description: "你可以自己调整每个人格维度的数值，来更精准地匹配你的特质。",
    dimensionDefaults: {
      openness: 0.5,
      conscientiousness: 0.5,
      extraversion: 0.5,
      agreeableness: 0.5,
      neuroticism: 0.5,
    },
    vulnerabilityPatterns: [
      "根据你自己设定的人格维度，系统会为你分析易感的认知Bug",
    ],
  },
};

export const BUG_PERSONALITY_MAPPINGS: PersonalityBugMapping[] = [
  {
    bugId: "should-tyrant",
    dimensionWeights: { conscientiousness: 0.9, neuroticism: 0.5 },
    personalitySpecificTriggers: [
      "conscientiousness_high:你对自己的高标准让'应该'变成了一种内在的强制命令",
      "neuroticism_high:你害怕不完美的后果，所以用'应该'来试图控制一切",
    ],
    personalityExplanationTpl:
      "在你{conscientiousness_level}的尽责性驱动下，你给自己设立了太多的'应该'。\n这些'应该'不是外界强加的，而是你从内心深处相信的'做人准则'。\n你觉得如果不做到这些'应该'，你就不够好——这种想法本身，就是{bug_name}在作祟。",
  },
  {
    bugId: "universe-scapegoat",
    dimensionWeights: { conscientiousness: 0.85, agreeableness: 0.6, neuroticism: 0.7 },
    personalitySpecificTriggers: [
      "conscientiousness_high:你的责任感让你觉得'任何事出问题都有我的一份'",
      "agreeableness_high:你不想让别人担责任，所以下意识把锅往自己身上揽",
    ],
    personalityExplanationTpl:
      "你{conscientiousness_level}的责任感让你总是在问'是不是我的问题？'\n这不是因为你真的做错了什么，而是因为你习惯了承担。\n在你的世界里，承担责任=靠谱的人，所以你甚至会下意识地寻找自己的错处——\n这就是为什么你会觉得'全宇宙的锅都该我背'。",
  },
  {
    bugId: "one-fail-equals-all",
    dimensionWeights: { conscientiousness: 0.8, neuroticism: 0.75 },
    personalitySpecificTriggers: [
      "conscientiousness_high:你的高标准让你对失败零容忍，一次失误就像是对你整个人的否定",
      "neuroticism_high:你的情绪放大效应让一次失败的感受变得格外强烈",
    ],
    personalityExplanationTpl:
      "你对自己的要求是：要么做好，要么就是失败。\n在{conscientiousness_level}的尽责性标准下，一次失误不只是'这件事没做好'——\n它会直接被你解读为'我这个人不行'。\n你可能都没意识到，你已经悄悄地从'我这件事搞砸了'，\n跳跃到了'我就是个蠢货'——这个跳跃，就是{bug_name}在起作用。",
  },
  {
    bugId: "doomsday-rehearsal",
    dimensionWeights: { neuroticism: 0.9, openness: 0.6, conscientiousness: 0.5 },
    personalitySpecificTriggers: [
      "neuroticism_high:你的情绪敏感让你对潜在威胁有超强的'雷达'，但也容易误报",
      "openness_high:你丰富的想象力让你能够生动地'看到'最糟糕的结果",
    ],
    personalityExplanationTpl:
      "你的大脑有一种特殊的天赋：它能把最糟糕的剧本演得栩栩如生。\n{neuroticism_level}的神经质让你对危险信号特别敏感——\n这本来是一种生存优势，但在现代生活中，它常常让你'未发生先恐慌'。\n{openness_level}的开放性又给了你的想象力足够的素材，\n于是一件小事还没发生，你已经在心里经历了一遍世界末日。",
  },
  {
    bugId: "feeling-is-fact",
    dimensionWeights: { neuroticism: 0.85, openness: 0.6, agreeableness: 0.5 },
    personalitySpecificTriggers: [
      "neuroticism_high:你的情绪体验特别强烈，强烈到你很难怀疑它的真实性",
      "openness_high:你习惯相信自己的直觉和内在感受，把它们当作重要的信号",
    ],
    personalityExplanationTpl:
      "你的感受太真实了，真实到你根本不会怀疑它。\n{neuroticism_level}的神经质让你的情绪体验比常人更加强烈——\n当你感到焦虑时，那种焦虑感真的就像有什么坏事要发生一样。\n{openness_level}的开放性让你相信'内心的声音'，\n于是你会自然而然地想：'我感受到了，所以一定是真的'。",
  },
  {
    bugId: "negative-pixel-lock",
    dimensionWeights: { neuroticism: 0.8, conscientiousness: 0.5 },
    personalitySpecificTriggers: [
      "neuroticism_high:你的大脑对负面信息有优先处理权——这是进化来的生存机制",
    ],
    personalityExplanationTpl:
      "你的大脑里好像装了一个负面信号过滤器：好事被弱化，坏事被放大。\n这不是你'故意'要消极，而是{neuroticism_level}的神经质让你的大脑\n对威胁信号特别敏感——这是我们老祖宗在草原上活下来的本事。\n只是现在没有猛兽了，你的负面锁定就开始盯着那些不完美的细节，\n让你觉得'一切都糟透了'，哪怕99%的事情其实都还好。",
  },
  {
    bugId: "comparison-hell",
    dimensionWeights: { conscientiousness: 0.6, extraversion: 0.6, neuroticism: 0.6 },
    personalitySpecificTriggers: [
      "conscientiousness_high:你总想做得更好，所以会不自觉地找参照物来衡量自己",
      "extraversion_high:你在意外部评价，自然会关注别人在做什么",
      "neuroticism_high:你容易焦虑，而比较是焦虑最好的燃料",
    ],
    personalityExplanationTpl:
      "你总是忍不住拿自己和别人比，比完又觉得自己哪都不行。\n这其实是你{conscientiousness_level}的上进心在作祟——你总想变得更好，\n所以需要一个'标尺'来衡量自己的进步。\n但你选的这个标尺有问题：你拿自己的日常和别人的高光比，\n拿自己的全貌和别人的切片比。这样比下去，不输才怪。",
  },
  {
    bugId: "mind-reading-fanfiction",
    dimensionWeights: { agreeableness: 0.85, neuroticism: 0.7, openness: 0.6 },
    personalitySpecificTriggers: [
      "agreeableness_high:你太在意别人的感受了，所以会下意识地'猜'别人在想什么",
      "neuroticism_high:你害怕冲突和被讨厌，所以会特别警惕别人的态度变化",
      "openness_high:你的想象力让你能够编出完整的内心戏",
    ],
    personalityExplanationTpl:
      "你{agreeableness_level}的共情能力让你对别人的情绪特别敏感——\n这本是好事，但有时你会跳过验证，直接在心里给别人编内心戏。\n你害怕让别人不开心，所以会格外留意每一个微小的信号：\n他回复慢了、她语气不对、那个人没笑……\n然后{neuroticism_level}的神经质和{openness_level}的想象力就会联手，\n给你演一出'他一定是讨厌我了'的完整剧情。",
  },
  {
    bugId: "good-things-discount",
    dimensionWeights: { neuroticism: 0.75, conscientiousness: 0.6 },
    personalitySpecificTriggers: [
      "neuroticism_high:你不相信好事能长久，总觉得'乐极生悲'",
      "conscientiousness_high:你习惯看到'还可以更好'的地方，所以不太会为已有的感到满足",
    ],
    personalityExplanationTpl:
      "好事发生时，你第一反应不是开心，而是'这不会长久吧'或者'这不算什么'。\n{neuroticism_level}的神经质让你对'好景不长'有特别的警觉——\n你好像在心里提前给自己打预防针，怕如果太开心了，接下来的失望会更痛。\n{conscientiousness_level}的高标准又让你觉得'这还不够好'，\n于是那些本来值得开心的事，被你自动打了个折。",
  },
  {
    bugId: "binary-life",
    dimensionWeights: { openness: 0.75, conscientiousness: 0.7 },
    personalitySpecificTriggers: [
      "openness_high:你容易理想化，觉得事情'应该'是某种完美的样子",
      "conscientiousness_high:你追求明确的标准，非黑即白的判断对你来说最清晰",
    ],
    personalityExplanationTpl:
      "在你的世界里，事情好像不是成功就是失败，不是对就是错。\n{openness_level}的开放性让你对理想状态有清晰的想象——\n你知道'最好的样子'是什么，达不到那个样子，你就觉得是'失败'。\n{conscientiousness_level}的尽责性又让你追求明确的标准，\n于是那些'差不多''还行''还可以'的状态，都被你归到了'不够好'那一边。",
  },
  {
    bugId: "one-flop-all-flop",
    dimensionWeights: { neuroticism: 0.8, conscientiousness: 0.65 },
    personalitySpecificTriggers: [
      "neuroticism_high:一件事不顺时，你的情绪会把这种'不顺'蔓延到所有事情上",
      "conscientiousness_high:你对自己有整体的期望，一个方面没做好就容易觉得整体都糟",
    ],
    personalityExplanationTpl:
      "一件事搞砸了，你就觉得所有事都在完蛋。\n这是{neuroticism_level}的神经质在起作用：负面情绪就像墨水，\n滴进你的思维里就会迅速扩散，把本来无关的事情都染成同一种颜色。\n你的大脑在说：'一件事不行=所有事都不行'——\n这个等式看起来很有道理，但它其实就是{bug_name}。",
  },
  {
    bugId: "prophet-self-fulfill",
    dimensionWeights: { neuroticism: 0.75, conscientiousness: 0.6 },
    personalitySpecificTriggers: [
      "neuroticism_high:你预测坏事会发生，然后情绪和行为就会配合这个预测",
    ],
    personalityExplanationTpl:
      "你预测自己会搞砸，然后真的就搞砸了——你以为这证明了你'本来就不行'，\n但其实这是你自己一手导演的。\n{neuroticism_level}的神经质让你先入为主地相信'不会有好结果'，\n然后你的行为就会悄悄配合这个信念：不认真准备、提前放弃、消极应对……\n最后结果真的不好，你还会说：'你看，我就知道！'",
  },
  {
    bugId: "procrastination-paralysis",
    dimensionWeights: { conscientiousness: 0.5, neuroticism: 0.7, openness: 0.5 },
    dimensionWeightsInverse: true,
    personalitySpecificTriggers: [
      "neuroticism_high:你害怕做不好，所以迟迟不肯开始——因为不做就不会失败",
      "conscientiousness_low:你有时缺乏行动力，或者说完美主义让你找不到'完美的开始时机'",
    ],
    personalityExplanationTpl:
      "你不是懒，你是怕。\n{neuroticism_level}的神经质让你对'可能做不好'这件事特别焦虑——\n于是你的大脑发明了一个绝妙的逃避策略：拖。\n不开始，就不会失败；不做，就不会证明自己不行。\n但拖到最后，事情真的做不好了，你又会说：'你看，我就是不行。'\n这是拖延最狡猾的地方：它一边保护你，一边毁掉你。",
  },
];

export function getDimensionLevel(value: number): "low" | "medium" | "high" {
  if (value < 0.35) return "low";
  if (value < 0.65) return "medium";
  return "high";
}

export function getDimensionLevelLabel(
  dimension: BigFiveDimension,
  level: "low" | "medium" | "high"
): string {
  const labels = DIMENSION_LABELS[dimension];
  if (level === "low") return `偏${labels.low}`;
  if (level === "high") return `偏${labels.high}`;
  return "中等";
}
