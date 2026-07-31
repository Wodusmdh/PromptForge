import sys

with open('src/playground/components/editor/PromptEditor.tsx', 'r') as f:
    content = f.read()

replacement = """import React, { useState } from "react";
import { usePlayground } from "../../store/PlaygroundContext";
import { api } from "../../api/client";
import { Play, Sparkles, CheckCircle2, FileText, AlertTriangle, ShieldCheck } from "lucide-react";

export function PromptEditor() {
  const { 
    idea, setIdea, 
    setCompiledPrompt, 
    sessionId, setSessionId,
    setOptimizationResult, 
    setValidationResult, 
    addToHistory, 
    setIsLoading, isLoading,
    isAuthInitializing, authError
  } = usePlayground();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCompile = async () => {
    if (!idea || isAuthInitializing || authError) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const compiled = await api.compile(idea);
      setCompiledPrompt(compiled);
      
      if (compiled.sessionId) {
        setSessionId(compiled.sessionId);
      }
      
      addToHistory({
        id: Math.random().toString(36).substring(7),
        idea,
        compiledMarkdown: compiled.compiledPrompt?.compiledMarkdown || "",
        timestamp: Date.now()
      });
      
      // Clear downstream results
      setOptimizationResult(null);
      setValidationResult(null);
    } catch (e: any) {
      console.error(e);
      setErrorMsg("Compilation failed\\n\\n" + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!sessionId || isAuthInitializing || authError) {
      setErrorMsg("Cannot optimize: No active session. Compile a prompt first.");
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await api.optimize(sessionId);
      setOptimizationResult(result);
    } catch (e: any) {
      console.error(e);
      setErrorMsg("Optimization failed\\n\\n" + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!sessionId || isAuthInitializing || authError) {
      setErrorMsg("Cannot validate: No active session. Compile a prompt first.");
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await api.validate(sessionId);
      setValidationResult(result);
    } catch (e: any) {
      console.error(e);
      setErrorMsg("Validation failed\\n\\n" + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#161920] border border-[#21262D] rounded-xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm h-full flex-1">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-lg font-semibold text-[#F1F3F5] flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" /> Omni-Box
        </h2>
        <div className="flex items-center gap-4">
          {isAuthInitializing && (
            <span className="text-xs text-indigo-400 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border border-indigo-400/50 border-t-indigo-400 animate-spin" />
              Initializing secure session...
            </span>
          )}
          {!isAuthInitializing && !authError && (
             <span className="text-xs text-emerald-400 flex items-center gap-1">
               <ShieldCheck className="w-3 h-3" /> Secure Session Active
             </span>
          )}
          <div className="flex gap-2 text-xs text-[#8B949E]">
            <span>Words: {idea.split(/\\s+/).filter(w => w).length}</span>
            <span className="hidden sm:inline">Tokens: {Math.ceil(idea.length / 4)}</span>
          </div>
        </div>
      </div>
      
      {(errorMsg || authError) && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-sm flex gap-3 whitespace-pre-wrap font-mono">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
          <div className="overflow-x-auto">{authError || errorMsg}</div>
        </div>
      )}
      
      <div className="flex-1 min-h-[250px] relative rounded-xl border border-[#21262D] bg-[#1C2028] focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all duration-200 ease-out flex flex-col overflow-hidden">
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Describe the application you want to build..."
          disabled={isAuthInitializing || !!authError}
          className="flex-1 w-full bg-transparent p-4 text-[15px] leading-relaxed text-[#F1F3F5] placeholder-[#8B949E] focus:outline-none font-mono resize-none hide-scrollbar disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 shrink-0">
        <button
          onClick={handleCompile}
          disabled={isLoading || !idea || isAuthInitializing || !!authError}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 sm:py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-150 ease-out active:scale-[0.98] active:bg-indigo-700 shadow-sm"
        >
          {isLoading || isAuthInitializing ? (
            <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          Compile
        </button>
        <button
          onClick={handleOptimize}
          disabled={isLoading || !idea || !sessionId || isAuthInitializing || !!authError}
          className="flex-1 bg-[#1C2028] hover:bg-[#2A2E37] border border-[#21262D] text-[#F1F3F5] font-medium py-3 sm:py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-150 ease-out active:scale-[0.98] shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Optimize
        </button>
        <button
          onClick={handleValidate}
          disabled={isLoading || !idea || !sessionId || isAuthInitializing || !!authError}
          className="flex-1 bg-[#1C2028] hover:bg-[#2A2E37] border border-[#21262D] text-[#F1F3F5] font-medium py-3 sm:py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-150 ease-out active:scale-[0.98] shadow-sm"
        >
          <CheckCircle2 className="w-4 h-4 text-blue-400" />
          Validate
        </button>
      </div>
    </div>
  );
}
"""

with open('src/playground/components/editor/PromptEditor.tsx', 'w') as f:
    f.write(replacement)
