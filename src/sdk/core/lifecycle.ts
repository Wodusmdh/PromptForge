import { IEnginePlugin, IEventSystem } from "../api/types";
import { IExecutionContext } from "../../runtime/models/types";
import { ISandbox } from "../security/sandbox";

export class EngineLifecycleManager {
  constructor(
    private eventSystem: IEventSystem,
    private sandbox: ISandbox
  ) {}

  async runLifecycle(plugin: IEnginePlugin, context: IExecutionContext): Promise<any> {
    try {
      await plugin.initialize();
      await plugin.load();

      this.eventSystem.emit("beforeExecution", { pluginId: plugin.metadata.id, context });
      
      const result = await this.sandbox.execute(
        () => plugin.execute(context), 
        plugin.metadata.permissions
      );
      
      this.eventSystem.emit("afterExecution", { pluginId: plugin.metadata.id, result });
      
      const isValid = await plugin.validate(context, result);
      this.eventSystem.emit("onValidation", { pluginId: plugin.metadata.id, isValid });
      
      if (!isValid) {
        throw new Error(`Plugin validation failed: ${plugin.metadata.id}`);
      }

      await plugin.unload();
      this.eventSystem.emit("onCompletion", { pluginId: plugin.metadata.id });
      
      return result;
    } catch (error) {
      this.eventSystem.emit("onError", { pluginId: plugin.metadata.id, error });
      throw error;
    }
  }
}
