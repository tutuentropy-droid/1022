import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import ResultPage from "@/pages/ResultPage";
import RelationshipMapPage from "@/pages/RelationshipMapPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/relationship-map" element={<RelationshipMapPage />} />
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-museum-wall flex items-center justify-center">
              <div className="text-center">
                <h1 className="font-display text-4xl text-museum-paper mb-2">
                  404
                </h1>
                <p className="text-museum-paper/50 font-body">
                  这件展品还未收录入馆
                </p>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
