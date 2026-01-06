export type Track = {
  title: string;
  artist: string;
  year: number;
  coverUrl: string;
  previewUrl: string;
  sourceUrl?: string;
  album?: string;
};

const createCoverUrl = (
  title: string,
  artist: string,
  year: number,
  accent: string
) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${accent}" />
          <stop offset="100%" stop-color="#0a1022" />
        </linearGradient>
      </defs>
      <rect width="640" height="640" fill="url(#g)" />
      <rect x="40" y="40" width="560" height="560" rx="42" fill="rgba(5,10,24,0.55)" stroke="rgba(220,230,255,0.35)" stroke-width="3" />
      <circle cx="480" cy="160" r="90" fill="rgba(255,255,255,0.08)" />
      <circle cx="150" cy="470" r="120" fill="rgba(255,255,255,0.05)" />
      <text x="50%" y="48%" font-family="IBM Plex Sans, sans-serif" font-size="42" font-weight="600" fill="#f5f7ff" text-anchor="middle">${title}</text>
      <text x="50%" y="57%" font-family="IBM Plex Sans, sans-serif" font-size="22" fill="#d0d6f7" text-anchor="middle">${artist}</text>
      <text x="50%" y="84%" font-family="IBM Plex Sans, sans-serif" font-size="78" letter-spacing="8" fill="rgba(255,255,255,0.55)" text-anchor="middle">${year}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const previewUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

export const fallbackTracks: Track[] = [
  {
    title: "Neon River",
    artist: "The Signal Lamps",
    year: 1980,
    coverUrl: createCoverUrl("Neon River", "The Signal Lamps", 1980, "#ff6b7a"),
    previewUrl,
  },
  {
    title: "Afterglow Arcade",
    artist: "Laserline",
    year: 1981,
    coverUrl: createCoverUrl("Afterglow Arcade", "Laserline", 1981, "#ff8b3d"),
    previewUrl: "",
  },
  {
    title: "Magneto Hearts",
    artist: "Midnight Circuit",
    year: 1982,
    coverUrl: createCoverUrl("Magneto Hearts", "Midnight Circuit", 1982, "#ff5fd7"),
    previewUrl,
  },
  {
    title: "Static on the Coast",
    artist: "Velvet Relay",
    year: 1983,
    coverUrl: createCoverUrl("Static on the Coast", "Velvet Relay", 1983, "#5cf5ff"),
    previewUrl,
  },
  {
    title: "Dreams in Chrome",
    artist: "Echo Avenue",
    year: 1984,
    coverUrl: createCoverUrl("Dreams in Chrome", "Echo Avenue", 1984, "#8affc1"),
    previewUrl,
  },
  {
    title: "Analog Pulse",
    artist: "Night Operator",
    year: 1985,
    coverUrl: createCoverUrl("Analog Pulse", "Night Operator", 1985, "#ffd65c"),
    previewUrl,
  },
  {
    title: "Red Room FM",
    artist: "Hollow Cities",
    year: 1986,
    coverUrl: createCoverUrl("Red Room FM", "Hollow Cities", 1986, "#ff4a5e"),
    previewUrl: "",
  },
  {
    title: "Satellite Youth",
    artist: "Glass Comet",
    year: 1987,
    coverUrl: createCoverUrl("Satellite Youth", "Glass Comet", 1987, "#79a7ff"),
    previewUrl,
  },
  {
    title: "Cold Summer Drive",
    artist: "Polaroid Sunset",
    year: 1988,
    coverUrl: createCoverUrl("Cold Summer Drive", "Polaroid Sunset", 1988, "#7ae0ff"),
    previewUrl,
  },
  {
    title: "Tide of Light",
    artist: "Nova Department",
    year: 1989,
    coverUrl: createCoverUrl("Tide of Light", "Nova Department", 1989, "#a78bff"),
    previewUrl,
  },
];

export const pickFallbackTrackForYear = (year: number) => {
  const exact = fallbackTracks.find((track) => track.year === year);
  if (exact) {
    return exact;
  }

  return fallbackTracks.reduce((closest, track) => {
    const currentDiff = Math.abs(track.year - year);
    const closestDiff = Math.abs(closest.year - year);
    return currentDiff < closestDiff ? track : closest;
  }, fallbackTracks[0]);
};

export const clampYearTo80s = (year: number) =>
  Math.min(1989, Math.max(1980, year));

export const buildFallbackCover = (
  title: string,
  artist: string,
  year: number
) => createCoverUrl(title, artist, year, "#ff4a5e");
