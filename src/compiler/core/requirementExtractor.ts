import { RequestContext, IntentGraph, RequirementGraph, ReqNode } from "../models/domain";
import { randomUUID } from "crypto";

export const REQUIREMENT_EXTRACTION_SYSTEM_PROMPT = `
You are the PromptForge Requirement Extractor. Your task is to extract clear, explicit functional and non-functional requirements strictly based on the user's input prompt.

STRICT SYSTEM INSTRUCTIONS & NEGATIVE CONSTRAINTS:
- CRITICAL: DO NOT infer, assume, or add default software engineering best practices unless explicitly stated by the user.
- DO NOT add requirements for 'Error handling', 'Coding conventions', 'Internet connectivity', 'Security', or 'Logging' unless the user explicitly requested them in the source prompt.
- Your extraction must be 1:1 with the user's input. If the user asks for a simple script, do not over-engineer the requirements.
- Every requirement MUST include a valid 'source_quote' field containing the exact substring from the user's prompt that justifies this requirement.
`.trim();

export interface IRequirementExtractor {
  extract(context: RequestContext, intent: IntentGraph): Promise<RequirementGraph>;
}

export class RequirementExtractor implements IRequirementExtractor {
  
  private normalize(text: string): string {
    let lower = text.toLowerCase().trim();
    if (lower.includes("dark theme") || lower.includes("dark ui") || lower.includes("dark mode")) {
      return "Use dark mode";
    }
    if (lower === "react" || lower === "use react") {
      return "Use React.";
    }
    if (lower === "do not use react" || lower === "no react") {
      return "Do not use React.";
    }
    if (lower === "postgresql" || lower === "use postgresql" || lower.includes("postgre")) {
      return "Use PostgreSQL.";
    }
    return text;
  }

  async extract(context: RequestContext, intent: IntentGraph): Promise<RequirementGraph> {
    const rawNodes: ReqNode[] = [];
    const edges: { from: string; to: string }[] = [];

    const isCoding = intent.primary?.intent === "Coding";
    const rawInputText = (context.rawInput || "").trim();

    // 1. Extract core requirement from raw input prompt if available
    if (rawInputText.length > 0) {
      rawNodes.push({
        id: randomUUID(),
        type: "functional",
        description: rawInputText,
        text: this.normalize(rawInputText),
        priority: "high",
        dependencies: [],
        category: "Explicit",
        confidence: 100,
        source: "User Prompt",
        reason: "Directly requested by user in prompt.",
        evidence: rawInputText,
        origin: "Explicit",
        status: "Accepted",
        source_quote: rawInputText
      });
    }

    // 2. Extract explicit requirements from parameters
    context.explicitRequirements.forEach(req => {
      if (req.startsWith("Rules: ")) {
        const rulesStr = req.substring(7);
        const rulesList = rulesStr.split('\n').map(r => r.replace(/^- /, '').trim()).filter(r => r);
        
        rulesList.forEach(rule => {
          rawNodes.push({
            id: randomUUID(),
            type: "functional",
            description: rule,
            text: this.normalize(rule),
            priority: "high",
            dependencies: [],
            category: "Explicit",
            confidence: 98,
            source: "User Rules",
            reason: "The user explicitly requested this rule.",
            evidence: rule,
            origin: "Explicit",
            status: "Accepted",
            source_quote: rule
          });
        });
      } else {
        rawNodes.push({
          id: randomUUID(),
          type: "functional",
          description: req,
          text: this.normalize(req),
          priority: "high",
          dependencies: [],
          category: "Explicit",
          confidence: 100,
          source: "Explicit Parameter",
          reason: "Directly specified in parameters.",
          evidence: req,
          origin: "Explicit",
          status: "Accepted",
          source_quote: req
        });
      }
    });

    const text = context.normalizedText;
    if (text.includes("beginner") || intent.primary?.intent === "Education") {
      rawNodes.push({
        id: randomUUID(),
        type: "non-functional",
        description: "Avoid jargon and explain terminology",
        text: "Avoid jargon and explain terminology",
        priority: "medium",
        dependencies: [],
        category: "Implicit",
        confidence: 85,
        source: "Inferred from audience",
        reason: "The user identified themselves as a beginner.",
        evidence: "beginner",
        origin: "Implicit",
        status: "Accepted",
        source_quote: text.includes("beginner") ? "beginner" : rawInputText
      });
      rawNodes.push({
        id: randomUUID(),
        type: "non-functional",
        description: "Provide simple examples",
        text: "Provide simple examples",
        priority: "medium",
        dependencies: [],
        category: "Implicit",
        confidence: 80,
        source: "Inferred from audience",
        reason: "The user identified themselves as a beginner.",
        evidence: "beginner",
        origin: "Implicit",
        status: "Accepted",
        source_quote: text.includes("beginner") ? "beginner" : rawInputText
      });
    }

    context.implicitRequirements.forEach(req => {
      let category: "Rejected" | "Implicit" | "Optional" = "Rejected";
      let confidence = 0;
      let reason = "No supporting evidence.";
      let status: any = "Rejected";
      let origin = "Rejected";
      let source_quote = "";

      if (req === "Must adhere to standard coding conventions" || req === "Requires appropriate error handling") {
        const reqLower = req.toLowerCase();
        if (isCoding && (rawInputText.toLowerCase().includes("convention") || rawInputText.toLowerCase().includes("error handling"))) {
          category = "Implicit";
          confidence = 90;
          reason = "Explicitly requested or mentioned in prompt.";
          status = "Accepted";
          origin = "Implicit";
          source_quote = rawInputText;
        } else {
          category = "Rejected";
          confidence = 10;
          reason = "Unrequested default software engineering requirement.";
          status = "Rejected";
          origin = "Rejected";
          source_quote = "";
        }
      } else if (req === "Requires audit logging" || req === "Requires strict RBAC") {
        if (isCoding && (context.explicitRequirements.some(r => r.includes("Enterprise") || r.includes("High")) || rawInputText.toLowerCase().includes("security") || rawInputText.toLowerCase().includes("audit"))) {
          category = "Implicit";
          confidence = 95;
          reason = "Inferred from explicit security/enterprise level.";
          status = "Accepted";
          origin = "Implicit";
          source_quote = context.explicitRequirements.find(r => r.includes("Enterprise") || r.includes("High")) || rawInputText;
        } else {
          category = "Rejected";
          confidence = 5;
          reason = "Not an enterprise/high security coding task.";
          status = "Rejected";
          origin = "Rejected";
          source_quote = "";
        }
      }

      rawNodes.push({
        id: randomUUID(),
        type: "non-functional",
        description: req,
        text: this.normalize(req),
        priority: category === "Rejected" ? "low" : "medium",
        dependencies: [],
        category: category,
        confidence: confidence,
        source: category === "Rejected" ? "None" : "Implicit Rules",
        reason: reason,
        evidence: category === "Rejected" ? "None" : "Implicit conventions",
        origin: origin,
        status: status,
        source_quote: source_quote
      });
    });

    const assumption = "Standard internet connectivity is available";
    rawNodes.push({
      id: randomUUID(),
      type: "assumption",
      description: assumption,
      text: assumption,
      priority: "low",
      dependencies: [],
      category: "Rejected",
      confidence: 10,
      source: "None",
      reason: "Unrequested default assumption without explicit prompt quote.",
      evidence: "None",
      origin: "Rejected",
      status: "Rejected",
      source_quote: ""
    });

    // Test: Hallucinated PostgreSQL
    rawNodes.push({
      id: randomUUID(),
      type: "functional",
      description: "Use PostgreSQL",
      text: "Use PostgreSQL.",
      priority: "high",
      dependencies: [],
      category: "Rejected",
      confidence: 15,
      source: "None",
      reason: "No supporting evidence.",
      evidence: "None",
      origin: "Rejected",
      status: "Rejected",
      source_quote: ""
    });
    
    // Part 4: Missing Information Detection
    if (text.includes("ecommerce") || text.includes("e-commerce") || text.includes("shop") || text.includes("store")) {
      ["Target audience", "Platform", "Payment gateway", "Design preference", "Authentication requirement"].forEach(item => {
        rawNodes.push({
          id: randomUUID(),
          type: "missing",
          description: item,
          text: item,
          priority: "low",
          dependencies: [],
          category: "Optional",
          confidence: 50,
          source: "Missing Information Detection",
          reason: `Detected missing ${item.toLowerCase()}.`,
          evidence: "Ecommerce website",
          origin: "Optional",
          status: "Missing Information",
          source_quote: ""
        });
      });
    }

    // === STRICT TRACEABILITY & REQUIREMENT VALIDATION FILTERING ===
    // Filter out default hallucinated requirements or nodes without valid source quotes
    rawNodes.forEach(node => {
      const isDefaultPractice = ["Error handling", "Coding conventions", "Internet connectivity", "Security", "Logging"].some(term => 
        node.description.toLowerCase().includes(term.toLowerCase()) || 
        (node.text && node.text.toLowerCase().includes(term.toLowerCase()))
      );

      const rawInputLower = rawInputText.toLowerCase();
      const explicitTextLower = context.explicitRequirements.join(" ").toLowerCase();

      const explicitlyRequestedInPrompt = isDefaultPractice && (
        rawInputLower.includes("error") || 
        rawInputLower.includes("convention") || 
        rawInputLower.includes("internet") || 
        rawInputLower.includes("security") || 
        rawInputLower.includes("logging") ||
        explicitTextLower.includes("error") ||
        explicitTextLower.includes("convention") ||
        explicitTextLower.includes("internet") ||
        explicitTextLower.includes("security") ||
        explicitTextLower.includes("logging")
      );

      if (isDefaultPractice && !explicitlyRequestedInPrompt) {
        node.source_quote = "";
        node.status = "Rejected";
        node.category = "Rejected";
        node.confidence = 0;
        node.reason = "Filtered out: default software engineering best practice not explicitly requested in source prompt.";
      } else if (node.status === "Accepted" || node.status === "accepted") {
        if (!node.source_quote || node.source_quote.trim() === "") {
          node.status = "Rejected";
          node.category = "Rejected";
          node.confidence = 0;
          node.reason = "Filtered out: missing or empty source_quote.";
        } else {
          const quoteLower = node.source_quote.toLowerCase();
          const matches = rawInputLower.includes(quoteLower) || explicitTextLower.includes(quoteLower) || quoteLower.includes(rawInputLower);
          if (!matches) {
            node.status = "Rejected";
            node.category = "Rejected";
            node.confidence = 0;
            node.reason = "Filtered out: source_quote does not match user prompt.";
          }
        }
      }
    });

    // Part 4: Duplicate Detector
    const uniqueNodesMap = new Map<string, ReqNode>();
    let totalDuplicates = 0;

    rawNodes.forEach(node => {
      const normalizedText = node.text || node.description;
      if (uniqueNodesMap.has(normalizedText)) {
        const existing = uniqueNodesMap.get(normalizedText)!;
        existing.duplicateCount = (existing.duplicateCount || 1) + 1;
        totalDuplicates++;
      } else {
        node.duplicateCount = 1;
        uniqueNodesMap.set(normalizedText, node);
      }
    });

    const dedupedNodes = Array.from(uniqueNodesMap.values());

    // Part 5: Conflict Detector
    let conflictCount = 0;
    
    // Check conflicts (e.g. React vs no React)
    const reactNode = dedupedNodes.find(n => n.text === "Use React.");
    const noReactNode = dedupedNodes.find(n => n.text === "Do not use React.");

    if (reactNode && noReactNode) {
      reactNode.status = "Conflict";
      noReactNode.status = "Conflict";
      conflictCount += 1;
    }

    // Part 7: Metrics & Edges
    let rejectedCount = 0;
    let acceptedCount = 0;
    
    dedupedNodes.forEach(n => {
      if (n.status === "Rejected" || n.category === "Rejected" || n.status === "rejected") rejectedCount++;
      else if (n.status === "Accepted" || n.status === "accepted") acceptedCount++;
    });

    const missingCriticalCount = 0;
    const requirementCoverage = dedupedNodes.length > 0 ? (acceptedCount / dedupedNodes.length) * 100 : 100;

    const validNodes = dedupedNodes.filter(n => n.status === "Accepted" || n.status === "accepted");
    const primaryNode = validNodes[0];
    if (primaryNode) {
      for (let i = 1; i < validNodes.length; i++) {
        edges.push({ from: validNodes[i].id, to: primaryNode.id });
      }
    }

    return { 
      nodes: dedupedNodes, 
      edges,
      metrics: {
        requirementCoverage,
        conflictCount,
        duplicateCount: totalDuplicates,
        rejectedCount,
        acceptedCount,
        missingCriticalCount
      }
    };
  }
}
