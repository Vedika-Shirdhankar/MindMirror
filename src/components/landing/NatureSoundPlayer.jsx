// src/components/landing/NatureSoundPlayer.jsx
// Uses real .ogg audio files from public/audio/ for audible, immersive nature sounds.
import React, { useState, useRef, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  CloudRain,
  Bird,
  Music,
  Pause,
  Play,
  X,
  ChevronUp,
} from "lucide-react";

const SOUND_PRESETS = [
  {
    id: "rain",
    label: "Rain & Thunder",
    icon: CloudRain,
    file: "/audio/rain.ogg",
  },
  {
    id: "birds",
    label: "Morning Birds",
    icon: Bird,
    file: "/audio/birds.ogg",
  },
  {
    id: "meditation",
    label: "Calm Piano",
    icon: Music,
    file: "/audio/meditation.ogg",
  },
];

export default function NatureSoundPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSound, setActiveSound] = useState("rain");
  const [volume, setVolume] = useState(0.6);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  // Create or get audio element for a given preset
  const getAudio = (soundId) => {
    const preset = SOUND_PRESETS.find((s) => s.id === soundId);
    if (!preset) return null;

    if (audioRef.current && audioRef.current.dataset.soundId === soundId) {
      return audioRef.current;
    }

    // Stop and clean up old audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
    }

    const audio = new Audio(preset.file);
    audio.loop = true;
    audio.volume = volume;
    audio.preload = "auto";
    audio.dataset.soundId = soundId;
    audioRef.current = audio;
    return audio;
  };

  // Play
  const playSound = (soundId = activeSound) => {
    const audio = getAudio(soundId);
    if (!audio) return;

    setIsLoading(true);
    audio.volume = volume;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn("Audio play failed:", err);
          setIsLoading(false);
        });
    } else {
      setIsPlaying(true);
      setIsLoading(false);
    }
  };

  // Pause
  const pauseSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  // Toggle play/pause
  const toggleSound = () => {
    if (isPlaying) {
      pauseSound();
    } else {
      playSound(activeSound);
    }
  };

  // Switch preset
  const switchPreset = (id) => {
    const wasPlaying = isPlaying;
    pauseSound();
    setActiveSound(id);
    if (wasPlaying) {
      // Small delay so state updates
      setTimeout(() => playSound(id), 50);
    }
  };

  // Volume change
  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const currentPreset =
    SOUND_PRESETS.find((s) => s.id === activeSound) || SOUND_PRESETS[0];

  return (
    <div className={`nature-player-wrapper ${isExpanded ? "expanded" : ""}`}>
      {!isExpanded ? (
        /* ---- Collapsed Pill ---- */
        <div className="nature-pill-bar">
          <button
            className={`nature-pill-play ${isPlaying ? "active" : ""}`}
            onClick={toggleSound}
            aria-label={isPlaying ? "Pause nature sound" : "Play nature sound"}
            title={
              isPlaying
                ? `Pause ${currentPreset.label}`
                : "Play soothing nature sound"
            }
            disabled={isLoading}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span className="nature-pill-label">
              {isLoading ? (
                "Loading…"
              ) : isPlaying ? (
                <>
                  <span className="sound-wave-bars">
                    <i />
                    <i />
                    <i />
                  </span>
                  {currentPreset.label}
                </>
              ) : (
                "Nature sounds"
              )}
            </span>
          </button>

          <button
            className="nature-pill-expand"
            onClick={() => setIsExpanded(true)}
            aria-label="Customize nature sounds"
            title="Customize nature soundscape"
          >
            <Volume2 size={13} />
            <ChevronUp size={13} />
          </button>
        </div>
      ) : (
        /* ---- Expanded Card ---- */
        <div className="nature-card-panel">
          <div className="nature-card-header">
            <div className="nature-card-title">
              <span className="nature-card-icon">🌿</span>
              <div>
                <strong>Nature Soundscape</strong>
                <small>gentle background for your reflection</small>
              </div>
            </div>
            <button
              className="nature-card-close"
              onClick={() => setIsExpanded(false)}
              aria-label="Close nature sounds panel"
            >
              <X size={15} />
            </button>
          </div>

          {/* Sound Presets */}
          <div className="nature-presets-grid">
            {SOUND_PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isSelected = activeSound === preset.id;
              return (
                <button
                  key={preset.id}
                  className={`nature-preset-btn ${isSelected ? "selected" : ""}`}
                  onClick={() => switchPreset(preset.id)}
                >
                  <Icon size={14} />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>

          {/* Volume & Main Toggle */}
          <div className="nature-controls-row">
            <button
              className={`nature-main-toggle ${isPlaying ? "playing" : ""}`}
              onClick={toggleSound}
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Loading…</span>
              ) : isPlaying ? (
                <>
                  <Pause size={14} />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>Play {currentPreset.label}</span>
                </>
              )}
            </button>

            <div className="nature-volume-slider">
              {volume > 0 ? (
                <Volume2 size={13} className="volume-icon" />
              ) : (
                <VolumeX size={13} className="volume-icon" />
              )}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                aria-label="Nature sound volume"
              />
            </div>
          </div>

          <div className="nature-card-note">
            <span>♡</span> Real nature recordings · tap play and enjoy.
          </div>
        </div>
      )}
    </div>
  );
}
