import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import { healthCheck } from "./api/client";
import { useAsync } from "./hooks/useAsync";

const LANGUAGE_OPTIONS = [
  { code: "auto", label: "Auto-detect" },
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "hi", label: "Hindi" },
  { code: "zh", label: "Chinese" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" }
];

function safeTrim(s) {
  return (s || "").trim();
}

function getLanguageLabel(code) {
  return LANGUAGE_OPTIONS.find((l) => l.code === code)?.label || code;
}

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState("dark");

  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("en");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");

  const [formError, setFormError] = useState("");

  // Backend status (OpenAPI currently only includes GET `/`)
  const health = useAsync(healthCheck, true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const canTranslate = useMemo(() => safeTrim(inputText).length > 0, [inputText]);

  // PUBLIC_INTERFACE
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const swapLanguages = useCallback(() => {
    // If source is auto-detect, swapping doesn't make sense; keep auto as source.
    if (sourceLang === "auto") {
      setFormError("Cannot swap when Source is Auto-detect. Choose a specific source language first.");
      return;
    }
    setFormError("");
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  }, [sourceLang, targetLang]);

  const onTranslate = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError("");

      if (!canTranslate) {
        setFormError("Please enter text to translate.");
        return;
      }

      // UI is implemented end-to-end, but backend translation endpoints are not present in current OpenAPI.
      // So we provide a graceful placeholder output that still demonstrates app flow.
      setOutputText(
        [
          "Backend translation endpoint not available yet.",
          "",
          `Your input (${getLanguageLabel(sourceLang)} → ${getLanguageLabel(targetLang)}):`,
          inputText
        ].join("\n")
      );
    },
    [canTranslate, inputText, sourceLang, targetLang]
  );

  const clearAll = useCallback(() => {
    setFormError("");
    setInputText("");
    setOutputText("");
  }, []);

  return (
    <div className="App">
      <header className="RetroHeader">
        <div className="RetroHeader__brand" aria-label="App title">
          <span className="RetroHeader__badge" aria-hidden="true">
            CRT
          </span>
          <div>
            <h1 className="RetroTitle">Global Language Translator</h1>
            <p className="RetroSubtitle">Retro terminal vibes. Modern translation workflow.</p>
          </div>
        </div>

        <div className="RetroHeader__actions">
          <button
            className="btn btn-ghost"
            onClick={() => health.run()}
            type="button"
            aria-label="Re-check backend status"
          >
            {health.loading ? "Pinging…" : "Ping backend"}
          </button>

          <button
            className="btn btn-primary"
            onClick={toggleTheme}
            type="button"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </header>

      <main className="RetroMain">
        <section className="RetroCard" aria-labelledby="translator-heading">
          <div className="RetroCard__header">
            <h2 id="translator-heading" className="RetroCard__title">
              Translate
            </h2>

            <div className="RetroStatus" role="status" aria-live="polite">
              <span
                className={[
                  "RetroDot",
                  health.loading ? "RetroDot--warn" : health.data?.ok ? "RetroDot--ok" : "RetroDot--err"
                ].join(" ")}
                aria-hidden="true"
              />
              <span className="RetroStatus__text">
                {health.loading
                  ? "Backend: checking…"
                  : health.data?.ok
                    ? "Backend: online"
                    : "Backend: offline (or CORS not configured)"}
              </span>
            </div>
          </div>

          {health.error ? (
            <div className="RetroAlert RetroAlert--error" role="alert">
              <strong>Network error:</strong> {String(health.error.message || health.error)}
            </div>
          ) : null}

          <form onSubmit={onTranslate} className="RetroForm" aria-describedby="form-help">
            <p id="form-help" className="RetroHelp">
              Tip: Choose languages, type text, then press <kbd>Translate</kbd>.
            </p>

            <div className="RetroGrid">
              <div className="RetroField">
                <label className="RetroLabel" htmlFor="sourceLang">
                  Source language
                </label>
                <select
                  id="sourceLang"
                  className="RetroSelect"
                  value={sourceLang}
                  onChange={(e) => {
                    setFormError("");
                    setSourceLang(e.target.value);
                  }}
                >
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="RetroField RetroField--center">
                <button className="btn btn-ghost" type="button" onClick={swapLanguages} aria-label="Swap languages">
                  Swap
                </button>
              </div>

              <div className="RetroField">
                <label className="RetroLabel" htmlFor="targetLang">
                  Target language
                </label>
                <select
                  id="targetLang"
                  className="RetroSelect"
                  value={targetLang}
                  onChange={(e) => {
                    setFormError("");
                    setTargetLang(e.target.value);
                  }}
                >
                  {LANGUAGE_OPTIONS.filter((l) => l.code !== "auto").map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="RetroGrid RetroGrid--2">
              <div className="RetroField">
                <label className="RetroLabel" htmlFor="inputText">
                  Input
                </label>
                <textarea
                  id="inputText"
                  className="RetroTextarea"
                  value={inputText}
                  onChange={(e) => {
                    setFormError("");
                    setInputText(e.target.value);
                  }}
                  placeholder="Type text to translate…"
                  rows={8}
                />
              </div>

              <div className="RetroField">
                <label className="RetroLabel" htmlFor="outputText">
                  Output
                </label>
                <textarea
                  id="outputText"
                  className="RetroTextarea RetroTextarea--readonly"
                  value={outputText}
                  readOnly
                  placeholder="Translation will appear here…"
                  rows={8}
                />
              </div>
            </div>

            {formError ? (
              <div className="RetroAlert RetroAlert--error" role="alert">
                {formError}
              </div>
            ) : null}

            <div className="RetroActions">
              <button className="btn btn-primary" type="submit" disabled={!canTranslate}>
                Translate
              </button>

              <button className="btn btn-ghost" type="button" onClick={clearAll}>
                Clear
              </button>
            </div>

            <div className="RetroFooterNote" aria-label="Note about backend integration">
              <strong>Integration note:</strong> backend currently exposes only a health endpoint (<code>GET /</code>).
              When translation endpoints are added, wire them in <code>src/api/client.js</code>.
            </div>
          </form>
        </section>
      </main>

      <footer className="RetroFooter">
        <span>© {new Date().getFullYear()} Global Language Translator</span>
        <span className="RetroFooter__sep" aria-hidden="true">
          •
        </span>
        <a className="RetroLink" href="/docs" onClick={(e) => e.preventDefault()} aria-label="API docs link placeholder">
          API Docs (backend)
        </a>
      </footer>
    </div>
  );
}

export default App;
