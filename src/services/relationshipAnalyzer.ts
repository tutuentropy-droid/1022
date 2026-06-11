import type {
  CognitiveBug,
  BugMatchResult,
  RelationshipInput,
  RelationshipDebugResult,
  ParticipantTriggerChain,
  TriggerChainNode,
  EscalationStep,
  MisunderstandingFormation,
  MisunderstandingPoint,
  EmotionalTrigger,
  RelationshipFuturePath,
  RelationshipStep,
  RelationshipSimulationResult,
  RelationshipReplacementOption,
  FuturePathType,
} from "../types/bug";
import { KeywordBugMatcher } from "./bugMatcher";
import { emotionLabels, escalationMechanisms } from "../types/bug";

const emotionalTriggerPatterns: Record<string, { keywords: string[]; emotion: string }> = {
  ignored: { keywords: ["不理我", "无视我", "没回", "不回", "忽视", "不在乎"], emotion: "ignored" },
  attacked: { keywords: ["指责", "怪我", "都是我", "你总是", "你从来", "凭什么"], emotion: "attacked" },
  misunderstood: { keywords: ["不是这个意思", "你不懂", "你不理解", "误会", "理解错了"], emotion: "misunderstood" },
  unvalued: { keywords: ["不尊重", "看不起", "觉得我", "不当回事", "无所谓"], emotion: "unvalued" },
  controlled: { keywords: ["你应该", "你必须", "能不能别", "不要总是", "你能不能"], emotion: "controlled" },
  rejected: { keywords: ["拒绝", "不想", "不愿意", "算了吧", "没必要"], emotion: "rejected" },
  hurt: { keywords: ["伤心", "难过", "心寒", "失望", "委屈"], emotion: "hurt" },
  anger: { keywords: ["气死我了", "恼火", "愤怒", "烦透了", "受不了"], emotion: "anger" },
  anxiety: { keywords: ["担心", "害怕", "会不会", "万一", "怎么办"], emotion: "anxiety" },
  frustration: { keywords: ["每次都", "总是", "永远", "一直", "从来"], emotion: "frustration" },
};

const interpretationPatterns: Record<string, string[]> = {
  mindreading: ["一定是", "肯定是", "你就是想", "你故意"],
  catastrophizing: ["完了", "永远都", "再也不", "每次都"],
  generalization: ["总是", "从来", "永远", "每次"],
  labeling: ["你就是", "你这种人", "你总是这样"],
  shouldStatements: ["应该", "必须", "本该", " ought to"],
};

const coreBeliefs: Record<string, string[]> = {
  abandonment: ["如果我不够好，就会被抛弃", "别人随时都会离开我"],
  unlovable: ["我不值得被爱", "没有人会真正在乎我"],
  inadequacy: ["我不够好", "我总是做不好"],
  distrust: ["别人都会伤害我", "不能相信任何人"],
  entitlement: ["别人应该理解我", "我应该被特殊对待"],
};

export class RelationshipAnalyzer {
  private bugMatcher: KeywordBugMatcher;
  private allBugs: CognitiveBug[];

  constructor(allBugs: CognitiveBug[]) {
    this.bugMatcher = new KeywordBugMatcher();
    this.allBugs = allBugs;
  }

  async analyze(input: RelationshipInput): Promise<RelationshipDebugResult> {
    const speakersInDialogue = new Set(input.dialogue.map((t) => t.speaker));
    const hasA = speakersInDialogue.has("A");
    const hasB = speakersInDialogue.has("B");

    if (!hasA || !hasB) {
      const missing = !hasA
        ? input.participantA.name || "A"
        : input.participantB.name || "B";
      throw new Error(`需要双方都有发言才能进行分析，${missing} 还没有说过话`);
    }

    if (input.dialogue.length < 2) {
      throw new Error("至少需要2轮对话才能进行分析");
    }

    const chainA = await this.buildParticipantChain(input, "A");
    const chainB = await this.buildParticipantChain(input, "B");
    const escalationPath = this.buildEscalationPath(input, chainA, chainB);
    const misunderstanding = this.buildMisunderstandingFormation(input, chainA, chainB);
    const systemInsight = this.generateSystemInsight(chainA, chainB, escalationPath);
    const deEscalationSuggestions = this.generateSuggestions(chainA, chainB, misunderstanding);
    const simulation = this.simulateFuturePaths(input, chainA, chainB, escalationPath, misunderstanding);

    return {
      input,
      chainA,
      chainB,
      escalationPath,
      misunderstanding,
      systemInsight,
      deEscalationSuggestions,
      simulation,
    };
  }

  private async buildParticipantChain(
    input: RelationshipInput,
    participant: "A" | "B"
  ): Promise<ParticipantTriggerChain> {
    const name = participant === "A" ? input.participantA.name : input.participantB.name;
    const turns = input.dialogue.filter((t) => t.speaker === participant);
    const fullText = turns.map((t) => t.content).join("。");

    const bugMatches = await this.bugMatcher.match(fullText, this.allBugs);
    const chain: TriggerChainNode[] = [];

    let stepIndex = 0;
    for (let i = 0; i < input.dialogue.length; i++) {
      const turn = input.dialogue[i];
      if (turn.speaker !== participant) continue;

      stepIndex++;
      const prevTurn = i > 0 ? input.dialogue[i - 1] : null;
      const triggers = this.detectEmotionalTriggers(turn.content, prevTurn?.content || "");
      const emotion = this.detectDominantEmotion(triggers);
      const interpretation = this.analyzeInterpretation(turn.content);
      const belief = this.detectUnderlyingBelief(turn.content);

      const turnBugMatches = await this.bugMatcher.match(turn.content, this.allBugs);
      const topBug = turnBugMatches[0];

      chain.push({
        step: stepIndex,
        speaker: participant,
        content: turn.content,
        bug: topBug?.bug,
        bugMatchScore: topBug?.matchScore,
        emotion: emotionLabels[emotion] || emotion,
        emotionIntensity: this.calculateEmotionIntensity(triggers),
        triggers,
        interpretation,
        underlyingBelief: belief,
      });
    }

    const dominantEmotion = this.findDominantEmotion(chain);
    const primaryTrigger = this.findPrimaryTrigger(chain);

    return {
      participant,
      name,
      chain,
      coreBugs: bugMatches.slice(0, 3),
      dominantEmotion,
      primaryTrigger,
    };
  }

  private detectEmotionalTriggers(content: string, precedingContent: string): EmotionalTrigger[] {
    const triggers: EmotionalTrigger[] = [];
    const combined = (precedingContent + " " + content).toLowerCase();

    for (const [key, pattern] of Object.entries(emotionalTriggerPatterns)) {
      for (const keyword of pattern.keywords) {
        if (combined.includes(keyword)) {
          const context = this.findContext(combined, keyword);
          triggers.push({
            keyword,
            emotion: pattern.emotion,
            intensity: Math.min(keyword.length / 4 + context.intensity, 10),
            description: context.text,
          });
        }
      }
    }

    return triggers.slice(0, 5);
  }

  private findContext(text: string, keyword: string): { text: string; intensity: number } {
    const index = text.indexOf(keyword);
    const start = Math.max(0, index - 10);
    const end = Math.min(text.length, index + keyword.length + 15);
    const context = text.slice(start, end);
    const intensifiers = ["真的", "太", "完全", "根本", "总是", "从来", "永远"];
    let intensity = 1;
    for (const int of intensifiers) {
      if (context.includes(int)) intensity += 0.3;
    }
    return { text: context, intensity };
  }

  private detectDominantEmotion(triggers: EmotionalTrigger[]): string {
    if (triggers.length === 0) return "neutral";
    const emotionCount: Record<string, number> = {};
    for (const t of triggers) {
      emotionCount[t.emotion] = (emotionCount[t.emotion] || 0) + t.intensity;
    }
    const sorted = Object.entries(emotionCount).sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
  }

  private calculateEmotionIntensity(triggers: EmotionalTrigger[]): number {
    if (triggers.length === 0) return 3;
    const total = triggers.reduce((sum, t) => sum + t.intensity, 0);
    return Math.min(Math.round(total), 10);
  }

  private analyzeInterpretation(content: string): string {
    const lower = content.toLowerCase();
    for (const [pattern, indicators] of Object.entries(interpretationPatterns)) {
      for (const indicator of indicators) {
        if (lower.includes(indicator)) {
          switch (pattern) {
            case "mindreading":
              return "在没有证据的情况下揣测对方的动机和想法";
            case "catastrophizing":
              return "把事情放大到最糟糕的极端情况";
            case "generalization":
              return "基于单次事件做出普遍性结论";
            case "labeling":
              return "给对方贴标签，而不是描述具体行为";
            case "shouldStatements":
              return "用绝对化的标准要求对方";
          }
        }
      }
    }
    return "对对方的话进行了自己的解读，但可能与对方本意有偏差";
  }

  private detectUnderlyingBelief(content: string): string | undefined {
    const lower = content.toLowerCase();
    for (const [belief, indicators] of Object.entries(coreBeliefs)) {
      for (const indicator of indicators) {
        if (lower.includes(indicator.slice(0, 4)) || this.semanticMatch(lower, indicator)) {
          return indicator;
        }
      }
    }
    return undefined;
  }

  private semanticMatch(text: string, belief: string): boolean {
    const beliefWords = belief.split(/[，。\s]+/).filter((w) => w.length > 1);
    let matches = 0;
    for (const word of beliefWords) {
      if (text.includes(word)) matches++;
    }
    return matches >= 2;
  }

  private findDominantEmotion(chain: TriggerChainNode[]): string {
    if (chain.length === 0) return "平静";
    const emotionCount: Record<string, number> = {};
    for (const node of chain) {
      emotionCount[node.emotion] = (emotionCount[node.emotion] || 0) + node.emotionIntensity;
    }
    const sorted = Object.entries(emotionCount).sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
  }

  private findPrimaryTrigger(chain: TriggerChainNode[]): string {
    if (chain.length === 0) return "无明显触发点";
    const allTriggers: Record<string, number> = {};
    for (const node of chain) {
      for (const trigger of node.triggers) {
        allTriggers[trigger.keyword] = (allTriggers[trigger.keyword] || 0) + trigger.intensity;
      }
    }
    const sorted = Object.entries(allTriggers).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || "无明显触发点";
  }

  private buildEscalationPath(
    input: RelationshipInput,
    chainA: ParticipantTriggerChain,
    chainB: ParticipantTriggerChain
  ): EscalationStep[] {
    const steps: EscalationStep[] = [];
    const allNodes = [...chainA.chain, ...chainB.chain]
      .sort((a, b) => {
        const idxA = input.dialogue.findIndex((d) => d.content === a.content);
        const idxB = input.dialogue.findIndex((d) => d.content === b.content);
        return idxA - idxB;
      });

    let previousIntensity = 3;

    for (let i = 1; i < allNodes.length; i++) {
      const current = allNodes[i];
      const prev = allNodes[i - 1];

      if (current.speaker === prev.speaker) continue;

      const intensityChange = current.emotionIntensity - previousIntensity;
      const mechanism = this.identifyEscalationMechanism(current.content, prev.content);

      steps.push({
        step: steps.length + 1,
        speaker: current.speaker,
        action: prev.content,
        reaction: current.content,
        intensityChange,
        mechanism: escalationMechanisms[mechanism] || "情绪传递",
      });

      previousIntensity = current.emotionIntensity;
    }

    return steps;
  }

  private identifyEscalationMechanism(response: string, stimulus: string): string {
    const lowerResponse = response.toLowerCase();
    const lowerStimulus = stimulus.toLowerCase();

    if (this.containsAny(lowerResponse, ["你才", "你也", "你自己"]) && this.containsAny(lowerStimulus, ["你", "你的"])) {
      return "retaliation";
    }
    if (this.containsAny(lowerResponse, ["总是", "从来", "永远", "每次", "一直"])) {
      return "generalization";
    }
    if (this.containsAny(lowerResponse, ["你一定", "你就是想", "你故意", "你明明"])) {
      return "mindreading";
    }
    if (this.containsAny(lowerResponse, ["完了", "再也不", "永远都", "这辈子"])) {
      return "catastrophizing";
    }
    if (this.containsAny(lowerResponse, ["我没有", "不是我", "你错了", "我没有啊"]) && this.containsAny(lowerStimulus, ["你", "你的"])) {
      return "defensiveness";
    }
    if (this.containsAny(lowerResponse, ["算了", "不想说", "随便你", "无所谓"]) || lowerResponse.trim().length < 5) {
      return "stonewalling";
    }
    if (this.containsAny(lowerResponse, ["都是你", "怪你", "你的错", "因为你"])) {
      return "blaming";
    }
    if (this.containsAny(lowerResponse, ["想多了", "至于吗", "太敏感", "小题大做"])) {
      return "invalidation";
    }

    return "retaliation";
  }

  private containsAny(text: string, keywords: string[]): boolean {
    return keywords.some((k) => text.includes(k));
  }

  private buildMisunderstandingFormation(
    input: RelationshipInput,
    chainA: ParticipantTriggerChain,
    chainB: ParticipantTriggerChain
  ): MisunderstandingFormation {
    const points: MisunderstandingPoint[] = [];

    for (let i = 0; i < input.dialogue.length - 1; i++) {
      const current = input.dialogue[i];
      const next = input.dialogue[i + 1];

      if (current.speaker !== next.speaker) {
        const distortion = this.identifyDistortion(next.content, current.content);
        if (distortion) {
          points.push({
            id: `mis-${i}`,
            whatASaid: current.speaker === "A" ? current.content : next.content,
            whatAIntended: this.inferIntention(current.content, current.speaker),
            whatBHeard: this.inferPerception(next.content, current.content),
            whatBResponded: next.content,
            distortion,
            missingContext: this.identifyMissingContext(current.content, next.content),
          });
        }
      }
    }

    return {
      origin: this.identifyOrigin(input.dialogue),
      points: points.slice(0, 5),
      reinforcementLoop: this.describeReinforcementLoop(chainA, chainB),
      alternativeInterpretation: this.generateAlternativeInterpretation(input),
    };
  }

  private identifyDistortion(response: string, stimulus: string): string {
    const lowerResponse = response.toLowerCase();
    const lowerStimulus = stimulus.toLowerCase();

    if (this.containsAny(lowerResponse, ["你一定", "你就是", "你肯定"])) {
      return "过度揣测：在没有明确证据的情况下给对方的意图下结论";
    }
    if (this.containsAny(lowerResponse, ["总是", "从来", "每次"])) {
      return "过度泛化：把单次事件扩展为对方的一贯行为模式";
    }
    if (lowerResponse.includes("你不") && !lowerStimulus.includes("不")) {
      return "否定预设：在对方没有表达否定的情况下，预设了否定态度";
    }
    if (this.containsAny(lowerResponse, ["至于吗", "想多了", "太敏感"])) {
      return "情绪否定：否定对方感受的合理性，认为对方反应过度";
    }
    if (this.containsAny(lowerResponse, ["我没有", "不是"]) && lowerStimulus.length > 10) {
      return "防御性倾听：只听到攻击，没听到对方的真实需求";
    }

    if (this.semanticGap(stimulus, response)) {
      return "信息差：双方关注的重点不在同一层面，导致对话错位";
    }

    return "";
  }

  private semanticGap(a: string, b: string): boolean {
    const wordsA = new Set(a.split(/[，。？！\s]+/).filter((w) => w.length > 1));
    const wordsB = new Set(b.split(/[，。？！\s]+/).filter((w) => w.length > 1));
    let common = 0;
    for (const w of wordsA) {
      if (wordsB.has(w)) common++;
    }
    return common < Math.min(wordsA.size, wordsB.size) * 0.2;
  }

  private inferIntention(text: string, speaker: "A" | "B"): string {
    const lower = text.toLowerCase();

    if (this.containsAny(lower, ["为什么", "怎么", "什么意思"])) {
      return "想要了解情况、获得解释";
    }
    if (this.containsAny(lower, ["我觉得", "我感觉", "我希望"])) {
      return "想要表达自己的感受和需求";
    }
    if (this.containsAny(lower, ["能不能", "可以吗", "行不行"])) {
      return "想要提出请求或达成某种协议";
    }
    if (this.containsAny(lower, ["对不起", "抱歉", "我错了"])) {
      return "想要道歉、修复关系";
    }
    if (this.containsAny(lower, ["我需要", "我想要"])) {
      return "想要满足某种需求";
    }

    return "试图表达某种观点或感受";
  }

  private inferPerception(response: string, stimulus: string): string {
    const lowerResponse = response.toLowerCase();

    if (this.containsAny(lowerResponse, ["你是说", "你的意思是", "所以你觉得"])) {
      return "将对方的话理解为某种指责或攻击";
    }
    if (this.containsAny(lowerResponse, ["我没有", "不是我"])) {
      return "感到被指责，启动防御模式";
    }
    if (this.containsAny(lowerResponse, ["你总是", "你从来"])) {
      return "将对方的具体行为泛化为对自己的否定";
    }
    if (this.containsAny(lowerResponse, ["算了", "随便"])) {
      return "觉得沟通无效，产生放弃的念头";
    }

    return "可能将对方的话理解为对自己的否定或攻击";
  }

  private identifyMissingContext(a: string, b: string): string | undefined {
    if (a.includes("因为") && !b.includes("因为")) {
      return "回应方没有考虑到对方提到的原因或背景";
    }
    if (a.includes("我之前") && !b.includes("之前")) {
      return "回应方忽略了对方提到的过往经历";
    }
    if (a.length > b.length * 2) {
      return "回应方可能没有完整接收到或理解对方表达的全部信息";
    }
    return undefined;
  }

  private identifyOrigin(dialogue: RelationshipInput["dialogue"]): string {
    if (dialogue.length === 0) return "无法追溯";

    const firstTurn = dialogue[0];
    const firstText = firstTurn.content.toLowerCase();

    if (this.containsAny(firstText, ["我们谈谈", "有件事", "我想跟你说"])) {
      return `${firstTurn.speaker === "A" ? "A" : "B"}想要讨论某个问题，但沟通方式触发了防御`;
    }
    if (this.containsAny(firstText, ["为什么", "怎么回事", "你刚才"])) {
      return `${firstTurn.speaker === "A" ? "A" : "B"}的提问被对方理解为指责`;
    }
    if (this.containsAny(firstText, ["你总是", "你从来", "每次都"])) {
      return `${firstTurn.speaker === "A" ? "A" : "B"}用绝对化的表达开场，引发对方抵触`;
    }
    if (this.containsAny(firstText, ["我觉得很", "我有点", "我不开心"])) {
      return `${firstTurn.speaker === "A" ? "A" : "B"}尝试表达感受，但对方没有接收到情绪信号`;
    }

    return "对话初期就出现了情绪触发，但具体原因需要结合更多背景";
  }

  private describeReinforcementLoop(
    chainA: ParticipantTriggerChain,
    chainB: ParticipantTriggerChain
  ): string {
    const aEmotion = chainA.dominantEmotion;
    const bEmotion = chainB.dominantEmotion;
    const aTrigger = chainA.primaryTrigger;
    const bTrigger = chainB.primaryTrigger;
    const hasASpoken = chainA.chain.length > 0;
    const hasBSpoken = chainB.chain.length > 0;

    if (!hasASpoken || !hasBSpoken) {
      const missing = !hasASpoken ? chainA.name : chainB.name;
      return `目前只有一方发言，无法完整分析互动模式。请确保 ${missing} 也有对话记录，这样才能看到完整的循环模式。`;
    }

    const displayATrigger =
      aTrigger && aTrigger !== "无明显触发点" ? `「${aTrigger}」` : "某些信号";
    const displayBTrigger =
      bTrigger && bTrigger !== "无明显触发点" ? `「${bTrigger}」` : "某些信号";
    const displayAEmotion = aEmotion && aEmotion !== "平静" ? `「${aEmotion}」` : "负面情绪";
    const displayBEmotion = bEmotion && bEmotion !== "平静" ? `「${bEmotion}」` : "负面情绪";

    if (aEmotion === "愤怒" && bEmotion === "愤怒") {
      return `双方进入「以牙还牙」循环：${chainA.name} 被 ${displayBTrigger} 触发愤怒，用攻击性语言回应；${chainB.name} 又被 ${displayATrigger} 触发更大的愤怒。每一轮对话都在给对方的火上浇油。`;
    }
    if ((aEmotion === "被忽视" || aEmotion === "不被重视") && bEmotion === "愤怒") {
      return `「追逃模式」形成：${chainA.name} 觉得 ${displayATrigger} 感到被忽视，想要靠近和沟通；${chainB.name} 感受到压力和指责，用 ${displayBTrigger} 表达愤怒和推开。一个追一个逃，距离越来越远。`;
    }
    if ((bEmotion === "被忽视" || bEmotion === "不被重视") && aEmotion === "愤怒") {
      return `「追逃模式」形成：${chainB.name} 觉得 ${displayBTrigger} 感到被忽视，想要靠近和沟通；${chainA.name} 感受到压力和指责，用 ${displayATrigger} 表达愤怒和推开。一个追一个逃，距离越来越远。`;
    }
    if (aEmotion === "被误解" && bEmotion === "被误解") {
      return `「鸡同鸭讲」循环：双方都觉得自己不被理解，都在努力解释自己，但没有人在听对方说什么。每一次解释都被对方当成辩解。`;
    }

    return `双方形成相互触发的循环：${chainA.name} 的 ${displayATrigger} 触发了 ${chainB.name} 的 ${displayBEmotion}，${chainB.name} 的 ${displayBTrigger} 又反过来触发 ${chainA.name} 的 ${displayAEmotion}。每一轮对话都在强化对方的负面感受。`;
  }

  private generateAlternativeInterpretation(input: RelationshipInput): string {
    const participantA = input.participantA.name || "A";
    const participantB = input.participantB.name || "B";

    return `也许 ${participantA} 并不是想要攻击${participantB}，只是 TA 自己也被情绪淹没，不知道怎么表达；而 ${participantB} 的反应也不是针对${participantA}本人，只是 TA 的旧伤被触碰到了。两个受伤的人在试图保护自己的同时，不小心伤害了对方。`;
  }

  private generateSystemInsight(
    chainA: ParticipantTriggerChain,
    chainB: ParticipantTriggerChain,
    escalationPath: EscalationStep[]
  ): string {
    const hasASpoken = chainA.chain.length > 0;
    const hasBSpoken = chainB.chain.length > 0;
    const totalEscalation = escalationPath.reduce((sum, s) => sum + Math.max(0, s.intensityChange), 0);
    const aBugs = chainA.coreBugs.map((b) => b.bug.name).join("、");
    const bBugs = chainB.coreBugs.map((b) => b.bug.name).join("、");

    let insight = `这不是谁对谁错的问题，而是两个认知系统在互动过程中产生的「系统级 Bug」。\n\n`;

    if (hasASpoken) {
      const aTriggerText =
        chainA.primaryTrigger && chainA.primaryTrigger !== "无明显触发点"
          ? `被「${chainA.primaryTrigger}」触发`
          : "被某些信号触发";
      const aEmotionText =
        chainA.dominantEmotion && chainA.dominantEmotion !== "平静"
          ? `产生了「${chainA.dominantEmotion}」的情绪`
          : "产生了情绪反应";
      insight += `${chainA.name} 的认知系统${aTriggerText}，启动了${aBugs ? `「${aBugs}」模式，` : "某种认知保护模式，"}${aEmotionText}；\n\n`;
    }

    if (hasBSpoken) {
      const bTriggerText =
        chainB.primaryTrigger && chainB.primaryTrigger !== "无明显触发点"
          ? `被「${chainB.primaryTrigger}」触发`
          : "被某些信号触发";
      const bEmotionText =
        chainB.dominantEmotion && chainB.dominantEmotion !== "平静"
          ? `产生了「${chainB.dominantEmotion}」的情绪`
          : "产生了情绪反应";
      insight += `与此同时，${chainB.name} 的认知系统${bTriggerText}，启动了${bBugs ? `「${bBugs}」模式，` : "某种认知保护模式，"}${bEmotionText}。\n\n`;
    }

    if (totalEscalation > 5 && escalationPath.length > 0) {
      insight += `在 ${escalationPath.length} 轮互动中，情绪强度持续上升，形成了正反馈循环。双方都觉得是对方先攻击自己，都觉得自己是受害者。\n\n`;
    }

    insight += `系统视角下，真正的问题不是「谁错了」，而是：\n`;
    insight += `1. 双方的「情绪按钮」在什么位置被触碰了？\n`;
    insight += `2. 各自启动了什么「认知保护程序」？\n`;
    insight += `3. 这些保护程序如何互相伤害？\n\n`;
    insight += `当你能看到这个系统，你就不再需要在「谁对谁错」里浪费能量。`;

    return insight;
  }

  private generateSuggestions(
    chainA: ParticipantTriggerChain,
    chainB: ParticipantTriggerChain,
    misunderstanding: MisunderstandingFormation
  ): string[] {
    const suggestions: string[] = [];

    suggestions.push(
      `按下暂停键：在情绪上头时，先停下来。告诉对方「我现在有点激动，需要 10 分钟冷静一下，然后我们再谈」，而不是继续互相伤害。`
    );

    if (misunderstanding.points.length > 0) {
      suggestions.push(
        `检验理解，不要急着回应：下次对方说话后，先复述一遍「你刚才说的是...对吗？」，确认自己理解了再回应。很多争吵都源于「我以为我懂了」。`
      );
    }

    if (chainA.primaryTrigger === chainB.primaryTrigger) {
      suggestions.push(
        `识别共同的敏感点：你们都对「${chainA.primaryTrigger}」特别敏感。这是你们的共同「雷区」，下次可以提前约定：当某一方踩到这个雷区时，另一方如何温柔提醒。`
      );
    }

    const hasStonewalling = chainA.chain.some((n) => n.content.length < 10) ||
                            chainB.chain.some((n) => n.content.length < 10);
    if (hasStonewalling) {
      suggestions.push(
        `打破追逃循环：如果一方习惯沉默回避，另一方习惯追问指责，可以约定「回避方需要在 24 小时内回来沟通」，同时「追问方需要给对方空间，不要穷追不舍」。`
      );
    }

    suggestions.push(
      `用「我信息」代替「你信息」：把「你总是...」换成「当...发生时，我感到...因为我需要...」。表达感受而不是指责，对方才不会启动防御。`
    );

    suggestions.push(
      `把「对方是问题」换成「我们共同面对一个问题」：站在同一战线，而不是对立面。`
    );

    return suggestions;
  }

  private simulateFuturePaths(
    input: RelationshipInput,
    chainA: ParticipantTriggerChain,
    chainB: ParticipantTriggerChain,
    escalationPath: EscalationStep[],
    misunderstanding: MisunderstandingFormation
  ): RelationshipSimulationResult {
    const nameA = input.participantA.name || "A";
    const nameB = input.participantB.name || "B";

    const totalEscalation = escalationPath.reduce((sum, s) => sum + Math.max(0, s.intensityChange), 0);
    const hasStonewalling = chainA.chain.some((n) => n.content.length < 10) ||
                            chainB.chain.some((n) => n.content.length < 10);
    const sameTrigger = chainA.primaryTrigger === chainB.primaryTrigger && chainA.primaryTrigger !== "无明显触发点";
    const bothAngry = (chainA.dominantEmotion === "愤怒") && (chainB.dominantEmotion === "愤怒");
    const bothMisunderstood = (chainA.dominantEmotion === "被误解") && (chainB.dominantEmotion === "被误解");
    const hasManyMisunderstandings = misunderstanding.points.length >= 2;

    let deteriorationProb = 0.35;
    let repairProb = 0.15;
    let driftingProb = 0.25;
    let boundaryProb = 0.1;
    let stagnationProb = 0.15;

    if (bothAngry || totalEscalation > 8) {
      deteriorationProb += 0.2;
      repairProb -= 0.05;
    }
    if (hasStonewalling) {
      driftingProb += 0.15;
      repairProb -= 0.05;
    }
    if (sameTrigger) {
      repairProb += 0.1;
      boundaryProb += 0.1;
    }
    if (hasManyMisunderstandings || bothMisunderstood) {
      repairProb += 0.05;
      stagnationProb += 0.05;
    }

    const total = deteriorationProb + repairProb + driftingProb + boundaryProb + stagnationProb;
    deteriorationProb = Math.round((deteriorationProb / total) * 100);
    repairProb = Math.round((repairProb / total) * 100);
    driftingProb = Math.round((driftingProb / total) * 100);
    boundaryProb = Math.round((boundaryProb / total) * 100);
    stagnationProb = 100 - deteriorationProb - repairProb - driftingProb - boundaryProb;

    const baselineHealth = Math.max(5, Math.round(65 - totalEscalation * 3 - (hasStonewalling ? 15 : 0)));

    const paths: RelationshipFuturePath[] = [
      this.buildDeteriorationPath(nameA, nameB, chainA, chainB, misunderstanding, deteriorationProb, baselineHealth),
      this.buildRepairPath(nameA, nameB, chainA, chainB, misunderstanding, repairProb, baselineHealth),
      this.buildDriftingApartPath(nameA, nameB, chainA, chainB, misunderstanding, driftingProb, baselineHealth),
      this.buildBoundaryRebuildPath(nameA, nameB, chainA, chainB, misunderstanding, boundaryProb, baselineHealth),
      this.buildStagnationPath(nameA, nameB, chainA, chainB, misunderstanding, stagnationProb, baselineHealth),
    ];

    paths.sort((a, b) => b.probability - a.probability);

    return {
      paths,
      baselineHealthScore: baselineHealth,
      selectedPathId: paths[0]?.id,
    };
  }

  private buildDeteriorationPath(
    nameA: string,
    nameB: string,
    chainA: ParticipantTriggerChain,
    chainB: ParticipantTriggerChain,
    misunderstanding: MisunderstandingFormation,
    probability: number,
    baseline: number
  ): RelationshipFuturePath {
    const trigger = chainA.primaryTrigger !== "无明显触发点" ? chainA.primaryTrigger : "某件小事";
    const steps: RelationshipStep[] = [];

    steps.push(this.createStep("det-1", 1, "A", nameA,
      `又一次因为${trigger}发生了类似的争执`,
      `觉得 ${nameB} 永远不会改变，还是老样子`,
      "失望", 7, "累积怨恨", true,
      this.generateReplacements("A", nameA, nameB, trigger, "deterioration")
    ));

    steps.push(this.createStep("det-2", 1, "B", nameB,
      `反唇相讥：每次都是你的问题`,
      `觉得 ${nameA} 在找茬，根本不想好好沟通`,
      "愤怒", 8, "以牙还牙"
    ));

    steps.push(this.createStep("det-3", 2, "A", nameA,
      `冷战了两天，谁也不理谁`,
      `觉得这段关系越来越没意思，很累`,
      "麻木", 6, "回避退缩"
    ));

    steps.push(this.createStep("det-4", 2, "B", nameB,
      `开始和朋友吐槽 ${nameA} 的种种不是`,
      `在外界获得认同，更加坚信自己没错`,
      "委屈", 7, "三角化"
    ));

    steps.push(this.createStep("det-5", 3, "A", nameA,
      `发现 ${nameB} 在背后说自己，更加心寒`,
      `原来在 TA 心里我就是这样的人`,
      "绝望", 9, "信任崩塌", true,
      this.generateReplacements("A", nameA, nameB, "信任问题", "deterioration")
    ));

    steps.push(this.createStep("det-6", 3, "B", nameB,
      `既然你这样想，那就算了吧`,
      `破罐子破摔，不想再做任何努力`,
      "放弃", 8, "关系破裂边缘"
    ));

    return {
      id: "deterioration",
      name: "继续恶化",
      icon: "🌋",
      description: "如果不做任何改变，当前的互动模式会持续强化负面循环，每一次冲突都在消耗关系存量",
      probability,
      steps,
      finalOutcome: `经过3-6个月的持续消耗，双方从「彼此在意」变成「彼此防御」，再变成「彼此伤害」。${nameA} 会觉得越来越不被理解，${nameB} 会觉得越来越被指责。最终要么爆发一次大争吵后决裂，要么变成同住一个屋檐下的陌生人。`,
      overallTone: "negative",
      relationshipHealthScore: Math.max(5, baseline - 35),
    };
  }

  private buildRepairPath(
    nameA: string,
    nameB: string,
    chainA: ParticipantTriggerChain,
    chainB: ParticipantTriggerChain,
    misunderstanding: MisunderstandingFormation,
    probability: number,
    baseline: number
  ): RelationshipFuturePath {
    const trigger = chainA.primaryTrigger !== "无明显触发点" ? chainA.primaryTrigger : "某个敏感话题";
    const steps: RelationshipStep[] = [];

    steps.push(this.createStep("rep-1", 1, "A", nameA,
      `又一次因为${trigger}产生分歧，但这次 ${nameA} 先停了下来`,
      `意识到我们又在重复老模式，这样下去不行`,
      "觉察", 4, "暂停键", true,
      this.generateReplacements("A", nameA, nameB, trigger, "repair")
    ));

    steps.push(this.createStep("rep-2", 1, "B", nameB,
      `（有些意外）你今天怎么不跟我吵了？`,
      `感觉气氛不太一样，有点不习惯但也松了口气`,
      "困惑", 3, "模式打破"
    ));

    steps.push(this.createStep("rep-3", 2, "A", nameA,
      `我刚才说话语气不好，对不起。其实我是觉得...`,
      `先承认自己的部分，再表达真实感受，而不是指责`,
      "坦诚", 3, "脆弱暴露"
    ));

    steps.push(this.createStep("rep-4", 2, "B", nameB,
      `其实我也有不对的地方，我不该那样说你`,
      `看到 TA 的坦诚，自己也放下了防御`,
      "释然", 3, "对等回应", true,
      this.generateReplacements("B", nameB, nameA, "道歉回应", "repair")
    ));

    steps.push(this.createStep("rep-5", 3, "A", nameA,
      `下次当我又开始说「你总是」的时候，你可以提醒我`,
      `主动建立一个「信号」，在模式启动时互相提醒`,
      "希望", 2, "预防性约定"
    ));

    steps.push(this.createStep("rep-6", 3, "B", nameB,
      `好，那我如果又开始冷战，你也可以说「我们待会再谈」`,
      `第一次觉得我们是站在同一边的`,
      "信任", 2, "同盟建立"
    ));

    return {
      id: "repair",
      name: "关系修复",
      icon: "🌱",
      description: "如果有一方能先觉察并打破惯性，用脆弱代替防御，关系有机会进入修复循环，每一次小修复都在积累信任",
      probability,
      steps,
      finalOutcome: `接下来的3个月里，虽然还会有冲突，但 ${nameA} 和 ${nameB} 学会了「暂停-修复」的新节奏。每一次修复都让他们更了解彼此的「雷区」，也更确信「就算吵架也不会散」。关系不会回到最初的样子，但会变成更成熟、更有韧性的版本。`,
      overallTone: "positive",
      relationshipHealthScore: Math.min(95, baseline + 30),
    };
  }

  private buildDriftingApartPath(
    nameA: string,
    nameB: string,
    chainA: ParticipantTriggerChain,
    chainB: ParticipantTriggerChain,
    misunderstanding: MisunderstandingFormation,
    probability: number,
    baseline: number
  ): RelationshipFuturePath {
    const steps: RelationshipStep[] = [];

    steps.push(this.createStep("drift-1", 1, "A", nameA,
      `算了，说了你也不懂，不说了`,
      `反正沟通也没用，不如省点力气`,
      "无奈", 6, "情感抽离", true,
      this.generateReplacements("A", nameA, nameB, "沟通放弃", "drifting")
    ));

    steps.push(this.createStep("drift-2", 1, "B", nameB,
      `随便你怎么想吧`,
      `懒得解释了，TA 爱怎么想怎么想`,
      "冷漠", 6, "双双回避"
    ));

    steps.push(this.createStep("drift-3", 2, "A", nameA,
      `开始花更多时间在工作/朋友/手机上，减少和 ${nameB} 的独处时间`,
      `不是故意的，只是和 TA 待在一起觉得压抑`,
      "疏离", 5, "注意力转移"
    ));

    steps.push(this.createStep("drift-4", 2, "B", nameB,
      `也找到了自己的事情做，不太关心 ${nameA} 每天在干嘛`,
      `一个人反而更清净，不用吵架挺好的`,
      "麻木", 4, "平行生活"
    ));

    steps.push(this.createStep("drift-5", 3, "A", nameA,
      `发现今天一天没和 ${nameB} 说上十句话，居然也没什么感觉`,
      `最熟悉的陌生人，大概就是这个意思吧`,
      "空心", 5, "情感联结断裂", true,
      this.generateReplacements("A", nameA, nameB, "关系淡漠", "drifting")
    ));

    steps.push(this.createStep("drift-6", 3, "B", nameB,
      `表面上相安无事，但再也回不到从前了`,
      `不是恨，是无所谓，这可能更糟`,
      "悲凉", 5, "关系荒漠化"
    ));

    return {
      id: "drifting_apart",
      name: "逐渐疏远",
      icon: "🌫️",
      description: "如果双方都觉得「沟通太累」，选择回避而不是面对，冲突会减少，但情感联结也会慢慢断裂",
      probability,
      steps,
      finalOutcome: `6-12个月后，${nameA} 和 ${nameB} 可能变成「最熟悉的陌生人」。吵架少了，但关心也少了。他们会在同一个空间里过着平行的生活，对外可能还是「好好的一对」，但内心都清楚——有些重要的东西，已经悄悄死掉了。`,
      overallTone: "negative",
      relationshipHealthScore: Math.max(15, baseline - 20),
    };
  }

  private buildBoundaryRebuildPath(
    nameA: string,
    nameB: string,
    chainA: ParticipantTriggerChain,
    chainB: ParticipantTriggerChain,
    misunderstanding: MisunderstandingFormation,
    probability: number,
    baseline: number
  ): RelationshipFuturePath {
    const trigger = chainB.primaryTrigger !== "无明显触发点" ? chainB.primaryTrigger : "过度干涉";
    const steps: RelationshipStep[] = [];

    steps.push(this.createStep("bound-1", 1, "A", nameA,
      `当 ${nameB} 又开始指责时，${nameA} 平静地说：我需要你换一种方式跟我说`,
      `不再被情绪带着走，而是明确表达自己的边界`,
      "坚定", 4, "边界建立", true,
      this.generateReplacements("A", nameA, nameB, trigger, "boundary")
    ));

    steps.push(this.createStep("bound-2", 1, "B", nameB,
      `（愣住）你什么意思？难道我说错了吗？`,
      `不习惯被这样对待，有点受挫但也在思考`,
      "惊讶", 5, "边界挑战"
    ));

    steps.push(this.createStep("bound-3", 2, "A", nameA,
      `我不是说你错，我是说这种说话方式让我很受伤。我需要我们都平静了再谈`,
      `区分「事情本身」和「沟通方式」，不攻击人只说感受`,
      "清醒", 3, "非防御性表达"
    ));

    steps.push(this.createStep("bound-4", 2, "B", nameB,
      `（沉默了一会）...好吧，刚才我语气确实不好。那我们待会再说`,
      `第一次遇到 TA 不接招的情况，反而不知道怎么继续生气了`,
      "思考", 3, "尊重边界", true,
      this.generateReplacements("B", nameB, nameA, "边界回应", "boundary")
    ));

    steps.push(this.createStep("bound-5", 3, "A", nameA,
      `之后每次遇到类似情况，都用同样的方式回应，不例外`,
      `边界不是说一次就管用，而是每次都要守住`,
      "稳定", 3, "边界强化"
    ));

    steps.push(this.createStep("bound-6", 3, "B", nameB,
      `慢慢学会了在 TA 说「需要空间」的时候停下来，不再追着吵`,
      `原来有些话，等一等再说，结果会完全不一样`,
      "成熟", 2, "内化新规则"
    ));

    return {
      id: "boundary_rebuild",
      name: "重新建立边界",
      icon: "🛡️",
      description: "如果有一方能坚定而温和地设立边界，并且每一次都守住，关系会重新找到健康的互动距离",
      probability,
      steps,
      finalOutcome: `3-6个月后，${nameA} 和 ${nameB} 之间的互动会变得更「有规矩」。${nameA} 不再觉得自己总是被侵犯，${nameB} 也不再觉得自己总是被排斥。关系不一定会变得更亲密，但会变得更尊重、更可持续。有时候，「有边界的亲密」比「没有边界的纠缠」更长久。`,
      overallTone: "positive",
      relationshipHealthScore: Math.min(90, baseline + 22),
    };
  }

  private buildStagnationPath(
    nameA: string,
    nameB: string,
    chainA: ParticipantTriggerChain,
    chainB: ParticipantTriggerChain,
    misunderstanding: MisunderstandingFormation,
    probability: number,
    baseline: number
  ): RelationshipFuturePath {
    const steps: RelationshipStep[] = [];

    steps.push(this.createStep("stag-1", 1, "A", nameA,
      `吵完之后又和好了，但问题其实没解决`,
      `为了不吵下去，选择各让一步，但心里还是有疙瘩`,
      "压抑", 5, "表面和解", true,
      this.generateReplacements("A", nameA, nameB, "问题搁置", "stagnation")
    ));

    steps.push(this.createStep("stag-2", 1, "B", nameB,
      `算了，不提了，反正提了又要吵`,
      `多一事不如少一事，就这样吧`,
      "隐忍", 5, "心照不宣"
    ));

    steps.push(this.createStep("stag-3", 2, "A", nameA,
      `同样的问题又出现了，心里咯噔一下`,
      `果然还是这个样子，真的会改变吗？`,
      "怀疑", 6, "历史重演"
    ));

    steps.push(this.createStep("stag-4", 2, "B", nameB,
      `又来...随便应付一下吧`,
      `已经习惯了这个循环，懒得再投入情绪了`,
      "倦怠", 5, "习得性无助", true,
      this.generateReplacements("B", nameB, nameA, "循环倦怠", "stagnation")
    ));

    steps.push(this.createStep("stag-5", 3, "A", nameA,
      `好的时候挺好的，但一遇到问题就还是老样子`,
      `不知道这算不算「好」，只是已经习惯了`,
      "矛盾", 5, "爱恨交织"
    ));

    steps.push(this.createStep("stag-6", 3, "B", nameB,
      `就这么过吧，好像也没什么不能接受的`,
      `不是特别好，但也不算特别糟，大多数关系不都这样吗`,
      "接受", 4, "低水平稳定"
    ));

    return {
      id: "stagnation",
      name: "停滞僵持",
      icon: "⏳",
      description: "如果每次冲突都「和稀泥」式地过去，真正的问题从未被触碰，关系会陷入既不好也不坏的停滞状态",
      probability,
      steps,
      finalOutcome: `很长一段时间里，${nameA} 和 ${nameB} 的关系会维持在「不好不坏」的状态。有甜蜜的时候，但那些重复出现的问题会像房间里的大象，明明存在但谁也不去提。这种状态可能持续很多年，直到某次重大事件——要么让关系彻底崩塌，要么终于逼两个人面对真正的问题。`,
      overallTone: "neutral",
      relationshipHealthScore: baseline - 5,
    };
  }

  private createStep(
    id: string,
    round: number,
    speaker: "A" | "B",
    speakerName: string,
    action: string,
    interpretation: string,
    emotion: string,
    emotionIntensity: number,
    mechanism: string,
    isReplaceable = false,
    replacementOptions?: RelationshipReplacementOption[]
  ): RelationshipStep {
    return {
      id,
      round,
      speaker,
      speakerName,
      action,
      interpretation,
      emotion,
      emotionIntensity,
      mechanism,
      isReplaceable,
      replacementOptions,
    };
  }

  private generateReplacements(
    speaker: "A" | "B",
    speakerName: string,
    otherName: string,
    context: string,
    pathType: string
  ): RelationshipReplacementOption[] {
    const replacements: Record<string, RelationshipReplacementOption[]> = {
      deterioration: [
        {
          id: `rep-${speaker}-1`,
          content: `先停一下，我现在有点激动，我们10分钟后再谈`,
          interpretation: `意识到自己在情绪脑模式，先按下暂停键而不是继续伤害`,
          emotion: "克制",
          emotionIntensity: 3,
          description: "先撤退出冲突场景，等理智回来再沟通",
        },
        {
          id: `rep-${speaker}-2`,
          content: `我刚才那样说你，肯定让你很难受吧？对不起`,
          interpretation: `先承认自己的攻击，而不是继续辩解自己为什么对`,
          emotion: "柔软",
          emotionIntensity: 2,
          description: "先对人道歉，再讨论事情对错",
        },
        {
          id: `rep-${speaker}-3`,
          content: `我不是要攻击你，我是真的觉得很委屈/很担心...`,
          interpretation: `把指责换成「说自己的感受」，对方就不会启动防御`,
          emotion: "坦诚",
          emotionIntensity: 3,
          description: "用「我信息」代替「你信息」",
        },
      ],
      repair: [
        {
          id: `rep-${speaker}-4`,
          content: `等等，我发现我们又在重复之前的模式了`,
          interpretation: `跳出来看互动，而不是陷在「你错我对」里`,
          emotion: "觉察",
          emotionIntensity: 2,
          description: "说出正在发生的模式本身，就是打破模式的第一步",
        },
        {
          id: `rep-${speaker}-5`,
          content: `其实我最怕的是你觉得我不够好...`,
          interpretation: `说出「软」的部分，而不是用「硬」的态度保护自己`,
          emotion: "脆弱",
          emotionIntensity: 3,
          description: "真正的亲密来自敢展示脆弱，而不是一直假装强大",
        },
        {
          id: `rep-${speaker}-6`,
          content: `我需要一点时间消化，明天我们好好说，可以吗？`,
          interpretation: `不说「算了」，而是说「我们换个时间认真谈」`,
          emotion: "尊重",
          emotionIntensity: 2,
          description: "区分「回避」和「延后处理」的关键是：你还会回来",
        },
      ],
      drifting: [
        {
          id: `rep-${speaker}-7`,
          content: `我知道我又想说「算了」了，但我不想我们就这样越来越远`,
          interpretation: `承认自己在抽离，也承认自己其实在乎`,
          emotion: "真实",
          emotionIntensity: 3,
          description: "说出来就不会在沉默中积累越来越多的失望",
        },
        {
          id: `rep-${speaker}-8`,
          content: `我们周末找个时间，不吵架，就聊聊最近各自在想什么？`,
          interpretation: `主动创造一个「非冲突」的连接场景，而不是等着它消失`,
          emotion: "主动",
          emotionIntensity: 2,
          description: "疏离不是一天造成的，重新连接也需要刻意为之",
        },
        {
          id: `rep-${speaker}-9`,
          content: `我今天好想你，想跟你说说话`,
          interpretation: `不用等「合适的时机」，也不用等一个「重要的话题」`,
          emotion: "柔软",
          emotionIntensity: 2,
          description: "有时候最小的连接，能阻止最大的疏远",
        },
      ],
      boundary: [
        {
          id: `rep-${speaker}-10`,
          content: `我不会在被指责的时候讨论这件事，你冷静了我们再谈`,
          interpretation: `明确告诉对方「什么情况下我不奉陪」，但不攻击 TA`,
          emotion: "坚定",
          emotionIntensity: 3,
          description: "边界不是惩罚对方，是保护自己",
        },
        {
          id: `rep-${speaker}-11`,
          content: `我理解你很着急，但你用这种语气我听不进去`,
          interpretation: `先接住对方的情绪，再说明自己的规则`,
          emotion: "平和",
          emotionIntensity: 2,
          description: "共情 + 边界，是最强的组合",
        },
        {
          id: `rep-${speaker}-12`,
          content: `这件事我需要自己做决定，但我会告诉你结果`,
          interpretation: `区分「我的事」和「我们的事」，不因为亲密就失去自我`,
          emotion: "清晰",
          emotionIntensity: 2,
          description: "好的关系是两个完整的圆相交，不是两个半圆拼在一起",
        },
      ],
      stagnation: [
        {
          id: `rep-${speaker}-13`,
          content: `这件事我觉得我们还没说透，能不能再聊聊？`,
          interpretation: `主动提起那个「大家都在回避」的话题，而不是让它烂在心里`,
          emotion: "勇气",
          emotionIntensity: 4,
          description: "舒服的表面下面，可能藏着让关系慢慢死掉的东西",
        },
        {
          id: `rep-${speaker}-14`,
          content: `每次都是这样过去，我有点累了。我们能不能换一种方式？`,
          interpretation: `承认「现状不对」，而不是说服自己「大多数人都这样」`,
          emotion: "真诚",
          emotionIntensity: 3,
          description: "不满足于「还好」，才有可能走向「更好」",
        },
        {
          id: `rep-${speaker}-15`,
          content: `我有一个害怕的事...我怕我们就这样一直耗下去`,
          interpretation: `把最深的担忧说出来，而不是一个人在心里反复想`,
          emotion: "诚实",
          emotionIntensity: 4,
          description: "你愿意坦诚的深度，决定了关系能到达的深度",
        },
      ],
    };

    return replacements[pathType] || replacements.deterioration;
  }

  public resimulatePathWithReplacement(
    result: RelationshipDebugResult,
    pathId: FuturePathType,
    stepId: string,
    replacement: RelationshipReplacementOption
  ): RelationshipSimulationResult | null {
    if (!result.simulation) return null;

    const originalPath = result.simulation.paths.find((p) => p.id === pathId);
    if (!originalPath) return null;

    const nameA = result.input.participantA.name || "A";
    const nameB = result.input.participantB.name || "B";

    const newSteps = this.transformStepsAfterReplacement(
      originalPath.steps,
      stepId,
      replacement,
      nameA,
      nameB
    );

    const newHealthScore = Math.min(95, originalPath.relationshipHealthScore + 25);

    const modifiedPath: RelationshipFuturePath = {
      ...originalPath,
      id: pathId,
      name: `${originalPath.name}（已调整）`,
      steps: newSteps,
      relationshipHealthScore: newHealthScore,
      overallTone: newHealthScore >= 60 ? "positive" : newHealthScore >= 40 ? "neutral" : "negative",
      finalOutcome: this.generateAdjustedOutcome(originalPath.finalOutcome, nameA, nameB, replacement),
    };

    const newPaths = result.simulation.paths.map((p) =>
      p.id === pathId ? modifiedPath : p
    );
    newPaths.sort((a, b) => b.probability - a.probability);

    return {
      ...result.simulation,
      paths: newPaths,
      modifiedPathId: pathId,
      originalPathId: pathId,
    };
  }

  private transformStepsAfterReplacement(
    originalSteps: RelationshipStep[],
    triggerStepId: string,
    replacement: RelationshipReplacementOption,
    nameA: string,
    nameB: string
  ): RelationshipStep[] {
    const newSteps: RelationshipStep[] = [];
    let transformMode = false;

    for (let i = 0; i < originalSteps.length; i++) {
      const step = originalSteps[i];

      if (step.id === triggerStepId) {
        transformMode = true;

        newSteps.push({
          ...step,
          id: `modified-${step.id}`,
          action: replacement.content,
          interpretation: replacement.interpretation,
          emotion: replacement.emotion,
          emotionIntensity: replacement.emotionIntensity,
          mechanism: "✨ 认知转折点",
          isReplaceable: false,
        });
        continue;
      }

      if (transformMode) {
        newSteps.push(this.transformStepPositively(step, i, nameA, nameB));
      } else {
        newSteps.push({ ...step });
      }
    }

    return newSteps;
  }

  private transformStepPositively(
    step: RelationshipStep,
    index: number,
    nameA: string,
    nameB: string
  ): RelationshipStep {
    const otherName = step.speaker === "A" ? nameB : nameA;

    const positiveActions: Record<string, string[]> = {
      "愤怒": [
        `深吸一口气，没有像往常一样反击，而是说：你说的我听到了，给我一点时间想想`,
        `意识到 ${otherName} 不是在攻击，只是 TA 也受伤了，决定先接住而不是推回去`,
        `停下来问自己：我现在想要的是「赢」，还是想要「我们好」？`,
      ],
      "失望": [
        `虽然还是有点难过，但愿意给彼此一个重新来的机会`,
        `发现 ${otherName} 其实在努力了，决定把注意力放在「变了的部分」而不是「没变的部分」`,
        `告诉自己：改变是一点点发生的，不要要求对方一步到位`,
      ],
      "麻木": [
        `发现自己又开始「无所谓」模式，主动拉回注意力`,
        `不再用沉默惩罚对方，而是用语言说出自己的状态`,
        `试着找一个小的、具体的事，重建和 ${otherName} 的连接`,
      ],
      "冷漠": [
        `意识到自己又在筑墙，决定给对方留一扇门`,
        `没有把对方推开，而是说：我现在有点乱，但我不想不理你`,
        `愿意先迈出一小步，而不是等对方先动`,
      ],
      "委屈": [
        `把心里的委屈用平静的方式说了出来，而不是憋着或者爆发`,
        `意识到 ${otherName} 可能根本不知道 TA 造成了这种感受`,
        `选择相信对方不是故意的，给 TA 了解自己的机会`,
      ],
      "绝望": [
        `想起对方好的时候，告诉自己：现在这个状态不是全部`,
        `相信每一段关系都有周期，低谷不代表终点`,
        `决定做那个先伸手的人，哪怕只是一点点`,
      ],
      "放弃": [
        `把「就这样吧」换成「再试一次吧」`,
        `不甘心关系就这么结束，愿意为它再投入一次`,
        `告诉自己：就算最后还是不行，至少我认真努力过了`,
      ],
      "疏离": [
        `主动和 ${otherName} 分享了一件今天发生的小事`,
        `不再把心门完全关上，留了一条缝让光可以进来`,
        `问了 ${otherName} 一个问题，认真听 TA 回答，而不是在心里评判`,
      ],
      "倦怠": [
        `打破习惯的力量，做一件和平时不一样的小事`,
        `刻意去发现 ${otherName} 身上一个自己好久没注意到的优点`,
        `给自己和关系都注入一点新鲜的东西，而不是任由惯性带着走`,
      ],
      "怀疑": [
        `不急于下结论，而是再观察观察，再等等看`,
        `拿现在和最糟糕的时候比，而不是和最好的时候比`,
        `相信改变是曲线上升，不是直线上升`,
      ],
      "隐忍": [
        `不再把话吞下去，而是用「我觉得...」的方式表达了一部分`,
        `意识到「为了和平而压抑」并不是真的和平`,
        `相信 ${otherName} 有承受自己真实情绪的能力`,
      ],
      "矛盾": [
        `把矛盾的感觉说出来：我有时候觉得很近，有时候又觉得很远`,
        `接受关系可以是复杂的，不是非黑即白的`,
        `允许自己慢慢来，不用立刻做「离开还是留下」的决定`,
      ],
      "接受": [
        `接受现状，但不停止尝试让它变得更好一点点`,
        `把「大多数人都这样」换成「我们可以不一样」`,
        `决定主动创造一些新的、好的记忆，而不是只靠旧的活着`,
      ],
      "惊讶": [
        `从「你什么意思」变成「你愿意说说吗」`,
        `意识到自己一直以来的方式可能真的有问题，愿意调整`,
        `把惊讶变成好奇，而不是防御`,
      ],
      "思考": [
        `认真想了想 TA 说的话，发现确实有道理`,
        `第一次从对方的角度去看整件事`,
        `意识到「我是对的」没有「我们是好的」重要`,
      ],
      "悲凉": [
        `跟 ${otherName} 说了自己的这种感觉，而不是一个人扛着`,
        `做了一个很小的、温暖的举动，打破了那种冰冷的气氛`,
        `相信「感觉」是会变的，只要两个人还愿意动一动`,
      ],
      "空心": [
        `做了一个很具体的动作：拉了拉 ${otherName} 的手 / 给了一个拥抱`,
        `重新发现了那些「不重要但温暖」的小事的价值`,
        `不再追求「轰轰烈烈」，开始珍惜「平平凡凡的在意」`,
      ],
    };

    const defaultActions = [
      `感受到了和之前不一样的气氛，决定用新的方式回应`,
      `看到 ${otherName} 的改变，自己也愿意做出调整`,
      `原来真的，一个人变了，另一个人也会跟着变`,
    ];

    const actionPool = positiveActions[step.emotion] || defaultActions;
    const newAction = actionPool[index % actionPool.length];

    const positiveInterpretations = [
      `这和之前的剧本不一样了...也许真的可以不一样`,
      `原来换一种方式，会得到完全不同的回应`,
      `那个小小的改变，像一颗种子一样在发芽`,
      `第一次觉得，我们是站在同一边的`,
      `不是关系的问题，是方式的问题`,
      `之前怎么没想到呢？其实就这么简单`,
    ];

    const positiveEmotions = ["释然", "柔软", "希望", "信任", "温暖", "安心", "感恩"];
    const positiveMechanisms = [
      "涟漪效应", "正向强化", "信任重建", "循环打破",
      "共情连接", "安全氛围形成", "新习惯建立",
    ];

    return {
      id: `transformed-${step.id}`,
      round: step.round,
      speaker: step.speaker,
      speakerName: step.speakerName,
      action: newAction,
      interpretation: positiveInterpretations[index % positiveInterpretations.length],
      emotion: positiveEmotions[index % positiveEmotions.length],
      emotionIntensity: Math.max(1, step.emotionIntensity - Math.floor(index / 2) - 2),
      mechanism: positiveMechanisms[index % positiveMechanisms.length],
      isReplaceable: false,
    };
  }

  private generateAdjustedOutcome(
    originalOutcome: string,
    nameA: string,
    nameB: string,
    replacement: RelationshipReplacementOption
  ): string {
    return `当 ${nameA} 和 ${nameB} 其中一方，在那个最关键的节点——${replacement.content.slice(0, 12)}...——选择了「不一样的做法」，整个剧本的走向就改变了。${originalOutcome.split('。')[0]}不再是唯一的可能。蝴蝶扇动了一下翅膀，未来的路径就已经分叉。你看，改变不需要惊天动地，只需要在那个「老模式快要启动」的瞬间，多一点点觉察，多一点点勇气。剩下的，交给「涟漪效应」。`;
  }
}

export function createRelationshipAnalyzer(allBugs: CognitiveBug[]): RelationshipAnalyzer {
  return new RelationshipAnalyzer(allBugs);
}
