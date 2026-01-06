import {
  buildFallbackCover,
  clampYearTo80s,
  pickFallbackTrackForYear,
  type Track,
} from "./tracks";

const APPLE_MUSIC_TOKEN = import.meta.env.VITE_APPLE_MUSIC_TOKEN as
  | string
  | undefined;
const APPLE_MUSIC_STOREFRONT =
  (import.meta.env.VITE_APPLE_MUSIC_STOREFRONT as string | undefined) ?? "us";
const ITUNES_ENDPOINT = "https://itunes.apple.com/search";
const APPLE_ENDPOINT = "https://api.music.apple.com/v1/catalog";
const REQUEST_TIMEOUT_MS = 9000;

type AppleMusicSong = {
  attributes?: {
    name?: string;
    artistName?: string;
    albumName?: string;
    releaseDate?: string;
    artwork?: {
      url?: string;
    };
    previews?: Array<{
      url?: string;
    }>;
    url?: string;
  };
};

type ITunesSong = {
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  releaseDate?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackViewUrl?: string;
};

const fetchJson = async <T>(
  url: string,
  options?: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS
): Promise<T> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }
    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timeout);
  }
};

const buildSearchTerms = (year: number) => [
  `${year} 80s hit`,
  `${year} pop song`,
  `${year} new wave`,
  `${year} synth`,
  `${year} rock`,
  `${year} classic`,
];

const pickRandom = <T>(items: T[]) =>
  items[Math.floor(Math.random() * items.length)];

const pickTrack = (tracks: Track[]) => {
  if (!tracks.length) {
    return null;
  }
  const withPreview = tracks.filter((track) => track.previewUrl);
  const pool = withPreview.length ? withPreview : tracks;
  return pickRandom(pool);
};

const parseYear = (releaseDate: string | undefined, fallbackYear: number) => {
  const parsed = releaseDate ? Number(releaseDate.slice(0, 4)) : NaN;
  if (!Number.isFinite(parsed)) {
    return clampYearTo80s(fallbackYear);
  }
  return clampYearTo80s(parsed);
};

const appleArtworkUrl = (url: string | undefined, size = 600) => {
  if (!url) {
    return "";
  }
  return url.replace("{w}", String(size)).replace("{h}", String(size));
};

const itunesArtworkUrl = (url: string | undefined, size = 600) => {
  if (!url) {
    return "";
  }
  const withBb = url.replace(
    /(\d+)x(\d+)bb/i,
    `${size}x${size}bb`
  );
  if (withBb !== url) {
    return withBb;
  }
  return url.replace(/(\d+)x(\d+)/i, `${size}x${size}`);
};

const normalizeTrack = (
  input: Track,
  fallbackYear: number
): Track => ({
  ...input,
  year: clampYearTo80s(input.year || fallbackYear),
  coverUrl:
    input.coverUrl ||
    buildFallbackCover(input.title, input.artist, fallbackYear),
  previewUrl: input.previewUrl || "",
});

const searchAppleMusic = async (
  term: string,
  fallbackYear: number
): Promise<Track[]> => {
  if (!APPLE_MUSIC_TOKEN) {
    return [];
  }

  const params = new URLSearchParams({
    term,
    types: "songs",
    limit: "25",
  });
  const url = `${APPLE_ENDPOINT}/${APPLE_MUSIC_STOREFRONT}/search?${params}`;
  const payload = await fetchJson<{
    results?: {
      songs?: {
        data?: AppleMusicSong[];
      };
    };
  }>(url, {
    headers: {
      Authorization: `Bearer ${APPLE_MUSIC_TOKEN}`,
    },
  });

  const songs = payload.results?.songs?.data ?? [];
  return songs
    .map((song) => {
      const attributes = song.attributes;
      if (!attributes?.name || !attributes.artistName) {
        return null;
      }
      return normalizeTrack(
        {
          title: attributes.name,
          artist: attributes.artistName,
          album: attributes.albumName,
          year: parseYear(attributes.releaseDate, fallbackYear),
          coverUrl: appleArtworkUrl(attributes.artwork?.url),
          previewUrl: attributes.previews?.[0]?.url ?? "",
          sourceUrl: attributes.url,
        },
        fallbackYear
      );
    })
    .filter((track): track is Track => Boolean(track));
};

const searchITunes = async (
  term: string,
  fallbackYear: number
): Promise<Track[]> => {
  const params = new URLSearchParams({
    term,
    media: "music",
    entity: "song",
    limit: "25",
    country: APPLE_MUSIC_STOREFRONT,
  });
  const url = `${ITUNES_ENDPOINT}?${params.toString()}`;
  const payload = await fetchJson<{ results?: ITunesSong[] }>(url);
  const songs = payload.results ?? [];

  return songs
    .map((song) => {
      if (!song.trackName || !song.artistName) {
        return null;
      }
      return normalizeTrack(
        {
          title: song.trackName,
          artist: song.artistName,
          album: song.collectionName,
          year: parseYear(song.releaseDate, fallbackYear),
          coverUrl: itunesArtworkUrl(song.artworkUrl100),
          previewUrl: song.previewUrl ?? "",
          sourceUrl: song.trackViewUrl,
        },
        fallbackYear
      );
    })
    .filter((track): track is Track => Boolean(track));
};

const searchWithTerms = async (
  fetcher: (term: string, fallbackYear: number) => Promise<Track[]>,
  fallbackYear: number,
  terms: string[]
) => {
  for (const term of terms) {
    try {
      const results = await fetcher(term, fallbackYear);
      if (results.length) {
        return results;
      }
    } catch {
      // Try the next term or fallback source.
    }
  }
  return [];
};

export const fetchTrackForYear = async (year: number): Promise<Track> => {
  const terms = buildSearchTerms(year);

  const appleResults = await searchWithTerms(searchAppleMusic, year, terms);
  const applePick = pickTrack(appleResults);
  if (applePick) {
    return applePick;
  }

  const itunesResults = await searchWithTerms(searchITunes, year, terms);
  const itunesPick = pickTrack(itunesResults);
  if (itunesPick) {
    return itunesPick;
  }

  return pickFallbackTrackForYear(year);
};
