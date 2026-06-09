import type {
  BugMatchResult,
  BugMatcher,
  CognitiveBug,
} from "../types/bug";

export class KeywordBugMatcher implements BugMatcher {
  async match(input: string, bugs: CognitiveBug[]): Promise<BugMatchResult[]> {
    const normalizedInput = this.normalize(input);
    if (!normalizedInput.trim()) {
      return [];
    }

    const results: BugMatchResult[] = [];

    for (const bug of bugs) {
      const matchedKeywords: string[] = [];

      for (const keyword of bug.keywords) {
        const normalizedKeyword = this.normalize(keyword);
        if (normalizedKeyword && normalizedInput.includes(normalizedKeyword)) {
          matchedKeywords.push(keyword);
        }
      }

      if (matchedKeywords.length > 0) {
        const matchScore = this.calculateScore(
          matchedKeywords,
          bug.keywords,
          normalizedInput
        );

        results.push({
          bug,
          matchScore,
          matchedKeywords,
          matchReason: this.generateReason(matchedKeywords, bug),
        });
      }
    }

    results.sort((a, b) => b.matchScore - a.matchScore);

    return results;
  }

  private normalize(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[，。！？、；：""''（）《》【】…—\s,.!?;:'"()\[\]<>_-]/g, "");
  }

  private calculateScore(
    matchedKeywords: string[],
    allKeywords: string[],
    input: string
  ): number {
    if (matchedKeywords.length === 0) return 0;

    const coverageRatio = matchedKeywords.length / Math.min(allKeywords.length, 5);
    let totalLengthScore = 0;

    for (const keyword of matchedKeywords) {
      const lengthRatio = Math.min(keyword.length / 6, 1);
      const frequency = this.countOccurrences(input, keyword);
      totalLengthScore += lengthRatio * Math.min(frequency, 2);
    }

    const lengthScore = totalLengthScore / matchedKeywords.length;
    const quantityBonus = Math.min(matchedKeywords.length * 0.08, 0.25);

    const score = Math.min(
      coverageRatio * 0.4 + lengthScore * 0.35 + quantityBonus + 0.15,
      1
    );

    return Math.round(score * 100) / 100;
  }

  private countOccurrences(text: string, keyword: string): number {
    if (!keyword) return 0;
    const regex = new RegExp(this.escapeRegex(keyword), "g");
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private generateReason(
    matchedKeywords: string[],
    bug: CognitiveBug
  ): string {
    if (matchedKeywords.length === 0) return "";

    const keywordList = matchedKeywords.slice(0, 3).join("、");
    return `检测到关键词「${keywordList}」，符合「${bug.name}」的典型表现模式。`;
  }
}

export class AIBugMatcher implements BugMatcher {
  private apiEndpoint?: string;
  private apiKey?: string;

  constructor(options?: { apiEndpoint?: string; apiKey?: string }) {
    this.apiEndpoint = options?.apiEndpoint;
    this.apiKey = options?.apiKey;
  }

  async match(input: string, bugs: CognitiveBug[]): Promise<BugMatchResult[]> {
    if (!this.apiEndpoint || !this.apiKey) {
      console.warn(
        "AI Bug Matcher: API endpoint or key not configured, falling back to keyword matcher"
      );
      const fallback = new KeywordBugMatcher();
      return fallback.match(input, bugs);
    }

    try {
      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          input,
          bugs: bugs.map((b) => ({
            id: b.id,
            name: b.name,
            description: b.description,
            examples: b.examples,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.matches || [];
    } catch (error) {
      console.error("AI Bug Matcher error:", error);
      const fallback = new KeywordBugMatcher();
      return fallback.match(input, bugs);
    }
  }
}

export function createBugMatcher(type: "keyword" | "ai" = "keyword"): BugMatcher {
  switch (type) {
    case "ai":
      return new AIBugMatcher();
    case "keyword":
    default:
      return new KeywordBugMatcher();
  }
}
