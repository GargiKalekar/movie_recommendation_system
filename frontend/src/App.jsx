import { useState, useCallback } from "react";

const API = "http://localhost:3001/api/movies";

function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (url) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) return { ok: false, data };
      return { ok: true, data };
    } catch {
      setError("Network error — is the server running?");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, setError, request };
}

// ── Search panel ─────────────────────────────────────────────────────────────

function SearchPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const { loading, error, setError, request } = useApi();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const res = await request(`${API}/search?q=${encodeURIComponent(query)}`);
    if (res) setResults(res.data);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch(e);
  };

  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>Search movies</h2>
      <div style={styles.inputRow}>
        <input
          style={styles.input}
          type="text"
          placeholder="e.g. dark"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setError(null); setResults(null); }}
          onKeyDown={handleKeyDown}
        />
        <button style={styles.btn} onClick={handleSearch} disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {error && <p style={styles.errorBox}>{error}</p>}

      {results && (
        <div style={styles.card}>
          {Array.isArray(results) && results.length === 0 ? (
            <p style={styles.muted}>No results found.</p>
          ) : Array.isArray(results) ? (
            results.map((movie, i) => (
              <div key={i} style={styles.listItem}>
                <span style={styles.listTitle}>{movie.title ?? movie}</span>
                {movie.year && <span style={styles.metaBadge}>{movie.year}</span>}
              </div>
            ))
          ) : (
            <pre style={styles.pre}>{JSON.stringify(results, null, 2)}</pre>
          )}
        </div>
      )}
    </section>
  );
}

// ── Recommend panel ───────────────────────────────────────────────────────────

function RecommendPanel() {
  const [title, setTitle] = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const [notFound, setNotFound] = useState(null);
  const { loading, error, setError, request } = useApi();

  const QUICK_PICKS = [];

  const fetchRec = async (movieTitle) => {
    setNotFound(null);
    setRecommendations(null);
    setError(null);
    const res = await request(`${API}/recommend?title=${encodeURIComponent(movieTitle)}`);
    if (!res) return;
    if (!res.ok) {
      setNotFound(res.data);
    } else {
      setRecommendations(res.data);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) fetchRec(title.trim());
  };

  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>Get recommendations</h2>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          type="text"
          placeholder="e.g. Avatar"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
        />
        <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={handleSubmit} disabled={loading}>
          {loading ? "Loading…" : "Recommend"}
        </button>
      </div>

      <div style={styles.chipRow}>
        {QUICK_PICKS.map((m) => (
          <button
            key={m}
            style={styles.chip}
            onClick={() => { setTitle(m); fetchRec(m); }}
          >
            {m}
          </button>
        ))}
      </div>

      {error && <p style={styles.errorBox}>{error}</p>}

      {notFound && (
        <div style={styles.errorBox}>
          <strong>Movie not found.</strong>
          {notFound.suggestions?.length > 0 && (
            <>
              {" "}Did you mean:{" "}
              {notFound.suggestions.map((s, i) => (
                <span key={i}>
                  <button
                    style={styles.inlineLink}
                    onClick={() => { setTitle(s); fetchRec(s); }}
                  >
                    {s}
                  </button>
                  {i < notFound.suggestions.length - 1 ? ", " : ""}
                </span>
              ))}
            </>
          )}
        </div>
      )}

      {recommendations && (
        <div>
          <p style={styles.muted}>
            Showing recommendations for{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>{title}</strong>
          </p>
          <div style={styles.card}>
            {Array.isArray(recommendations) ? (
              recommendations.map((movie, i) => (
                <div key={i} style={styles.recItem}>
                  <span style={{ ...styles.rank, background: RANK_COLORS[Math.min(i, 2)] }}>
                    #{i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.listTitle}>{movie.title ?? movie}</div>
                    {movie.genres && (
                      <div style={styles.genreRow}>
                        {movie.genres.map((g) => (
                          <span key={g} style={styles.genreBadge}>{g}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {movie.score != null && (
                    <span style={styles.scoreBadge}>{Math.round(movie.score * 100)}%</span>
                  )}
                </div>
              ))
            ) : (
              <pre style={styles.pre}>{JSON.stringify(recommendations, null, 2)}</pre>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <span style={styles.logo}>🎬</span>
        <h1 style={styles.appTitle}>Movie recommender</h1>
      </header>
      <main style={styles.main}>
        <SearchPanel />
        <RecommendPanel />
      </main>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const RANK_COLORS = ["#EEEDFE", "#E1F5EE", "#FAEEDA"];

const styles = {
  root: {
    minHeight: "100vh",
    background: "var(--color-background-tertiary, #f7f7f5)",
    fontFamily: "var(--font-sans, system-ui, sans-serif)",
    color: "var(--color-text-primary)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "1.25rem 1.5rem",
    borderBottom: "0.5px solid var(--color-border-tertiary, #e5e5e3)",
    background: "var(--color-background-primary, #fff)",
  },
  logo: { fontSize: 20 },
  appTitle: { fontSize: 18, fontWeight: 500 },
  main: {
    maxWidth: 640,
    margin: "0 auto",
    padding: "1.5rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  section: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  inputRow: { display: "flex", gap: 8 },
  input: {
    flex: 1,
    padding: "8px 12px",
    fontSize: 14,
    border: "0.5px solid var(--color-border-tertiary, #d1d1cf)",
    borderRadius: 8,
    outline: "none",
    background: "var(--color-background-primary, #fff)",
    color: "var(--color-text-primary)",
  },
  btn: {
    padding: "8px 16px",
    fontSize: 14,
    borderRadius: 8,
    border: "0.5px solid var(--color-border-secondary, #c0c0be)",
    background: "var(--color-background-primary, #fff)",
    cursor: "pointer",
    whiteSpace: "nowrap",
    color: "var(--color-text-primary)",
  },
  btnPrimary: {
    background: "#E6F1FB",
    color: "#185FA5",
    borderColor: "#B5D4F4",
  },
  chipRow: { display: "flex", gap: 6, flexWrap: "wrap" },
  chip: {
    padding: "4px 12px",
    fontSize: 12,
    borderRadius: 999,
    border: "0.5px solid var(--color-border-tertiary, #d1d1cf)",
    background: "var(--color-background-secondary, #f1efe8)",
    cursor: "pointer",
    color: "var(--color-text-secondary)",
  },
  card: {
    background: "var(--color-background-primary, #fff)",
    border: "0.5px solid var(--color-border-tertiary, #d1d1cf)",
    borderRadius: 12,
    padding: "0.25rem 1.25rem",
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "0.5px solid var(--color-border-tertiary, #e5e5e3)",
  },
  recItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 0",
    borderBottom: "0.5px solid var(--color-border-tertiary, #e5e5e3)",
  },
  listTitle: { fontSize: 14, fontWeight: 500 },
  metaBadge: {
    fontSize: 11,
    padding: "2px 8px",
    borderRadius: 6,
    background: "var(--color-background-secondary, #f1efe8)",
    color: "var(--color-text-secondary)",
  },
  rank: {
    width: 36, height: 36,
    borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 500, flexShrink: 0,
  },
  genreRow: { display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" },
  genreBadge: {
    fontSize: 11,
    padding: "2px 7px",
    borderRadius: 6,
    background: "#E6F1FB",
    color: "#185FA5",
  },
  scoreBadge: {
    fontSize: 11,
    padding: "2px 8px",
    borderRadius: 6,
    background: "#EAF3DE",
    color: "#3B6D11",
    fontWeight: 500,
  },
  errorBox: {
    background: "#FCEBEB",
    color: "#A32D2D",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
  },
  inlineLink: {
    background: "none",
    border: "none",
    color: "#185FA5",
    cursor: "pointer",
    fontSize: 14,
    textDecoration: "underline",
    padding: 0,
  },
  muted: { fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 6 },
  pre: { fontSize: 12, overflowX: "auto", padding: "0.5rem 0" },
};