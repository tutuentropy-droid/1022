import { useState, useCallback } from "react";
import {
  LayoutGrid,
  List,
  Filter,
  Trophy,
  AlertTriangle,
  Activity,
  Search,
  X,
} from "lucide-react";
import type { BugMatchResult, BugRank, BugSeverity } from "../types/bug";
import { rankLabels, severityLabels } from "../types/bug";
import { ExhibitCard } from "./ExhibitCard";
import { MuseumStats } from "./MuseumStats";
import { cn } from "../lib/utils";

interface ExhibitHallProps {
  results: BugMatchResult[];
  expandedBugId: string | null;
  toggleBugExpansion: (id: string) => void;
}

type ViewMode = "gallery" | "list";
type SortBy = "match" | "danger" | "rank" | "recurrence";

export function ExhibitHall({
  results,
  expandedBugId,
  toggleBugExpansion,
}: ExhibitHallProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("gallery");
  const [sortBy, setSortBy] = useState<SortBy>("match");
  const [filterRank, setFilterRank] = useState<BugRank | "all">("all");
  const [filterSeverity, setFilterSeverity] = useState<BugSeverity | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const sortedAndFilteredResults = useCallback(() => {
    let filtered = [...results];

    if (filterRank !== "all") {
      filtered = filtered.filter((r) => r.bug.rank === filterRank);
    }
    if (filterSeverity !== "all") {
      filtered = filtered.filter((r) => r.bug.severity === filterSeverity);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.bug.name.toLowerCase().includes(query) ||
          r.bug.description.toLowerCase().includes(query) ||
          r.bug.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "match":
          return b.matchScore - a.matchScore;
        case "danger": {
          const aLevel = a.bug.severity === "high" ? 3 : a.bug.severity === "medium" ? 2 : 1;
          const bLevel = b.bug.severity === "high" ? 3 : b.bug.severity === "medium" ? 2 : 1;
          return bLevel - aLevel;
        }
        case "rank": {
          const rankOrder: Record<BugRank, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 };
          return rankOrder[b.bug.rank] - rankOrder[a.bug.rank];
        }
        case "recurrence":
          return b.bug.recurrenceRate - a.bug.recurrenceRate;
        default:
          return 0;
      }
    });

    return filtered;
  }, [results, sortBy, filterRank, filterSeverity, searchQuery]);

  const displayResults = sortedAndFilteredResults();
  const hasActiveFilters = filterRank !== "all" || filterSeverity !== "all" || searchQuery.trim();

  const clearFilters = () => {
    setFilterRank("all");
    setFilterSeverity("all");
    setSearchQuery("");
  };

  return (
    <div className="w-full">
      <MuseumStats results={results} />

      <div className="mb-6 animate-fade-up opacity-0 stagger-delay-2">
        <div className="relative">
          <div className="absolute -inset-px bg-gradient-to-r from-museum-gold/10 via-transparent to-museum-gold/10 rounded-xl blur-sm" />
          <div className="relative rounded-xl bg-museum-wallLight/20 border border-museum-gold/15 backdrop-blur-sm p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-museum-gold/50" />
                <input
                  type="text"
                  placeholder="搜索标本名称、描述、标签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-museum-wall/50 border border-museum-gold/20 text-museum-paper placeholder:text-museum-paper/30 focus:outline-none focus:border-museum-gold/50 transition-colors text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-museum-paper/40 hover:text-museum-paper transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-300",
                    showFilters || hasActiveFilters
                      ? "bg-museum-gold/20 border border-museum-gold/40 text-museum-gold"
                      : "bg-museum-wall/50 border border-museum-gold/20 text-museum-paper/60 hover:text-museum-paper hover:border-museum-gold/40"
                  )}
                >
                  <Filter className="w-4 h-4" />
                  <span>筛选</span>
                  {hasActiveFilters && (
                    <span className="w-5 h-5 rounded-full bg-museum-gold text-museum-wall text-xs font-bold flex items-center justify-center">
                      {(filterRank !== "all" ? 1 : 0) + (filterSeverity !== "all" ? 1 : 0) + (searchQuery ? 1 : 0)}
                    </span>
                  )}
                </button>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 px-3 py-2.5 rounded-lg text-sm text-museum-paper/40 hover:text-museum-warningLight transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>清除</span>
                  </button>
                )}

                <div className="flex items-center rounded-lg bg-museum-wall/50 border border-museum-gold/20 p-0.5 ml-auto">
                  <button
                    onClick={() => setViewMode("gallery")}
                    className={cn(
                      "p-2 rounded-md transition-all duration-300",
                      viewMode === "gallery"
                        ? "bg-museum-gold/20 text-museum-gold"
                        : "text-museum-paper/40 hover:text-museum-paper"
                    )}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-2 rounded-md transition-all duration-300",
                      viewMode === "list"
                        ? "bg-museum-gold/20 text-museum-gold"
                        : "text-museum-paper/40 hover:text-museum-paper"
                    )}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-museum-gold/15 animate-fade-in">
                <div className="flex flex-wrap gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-museum-paper/50 font-medium flex items-center gap-1.5">
                      <Trophy className="w-3 h-3 text-museum-gold" />
                      珍贵等级
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <FilterButton
                        active={filterRank === "all"}
                        onClick={() => setFilterRank("all")}
                      >
                        全部
                      </FilterButton>
                      {(["S", "A", "B", "C", "D"] as BugRank[]).map((rank) => (
                        <FilterButton
                          key={rank}
                          active={filterRank === rank}
                          onClick={() => setFilterRank(rank)}
                        >
                          {rankLabels[rank]}
                        </FilterButton>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-museum-paper/50 font-medium flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-museum-gold" />
                      危险程度
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <FilterButton
                        active={filterSeverity === "all"}
                        onClick={() => setFilterSeverity("all")}
                      >
                        全部
                      </FilterButton>
                      {(["low", "medium", "high"] as BugSeverity[]).map((severity) => (
                        <FilterButton
                          key={severity}
                          active={filterSeverity === severity}
                          onClick={() => setFilterSeverity(severity)}
                        >
                          {severityLabels[severity]}
                        </FilterButton>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 ml-auto">
                    <label className="text-xs text-museum-paper/50 font-medium flex items-center gap-1.5">
                      <Activity className="w-3 h-3 text-museum-gold" />
                      排序方式
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <FilterButton
                        active={sortBy === "match"}
                        onClick={() => setSortBy("match")}
                      >
                        匹配度
                      </FilterButton>
                      <FilterButton
                        active={sortBy === "danger"}
                        onClick={() => setSortBy("danger")}
                      >
                        危险度
                      </FilterButton>
                      <FilterButton
                        active={sortBy === "rank"}
                        onClick={() => setSortBy("rank")}
                      >
                        珍贵度
                      </FilterButton>
                      <FilterButton
                        active={sortBy === "recurrence"}
                        onClick={() => setSortBy("recurrence")}
                      >
                        复发率
                      </FilterButton>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {displayResults.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4 animate-fade-up opacity-0 stagger-delay-3">
            <p className="text-sm text-museum-paper/50">
              共展出 <span className="text-museum-gold font-medium">{displayResults.length}</span> 件标本
            </p>
          </div>

          <div
            className={cn(
              "grid gap-5 animate-fade-up opacity-0 stagger-delay-3",
              viewMode === "gallery"
                ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                : "grid-cols-1 max-w-4xl mx-auto"
            )}
          >
            {displayResults.map((result, index) => (
              <ExhibitCard
                key={result.bug.id}
                matchResult={result}
                index={index}
                isExpanded={expandedBugId === result.bug.id}
                onToggle={() => toggleBugExpansion(result.bug.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16 animate-fade-in opacity-0">
          <div className="w-16 h-16 rounded-2xl bg-museum-wallLight/30 border border-museum-gold/20 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-museum-gold/30" />
          </div>
          <h3 className="font-display text-xl text-museum-paper mb-2">
            没有找到符合条件的标本
          </h3>
          <p className="text-sm text-museum-paper/40 max-w-md mx-auto mb-6">
            试试调整筛选条件或搜索关键词
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-museum-gold/10 border border-museum-gold/30 text-museum-gold text-sm hover:bg-museum-gold/20 transition-colors"
          >
            <X className="w-4 h-4" />
            清除所有筛选
          </button>
        </div>
      )}
    </div>
  );
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function FilterButton({ active, onClick, children }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-300",
        active
          ? "bg-museum-gold/20 border border-museum-gold/50 text-museum-gold"
          : "bg-museum-wall/30 border border-museum-gold/10 text-museum-paper/50 hover:text-museum-paper hover:border-museum-gold/30"
      )}
    >
      {children}
    </button>
  );
}
