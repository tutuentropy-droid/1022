import { User, Users } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { cn } from "../lib/utils";
import type { DebugMode } from "../types/bug";

const modes: { id: DebugMode; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: "single",
    label: "单人模式",
    desc: "分析你自己的想法和认知偏差",
    icon: <User className="w-4 h-4" />,
  },
  {
    id: "relationship",
    label: "关系 Debug",
    desc: "分析两个人的对话与冲突模式",
    icon: <Users className="w-4 h-4" />,
  },
];

export function ModeSelector() {
  const { debugMode, setDebugMode, clearResults, clearRelationshipResults } = useAppStore();

  const handleModeChange = (mode: DebugMode) => {
    if (mode !== debugMode) {
      clearResults();
      clearRelationshipResults();
      setDebugMode(mode);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex rounded-xl bg-museum-wallLight/30 p-1 border border-museum-gold/10">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => handleModeChange(mode.id)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1.5 px-4 py-3 rounded-lg transition-all duration-300",
              debugMode === mode.id
                ? "bg-museum-gold/20 text-museum-gold border border-museum-gold/30 shadow-inner"
                : "text-museum-paper/50 hover:text-museum-paper/70 hover:bg-museum-wallLight/20"
            )}
          >
            {mode.icon}
            <span className="text-sm font-medium">{mode.label}</span>
            <span className="text-[10px] opacity-70">{mode.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
