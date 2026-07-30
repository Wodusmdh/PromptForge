import { IExecutionContext } from "../../runtime/models/types";

export interface EngineMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  category: "Generator" | "Validator" | "Analyzer" | "Custom";
  priority: number;
  dependencies: Record<string, string>; // { "engine-id": "^1.0.0" }
  requiredRules: string[];
  optionalRules: string[];
  supportedRequestTypes: string[];
  permissions: string[]; // for Security Sandbox
}

export interface IEnginePlugin {
  metadata: EngineMetadata;
  
  initialize(): Promise<void>;
  load(): Promise<void>;
  execute(context: IExecutionContext): Promise<any>;
  validate(context: IExecutionContext, output: any): Promise<boolean>;
  unload(): Promise<void>;
}

export type EventType = "beforeExecution" | "afterExecution" | "onValidation" | "onError" | "onCompletion";

export interface IEventSystem {
  on(event: EventType, listener: (data: any) => void): void;
  emit(event: EventType, data: any): void;
}
