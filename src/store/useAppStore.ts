import { create } from "zustand";
import bugsData from "../data/bugs.json";
import type { BugMatchResult, CognitiveBug } from "../types/bug";
import { createBugMatcher } from "../services/bugMatcher";

const STORAGE_KEY = "cognitive-bug-museum-state";

interface PersistedState {
  userInput: string;
  matchResults: BugMatchResult[];
}

function loadPersistedState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    return {
      userInput: parsed.userInput || "",
      matchResults: Array.isArray(parsed.matchResults) ? parsed.matchResults : [],
    };
  } catch {
    return null;
  }
}

function persistState(state: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function clearPersistedState() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

interface AppState {
  allBugs: CognitiveBug[];
  userInput: string;
  matchResults: BugMatchResult[];
  isLoading: boolean;
  expandedBugId: string | null;
  matcherType: "keyword" | "ai";
  hasScanned: boolean;

  setUserInput: (input: string) => void;
  analyzeThought: () => Promise<void>;
  setExpandedBugId: (id: string | null) => void;
  toggleBugExpansion: (id: string) => void;
  clearResults: () => void;
  setMatcherType: (type: "keyword" | "ai") => void;
}

const persisted = loadPersistedState();

export const useAppStore = create<AppState>((set, get) => ({
  allBugs: bugsData as CognitiveBug[],
  userInput: persisted?.userInput ?? "",
  matchResults: persisted?.matchResults ?? [],
  isLoading: false,
  expandedBugId: null,
  matcherType: "keyword",
  hasScanned: !!(persisted && (persisted.userInput || persisted.matchResults.length > 0)),

  setUserInput: (input) => {
    set({ userInput: input });
    persistState({
      userInput: input,
      matchResults: get().matchResults,
    });
  },

  analyzeThought: async () => {
    const { userInput, allBugs, matcherType } = get();
    if (!userInput.trim()) return;

    set({ isLoading: true, matchResults: [], expandedBugId: null, hasScanned: true });

    try {
      const matcher = createBugMatcher(matcherType);
      const results = await matcher.match(userInput, allBugs);
      set({ matchResults: results });
      persistState({
        userInput,
        matchResults: results,
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      set({ matchResults: [] });
      persistState({
        userInput,
        matchResults: [],
      });
    } finally {
      set({ isLoading: false });
    }
  },

  setExpandedBugId: (id) => set({ expandedBugId: id }),

  toggleBugExpansion: (id) =>
    set((state) => ({
      expandedBugId: state.expandedBugId === id ? null : id,
    })),

  clearResults: () => {
    set({
      matchResults: [],
      userInput: "",
      expandedBugId: null,
      hasScanned: false,
    });
    clearPersistedState();
  },

  setMatcherType: (type) => set({ matcherType: type }),
}));
