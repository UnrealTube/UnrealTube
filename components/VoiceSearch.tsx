"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface VoiceSearchProps {
  onResult: (transcript: string) => void;
  lang?: string;
}

type VoiceState = "idle" | "listening" | "processing" | "error";

// Minimal typings for Web Speech API (not in all TS lib targets)
interface ISpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onspeechend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: ISpeechRecognitionEvent) => void) | null;
}
interface ISpeechRecognitionEvent extends Event {
  results: { 0: { 0: { transcript: string } } };
}
declare global {
  interface Window {
    SpeechRecognition?: new () => ISpeechRecognition;
    webkitSpeechRecognition?: new () => ISpeechRecognition;
  }
}

export function VoiceSearch({ onResult, lang = "tr-TR,en-US" }: VoiceSearchProps) {
  const [state, setState] = useState<VoiceState>("idle");
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SpeechRec);
  }, []);

  const start = useCallback(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;

    const recognition = new SpeechRec();
    recognition.lang = lang.split(",")[0]; // primary lang
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setState("listening");
    recognition.onspeechend = () => setState("processing");

    recognition.onresult = (e: ISpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setState("idle");
      onResult(transcript);
    };

    recognition.onerror = () => {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    };

    recognition.onend = () => {
      if (state === "listening") setState("idle");
    };

    recognition.start();
  }, [lang, onResult, state]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setState("idle");
  }, []);

  const toggle = () => {
    if (state === "listening") stop();
    else start();
  };

  if (!supported) return null;

  const isActive = state === "listening";
  const isProcessing = state === "processing";

  return (
    <button
      type="button"
      onClick={toggle}
      title={isActive ? "Stop listening" : "Search by voice"}
      className="p-2.5 rounded-full transition-all hover:scale-105 flex-shrink-0 relative"
      style={{
        background: isActive
          ? "rgba(239,68,68,0.15)"
          : "rgba(255,255,255,0.04)",
        border: isActive
          ? "1px solid rgba(239,68,68,0.5)"
          : "1px solid rgba(255,255,255,0.08)",
        boxShadow: isActive ? "0 0 16px rgba(239,68,68,0.3)" : "none",
      }}
    >
      {isProcessing ? (
        <Loader2 size={18} className="animate-spin text-[#00D4FF]" />
      ) : isActive ? (
        <MicOff size={18} className="text-red-400" />
      ) : (
        <Mic size={18} className="text-[#7A8BA0] hover:text-[#00D4FF] transition-colors" />
      )}

      {/* Ripple ring when listening */}
      {isActive && (
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ background: "rgba(239,68,68,0.2)" }}
        />
      )}
    </button>
  );
}
