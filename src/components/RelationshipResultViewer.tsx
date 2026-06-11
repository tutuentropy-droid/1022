import { useState } from "react";
import { ArrowLeft, RefreshCw, Users, Lightbulb, MessageCircle, Info, Globe2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { TriggerChainViewer } from "./TriggerChainViewer";
import { EscalationPathViewer } from "./EscalationPathViewer";
import { MisunderstandingViewer } from "./MisunderstandingViewer";
import { RelationshipFutureSimulator } from "./RelationshipFutureSimulator";
import { MuseumHeader } from "./MuseumHeader";
import { cn } from "../lib/utils";

type TabType = "chains" | "escalation" | "misunderstanding" | "future";

export function RelationshipResultViewer() {
  const navigate = useNavigate();
  const {
    relationshipResult,
    relationshipInput,
    isRelationshipLoading,
    clearRelationshipResults,
    hasScannedRelationship,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>("future");

  const handleBack = () => {
    navigate("/");
  };

  const handleReset = () => {
    clearRelationshipResults();
    navigate("/");
  };

  if (isRelationshipLoading) {
    return (
      <div className="min-h-screen bg-museum-wall flex flex-col">
        <MuseumHeader />
        <main className="flex-1 flex items-center justify-center">
          <LoadingState />
        </main>
      </div>
    );
  }

  if (!hasScannedRelationship || !relationshipResult) {
    return (
      <div className="min-h-screen bg-museum-wall flex flex-col">
        <MuseumHeader />
        <main className="flex-1 flex items-center justify-center">
          <EmptyState onBack={handleBack} />
        </main>
      </div>
    );
  }

  const nameA = relationshipResult.input.participantA.name || "A";
  const nameB = relationshipResult.input.participantB.name || "B";

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "future", label: "未来模拟器", icon: <Globe2 className="w-4 h-4" /> },
    { id: "chains", label: "双方触发链", icon: <MessageCircle className="w-4 h-4" /> },
    { id: "escalation", label: "冲突升级路径", icon: <Users className="w-4 h-4" /> },
    { id: "misunderstanding", label: "误解形成", icon: <Lightbulb className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-museum-wall flex flex-col">
      <MuseumHeader />

      <main className="flex-1">
        <div className="container mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-8 animate-fade-in opacity-0">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-museum-paper/70 hover:text-museum-paper hover:bg-museum-wallLight/50 transition-all duration-300 font-body text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              返回重新输入
            </button>

            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-museum-gold/30 text-museum-gold hover:bg-museum-gold/10 transition-all duration-300 font-body text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              清空重来
            </button>
          </div>

          {relationshipInput.scenario && (
            <div className="mb-6 animate-fade-up opacity-0 stagger-delay-1">
              <div className="relative max-w-3xl mx-auto">
                <div className="p-6 rounded-2xl bg-museum-wallLight/30 border border-museum-gold/15">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-museum-gold/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Info className="w-4 h-4 text-museum-gold" />
                    </div>
                    <div>
                      <p className="text-xs text-museum-gold/70 font-body mb-1 tracking-wide">
                        冲突场景
                      </p>
                      <p className="font-body text-lg text-museum-paper leading-relaxed">
                        {relationshipInput.scenario}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8 animate-fade-up opacity-0 stagger-delay-1">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-museum-gold/10 to-transparent border border-museum-gold/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-museum-gold/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-museum-gold" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-museum-paper">
                    系统洞察
                  </h2>
                  <p className="text-sm text-museum-paper/60">
                    这不是谁对谁错，而是两个认知系统的互动
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {relationshipResult.systemInsight
                  .split("\n")
                  .filter((line) => line.trim())
                  .map((line, idx) => (
                    <p
                      key={idx}
                      className={cn(
                        "text-museum-paper/80 leading-relaxed",
                        idx === 0 && "font-medium text-museum-gold/90"
                      )}
                    >
                      {line}
                    </p>
                  ))}
              </div>
            </div>
          </div>

          <div className="mb-6 animate-fade-up opacity-0 stagger-delay-2">
            <div className="inline-flex rounded-xl bg-museum-wallLight/30 p-1 border border-museum-gold/10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                    activeTab === tab.id
                      ? "bg-museum-gold/20 text-museum-gold border border-museum-gold/30 shadow-inner"
                      : "text-museum-paper/50 hover:text-museum-paper/70 hover:bg-museum-wallLight/20"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="animate-fade-up opacity-0 stagger-delay-3">
            {activeTab === "future" && relationshipResult && (
              <RelationshipFutureSimulator result={relationshipResult} />
            )}

            {activeTab === "chains" && (
              <div className="grid gap-6 md:grid-cols-2">
                <TriggerChainViewer chain={relationshipResult.chainA} participantLabel={nameA} />
                <TriggerChainViewer chain={relationshipResult.chainB} participantLabel={nameB} />
              </div>
            )}

            {activeTab === "escalation" && (
              <EscalationPathViewer
                steps={relationshipResult.escalationPath}
                participantAName={nameA}
                participantBName={nameB}
              />
            )}

            {activeTab === "misunderstanding" && (
              <MisunderstandingViewer
                misunderstanding={relationshipResult.misunderstanding}
                participantAName={nameA}
                participantBName={nameB}
              />
            )}
          </div>

          {relationshipResult.deEscalationSuggestions.length > 0 && (
            <div className="mt-8 animate-fade-up opacity-0 stagger-delay-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-400/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-museum-paper">
                      如何打破循环
                    </h3>
                    <p className="text-sm text-museum-paper/60">
                      一些可以尝试的小建议
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {relationshipResult.deEscalationSuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 p-3 rounded-lg bg-museum-wallLight/20 border border-museum-gold/10"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-museum-paper/80 leading-relaxed">
                        {suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-16 text-center animate-fade-in opacity-0">
            <div className="museum-divider max-w-md mx-auto">
              <span className="text-museum-gold/60 text-xs">❖</span>
            </div>
            <p className="text-sm text-museum-paper/40 font-body max-w-lg mx-auto leading-relaxed mt-6">
              关系中的冲突，往往不是因为有「坏人」，而是因为两个「受伤的人」在试图保护自己。
              当你能看到这个系统，就有机会跳出「谁对谁错」的陷阱，真正看见彼此。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in opacity-0">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-museum-gold/20" />
        <div className="absolute inset-0 rounded-full border-2 border-museum-gold border-t-transparent animate-spin" />
        <div className="absolute inset-3 rounded-full bg-museum-gold/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-museum-gold animate-pulse" />
        </div>
      </div>
      <p className="font-display text-xl text-museum-paper mb-2">
        正在分析关系系统...
      </p>
      <p className="font-body text-sm text-museum-paper/50">
        正在识别双方的情绪触发点和认知模式
      </p>
    </div>
  );
}

function EmptyState({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in opacity-0">
      <div className="relative w-20 h-20 mb-6">
        <div className="w-full h-full rounded-2xl bg-museum-wallLight/50 border border-museum-gold/20 flex items-center justify-center">
          <Users className="w-10 h-10 text-museum-gold/50" />
        </div>
        <span className="corner-decoration corner-decoration-tl" />
        <span className="corner-decoration corner-decoration-br" />
      </div>

      <h3 className="font-display text-2xl text-museum-paper mb-2">
        还没有关系 Debug 记录
      </h3>
      <p className="font-body text-museum-paper/50 max-w-md text-center mb-8 leading-relaxed">
        请先回到首页，切换到「关系 Debug」模式，输入你们的对话或冲突场景。
      </p>

      <button
        onClick={onBack}
        className={cn(
          "inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300",
          "bg-gold-gradient text-museum-ink shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        )}
      >
        <ArrowLeft className="w-4 h-4" />
        去首页输入对话
      </button>
    </div>
  );
}
