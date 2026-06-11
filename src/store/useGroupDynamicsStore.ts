import { create } from "zustand";
import type {
  Group,
  GroupMessage,
  GroupCategory,
  GroupDynamicsAnalysis,
  InputSourceType,
  GroupInputData,
} from "../types/groupDynamics";
import {
  parseChatContent,
  analyzeGroupDynamics,
  buildNetworkGraph,
} from "../services/groupDynamicsService";
import type { NetworkGraphData } from "../types/groupDynamics";

const STORAGE_KEY = "group-dynamics-store";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadPersistedState(): {
  groups: Group[];
  messages: GroupMessage[];
  inputRecords: GroupInputData[];
  analyses: Record<string, GroupDynamicsAnalysis>;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      groups: Array.isArray(parsed.groups) ? parsed.groups : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      inputRecords: Array.isArray(parsed.inputRecords) ? parsed.inputRecords : [],
      analyses: parsed.analyses || {},
    };
  } catch {
    return null;
  }
}

function persistState(state: {
  groups: Group[];
  messages: GroupMessage[];
  inputRecords: GroupInputData[];
  analyses: Record<string, GroupDynamicsAnalysis>;
}) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

interface GroupDynamicsState {
  groups: Group[];
  messages: GroupMessage[];
  inputRecords: GroupInputData[];
  analyses: Record<string, GroupDynamicsAnalysis>;
  selectedGroupId: string | null;
  isAddGroupModalOpen: boolean;
  isInputModalOpen: boolean;
  editingGroup: Group | null;

  addGroup: (data: {
    name: string;
    category: GroupCategory;
    description?: string;
  }) => Group;

  updateGroup: (
    id: string,
    data: Partial<Omit<Group, "id" | "createdAt" | "updatedAt">>
  ) => void;

  deleteGroup: (id: string) => void;

  addInputData: (data: {
    groupId: string;
    sourceType: InputSourceType;
    title?: string;
    rawContent: string;
  }) => GroupInputData;

  addMessage: (message: Omit<GroupMessage, "id">) => void;

  addMessages: (messages: Omit<GroupMessage, "id">[]) => void;

  getGroupMessages: (groupId: string) => GroupMessage[];

  getGroupAnalysis: (groupId: string) => GroupDynamicsAnalysis | null;

  runAnalysis: (groupId: string) => GroupDynamicsAnalysis | null;

  getNetworkGraph: (groupId: string) => NetworkGraphData | null;

  setSelectedGroupId: (id: string | null) => void;
  setIsAddGroupModalOpen: (open: boolean) => void;
  setIsInputModalOpen: (open: boolean) => void;
  setEditingGroup: (group: Group | null) => void;

  getOverallStats: () => {
    totalGroups: number;
    totalMembers: number;
    totalMessages: number;
    avgGroupHealth: number;
  };
}

const persisted = loadPersistedState();

export const useGroupDynamicsStore = create<GroupDynamicsState>((set, get) => ({
  groups: persisted?.groups ?? [],
  messages: persisted?.messages ?? [],
  inputRecords: persisted?.inputRecords ?? [],
  analyses: persisted?.analyses ?? {},
  selectedGroupId: null,
  isAddGroupModalOpen: false,
  isInputModalOpen: false,
  editingGroup: null,

  addGroup: (data) => {
    const now = Date.now();
    const newGroup: Group = {
      id: generateId(),
      name: data.name,
      category: data.category,
      description: data.description,
      members: [],
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
      overallHealth: 50,
    };

    set((state) => {
      const newGroups = [...state.groups, newGroup];
      const newState = { ...state, groups: newGroups };
      persistState({
        groups: newState.groups,
        messages: newState.messages,
        inputRecords: newState.inputRecords,
        analyses: newState.analyses,
      });
      return newState;
    });

    return newGroup;
  },

  updateGroup: (id, data) => {
    set((state) => {
      const newGroups = state.groups.map((g) =>
        g.id === id ? { ...g, ...data, updatedAt: Date.now() } : g
      );
      const newState = { ...state, groups: newGroups };
      persistState({
        groups: newState.groups,
        messages: newState.messages,
        inputRecords: newState.inputRecords,
        analyses: newState.analyses,
      });
      return newState;
    });
  },

  deleteGroup: (id) => {
    set((state) => {
      const newGroups = state.groups.filter((g) => g.id !== id);
      const newMessages = state.messages.filter((m) => m.groupId !== id);
      const newInputRecords = state.inputRecords.filter((r) => r.groupId !== id);
      const newAnalyses = { ...state.analyses };
      delete newAnalyses[id];

      const newState = {
        groups: newGroups,
        messages: newMessages,
        inputRecords: newInputRecords,
        analyses: newAnalyses,
      };
      persistState(newState);
      return newState;
    });
  },

  addInputData: (data) => {
    const { messages: parsedMessages, members: newMembers } = parseChatContent(
      data.groupId,
      data.rawContent
    );

    const now = Date.now();
    const inputRecord: GroupInputData = {
      groupId: data.groupId,
      sourceType: data.sourceType,
      title: data.title,
      rawContent: data.rawContent,
      parsedMessages,
      createdAt: now,
    };

    set((state) => {
      const group = state.groups.find((g) => g.id === data.groupId);
      if (!group) return state;

      const existingMemberMap = new Map(group.members.map((m) => [m.name, m]));
      const mergedMembers = [...group.members];
      for (const member of newMembers) {
        if (!existingMemberMap.has(member.name)) {
          mergedMembers.push(member);
        }
      }

      const newGroups = state.groups.map((g) =>
        g.id === data.groupId
          ? {
              ...g,
              members: mergedMembers,
              messageCount: g.messageCount + parsedMessages.length,
              updatedAt: now,
            }
          : g
      );

      const newMessages = [...state.messages, ...parsedMessages];
      const newInputRecords = [...state.inputRecords, inputRecord];

      const newState = {
        ...state,
        groups: newGroups,
        messages: newMessages,
        inputRecords: newInputRecords,
      };
      persistState({
        groups: newState.groups,
        messages: newState.messages,
        inputRecords: newState.inputRecords,
        analyses: newState.analyses,
      });
      return newState;
    });

    return inputRecord;
  },

  addMessage: (message) => {
    const newMessage: GroupMessage = {
      ...message,
      id: generateId(),
    };

    set((state) => {
      const newMessages = [...state.messages, newMessage];
      const newGroups = state.groups.map((g) =>
        g.id === message.groupId
          ? { ...g, messageCount: g.messageCount + 1, updatedAt: Date.now() }
          : g
      );
      const newState = { ...state, messages: newMessages, groups: newGroups };
      persistState({
        groups: newState.groups,
        messages: newState.messages,
        inputRecords: newState.inputRecords,
        analyses: newState.analyses,
      });
      return newState;
    });
  },

  addMessages: (messages) => {
    const newMessages = messages.map((m) => ({ ...m, id: generateId() }));

    set((state) => {
      const allMessages = [...state.messages, ...newMessages];

      const groupCounts = new Map<string, number>();
      for (const msg of newMessages) {
        groupCounts.set(
          msg.groupId,
          (groupCounts.get(msg.groupId) || 0) + 1
        );
      }

      const newGroups = state.groups.map((g) => {
        const count = groupCounts.get(g.id) || 0;
        if (count === 0) return g;
        return {
          ...g,
          messageCount: g.messageCount + count,
          updatedAt: Date.now(),
        };
      });

      const newState = {
        ...state,
        messages: allMessages,
        groups: newGroups,
      };
      persistState({
        groups: newState.groups,
        messages: newState.messages,
        inputRecords: newState.inputRecords,
        analyses: newState.analyses,
      });
      return newState;
    });
  },

  getGroupMessages: (groupId) => {
    return get()
      .messages.filter((m) => m.groupId === groupId)
      .sort((a, b) => a.timestamp - b.timestamp);
  },

  getGroupAnalysis: (groupId) => {
    return get().analyses[groupId] || null;
  },

  runAnalysis: (groupId) => {
    const state = get();
    const group = state.groups.find((g) => g.id === groupId);
    if (!group) return null;

    const messages = state.messages.filter((m) => m.groupId === groupId);
    if (messages.length === 0) return null;

    const analysis = analyzeGroupDynamics(group, messages);

    set((state) => {
      const newAnalyses = {
        ...state.analyses,
        [groupId]: analysis,
      };
      const newGroups = state.groups.map((g) =>
        g.id === groupId
          ? { ...g, overallHealth: analysis.overallHealth, updatedAt: Date.now() }
          : g
      );

      const newState = {
        ...state,
        analyses: newAnalyses,
        groups: newGroups,
      };
      persistState({
        groups: newState.groups,
        messages: newState.messages,
        inputRecords: newState.inputRecords,
        analyses: newState.analyses,
      });
      return newState;
    });

    return analysis;
  },

  getNetworkGraph: (groupId) => {
    const state = get();
    const group = state.groups.find((g) => g.id === groupId);
    if (!group) return null;

    const messages = state.messages.filter((m) => m.groupId === groupId);
    const analysis = state.analyses[groupId];

    if (!analysis || messages.length === 0) return null;

    return buildNetworkGraph(group.members, messages, analysis);
  },

  setSelectedGroupId: (id) => set({ selectedGroupId: id }),
  setIsAddGroupModalOpen: (open) => set({ isAddGroupModalOpen: open }),
  setIsInputModalOpen: (open) => set({ isInputModalOpen: open }),
  setEditingGroup: (group) => set({ editingGroup: group }),

  getOverallStats: () => {
    const { groups, messages, analyses } = get();

    let totalMembers = 0;
    let totalHealth = 0;
    let groupsWithHealth = 0;

    for (const group of groups) {
      totalMembers += group.members.length;
      const analysis = analyses[group.id];
      if (analysis) {
        totalHealth += analysis.overallHealth;
        groupsWithHealth++;
      }
    }

    return {
      totalGroups: groups.length,
      totalMembers,
      totalMessages: messages.length,
      avgGroupHealth: groupsWithHealth > 0 ? Math.round(totalHealth / groupsWithHealth) : 0,
    };
  },
}));
