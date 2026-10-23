import { useState, useCallback } from "react";
import {
  scanDirectory,
  organizeDirectory,
  type ScanResult,
  type OrganizeResult,
  CATEGORY_MAP,
} from "./organizer";

type Phase = "idle" | "scanning" | "scanned" | "organizing" | "done";

const CATEGORY_COLORS: Record<string, string> = {
  Documents: "#3b82f6",
  Images: "#22c55e",
  Videos: "#f59e0b",
  Archives: "#a855f7",
  Code: "#06b6d4",
  Others: "#8b90a0",
};

const CATEGORY_ICONS: Record<string, string> = {
  Documents: "📄",
  Images: "🖼",
  Videos: "🎬",
  Archives: "🗜",
  Code: "💻",
  Others: "📦",
};

export default function App() {
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [dirName, setDirName] = useState<string>("");
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [result, setResult] = useState<OrganizeResult | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number; name: string } | null>(null);

  const supported = typeof window !== "undefined" && "showDirectoryPicker" in window;

  const pickDirectory = useCallback(async () => {
    setError(null);
    setScan(null);
    setResult(null);
    setProgress(null);

    try {
      const handle = await (window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker();
      setDirHandle(handle);
      setDirName(handle.name);
      setPhase("scanning");

      const result = await scanDirectory(handle);
      setScan(result);
      setPhase("scanned");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setPhase("idle");
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to access directory");
      setPhase("idle");
    }
  }, []);

  const runOrganize = useCallback(async () => {
    if (!dirHandle || !scan) return;
    setPhase("organizing");
    setProgress(null);

    try {
      const res = await organizeDirectory(dirHandle, scan, (current, total, name) => {
        setProgress({ current, total, name });
      });
      setResult(res);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to organize");
      setPhase("scanned");
    }
  }, [dirHandle, scan]);

  const reset = useCallback(() => {
    setScan(null);
    setResult(null);
    setProgress(null);
    setError(null);
    setPhase("idle");
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 60px" }}>
      <header style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
          Directory Organizer
        </h1>
        <p style={{ color: "var(--text-dim)", fontSize: 16 }}>
          Pick a cluttered folder and sort every file into tidy category subfolders.
        </p>
      </header>

      {!supported && (
        <div style={bannerStyle("warning")}>
          <strong>Limited browser support.</strong> The File System Access API is only
          available in Chrome, Edge, and other Chromium browsers. Please switch to one
          of those to use the folder organizer.
        </div>
      )}

      {error && (
        <div style={bannerStyle("error")} role="alert">
          {error}
        </div>
      )}

      {/* Step 1: Pick folder */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={stepBadgeStyle()}>1</span>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Choose a folder</h2>
        </div>
        <button
          onClick={pickDirectory}
          disabled={!supported || phase === "scanning"}
          style={{
            ...primaryButtonStyle,
            opacity: !supported ? 0.5 : 1,
          }}
        >
          {phase === "scanning" ? "Scanning…" : dirHandle ? "Pick a different folder" : "Select folder to organize"}
        </button>
        {dirName && (
          <p style={{ marginTop: 12, color: "var(--text-dim)", fontSize: 14 }}>
            Selected: <code style={codeStyle}>{dirName}</code>
          </p>
        )}
      </div>

      {/* Step 2: Scan results */}
      {scan && (
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={stepBadgeStyle()}>2</span>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Review scan</h2>
          </div>

          <div style={{ display: "flex", gap: 24, marginBottom: 20, flexWrap: "wrap" }}>
            <Stat label="Files found" value={scan.total} />
            <Stat label="Categories" value={Object.keys(scan.categoryCounts).length} />
            <Stat label="Skipped" value={scan.skipped} dim />
          </div>

          {scan.total === 0 ? (
            <p style={{ color: "var(--text-dim)" }}>
              No movable files found in this folder. Try a different directory.
            </p>
          ) : (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {Object.entries(scan.categoryCounts)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([category, count]) => (
                    <span
                      key={category}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 12px",
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 500,
                        background: `${CATEGORY_COLORS[category]}1a`,
                        color: CATEGORY_COLORS[category],
                        border: `1px solid ${CATEGORY_COLORS[category]}33`,
                      }}
                    >
                      {CATEGORY_ICONS[category]} {category} · {count}
                    </span>
                  ))}
              </div>

              <details>
                <summary style={{ cursor: "pointer", color: "var(--text-dim)", fontSize: 14, marginBottom: 8 }}>
                  Show file list ({scan.files.length})
                </summary>
                <div style={{ maxHeight: 240, overflowY: "auto", borderTop: `1px solid var(--border)`, marginTop: 8 }}>
                  {scan.files.map((f) => (
                    <div
                      key={f.name}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "6px 0",
                        fontSize: 13,
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <span style={{ fontFamily: "var(--mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 12 }}>
                        {f.name}
                      </span>
                      <span style={{ color: CATEGORY_COLORS[f.category], fontWeight: 500, flexShrink: 0 }}>
                        {f.category}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            </>
          )}
        </div>
      )}

      {/* Step 3: Organize */}
      {scan && scan.total > 0 && phase !== "done" && (
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={stepBadgeStyle()}>3</span>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Organize files</h2>
          </div>
          <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 16 }}>
            Files will be moved into new subfolders by category. Name collisions are
            resolved automatically with numeric suffixes.
          </p>
          {progress && phase === "organizing" && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-dim)", marginBottom: 6 }}>
                <span>Moving {progress.name}…</span>
                <span>{progress.current} / {progress.total}</span>
              </div>
              <div style={{ height: 6, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${(progress.current / progress.total) * 100}%`,
                    background: "var(--accent)",
                    borderRadius: 3,
                    transition: "width 0.2s ease",
                  }}
                />
              </div>
            </div>
          )}
          <button
            onClick={runOrganize}
            disabled={phase === "organizing"}
            style={primaryButtonStyle}
          >
            {phase === "organizing" ? "Organizing…" : "Organize now"}
          </button>
        </div>
      )}

      {/* Done: summary */}
      {result && phase === "done" && (
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span style={stepBadgeStyle()}>4</span>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Summary</h2>
          </div>

          <div style={{ display: "flex", gap: 24, marginBottom: 20, flexWrap: "wrap" }}>
            <Stat label="Files moved" value={result.totalMoved} />
            <Stat label="Categories" value={Object.keys(result.moved).length} />
            <Stat label="Errors" value={result.errors.length} error={result.errors.length > 0} />
          </div>

          {Object.keys(result.moved).length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: result.errors.length ? 20 : 0 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={thStyle}>Category</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Files moved</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(result.moved)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([category, count]) => (
                    <tr key={category} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ ...tdStyle, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: CATEGORY_COLORS[category], display: "inline-block" }} />
                        {category}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right", fontFamily: "var(--mono)" }}>{count}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {result.errors.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p style={{ color: "var(--error)", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                Errors ({result.errors.length})
              </p>
              <div style={{ maxHeight: 160, overflowY: "auto" }}>
                {result.errors.map((e, i) => (
                  <div key={i} style={{ fontSize: 13, fontFamily: "var(--mono)", color: "var(--text-dim)", padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
                    {e}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={reset} style={{ ...secondaryButtonStyle, marginTop: 20 }}>
            Organize another folder
          </button>
        </div>
      )}

      {/* Category legend (always visible when idle) */}
      {!scan && supported && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-dim)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Category mapping
          </h3>
          <div style={{ display: "grid", gap: 8 }}>
            {Object.entries(CATEGORY_MAP).map(([category, exts]) => (
              <div key={category} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontSize: 16, marginTop: 1 }}>{CATEGORY_ICONS[category]}</span>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: CATEGORY_COLORS[category] }}>{category}</span>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--mono)" }}>
                    {exts.join("  ")}
                  </div>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontSize: 16, marginTop: 1 }}>{CATEGORY_ICONS.Others}</span>
              <div>
                <span style={{ fontSize: 14, fontWeight: 600, color: CATEGORY_COLORS.Others }}>Others</span>
                <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                  Any extension not listed above
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Small components ---

function Stat({ label, value, dim, error }: { label: string; value: number; dim?: boolean; error?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 28, fontWeight: 700, color: error ? "var(--error)" : dim ? "var(--text-dim)" : "var(--text)" }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{label}</div>
    </div>
  );
}

// --- Inline styles ---

const cardStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 24,
  marginBottom: 16,
};

const primaryButtonStyle: React.CSSProperties = {
  background: "var(--accent)",
  color: "#fff",
  fontSize: 15,
  fontWeight: 600,
  padding: "12px 28px",
  borderRadius: "var(--radius-sm)",
  transition: "background 0.15s ease",
};

const secondaryButtonStyle: React.CSSProperties = {
  background: "var(--surface-2)",
  color: "var(--text)",
  fontSize: 15,
  fontWeight: 500,
  padding: "12px 28px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border)",
  transition: "background 0.15s ease",
};

const stepBadgeStyle = (): React.CSSProperties => ({
  width: 28,
  height: 28,
  borderRadius: "50%",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
  fontWeight: 700,
  color: "var(--accent)",
  flexShrink: 0,
});

const codeStyle: React.CSSProperties = {
  fontFamily: "var(--mono)",
  background: "var(--surface-2)",
  padding: "2px 8px",
  borderRadius: 4,
  fontSize: 14,
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 0",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--text-dim)",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 0",
  fontSize: 14,
};

function bannerStyle(type: "warning" | "error"): React.CSSProperties {
  const color = type === "error" ? "var(--error)" : "var(--warning)";
  return {
    background: `${color}1a`,
    border: `1px solid ${color}33`,
    borderRadius: "var(--radius-sm)",
    padding: "12px 16px",
    marginBottom: 16,
    fontSize: 14,
    color,
  };
}
