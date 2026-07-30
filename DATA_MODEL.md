# Data Model

## 1. Request
```typescript
interface Request {
  id: string;
  idea: string;
  targetAssistant: string;
  complexity: string;
  stack: string;
  architectureStyle: string;
  uiStyle: string;
  dbType: string;
  securityLevel: string;
  additionalRules?: string;
  timestamp: Date;
}
```

## 2. Intent
```typescript
interface Intent {
  primaryGoal: string;
  secondaryGoals: string[];
  targetAudience: string;
  businessDomain: string;
  technicalScope: string;
  assumptions: string[];
}
```

## 3. Requirement
```typescript
interface Requirement {
  id: string;
  type: "Functional" | "Non-Functional" | "Security" | "Performance";
  description: string;
  priority: "Must-Have" | "Should-Have" | "Could-Have";
  dependencies: string[]; // IDs of other requirements
}
```

## 4. Rule
```typescript
interface Rule {
  id: string;
  section: string;
  content: string;
  enforcementLevel: "Strict" | "Guideline";
}
```

## 5. Engine
```typescript
interface Engine {
  id: string;
  name: string;
  type: "Generator" | "Validator" | "Analyzer";
  dependencies: string[]; // Engine IDs required before execution
}
```

## 6. ExecutionPlan
```typescript
interface ExecutionPlan {
  id: string;
  stages: Engine[][]; // Array of parallel execution groups
  status: "Pending" | "Running" | "Completed" | "Failed";
}
```

## 7. PromptSection
```typescript
interface PromptSection {
  title: string;
  content: string;
  order: number;
  metadata?: Record<string, any>;
}
```

## 8. PromptDocument
```typescript
interface PromptDocument {
  id: string;
  title: string;
  summary: string;
  sections: PromptSection[];
  compiledMarkdown: string;
  qualityScore: number;
  estimatedTokens: number;
}
```
