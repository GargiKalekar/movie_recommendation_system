import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Beams from "./Beams"; // adjust path if needed
import "./landing.css";

const TICKER_MOVIES = [
  "The Godfather", "Pulp Fiction", "Inception", "Interstellar",
  "2001: A Space Odyssey", "Shantya", "Mulholland Drive", "Blade Runner",
  "Spirited Away", "Mitra", "Pan's Labyrinth", "Amélie",
  "There Will Be Blood", "No Country for Old Men", "The Shining",
];

export default function LandingPage() {
  const navigate = useNavigate();
  const tickerRef = useRef(null);

  useEffect(() => {
    // Duplicate items so ticker loops seamlessly
    if (tickerRef.current) {
      const original = tickerRef.current.innerHTML;
      tickerRef.current.innerHTML = original + original;
    }
  }, []);

  return (
    <div className="landing-root">
      {/* Beams background */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Beams
          beamWidth={3}
          beamHeight={30}
          beamNumber={20}
          lightColor="#e23e3e"
          speed={5}
          noiseIntensity={1.5}
          scale={0.2}
          rotation={30}
        />
      </div>

      {/* Film perforations left */}
      <div className="perforations left">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="perf-hole" />
        ))}
      </div>

      {/* Film perforations right */}
      <div className="perforations right">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="perf-hole" />
        ))}
      </div>

      {/* Hero */}
      <main className="hero">
        {/* <div className="eyebrow">
          <span className="dot" />
          Your personal cinema guide
        </div> */}

        <h1 className="headline">
          <span className="headline-line fade-up delay-1">Find your</span>
          <span className="headline-line accent fade-up delay-2">next favourite</span>
          <span className="headline-line fade-up delay-3">film.</span>
        </h1>

        <p className="subtext fade-up delay-4">
          Search thousands of movies. Get instant recommendations
          <br />based on what you already love.
        </p>

        <button
          className="cta fade-up delay-5"
          onClick={() => navigate("/search")}
        >
          <span>Explore movies</span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </main>

      {/* Scrolling ticker */}
      <div className="ticker-wrapper fade-up delay-6">
        <div className="ticker-track" ref={tickerRef}>
          {TICKER_MOVIES.map((m, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-bullet">◆</span> {m}
            </span>
          ))}
        </div>
      </div>

      {/* Footer strip */}
      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} CineMatch</span>
        <span className="footer-divider">|</span>
        <span>Powered by data, driven by taste</span>
      </footer>
    </div>
  );
}