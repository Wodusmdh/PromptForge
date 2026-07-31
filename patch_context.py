import sys

with open('src/playground/store/PlaygroundContext.tsx', 'r') as f:
    content = f.read()

replacement = """import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { api } from "../api/client";

export interface ExecutionHistory {
  id: string;
  idea: string;
  compiledMarkdown: string;
  timestamp: number;
}

interface PlaygroundState {
  idea: string;
  setIdea: (val: string) => void;
  compiledPrompt: any;
  setCompiledPrompt: (val: any) => void;
  sessionId: string | null;
  setSessionId: (val: string | null) => void;
  optimizationResult: any;
  setOptimizationResult: (val: any) => void;
  validationResult: any;
  setValidationResult: (val: any) => void;
  history: ExecutionHistory[];
  addToHistory: (entry: ExecutionHistory) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  isAuthInitializing: boolean;
  authError: string | null;
}

const PlaygroundContext = createContext<PlaygroundState | undefined>(undefined);

export function PlaygroundProvider({ children }: { children: ReactNode }) {
  const [idea, setIdea] = useState("");
  const [compiledPrompt, setCompiledPrompt] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [history, setHistory] = useState<ExecutionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isAuthInitializing, setIsAuthInitializing] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const initAttempted = useRef(false);

  useEffect(() => {
    if (initAttempted.current) return;
    initAttempted.current = true;

    let attempts = 0;
    const maxAttempts = 3;

    const initAuth = async () => {
      while (attempts < maxAttempts) {
        try {
          attempts++;
          await api.initSession();
          setIsAuthInitializing(false);
          setAuthError(null);
          return;
        } catch (e: any) {
          console.warn(`Auth init attempt ${attempts} failed:`, e);
          if (attempts >= maxAttempts) {
            setIsAuthInitializing(false);
            setAuthError("Failed to initialize secure session. Please refresh.\\n\\n" + (e instanceof Error ? e.message : String(e)));
            return;
          }
          await new Promise(res => setTimeout(res, 500));
        }
      }
    };

    initAuth();
  }, []);

  const addToHistory = (entry: ExecutionHistory) => {
    setHistory((prev) => [entry, ...prev]);
  };

  return (
    <PlaygroundContext.Provider
      value={{
        idea, setIdea,
        compiledPrompt, setCompiledPrompt,
        sessionId, setSessionId,
        optimizationResult, setOptimizationResult,
        validationResult, setValidationResult,
        history, addToHistory,
        isLoading, setIsLoading,
        isAuthInitializing, authError
      }}
    >
      {children}
    </PlaygroundContext.Provider>
  );
}

export function usePlayground() {
  const context = useContext(PlaygroundContext);
  if (!context) throw new Error("usePlayground must be used within PlaygroundProvider");
  return context;
}
"""

with open('src/playground/store/PlaygroundContext.tsx', 'w') as f:
    f.write(replacement)
