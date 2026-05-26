import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, Moon, Mic, History, Trash2, Copy, Share2, Delete, MicOff, Calculator
} from 'lucide-react';
import { useCalculator } from './hooks/useCalculator';
import { parseSpeechToMath } from './utils/speech';
import { playClickSound } from './utils/audio';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { expression, setExpression, history, handleInput, clearHistory } = useCalculator();

  // Clock effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Splash screen effect
  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(splashTimer);
  }, []);

  // Set dark mode HTML class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Voice Recognition
  const recognitionRef = useRef<any>(null);

  const toggleVoice = () => {
    playClickSound();
    
    // Check support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser Anda tidak mendukung fitur Voice Note (Speech API). Coba gunakan Google Chrome.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const mathStr = parseSpeechToMath(transcript);
        if (mathStr) {
          setExpression((prev) => (prev === '0' || prev === 'Error') ? mathStr : prev + mathStr);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'aborted') {
          alert('Terjadi kesalahan mikrofon: ' + event.error);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error("Gagal memulai Voice Recognition:", e);
      alert("Gagal memulai mikrofon. Pastikan izin telah diberikan.");
      setIsListening(false);
    }
  };

  const copyResult = () => {
    playClickSound();
    navigator.clipboard.writeText(expression).then(() => {
      // Optional subtle feedback
    });
  };

  const shareResult = async () => {
    playClickSound();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MyKalkulator Result',
          text: `Hasil perhitungan saya: ${expression}\nDihitung menggunakan MyKalkulator.`,
        });
      } catch (err) {
        // Ignored, user might have cancelled
      }
    } else {
      copyResult();
      alert("Hasil disalin ke clipboard!");
    }
  };

  const KEYPAD = [
    ['AC', 'DEL', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=', '='] // We will span 0 and = in CSS grid
  ];

  if (showSplash) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-blue-300 dark:from-slate-900 dark:to-slate-800 z-50">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-white/20 backdrop-blur-lg rounded-3xl mb-6 shadow-xl flex items-center justify-center text-white">
             <div className="text-4xl font-bold">MK</div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wider">MyKalkulator</h1>
          <p className="text-blue-100 mt-2 font-medium">Smart & Minimalist</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-[#E0F2FE] to-[#F0F9FF] dark:from-slate-900 dark:to-slate-950 flex flex-col lg:grid lg:grid-cols-[1fr_320px] font-sans text-slate-800 dark:text-slate-200 transition-colors duration-500 relative">
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-10 justify-between relative overflow-y-auto lg:overflow-hidden z-10 w-full h-full max-h-screen">
        <header className="flex justify-between items-center mb-5 shrink-0">
          <div className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-blue-500 pr-10">
            <Calculator size={32} strokeWidth={2.5} />
            MyKalkulator
          </div>
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-light text-slate-800 dark:text-slate-200">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="hidden sm:block text-[12px] uppercase tracking-widest text-slate-500 font-medium">
              {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center my-auto min-h-[500px]">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-[16px] border border-white/40 dark:border-slate-700/50 rounded-[32px] w-full max-w-[400px] p-6 lg:p-[30px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-blue-900/10">
            <div className="relative text-right mb-6 pt-10 pb-5 px-5 bg-white/50 dark:bg-slate-900/50 border border-white/20 dark:border-slate-700/50 rounded-2xl min-h-[120px] flex flex-col justify-end">
              <button 
                onClick={toggleVoice}
                title="Input Suara"
                className={`absolute top-3 left-3 z-20 p-2.5 rounded-full flex items-center justify-center cursor-pointer transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 shadow-sm'}`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <div className="text-sm font-medium text-slate-500 mb-1 break-all line-clamp-1"></div>
              <motion.div 
                key={expression}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-5xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 leading-tight break-all"
              >
                {expression}
              </motion.div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {KEYPAD.map((row, rIdx) => 
                row.map((btn, cIdx) => {
                  if (rIdx === 4 && (cIdx === 1 || btn === '=')) return null; 
                  if (rIdx === 4 && cIdx === 0) return null; // skip the whole bottom row as loop mapping

                  const isOperator = ['÷', '×', '-', '+'].includes(btn);
                  const isAction = ['DEL', '%'].includes(btn);
                  const isClear = btn === 'AC';
                  
                  let classes = "h-14 font-medium text-lg rounded-[14px] flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all active:scale-95 border-none cursor-pointer ";
                  
                  if (isClear) {
                    classes += "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400";
                  } else if (isAction) {
                    classes += "bg-blue-300/30 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400";
                  } else if (isOperator) {
                    classes += "bg-blue-300/30 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400";
                  } else {
                    classes += "bg-white text-slate-800 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";
                  }

                  return (
                    <button
                      key={`btn-${rIdx}-${cIdx}`}
                      onClick={() => handleInput(btn)}
                      className={classes}
                    >
                      {btn === 'DEL' ? <Delete size={20} /> : btn}
                    </button>
                  );
                })
              )}
              {/* Custom bottom row */}
              <button onClick={() => handleInput('0')} className="col-span-2 h-14 font-medium text-lg rounded-[14px] flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all active:scale-95 border-none cursor-pointer bg-white text-slate-800 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">0</button>
              <button onClick={() => handleInput('.')} className="h-14 font-medium text-lg rounded-[14px] flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all active:scale-95 border-none cursor-pointer bg-white text-slate-800 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">.</button>
              <button onClick={() => handleInput('=')} className="h-14 font-medium text-lg rounded-[14px] flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all active:scale-95 border-none cursor-pointer bg-blue-500 text-white hover:bg-blue-600 shadow-[0_4px_10px_rgba(59,130,246,0.2)]">=</button>
            </div>
          </div>
        </div>
      </main>

      {/* Sidebar Overlay logic for mobile, static for desktop */}
      <div className={`fixed inset-0 z-50 lg:z-auto lg:static transition-transform duration-300 ${showHistory ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'} lg:block pointer-events-none`}>
        {/* Mobile backdrop close */}
        {showHistory && (
          <div className="absolute inset-0 bg-black/20 dark:bg-black/80 lg:hidden pointer-events-auto" onClick={() => setShowHistory(false)}></div>
        )}
        
        <aside className="absolute inset-x-0 bottom-0 top-16 lg:top-0 lg:h-full bg-white/95 lg:bg-white/40 dark:bg-slate-900/95 dark:lg:bg-slate-900/40 backdrop-blur-xl lg:backdrop-blur-none border-t lg:border-t-0 lg:border-l border-black/5 dark:border-white/5 p-6 lg:p-[30px] flex flex-col rounded-t-[32px] lg:rounded-t-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-none pointer-events-auto">
          <div className="lg:hidden w-12 h-1.5 bg-gray-300 dark:bg-slate-700 rounded-full mx-auto mb-6 shrink-0"></div>
          
          <div className="flex justify-between items-center mb-5 shrink-0">
            <h3 className="text-[14px] font-semibold uppercase tracking-[1px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <History size={16} /> Riwayat
            </h3>
            <button 
              onClick={clearHistory}
              disabled={history.length === 0}
              className="text-xs font-semibold text-red-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Trash2 size={12} /> Bersihkan
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1 min-h-[100px] pb-4">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 opacity-60">
                <History size={32} className="mb-2" />
                <p className="text-sm">Belum ada riwayat</p>
              </div>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id}
                  className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-[0_2px_6px_rgba(0,0,0,0.03)] dark:shadow-none border border-transparent dark:border-slate-700 border-l-4 border-l-blue-300 dark:border-l-blue-500 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  onClick={() => {
                    playClickSound();
                    setExpression(item.result);
                    if (window.innerWidth < 1024) setShowHistory(false);
                  }}
                >
                  <div className="text-[13px] text-slate-500 dark:text-slate-400 mb-1">{item.expression} =</div>
                  <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">{item.result}</div>
                </div>
              ))
            )}
          </div>

          <div className="mt-2 shrink-0 grid grid-cols-2 gap-2.5 pt-4">
            <button 
              onClick={toggleVoice}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer transition-all relative z-50 ${
                isListening 
                  ? 'bg-red-50 border-red-500 text-red-600 shadow-[0_0_0_rgba(239,68,68,0.4)] animate-[pulse_2s_infinite] dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-white border-black/10 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />} Suara
            </button>
            <button 
              onClick={() => { playClickSound(); setIsDarkMode(!isDarkMode); }}
              className="p-3 rounded-xl border border-black/10 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />} Theme
            </button>
            <button 
              onClick={copyResult}
              className="p-3 rounded-xl border border-black/10 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Copy size={16} /> Salin
            </button>
            <button 
              onClick={shareResult}
              className="p-3 rounded-xl border border-black/10 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Share2 size={16} /> Share
            </button>
          </div>
          
          {isListening && (
            <div className="flex items-center gap-[6px] text-[11px] text-slate-500 mt-3 font-medium shrink-0 relative z-50">
              <div className="w-[6px] h-[6px] rounded-full bg-red-500 animate-pulse"></div>
              Mendengarkan suara... (Coba: "dua tambah tiga")
            </div>
          )}
        </aside>
      </div>

      {/* Mobile Top Controls Toggle - we keep a floating button for history if it's mobile */}
      <div className="lg:hidden absolute top-4 right-4 z-20 flex gap-2">
        <button 
          onClick={() => { playClickSound(); setShowHistory(!showHistory); }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-black/10 dark:border-white/10 p-3 rounded-full text-slate-600 dark:text-slate-300 shadow-sm transition-all active:scale-95"
        >
          <History size={20} />
        </button>
      </div>
    </div>
  );
}
