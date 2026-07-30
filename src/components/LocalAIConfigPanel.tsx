import React, { useState, useEffect } from 'react';
import { LocalAIProvider } from '../intelligence/providers/LocalAIProvider';
import { globalModelRegistry } from '../intelligence/registry/ModelRegistry';
import { ModelDefinition } from '../intelligence/types';
import { CheckCircle, XCircle, RefreshCw, Server } from 'lucide-react';

export const LocalAIConfigPanel: React.FC = () => {
  const [endpoint, setEndpoint] = useState('http://localhost:11434/v1');
  const [status, setStatus] = useState<"CONNECTED" | "DISCONNECTED" | "AUTHENTICATION_REQUIRED" | "TIMEOUT" | "CHECKING">("DISCONNECTED");
  const [models, setModels] = useState<ModelDefinition[]>([]);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    setStatus("CHECKING");
    setError(null);
    try {
      const provider = new LocalAIProvider({ endpoint });
      const currentStatus = await provider.checkHealth();
      setStatus(currentStatus);
      
      if (currentStatus === "CONNECTED") {
        const availableModels = await provider.getAvailableModels();
        setModels(availableModels);
        
        // Register them automatically to the global registry so the orchestrator can use them
        availableModels.forEach(m => globalModelRegistry.registerModel(m));
      } else {
        setModels([]);
      }
    } catch (e: any) {
      setStatus("DISCONNECTED");
      setError(e.message);
    }
  };

  useEffect(() => {
    // Optionally auto-check on mount
    // checkConnection();
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 my-6 text-slate-200">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-4">
        <Server className="w-6 h-6 text-indigo-400" />
        <h2 className="text-xl font-bold text-indigo-400">Local AI Runtime</h2>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
        <div className="flex-1 w-full">
          <label className="block text-sm font-semibold mb-2 text-slate-400">OpenAI-Compatible Endpoint URL</label>
          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="http://localhost:11434/v1 (Ollama) or http://localhost:1234/v1 (LM Studio)"
            className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <button
          onClick={checkConnection}
          disabled={status === "CHECKING" || !endpoint}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded transition-colors disabled:opacity-50 flex items-center gap-2 h-[42px]"
        >
          {status === "CHECKING" ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Connect"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Connection Status</h3>
          <div className="flex items-center gap-3">
            {status === "CONNECTED" && <CheckCircle className="w-6 h-6 text-emerald-500" />}
            {status === "DISCONNECTED" && <XCircle className="w-6 h-6 text-red-500" />}
            {status === "TIMEOUT" && <XCircle className="w-6 h-6 text-amber-500" />}
            {status === "AUTHENTICATION_REQUIRED" && <XCircle className="w-6 h-6 text-amber-500" />}
            {status === "CHECKING" && <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />}
            
            <span className={`font-medium ${
              status === "CONNECTED" ? "text-emerald-400" : 
              status === "CHECKING" ? "text-indigo-400" : 
              "text-red-400"
            }`}>
              {status.replace(/_/g, ' ')}
            </span>
          </div>
          {error && <p className="text-red-400 text-xs mt-2 mt-2">{error}</p>}
          <p className="text-slate-500 text-xs mt-3">
            Supports Ollama (requires OLLAMA_ORIGINS="*"), LM Studio, and generic local vLLM/OpenAI servers.
          </p>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
           <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Discovered Models</h3>
           
           {models.length > 0 ? (
             <div className="max-h-[120px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
               {models.map(m => (
                 <div key={m.id} className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded text-sm">
                   <span className="font-mono text-indigo-300 truncate" title={m.displayName}>{m.displayName}</span>
                   <span className="text-xs px-2 py-0.5 bg-indigo-900/50 text-indigo-400 rounded shrink-0">
                     LOCAL
                   </span>
                 </div>
               ))}
             </div>
           ) : (
             <div className="h-full flex items-center justify-center text-slate-500 text-sm italic min-h-[60px]">
               {status === "CONNECTED" ? "No models found." : "Not connected."}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
