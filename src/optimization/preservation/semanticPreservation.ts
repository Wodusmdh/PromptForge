import { CompiledPrompt } from "../../compiler/models/schemas";

export class SemanticPreservationVerifier {
  verify(original: CompiledPrompt, optimized: CompiledPrompt): boolean {
    const originalSectionTitles = original.sections.map(s => s.title);
    const optimizedSectionTitles = optimized.sections.map(s => s.title);

    for (const title of originalSectionTitles) {
      if (!optimizedSectionTitles.includes(title)) {
        return false;
      }
    }

    if (optimized.estimatedTokens < original.estimatedTokens * 0.1) {
      return false;
    }

    return true;
  }
}
