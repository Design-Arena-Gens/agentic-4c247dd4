import { NextRequest, NextResponse } from "next/server";
import {
  AVAILABLE_NICHES,
  SCANNED_PROFILES,
  type Niche,
  type ScannedProfile,
} from "@/data/mockScanData";
import { extractHandleFromProfileUrl, normalizeUsername, sleep } from "@/lib/utils";

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const MAX_PROFILES_PER_REQUEST = 10;
const IG_USERNAME_REGEX = /^[a-z0-9._]{2,30}$/i;

type RateLimitEntry = {
  count: number;
  reset: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientKey(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (!forwarded) return "anon";
  return forwarded.split(",")[0]?.trim() || "anon";
}

function checkRateLimit(key: string) {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.reset < now) {
    rateLimitStore.set(key, { count: 1, reset: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);
  return true;
}

type ScanMode = "targeted" | "niche";

type TargetedPayload = {
  username?: string;
  mode?: ScanMode;
  profileUrls?: string[];
};

type NichePayload = {
  username?: string;
  mode?: ScanMode;
  niche?: Niche | string;
};

type ScanPayload = TargetedPayload & NichePayload;

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

function validateUsername(raw: unknown) {
  if (typeof raw !== "string") return null;
  const normalized = normalizeUsername(raw);
  if (!IG_USERNAME_REGEX.test(normalized)) {
    return null;
  }
  return normalized;
}

function ensureProfilesLimit(profiles: ScannedProfile[]) {
  if (profiles.length <= MAX_PROFILES_PER_REQUEST) {
    return profiles;
  }
  return profiles.slice(0, MAX_PROFILES_PER_REQUEST);
}

function ensureProfileUrls(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);
}

export async function POST(request: NextRequest) {
  const clientKey = getClientKey(request);
  if (!checkRateLimit(clientKey)) {
    return NextResponse.json(
      {
        error: "Too many scan requests. Please wait a few minutes before trying again.",
        retryAfterSeconds: RATE_LIMIT_WINDOW_MS / 1000,
      },
      { status: 429 },
    );
  }

  let payload: ScanPayload;
  try {
    payload = (await request.json()) as ScanPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Expected JSON payload." },
      { status: 400 },
    );
  }

  const username = validateUsername(payload.username);
  if (!username) {
    return NextResponse.json(
      { error: "Please provide a valid Instagram username (letters, numbers, underscores, or periods)." },
      { status: 400 },
    );
  }

  const mode: ScanMode = payload.mode === "niche" ? "niche" : "targeted";

  const skippedTargets: Array<{ provided: string; reason: string }> = [];
  let profilesToScan: ScannedProfile[] = [];
  let nicheSelected: Niche | null = null;

  if (mode === "targeted") {
    const profileUrls = ensureProfileUrls(payload.profileUrls);
    if (profileUrls.length === 0) {
      return NextResponse.json(
        { error: "Add at least one public Instagram profile URL to scan." },
        { status: 400 },
      );
    }
    if (profileUrls.length > MAX_PROFILES_PER_REQUEST) {
      return NextResponse.json(
        { error: `You can scan up to ${MAX_PROFILES_PER_REQUEST} profiles in a single request.` },
        { status: 400 },
      );
    }

    const handles = profileUrls
      .map((url) => extractHandleFromProfileUrl(url))
      .filter((handle): handle is string => Boolean(handle));

    if (handles.length === 0) {
      return NextResponse.json(
        {
          error:
            "None of the provided URLs looked like Instagram profile links. Please paste full public profile URLs.",
        },
        { status: 400 },
      );
    }

    const uniqueHandles = Array.from(new Set(handles));
    profilesToScan = uniqueHandles
      .map((handle) => {
        const profile = SCANNED_PROFILES.find((candidate) => candidate.handle === handle);
        if (!profile) {
          skippedTargets.push({
            provided: handle,
            reason: "This profile is outside the currently cached dataset.",
          });
        }
        return profile;
      })
      .filter((profile): profile is ScannedProfile => Boolean(profile));

    profilesToScan = ensureProfilesLimit(profilesToScan);
  } else {
    const nicheValue =
      typeof payload.niche === "string" ? (payload.niche.trim().toLowerCase() as Niche | string) : "";
    const nicheEntry = AVAILABLE_NICHES.find((item) => item.value === nicheValue);
    if (!nicheEntry) {
      return NextResponse.json(
        { error: "Select a valid niche before running a niche scan." },
        { status: 400 },
      );
    }
    nicheSelected = nicheEntry.value;
    profilesToScan = ensureProfilesLimit(
      SCANNED_PROFILES.filter((profile) => profile.niche === nicheEntry.value),
    );
  }

  if (profilesToScan.length === 0) {
    return NextResponse.json(
      {
        results: [],
        summary: {
          username,
          mode,
          totalMatches: 0,
          scannedProfiles: 0,
          scannedPosts: 0,
          durationMs: 0,
          datasetProfiles: SCANNED_PROFILES.length,
          niche: nicheSelected,
          skippedTargets,
          message:
            "No matching profiles were available within the cached dataset. Try a different niche or target.",
        },
      },
      { status: 200 },
    );
  }

  const startedAt = Date.now();
  const matches: ScanResult[] = [];
  let postsScanned = 0;

  const scannedProfilesLog: Array<{
    handle: string;
    profileUrl: string;
    displayName: string;
    postsChecked: number;
    matchesFound: number;
  }> = [];

  for (const profile of profilesToScan) {
    await sleep(120);
    let matchesFoundForProfile = 0;

    for (const post of profile.recentPosts) {
      postsScanned += 1;
      for (const comment of post.comments) {
        if (normalizeUsername(comment.username) === username) {
          matchesFoundForProfile += 1;
          matches.push({
            id: `${profile.handle}_${post.id}_${matches.length}`,
            profileHandle: profile.handle,
            profileUrl: profile.profileUrl,
            profileDisplayName: profile.displayName,
            postUrl: post.postUrl,
            thumbnailUrl: post.thumbnailUrl,
            postType: post.type,
            postedAt: post.postedAt,
            commentText: comment.text,
            commentTimestamp: comment.commentedAt,
          });
        }
      }
    }

    scannedProfilesLog.push({
      handle: profile.handle,
      profileUrl: profile.profileUrl,
      displayName: profile.displayName,
      postsChecked: profile.recentPosts.length,
      matchesFound: matchesFoundForProfile,
    });
  }

  const finishedAt = Date.now();

  return NextResponse.json(
    {
      results: matches,
      summary: {
        username,
        mode,
        niche: nicheSelected,
        totalMatches: matches.length,
        scannedProfiles: scannedProfilesLog.length,
        scannedPosts: postsScanned,
        durationMs: finishedAt - startedAt,
        datasetProfiles: SCANNED_PROFILES.length,
        skippedTargets,
        scannedProfilesLog,
        generatedAt: new Date().toISOString(),
      },
      disclaimer:
        "Results are based on a limited cache of publicly observed profiles. This tool does not access private Instagram data.",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
