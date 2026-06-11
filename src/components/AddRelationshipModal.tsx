import { useState, useEffect } from "react";
import { X, UserPlus } from "lucide-react";
import { cn } from "../lib/utils";
import type { RelationshipCategory, Relationship } from "../types/relationshipMap";
import {
  relationshipCategoryLabels,
  relationshipCategoryColors,
} from "../types/relationshipMap";
import { useRelationshipMapStore } from "../store/useRelationshipMapStore";

interface AddRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRelationship?: Relationship | null;
}

const categories: RelationshipCategory[] = [
  "intimate",
  "work",
  "family",
  "friend",
  "acquaintance",
];

const categoryIcons: Record<RelationshipCategory, string> = {
  intimate: "💕",
  work: "💼",
  family: "👨‍👩‍👧",
  friend: "🤝",
  acquaintance: "👋",
};

export function AddRelationshipModal({
  isOpen,
  onClose,
  editingRelationship,
}: AddRelationshipModalProps) {
  const { addRelationship, updateRelationship } = useRelationshipMapStore();
  const [personName, setPersonName] = useState("");
  const [category, setCategory] = useState<RelationshipCategory>("friend");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [initialHealth, setInitialHealth] = useState(50);

  const isEditing = !!editingRelationship;

  useEffect(() => {
    if (editingRelationship) {
      setPersonName(editingRelationship.personName);
      setCategory(editingRelationship.category);
      setDescription(editingRelationship.description || "");
      setStartDate(editingRelationship.startDate || "");
      setInitialHealth(editingRelationship.currentHealthScore);
    } else {
      setPersonName("");
      setCategory("friend");
      setDescription("");
      setStartDate("");
      setInitialHealth(50);
    }
  }, [editingRelationship, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) return;

    if (isEditing && editingRelationship) {
      updateRelationship(editingRelationship.id, {
        personName: personName.trim(),
        category,
        description: description.trim() || undefined,
        startDate: startDate || undefined,
        currentHealthScore: initialHealth,
      });
    } else {
      addRelationship({
        personName: personName.trim(),
        category,
        description: description.trim() || undefined,
        startDate: startDate || undefined,
        initialHealth,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bounce-in">
        <div className="relative rounded-3xl bg-gradient-to-br from-museum-wallLight to-museum-wall border border-museum-gold/30 p-6 md:p-8 shadow-2xl">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-gold-gradient flex items-center gap-2 shadow-lg">
            <UserPlus className="w-4 h-4 text-museum-ink" />
            <span className="text-sm font-bold text-museum-ink">
              {isEditing ? "编辑关系" : "添加新关系"}
            </span>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-lg flex items-center justify-center text-museum-paper/50 hover:text-museum-paper hover:bg-museum-paper/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-museum-paper/80 mb-2">
                对方姓名 <span className="text-museum-warningLight">*</span>
              </label>
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="例如：小明、妈妈、李经理"
                className={cn(
                  "w-full px-4 py-3 rounded-xl",
                  "bg-museum-wall/50 border border-museum-gold/20",
                  "text-museum-paper placeholder:text-museum-paper/30",
                  "focus:outline-none focus:border-museum-gold/50 focus:ring-2 focus:ring-museum-gold/20",
                  "transition-all duration-200"
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-museum-paper/80 mb-3">
                关系类型
              </label>
              <div className="grid grid-cols-5 gap-2">
                {categories.map((cat) => {
                  const colors = relationshipCategoryColors[cat];
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200",
                        isSelected
                          ? cn(colors.bg, colors.border, "scale-105")
                          : "bg-museum-wall/30 border-museum-gold/10 hover:border-museum-gold/30"
                      )}
                    >
                      <span className="text-2xl">{categoryIcons[cat]}</span>
                      <span
                        className={cn(
                          "text-[10px] font-medium",
                          isSelected ? colors.text : "text-museum-paper/50"
                        )}
                      >
                        {relationshipCategoryLabels[cat]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-museum-paper/80 mb-2">
                关系描述（可选）
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="简单描述一下你们的关系..."
                rows={2}
                className={cn(
                  "w-full px-4 py-3 rounded-xl resize-none",
                  "bg-museum-wall/50 border border-museum-gold/20",
                  "text-museum-paper placeholder:text-museum-paper/30",
                  "focus:outline-none focus:border-museum-gold/50 focus:ring-2 focus:ring-museum-gold/20",
                  "transition-all duration-200"
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-museum-paper/80 mb-2">
                认识时间（可选）
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 rounded-xl",
                  "bg-museum-wall/50 border border-museum-gold/20",
                  "text-museum-paper",
                  "focus:outline-none focus:border-museum-gold/50 focus:ring-2 focus:ring-museum-gold/20",
                  "transition-all duration-200"
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-museum-paper/80 mb-2">
                当前关系健康度：<span className="text-museum-gold font-bold">{initialHealth}</span>
                <span className="text-museum-paper/40"> / 100</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={initialHealth}
                onChange={(e) => setInitialHealth(Number(e.target.value))}
                className="w-full h-2 rounded-full bg-museum-wallLight appearance-none cursor-pointer accent-museum-gold"
              />
              <div className="flex justify-between text-[10px] text-museum-paper/40 mt-1">
                <span>很糟糕</span>
                <span>一般</span>
                <span>很好</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={!personName.trim()}
                className={cn(
                  "w-full py-3 rounded-xl font-medium text-sm transition-all duration-300",
                  "bg-gold-gradient text-museum-ink",
                  "shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                )}
              >
                {isEditing ? "保存修改" : "添加关系"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
