import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  SearchX,
  Sparkles,
  Info,
  ClipboardPaste,
} from "lucide-react";
import { MuseumHeader } from "../components/MuseumHeader";
import { ExhibitHall } from "../components/ExhibitHall";
import { ChainViewer } from "../components/ChainViewer";
import { PersonalitySelector } from "../components/PersonalitySelector";
import { useAppStore } from "../store/useAppStore";
import { cn } from "../lib/utils";

export default function ResultPage() {
  const navigate = useNavigate();
  const {
    userInput,
    matchResults,
    bugChain,
    isLoading,
    expandedBugId,
    toggleBugExpansion,
    clearResults,
    hasScanned,
  } = useAppStore();

  const handleBack = () => {
    navigate("/");
  };

  const handleReset = () => {
    clearResults();
    navigate("/");
  };

  const hasResults = matchResults.length > 0;
  const isEmptyAndNotScanned = !isLoading && !hasScanned;

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

          {userInput && (
            <div className="mb-6 animate-fade-up opacity-0 stagger-delay-1">
              <div className="relative max-w-3xl mx-auto">
                <div className="p-6 rounded-2xl bg-museum-wallLight/30 border border-museum-gold/15">
                  <span className="corner-decoration corner-decoration-tl" />
                  <span className="corner-decoration corner-decoration-tr" />
                  <span className="corner-decoration corner-decoration-bl" />
                  <span className="corner-decoration corner-decoration-br" />

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-museum-gold/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Info className="w-4 h-4 text-museum-gold" />
                    </div>
                    <div>
                      <p className="text-xs text-museum-gold/70 font-body mb-1 tracking-wide">
                        你输入的想法
                      </p>
                      <p className="font-body text-lg text-museum-paper leading-relaxed">
                        {userInput}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasResults && <PersonalitySelector />}

          {isLoading ? (
            <LoadingState />
          ) : isEmptyAndNotScanned ? (
            <NotScannedState onBack={handleBack} />
          ) : hasResults ? (
            <>
              {bugChain && (
                <div className="mb-10">
                  <ChainViewer chain={bugChain} />
                </div>
              )}

              <ExhibitHall
                results={matchResults}
                expandedBugId={expandedBugId}
                toggleBugExpansion={toggleBugExpansion}
              />

              <div className="mt-16 text-center animate-fade-in opacity-0">
                <div className="museum-divider max-w-md mx-auto">
                  <span className="text-museum-gold/60 text-xs">❖</span>
                </div>
                <p className="text-sm text-museum-paper/40 font-body max-w-lg mx-auto leading-relaxed mt-6">
                  认知偏差是人类大脑的正常运作方式，它们不是缺陷，而是进化带来的快捷方式。
                  觉察是改变的第一步，看见它们，就已经迈出了重要的一步。
                </p>
              </div>
            </>
          ) : (
            <EmptyState onBack={handleBack} />
          )}
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
          <Sparkles className="w-5 h-5 text-museum-gold animate-pulse" />
        </div>
      </div>
      <p className="font-display text-xl text-museum-paper mb-2">
        正在扫描你的想法...
      </p>
      <p className="font-body text-sm text-museum-paper/50">
        正在对比认知 Bug 数据库
      </p>
    </div>
  );
}

function NotScannedState({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in opacity-0">
      <div className="relative w-20 h-20 mb-6">
        <div className="w-full h-full rounded-2xl bg-museum-wallLight/50 border border-museum-gold/20 flex items-center justify-center">
          <ClipboardPaste className="w-10 h-10 text-museum-gold/50" />
        </div>
        <span className="corner-decoration corner-decoration-tl" />
        <span className="corner-decoration corner-decoration-br" />
      </div>

      <h3 className="font-display text-2xl text-museum-paper mb-2">
        还没有扫描记录
      </h3>
      <p className="font-body text-museum-paper/50 max-w-md text-center mb-8 leading-relaxed">
        请先回到首页，输入你此刻的想法，让我们帮你扫描出潜藏的认知 Bug。
      </p>

      <button
        onClick={onBack}
        className={cn(
          "inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300",
          "bg-gold-gradient text-museum-ink shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        )}
      >
        <ArrowLeft className="w-4 h-4" />
        去首页输入想法
      </button>
    </div>
  );
}

function EmptyState({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in opacity-0">
      <div className="relative w-20 h-20 mb-6">
        <div className="w-full h-full rounded-2xl bg-museum-wallLight/50 border border-museum-gold/20 flex items-center justify-center">
          <SearchX className="w-10 h-10 text-museum-gold/50" />
        </div>
        <span className="corner-decoration corner-decoration-tl" />
        <span className="corner-decoration corner-decoration-br" />
      </div>

      <h3 className="font-display text-2xl text-museum-paper mb-2">
        未检测到明显的认知 Bug
      </h3>
      <p className="font-body text-museum-paper/50 max-w-md text-center mb-8 leading-relaxed">
        你的想法看起来很健康！不过认知偏差往往很隐蔽，
        可以试着描述得更详细一些，或者换一种表达方式再试试。
      </p>

      <button
        onClick={onBack}
        className={cn(
          "inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300",
          "bg-gold-gradient text-museum-ink shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        )}
      >
        <ArrowLeft className="w-4 h-4" />
        重新输入想法
      </button>
    </div>
  );
}
