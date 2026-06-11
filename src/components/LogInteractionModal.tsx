import { useState, useEffect } from "react";
import { X, MessageSquarePlus, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";
import { useRelationshipMapStore } from "../store/useRelationshipMapStore";
import type { Relationship } from "../types/relationshipMap";
import {
  relationshipCategoryColors,
  commonRelationshipPatterns,
} from "../types/relationshipMap";

interface LogInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  relationship?: Relationship | null;
}

const emotionOptions = [
  { value: "happy", label: "开心", emoji: "😊" },
  { value: "grateful", label: "感激", emoji: "🙏" },
  { value: "peaceful", label: "平静", emoji: "😌" },
  { value: "neutral", label: "一般", emoji: "😐" },
  { value: "anxious", label: "焦虑", emoji: "😰" },
  { value: "frustrated", label: "挫败", emoji: "😤" },
  { value: "sad", label: "难过", emoji: "😢" },
  { value: "angry", label: "生气", emoji: "😠" },
  { value: "hurt", label: "受伤", emoji: "💔" },
];

export function LogInteractionModal({
  isOpen,
  onClose,
  relationship,
}: LogInteractionModalProps) {
  const { addInteraction, relationships, getRelationshipInteractions } = useRelationshipMapStore();
  const [selectedRelationshipId, setSelectedRelationshipId] = useState("");
  const [summary, setSummary] = useState("");
  const [dialogue, setDialogue] = useState("");
  const [healthScore, setHealthScore] = useState(60);
  const [emotion, setEmotion] = useState("neutral");
  const [emotionIntensity, setEmotionIntensity] = useState(5);
  const [notes, setNotes] = useState("");
  const [detectedPatterns, setDetectedPatterns] = useState<string[]>([]);

  useEffect(() => {
    if (relationship) {
      setSelectedRelationshipId(relationship.id);
      const interactions = getRelationshipInteractions(relationship.id);
      if (interactions.length > 0) {
        setHealthScore(interactions[interactions.length - 1].healthScore);
      } else {
        setHealthScore(relationship.currentHealthScore);
      }
    } else if (relationships.length > 0 && !selectedRelationshipId) {
      setSelectedRelationshipId(relationships[0].id);
    }
  }, [relationship, isOpen]);

  useEffect(() => {
    const fullText = (summary + " " + dialogue + " " + notes).toLowerCase();
    const patterns: string[] = [];

    for (const pattern of commonRelationshipPatterns) {
      for (const keyword of pattern.bugKeywords) {
        if (fullText.includes(keyword.toLowerCase())) {
          patterns.push(pattern.name);
          break;
        }
      }
    }

    setDetectedPatterns(patterns);
  }, [summary, dialogue, notes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRelationshipId || !summary.trim()) return;

    const wasPositive =
      ["happy", "grateful", "peaceful"].includes(emotion) || healthScore >= 60;

    addInteraction({
      relationshipId: selectedRelationshipId,
      summary: summary.trim(),
      dialogue: dialogue.trim() || undefined,
      healthScore,
      emotion,
      emotionIntensity,
      notes: notes.trim() || undefined,
      wasPositive,
    });

    onClose();
    setSummary("");
    setDialogue("");
    setNotes("");
  };

  const selectedRelationship = relationships.find(
    (r) => r.id === selectedRelationshipId
  );
  const categoryColors = selectedRelationship
    ? relationshipCategoryColors[selectedRelationship.category]
    : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bounce-in">
        <div className="relative rounded-3xl bg-gradient-to-br from-museum-wallLight to-museum-wall border border-museum-gold/30 p-6 md:p-8 shadow-2xl">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-gold-gradient flex items-center gap-2 shadow-lg">
            <MessageSquarePlus className="w-4 h-4 text-museum-ink" />
            <span className="text-sm font-bold text-museum-ink">记录互动</span>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-lg flex items-center justify-center text-museum-paper/50 hover:text-museum-paper hover:bg-museum-paper/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {!relationship && (
              <div>
                <label className="block text-sm font-medium text-museum-paper/80 mb-2">
                  选择关系 <span className="text-museum-warningLight">*</span>
                </label>
                <select
                  value={selectedRelationshipId}
                  onChange={(e) => setSelectedRelationshipId(e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl",
                    "bg-museum-wall/50 border border-museum-gold/20",
                    "text-museum-paper",
                    "focus:outline-none focus:border-museum-gold/50 focus:ring-2 focus:ring-museum-gold/20",
                    "transition-all duration-200"
                  )}
                >
                  {relationships.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.personName}（{relationshipCategoryColors[r.category] ? 
                        Object.entries(relationshipCategoryColors).find(([k]) => k === r.category)?.[0] : ''}）
                    </option>
                  ))}
                </select>
              </div>
            )}

            {relationship && categoryColors && (
              <div className={cn(
                "p-4 rounded-xl border",
                categoryColors.bg,
                categoryColors.border
              )}>
                <p className={cn("text-sm font-medium", categoryColors.text)}>
                  记录与 <span className="font-bold">{relationship.personName}</span> 的互动
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-museum-paper/80 mb-2">
                互动概述 <span className="text-museum-warningLight">*</span>
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="简单描述这次互动的内容和感受..."
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
                对话内容（可选）
              </label>
              <textarea
                value={dialogue}
                onChange={(e) => setDialogue(e.target.value)}
                placeholder="记录关键对话或互动细节..."
                rows={3}
                className={cn(
                  "w-full px-4 py-3 rounded-xl resize-none font-mono text-sm",
                  "bg-museum-wall/50 border border-museum-gold/20",
                  "text-museum-paper placeholder:text-museum-paper/30",
                  "focus:outline-none focus:border-museum-gold/50 focus:ring-2 focus:ring-museum-gold/20",
                  "transition-all duration-200"
                )}
              />
            </div>

            {detectedPatterns.length > 0 && (
              <div className="p-4 rounded-xl bg-museum-gold/10 border border-museum-gold/30">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-museum-gold" />
                  <span className="text-xs font-medium text-museum-gold">
                    检测到的模式
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {detectedPatterns.map((pattern) => (
                    <span
                      key={pattern}
                      className="px-2 py-1 rounded-md bg-museum-gold/15 text-museum-gold/90 text-xs font-medium border border-museum-gold/30"
                    >
                      {pattern}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-museum-paper/80 mb-2">
                互动后的关系健康度：
                <span className="text-museum-gold font-bold">{healthScore}</span>
                <span className="text-museum-paper/40"> / 100</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={healthScore}
                onChange={(e) => setHealthScore(Number(e.target.value))}
                className="w-full h-2 rounded-full bg-museum-wallLight appearance-none cursor-pointer accent-museum-gold"
              />
              <div className="flex justify-between text-[10px] text-museum-paper/40 mt-1">
                <span>很糟糕</span>
                <span>一般</span>
                <span>很好</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-museum-paper/80 mb-2">
                你的情绪
              </label>
              <div className="flex flex-wrap gap-2">
                {emotionOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEmotion(opt.value)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all duration-200",
                      emotion === opt.value
                        ? "bg-museum-gold/20 border-museum-gold/50 scale-105"
                        : "bg-museum-wall/30 border-museum-gold/10 hover:border-museum-gold/30"
                    )}
                  >
                    <span className="text-base">{opt.emoji}</span>
                    <span
                      className={cn(
                        "text-xs",
                        emotion === opt.value
                          ? "text-museum-gold"
                          : "text-museum-paper/50"
                      )}
                    >
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-museum-paper/80 mb-2">
                情绪强度：
                <span className="text-museum-gold font-bold">{emotionIntensity}</span>
                <span className="text-museum-paper/40"> / 10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={emotionIntensity}
                onChange={(e) => setEmotionIntensity(Number(e.target.value))}
                className="w-full h-2 rounded-full bg-museum-wallLight appearance-none cursor-pointer accent-museum-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-museum-paper/80 mb-2">
                备注/反思（可选）
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="记录你的反思、觉察或想要改变的地方..."
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={!summary.trim() || !selectedRelationshipId}
                className={cn(
                  "w-full py-3 rounded-xl font-medium text-sm transition-all duration-300",
                  "bg-gold-gradient text-museum-ink",
                  "shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                )}
              >
                记录这次互动
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
