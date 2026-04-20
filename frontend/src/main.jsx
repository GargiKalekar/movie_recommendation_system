import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage.jsx";
import App from "./App.jsx"; // your existing movie app
import "./index.css";
import SearchPage from "./SearchPage";
import KeySearchPage from "./KeywordPage"

// inside <Routes>

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<App />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/keyword-search" element={<KeySearchPage/>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);