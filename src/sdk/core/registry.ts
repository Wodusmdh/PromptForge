import { IEnginePlugin, EngineMetadata } from "../api/types";
import { DependencyResolver } from "./resolver";

export class PluginRegistry {
  private plugins: Map<string, IEnginePlugin> = new Map();
  private metadata: Map<string, EngineMetadata> = new Map();
  private enabled: Set<string> = new Set();
  
  constructor(private resolver: DependencyResolver) {}

  register(plugin: IEnginePlugin): void {
    if (this.plugins.has(plugin.metadata.id)) {
      throw new Error(`Plugin ${plugin.metadata.id} is already registered`);
    }
    this.plugins.set(plugin.metadata.id, plugin);
    this.metadata.set(plugin.metadata.id, plugin.metadata);
    this.enabled.add(plugin.metadata.id);
  }

  getPlugin(id: string): IEnginePlugin | undefined {
    return this.plugins.get(id);
  }

  getAllPlugins(): IEnginePlugin[] {
    return Array.from(this.plugins.values());
  }

  enable(id: string): void {
    if (this.plugins.has(id)) this.enabled.add(id);
  }

  disable(id: string): void {
    this.enabled.delete(id);
  }

  getEnabledOrdered(): IEnginePlugin[] {
    const enabledMeta = new Map<string, EngineMetadata>();
    for (const id of this.enabled) {
      enabledMeta.set(id, this.metadata.get(id)!);
    }
    const order = this.resolver.resolve(enabledMeta);
    return order.map(id => this.plugins.get(id)!);
  }
}
