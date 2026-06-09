import { create } from "zustand";
import bugsData from "../data/bugs.json";
import type { BugMatchResult, CognitiveBug } from "../types/bug";
import { createBugMatcher } from "../services/bugMatcher";

interface AppState {
  allBugs: CognitiveBug[];
  userInput: string;
  matchResults: BugMatchResult[];
  isLoading: boolean;
  expandedBugId: string | null;
  matcherType: "keyword" | "ai";

  setUserInput: (input: string) => void;
  analyzeThought: () => Promise<void>;
  setExpandedBugId: (id: string | null) => void;
  toggleBugExpansion: (id: string) => void;
  clearResults: () => void;
  setMatcherType: (type: "keyword" | "ai") => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  allBugs: bugsData as CognitiveBug[],
  userInput: "",
  matchResults: [],
  isLoading: false,
  expandedBugId: null,
  matcherType: "keyword",

  setUserInput: (input) => set({ userInput: input }),

  analyzeThought: async () => {
    const { userInput, allBugs, matcherType } = get();
    if (!userInput.trim()) return;

    set({ isLoading: true, matchResults: [], expandedBugId: null });

    try {
      const matcher = createBugMatcher(matcherType);
      const results = await matcher.match(userInput, allBugs);
      set({ matchResults: results });
    } catch (error) {
      console.error("Analysis failed:", error);
      set({ matchResults: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  setExpandedBugId: (id) => set({ expandedBugId: id }),

  toggleBugExpansion: (id) =>
    set((state) => ({
      expandedBugId: state.expandedBugId === id ? null : id,
    })),

  clearResults: () =>
    set({
      matchResults: [],
      userInput: "",
      expandedBugId: null,
    }),

  setMatcherType: (type) => set({ matcherType: type }),
}));
