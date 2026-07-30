import React from "react";
import { X, ShieldCheck, CheckCircle2, Cpu, Sparkles, Layers, Terminal } from "lucide-react";

interface GoldenRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoldenRulesModal: React.FC<GoldenRulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const goldenRules = [
    "Rule 1: Never assume implementation details without documenting them.",
    "Rule 2: Never ignore missing requirements.",
    "Rule 3: When assumptions are required, explicitly state them.",
    "Rule 4: Prefer scalable architecture over quick solutions.",
    "Rule 5: Always think about future expansion.",
    "Rule 6: Every feature must have a clear purpose.",
    "Rule 7: Every screen must have a user goal.",
    "Rule 8: Every API must have validation.",
    "Rule 9: Every database table must have relationships.",
    "Rule 10: Every project must include security considerations.",
    "Rule 11: Every project must include testing considerations.",
    "Rule 12: Every project must include deployment planning.",
    "Rule 13: Never sacrifice maintainability for simplicity.",
    "Rule 14: Prefer modular architecture whenever possible.",
    "Rule 15: Generate prompts that are immediately usable by AI Coding Assistants.",
  ];

  const engines = [
    { title: "Requirement Engine", desc: "Classifies functional/non-functional specs, user personas, & business risks." },
    { title: "Software Architecture Engine", desc: "Determines layered structure, state management, state flow, & folder layout." },
    { title: "Database Engine", desc: "Generates entity fields, data types, PK/FK relationships, & index constraints." },
    { title: "API Engine", desc: "Defines REST/GraphQL endpoints, HTTP methods, auth rules, & request validation." },
    { title: "UI/UX & Design System Engine", desc: "Establishes color tokens, typography scales, layout rhythm, & component catalogs." },
    { title: "Security & DevOps Engine", desc: "Generates RBAC permission matrix, attack mitigations, CI/CD, & monitoring rules." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                PromptForge AI v2.0 Specification
              </h3>
              <p className="text-xs text-slate-400">System Identity, Golden Rules & Architecture Engines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Identity Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-300">System Identity</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  PromptForge AI v2.0 is a world-class AI Prompt Engineering System dedicated to transforming raw software ideas into complete, production-ready prompts for AI Coding Assistants. It internally acts as a Senior Product Manager, Software Architect, Database Architect, Security Engineer, and Prompt Engineer combined.
                </p>
              </div>
            </div>
          </div>

          {/* 15 Golden Rules */}
          <div>
            <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              The 15 Golden Rules
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {goldenRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Core Engines */}
          <div>
            <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              PromptForge v2.0 Multi-Engine Pipeline
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {engines.map((eng, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <h5 className="text-xs font-bold text-amber-300">{eng.title}</h5>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal">{eng.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
          >
            Understood & Close
          </button>
        </div>
      </div>
    </div>
  );
};
