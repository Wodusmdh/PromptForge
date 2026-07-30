import React from "react";
import { usePlayground } from "../../store/PlaygroundContext";
import { Clock, RotateCcw } from "lucide-react";

export function HistoryPanel() {
  const { history, setIdea, setCompiledPrompt, setOptimizationResult, setValidationResult } = usePlayground();

  const restore = (item: any) => {
    setIdea(item.idea);
    setCompiledPrompt({ compiledPrompt: { compiledMarkdown: item.compiledMarkdown, estimatedTokens: Math.ceil(item.compiledMarkdown.length / 4) }});
    setOptimizationResult(null);
    setValidationResult(null);
  };

  return (
    <div className="bg-[#161920] border border-[#21262D] rounded-xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm h-full flex-1">
      <h2 className="text-lg font-semibold text-[#F1F3F5] flex items-center gap-2 shrink-0">
        <Clock className="w-5 h-5 text-indigo-400" /> History
      </h2>
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto hide-scrollbar">
        {history.map((h, i) => (
          <div 
            key={i} 
            onClick={() => restore(h)} 
            className="bg-[#1C2028] p-4 rounded-xl border border-[#21262D] cursor-pointer hover:border-indigo-500/50 hover:bg-[#1E232C] transition-all duration-150 ease-out active:scale-[0.98] group relative overflow-hidden"
          >
            <p className="text-[15px] text-[#F1F3F5] line-clamp-2 leading-relaxed font-mono text-sm">{h.idea}</p>
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-[#8B949E] font-medium">{new Date(h.timestamp).toLocaleTimeString()}</p>
              <RotateCcw className="w-3.5 h-3.5 text-[#8B949E] opacity-0 group-hover:opacity-100 group-hover:text-indigo-400 transition-all duration-200" />
            </div>
          </div>
        ))}
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-[#8B949E] gap-3 opacity-60">
            <Clock className="w-10 h-10 stroke-[1.5]" />
            <p className="text-sm text-center">No compiled prompts yet.<br/>Run a compilation to see history.</p>
          </div>
        )}
      </div>
    </div>
  );
}
