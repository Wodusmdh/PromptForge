import { RequestContext, IntentGraph, RequirementGraph } from "../models/domain";
import { KnowledgeEngineResult } from "./knowledgeEngine";
import { randomUUID } from "crypto";

export type NodeStatus = "Complete" | "Partial" | "Missing" | "Conflict" | "Rejected" | "Unknown";

export interface GraphNode {
  id: string;
  type: string;
  status: NodeStatus;
  confidence: number;
  evidence: string;
  reason: string;
  children: string[];
}

export interface GraphEdge {
  from: string;
  to: string;
  relation: "affects" | "requires" | "supports" | "contains";
}

export class PromptGraph {
  public nodes: Map<string, GraphNode> = new Map();
  public edges: GraphEdge[] = [];
  public readonly graphVersion = "1.0.0";

  public addNode(node: GraphNode) {
    this.nodes.set(node.id, node);
  }

  public addEdge(edge: GraphEdge) {
    this.edges.push(edge);
  }

  public get missingNodes() {
    return Array.from(this.nodes.values()).filter(n => n.status === "Missing");
  }

  public get conflictingNodes() {
    return Array.from(this.nodes.values()).filter(n => n.status === "Conflict");
  }

  public get completedNodes() {
    return Array.from(this.nodes.values()).filter(n => n.status === "Complete");
  }

  public findMissingNodes() {
    return this.missingNodes;
  }

  public findConflictingNodes() {
    return this.conflictingNodes;
  }

  public findUnsupportedAssumptions() {
    return Array.from(this.nodes.values()).filter(n => n.type === "Assumption" && n.status !== "Complete");
  }

  public findDuplicatedConstraints() {
    const constraints = Array.from(this.nodes.values()).filter(n => n.type === "Constraints");
    const seen = new Set<string>();
    const duplicates: GraphNode[] = [];
    for (const c of constraints) {
      if (seen.has(c.evidence)) {
        duplicates.push(c);
      } else {
        seen.add(c.evidence);
      }
    }
    return duplicates;
  }

  public findDisconnectedNodes() {
    const connectedIds = new Set<string>();
    for (const edge of this.edges) {
      connectedIds.add(edge.from);
      connectedIds.add(edge.to);
    }
    return Array.from(this.nodes.values()).filter(n => !connectedIds.has(n.id) && n.type !== "Prompt");
  }

  public toJSON() {
    return {
      graphVersion: this.graphVersion,
      nodes: Array.from(this.nodes.values()),
      edges: this.edges,
      missingNodes: this.missingNodes,
      conflictingNodes: this.conflictingNodes,
      completedNodes: this.completedNodes,
    };
  }
}

export class PromptGraphBuilder {
  public build(context: RequestContext, intent: IntentGraph, reqs: RequirementGraph, knowledge: KnowledgeEngineResult): PromptGraph {
    const graph = new PromptGraph();

    // Create Root
    const rootId = randomUUID();
    graph.addNode({
      id: rootId,
      type: "Prompt",
      status: "Complete",
      confidence: 100,
      evidence: "Raw prompt provided",
      reason: "Root node",
      children: []
    });

    const addChildNode = (type: string, status: NodeStatus, reason: string, evidence: string, confidence: number) => {
      const id = randomUUID();
      graph.addNode({
        id,
        type,
        status,
        confidence,
        evidence,
        reason,
        children: []
      });
      graph.addEdge({ from: rootId, to: id, relation: "contains" });
      const rootNode = graph.nodes.get(rootId)!;
      rootNode.children.push(id);
      return id;
    };

    const isMatched = (ruleId: string) => knowledge.matchedRules.some(r => r.id === ruleId);
    
    // Objective
    let objId: string;
    if (isMatched("objective_required")) {
      objId = addChildNode("Objective", "Missing", "No clear action verb.", "Missing", 0);
    } else {
      objId = addChildNode("Objective", "Complete", "Objective clear.", "Action verb present.", 100);
    }

    // Audience
    let audId: string;
    if (isMatched("audience_required")) {
      audId = addChildNode("Audience", "Missing", "No audience specified.", "Missing", 0);
    } else {
      audId = addChildNode("Audience", "Complete", "Audience specified.", "Keyword detected.", 100);
    }

    // Output Format
    let outId: string;
    if (isMatched("output_format_required")) {
      outId = addChildNode("Output Format", "Missing", "No output format specified.", "Missing", 0);
    } else {
      outId = addChildNode("Output Format", "Complete", "Output format specified.", "Keyword detected.", 100);
    }

    // Context
    let ctxId: string;
    if ((context.normalizedText || "").length > 50) {
      ctxId = addChildNode("Context", "Complete", "Adequate context.", "Length > 50", 90);
    } else {
      ctxId = addChildNode("Context", "Partial", "Short context.", "Length <= 50", 50);
    }

    // Examples
    let exId: string;
    if (isMatched("examples_missing")) {
      exId = addChildNode("Examples", "Missing", "No examples provided.", "Missing", 0);
    } else {
      exId = addChildNode("Examples", "Complete", "Examples provided.", "Keyword detected.", 100);
    }

    // Tone
    let toneId: string;
    if (isMatched("writing_guidelines")) {
      toneId = addChildNode("Tone", "Missing", "Tone missing for writing task.", "Missing", 0);
    } else {
      if ((context.normalizedText || "").includes("tone") || (context.normalizedText || "").includes("friendly") || (context.normalizedText || "").includes("professional") || (context.normalizedText || "").includes("horror")) {
        toneId = addChildNode("Tone", "Complete", "Tone specified.", "Keyword detected.", 100);
      } else {
        toneId = addChildNode("Tone", "Unknown", "Tone not specified.", "None", 50);
      }
    }

    // Safety
    let safetyId = addChildNode("Safety", "Unknown", "No specific safety keywords.", "None", 50);

    // Success Criteria
    let scId = addChildNode("Success Criteria", "Unknown", "No success criteria defined.", "None", 50);

    // Reference Material
    let refId = addChildNode("Reference Material", "Unknown", "No reference material.", "None", 50);

    // Input Data
    let inputId = addChildNode("Input Data", "Unknown", "No input data.", "None", 50);

    // Model Preferences
    let modelId = addChildNode("Model Preferences", "Unknown", "No model preferences.", "None", 50);

    // Relationships
    graph.addEdge({ from: audId, to: toneId, relation: "affects" });
    graph.addEdge({ from: objId, to: outId, relation: "requires" });
    graph.addEdge({ from: exId, to: objId, relation: "supports" });

    // Constraints & Conflicts
    let hasConstraints = false;
    if (reqs && reqs.nodes) {
      reqs.nodes.forEach(req => {
        if (req.type === "constraint" || req.category === "Explicit") {
          hasConstraints = true;
          const status: NodeStatus = req.status === "Conflict" ? "Conflict" : "Complete";
          const cId = addChildNode("Constraints", status, req.reason || "Constraint", req.evidence || req.text || "", req.confidence || 100);
          
          if (req.duplicateCount && req.duplicateCount > 1) {
            // add another node with same evidence to trigger findDuplicatedConstraints
            addChildNode("Constraints", status, req.reason || "Constraint", req.evidence || req.text || "", req.confidence || 100);
          }
        }
        
        if (req.status === "Conflict") {
           addChildNode("Conflict", "Conflict", "Conflict detected.", req.text || "", 100);
        }
      });
    }

    if (!hasConstraints) {
      addChildNode("Constraints", "Missing", "No constraints provided.", "Missing", 0);
    }
    
    if (reqs && reqs.nodes) {
      reqs.nodes.filter(n => n.status === "Missing Information").forEach(req => {
        addChildNode("Missing Information", "Missing", req.reason || "Missing", req.evidence || req.text || "", 0);
      });
    }

    return graph;
  }
}
