import React from "react";
import { usePlayground } from "../../store/PlaygroundContext";
import { Activity } from "lucide-react";

export function BenchmarkView() {
  const { optimizationResult, compiledPrompt } = usePlayground();

  if (!optimizationResult && !compiledPrompt) return null;

  return (
    <div className="bg-[#161920] border border-[#21262D] rounded-xl p-4 sm:p-5 flex flex-col shadow-sm">
      <h3 className="text-md font-semibold text-[#F1F3F5] mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-amber-400" /> Benchmarks
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-[#1C2028] p-4 rounded-xl border border-[#21262D] flex flex-col justify-center items-center">
          <p className="text-xs text-[#8B949E] mb-1 font-medium">Original Tokens</p>
          <p className="text-2xl font-bold text-[#F1F3F5]">
            {optimizationResult?.originalTokens || compiledPrompt?.compiledPrompt?.estimatedTokens || 0}
          </p>
        </div>
        <div className="bg-[#1C2028] p-4 rounded-xl border border-[#21262D] flex flex-col justify-center items-center">
          <p className="text-xs text-[#8B949E] mb-1 font-medium">Optimized Tokens</p>
          <p className="text-2xl font-bold text-emerald-400">
            {optimizationResult?.optimizedTokens || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
