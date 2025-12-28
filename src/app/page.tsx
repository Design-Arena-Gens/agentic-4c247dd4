"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AVAILABLE_NICHES, type Niche } from "@/data/mockScanData";

type ScanMode = "targeted" | "niche";

type ScanResult = {
  id: string;
  profileHandle: string;
  profileUrl: string;
  profileDisplayName: string;
  postUrl: string;
  thumbnailUrl: string;
  postType: "post" | "reel";
  postedAt: string;
  commentText: string;
  commentTimestamp: string;
};

type ScanSummary = {
  username: string;
  mode: ScanMode;
  niche: Niche | null;
  totalMatches: number;
  scannedProfiles: number;
  scannedPosts: number;
  durationMs: number;
  datasetProfiles: number;
  skippedTargets: Array<{ provided: string; reason: string }>;
  scannedProfilesLog?: Array<{
    handle: string;
    profileUrl: string;
    displayName: string;
    postsChecked: number;
    matchesFound: number;
  }>;
  message?: string;
  generatedAt?: string;
};

const MAX_PROGRESS = 96;
const progressMessages = [
  "Preparing scan environment",
  "Loading public profiles",
  "Checking recent posts and reels",
  "Parsing visible comments",
  "Matching usernames in cached data",
];

const MAX_TARGETED_PROFILES = 10;

function formatDateTime(value: string) {
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return value;
  }
}

function formatDuration(ms: number) {
  if (!ms || ms < 1) return "Less than 1s";
  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60);
  return `${minutes}m ${remainder}s`;
}

function parseProfileList(raw: string) {
  return raw
    .split(/\r?\n|,|\s{2,}/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function escapeCsvValue(value: string | number) {
  const stringValue = String(value ?? "");
  if (stringValue.includes('"') || stringValue.includes(",") || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export default function Home() {
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState<ScanMode>("targeted");
  const [profileUrls, setProfileUrls] = useState("");
  const [niche, setNiche] = useState<Niche>(AVAILABLE_NICHES[0]?.value ?? "cafes");
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState(progressMessages[0]);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [summary, setSummary] = useState<ScanSummary | null>(null);
  const [serverDisclaimer, setServerDisclaimer] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const nicheLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    AVAILABLE_NICHES.forEach((item) => {
      map[item.value] = item.label;
    });
    return map;
  }, []);

  const summaryNicheLabel = summary?.niche ? nicheLabelMap[summary.niche] ?? summary.niche : null;
  const hasScannedProfileLog = (summary?.scannedProfilesLog?.length ?? 0) > 0;
  const scannedProfilesLog = summary?.scannedProfilesLog ?? [];

  useEffect(() => {
    document.body.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  const canExport = results.length > 0;

  const handleExportCsv = () => {
    if (!canExport) return;
    const header = [
      "Profile Handle",
      "Profile Name",
      "Profile URL",
      "Post URL",
      "Post Type",
      "Post Date",
      "Comment Text",
      "Comment Timestamp",
    ];

    const rows = results.map((item) => [
      item.profileHandle,
      item.profileDisplayName,
      item.profileUrl,
      item.postUrl,
      item.postType,
      formatDateTime(item.postedAt),
      item.commentText,
      formatDateTime(item.commentTimestamp),
    ]);

    const csvLines = [header, ...rows]
      .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
      .join("\n");

    const blob = new Blob([csvLines], { type: "text/csv;charset=utf-8;" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute(
      "download",
      `public-instagram-comment-finder-${summary?.username ?? "export"}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isScanning) return;

    const trimmedUsername = username.trim();
    const parsedProfiles = parseProfileList(profileUrls);

    if (!trimmedUsername) {
      setError("Enter an Instagram username to begin scanning.");
      return;
    }

    if (mode === "targeted" && parsedProfiles.length === 0) {
      setError("Add one or more public profile URLs for a targeted scan.");
      return;
    }

    if (mode === "targeted" && parsedProfiles.length > MAX_TARGETED_PROFILES) {
      setError(`You can scan up to ${MAX_TARGETED_PROFILES} profiles at a time.`);
      return;
    }

    setError(null);
    setIsScanning(true);
    setResults([]);
    setSummary(null);
    setServerDisclaimer(null);
    setProgress(5);
    setProgressLabel(progressMessages[0]);

    const controller = new AbortController();
    const progressTimer = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= MAX_PROGRESS) {
          return prev;
        }
        return prev + Math.max(1, Math.round((MAX_PROGRESS - prev) * 0.2));
      });
    }, 850);

    const messageTimer = window.setInterval(() => {
      setProgressLabel((current) => {
        const index = progressMessages.indexOf(current);
        const nextIndex = index === -1 || index === progressMessages.length - 1 ? 0 : index + 1;
        return progressMessages[nextIndex];
      });
    }, 1900);

    try {
      const payload: Record<string, unknown> = {
        username: trimmedUsername,
        mode,
      };
      if (mode === "targeted") {
        payload.profileUrls = parsedProfiles;
      } else {
        payload.niche = niche;
      }

      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to complete scan request.");
      }

      setResults(Array.isArray(data.results) ? data.results : []);
      setSummary(data.summary ?? null);
      setServerDisclaimer(typeof data.disclaimer === "string" ? data.disclaimer : null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong while scanning public comments.";
      setError(message);
    } finally {
      controller.abort();
      window.clearInterval(progressTimer);
      window.clearInterval(messageTimer);
      setProgress(100);
      setProgressLabel("Scan completed");
      setIsScanning(false);
    }
  };

  const noMatchesFound = useMemo(() => {
    if (!summary) return false;
    return summary.totalMatches === 0;
  }, [summary]);

  return (
    <main className="page">
      <header className="hero">
        <div className="hero__content">
          <h1>Public Instagram Comment Finder</h1>
          <p>
            Discover where a public Instagram account has appeared in comment sections across the
            profiles we currently scan. Provide a username, pick a scan mode, and we&apos;ll surface
            any matches found in recent public posts or reels.
          </p>
          <div className="disclaimer">
            <strong>Important:</strong> Results are scoped to a curated cache of public profiles.
            Private content, deleted comments, or accounts outside the scanned list will not appear.
          </div>
        </div>
        <div className="hero__actions">
          <button
            type="button"
            className="toggle"
            aria-label="Toggle dark mode"
            onClick={() => setDarkMode((value) => !value)}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      <section className="panel">
        <form onSubmit={handleSubmit} className="form">
          <div className="field-group">
            <label htmlFor="username">Instagram username</label>
            <div className="field-with-hint">
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="e.g. socialsleuth"
                autoComplete="off"
              />
              <small>No @ symbol needed. Letters, numbers, underscores, and dots only.</small>
            </div>
          </div>

          <div className="field-group">
            <span className="field-label">Scan mode</span>
            <div className="radio-group">
              <label className={mode === "targeted" ? "radio active" : "radio"}>
                <input
                  type="radio"
                  name="scan-mode"
                  value="targeted"
                  checked={mode === "targeted"}
                  onChange={() => setMode("targeted")}
                />
                <span>Targeted scan</span>
                <small>Paste up to 10 public profile URLs you want to inspect.</small>
              </label>
              <label className={mode === "niche" ? "radio active" : "radio"}>
                <input
                  type="radio"
                  name="scan-mode"
                  value="niche"
                  checked={mode === "niche"}
                  onChange={() => setMode("niche")}
                />
                <span>Niche scan</span>
                <small>We&apos;ll scan a curated list of public profiles from the niche selected.</small>
              </label>
            </div>
          </div>

          {mode === "targeted" ? (
            <div className="field-group">
              <label htmlFor="targeted-profiles">Public profile URLs</label>
              <div className="field-with-hint">
                <textarea
                  id="targeted-profiles"
                  name="targeted-profiles"
                  value={profileUrls}
                  onChange={(event) => setProfileUrls(event.target.value)}
                  placeholder="https://www.instagram.com/coastalcafe/&#10;https://www.instagram.com/urbanbrews/"
                  rows={4}
                />
                <small>
                  One URL per line. Limit {MAX_TARGETED_PROFILES} profiles per request. Only public
                  profiles are supported.
                </small>
              </div>
            </div>
          ) : (
            <div className="field-group">
              <label htmlFor="niche">Select niche</label>
              <div className="select-wrapper">
                <select
                  id="niche"
                  name="niche"
                  value={niche}
                  onChange={(event) => setNiche(event.target.value as Niche)}
                >
                  {AVAILABLE_NICHES.map((item) => (
                    <option value={item.value} key={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <small>
                {AVAILABLE_NICHES.find((item) => item.value === niche)?.description ??
                  "Choose the niche that best matches your interests."}
              </small>
            </div>
          )}

          <div className="form-footer">
            <div className="safety">
              <span className="badge">Public data only</span>
              <span className="badge">Rate limited</span>
              <p>
                Each scan checks up to {MAX_TARGETED_PROFILES} profiles and recent posts. Maximum{" "}
                <strong>8 requests every 5 minutes</strong> per client.
              </p>
            </div>
            <button type="submit" className="cta" disabled={isScanning}>
              {isScanning ? "Scanning..." : "Scan public comments"}
            </button>
          </div>
        </form>
      </section>

      {isScanning && (
        <section className="panel progress">
          <div className="progress-bar">
            <div className="progress-bar__track">
              <div className="progress-bar__indicator" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-bar__label">{progressLabel}</div>
          </div>
        </section>
      )}

      {error && (
        <section className="panel error">
          <p>{error}</p>
        </section>
      )}

      {summary && (
        <section className="panel summary">
          <div className="summary__header">
            <h2>Scan summary</h2>
            <span className="summary__timestamp">
              {summary.generatedAt ? formatDateTime(summary.generatedAt) : ""}
            </span>
          </div>
          <div className="summary__grid">
            <div className="summary__item">
              <span className="summary__label">Username searched</span>
              <span className="summary__value">@{summary.username}</span>
            </div>
            <div className="summary__item">
              <span className="summary__label">Matches found</span>
              <span className="summary__value highlight">{summary.totalMatches}</span>
            </div>
            <div className="summary__item">
              <span className="summary__label">Profiles scanned</span>
              <span className="summary__value">{summary.scannedProfiles}</span>
            </div>
            <div className="summary__item">
              <span className="summary__label">Posts reviewed</span>
              <span className="summary__value">{summary.scannedPosts}</span>
            </div>
            <div className="summary__item">
              <span className="summary__label">Scan duration</span>
              <span className="summary__value">{formatDuration(summary.durationMs)}</span>
            </div>
            <div className="summary__item">
              <span className="summary__label">Scan mode</span>
              <span className="summary__value">
                {summary.mode === "targeted" ? "Targeted" : "Niche"}{" "}
                {summaryNicheLabel ? `· ${summaryNicheLabel}` : ""}
              </span>
            </div>
          </div>

          {summary.message && (
            <div className="summary__note">
              <p>{summary.message}</p>
            </div>
          )}

          {summary.skippedTargets?.length > 0 && (
            <div className="summary__note">
              <h3>Skipped profiles</h3>
              <ul>
                {summary.skippedTargets.map((item) => (
                  <li key={item.provided}>
                    <strong>{item.provided}</strong> — {item.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasScannedProfileLog && (
            <div className="summary__note">
              <h3>Profiles scanned</h3>
              <ul>
                {scannedProfilesLog.map((item) => (
                  <li key={item.handle}>
                    <a href={item.profileUrl} target="_blank" rel="noopener noreferrer">
                      @{item.handle}
                    </a>{" "}
                    · {item.postsChecked} posts · {item.matchesFound} match
                    {item.matchesFound === 1 ? "" : "es"}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {noMatchesFound && (
            <div className="summary__note">
              <h3>No matches found</h3>
              <p>
                We didn&apos;t spot comments by this username in the scanned content. Try switching
                niches, adding different target profiles, or running a new scan later.
              </p>
            </div>
          )}
        </section>
      )}

      {results.length > 0 && (
        <section className="panel results">
          <div className="results__header">
            <h2>Matched comments</h2>
            <button type="button" className="secondary" onClick={handleExportCsv} disabled={!canExport}>
              Export CSV
            </button>
          </div>
          <div className="results__grid">
            {results.map((item) => (
              <article key={item.id} className="result-card">
                <div className="result-card__thumb">
                  <Image
                    src={item.thumbnailUrl}
                    alt={`Post from @${item.profileHandle}`}
                    fill
                    className="result-card__image"
                    sizes="(max-width: 600px) 100vw, 320px"
                  />
                  <span className="result-card__type">{item.postType === "reel" ? "Reel" : "Post"}</span>
                </div>
                <div className="result-card__content">
                  <h3>
                    <a href={item.profileUrl} target="_blank" rel="noopener noreferrer">
                      {item.profileDisplayName}
                    </a>{" "}
                    <span>@{item.profileHandle}</span>
                  </h3>
                  <p className="result-card__comment">“{item.commentText}”</p>
                  <dl>
                    <div>
                      <dt>Commented on</dt>
                      <dd>{formatDateTime(item.commentTimestamp)}</dd>
                    </div>
                    <div>
                      <dt>Post published</dt>
                      <dd>{formatDateTime(item.postedAt)}</dd>
                    </div>
                  </dl>
                  <a
                    className="result-card__link"
                    href={item.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View post
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {serverDisclaimer && (
        <section className="panel disclaimer-panel">
          <p>{serverDisclaimer}</p>
        </section>
      )}
    </main>
  );
}
