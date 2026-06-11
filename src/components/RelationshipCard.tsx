import {
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  MessageSquare,
  MoreHorizontal,
  Edit2,
  Trash2,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import type { Relationship } from "../types/relationshipMap";
import {
  relationshipCategoryLabels,
  relationshipCategoryColors,
  relationshipStatusLabels,
  relationshipStatusColors,
} from "../types/relationshipMap";
import { useRelationshipMapStore } from "../store/useRelationshipMapStore";

interface RelationshipCardProps {
  relationship: Relationship;
  onClick?: () => void;
  compact?: boolean;
}

export function RelationshipCard({
  relationship,
  onClick,
  compact = false,
}: RelationshipCardProps) {
  const {
    getRelationshipInteractions,
    getRelationshipTrend,
    setIsLogModalOpen,
    setEditingRelationship,
    setIsAddModalOpen,
    deleteRelationship,
  } = useRelationshipMapStore();
  const [showMenu, setShowMenu] = useState(false);

  const colors = relationshipCategoryColors[relationship.category];
  const interactions = getRelationshipInteractions(relationship.id);
  const trend = getRelationshipTrend(relationship.id);
  const interactionCount = interactions.length;

  const healthScore = relationship.currentHealthScore;
  const status = relationship.status;

  const statusIcon =
    status === "improving" ? (
      <TrendingUp className="w-4 h-4" />
    ) : status === "deteriorating" ? (
      <TrendingDown className="w-4 h-4" />
    ) : status === "stable" ? (
      <Minus className="w-4 h-4" />
    ) : (
      <HelpCircle className="w-4 h-4" />
    );

  const handleMenuAction = (action: string) => {
    setShowMenu(false);
    if (action === "log") {
      setIsLogModalOpen(true);
    } else if (action === "edit") {
      setEditingRelationship(relationship);
      setIsAddModalOpen(true);
    } else if (action === "delete") {
      if (confirm(`确定要删除与 ${relationship.personName} 的关系记录吗？`)) {
        deleteRelationship(relationship.id);
      }
    }
  };

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={cn(
          "relative p-3 rounded-xl border cursor-pointer transition-all duration-300",
          "hover:scale-[1.02] hover:shadow-lg",
          colors.bg,
          colors.border
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              "bg-gradient-to-br",
              colors.iconBg,
              "border",
              colors.border
            )}
          >
            <span className="text-lg font-bold text-museum-paper">
              {relationship.personName.slice(0, 1)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-museum-paper truncate">
              {relationship.personName}
            </p>
            <p className={cn("text-xs", colors.text)}>
              {relationshipCategoryLabels[relationship.category]}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-museum-paper">{healthScore}</p>
            <div className={cn("flex items-center gap-0.5", relationshipStatusColors[status])}>
              {statusIcon}
              <span className="text-[10px]">{relationshipStatusLabels[status]}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative p-5 rounded-2xl border transition-all duration-300",
        "hover:shadow-xl hover:scale-[1.01]",
        "bg-gradient-to-br from-museum-wallLight/50 to-museum-wall/30",
        "border-museum-gold/20 hover:border-museum-gold/40",
        onClick && "cursor-pointer",
        "spotlight-card"
      )}
      onClick={onClick}
    >
      <span className="corner-decoration corner-decoration-tl" />
      <span className="corner-decoration corner-decoration-br" />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "relative w-12 h-12 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br border",
              colors.iconBg,
              colors.border
            )}
          >
            <Heart
              className={cn(
                "w-6 h-6",
                healthScore >= 60 ? "text-emerald-400" : healthScore >= 40 ? "text-amber-400" : "text-museum-warningLight",
                interactionCount > 0 && "heart-beat"
              )}
            />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-museum-paper">
              {relationship.personName}
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border",
                  colors.bg,
                  colors.border,
                  colors.text
                )}
              >
                {relationshipCategoryLabels[relationship.category]}
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-museum-paper/40 hover:text-museum-paper hover:bg-museum-paper/10 transition-all"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-full mt-1 z-20 py-1 rounded-lg bg-museum-wallLight border border-museum-gold/20 shadow-xl min-w-[120px]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => handleMenuAction("log")}
                className="w-full px-3 py-2 text-left text-sm text-museum-paper/70 hover:bg-museum-gold/10 hover:text-museum-paper flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                记录互动
              </button>
              <button
                onClick={() => handleMenuAction("edit")}
                className="w-full px-3 py-2 text-left text-sm text-museum-paper/70 hover:bg-museum-gold/10 hover:text-museum-paper flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                编辑
              </button>
              <button
                onClick={() => handleMenuAction("delete")}
                className="w-full px-3 py-2 text-left text-sm text-museum-warningLight/70 hover:bg-museum-warning/10 hover:text-museum-warningLight flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                删除
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-museum-paper counter-animation">
              {healthScore}
            </span>
            <span className="text-sm text-museum-paper/40">/100</span>
          </div>
          <div className={cn("flex items-center gap-1 mt-1", relationshipStatusColors[status])}>
            {statusIcon}
            <span className="text-xs font-medium">{relationshipStatusLabels[status]}</span>
            {trend !== 0 && interactionCount >= 2 && (
              <span
                className={cn(
                  "text-xs font-bold",
                  trend > 0 ? "text-emerald-400" : "text-museum-warningLight"
                )}
              >
                {trend > 0 ? "+" : ""}
                {trend}
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-museum-paper/50">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm">{interactionCount} 次互动</span>
          </div>
        </div>
      </div>

      <div className="relative w-full h-2 rounded-full bg-museum-wallLight overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 bar-fill",
            healthScore >= 60
              ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
              : healthScore >= 40
              ? "bg-gradient-to-r from-amber-500 to-amber-400"
              : "bg-gradient-to-r from-museum-warning to-museum-warningLight"
          )}
          style={{ width: `${healthScore}%` }}
        />
      </div>

      {relationship.description && (
        <p className="mt-3 text-sm text-museum-paper/50 font-body line-clamp-2">
          {relationship.description}
        </p>
      )}

      {interactions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-museum-gold/10">
          <p className="text-[10px] text-museum-paper/40 mb-2">最近模式：</p>
          <div className="flex flex-wrap gap-1">
            {[...new Set(interactions.slice(-5).flatMap((i) => i.patterns))]
              .slice(0, 3)
              .map((pattern) => (
                <span
                  key={pattern}
                  className="px-1.5 py-0.5 rounded bg-museum-gold/10 text-museum-gold/70 text-[10px] border border-museum-gold/20"
                >
                  {pattern}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
