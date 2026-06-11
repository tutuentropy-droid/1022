import { useNavigate } from "react-router-dom";
import { Search, BookOpen, Brain, Shield, Users, Map, Sparkles, ArrowRight } from "lucide-react";
import { MuseumHeader } from "../components/MuseumHeader";
import { ThoughtInput } from "../components/ThoughtInput";
import { PersonalitySelector } from "../components/PersonalitySelector";
import { ModeSelector } from "../components/ModeSelector";
import { RelationshipInput } from "../components/RelationshipInput";
import { useAppStore } from "../store/useAppStore";
import { cn } from "../lib/utils";

const features = [
  {
    icon: <Search className="w-5 h-5" />,
    title: "精准识别",
    desc: "基于认知心理学研究，帮助你发现隐藏的思维模式",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "深度解读",
    desc: "每一种认知偏差都配有详细解释和典型表现示例",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "应对策略",
    desc: "提供可操作的方法，帮助你从思维陷阱中走出来",
  },
];

const relationshipFeatures = [
  {
    icon: <Users className="w-5 h-5" />,
    title: "双视角分析",
    desc: "同时识别双方各自的认知Bug和情绪触发点，不评判谁对谁错",
  },
  {
    icon: <Brain className="w-5 h-5" />,
    title: "系统视角",
    desc: "看到冲突是系统互动的结果，而不是某一方的问题",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "打破循环",
    desc: "提供具体的非对抗性沟通建议，帮助走出恶性循环",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const {
    userInput,
    setUserInput,
    analyzeThought,
    isLoading,
    debugMode,
  } = useAppStore();

  const handleSubmit = async () => {
    await analyzeThought();
    navigate("/result");
  };

  return (
    <div className="min-h-screen bg-museum-wall flex flex-col">
      <MuseumHeader />

      <main className="flex-1 flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-16">
          <div className="text-center mb-8 animate-fade-up opacity-0">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-museum-gold/10 border border-museum-gold/20 mb-6">
              <Brain className="w-4 h-4 text-museum-gold" />
              <span className="text-sm text-museum-gold/90 font-body tracking-wide">
                {debugMode === "single" ? "认知偏差诊断工具" : "多人关系 Debug 工具"}
              </span>
            </div>

            <h2 className="font-display text-3xl md:text-5xl font-bold text-museum-paper mb-4 leading-tight">
              {debugMode === "single" ? (
                <>
                  把你的想法
                  <span className="relative inline-block mx-2">
                    <span className="relative z-10 text-museum-gold">交出来</span>
                    <span className="absolute bottom-1 left-0 right-0 h-3 bg-museum-gold/20 -z-0" />
                  </span>
                  让我们看看
                </>
              ) : (
                <>
                  把你们的
                  <span className="relative inline-block mx-2">
                    <span className="relative z-10 text-museum-gold">对话</span>
                    <span className="absolute bottom-1 left-0 right-0 h-3 bg-museum-gold/20 -z-0" />
                  </span>
                  让我们 Debug
                </>
              )}
            </h2>

            <p className="font-body text-museum-paper/60 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              {debugMode === "single"
                ? "我们的大脑会产生各种各样的认知偏差，它们像 Bug 一样悄悄影响着我们的判断和情绪。输入你此刻的想法，让我们帮你找出潜藏的思维 Bug。"
                : "关系中的冲突往往不是谁的错，而是两个认知系统在互动时产生了「系统级 Bug」。输入你们的对话或冲突场景，让我们帮你看清问题的本质。"}
            </p>
          </div>

          <div className="w-full animate-fade-up opacity-0 stagger-delay-1">
            <ModeSelector />

            {debugMode === "single" ? (
              <>
                <PersonalitySelector />
                <ThoughtInput
                  value={userInput}
                  onChange={setUserInput}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              </>
            ) : (
              <RelationshipInput />
            )}
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
            {(debugMode === "single" ? features : relationshipFeatures).map(
              (feature, idx) => (
                <div
                  key={feature.title}
                  className={cn(
                    "relative p-6 rounded-2xl bg-museum-wallLight/30 border border-museum-gold/10",
                    "animate-fade-up opacity-0 transition-all duration-300",
                    "hover:bg-museum-wallLight/50 hover:border-museum-gold/20",
                    `stagger-delay-${idx + 2}`
                  )}
                  style={{ animationDelay: `${(idx + 2) * 0.1}s` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-museum-gold/15 flex items-center justify-center text-museum-gold mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-museum-paper mb-2">
                    {feature.title}
                  </h3>
                  <p className="font-body text-sm text-museum-paper/55 leading-relaxed">
                    {feature.desc}
                  </p>

                  <span className="corner-decoration corner-decoration-tl" />
                  <span className="corner-decoration corner-decoration-br" />
                </div>
              )
            )}
          </div>

          <div className="mt-20 max-w-4xl mx-auto w-full animate-fade-up opacity-0" style={{ animationDelay: '0.5s' }}>
            <div
              className="relative p-8 rounded-3xl border-2 border-museum-gold/30 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(201, 169, 98, 0.15) 0%, rgba(26, 58, 58, 0.8) 50%, rgba(201, 169, 98, 0.1) 100%)',
              }}
            >
              <div className="absolute top-4 right-4">
                <Sparkles className="w-6 h-6 text-museum-gold/40 sparkle" />
              </div>
              <div className="absolute bottom-4 left-4">
                <Sparkles className="w-4 h-4 text-museum-gold/30 sparkle" style={{ animationDelay: '0.5s' }} />
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-museum-gold/30 to-museum-gold/10 border-2 border-museum-gold/50 flex items-center justify-center flex-shrink-0">
                  <Map className="w-7 h-7 text-museum-gold" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-museum-gold/20 text-museum-gold text-[10px] font-bold border border-museum-gold/30">
                      NEW · 长期成长
                    </span>
                  </div>
                  <h3 className="font-display text-xl md:text-2xl font-bold text-museum-paper mb-2">
                    关系人格地图
                  </h3>
                  <p className="text-sm text-museum-paper/60 font-body leading-relaxed mb-4 max-w-xl">
                    记录你在不同关系中的互动模式——亲密关系、工作关系、家庭关系。
                    系统会识别你的高频触发 Bug（讨好、过度解释、回避冲突...），
                    输出关系成长趋势，让你看见自己的重复模式。
                  </p>

                  <button
                    onClick={() => navigate("/relationship-map")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-gradient text-museum-ink font-medium text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                  >
                    探索我的关系地图
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <span className="corner-decoration corner-decoration-tl" />
              <span className="corner-decoration corner-decoration-tr" />
              <span className="corner-decoration corner-decoration-bl" />
              <span className="corner-decoration corner-decoration-br" />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 text-center">
        <p className="text-xs text-museum-paper/30 font-body">
          本工具仅供自我觉察参考，不作为心理诊断依据
        </p>
      </footer>
    </div>
  );
}
