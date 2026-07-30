import { RequestContext, IntentGraph, RequirementGraph, ReqNode } from "../models/domain";
import { randomUUID } from "crypto";

export interface IRequirementExtractor {
  extract(context: RequestContext, intent: IntentGraph): Promise<RequirementGraph>;
}

export class RequirementExtractor implements IRequirementExtractor {
  async extract(context: RequestContext, intent: IntentGraph): Promise<RequirementGraph> {
    const nodes: ReqNode[] = [];
    const edges: { from: string; to: string }[] = [];

    // Extract functional from explicit
    context.explicitRequirements.forEach(req => {
      nodes.push({
        id: randomUUID(),
        type: "functional",
        description: req,
        priority: "high",
        dependencies: []
      });
    });

    // Extract non-functional
    context.implicitRequirements.forEach(req => {
      nodes.push({
        id: randomUUID(),
        type: "non-functional",
        description: req,
        priority: "medium",
        dependencies: []
      });
    });

    // Add assumptions
    nodes.push({
      id: randomUUID(),
      type: "assumption",
      description: "Standard internet connectivity is available",
      priority: "low",
      dependencies: []
    });

    // Tie dependencies (mock logic: all secondary depend on primary)
    const primaryNode = nodes[0];
    if (primaryNode) {
      for (let i = 1; i < nodes.length; i++) {
        edges.push({ from: nodes[i].id, to: primaryNode.id });
      }
    }

    return { nodes, edges };
  }
}
