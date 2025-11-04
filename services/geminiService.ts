import { GoogleGenAI, LiveServerMessage, Modality, Blob, GenerateContentResponse } from "@google/genai";

/**
 * Browser-safe Gemini helpers (text-only).
 * - Uses import.meta.env.VITE_GEMINI_API_KEY (preferred) or window.__ENV fallbacks
 * - Avoids referencing `process` at module top-level (safe for browser builds)
 * - Exports generateGroundedContent (REST), binary helpers, and a small useScreenShare hook
 */

export type GroundingChunk = { web?: { uri?: string; title?: string } };

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta2';

const getApiKey = (): string | undefined => {
  try {
    const env = (import.meta as any)?.env;
    if (env) {
      if (env.VITE_GEMINI_API_KEY) return env.VITE_GEMINI_API_KEY;
      if (env.VITE_GOOGLE_API_KEY) return env.VITE_GOOGLE_API_KEY;
    }
  } catch {
    /* ignore */
  }

  if (typeof window !== 'undefined') {
    const w = window as any;
    if (w.__ENV) {
      if (w.__ENV.VITE_GEMINI_API_KEY) return w.__ENV.VITE_GEMINI_API_KEY;
      if (w.__ENV.VITE_GOOGLE_API_KEY) return w.__ENV.VITE_GOOGLE_API_KEY;
      if (w.__ENV.GEMINI_API_KEY) return w.__ENV.GEMINI_API_KEY;
    }
  }

  // Server-side fallback only when process exists
  if (typeof process !== 'undefined' && (process as any).env) {
    return (process as any).env.VITE_GEMINI_API_KEY || (process as any).env.VITE_GOOGLE_API_KEY || (process as any).env.GEMINI_API_KEY;
  }

  return undefined;
};

/**
 * Simple REST call to Gemini text generation.
 * Returns plain text and an empty sources array when grounding metadata is not available.
 */
export async function generateGroundedContent(prompt: string): Promise<{ text: string; sources: GroundingChunk[] }> {
  const key = getApiKey();
  if (!key) {
    console.warn('Missing Gemini API key. Set VITE_GEMINI_API_KEY in .env or provide window.__ENV.');
    return { text: 'AI features are unavailable (API key missing).', sources: [] };
  }

  try {
    const url = `${API_BASE}/models/text-bison-001:generateText?key=${encodeURIComponent(key)}`;
    const body = {
      instances: [{ content: prompt }],
      parameters: { temperature: 0.2, maxOutputTokens: 512 },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.error('Gemini API error:', res.status, txt);
      return { text: 'Sorry, an error occurred while contacting the AI service.', sources: [] };
    }

    const json = await res.json();
    // Normalize possible response shapes; adapt if your API returns a different structure
    const text =
      (json?.predictions?.[0]?.content as string) ??
      (json?.candidates?.[0]?.content as string) ??
      (json?.output?.[0]?.content as string) ??
      (json?.text as string) ??
      '';
    return { text: String(text || '').trim() || 'No response.', sources: [] };
  } catch (err) {
    console.error('generateGroundedContent error', err);
    return { text: 'Sorry, I encountered an error while generating content.', sources: [] };
  }
}

/* Binary helpers kept for optional audio features */
export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function createPcmBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = Math.max(-32768, Math.min(32767, Math.floor(data[i] * 32768)));
  }
  return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
}

/* Lightweight screen-share hook for components to reuse */
import { useRef, useState } from 'react';

export function useScreenShare() {
  const streamRef = useRef<MediaStream | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const onTrackEnded = () => {
    stopScreenShare();
  };

  const startScreenShare = async (constraints: MediaStreamConstraints = { video: true, audio: false }) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      console.warn('getDisplayMedia not supported');
      return null;
    }
    try {
      if (streamRef.current) return streamRef.current;
      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      streamRef.current = stream;
      stream.getVideoTracks().forEach((t) => (t.onended = onTrackEnded));
      setIsSharing(true);
      return stream;
    } catch (err: any) {
      if (err?.name === 'NotAllowedError' || err?.name === 'SecurityError') {
        console.warn('User denied screen share permission or extension blocked access:', err);
      } else {
        console.error('getDisplayMedia error:', err);
      }
      streamRef.current = null;
      setIsSharing(false);
      return null;
    }
  };

  const stopScreenShare = () => {
    const s = streamRef.current;
    if (!s) {
      setIsSharing(false);
      return;
    }
    s.getTracks().forEach((t) => {
      try {
        t.onended = null;
      } catch {}
      try {
        t.stop();
      } catch {}
    });
    streamRef.current = null;
    setIsSharing(false);
  };

  return { isSharing, startScreenShare, stopScreenShare, getStream: () => streamRef.current };
}
