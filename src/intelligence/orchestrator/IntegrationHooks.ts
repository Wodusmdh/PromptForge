import { RoutingDecision, OrchestrationRun } from "../types";

export interface OrchestratorPlugin {
  id: string;
  onBeforeRoute?: (task: any) => Promise<any>;
  onAfterRoute?: (decision: RoutingDecision) => Promise<RoutingDecision>;
  onBeforeExecute?: (run: OrchestrationRun, prompt: string) => Promise<string>;
  onAfterExecute?: (run: OrchestrationRun, result: string) => Promise<string>;
}

export interface MCPContextHook {
  fetchContext: (resourceUris: string[]) => Promise<string[]>;
  executeTool: (toolName: string, args: any) => Promise<any>;
}

export class IntegrationHooks {
  private plugins: OrchestratorPlugin[] = [];
  private mcpHook?: MCPContextHook;

  registerPlugin(plugin: OrchestratorPlugin) {
    this.plugins.push(plugin);
  }

  setMCPHook(hook: MCPContextHook) {
    this.mcpHook = hook;
  }

  async runBeforeRoute(task: any) {
    let result = task;
    for (const p of this.plugins) {
      if (p.onBeforeRoute) result = await p.onBeforeRoute(result);
    }
    return result;
  }

  async fetchMCPContext(uris: string[]) {
    if (this.mcpHook) return await this.mcpHook.fetchContext(uris);
    return [];
  }
}

export const globalHooks = new IntegrationHooks();
