import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/layout/Header/Header";
import Footer from "./components/layout/Footer/Footer";

import CalculatorPage from "./pages/CalculatorPage";
import VastuPage from "./pages/VastuPage";

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
      <Header />
      <Routes>
        <Route path="/" element={<CalculatorPage />} />
        <Route path="/vastu" element={<VastuPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
