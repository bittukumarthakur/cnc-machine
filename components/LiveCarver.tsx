import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Mic, MicOff, PhoneOff, User, Bot, Loader2 } from 'lucide-react';

// Audio decoding helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
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

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const LiveCarver: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcripts, setTranscripts] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close?.();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();
    setIsActive(false);
    setIsConnecting(false);
  }, []);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      // Create fresh instance right before connecting
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputAudioContext;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } },
          },
          systemInstruction: 'You are a veteran CNC master carver named Elias. You help clients with wood species selection, tool-path logic, and creative design for CNC carving. Be friendly, knowledgeable, and concise. You talk in a warm, steady tone.',
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              // Crucial: only send if session is established
              sessionPromise.then(session => {
                try {
                  session.sendRealtimeInput({ media: pcmBlob });
                } catch (err) {}
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
            setIsActive(true);
            setIsConnecting(false);
          },
          onmessage: async (message) => {
            // Handle Audio
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            // Handle Transcripts
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscripts(prev => [...prev, { role: 'user', text }]);
            }
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscripts(prev => [...prev, { role: 'model', text }]);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch (e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live Error:", e);
            stopSession();
          },
          onclose: () => stopSession(),
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start session:", err);
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, [stopSession]);

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-stone-800 rounded-3xl shadow-2xl overflow-hidden border border-stone-700">
        <div className="p-8 text-center border-b border-stone-700">
          <div className="w-24 h-24 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-600/20">
            <Bot size={48} className="text-stone-900" />
          </div>
          <h1 className="text-3xl font-bold text-stone-100 serif italic">Consult Master Elias</h1>
          <p className="text-stone-400 mt-2">Expert CNC advice in real-time. Start a voice consultation to discuss your project.</p>
        </div>

        <div className="h-96 overflow-y-auto p-6 flex flex-col gap-4 bg-stone-850">
          {transcripts.length === 0 && !isActive && !isConnecting && (
            <div className="h-full flex flex-col items-center justify-center text-stone-500 italic">
              <Mic size={32} className="mb-2 opacity-20" />
              <p>Ready to talk craftsmanship...</p>
            </div>
          )}
          {transcripts.map((t, i) => (
            <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl flex gap-3 ${
                t.role === 'user' ? 'bg-amber-600 text-stone-900 rounded-tr-none' : 'bg-stone-700 text-stone-100 rounded-tl-none'
              }`}>
                {t.role === 'model' && <Bot size={18} className="shrink-0 mt-1" />}
                <p className="text-sm leading-relaxed">{t.text}</p>
                {t.role === 'user' && <User size={18} className="shrink-0 mt-1" />}
              </div>
            </div>
          ))}
          {isConnecting && (
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin text-amber-500" />
            </div>
          )}
        </div>

        <div className="p-8 bg-stone-800 flex justify-center gap-6">
          {!isActive ? (
            <button
              onClick={startSession}
              disabled={isConnecting}
              className="bg-amber-600 hover:bg-amber-500 text-stone-900 px-12 py-4 rounded-full font-bold flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50"
            >
              {isConnecting ? <Loader2 className="animate-spin" /> : <Mic size={24} />}
              {isConnecting ? 'Connecting...' : 'Start Consultation'}
            </button>
          ) : (
            <>
              <div className="flex items-center gap-4 bg-stone-900/50 px-6 py-3 rounded-full border border-stone-700">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-stone-300 font-mono text-sm tracking-widest uppercase">Live Session</span>
              </div>
              <button
                onClick={stopSession}
                className="bg-red-600 hover:bg-red-500 text-white p-4 rounded-full transition-all active:scale-95"
              >
                <PhoneOff size={24} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};