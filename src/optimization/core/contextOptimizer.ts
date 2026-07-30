import { CompiledPrompt } from "../../compiler/models/schemas";

export class ContextOptimizer {
  optimizeContext(prompt: CompiledPrompt): CompiledPrompt {
    const orderMap: Record<string, number> = {
      "Context": 1,
      "Requirements": 2,
      "Rules & Constraints": 3
    };

    const newSections = [...prompt.sections].sort((a, b) => {
      const orderA = orderMap[a.title] || 99;
      const orderB = orderMap[b.title] || 99;
      return orderA - orderB;
    });

    const compiledMarkdown = newSections.map(s => `## ${s.title}\n${s.content}\n\n`).join("").trim();

    return {
      ...prompt,
      sections: newSections,
      compiledMarkdown
    };
  }
}
