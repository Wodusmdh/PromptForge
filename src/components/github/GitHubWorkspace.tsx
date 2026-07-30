import React, { useState } from 'react';
import { GitHubProvider } from '../../github/GitHubProvider';
import { RepositoryMetadata, GitHubDirectoryItem, GitHubFile, ChangePlan } from '../../github/types';
import { ChangePlanner } from '../../github/ChangePlanner';
import { MultiLLMOrchestrator } from '../../intelligence/orchestrator/MultiLLMOrchestrator';

export const GitHubWorkspace: React.FC = () => {
  const [token, setToken] = useState('');
  const [repoStr, setRepoStr] = useState('facebook/react');
  const [provider, setProvider] = useState<GitHubProvider | null>(null);
  
  const [repo, setRepo] = useState<RepositoryMetadata | null>(null);
  const [currentPath, setCurrentPath] = useState('');
  const [dirItems, setDirItems] = useState<GitHubDirectoryItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<GitHubFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [goal, setGoal] = useState('');
  const [changePlan, setChangePlan] = useState<ChangePlan | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const p = new GitHubProvider({ accessToken: token || undefined });
      setProvider(p);
      
      const [owner, name] = repoStr.split('/');
      if (!owner || !name) throw new Error("Invalid repo format. Use owner/name");
      
      const r = await p.getRepository(owner, name);
      setRepo(r);
      await loadDirectory(p, r, '');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDirectory = async (p: GitHubProvider, r: RepositoryMetadata, path: string) => {
    try {
      const items = await p.listDirectory(r.owner, r.name, path);
      setDirItems(items);
      setCurrentPath(path);
      setSelectedFile(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleItemClick = async (item: GitHubDirectoryItem) => {
    if (!provider || !repo) return;
    setError(null);
    if (item.type === 'dir') {
      await loadDirectory(provider, repo, item.path);
    } else {
      setLoading(true);
      try {
        const file = await provider.getFile(repo.owner, repo.name, item.path);
        setSelectedFile(file);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePlanChanges = async () => {
    if (!selectedFile || !goal) return;
    setLoading(true);
    setError(null);
    try {
      const orchestrator = new MultiLLMOrchestrator(1.0); // 1$ budget
      const planner = new ChangePlanner(orchestrator);
      const plan = await planner.planChanges(goal, [selectedFile], "plan-task-1");
      setChangePlan(plan);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0F1115] text-slate-200 h-full flex flex-col gap-4">
      <div className="bg-[#161920] border border-[#21262D] rounded-lg p-6">
        <h2 className="text-xl font-bold text-indigo-400 mb-4">GitHub Native Development</h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="password"
            placeholder="GitHub PAT (optional for public read)"
            className="flex-1 bg-[#0F1115] border border-[#21262D] rounded p-2 focus:border-indigo-500 focus:outline-none"
            value={token}
            onChange={e => setToken(e.target.value)}
          />
          <input
            type="text"
            placeholder="owner/repo"
            className="flex-1 bg-[#0F1115] border border-[#21262D] rounded p-2 focus:border-indigo-500 focus:outline-none"
            value={repoStr}
            onChange={e => setRepoStr(e.target.value)}
          />
          <button 
            onClick={handleConnect}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 font-medium rounded transition-colors disabled:opacity-50"
          >
            Connect
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-400 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {repo && (
          <div className="flex gap-2 items-center text-sm text-[#8B949E] mb-4">
            <span>Connected to: <strong>{repo.owner}/{repo.name}</strong></span>
            <span className="px-2 py-0.5 bg-[#21262D] rounded text-xs">{repo.defaultBranch}</span>
          </div>
        )}
      </div>

      {repo && (
        <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
          {/* File Explorer */}
          <div className="w-full md:w-1/3 bg-[#161920] border border-[#21262D] rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="font-semibold">Repository Explorer</h3>
              {currentPath && (
                <button 
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                  onClick={() => loadDirectory(provider!, repo, currentPath.split('/').slice(0, -1).join('/'))}
                >
                  ↑ Up
                </button>
              )}
            </div>
            <div className="text-xs text-[#8B949E] mb-2 truncate">/{currentPath}</div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-2">
              {dirItems.map(item => (
                <div 
                  key={item.path}
                  onClick={() => handleItemClick(item)}
                  className="cursor-pointer px-2 py-1.5 hover:bg-[#21262D] rounded text-sm flex items-center gap-2"
                >
                  <span className="text-[#8B949E]">
                    {item.type === 'dir' ? '📁' : '📄'}
                  </span>
                  <span className="truncate">{item.name}</span>
                </div>
              ))}
              {dirItems.length === 0 && !loading && (
                <div className="text-sm text-[#8B949E] italic">Empty directory</div>
              )}
              {loading && <div className="text-sm text-[#8B949E]">Loading...</div>}
            </div>
          </div>

          {/* File Content / Planner */}
          <div className="flex-1 bg-[#161920] border border-[#21262D] rounded-lg p-4 flex flex-col min-h-0 overflow-y-auto">
            {!selectedFile ? (
              <div className="flex-1 flex items-center justify-center text-[#8B949E]">
                Select a file to inspect
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="mb-4 shrink-0 border-b border-[#21262D] pb-4">
                  <h3 className="font-semibold text-indigo-300 mb-1">{selectedFile.path}</h3>
                  <div className="text-xs text-[#8B949E]">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.sha.substring(0, 7)}
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto bg-[#0F1115] border border-[#21262D] rounded p-4 mb-4 font-mono text-sm whitespace-pre-wrap text-slate-300">
                  {selectedFile.content || "Content not available (might be binary or too large)"}
                </div>

                <div className="shrink-0 bg-[#0F1115] border border-[#21262D] rounded p-4">
                  <h4 className="font-semibold mb-2">Change Planner</h4>
                  <textarea
                    placeholder="Describe the goal or issue..."
                    className="w-full bg-[#161920] border border-[#21262D] rounded p-2 mb-2 text-sm focus:border-indigo-500 focus:outline-none h-20"
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                  />
                  <button 
                    onClick={handlePlanChanges}
                    disabled={loading || !goal}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 font-medium rounded transition-colors disabled:opacity-50 text-sm"
                  >
                    Generate Change Plan
                  </button>
                  
                  {changePlan && (
                    <div className="mt-4 border-t border-[#21262D] pt-4 text-sm">
                      <h5 className="font-bold text-emerald-400 mb-2">Change Plan Created</h5>
                      <p className="mb-2"><strong>Goal:</strong> {changePlan.goal}</p>
                      
                      <div className="mb-2">
                        <strong className="block mb-1">Affected Files:</strong>
                        <ul className="list-disc pl-5 text-[#8B949E] space-y-1">
                          {changePlan.affectedFiles.map(f => (
                            <li key={f.path}>
                              <span className="text-slate-300">{f.path}</span>
                              <div className="text-xs mt-0.5">Reason: {f.reason}</div>
                              <div className="text-xs text-indigo-300">Plan: {f.plannedChange}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {changePlan.risks.length > 0 && (
                         <div className="mb-2">
                           <strong className="block mb-1 text-amber-400">Risks:</strong>
                           <ul className="list-disc pl-5 text-amber-200/70 text-xs">
                             {changePlan.risks.map((r, i) => <li key={i}>{r}</li>)}
                           </ul>
                         </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
