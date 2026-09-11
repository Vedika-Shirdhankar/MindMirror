import { useState, useRef, useCallback } from 'react';
import * as api from './api.js';

export function useVoiceTranscription() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const onTranscribedRef = useRef(null);

  const startRecording = useCallback(async (onTranscribed) => {
    if (onTranscribed) onTranscribedRef.current = onTranscribed;
    transcriptRef.current = '';
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          transcriptRef.current = currentTranscript;
          if (currentTranscript.trim() && onTranscribedRef.current) {
            onTranscribedRef.current(currentTranscript);
          }
        };

        recognition.onerror = (e) => {
          console.warn('Web Speech API error:', e.error);
          if (e.error !== 'no-speech') {
            setIsRecording(false);
            recognitionRef.current = null;
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
          const text = transcriptRef.current.trim();
          if (text && onTranscribedRef.current) {
            onTranscribedRef.current(text);
          }
          recognitionRef.current = null;
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsRecording(true);
        return;
      } catch (err) {
        console.warn('SpeechRecognition failed to start, falling back to MediaRecorder', err);
      }
    }

    // Fallback: MediaRecorder for server-side Gemini transcription
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
      alert('Could not access microphone. Please check browser microphone permissions.');
    }
  }, []);

  const stopRecording = useCallback((onTranscribed) => {
    if (onTranscribed) onTranscribedRef.current = onTranscribed;

    // 1. If Web Speech API is active
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Error stopping recognition:', err);
        setIsRecording(false);
        recognitionRef.current = null;
      }
      return;
    }

    // 2. If MediaRecorder fallback is active
    if (mediaRecorderRef.current) {
      const recorder = mediaRecorderRef.current;
      mediaRecorderRef.current = null;

      recorder.onstop = async () => {
        setIsRecording(false);
        setIsTranscribing(true);
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64data = reader.result;
          try {
            const response = await api.transcribeVoice(base64data, 'audio/webm');
            if (response?.text && onTranscribedRef.current) {
              onTranscribedRef.current(response.text);
            }
          } catch (e) {
            console.error('Transcription failed', e);
            alert('Transcription failed: ' + (e.message || 'Unknown error'));
          } finally {
            setIsTranscribing(false);
          }
        };
      };

      try {
        recorder.stop();
        if (recorder.stream) {
          recorder.stream.getTracks().forEach(t => t.stop());
        }
      } catch (err) {
        console.warn('Error stopping MediaRecorder:', err);
        setIsRecording(false);
      }
    } else {
      setIsRecording(false);
    }
  }, []);

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