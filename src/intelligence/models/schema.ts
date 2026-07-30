export interface RuleRecord {
  id: string;
  version: string;
  title: string;
  part: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  description: string;
  dependencies: string[];
  conflicts: string[];
  tags: string[];
  requiredEngines: string[];
  requestTypes: string[];
  examples: string[];
  deprecated?: boolean;
  replacedBy?: string;
}

export interface RuleSelectionContext {
  requestType: string;
  tags: string[];
  engines: string[];
  language?: string;
  techStack?: string[];
}

export interface SelectionResult {
  mandatory: SelectedRule[];
  optional: SelectedRule[];
  ignored: SelectedRule[];
}

export interface SelectedRule {
  rule: RuleRecord;
  reason: string;
}
