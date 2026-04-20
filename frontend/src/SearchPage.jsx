import { useState, useRef, useEffect } from "react";
import Beams from "./Beams";
import Galaxy from "./Galaxy"
import "./search-page.css";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3001/api/movies";

const RANK_COLORS = ["#c4a265", "#8a7d6a", "#5a4f3e"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [notFound, setNotFound] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef(null);
  const tickerRef = useRef(null);
 
  const TICKER_MOVIES = [
    "The Godfather", "Pulp Fiction", "Inception", "Interstellar",
    "2001: A Space Odyssey", "Parasite", "Mulholland Drive", "Blade Runner",
    "Spirited Away", "Oldboy", "Pan's Labyrinth", "Amélie",
    "There Will Be Blood", "No Country for Old Men", "The Shining",
  ];
  const navigate = useNavigate();
  useEffect(() => {
    if (tickerRef.current) {
      const original = tickerRef.current.innerHTML;
      tickerRef.current.innerHTML = original + original;
    }
    inputRef.current?.focus();
  }, []);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setNotFound(null);
    setSubmitted(true);

    try {
      const res = await fetch(`${API}/recommend?title=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) {
        setNotFound(data);
      } else {
        
        setResults(data.recommendations);
        console.log(results);
      }
    } catch {
      setError("Network error — is the server running?");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSuggestion = (s) => {
    setQuery(s);
    setNotFound(null);
    setResults(null);
    setSubmitted(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleReset = () => {
    setQuery("");
    setResults(null);
    setNotFound(null);
    setError(null);
    setSubmitted(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="sp-root">
      {/* Beams background */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        
         <Galaxy mouseRepulsion={false} mouseInteraction={false}/>
      </div>

      {/* Film perforations */}
      <div className="perforations left">
        {Array.from({ length: 20 }).map((_, i) => <div key={i} className="perf-hole" />)}
      </div>
      <div className="perforations right">
        {Array.from({ length: 20 }).map((_, i) => <div key={i} className="perf-hole" />)}
      </div>

      {/* Main content */}
      <main className="sp-main">

        {/* Logo / wordmark */}
        <h1 className="headline">
          <span className="headline-line fade-up delay-1">Ready to begin your</span>
          <span className="headline-line accent fade-up delay-2">next great adventure?</span>
          {/* <span className="headline-line fade-up delay-3">film.</span> */}
        </h1>

        {/* Search box */}
        <div className={`sp-search-wrap fade-up delay-2 ${submitted ? "sp-search-wrap--submitted" : ""}`}>
          <div className="sp-search-box">
            <svg className="sp-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="#4a4235" strokeWidth="1.5"/>
              <path d="M10.5 10.5L14 14" stroke="#4a4235" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              ref={inputRef}
              className="sp-input"
              type="text"
              placeholder="Enter a movie title for recommendations…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {query && (
              <button className="sp-clear" onClick={handleReset} aria-label="Clear">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="#4a4235" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}
            <button
              className="sp-submit"
              onClick={handleSearch}
              disabled={loading || !query.trim()}
            >
              {loading ? (
                <span className="sp-spinner" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>

          {/* Hint */}
          {!submitted && (
            <p className="sp-hint">Type a film you love and discover what to watch next</p>
          )}
        </div>
          <div className="sp-keyword-option">
  <span className="sp-keyword-text">
    Just want to search movies by keyword?
  </span>
  <button
    className="sp-keyword-link"
    onClick={() => navigate("/keyword-search")}
  >
    Explore by keyword
  </button>
</div>
        {/* Error */}
        {error && (
          <div className="sp-error fade-up">
            <span>⚠</span> {error}
          </div>
        )}

        {/* Not found + suggestions */}
        {notFound && (
          <div className="sp-not-found fade-up">
            <p className="sp-not-found-title">Movie not found.</p>
            {notFound.suggestions?.length > 0 && (
              <div className="sp-suggestions">
                <span className="sp-suggestions-label">Did you mean</span>
                {notFound.suggestions.map((s, i) => (
                  <button key={i} className="sp-suggestion-chip" onClick={() => handleSuggestion(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {results && Array.isArray(results) && (
          <div className="sp-results fade-up ">
            <p className="sp-results-label">
              Recommendations for <em>{query}</em>
            </p>
            <div className="sp-results-list">
              {results.map((movie, i) => (
               <div key={i} className="sp-result-item">
                  <span
                    className="sp-rank"
                    style={{ color: RANK_COLORS[Math.min(i, 2)] }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="sp-result-info">
                    <span className="sp-result-title">{movie.title ?? movie}</span>
                    {/* {movie.genres?.length > 0 && (
                      <div className="sp-genres">
                        {movie.genres.map((g) => (
                          <span key={g} className="sp-genre">{g}</span>
                        ))}
                      </div>
                    )} */}
                  </div>
                  {movie.score != null && (
                    <span className="sp-score">{Math.round(movie.score * 100)}%</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Ticker */}
      <div className="ticker-wrapper" style={{ opacity: submitted ? 0 : undefined }}>
        <div className="ticker-track" ref={tickerRef}>
          {TICKER_MOVIES.map((m, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-bullet">◆</span> {m}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} CineMatch</span>
        <span className="footer-divider">|</span>
        <span>Powered by data, driven by taste</span>
      </footer>
    </div>
  );
}