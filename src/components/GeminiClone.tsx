import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, Mic, ArrowUp, X, Sparkles, Clock, Compass, Settings, MessageSquare, Code, CheckCircle2, Copy, Check, ExternalLink } from "lucide-react";

export function GeminiClone() {
  const [input, setInput] = useState("");
  const [model, setModel] = useState("Pro Mendalam");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ id: string; query: string; response?: string; isCompiling?: boolean; stats?: any }>>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistory.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  const handleSend = () => {
    if (!input.trim()) return;

    const queryText = input.trim();
    const newId = Date.now().toString();
    
    setInput("");

    const newChat = {
      id: newId,
      query: queryText,
      isCompiling: true
    };

    setChatHistory(prev => [...prev, newChat]);
    setActiveChatId(newId);

    // Simulate intelligent prompt compiler response
    setTimeout(() => {
      setChatHistory(prev =>
        prev.map(item => {
          if (item.id === newId) {
            return {
              ...item,
              isCompiling: false,
              response: `Berikut adalah hasil optimasi prompt & analisis requirement dari **PromptForge** (${model}):

\`\`\`markdown
# SYSTEM PROMPT: ${queryText.toUpperCase()}

## 1. Context & Objective
Anda adalah asisten kecerdasan buatan berkinerja tinggi. Tugas utama Anda adalah mengeksekusi instruksi pengguna: "${queryText}".

## 2. Constraints & Guidelines
- Berikan respon yang terstruktur, padat, dan bebas dari kata-kata pengisi (fluff).
- Gunakan bahasa Indonesia yang formal, ramah, dan profesional.
- Pastikan semua argumen teknis didukung oleh fakta dan langkah-langkah yang jelas.

## 3. Expected Output
1. **Ringkasan Utama**: Poin-poin penting.
2. **Langkah Eksekusi**: Prosedur bertahap.
3. **Hasil Akhir**: Solusi langsung yang dapat diuji.
\`\`\`

---
✨ **Statistik Optimasi Prompt:**
- **Skor Kualitas Prompt:** 96/100
- **Pengurangan Token:** 24%
- **Ekstraksi Requirement:** 3 Kebutuhan Eksplisit Terdeteksi`,
              stats: {
                score: 96,
                extractedReqs: 3,
                timeMs: 142
              }
            };
          }
          return item;
        })
      );
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetToNewChat = () => {
    setActiveChatId(null);
    setSideDrawerOpen(false);
  };

  const currentChat = chatHistory.find(c => c.id === activeChatId);

  return (
    <div className="h-[100dvh] w-full bg-[#131314] text-[#e3e2e6] flex flex-col justify-between overflow-x-hidden font-sans relative select-none">
      
      {/* Background Gradient Glow at Bottom (As seen in image) */}
      <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#0e1738] via-[#0d1226]/80 to-transparent pointer-events-none z-0" />

      {/* TOP HEADER BAR */}
      <header className="relative z-20 flex items-center justify-between px-4 py-3 shrink-0">
        {/* Left Side: Hamburger Menu & Model Dropdown */}
        <div className="flex items-center gap-2">
          {/* Custom 2-Line Hamburger Menu Icon matching the image */}
          <button
            onClick={() => setSideDrawerOpen(true)}
            className="p-2 text-[#c4c7c5] hover:text-white rounded-full hover:bg-white/5 active:scale-95 transition-all"
            aria-label="Buka Menu Sidebar"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="16" x2="21" y2="16" />
            </svg>
          </button>

          {/* "Pro Mendalam" Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/5 active:bg-white/10 transition-colors text-[#e3e2e6] font-normal text-base sm:text-lg"
            >
              <span>{model}</span>
              <ChevronDown className={`w-4 h-4 text-[#c4c7c5] transition-transform duration-200 ${modelDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {modelDropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setModelDropdownOpen(false)} />
                <div className="absolute left-0 mt-2 w-56 bg-[#1e1f20] border border-white/10 rounded-2xl shadow-2xl p-2 z-40 text-sm">
                  <div 
                    onClick={() => { setModel("Pro Mendalam"); setModelDropdownOpen(false); }}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${model === "Pro Mendalam" ? 'bg-white/10 text-white font-medium' : 'text-[#c4c7c5] hover:bg-white/5'}`}
                  >
                    <div>
                      <div className="text-white">Pro Mendalam</div>
                      <div className="text-xs text-gray-400">Penalaran kompleks & instruksi panjang</div>
                    </div>
                    {model === "Pro Mendalam" && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
                  </div>

                  <div 
                    onClick={() => { setModel("Flash 2.5"); setModelDropdownOpen(false); }}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${model === "Flash 2.5" ? 'bg-white/10 text-white font-medium' : 'text-[#c4c7c5] hover:bg-white/5'}`}
                  >
                    <div>
                      <div className="text-white">Flash 2.5</div>
                      <div className="text-xs text-gray-400">Respon cepat kilat</div>
                    </div>
                    {model === "Flash 2.5" && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Edit/Sparkle Icon & User Avatar */}
        <div className="flex items-center gap-2">
          {/* Pen / Sparkle Edit Icon */}
          <button
            onClick={resetToNewChat}
            className="p-2 text-[#c4c7c5] hover:text-white rounded-full hover:bg-white/5 active:scale-95 transition-all"
            title="Chat Baru"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              <path d="m15 5 3 3" />
            </svg>
          </button>

          {/* Circular Moai / User Avatar matching screenshot */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white/20 flex items-center justify-center bg-gradient-to-tr from-amber-800 via-emerald-900 to-indigo-950 text-xl shadow-md cursor-pointer hover:opacity-90 transition-opacity">
            <span>🗿</span>
          </div>
        </div>
      </header>

      {/* SIDE DRAWER MENU (MOBILE & DESKTOP) */}
      {sideDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSideDrawerOpen(false)} />
          <div className="relative w-72 max-w-[80vw] bg-[#1e1f20] h-full flex flex-col justify-between p-4 z-50 border-r border-white/10 text-[#e3e2e6] shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-lg text-white tracking-tight">PromptForge</span>
                </div>
                <button onClick={() => setSideDrawerOpen(false)} className="p-1 text-gray-400 hover:text-white rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={resetToNewChat}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/15 text-white rounded-full font-medium mb-6 transition-all shadow-md"
              >
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>Percakapan Baru</span>
              </button>

              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Riwayat Prompt</div>
              <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
                {chatHistory.length === 0 ? (
                  <div className="text-sm text-gray-500 italic px-2 py-3">Belum ada riwayat percakapan.</div>
                ) : (
                  chatHistory.map(item => (
                    <button
                      key={item.id}
                      onClick={() => { setActiveChatId(item.id); setSideDrawerOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left truncate transition-colors ${activeChatId === item.id ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'text-gray-300 hover:bg-white/5'}`}
                    >
                      <MessageSquare className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="truncate">{item.query}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-xl cursor-pointer">
                <Settings className="w-4 h-4 text-gray-400" />
                <span>Pengaturan</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CENTER CONTENT AREA */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 text-center overflow-y-auto max-w-2xl mx-auto w-full py-4">
        
        {!activeChatId || !currentChat ? (
          /* INITIAL GEMINI GREETING VIEW (Exact visual clone of screenshot) */
          <div className="flex flex-col items-center justify-center my-auto">
            {/* Inline 4-Pointed Gradient Star Icon (Exact Gemini Sparkle) */}
            <div className="mb-6 animate-pulse">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 sm:w-14 sm:h-14">
                <defs>
                  <linearGradient id="geminiStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4285F4" />
                    <stop offset="35%" stopColor="#9B51E0" />
                    <stop offset="70%" stopColor="#EA4335" />
                    <stop offset="100%" stopColor="#FBBC05" />
                  </linearGradient>
                </defs>
                <path
                  d="M24 0C24 13.2548 13.2548 24 0 24C13.2548 24 24 34.7452 24 48C24 34.7452 34.7452 24 48 24C34.7452 24 24 13.2548 24 0Z"
                  fill="url(#geminiStarGrad)"
                />
              </svg>
            </div>

            {/* Greeting Headline Typography matching screenshot */}
            <h1 className="text-[28px] sm:text-4xl text-[#e3e2e6] font-normal leading-[1.3] tracking-tight max-w-xs sm:max-w-md mx-auto">
              Ada rencana apa hari ini, Tian?
            </h1>
          </div>
        ) : (
          /* ACTIVE CHAT / COMPILATION RESULT VIEW */
          <div className="w-full h-full flex flex-col text-left py-4 space-y-6 overflow-y-auto">
            {/* User Prompt Bubble */}
            <div className="flex justify-end">
              <div className="bg-[#282a2c] text-[#e3e2e6] px-5 py-3 rounded-2xl max-w-[85%] text-base shadow-md border border-white/5">
                {currentChat.query}
              </div>
            </div>

            {/* Response Area */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-amber-400 p-0.5 shrink-0 mt-1">
                <div className="w-full h-full bg-[#131314] rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-300" />
                </div>
              </div>

              <div className="flex-1 space-y-3">
                {currentChat.isCompiling ? (
                  <div className="flex items-center gap-3 text-gray-400 py-4">
                    <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium animate-pulse">Memproses prompt dengan PromptForge Engine...</span>
                  </div>
                ) : (
                  <div className="bg-[#1e1f20] border border-white/10 rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-gray-200 leading-relaxed shadow-xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Prompt Compiler Ready
                      </span>
                      <button
                        onClick={() => handleCopy(currentChat.id, currentChat.response || "")}
                        className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1 text-xs"
                      >
                        {copiedId === currentChat.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === currentChat.id ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>

                    <div className="whitespace-pre-wrap font-sans text-[#e3e2e6]">
                      {currentChat.response}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div ref={bottomRef} />
          </div>
        )}

      </main>

      {/* BOTTOM INPUT AREA (THE PROMPT BAR - Exact Floating Pill matching image) */}
      <footer className="relative z-20 pb-6 sm:pb-8 pt-2 px-4 w-full max-w-2xl mx-auto shrink-0">
        <div className="bg-[#1e1f20] hover:bg-[#232426] transition-colors rounded-full px-4 py-3 sm:py-3.5 flex items-center gap-3 border border-white/5 shadow-2xl">
          
          {/* Left Icon: Plus (+) */}
          <button
            onClick={() => setSideDrawerOpen(true)}
            className="p-1 text-[#c4c7c5] hover:text-white rounded-full hover:bg-white/10 active:scale-95 transition-all shrink-0"
            title="Tambah File / Konteks"
          >
            <Plus className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          {/* Text Input: Placeholder "Minta PromptForge" */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Minta PromptForge"
            className="flex-1 bg-transparent text-[#e3e2e6] placeholder:text-[#8e918f] font-normal text-base sm:text-lg focus:outline-none border-none px-1"
          />

          {/* Right Icon: Microphone or Send */}
          {input.trim().length > 0 ? (
            <button
              onClick={handleSend}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full active:scale-90 transition-all shrink-0 shadow-md"
              title="Kirim Prompt"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => {
                setIsListening(!isListening);
                if (!isListening) {
                  setInput("Buatkan panduan lengkap arsitektur microservice React dan Express");
                }
              }}
              className={`p-1.5 rounded-full transition-all shrink-0 ${isListening ? 'text-red-400 animate-pulse bg-red-500/20' : 'text-[#c4c7c5] hover:text-white hover:bg-white/10'}`}
              title="Input Suara"
            >
              <Mic className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          )}

        </div>
      </footer>

    </div>
  );
}
