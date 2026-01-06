import { OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Pause, Play, Share2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import "./App.css";
import Scene from "./Scene";
import { fetchTrackForYear } from "./musicApi";
import { clampYearTo80s, type Track } from "./tracks";

const MUSIC_AGE = 16;
const PREVIEW_DURATION = 30;

// Custom Pan Controls Component
function MousePanControls({ limit = 2 }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  const panRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position to [-1, 1]
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      // Clamp pan offset
      panRef.current.x = THREE.MathUtils.clamp(x * limit, -limit, limit);
      panRef.current.y = THREE.MathUtils.clamp(-y * limit, -limit, limit);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [limit]);

  useEffect(() => {
    const animate = () => {
      if (controlsRef.current) {
        // Smoothly interpolate target
        controlsRef.current.target.x +=
          (panRef.current.x - controlsRef.current.target.x) * 0.05;
        controlsRef.current.target.y +=
          (panRef.current.y - controlsRef.current.target.y) * 0.05;
        controlsRef.current.update();
      }
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={false}
      enablePan={false}
      enableRotate={false}
    />
  );
}

// App Component
const formatTime = (time: number) => {
  const clamped = Math.max(0, Math.min(PREVIEW_DURATION, Math.floor(time)));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const computeMusicYear = (birthdate: string) => {
  const yearText = birthdate.split("-")[0];
  const birthYear = Number(yearText);
  if (!Number.isFinite(birthYear)) {
    return null;
  }
  return clampYearTo80s(birthYear + MUSIC_AGE);
};

export default function App() {
  const [birthdate, setBirthdate] = useState("");
  const [error, setError] = useState("");
  const [musicYear, setMusicYear] = useState<number | null>(null);
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareNotice, setShareNotice] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestIdRef = useRef(0);

  const isPreviewAvailable = Boolean(activeTrack?.previewUrl);
  const showCard = Boolean(activeTrack && !isLoading);
  const showResult = Boolean(activeTrack && !isLoading && musicYear);
  const showPanels = !showResult;
  const shareCaption = useMemo(() => {
    if (!activeTrack) {
      return "";
    }
    return `My 80s song is ${activeTrack.title} (${activeTrack.year}). What's yours?`;
  }, [activeTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.pause();
    audio.currentTime = 0;
    setProgress(0);
    setIsPlaying(false);
    audio.load();
  }, [activeTrack?.previewUrl]);

  const handleGenerate = async () => {
    if (!birthdate) {
      setError("Please enter your birthdate.");
      return;
    }

    const year = computeMusicYear(birthdate);
    if (!year) {
      setError("Please enter a valid birthdate.");
      return;
    }

    setError("");
    setHasGenerated(true);
    setIsLoading(true);
    setShareOpen(false);
    setActiveTrack(null);
    setMusicYear(null);
    setShareNotice("");
    setIsPlaying(false);
    setProgress(0);

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    try {
      const selectedTrack = await fetchTrackForYear(year);
      if (requestIdRef.current !== requestId) {
        return;
      }
      setMusicYear(year);
      setActiveTrack(selectedTrack);
    } catch {
      if (requestIdRef.current !== requestId) {
        return;
      }
      setError("Unable to fetch a track right now. Please try again.");
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  };

  const handleTogglePlay = () => {
    if (!isPreviewAvailable) {
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        setIsPlaying(false);
      });
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const clamped = Math.min(audio.currentTime, PREVIEW_DURATION);
    setProgress(clamped);

    if (audio.currentTime >= PREVIEW_DURATION) {
      audio.pause();
      audio.currentTime = PREVIEW_DURATION;
      setIsPlaying(false);
    }
  };

  const handleShareCopy = async (value: string) => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setShareNotice("Copied.");
    } catch {
      setShareNotice("Copy failed.");
    }
  };

  const handleShareLink = () => {
    handleShareCopy(window.location.href);
  };

  return (
    <div className="app">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 2, 35], fov: 55 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <MousePanControls limit={2} />
        <Scene activeTrack={activeTrack} showCard={showCard} />
      </Canvas>
      <div className="ui-layer">
        {showPanels ? (
          <div className="ui-stack">
            <div className="ui-panel ui-panel--cassette">
              <div className="cassette-header">
                <div className="ui-title">Escape Vecna's Curse</div>
                <div className="ui-subtitle">
                  Enter your birthdate to find the one song that will pull you
                  back from the Upside Down.
                </div>
              </div>
              <div className="cassette-body">
                <div className="cassette-reel cassette-reel--left">
                  <span className="cassette-reel-hole" />
                </div>
                <div className="cassette-window">
                  <span className="cassette-window-band" />
                </div>
                <div className="cassette-reel cassette-reel--right">
                  <span className="cassette-reel-hole" />
                </div>
              </div>
              <div className="cassette-label">
                <label className="ui-label" htmlFor="birthdate">
                  Birthdate
                </label>
                <input
                  id="birthdate"
                  type="date"
                  value={birthdate}
                  onChange={(event) => {
                    setBirthdate(event.target.value);
                    setError("");
                  }}
                  className="ui-input ui-input--label"
                />
              </div>
              {error ? <div className="ui-error">{error}</div> : null}
              <div className="ui-actions ui-actions--tape">
                <button
                  className="primary-button tape-button"
                  type="button"
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  Start the Tape
                </button>
                {hasGenerated ? (
                  <button
                    className="link-button"
                    type="button"
                    onClick={handleGenerate}
                    disabled={isLoading}
                  >
                    Regenerate
                  </button>
                ) : null}
              </div>
            </div>

            {isLoading ? (
              <div className="ui-panel ui-panel--result">
                <div className="loading-title">Tuning the signal...</div>
                <div className="skeleton-line" />
                <div className="skeleton-line skeleton-line--short" />
                <div className="skeleton-block" />
              </div>
            ) : null}
          </div>
        ) : null}

        {showResult ? (
          <div className="floating-controls">
            <button
              className="player-button"
              type="button"
              onClick={handleTogglePlay}
              disabled={!isPreviewAvailable}
              aria-label={isPlaying ? "Pause preview" : "Play preview"}
            >
              {isPlaying ? (
                <Pause size={18} strokeWidth={2.2} />
              ) : (
                <Play size={18} strokeWidth={2.2} />
              )}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => setShareOpen(true)}
              aria-label="Share"
            >
              <Share2 size={18} strokeWidth={2.2} />
            </button>
          </div>
        ) : null}
      </div>
      {shareOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-title">Share your result</div>
            <div className="modal-caption">{shareCaption}</div>
            <div className="modal-actions">
              <button
                className="primary-button"
                type="button"
                onClick={() => handleShareCopy(shareCaption)}
              >
                Copy text
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={handleShareLink}
              >
                Copy link
              </button>
              <button className="ghost-button" type="button" disabled>
                Coming soon
              </button>
            </div>
            {shareNotice ? (
              <div className="modal-note">{shareNotice}</div>
            ) : null}
            <button
              className="modal-close"
              type="button"
              onClick={() => setShareOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
      <audio
        ref={audioRef}
        src={activeTrack?.previewUrl ?? ""}
        onTimeUpdate={handleTimeUpdate}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />
    </div>
  );
}
