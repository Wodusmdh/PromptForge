import { EngineMetadata } from "../api/types";

export class DependencyResolver {
  resolve(plugins: Map<string, EngineMetadata>): string[] {
    const sorted: string[] = [];
    const visited = new Set<string>();
    const temp = new Set<string>();

    const visit = (id: string) => {
      if (temp.has(id)) throw new Error(`Circular dependency detected: ${id}`);
      if (visited.has(id)) return;
      
      const meta = plugins.get(id);
      if (!meta) throw new Error(`Missing dependency: ${id}`);
      
      temp.add(id);
      
      for (const [depId] of Object.entries(meta.dependencies)) {
        if (!plugins.has(depId)) {
          throw new Error(`Missing dependency: ${depId} required by ${id}`);
        }
        // Basic version check could go here using semver
        visit(depId);
      }
      
      temp.delete(id);
      visited.add(id);
      sorted.push(id);
    };

    for (const id of plugins.keys()) {
      if (!visited.has(id)) {
        visit(id);
      }
    }

    return sorted;
  }
}
