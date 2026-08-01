import { RequestContext, IntentGraph, IntentNode } from "../models/domain";
import { randomUUID } from "crypto";

export interface IIntentAnalyzer {
  analyze(context: RequestContext): Promise<IntentGraph>;
}

export class IntentAnalyzer implements IIntentAnalyzer {
  async analyze(context: RequestContext): Promise<IntentGraph> {
    const text = context.normalizedText.toLowerCase();
    
    let intentType: any = "General";
    
    if (text.includes("translate") || text.includes("translation") || text.includes("japanese") || text.includes("spanish")) {
      intentType = "Translation";
    } else if (text.includes("math") || text.includes("+") || text.includes("-") || text.includes("calculate") || text.includes("equation")) {
      intentType = "Mathematics";
    } else if (text.includes("explain") || text.includes("tutorial") || text.includes("learn") || text.includes("education")) {
      intentType = "Education";
    } else if (text.includes("build") || text.includes("code") || text.includes("react") || text.includes("api") || text.includes("backend") || text.includes("frontend")) {
      intentType = "Coding";
    } else if (text.includes("translate") || text.includes("translation") || text.includes("japanese") || text.includes("spanish")) {
      intentType = "Translation";
    } else if (text.includes("math") || text.includes("+") || text.includes("-") || text.includes("calculate") || text.includes("equation")) {
      intentType = "Mathematics";
    } else if (text.includes("explain") || text.includes("beginner") || text.includes("tutorial") || text.includes("learn") || text.includes("education")) {
      intentType = "Education";
    } else if (text.includes("story") || text.includes("write") || text.includes("poem") || text.includes("essay")) {
      intentType = "Writing";
    } else if (text.includes("summarize") || text.includes("summary") || text.includes("tl;dr")) {
      intentType = "Summarization";
    } else if (text.includes("research") || text.includes("find information") || text.includes("investigate")) {
      intentType = "Research";
    } else if (text.includes("business") || text.includes("strategy") || text.includes("revenue")) {
      intentType = "Business";
    } else if (text.includes("marketing") || text.includes("seo") || text.includes("campaign")) {
      intentType = "Marketing";
    } else if (text.includes("analyze") || text.includes("data") || text.includes("statistics")) {
      intentType = "Analysis";
    } else if (text.includes("image") || text.includes("generate picture") || text.includes("draw")) {
      intentType = "Image Generation";
    } else if (text.includes("video") || text.includes("animate")) {
      intentType = "Video Generation";
    } else if (text.includes("act as") || text.includes("roleplay") || text.includes("persona")) {
      intentType = "Roleplay";
    } else if (text.trim() === "" || text === "unknown") {
      intentType = "Unknown";
    }

    const primaryNode: IntentNode = {
      id: randomUUID(),
      type: "primary",
      intent: intentType,
      description: `User intent classified as ${intentType}`,
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
