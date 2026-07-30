export type TargetAssistant =
  | "gemini-ai-studio"
  | "cursor-claude"
  | "bolt-v0"
  | "windsurf"
  | "generic";

export interface TemplateItem {
  id: string;
  title: string;
  category: string;
  description: string;
  complexity: string;
  stack: string;
  architectureStyle: string;
  uiStyle: string;
  dbType: string;
  securityLevel: string;
  idea: string;
}

export interface PromptForgeConfig {
  idea: string;
  targetAssistant: TargetAssistant;
  complexity: "Small" | "Medium" | "Large" | "Enterprise";
  category: string;
  stack: string;
  architectureStyle: string;
  uiStyle: string;
  dbType: string;
  securityLevel: string;
  additionalRules: string;
}

export interface IdeaAnalysis {
  category: string;
  complexity: string;
  recommendedStack: string;
  architectureStyle: string;
  uiStyle: string;
  dbType: string;
  securityLevel: string;
  keyFeatures: string[];
  targetUserPersonas: string[];
  assumptions: string[];
}

export interface RiskAndMitigation {
  risk: string;
  mitigation: string;
}

export interface EntityField {
  name: string;
  purpose: string;
  fields: string[];
  relationships: string[];
}

export interface ApiEndpointSpec {
  endpoint: string;
  method: string;
  purpose: string;
  authRequired: boolean;
  validation: string;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
}

export interface ForgedPromptData {
  title: string;
  summary: string;
  masterPrompt: string;
  qualityScore: number;
  estimatedTokenCount: number;
  requirementsBreakdown: {
    functional: string[];
    nonFunctional: string[];
    assumptions: string[];
    risksAndMitigations: RiskAndMitigation[];
  };
  architectureBreakdown: {
    architectureStyle: string;
    frontendLayers: string[];
    backendLayers: string[];
    folderStructure: string;
  };
  databaseBreakdown: {
    databaseType: string;
    entities: EntityField[];
  };
  apiBreakdown: ApiEndpointSpec[];
  designSystemBreakdown: {
    visualTheme: string;
    colorPalette: ColorPalette;
    typographyPairing: string;
    keyComponents: string[];
  };
  securityBreakdown: {
    authenticationStrategy: string;
    rolesAndPermissions: string[];
    securityControls: string[];
  };
}

export interface SavedPrompt {
  id: string;
  createdAt: string;
  title: string;
  summary: string;
  config: PromptForgeConfig;
  promptData: ForgedPromptData;
}
