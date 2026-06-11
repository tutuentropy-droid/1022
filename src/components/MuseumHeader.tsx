import { BookOpen, Map, Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";

export function MuseumHeader() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isResult = location.pathname === "/result";
  const isMap = location.pathname === "/relationship-map";

  return (
    <header className="relative py-6 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-museum-gold/60 flex items-center justify-center bg-museum-wallLight/30 group-hover:bg-museum-gold/20 transition-all duration-300">
                <BookOpen className="w-5 h-5 text-museum-gold" />
              </div>
              <div className="absolute -inset-1 rounded-full border border-museum-gold/20 animate-pulse" />
            </div>
            <div>
              <h1 className="font-display text-xl md:text-2xl font-bold text-museum-paper tracking-wider text-shadow-gold">
                认知 Bug 博物馆
              </h1>
              <p className="text-museum-gold/70 text-[10px] tracking-widest">
                MUSEUM OF COGNITIVE BUGS
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all",
                isHome || isResult
                  ? "bg-museum-gold/20 text-museum-gold border border-museum-gold/30"
                  : "text-museum-paper/50 hover:text-museum-paper/70 hover:bg-museum-paper/5"
              )}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Bug 诊断</span>
            </Link>
            <Link
              to="/relationship-map"
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all",
                isMap
                  ? "bg-museum-gold/20 text-museum-gold border border-museum-gold/30"
                  : "text-museum-paper/50 hover:text-museum-paper/70 hover:bg-museum-paper/5"
              )}
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">关系地图</span>
            </Link>
          </nav>
        </div>

        <div className="museum-divider max-w-md mx-auto">
          <span className="text-museum-gold/60 text-xs">❖</span>
        </div>
      </div>
    </header>
  );
}
