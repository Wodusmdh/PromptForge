import React, { useState } from "react";
import {
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  FileCode,
  Terminal,
  Zap,
  Sliders,
  Send,
  Loader2,
  ListChecks,
  Code2,
} from "lucide-react";
import { ForgedPromptData } from "../types";

interface MasterPromptViewProps {
  promptData: ForgedPromptData;
  onRefinePrompt: (instruction: string) => Promise<void>;
  isRefining: boolean;
}

export const MasterPromptView: React.FC<MasterPromptViewProps> = ({
  promptData,
  onRefinePrompt,
  isRefining,
}) => {
  const [copied, setCopied] = useState(false);
  const [refineInstruction, setRefineInstruction] = useState("");
  const [showRefineInput, setShowRefineInput] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(promptData.masterPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineInstruction.trim() || isRefining) return;
    await onRefinePrompt(refineInstruction);
    setRefineInstruction("");
  };

  const lineCount = promptData.masterPrompt.split("\n").length;
  const wordCount = promptData.masterPrompt.trim().split(/\s+/).length;

  return (
    <div className="space-y-4">
      {/* Action Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {promptData.title}
            </h3>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 font-mono">
              <span>{lineCount} lines</span>
              <span>•</span>
              <span>~{wordCount} words</span>
              <span>•</span>
              <span>~{promptData.estimatedTokenCount} tokens</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quality Audit Score Badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold"
            title="PromptForge v2.0 Quality Score"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{promptData.qualityScore}/100 Quality</span>
          </div>

          <button
            onClick={() => setShowRefineInput(!showRefineInput)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Refine Prompt</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-md shadow-amber-500/10"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Master Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Refine Prompt Bar */}
      {showRefineInput && (
        <form
          onSubmit={handleRefineSubmit}
          className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center gap-2 animate-fadeIn"
        >
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 ml-1" />
          <input
            type="text"
            value={refineInstruction}
            onChange={(e) => setRefineInstruction(e.target.value)}
            placeholder="e.g. Add strict TypeScript enum requirements and GraphQL subscription rules..."
            className="w-full bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isRefining || !refineInstruction.trim()}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-50 transition-colors shrink-0 flex items-center gap-1"
          >
            {isRefining ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <span>Apply</span>
                <Send className="w-3 h-3" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Master Prompt Display Container */}
      <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-5 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto max-h-[600px] overflow-y-auto whitespace-pre-wrap select-text">
        <div className="absolute top-2 right-3 text-[10px] uppercase font-bold text-slate-600 tracking-wider">
          Markdown Master Prompt
        </div>
        {promptData.masterPrompt}
      </div>
    </div>
  );
};
