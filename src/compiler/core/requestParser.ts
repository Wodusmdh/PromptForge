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

    const explicitRequirements = [
      `Target Assistant: ${request.targetAssistant}`,
      `Complexity: ${request.complexity}`,
      `Tech Stack: ${request.stack}`,
      `Architecture: ${request.architectureStyle}`,
      `UI Style: ${request.uiStyle}`,
      `Database: ${request.dbType}`,
      `Security: ${request.securityLevel}`
    ];
    
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
