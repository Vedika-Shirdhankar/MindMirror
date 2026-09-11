import { useState, useRef, useCallback } from 'react';
import * as api from './api.js';

export function useVoiceTranscription() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];
      recorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (e) {
      console.error('Microphone access denied or error:', e);
      alert('Could not access microphone.');
    }
  };

  const stopRecording = (onTranscribed) => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) return resolve(null);
      
      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        setIsTranscribing(true);
const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64data = reader.result;
          try {
            const response = await api.transcribeVoice(base64data, 'audio/webm');
            if (onTranscribed) onTranscribed(response.text);
            resolve(response.text);
          } catch (e) {
            console.error('Transcription failed', e);
            resolve(null);
          } finally {
            setIsTranscribing(false);
          }
        };
      };
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    });
  };

  return { isRecording, isTranscribing, startRecording, stopRecording };
}

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak, stop };
}