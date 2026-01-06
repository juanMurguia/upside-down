import { OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import html2canvas from "html2canvas";
import { Download, Pause, Play, Share2 } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
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

const computeMusicYear = (birthdate: Date) => {
  const birthYear = birthdate.getFullYear();
  if (!Number.isFinite(birthYear)) {
    return null;
  }
  return clampYearTo80s(birthYear + MUSIC_AGE);
};

export default function App() {
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [error, setError] = useState("");
  const [musicYear, setMusicYear] = useState<number | null>(null);
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const requestIdRef = useRef(0);
  const dayRef = useRef<HTMLInputElement | null>(null);
  const monthRef = useRef<HTMLInputElement | null>(null);
  const yearRef = useRef<HTMLInputElement | null>(null);

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

  const sanitizeDigits = (value: string, maxLength: number) =>
    value.replace(/\D/g, "").slice(0, maxLength);

  const handleFieldChange = (
    value: string,
    maxLength: number,
    setter: (value: string) => void,
    nextRef?: RefObject<HTMLInputElement | null>
  ) => {
    const cleaned = sanitizeDigits(value, maxLength);
    setter(cleaned);
    if (cleaned.length === maxLength && nextRef?.current) {
      nextRef.current.focus();
    }
    setError("");
  };

  const handleFieldKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    value: string,
    prevRef?: RefObject<HTMLInputElement | null>
  ) => {
    if (event.key === "Backspace" && value.length === 0 && prevRef?.current) {
      prevRef.current.focus();
    }
  };

  const handleGenerate = async () => {
    if (!birthMonth || !birthDay || !birthYear) {
      setError("Please enter your birthdate.");
      return;
    }

    if (
      birthMonth.length !== 2 ||
      birthDay.length !== 2 ||
      birthYear.length !== 4
    ) {
      setError("Please enter a valid birthdate.");
      return;
    }

    const month = Number(birthMonth);
    const day = Number(birthDay);
    const yearValue = Number(birthYear);

    if (
      !Number.isFinite(month) ||
      !Number.isFinite(day) ||
      !Number.isFinite(yearValue)
    ) {
      setError("Please enter a valid birthdate.");
      return;
    }

    const candidate = new Date(yearValue, month - 1, day);
    if (
      candidate.getFullYear() !== yearValue ||
      candidate.getMonth() !== month - 1 ||
      candidate.getDate() !== day
    ) {
      setError("Please enter a valid birthdate.");
      return;
    }

    const year = computeMusicYear(candidate);
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

  const handleDownloadImage = async () => {
    const renderer = rendererRef.current;
    if (!renderer) {
      return;
    }

    const sourceCanvas = renderer.domElement;
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    const size = Math.min(width, height);
    if (!size) {
      return;
    }

    const output = document.createElement("canvas");
    output.width = size;
    output.height = size;
    const context = output.getContext("2d");
    if (!context) {
      return;
    }

    const offsetX = Math.floor((width - size) / 2);
    const offsetY = Math.floor((height - size) / 2);
    context.drawImage(
      sourceCanvas,
      offsetX,
      offsetY,
      size,
      size,
      0,
      0,
      size,
      size
    );

    const textElement = document.querySelector(
      ".music-card__html"
    ) as HTMLElement | null;
    if (textElement) {
      const rect = textElement.getBoundingClientRect();
      const canvasRect = sourceCanvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      try {
        const textCanvas = await html2canvas(textElement, {
          backgroundColor: null,
          scale: dpr,
        });
        const drawX = Math.floor((rect.left - canvasRect.left) * dpr - offsetX);
        const drawY = Math.floor((rect.top - canvasRect.top) * dpr - offsetY);
        const drawW = Math.floor(rect.width * dpr);
        const drawH = Math.floor(rect.height * dpr);

        context.drawImage(textCanvas, drawX, drawY, drawW, drawH);
      } catch {
        return;
      }
    }

    const link = document.createElement("a");
    link.href = output.toDataURL("image/png");
    link.download = "rift-card.png";
    link.click();
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
          preserveDrawingBuffer: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        onCreated={({ gl }) => {
          rendererRef.current = gl;
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
                <label className="ui-label" htmlFor="birth-day">
                  Birthdate
                </label>
                <div className="date-fields">
                  <input
                    id="birth-day"
                    ref={dayRef}
                    className="date-field"
                    inputMode="numeric"
                    autoComplete="bday-day"
                    placeholder="DD"
                    maxLength={2}
                    value={birthDay}
                    onChange={(event) =>
                      handleFieldChange(
                        event.target.value,
                        2,
                        setBirthDay,
                        monthRef
                      )
                    }
                    onKeyDown={(event) => handleFieldKeyDown(event, birthDay)}
                    aria-label="Birth day"
                  />
                  <span className="date-separator">/</span>
                  <input
                    id="birth-month"
                    ref={monthRef}
                    className="date-field"
                    inputMode="numeric"
                    autoComplete="bday-month"
                    placeholder="MM"
                    maxLength={2}
                    value={birthMonth}
                    onChange={(event) =>
                      handleFieldChange(
                        event.target.value,
                        2,
                        setBirthMonth,
                        yearRef
                      )
                    }
                    onKeyDown={(event) =>
                      handleFieldKeyDown(event, birthMonth, dayRef)
                    }
                    aria-label="Birth month"
                  />
                  <span className="date-separator">/</span>
                  <input
                    ref={yearRef}
                    className="date-field date-field--year"
                    inputMode="numeric"
                    autoComplete="bday-year"
                    placeholder="YYYY"
                    maxLength={4}
                    value={birthYear}
                    onChange={(event) =>
                      handleFieldChange(event.target.value, 4, setBirthYear)
                    }
                    onKeyDown={(event) =>
                      handleFieldKeyDown(event, birthYear, dayRef)
                    }
                    aria-label="Birth year"
                  />
                </div>
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
                onClick={handleDownloadImage}
              >
                <Download size={18} strokeWidth={2.2} />
                Download image
              </button>
            </div>
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
