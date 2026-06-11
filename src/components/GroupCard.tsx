import { Users, MessageSquare, TrendingUp, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";
import type { Group } from "../types/groupDynamics";
import {
  groupCategoryLabels,
  groupCategoryColors,
} from "../types/groupDynamics";

interface GroupCardProps {
  group: Group;
  onClick?: () => void;
  compact?: boolean;
}

export function GroupCard({ group, onClick, compact = false }: GroupCardProps) {
  const colors = groupCategoryColors[group.category];

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={cn(
          "p-3 rounded-xl border cursor-pointer transition-all duration-300",
          "hover:shadow-lg hover:-translate-y-0.5",
          colors.bg,
          colors.border
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
              "bg-gradient-to-br",
              colors.gradient
            )}
          >
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-museum-paper truncate">
              {group.name}
            </p>
            <p className={cn("text-xs", colors.text)}>
              {groupCategoryLabels[group.category]}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-museum-paper/30" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-5 rounded-2xl border cursor-pointer transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1",
        colors.bg,
        colors.border
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br",
              colors.gradient
            )}
          >
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-museum-paper">
              {group.name}
            </h3>
            <p className={cn("text-xs", colors.text)}>
              {groupCategoryLabels[group.category]}
            </p>
          </div>
        </div>
        <div
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium border",
            group.overallHealth >= 60
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-400/30"
              : group.overallHealth >= 40
              ? "bg-amber-500/10 text-amber-400 border-amber-400/30"
              : "bg-rose-500/10 text-rose-400 border-rose-400/30"
          )}
        >
          {group.overallHealth >= 60
            ? "健康"
            : group.overallHealth >= 40
            ? "一般"
            : "需关注"}
        </div>
      </div>

      {group.description && (
        <p className="text-sm text-museum-paper/60 mb-4 line-clamp-2">
          {group.description}
        </p>
      )}

      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-museum-gold/10">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users className="w-3.5 h-3.5 text-museum-paper/40" />
            <span className="text-xs text-museum-paper/40">成员</span>
          </div>
          <p className="text-lg font-bold text-museum-paper">
            {group.members.length}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <MessageSquare className="w-3.5 h-3.5 text-museum-paper/40" />
            <span className="text-xs text-museum-paper/40">消息</span>
          </div>
          <p className="text-lg font-bold text-museum-paper">
            {group.messageCount}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-museum-paper/40" />
            <span className="text-xs text-museum-paper/40">健康度</span>
          </div>
          <p className="text-lg font-bold text-museum-paper">
            {group.overallHealth}
          </p>
        </div>
      </div>

      {group.members.length > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <div className="flex -space-x-2">
            {group.members.slice(0, 5).map((member, index) => (
              <div
                key={member.id}
                className="w-7 h-7 rounded-full border-2 border-museum-wall flex items-center justify-center text-xs font-medium text-white"
                style={{ backgroundColor: member.color || "#6b7280" }}
                title={member.name}
              >
                {member.name.slice(0, 1)}
              </div>
            ))}
            {group.members.length > 5 && (
              <div className="w-7 h-7 rounded-full bg-museum-gold/20 border-2 border-museum-wall flex items-center justify-center text-[10px] font-medium text-museum-gold">
                +{group.members.length - 5}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
