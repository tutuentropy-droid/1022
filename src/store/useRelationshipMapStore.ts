import { create } from "zustand";
import type {
  Relationship,
  InteractionLog,
  RelationshipCategory,
  PatternFrequency,
  CategoryStats,
  RelationshipStatus,
} from "../types/relationshipMap";
import {
  commonRelationshipPatterns,
} from "../types/relationshipMap";

const STORAGE_KEY = "relationship-personality-map";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function detectPatterns(text: string): string[] {
  const detected: string[] = [];
  const lowerText = text.toLowerCase();

  for (const pattern of commonRelationshipPatterns) {
    for (const keyword of pattern.bugKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        detected.push(pattern.name);
        break;
      }
    }
  }

  return detected;
}

function calculateStatus(healthScore: number, trend: number): RelationshipStatus {
  if (trend > 5) return "improving";
  if (trend < -5) return "deteriorating";
  if (healthScore > 0) return "stable";
  return "unknown";
}

function loadPersistedState(): {
  relationships: Relationship[];
  interactions: InteractionLog[];
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      relationships: Array.isArray(parsed.relationships) ? parsed.relationships : [],
      interactions: Array.isArray(parsed.interactions) ? parsed.interactions : [],
    };
  } catch {
    return null;
  }
}

function persistState(state: {
  relationships: Relationship[];
  interactions: InteractionLog[];
}) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

interface RelationshipMapState {
  relationships: Relationship[];
  interactions: InteractionLog[];
  selectedRelationshipId: string | null;
  isAddModalOpen: boolean;
  isLogModalOpen: boolean;
  editingRelationship: Relationship | null;

  addRelationship: (data: {
    personName: string;
    category: RelationshipCategory;
    description?: string;
    startDate?: string;
    initialHealth?: number;
  }) => void;

  updateRelationship: (
    id: string,
    data: Partial<Omit<Relationship, "id" | "createdAt" | "updatedAt">>
  ) => void;

  deleteRelationship: (id: string) => void;

  addInteraction: (data: {
    relationshipId: string;
    summary: string;
    dialogue?: string;
    healthScore: number;
    emotion: string;
    emotionIntensity: number;
    notes?: string;
    wasPositive: boolean;
  }) => void;

  deleteInteraction: (id: string) => void;

  setSelectedRelationshipId: (id: string | null) => void;
  setIsAddModalOpen: (open: boolean) => void;
  setIsLogModalOpen: (open: boolean) => void;
  setEditingRelationship: (rel: Relationship | null) => void;

  getRelationshipInteractions: (relationshipId: string) => InteractionLog[];
  getPatternFrequencies: (options?: { category?: RelationshipCategory }) => PatternFrequency[];
  getCategoryStats: () => CategoryStats[];
  getRelationshipTrend: (relationshipId: string, days?: number) => number;
  getTopPatterns: (limit?: number) => PatternFrequency[];
  getOverallStats: () => {
    totalRelationships: number;
    totalInteractions: number;
    averageHealth: number;
    improvingCount: number;
    deterioratingCount: number;
    stableCount: number;
  };
}

const persisted = loadPersistedState();

export const useRelationshipMapStore = create<RelationshipMapState>((set, get) => ({
  relationships: persisted?.relationships ?? [],
  interactions: persisted?.interactions ?? [],
  selectedRelationshipId: null,
  isAddModalOpen: false,
  isLogModalOpen: false,
  editingRelationship: null,

  addRelationship: (data) => {
    const now = Date.now();
    const newRelationship: Relationship = {
      id: generateId(),
      personName: data.personName,
      category: data.category,
      description: data.description,
      startDate: data.startDate,
      createdAt: now,
      updatedAt: now,
      currentHealthScore: data.initialHealth ?? 50,
      status: "unknown",
    };

    set((state) => {
      const newState = {
        ...state,
        relationships: [...state.relationships, newRelationship],
      };
      persistState({
        relationships: newState.relationships,
        interactions: newState.interactions,
      });
      return newState;
    });
  },

  updateRelationship: (id, data) => {
    set((state) => {
      const newRelationships = state.relationships.map((r) =>
        r.id === id ? { ...r, ...data, updatedAt: Date.now() } : r
      );
      const newState = { ...state, relationships: newRelationships };
      persistState({
        relationships: newState.relationships,
        interactions: newState.interactions,
      });
      return newState;
    });
  },

  deleteRelationship: (id) => {
    set((state) => {
      const newState = {
        relationships: state.relationships.filter((r) => r.id !== id),
        interactions: state.interactions.filter((i) => i.relationshipId !== id),
      };
      persistState(newState);
      return newState;
    });
  },

  addInteraction: (data) => {
    const now = Date.now();
    const fullText = (data.summary + " " + (data.dialogue || "") + " " + (data.notes || "")).toLowerCase();
    const patterns = detectPatterns(fullText);

    const prevInteractions = get().interactions.filter(
      (i) => i.relationshipId === data.relationshipId
    );
    const prevScore =
      prevInteractions.length > 0
        ? prevInteractions[prevInteractions.length - 1].healthScore
        : get().relationships.find((r) => r.id === data.relationshipId)?.currentHealthScore ?? 50;

    const scoreChange = data.healthScore - prevScore;

    const newInteraction: InteractionLog = {
      id: generateId(),
      relationshipId: data.relationshipId,
      date: now,
      summary: data.summary,
      dialogue: data.dialogue,
      healthScore: data.healthScore,
      healthScoreChange: scoreChange,
      detectedBugIds: [],
      bugNames: patterns,
      patterns: patterns,
      emotion: data.emotion,
      emotionIntensity: data.emotionIntensity,
      notes: data.notes,
      wasPositive: data.wasPositive,
    };

    const trend = get().getRelationshipTrend(data.relationshipId);
    const newStatus = calculateStatus(data.healthScore, trend + scoreChange * 0.3);

    set((state) => {
      const newInteractions = [...state.interactions, newInteraction];
      const newRelationships = state.relationships.map((r) =>
        r.id === data.relationshipId
          ? {
              ...r,
              currentHealthScore: data.healthScore,
              status: newStatus,
              updatedAt: now,
            }
          : r
      );
      const newState = {
        ...state,
        interactions: newInteractions,
        relationships: newRelationships,
      };
      persistState({
        relationships: newState.relationships,
        interactions: newState.interactions,
      });
      return newState;
    });
  },

  deleteInteraction: (id) => {
    const interaction = get().interactions.find((i) => i.id === id);
    if (!interaction) return;

    set((state) => {
      const newInteractions = state.interactions.filter((i) => i.id !== id);

      const relInteractions = newInteractions.filter(
        (i) => i.relationshipId === interaction.relationshipId
      );
      const lastScore =
        relInteractions.length > 0
          ? relInteractions[relInteractions.length - 1].healthScore
          : 50;

      const trend = relInteractions.length >= 2
        ? relInteractions[relInteractions.length - 1].healthScore -
          relInteractions[0].healthScore
        : 0;
      const newStatus = calculateStatus(lastScore, trend);

      const newRelationships = state.relationships.map((r) =>
        r.id === interaction.relationshipId
          ? { ...r, currentHealthScore: lastScore, status: newStatus, updatedAt: Date.now() }
          : r
      );

      const newState = {
        ...state,
        interactions: newInteractions,
        relationships: newRelationships,
      };
      persistState({
        relationships: newState.relationships,
        interactions: newState.interactions,
      });
      return newState;
    });
  },

  setSelectedRelationshipId: (id) => set({ selectedRelationshipId: id }),
  setIsAddModalOpen: (open) => set({ isAddModalOpen: open }),
  setIsLogModalOpen: (open) => set({ isLogModalOpen: open }),
  setEditingRelationship: (rel) => set({ editingRelationship: rel }),

  getRelationshipInteractions: (relationshipId) => {
    return get()
      .interactions.filter((i) => i.relationshipId === relationshipId)
      .sort((a, b) => a.date - b.date);
  },

  getPatternFrequencies: (options) => {
    const { interactions, relationships } = get();
    const patternMap = new Map<string, PatternFrequency>();

    const filteredInteractions = options?.category
      ? interactions.filter((i) => {
          const rel = relationships.find((r) => r.id === i.relationshipId);
          return rel?.category === options.category;
        })
      : interactions;

    for (const interaction of filteredInteractions) {
      const rel = relationships.find((r) => r.id === interaction.relationshipId);
      if (!rel) continue;

      for (const patternName of interaction.patterns) {
        const existing = patternMap.get(patternName);
        if (existing) {
          existing.count++;
          if (
            rel.category &&
            !existing.relationshipCategories.includes(rel.category)
          ) {
            existing.relationshipCategories.push(rel.category);
          }
          if (interaction.date < existing.firstOccurrence) {
            existing.firstOccurrence = interaction.date;
          }
          if (interaction.date > existing.lastOccurrence) {
            existing.lastOccurrence = interaction.date;
          }
        } else {
          patternMap.set(patternName, {
            patternName,
            count: 1,
            relationshipCategories: [rel.category],
            firstOccurrence: interaction.date,
            lastOccurrence: interaction.date,
          });
        }
      }
    }

    return Array.from(patternMap.values()).sort((a, b) => b.count - a.count);
  },

  getCategoryStats: () => {
    const { relationships, interactions } = get();
    const categories: RelationshipCategory[] = [
      "intimate",
      "work",
      "family",
      "friend",
      "acquaintance",
    ];

    return categories.map((category) => {
      const catRelationships = relationships.filter(
        (r) => r.category === category
      );
      const catInteractions = interactions.filter((i) => {
        const rel = relationships.find((r) => r.id === i.relationshipId);
        return rel?.category === category;
      });

      const avgHealth =
        catRelationships.length > 0
          ? catRelationships.reduce((sum, r) => sum + r.currentHealthScore, 0) /
            catRelationships.length
          : 0;

      const overallTrend =
        catInteractions.length > 0
          ? catInteractions.reduce((sum, i) => sum + i.healthScoreChange, 0) /
            catInteractions.length
          : 0;

      const patternMap = new Map<string, number>();
      for (const interaction of catInteractions) {
        for (const pattern of interaction.patterns) {
          patternMap.set(pattern, (patternMap.get(pattern) || 0) + 1);
        }
      }

      const topPatterns: PatternFrequency[] = Array.from(patternMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({
          patternName: name,
          count,
          relationshipCategories: [category],
          firstOccurrence: 0,
          lastOccurrence: 0,
        }));

      return {
        category,
        relationshipCount: catRelationships.length,
        totalInteractions: catInteractions.length,
        averageHealthScore: avgHealth,
        topPatterns,
        overallTrend,
      };
    }).filter((s) => s.relationshipCount > 0 || s.totalInteractions > 0);
  },

  getRelationshipTrend: (relationshipId, days = 30) => {
    const interactions = get()
      .interactions.filter((i) => i.relationshipId === relationshipId)
      .sort((a, b) => a.date - b.date);

    if (interactions.length < 2) return 0;

    const now = Date.now();
    const cutoff = now - days * 24 * 60 * 60 * 1000;

    const recentInteractions = interactions.filter((i) => i.date >= cutoff);
    if (recentInteractions.length < 2) {
      return (
        interactions[interactions.length - 1].healthScore - interactions[0].healthScore
      );
    }

    return (
      recentInteractions[recentInteractions.length - 1].healthScore -
      recentInteractions[0].healthScore
    );
  },

  getTopPatterns: (limit = 5) => {
    return get().getPatternFrequencies().slice(0, limit);
  },

  getOverallStats: () => {
    const { relationships, interactions } = get();
    const avgHealth =
      relationships.length > 0
        ? relationships.reduce((sum, r) => sum + r.currentHealthScore, 0) /
          relationships.length
        : 0;

    return {
      totalRelationships: relationships.length,
      totalInteractions: interactions.length,
      averageHealth: Math.round(avgHealth),
      improvingCount: relationships.filter((r) => r.status === "improving").length,
      deterioratingCount: relationships.filter((r) => r.status === "deteriorating").length,
      stableCount: relationships.filter((r) => r.status === "stable").length,
    };
  },
}));
