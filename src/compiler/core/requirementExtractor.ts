import { RequestContext, IntentGraph, RequirementGraph, ReqNode } from "../models/domain";
import { randomUUID } from "crypto";

export interface IRequirementExtractor {
  extract(context: RequestContext, intent: IntentGraph): Promise<RequirementGraph>;
}

export class RequirementExtractor implements IRequirementExtractor {
  async extract(context: RequestContext, intent: IntentGraph): Promise<RequirementGraph> {
    const nodes: ReqNode[] = [];
    const edges: { from: string; to: string }[] = [];

    const isCoding = intent.primary?.intent === "Coding";

    // Extract explicit requirements
    context.explicitRequirements.forEach(req => {
      // In explicitRequirements, "Rules: " contains additional user rules.
      if (req.startsWith("Rules: ")) {
        const rulesStr = req.substring(7);
        const rulesList = rulesStr.split('\n').map(r => r.replace(/^- /, '').trim()).filter(r => r);
        
        rulesList.forEach(rule => {
          nodes.push({
            id: randomUUID(),
            type: "functional",
            description: rule,
            priority: "high",
            dependencies: [],
            category: "Explicit",
            confidence: 100,
            source: "User Rules"
          });
        });
      } else {
        nodes.push({
          id: randomUUID(),
          type: "functional",
          description: req,
          priority: "high",
          dependencies: [],
          category: "Explicit",
          confidence: 100,
          source: "Explicit Parameter"
        });
      }
    });

    // Handle implicit requirements
    // For example, if it's "Education" or mentions "beginner", add implicit rule "Avoid jargon"
    const text = context.normalizedText;
    if (text.includes("beginner") || intent.primary?.intent === "Education") {
      nodes.push({
        id: randomUUID(),
        type: "non-functional",
        description: "Avoid jargon and explain terminology",
        priority: "medium",
        dependencies: [],
        category: "Implicit",
        confidence: 85,
        source: "Inferred from audience"
      });
      nodes.push({
        id: randomUUID(),
        type: "non-functional",
        description: "Provide simple examples",
        priority: "medium",
        dependencies: [],
        category: "Implicit",
        confidence: 80,
        source: "Inferred from audience"
      });
    }

    // Process hardcoded implicit requirements and filter them
    context.implicitRequirements.forEach(req => {
      let category: "Rejected" | "Implicit" | "Optional" = "Rejected";
      let confidence = 0;
      let reason = "No supporting evidence";

      if (req === "Must adhere to standard coding conventions" || req === "Requires appropriate error handling") {
        if (isCoding) {
          category = "Implicit";
          confidence = 90;
          reason = "Standard coding practice";
        } else {
          category = "Rejected";
          confidence = 10;
          reason = "Not a coding task";
        }
      } else if (req === "Requires audit logging" || req === "Requires strict RBAC") {
        if (isCoding && context.explicitRequirements.some(r => r.includes("Enterprise") || r.includes("High"))) {
          category = "Implicit";
          confidence = 95;
          reason = "Inferred from security level";
        } else {
          category = "Rejected";
          confidence = 5;
          reason = "Not an enterprise/high security coding task";
        }
      }

      nodes.push({
        id: randomUUID(),
        type: "non-functional",
        description: req,
        priority: category === "Rejected" ? "low" : "medium",
        dependencies: [],
        category: category,
        confidence: confidence,
        source: reason
      });
    });

    // Also add assumptions and filter them
    const assumption = "Standard internet connectivity is available";
    nodes.push({
      id: randomUUID(),
      type: "assumption",
      description: assumption,
      priority: "low",
      dependencies: [],
      category: isCoding ? "Implicit" : "Rejected",
      confidence: isCoding ? 75 : 10,
      source: isCoding ? "General assumption for web apps" : "Irrelevant for non-coding"
    });

    // Optional enhancements
    if (intent.primary?.intent === "Coding") {
      nodes.push({
        id: randomUUID(),
        type: "non-functional",
        description: "Consider adding unit tests",
        priority: "low",
        dependencies: [],
        category: "Optional",
        confidence: 60,
        source: "Best practice suggestion"
      });
    } else if (intent.primary?.intent === "Writing") {
      nodes.push({
        id: randomUUID(),
        type: "non-functional",
        description: "Consider adding character development notes",
        priority: "low",
        dependencies: [],
        category: "Optional",
        confidence: 50,
        source: "Writing enhancement suggestion"
      });
    }

    // Only keep accepted requirements in edges? Actually, the prompt says "Every extracted requirement must belong to ONE of four categories."
    // and "Before adding any requirement: Ask: 'Can this requirement be directly justified from user input?' If NO Reject it."
    
    // We should probably NOT include Rejected in the final prompt. Let's make sure promptAssembler filters them, or we just keep them here for traceability.
    // The instructions say "Each extracted requirement should include: Requirement, Category, Confidence, Source"
    // and "Every accepted requirement should be traceable."

    // Tie dependencies
    const validNodes = nodes.filter(n => n.category !== "Rejected");
    const primaryNode = validNodes[0];
    if (primaryNode) {
      for (let i = 1; i < validNodes.length; i++) {
        edges.push({ from: validNodes[i].id, to: primaryNode.id });
      }
    }

    return { nodes, edges };
  }
}
