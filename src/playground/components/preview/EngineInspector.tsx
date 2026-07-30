import React from "react";
import { usePlayground } from "../../store/PlaygroundContext";
import { Cpu, ChevronRight } from "lucide-react";

export function EngineInspector() {
  const { compiledPrompt } = usePlayground();

  if (!compiledPrompt) return null;

  return (
    <div className="bg-[#161920] border border-[#21262D] rounded-xl p-4 sm:p-5 flex flex-col shadow-sm">
      <h3 className="text-md font-semibold text-[#F1F3F5] mb-4 flex items-center gap-2">
        <Cpu className="w-5 h-5 text-purple-400" /> Engine Inspector
      </h3>
      
      {/* Execution Timeline Narrative */}
      <div className="flex flex-col gap-0 relative before:absolute before:inset-y-2 before:left-2.5 before:w-px before:bg-[#21262D]">
        <TimelineStep status="complete" label="Analyzing Context" />
        <TimelineStep status="complete" label="Planning Architecture" />
        <TimelineStep status="complete" label="Applying Rules" />
        <TimelineStep status="active" label={compiledPrompt.status} summary={compiledPrompt.executionSummary} />
      </div>
    </div>
  );
}

function TimelineStep({ status, label, summary }: { status: 'complete'|'active'|'pending', label: string, summary?: string }) {
  return (
    <div className="flex gap-4 relative py-2">
      <div className={`
        relative z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5
        ${status === 'complete' ? 'bg-emerald-500 border-emerald-500' : 
          status === 'active' ? 'bg-[#161920] border-purple-400' : 'bg-[#161920] border-[#21262D]'}
      `}>
        {status === 'active' && <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />}
      </div>
      <div className="flex flex-col gap-1 pb-2">
        <span className={`text-sm font-medium ${status === 'active' ? 'text-[#F1F3F5]' : status === 'complete' ? 'text-slate-300' : 'text-[#8B949E]'}`}>
          {label}
        </span>
        {summary && (
          <p className="text-[13px] text-[#8B949E] leading-relaxed bg-[#1C2028] p-3 rounded-lg border border-[#21262D] mt-1">
            {summary}
          </p>
        )}
      </div>
    </div>
  );
}
