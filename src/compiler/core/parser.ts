import { UserRequest, UserRequestSchema, ParsedIntent } from "../models/schemas";
import { ValidationError } from "./errors";
import { randomUUID } from "crypto";

export class RequestParser {
  /**
   * Validates and normalizes raw input into a UserRequest.
   */
  static parseInput(rawInput: unknown): UserRequest {
    const result = UserRequestSchema.safeParse(rawInput);
    if (!result.success) {
      throw ValidationError.fromZod(result.error);
    }
    const data = result.data;
    if (!data.id) {
      // Typically crypto.randomUUID() is available in Node.js 15.6+
      // In older environments, we might use a package. Since we use Node, we can use crypto.
      data.id = randomUUID();
    }
    return data;
  }

  /**
   * Dummy implementation of intent extraction.
   * In a real system, this would call an LLM to analyze the idea.
   */
  static async extractIntent(request: UserRequest): Promise<ParsedIntent> {
    // Placeholder for actual LLM call
    const goals = [];
    if (request.complexity && request.stack) {
      goals.push(`Build a ${request.complexity} application using ${request.stack}`);
    } else {
      goals.push(`Build an application based on user request`);
    }

    return {
      primaryGoal: goals[0],
      secondaryGoals: ["Ensure clean architecture", "Apply strict security"],
      targetAudience: "General Users",
      businessDomain: "Software",
      technicalScope: request.architectureStyle || "As specified",
      assumptions: ["Standard web deployment"],
    };
  }
}
