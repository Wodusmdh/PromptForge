import React, { useState } from "react";
import { api } from "../../api/client";
import { Search, Book, Shield } from "lucide-react";

export function RuleExplorer() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    try {
      const res = await api.searchRules(query);
      setResults(res.results || []);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-[#161920] border border-[#21262D] rounded-xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm h-full flex-1">
      <h2 className="text-lg font-semibold text-[#F1F3F5] flex items-center gap-2 shrink-0">
        <Book className="w-5 h-5 text-indigo-400" /> Rule Explorer
      </h2>
      <div className="flex gap-2 shrink-0 relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-[#8B949E] group-focus-within:text-indigo-400 transition-colors duration-200" />
        </div>
        <input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search intelligence rules..."
          className="flex-1 bg-[#1C2028] border border-[#21262D] rounded-xl py-3 sm:py-2.5 pl-10 pr-3 text-sm text-[#F1F3F5] placeholder-[#8B949E] focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 ease-out min-w-0"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>
      
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto hide-scrollbar">
        {results.map((r, i) => (
          <div key={i} className="bg-[#1C2028] p-4 rounded-xl border border-[#21262D] hover:border-[#8B949E]/30 transition-colors duration-150 ease-out group cursor-pointer">
            <h4 className="text-[15px] font-medium text-[#F1F3F5] group-hover:text-indigo-300 transition-colors">{r.title || r.id}</h4>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Score: {r.score}
              </span>
            </div>
          </div>
        ))}
        {results.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-[#8B949E] gap-3 opacity-60">
            <Shield className="w-10 h-10 stroke-[1.5]" />
            <p className="text-sm text-center">Run a search to inspect applied intelligence rules.</p>
          </div>
        )}
      </div>
    </div>
  );
}
