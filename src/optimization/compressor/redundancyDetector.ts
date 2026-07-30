import { CompiledPrompt } from "../../compiler/models/schemas";

export class RedundancyDetector {
  detect(prompt: CompiledPrompt): string[] {
    const redundancies: string[] = [];
    const seenSentences = new Set<string>();

    for (const section of prompt.sections) {
      const sentences = section.content.split('. ');
      for (const sentence of sentences) {
        const normalized = sentence.trim().toLowerCase();
        if (normalized.length > 10) {
          if (seenSentences.has(normalized)) {
            redundancies.push(sentence);
          } else {
            seenSentences.add(normalized);
          }
        }
      }
    }
    return redundancies;
  }
}
