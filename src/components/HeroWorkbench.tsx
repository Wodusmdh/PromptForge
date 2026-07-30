import React, { useState } from "react";
import {
  Sparkles,
  Sliders,
  Terminal,
  Zap,
  Bot,
  Box,
  Database,
  Shield,
  Palette,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Layers,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { PromptForgeConfig, TargetAssistant, TemplateItem, IdeaAnalysis } from "../types";

interface HeroWorkbenchProps {
  config: PromptForgeConfig;
  onChangeConfig: (newConfig: PromptForgeConfig) => void;
  onForgePrompt: () => void;
  onSelectTemplate: (template: TemplateItem) => void;
  templates: TemplateItem[];
  isGenerating: boolean;
  isAnalyzing: boolean;
  onAnalyzeIdea: () => void;
}

export const HeroWorkbench: React.FC<HeroWorkbenchProps> = ({
  config,
  onChangeConfig,
  onForgePrompt,
  onSelectTemplate,
  templates,
  isGenerating,
  isAnalyzing,
  onAnalyzeIdea,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const targetAssistants: { id: TargetAssistant; label: string; icon: string; desc: string }[] = [
    { id: "gemini-ai-studio", label: "Gemini AI Studio", icon: "✨", desc: "Optimized for Google AI Studio & Gemini 3.6" },
    { id: "cursor-claude", label: "Cursor / Claude", icon: "⚡", desc: "Multi-file rules & system prompts for Cursor" },
    { id: "bolt-v0", label: "Bolt.new / v0", icon: "🚀", desc: "Single-file modular SPA instructions" },
    { id: "windsurf", label: "Windsurf Cascade", icon: "🏄", desc: "Cascade flow instructions & context rules" },
    { id: "generic", label: "Custom AI Coding Agent", icon: "🤖", desc: "Standard production prompt format" },
  ];

  const updateField = <K extends keyof PromptForgeConfig>(key: K, value: PromptForgeConfig[K]) => {
    onChangeConfig({ ...config, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Workbench Card */}
      <div className="relative rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden p-5 sm:p-7">
        {/* Top Decorative Ambient Light */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-extrabold text-white">Prompt Workbench</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Describe your software concept. PromptForge AI v2.0 will architect a full production spec prompt.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAnalyzeIdea}
              disabled={isAnalyzing || !config.idea.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 disabled:opacity-50 transition-colors"
              title="Use Gemini to auto-detect optimal architecture, stack, and parameters"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Smart Auto-Fill</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => updateField("idea", "")}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Text Area Input */}
        <div className="relative mb-5">
          <textarea
            value={config.idea}
            onChange={(e) => updateField("idea", e.target.value)}
            placeholder="e.g. Build a multi-tenant medical appointment booking web app with WebRTC video consultation launcher, patient triage symptom checker, encrypted PDF health records, and Stripe billing..."
            rows={5}
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 text-sm text-slate-100 placeholder:text-slate-600 transition-all font-sans leading-relaxed resize-y"
          />
          <div className="absolute bottom-3 right-3 text-[11px] text-slate-500">
            {config.idea.length} chars
          </div>
        </div>

        {/* Target AI Assistant Selector */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Target AI Coding Assistant
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {targetAssistants.map((ast) => {
              const isSelected = config.targetAssistant === ast.id;
              return (
                <button
                  key={ast.id}
                  type="button"
                  onClick={() => updateField("targetAssistant", ast.id)}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500/60 text-amber-300 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/30"
                      : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">{ast.icon}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    )}
                  </div>
                  <div className="text-xs font-bold truncate">{ast.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{ast.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggle Advanced Engine Parameters */}
        <div className="border-t border-slate-800/80 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-xs font-bold text-slate-300 hover:text-amber-400 transition-colors py-1"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>PromptForge Engine Parameters ({config.complexity} • {config.stack} • {config.dbType})</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <span className="text-[11px] font-medium">{showAdvanced ? "Collapse" : "Expand Options"}</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {/* Advanced Options Grid */}
          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 mt-2 border-t border-slate-800/50 animate-fadeIn">
              {/* Category */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={config.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none"
                >
                  <option value="SaaS">SaaS Platform</option>
                  <option value="E-Commerce">E-Commerce / Marketplace</option>
                  <option value="Healthcare">Healthcare & Medical</option>
                  <option value="FinTech">FinTech & Wealth</option>
                  <option value="AI Application">AI Application & Tools</option>
                  <option value="Dashboard">Analytics Dashboard</option>
                  <option value="Internal Tool">Internal Tool / CRM / ERP</option>
                  <option value="Developer Tool">Developer Tool</option>
                  <option value="Mobile App">Mobile Application</option>
                  <option value="Other">Other Custom System</option>
                </select>
              </div>

              {/* Complexity */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Project Complexity
                </label>
                <select
                  value={config.complexity}
                  onChange={(e) => updateField("complexity", e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none"
                >
                  <option value="Small">Small / MVP Prototype</option>
                  <option value="Medium">Medium Production App</option>
                  <option value="Large">Large Scalable System</option>
                  <option value="Enterprise">Enterprise Multi-tenant</option>
                </select>
              </div>

              {/* Stack */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Target Tech Stack
                </label>
                <select
                  value={config.stack}
                  onChange={(e) => updateField("stack", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none"
                >
                  <option value="React 19 + Express + Tailwind CSS v4">React 19 + Express + Tailwind v4</option>
                  <option value="Next.js 15 App Router + Prisma">Next.js 15 App Router + Prisma</option>
                  <option value="Python FastAPI + React">Python FastAPI + React SPA</option>
                  <option value="Flutter + Firebase Backend">Flutter + Firebase Backend</option>
                  <option value="Custom Modular Stack">Custom Modular Stack</option>
                </select>
              </div>

              {/* Architecture Style */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Architecture Pattern
                </label>
                <select
                  value={config.architectureStyle}
                  onChange={(e) => updateField("architectureStyle", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none"
                >
                  <option value="Modular Monolith">Modular Monolith (Recommended)</option>
                  <option value="Clean Architecture">Clean Architecture</option>
                  <option value="Hexagonal">Hexagonal / Ports & Adapters</option>
                  <option value="Microservices">Microservices Architecture</option>
                  <option value="Serverless">Serverless Functions</option>
                </select>
              </div>

              {/* Database Engine */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Database Choice
                </label>
                <select
                  value={config.dbType}
                  onChange={(e) => updateField("dbType", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none"
                >
                  <option value="PostgreSQL">PostgreSQL (Relational)</option>
                  <option value="Firestore">Firebase Firestore (NoSQL)</option>
                  <option value="SQLite">SQLite (Embedded)</option>
                  <option value="MongoDB">MongoDB (Document)</option>
                  <option value="Redis">Redis Key-Value Cache</option>
                </select>
              </div>

              {/* UI Style */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  UI Visual Theme
                </label>
                <select
                  value={config.uiStyle}
                  onChange={(e) => updateField("uiStyle", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none"
                >
                  <option value="Modern Minimalist">Modern Minimalist</option>
                  <option value="Dark Luxury Studio">Dark Luxury Studio</option>
                  <option value="Corporate Enterprise">Corporate Enterprise</option>
                  <option value="Fintech Clean">Fintech Clean</option>
                  <option value="Medical / Healthcare Clean">Medical Healthcare Clean</option>
                </select>
              </div>

              {/* Additional Custom Rules */}
              <div className="sm:col-span-2 md:col-span-3">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Additional Rules / Specific Constraints
                </label>
                <input
                  type="text"
                  value={config.additionalRules}
                  onChange={(e) => updateField("additionalRules", e.target.value)}
                  placeholder="e.g. Must include OAuth with Google, strict WCAG AA accessibility, and zero mock data..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Forge Action Button */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Runs all 6 PromptForge AI engines to guarantee zero requirement ambiguity.
          </p>

          <button
            type="button"
            onClick={onForgePrompt}
            disabled={isGenerating || !config.idea.trim()}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 group"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Forging Master Prompt...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
                <span>Forge Production Prompt</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Template Presets Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Quick Prebuilt Architecture Templates
          </h3>
          <span className="text-[11px] text-slate-500">Click to load blueprint</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => onSelectTemplate(tmpl)}
              className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-amber-400 rounded-md border border-slate-700">
                  {tmpl.category}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{tmpl.complexity}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                {tmpl.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {tmpl.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
