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
    const chainA = await this.buildParticipantChain(input, "A");
    const chainB = await this.buildParticipantChain(input, "B");
    const escalationPath = this.buildEscalationPath(input, chainA, chainB);
    const misunderstanding = this.buildMisunderstandingFormation(input, chainA, chainB);
    const systemInsight = this.generateSystemInsight(chainA, chainB, escalationPath);
    const deEscalationSuggestions = this.generateSuggestions(chainA, chainB, misunderstanding);

    return {
      input,
      chainA,
      chainB,
      escalationPath,
      misunderstanding,
      systemInsight,
      deEscalationSuggestions,
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

    if (aEmotion === "愤怒" && bEmotion === "愤怒") {
      return `双方进入「以牙还牙」循环：A 被「${bTrigger}」触发愤怒，用攻击性语言回应；B 又被 A 的「${aTrigger}」触发更大的愤怒。每一轮对话都在给对方的火上浇油。`;
    }
    if ((aEmotion === "被忽视" || aEmotion === "不被重视") && bEmotion === "愤怒") {
      return `「追逃模式」形成：A 觉得「${aTrigger}」感到被忽视，想要靠近和沟通；B 感受到压力和指责，用「${bTrigger}」表达愤怒和推开。一个追一个逃，距离越来越远。`;
    }
    if ((bEmotion === "被忽视" || bEmotion === "不被重视") && aEmotion === "愤怒") {
      return `「追逃模式」形成：B 觉得「${bTrigger}」感到被忽视，想要靠近和沟通；A 感受到压力和指责，用「${aTrigger}」表达愤怒和推开。一个追一个逃，距离越来越远。`;
    }
    if (aEmotion === "被误解" && bEmotion === "被误解") {
      return `「鸡同鸭讲」循环：双方都觉得自己不被理解，都在努力解释自己，但没有人在听对方说什么。每一次解释都被对方当成辩解。`;
    }

    return `双方形成相互触发的循环：A 的「${aTrigger}」触发了 B 的「${bEmotion}」，B 的「${bTrigger}」又反过来触发 A 的「${aEmotion}」。每一轮对话都在强化对方的负面感受。`;
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
    const totalEscalation = escalationPath.reduce((sum, s) => sum + Math.max(0, s.intensityChange), 0);
    const aBugs = chainA.coreBugs.map((b) => b.bug.name).join("、");
    const bBugs = chainB.coreBugs.map((b) => b.bug.name).join("、");

    let insight = `这不是谁对谁错的问题，而是两个认知系统在互动过程中产生的「系统级 Bug」。\n\n`;
    insight += `${chainA.name} 的认知系统被「${chainA.primaryTrigger}」触发，启动了${aBugs ? `「${aBugs}」模式，` : ""}产生了强烈的「${chainA.dominantEmotion}」；\n\n`;
    insight += `与此同时，${chainB.name} 的认知系统被「${chainB.primaryTrigger}」触发，启动了${bBugs ? `「${bBugs}」模式，` : ""}也产生了强烈的「${chainB.dominantEmotion}」。\n\n`;

    if (totalEscalation > 5) {
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
}

export function createRelationshipAnalyzer(allBugs: CognitiveBug[]): RelationshipAnalyzer {
  return new RelationshipAnalyzer(allBugs);
}
