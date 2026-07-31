import { GoogleGenAI } from "@google/genai";
import { UserRequest } from "../models/schemas";
import { RequestContext } from "../models/domain";

export interface IRequestParser {
  parse(request: UserRequest): Promise<RequestContext>;
}

export class RequestParser implements IRequestParser {
  constructor(private aiClient?: GoogleGenAI) {}

  async parse(request: UserRequest): Promise<RequestContext> {
    // In production, we'd use the AI client to analyze the text.
    // We implement a robust fallback here to ensure the pipeline runs even without a key.
    
    const normalizedText = request.idea.trim().toLowerCase();
    
    // Categorization logic
    let category = "General application";
    if (normalizedText.includes("api") || normalizedText.includes("backend")) {
      category = "Backend API";
    } else if (normalizedText.includes("ui") || normalizedText.includes("frontend")) {
      category = "Frontend Application";
    }

    
    const explicitRequirements: string[] = [];
    if (request.targetAssistant) explicitRequirements.push(`Target Assistant: ${request.targetAssistant}`);
    if (request.complexity) explicitRequirements.push(`Complexity: ${request.complexity}`);
    if (request.stack) explicitRequirements.push(`Tech Stack: ${request.stack}`);
    if (request.architectureStyle) explicitRequirements.push(`Architecture: ${request.architectureStyle}`);
    if (request.uiStyle) explicitRequirements.push(`UI Style: ${request.uiStyle}`);
    if (request.dbType) explicitRequirements.push(`Database: ${request.dbType}`);
    if (request.securityLevel) explicitRequirements.push(`Security: ${request.securityLevel}`);

    
    if (request.additionalRules) {
      explicitRequirements.push(`Rules: ${request.additionalRules}`);
    }

    const implicitRequirements = [
      "Must adhere to standard coding conventions",
      "Requires appropriate error handling"
    ];

    if (request.securityLevel === "High" || request.securityLevel === "Enterprise") {
      implicitRequirements.push("Requires audit logging");
      implicitRequirements.push("Requires strict RBAC");
    }

    const ambiguities: string[] = [];
    if (request.idea.length < 20) {
      ambiguities.push("The core idea is very short and lacks detailed feature descriptions.");
    }

    return {
      rawInput: request.idea,
      normalizedText,
      language: "en",
      category,
      explicitRequirements,
      implicitRequirements,
      ambiguities
    };
  }
}
