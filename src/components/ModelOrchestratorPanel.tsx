import React, { useState } from 'react';
import { MultiLLMOrchestrator } from '../intelligence/orchestrator/MultiLLMOrchestrator';
import { RoutingStrategy, OrchestrationRun, ModelDefinition } from '../intelligence/types';
import { globalModelRegistry } from '../intelligence/registry/ModelRegistry';

export const ModelOrchestratorPanel: React.FC = () => {
  const [prompt, setPrompt] = useState('Analyze the architecture of a real-time collaborative editor.');
  const [strategy, setStrategy] = useState<RoutingStrategy>('balanced');
  const [run, setRun] = useState<OrchestrationRun | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    // Initialize orchestrator with a strict budget
    const orchestrator = new MultiLLMOrchestrator(0.5); 
    const result = await orchestrator.runOrchestration(
      'task-1', 
      prompt, 
      strategy, 
      { taskType: 'architecture', minReasoningCapability: 7 }
    );
    setRun(result);
    setIsRunning(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 my-6 text-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-amber-400">PromptForge Orchestrator</h2>
        {run && (
          <span className={`px-3 py-1 rounded text-sm font-semibold ${run.state === 'COMPLETED' ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-900 text-amber-300'}`}>
            {run.state}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Strategy</label>
          <select 
            value={strategy}
            onChange={(e) => setStrategy(e.target.value as RoutingStrategy)}
            className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-slate-200"
          >
            <option value="balanced">Balanced</option>
            <option value="cheapest">Cheapest</option>
            <option value="fastest">Fastest</option>
            <option value="quality">Highest Quality</option>
            <option value="ensemble">Ensemble (Multi-Model Synthesis)</option>
            <option value="manual">Manual Selection</option>
          </select>
        </div>
        <div>
           <label className="block text-sm font-semibold mb-2">Task</label>
           <input 
             type="text" 
             value={prompt} 
             onChange={e => setPrompt(e.target.value)}
             className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-slate-200"
           />
        </div>
      </div>

      <button 
        onClick={handleRun}
        disabled={isRunning}
        className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded transition-colors mb-6 disabled:opacity-50"
      >
        {isRunning ? 'Executing...' : 'Run Orchestration'}
      </button>

      {run && run.decision && (
        <div className="bg-slate-800 rounded p-4 border border-slate-700">
          <h3 className="text-lg font-bold mb-3 border-b border-slate-600 pb-2">Execution Details</h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-slate-400">Selected Models:</p>
              <ul className="list-disc pl-5 mt-1 text-emerald-300">
                <li>{run.decision.primaryModel.displayName} (Primary)</li>
                {run.decision.secondaryModel && <li>{run.decision.secondaryModel.displayName} (Secondary)</li>}
                {run.decision.synthesisModel && <li>{run.decision.synthesisModel.displayName} (Synthesis)</li>}
              </ul>
            </div>
            <div>
              <p className="text-slate-400">Router Reasoning:</p>
              <p className="mt-1">{run.decision.reasoning}</p>
            </div>
            <div>
               <p className="text-slate-400">Budget Consumed:</p>
               <p className="mt-1 font-mono">${run.budgetConsumed.toFixed(5)} / ${run.maxBudget.toFixed(2)}</p>
            </div>
            <div>
               <p className="text-slate-400">Time:</p>
               <p className="mt-1 font-mono">{new Date(run.updatedAt).getTime() - new Date(run.createdAt).getTime()} ms</p>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-bold text-slate-300 mb-2">Output Synthesis:</h4>
            <div className="bg-slate-900 p-3 rounded font-mono text-sm text-slate-300 border border-slate-700">
               {run.result || 'No output produced.'}
            </div>
          </div>
          
          {run.warnings.length > 0 && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded">
              <h4 className="font-bold text-red-400 mb-2">Warnings:</h4>
              <ul className="list-disc pl-5 text-red-300 text-sm">
                {run.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
