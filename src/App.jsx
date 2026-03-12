import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SkeletonBlock } from "./components/ui/Skeleton";

// Lazy loaded routes for better performance
const CalculatorPage = lazy(() => import("./pages/calculator/CalculatorPage"));
const VastuPage = lazy(() => import("./pages/vastu/VastuPage"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <main style={{ flex: 1 }}>
          <Suspense fallback={
            <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
              <SkeletonBlock width="100%" height="60px" borderRadius="12px" style={{ marginBottom: "2rem" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "2rem" }}>
                <SkeletonBlock width="100%" height="80vh" borderRadius="12px" />
                <SkeletonBlock width="100%" height="100%" borderRadius="12px" />
              </div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<CalculatorPage />} />
              <Route path="/vastu" element={<VastuPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
