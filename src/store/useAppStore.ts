import { create } from "zustand";
import bugsData from "../data/bugs.json";
import type {
  BugMatchResult,
  CognitiveBug,
  BugChain,
  DebugMode,
  RelationshipInput,
  RelationshipDebugResult,
  RelationshipSimulationResult,
  FuturePathType,
  RelationshipReplacementOption,
} from "../types/bug";
import type { PersonalityProfile, PersonalityArchetype, BigFiveDimension } from "../types/personality";
import { createBugMatcher } from "../services/bugMatcher";
import { buildBugChain } from "../services/chainBuilder";
import { createProfileFromArchetype } from "../services/personalityService";
import { ARCHETYPES } from "../types/personality";
import { createRelationshipAnalyzer } from "../services/relationshipAnalyzer";

const STORAGE_KEY = "cognitive-bug-museum-state";

interface PersistedState {
  userInput: string;
  matchResults: BugMatchResult[];
  personalityProfile?: PersonalityProfile;
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
      personalityProfile: parsed.personalityProfile,
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
  bugChain: BugChain | null;
  isLoading: boolean;
  expandedBugId: string | null;
  matcherType: "keyword" | "ai";
  hasScanned: boolean;
  personalityProfile: PersonalityProfile;
  selectedArchetype: PersonalityArchetype;

  debugMode: DebugMode;
  relationshipInput: RelationshipInput;
  relationshipResult: RelationshipDebugResult | null;
  isRelationshipLoading: boolean;
  hasScannedRelationship: boolean;

  simulation: RelationshipSimulationResult | null;
  simulationBaseline: RelationshipSimulationResult | null;
  simulationSelectedPathId: FuturePathType | null;
  simulationIsModified: boolean;

  setUserInput: (input: string) => void;
  analyzeThought: () => Promise<void>;
  setExpandedBugId: (id: string | null) => void;
  toggleBugExpansion: (id: string) => void;
  clearResults: () => void;
  setMatcherType: (type: "keyword" | "ai") => void;
  setPersonalityArchetype: (archetype: PersonalityArchetype) => void;
  setPersonalityDimension: (dimension: BigFiveDimension, value: number) => void;
  setPersonalityProfile: (profile: PersonalityProfile) => void;

  setDebugMode: (mode: DebugMode) => void;
  setRelationshipParticipant: (role: "A" | "B", field: "name" | "description", value: string) => void;
  setRelationshipScenario: (scenario: string) => void;
  addDialogueTurn: (speaker: "A" | "B", content: string) => void;
  updateDialogueTurn: (index: number, content: string) => void;
  removeDialogueTurn: (index: number) => void;
  clearDialogue: () => void;
  analyzeRelationship: () => Promise<void>;
  clearRelationshipResults: () => void;

  setSimulation: (simulation: RelationshipSimulationResult) => void;
  setSimulationSelectedPathId: (pathId: FuturePathType | null) => void;
  resimulateWithReplacement: (
    pathId: FuturePathType,
    stepId: string,
    replacement: RelationshipReplacementOption
  ) => void;
  resetSimulation: () => void;
}

const persisted = loadPersistedState();
const initialBugs = bugsData as CognitiveBug[];
const initialMatchResults = persisted?.matchResults ?? [];
const initialPersonalityProfile = persisted?.personalityProfile ?? createProfileFromArchetype("the_balanced");
const initialBugChain = initialMatchResults.length > 0
  ? buildBugChain(initialMatchResults, initialBugs, initialPersonalityProfile)
  : null;

const initialRelationshipInput: RelationshipInput = {
  participantA: { name: "A", description: "" },
  participantB: { name: "B", description: "" },
  scenario: "",
  dialogue: [],
};

export const useAppStore = create<AppState>((set, get) => ({
  allBugs: initialBugs,
  userInput: persisted?.userInput ?? "",
  matchResults: initialMatchResults,
  bugChain: initialBugChain,
  isLoading: false,
  expandedBugId: null,
  matcherType: "keyword",
  hasScanned: !!(persisted && (persisted.userInput || persisted.matchResults.length > 0)),
  personalityProfile: initialPersonalityProfile,
  selectedArchetype: initialPersonalityProfile.archetype ?? "the_balanced",

  debugMode: "single",
  relationshipInput: initialRelationshipInput,
  relationshipResult: null,
  isRelationshipLoading: false,
  hasScannedRelationship: false,

  simulation: null,
  simulationBaseline: null,
  simulationSelectedPathId: null,
  simulationIsModified: false,

  setUserInput: (input) => {
    set({ userInput: input });
    persistState({
      userInput: input,
      matchResults: get().matchResults,
      personalityProfile: get().personalityProfile,
    });
  },

  analyzeThought: async () => {
    const { userInput, allBugs, matcherType, personalityProfile } = get();
    if (!userInput.trim()) return;

    set({ isLoading: true, matchResults: [], bugChain: null, expandedBugId: null, hasScanned: true });

    try {
      const matcher = createBugMatcher(matcherType);
      const results = await matcher.match(userInput, allBugs);
      const chain = buildBugChain(results, allBugs, personalityProfile);
      set({ matchResults: results, bugChain: chain });
      persistState({
        userInput,
        matchResults: results,
        personalityProfile: get().personalityProfile,
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      set({ matchResults: [], bugChain: null });
      persistState({
        userInput,
        matchResults: [],
        personalityProfile: get().personalityProfile,
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
      bugChain: null,
      userInput: "",
      expandedBugId: null,
      hasScanned: false,
    });
    clearPersistedState();
  },

  setMatcherType: (type) => set({ matcherType: type }),

  setPersonalityArchetype: (archetype) => {
    const profile = createProfileFromArchetype(archetype);
    set({ personalityProfile: profile, selectedArchetype: archetype });
    persistState({
      userInput: get().userInput,
      matchResults: get().matchResults,
      personalityProfile: profile,
    });
    const { matchResults, allBugs } = get();
    if (matchResults.length > 0) {
      const chain = buildBugChain(matchResults, allBugs, profile);
      set({ bugChain: chain });
    }
  },

  setPersonalityDimension: (dimension, value) => {
    set((state) => {
      const newProfile: PersonalityProfile = {
        ...state.personalityProfile,
        dimensions: {
          ...state.personalityProfile.dimensions,
          [dimension]: value,
        },
        archetype: "custom",
      };
      persistState({
        userInput: get().userInput,
        matchResults: get().matchResults,
        personalityProfile: newProfile,
      });
      const { matchResults, allBugs } = get();
      if (matchResults.length > 0) {
        const chain = buildBugChain(matchResults, allBugs, newProfile);
        return { personalityProfile: newProfile, selectedArchetype: "custom", bugChain: chain };
      }
      return { personalityProfile: newProfile, selectedArchetype: "custom" };
    });
  },

  setPersonalityProfile: (profile) => {
    set({ personalityProfile: profile, selectedArchetype: profile.archetype ?? "custom" });
    persistState({
      userInput: get().userInput,
      matchResults: get().matchResults,
      personalityProfile: profile,
    });
    const { matchResults, allBugs } = get();
    if (matchResults.length > 0) {
      const chain = buildBugChain(matchResults, allBugs, profile);
      set({ bugChain: chain });
    }
  },

  setDebugMode: (mode) => set({ debugMode: mode }),

  setRelationshipParticipant: (role, field, value) =>
    set((state) => {
      const key = role === "A" ? "participantA" : "participantB";
      return {
        relationshipInput: {
          ...state.relationshipInput,
          [key]: {
            ...state.relationshipInput[key],
            [field]: value,
          },
        },
      };
    }),

  setRelationshipScenario: (scenario) =>
    set((state) => ({
      relationshipInput: {
        ...state.relationshipInput,
        scenario,
      },
    })),

  addDialogueTurn: (speaker, content) =>
    set((state) => ({
      relationshipInput: {
        ...state.relationshipInput,
        dialogue: [
          ...state.relationshipInput.dialogue,
          { speaker, content, timestamp: Date.now() },
        ],
      },
    })),

  updateDialogueTurn: (index, content) =>
    set((state) => {
      const newDialogue = [...state.relationshipInput.dialogue];
      if (newDialogue[index]) {
        newDialogue[index] = { ...newDialogue[index], content };
      }
      return {
        relationshipInput: {
          ...state.relationshipInput,
          dialogue: newDialogue,
        },
      };
    }),

  removeDialogueTurn: (index) =>
    set((state) => ({
      relationshipInput: {
        ...state.relationshipInput,
        dialogue: state.relationshipInput.dialogue.filter((_, i) => i !== index),
      },
    })),

  clearDialogue: () =>
    set((state) => ({
      relationshipInput: {
        ...state.relationshipInput,
        dialogue: [],
      },
    })),

  analyzeRelationship: async () => {
    const { relationshipInput, allBugs } = get();
    if (relationshipInput.dialogue.length < 2) return;

    set({
      isRelationshipLoading: true,
      relationshipResult: null,
      hasScannedRelationship: true,
      simulation: null,
      simulationBaseline: null,
      simulationSelectedPathId: null,
      simulationIsModified: false,
    });

    try {
      const analyzer = createRelationshipAnalyzer(allBugs);
      const result = await analyzer.analyze(relationshipInput);
      set({
        relationshipResult: result,
        simulation: result.simulation || null,
        simulationBaseline: result.simulation || null,
        simulationSelectedPathId: result.simulation?.selectedPathId || null,
        simulationIsModified: false,
      });
    } catch (error) {
      console.error("Relationship analysis failed:", error);
      set({ relationshipResult: null, simulation: null, simulationBaseline: null });
    } finally {
      set({ isRelationshipLoading: false });
    }
  },

  clearRelationshipResults: () => {
    set({
      relationshipResult: null,
      hasScannedRelationship: false,
      relationshipInput: initialRelationshipInput,
      simulation: null,
      simulationBaseline: null,
      simulationSelectedPathId: null,
      simulationIsModified: false,
    });
  },

  setSimulation: (simulation) => {
    set({ simulation });
    if (simulation.selectedPathId) {
      set({ simulationSelectedPathId: simulation.selectedPathId });
    }
  },

  setSimulationSelectedPathId: (pathId) => {
    set({ simulationSelectedPathId: pathId });
  },

  resimulateWithReplacement: (pathId, stepId, replacement) => {
    const { relationshipResult, allBugs } = get();
    if (!relationshipResult) return;

    const analyzer = createRelationshipAnalyzer(allBugs);
    const newSimulation = analyzer.resimulatePathWithReplacement(
      relationshipResult,
      pathId,
      stepId,
      replacement
    );

    if (newSimulation) {
      set({
        simulation: newSimulation,
        simulationSelectedPathId: pathId,
        simulationIsModified: true,
      });
    }
  },

  resetSimulation: () => {
    const { simulationBaseline } = get();
    if (simulationBaseline) {
      set({
        simulation: simulationBaseline,
        simulationSelectedPathId: simulationBaseline.selectedPathId || null,
        simulationIsModified: false,
      });
    }
  },
}));
