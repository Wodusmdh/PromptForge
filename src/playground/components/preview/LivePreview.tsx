import React from "react";
import { usePlayground } from "../../store/PlaygroundContext";
import { FileCode, Sparkles, Copy, Download, CheckCircle } from "lucide-react";

export function LivePreview() {
  const { compiledPrompt, optimizationResult } = usePlayground();
  const [copied, setCopied] = React.useState(false);

  if (!compiledPrompt) {
    return (
      <div className="bg-[#161920] border border-[#21262D] rounded-xl p-8 flex flex-col items-center justify-center text-[#8B949E] flex-1 shadow-sm opacity-80 min-h-[300px]">
        <FileCode className="w-12 h-12 mb-4 stroke-[1]" />
        <p className="text-center text-[15px] font-medium">Awaiting compilation...</p>
      </div>
    );
  }

  const promptToShow = optimizationResult 
    ? optimizationResult.optimizedMarkdown 
    : compiledPrompt.compiledPrompt?.compiledMarkdown;

  const handleCopy = () => {
    navigator.clipboard.writeText(promptToShow || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#161920] border border-[#21262D] rounded-xl flex flex-col flex-1 shadow-sm min-h-[400px]">
      <div className="flex justify-between items-center p-4 sm:p-5 border-b border-[#21262D] shrink-0 bg-[#161920] rounded-t-xl z-10">
        <h2 className="text-lg font-semibold text-[#F1F3F5] flex items-center gap-2">
          {optimizationResult ? <Sparkles className="w-5 h-5 text-emerald-400" /> : <FileCode className="w-5 h-5 text-indigo-400" />}
          {optimizationResult ? "Optimized Prompt" : "Compiled Prompt"}
        </h2>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex text-xs font-mono font-medium text-[#8B949E] bg-[#1C2028] border border-[#21262D] px-2.5 py-1 rounded-md">
            Tokens: {optimizationResult ? optimizationResult.optimizedTokens : compiledPrompt.compiledPrompt?.estimatedTokens || 0}
          </div>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 text-xs font-medium bg-[#1C2028] hover:bg-[#2A2E37] border border-[#21262D] text-[#F1F3F5] rounded-md transition-all duration-150 active:scale-[0.98]"
            title="Copy to Clipboard"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#8B949E]" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </button>
          <button 
            className="flex items-center justify-center p-1.5 sm:px-3 sm:py-1.5 text-xs font-medium bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 rounded-md transition-all duration-150 active:scale-[0.98]"
            title="Export JSON"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>
      <div className="flex-1 relative bg-[#0F1115] rounded-b-xl overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto hide-scrollbar p-5">
          <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-[#F1F3F5]/90">
            {promptToShow || "No content generated."}
          </pre>
        </div>
      </div>
    </div>
  );
}
