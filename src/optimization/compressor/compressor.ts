import { CompiledPrompt, PromptSection } from "../../compiler/models/schemas";
import { RedundancyDetector } from "./redundancyDetector";

export class PromptCompressor {
  constructor(private redundancyDetector: RedundancyDetector) {}

  compress(prompt: CompiledPrompt): CompiledPrompt {
    const redundancies = this.redundancyDetector.detect(prompt);
    
    const newSections: PromptSection[] = prompt.sections.map(sec => {
      let content = sec.content;
      redundancies.forEach(r => {
        content = content.replace(r + ". ", "");
        content = content.replace(r, "");
      });
      return { ...sec, content: content.trim() };
    });

    const compiledMarkdown = newSections.map(s => `## ${s.title}\n${s.content}\n\n`).join("").trim();
    const newTokens = compiledMarkdown.split(/\s+/).length;

    return {
      ...prompt,
      sections: newSections,
      compiledMarkdown,
      estimatedTokens: newTokens
    };
  }
}
