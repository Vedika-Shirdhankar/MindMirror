// src/components/landing/AmbientAudio.jsx
import React, { useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AmbientAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const noiseSourceRef = useRef(null);
  const chimeIntervalRef = useRef(null);

  const startSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 3);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Gentle Pink Noise Wind
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Warm low-pass filter for wind
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();
      noiseSourceRef.current = noise;

      // Periodic gentle crystalline chime (tuned to pentatonic E major)
      const frequencies = [329.63, 369.99, 415.30, 493.88, 554.37, 659.25];
      chimeIntervalRef.current = setInterval(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        const noteFreq = frequencies[Math.floor(Math.random() * frequencies.length)];
        const osc = ctx.createOscillator();
        const chimeGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(noteFreq, ctx.currentTime);

        chimeGain.gain.setValueAtTime(0, ctx.currentTime);
        chimeGain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.1);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.5);

        osc.connect(chimeGain);
        chimeGain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 3.6);
      }, 5000);

      setIsPlaying(true);
    } catch (err) {
      console.error('Audio start error:', err);
    }
  };

  const stopSound = () => {
    if (chimeIntervalRef.current) clearInterval(chimeIntervalRef.current);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 1);
      setTimeout(() => {
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
          audioCtxRef.current.close();
        }
        setIsPlaying(false);
      }, 1000);
    } else {
      setIsPlaying(false);
    }
  };

  const toggleSound = () => {
    if (isPlaying) stopSound();
    else startSound();
  };

  return (
    <button
      onClick={toggleSound}
      className={`landing-ambient-toggle ${isPlaying ? 'playing' : ''}`}
      title={isPlaying ? 'Mute serene nature sound' : 'Listen to gentle mountain breeze'}
      aria-label="Toggle serene soundscape"
    >
      {isPlaying ? (
        <>
          <Volume2 size={14} className="animate-pulse" />
          <span>Breeze playing</span>
        </>
      ) : (
        <>
          <VolumeX size={14} />
          <span>Nature sounds</span>
        </>
      )}
    </button>
  );
}
