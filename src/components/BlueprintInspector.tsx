import React, { useState } from "react";
import {
  ListChecks,
  Layers,
  Database,
  Zap,
  Palette,
  Shield,
  FolderTree,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Key,
  Server,
  Code,
  Layout,
  Terminal,
} from "lucide-react";
import { ForgedPromptData } from "../types";

interface BlueprintInspectorProps {
  promptData: ForgedPromptData;
}

export const BlueprintInspector: React.FC<BlueprintInspectorProps> = ({ promptData }) => {
  const [activeTab, setActiveTab] = useState<
    "requirements" | "architecture" | "database" | "api" | "design" | "security"
  >("requirements");

  const tabs = [
    { id: "requirements", label: "Requirements & Risks", icon: ListChecks },
    { id: "architecture", label: "Architecture & Tree", icon: Layers },
    { id: "database", label: "Database Schema", icon: Database },
    { id: "api", label: "API Endpoints", icon: Zap },
    { id: "design", label: "Design Tokens", icon: Palette },
    { id: "security", label: "Security & DevOps", icon: Shield },
  ] as const;

  const {
    requirementsBreakdown,
    architectureBreakdown,
    databaseBreakdown,
    apiBreakdown,
    designSystemBreakdown,
    securityBreakdown,
  } = promptData;

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
      {/* Tabs Bar */}
      <div className="flex items-center gap-1 p-2 bg-slate-950/60 border-b border-slate-800 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? "bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Container */}
      <div className="p-5 sm:p-6">
        {/* Tab 1: Requirements & Risks */}
        {activeTab === "requirements" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Functional & Non-Functional Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Functional Requirements
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {requirementsBreakdown.functional.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-sky-400" />
                  Non-Functional Requirements
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {requirementsBreakdown.nonFunctional.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0"></span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Assumptions */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                Explicit Engineering Assumptions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {requirementsBreakdown.assumptions.map((asm, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                    <span>{asm}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risks & Mitigations Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Risk Analysis & Mitigation Matrix
              </h4>
              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">Risk Factor</th>
                      <th className="p-3">Mitigation Strategy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                    {requirementsBreakdown.risksAndMitigations.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-900/50">
                        <td className="p-3 text-amber-300 font-medium">{item.risk}</td>
                        <td className="p-3 text-slate-300">{item.mitigation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Architecture & Directory Tree */}
        {activeTab === "architecture" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  Architecture Pattern
                </h4>
                <p className="text-sm font-extrabold text-white">{architectureBreakdown.architectureStyle}</p>
                
                <div className="mt-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Frontend Layer Modules
                  </span>
                  <div className="space-y-1.5">
                    {architectureBreakdown.frontendLayers.map((lyr, i) => (
                      <div key={i} className="p-2 rounded-lg bg-slate-900 text-xs text-slate-200 border border-slate-800">
                        {lyr}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  Backend Service Layers
                </h4>
                <div className="space-y-1.5">
                  {architectureBreakdown.backendLayers.map((lyr, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-900 text-xs text-slate-200 border border-slate-800">
                      {lyr}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Folder Structure */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-amber-400" />
                Recommended Production Directory Tree
              </h4>
              <pre className="p-4 rounded-lg bg-slate-900 font-mono text-xs text-amber-300/90 overflow-x-auto leading-relaxed border border-slate-800">
                {architectureBreakdown.folderStructure}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Database Schema */}
        {activeTab === "database" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                Database Engine: <span className="text-amber-400">{databaseBreakdown.databaseType}</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">
                {databaseBreakdown.entities.length} Normalized Entities
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {databaseBreakdown.entities.map((ent, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-bold text-amber-300 font-mono">{ent.name}</h5>
                    <span className="px-2 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded-md">Entity</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">{ent.purpose}</p>

                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Columns / Fields</div>
                    <div className="flex flex-wrap gap-1.5">
                      {ent.fields.map((f, i) => (
                        <span key={i} className="px-2 py-1 text-[11px] font-mono rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {f}
                        </span>
                      ))}
                    </div>

                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-3">Relationships</div>
                    <ul className="text-xs text-slate-400 space-y-1">
                      {ent.relationships.map((rel, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-[11px]">
                          <span className="w-1 h-1 rounded-full bg-amber-400"></span>
                          <span>{rel}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: API Endpoints */}
        {activeTab === "api" && (
          <div className="space-y-4 animate-fadeIn">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              REST API Endpoint Specifications
            </h4>

            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Method</th>
                    <th className="p-3">Endpoint Route</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Auth Required</th>
                    <th className="p-3">Validation Rules</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {apiBreakdown.map((ep, i) => (
                    <tr key={i} className="hover:bg-slate-900/50">
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                            ep.method === "GET"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : ep.method === "POST"
                              ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                              : ep.method === "PUT"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {ep.method}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-200 font-semibold">{ep.endpoint}</td>
                      <td className="p-3 text-slate-300">{ep.purpose}</td>
                      <td className="p-3">
                        {ep.authRequired ? (
                          <span className="flex items-center gap-1 text-amber-400 text-[11px] font-bold">
                            <Lock className="w-3 h-3" /> Yes
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Public</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400 font-mono text-[11px]">{ep.validation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Design System */}
        {activeTab === "design" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Visual Personality & Theme
                </h4>
                <p className="text-sm font-extrabold text-white mt-0.5">{designSystemBreakdown.visualTheme}</p>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Fonts: <span className="text-amber-300">{designSystemBreakdown.typographyPairing}</span>
              </div>
            </div>

            {/* Color Palette Swatches */}
            <div>
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Color Tokens</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {Object.entries(designSystemBreakdown.colorPalette).map(([key, hex]) => (
                  <div key={key} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <div
                      className="w-full h-10 rounded-lg mb-2 border border-slate-700/50 shadow-inner"
                      style={{ backgroundColor: hex }}
                    ></div>
                    <div className="text-[11px] font-bold capitalize text-slate-200">{key}</div>
                    <div className="text-[10px] font-mono text-slate-400">{hex}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Component Catalog */}
            <div>
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reusable Component Catalog</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {designSystemBreakdown.keyComponents.map((comp, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-center gap-2">
                    <Layout className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{comp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Security & DevOps */}
        {activeTab === "security" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Auth Strategy */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  Authentication Strategy
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">{securityBreakdown.authenticationStrategy}</p>
              </div>

              {/* Roles & RBAC */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  Role-Based Access Control (RBAC)
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {securityBreakdown.rolesAndPermissions.map((role, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                      <span>{role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Security Controls */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                Active Security & Attack Mitigation Controls
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {securityBreakdown.securityControls.map((ctrl, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{ctrl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
