import { CompiledPrompt } from "../../compiler/models/schemas";
import { IQualityScore } from "../models/types";

export class PromptQualityAnalyzer {
  analyze(prompt: CompiledPrompt): IQualityScore {
    let completeness = 80;
    let ambiguity = 20; 
    let readability = 85;
    let consistency = 90;
    let efficiency = 70;

    if (prompt.estimatedTokens > 1000) {
      efficiency -= 10;
      readability -= 5;
    }

    if (prompt.sections.length > 5) {
      completeness += 10;
    }

    const invertedAmbiguity = 100 - ambiguity;
    const overall = (completeness + invertedAmbiguity + readability + consistency + efficiency) / 5;

    return { completeness, ambiguity: invertedAmbiguity, readability, consistency, efficiency, overall };
  }
}
