import { RequestContext, IntentGraph, IntentNode } from "../models/domain";
import { randomUUID } from "crypto";

export interface IIntentAnalyzer {
  analyze(context: RequestContext): Promise<IntentGraph>;
}

export class IntentAnalyzer implements IIntentAnalyzer {
  async analyze(context: RequestContext): Promise<IntentGraph> {
    const primaryNode: IntentNode = {
      id: randomUUID(),
      type: "primary",
      description: `Build a ${context.category} solution based on user idea.`,
      confidence: 0.95
    };

    const secondaryNodes: IntentNode[] = context.implicitRequirements.map(req => ({
      id: randomUUID(),
      type: "secondary",
      description: req,
      confidence: 0.8
    }));

    let complexity = 5;
    if (context.explicitRequirements.some(req => req.includes("Enterprise"))) complexity = 9;
    if (context.explicitRequirements.some(req => req.includes("Small"))) complexity = 2;

    return {
      primary: primaryNode,
      secondary: secondaryNodes,
      complexityEstimation: complexity
    };
  }
}
