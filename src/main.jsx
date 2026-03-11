import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { UnitProvider } from "./context/UnitContext";
import "./styles/index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <UnitProvider>
        <App />
      </UnitProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
