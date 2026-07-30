import React from "react";
import { usePlayground } from "../../store/PlaygroundContext";
import { AlertCircle, CheckCircle, ShieldCheck } from "lucide-react";

export function ValidationPanel() {
  const { validationResult } = usePlayground();

  if (!validationResult) return null;

  return (
    <div className="bg-[#161920] border border-[#21262D] rounded-xl p-4 sm:p-5 flex flex-col shadow-sm">
      <h3 className="text-md font-semibold text-[#F1F3F5] mb-4 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-blue-400" /> Validation
      </h3>
      <div className="space-y-3 max-h-[250px] overflow-y-auto hide-scrollbar">
        {validationResult.errors?.length > 0 ? (
          validationResult.errors.map((e: any, i: number) => (
            <div key={i} className="flex items-start gap-3 text-sm text-red-400 bg-red-500/10 p-3.5 rounded-xl border border-red-500/20">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{e.message || e}</span>
            </div>
          ))
        ) : (
          <div className="flex items-start gap-3 text-sm text-emerald-400 bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="leading-relaxed">All active rules validated successfully.</span>
          </div>
        )}
        {validationResult.warnings?.map((w: any, i: number) => (
          <div key={i} className="flex items-start gap-3 text-sm text-amber-400 bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{w}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
