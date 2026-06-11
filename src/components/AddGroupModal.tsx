import { useState, useEffect } from "react";
import { X, Plus, Users } from "lucide-react";
import { cn } from "../lib/utils";
import type { GroupCategory, Group } from "../types/groupDynamics";
import {
  groupCategoryLabels,
  groupCategoryColors,
} from "../types/groupDynamics";
import { useGroupDynamicsStore } from "../store/useGroupDynamicsStore";

interface AddGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGroup: Group | null;
}

const categories: GroupCategory[] = ["work", "family", "friend", "community", "other"];

export function AddGroupModal({
  isOpen,
  onClose,
  editingGroup,
}: AddGroupModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<GroupCategory>("work");
  const [description, setDescription] = useState("");

  const { addGroup, updateGroup } = useGroupDynamicsStore();

  useEffect(() => {
    if (editingGroup) {
      setName(editingGroup.name);
      setCategory(editingGroup.category);
      setDescription(editingGroup.description || "");
    } else {
      setName("");
      setCategory("work");
      setDescription("");
    }
  }, [editingGroup, isOpen]);

  const handleSubmit = () => {
    if (!name.trim()) return;

    if (editingGroup) {
      updateGroup(editingGroup.id, {
        name: name.trim(),
        category,
        description: description.trim() || undefined,
      });
    } else {
      addGroup({
        name: name.trim(),
        category,
        description: description.trim() || undefined,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-museum-wall rounded-2xl border border-museum-gold/20 shadow-2xl overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-museum-gold/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-museum-gold/20 to-museum-gold/5 border border-museum-gold/40 flex items-center justify-center">
              <Users className="w-5 h-5 text-museum-gold" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-museum-paper">
                {editingGroup ? "编辑群组" : "添加群组"}
              </h3>
              <p className="text-xs text-museum-paper/50">
                {editingGroup
                  ? "修改群组信息"
                  : "创建一个新的群体进行分析"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-museum-paper/50 hover:text-museum-paper hover:bg-museum-paper/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="block text-xs font-medium text-museum-paper/70 mb-2">
              群组名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：产品团队群"
              className="w-full px-4 py-2.5 rounded-xl bg-museum-wallLight/30 border border-museum-gold/20 text-museum-paper text-sm placeholder:text-museum-paper/30 focus:outline-none focus:border-museum-gold/40 focus:ring-1 focus:ring-museum-gold/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-museum-paper/70 mb-2">
              群组类型
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const colors = groupCategoryColors[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "p-3 rounded-xl border text-center transition-all",
                      category === cat
                        ? `${colors.bg} ${colors.border} ${colors.text}`
                        : "bg-museum-wallLight/20 border-museum-gold/10 text-museum-paper/50 hover:border-museum-gold/20"
                    )}
                  >
                    <p className="text-sm font-medium">
                      {groupCategoryLabels[cat]}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-museum-paper/70 mb-2">
              描述（可选）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要描述这个群组..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-museum-wallLight/30 border border-museum-gold/20 text-museum-paper text-sm placeholder:text-museum-paper/30 focus:outline-none focus:border-museum-gold/40 focus:ring-1 focus:ring-museum-gold/20 transition-all resize-none"
            />
          </div>
        </div>

        <div className="p-5 border-t border-museum-gold/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-museum-gold/30 text-museum-gold text-sm font-medium hover:bg-museum-gold/10 transition-all"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-museum-ink text-sm font-medium shadow-md transition-all flex items-center justify-center gap-2",
              name.trim()
                ? "bg-gold-gradient hover:shadow-lg hover:-translate-y-0.5"
                : "bg-museum-gold/30 cursor-not-allowed"
            )}
          >
            <Plus className="w-4 h-4" />
            {editingGroup ? "保存修改" : "创建群组"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
