import React, { useState } from "react";
import { PlaygroundProvider } from "./store/PlaygroundContext";
import { PromptEditor } from "./components/editor/PromptEditor";
import { LivePreview } from "./components/preview/LivePreview";
import { EngineInspector } from "./components/preview/EngineInspector";
import { ValidationPanel } from "./components/preview/ValidationPanel";
import { BenchmarkView } from "./components/preview/BenchmarkView";
import { RuleExplorer } from "./components/rules/RuleExplorer";
import { HistoryPanel } from "./components/history/HistoryPanel";
import { ModelOrchestratorPanel } from "../components/ModelOrchestratorPanel";
import { Menu, X, Hammer, BookOpen, Clock, Settings, PanelRightClose, PanelRightOpen, Terminal, Network } from "lucide-react";

export function Playground() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'rules' | 'history' | 'orchestrator'>('editor');
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  return (
    <PlaygroundProvider>
      <div className="h-screen flex flex-col md:flex-row bg-[#0F1115] text-slate-200 font-sans overflow-hidden">
        
        {/* Mobile Top Navigation */}
        <div className="md:hidden flex items-center justify-between p-4 bg-[#161920] border-b border-[#21262D] shrink-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Hammer className="w-4 h-4" />
            </div>
            <span className="font-bold text-white tracking-tight">PromptForge</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-400 hover:text-white transition-colors">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-black/60 z-20 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Sidebar (Drawer on Mobile, Fixed on Desktop) */}
        <div className={`
          fixed md:static inset-y-0 left-0 z-30
          w-64 md:w-20 lg:w-64 flex flex-col bg-[#161920] border-r border-[#21262D]
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* Desktop Logo */}
          <div className="hidden md:flex h-14 items-center justify-center lg:justify-start lg:px-6 border-b border-[#21262D] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Hammer className="w-4 h-4" />
              </div>
              <span className="font-bold text-white tracking-tight hidden lg:block">PromptForge</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-4 px-4 md:px-2 lg:px-4 flex flex-col gap-2 overflow-y-auto hide-scrollbar">
            <NavItem 
              icon={<Terminal />} 
              label="Editor" 
              active={activeTab === 'editor'} 
              onClick={() => { setActiveTab('editor'); setMobileMenuOpen(false); }} 
            />
            <NavItem 
              icon={<BookOpen />} 
              label="Rules" 
              active={activeTab === 'rules'} 
              onClick={() => { setActiveTab('rules'); setMobileMenuOpen(false); }} 
            />
            <NavItem 
              icon={<Clock />} 
              label="History" 
              active={activeTab === 'history'} 
              onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }} 
            />
            <NavItem 
              icon={<Network />} 
              label="Orchestrator" 
              active={activeTab === 'orchestrator'} 
              onClick={() => { setActiveTab('orchestrator'); setMobileMenuOpen(false); }} 
            />
          </nav>
          
          <div className="p-4 md:px-2 lg:px-4 border-t border-[#21262D]">
            <NavItem icon={<Settings />} label="Settings" onClick={() => {}} />
          </div>
        </div>

        {/* Main Content Area - Scrollable on mobile, fixed on desktop */}
        <div className="flex-1 min-w-0 overflow-y-auto lg:overflow-hidden relative flex flex-col bg-[#0F1115]">
          
          <div className="flex flex-col lg:flex-row lg:h-full">
            {/* Center/Left Pane: Editor or Active Tab */}
            <div className="flex-1 flex flex-col min-w-0 lg:overflow-y-auto hide-scrollbar bg-[#0F1115]">
              <div className="h-14 hidden lg:flex items-center px-6 border-b border-[#21262D] shrink-0 sticky top-0 bg-[#0F1115] z-10">
                <h2 className="text-sm font-medium text-[#8B949E]">Workspace / <span className="text-[#F1F3F5] capitalize">{activeTab}</span></h2>
              </div>
              <div className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col max-w-4xl mx-auto w-full">
                <div className={`${activeTab === 'editor' ? 'flex flex-col flex-1' : 'hidden'}`}>
                  <PromptEditor />
                </div>
                <div className={`${activeTab === 'rules' ? 'flex flex-col flex-1' : 'hidden'}`}>
                  <RuleExplorer />
                </div>
                <div className={`${activeTab === 'history' ? 'flex flex-col flex-1' : 'hidden'}`}>
                  <HistoryPanel />
                </div>
                <div className={`${activeTab === 'orchestrator' ? 'flex flex-col flex-1' : 'hidden'}`}>
                  <ModelOrchestratorPanel />
                </div>
              </div>
            </div>

            {/* Right Pane: Preview & Inspector (Collapsible on Desktop) */}
            <div className={`
              flex flex-col border-t lg:border-t-0 lg:border-l border-[#21262D] bg-[#161920] shrink-0
              transition-all duration-300 ease-in-out
              ${rightPanelOpen ? 'lg:w-[450px] xl:w-[500px]' : 'lg:w-0 lg:border-l-0 overflow-hidden'}
            `}>
              {/* Desktop Header for Right Panel */}
              <div className="h-14 hidden lg:flex items-center justify-between px-4 border-b border-[#21262D] shrink-0 sticky top-0 bg-[#161920] z-10">
                <span className="text-sm font-medium text-[#F1F3F5]">Execution & Output</span>
                <button 
                  onClick={() => setRightPanelOpen(false)}
                  className="p-1.5 text-[#8B949E] hover:text-[#F1F3F5] rounded-md hover:bg-[#1C2028] transition-colors"
                  title="Close Panel"
                >
                  <PanelRightClose className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 lg:overflow-y-auto hide-scrollbar p-4 md:p-6 lg:p-6 flex flex-col gap-6">
                <LivePreview />
                <EngineInspector />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <ValidationPanel />
                  <BenchmarkView />
                </div>
              </div>
            </div>
          </div>

          {/* Floating toggle for right panel when closed */}
          {!rightPanelOpen && (
            <button
              onClick={() => setRightPanelOpen(true)}
              className="hidden lg:flex absolute top-3 right-4 p-2 bg-[#1C2028] border border-[#21262D] text-[#8B949E] hover:text-[#F1F3F5] rounded-lg shadow-lg hover:shadow-indigo-500/10 transition-all z-10"
              title="Open Inspector"
            >
              <PanelRightOpen className="w-4 h-4" />
            </button>
          )}

        </div>
      </div>
    </PlaygroundProvider>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`
        flex items-center gap-3 p-3 md:p-3 lg:p-3 rounded-xl transition-all duration-200 group
        ${active 
          ? 'bg-indigo-500/10 text-indigo-400' 
          : 'text-[#8B949E] hover:bg-[#1C2028] hover:text-[#F1F3F5]'
        }
      `}
    >
      <div className={`
        flex items-center justify-center shrink-0 transition-transform duration-200
        ${active ? 'text-indigo-400 scale-110' : 'text-[#8B949E] group-hover:text-slate-300'}
      `}>
        {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
      </div>
      <span className={`font-medium text-sm md:hidden lg:block ${active ? 'text-indigo-400' : ''}`}>{label}</span>
    </button>
  );
}
