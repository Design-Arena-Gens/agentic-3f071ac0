'use client';

import { useCallback, useMemo, useState } from "react";
import styles from "./page.module.css";
import {
  BASE_CORPUS,
  buildModel,
  generateText,
  FALLBACK_CHAR,
  mergeCorpus,
  rankNextTokens,
  type Candidate,
  type TinyLLMModel,
} from "@/lib/tinyLLM";

const DEFAULT_PROMPT = "once upon a time ";
const DEFAULT_MAX_TOKENS = 160;
const DEFAULT_TEMPERATURE = 0.85;
const RANK_LIMIT = 6;
export default function Home() {
  const [model, setModel] = useState<TinyLLMModel>(() => buildModel(BASE_CORPUS));
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [maxTokens, setMaxTokens] = useState(DEFAULT_MAX_TOKENS);
  const [temperature, setTemperature] = useState(DEFAULT_TEMPERATURE);
  const [seedText, setSeedText] = useState("42");
  const [customTraining, setCustomTraining] = useState("");
  const [generated, setGenerated] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const resolvedSeed = useMemo(() => {
    const trimmed = seedText.trim();
    if (trimmed.length === 0) {
      return null;
    }

    const parsed = Number.parseInt(trimmed, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }, [seedText]);

  const topCandidates: Candidate[] = useMemo(
    () => rankNextTokens(model, prompt, RANK_LIMIT),
    [model, prompt],
  );

  const handleGenerate = useCallback(() => {
    const output = generateText(model, prompt, {
      maxTokens,
      temperature,
      seed: resolvedSeed,
    });
    setGenerated(output);
    setStatusMessage(
      `Generated ${maxTokens} tokens ${
        resolvedSeed === null ? "with random seed" : `using seed ${resolvedSeed}`
      }.`,
    );
  }, [model, prompt, maxTokens, temperature, resolvedSeed]);

  const handleTrain = useCallback(() => {
    if (customTraining.trim().length === 0) {
      setStatusMessage("Add some custom training text before retraining.");
      return;
    }
    const updated = mergeCorpus(model.corpus, customTraining);
    setModel(updated);
    setCustomTraining("");
    setStatusMessage("Model retrained with custom corpus extension.");
  }, [customTraining, model]);

  const resetModel = useCallback(() => {
    setModel(buildModel(BASE_CORPUS));
    setStatusMessage("Model reset to the default tiny corpus.");
  }, []);

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <h1>Tiny Character LLM</h1>
        <p>
          A fully client-side bigram language model. Extend the corpus, explore
          token probabilities, and generate fresh text right in your browser.
        </p>
        <div className={styles.meta}>
          <span>Vocabulary size: {model.vocabulary.length}</span>
          <span>Corpus tokens: {model.corpus.length}</span>
        </div>
      </header>

      <section className={styles.controlPanel}>
        <div className={styles.fieldGroup}>
          <label htmlFor="prompt">Prompt</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={4}
            className={styles.textarea}
            placeholder="Enter starting text..."
          />
        </div>

        <div className={styles.controls}>
          <label className={styles.control}>
            <span>Max tokens</span>
            <input
              type="number"
              min={16}
              max={800}
              value={maxTokens}
              onChange={(event) => {
                const parsed = Number.parseInt(event.target.value, 10);
                if (!Number.isNaN(parsed)) {
                  const clamped = Math.min(Math.max(parsed, 16), 800);
                  setMaxTokens(clamped);
                }
              }}
            />
          </label>
          <label className={styles.control}>
            <span>Temperature</span>
            <input
              type="range"
              min={0.1}
              max={1.5}
              step={0.05}
              value={temperature}
              onChange={(event) =>
                setTemperature(Number.parseFloat(event.target.value))
              }
            />
            <span className={styles.controlValue}>{temperature.toFixed(2)}</span>
          </label>
          <label className={styles.control}>
            <span>Seed (optional)</span>
            <input
              type="text"
              value={seedText}
              placeholder="Leave blank for randomness"
              onChange={(event) => setSeedText(event.target.value)}
            />
          </label>
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={handleGenerate}>
            Generate
          </button>
          <button type="button" onClick={resetModel} className={styles.secondary}>
            Reset Model
          </button>
        </div>
        {statusMessage && <p className={styles.status}>{statusMessage}</p>}
      </section>

      <section className={styles.outputSection}>
        <h2>Generated Output</h2>
        <textarea
          value={generated}
          readOnly
          className={styles.output}
          rows={10}
          placeholder="Click generate to create text..."
        />
      </section>

      <section className={styles.analysisSection}>
        <div className={styles.analysisHeader}>
          <h2>Next Token Probabilities</h2>
          <p>
            Based on the last character of your prompt, here are the top-ranked
            continuations predicted by the model.
          </p>
        </div>
        <ul className={styles.candidateList}>
          {topCandidates.map((candidate) => (
            <li key={`${candidate.token}-${candidate.probability}`}>
              <span className={styles.token}>
                {candidate.token === FALLBACK_CHAR ? "␠" : candidate.token}
              </span>
              <span className={styles.probability}>
                {(candidate.probability * 100).toFixed(2)}%
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.trainingSection}>
        <div className={styles.analysisHeader}>
          <h2>Fine-tune the Tiny LLM</h2>
          <p>
            Paste additional text to augment the training corpus. The model
            updates instantly on the client—no servers required.
          </p>
        </div>
        <textarea
          value={customTraining}
          onChange={(event) => setCustomTraining(event.target.value)}
          rows={6}
          className={styles.textarea}
          placeholder="Add new stories, vocabulary, or domain-specific terms..."
        />
        <div className={styles.actions}>
          <button type="button" onClick={handleTrain}>
            Retrain with custom text
          </button>
        </div>
      </section>
    </main>
  );
}
