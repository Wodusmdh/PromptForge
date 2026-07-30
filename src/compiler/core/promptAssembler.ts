import { ResolvedExecutionPlan, RuleSet, RequirementGraph, RequestContext } from "../models/domain";
import { CompiledPrompt, PromptSection } from "../models/schemas";
import { randomUUID } from "crypto";

export interface IPromptAssembler {
  assemble(context: RequestContext, plan: ResolvedExecutionPlan, rules: RuleSet, requirements: RequirementGraph): Promise<CompiledPrompt>;
}

export class PromptAssembler implements IPromptAssembler {
  async assemble(context: RequestContext, plan: ResolvedExecutionPlan, rules: RuleSet, requirements: RequirementGraph): Promise<CompiledPrompt> {
    const sections: PromptSection[] = [];
    
    // Generate deterministic sections
    sections.push({
      title: "Context",
      content: `Target: ${context.category}\nRaw Input: ${context.rawInput}`,
      order: 1
    });

    sections.push({
      title: "Requirements",
      content: requirements.nodes.map(n => `- [${n.priority}] ${n.description}`).join("\n"),
      order: 2
    });

    sections.push({
      title: "Rules & Constraints",
      content: rules.mandatory.map(r => `- Section ${r.section}: ${r.content}`).join("\n"),
      order: 3
    });

    // Generate markdown
    let compiledMarkdown = `# Master Prompt: ${context.category}\n\n`;
    sections.sort((a, b) => a.order - b.order).forEach(sec => {
      compiledMarkdown += `## ${sec.title}\n${sec.content}\n\n`;
    });

    return {
      id: randomUUID(),
      title: `${context.category} Master Prompt`,
      summary: "Generated deterministic prompt adhering to PromptForge v2.0.",
      sections,
      compiledMarkdown: compiledMarkdown.trim(),
      qualityScore: 95,
      estimatedTokens: compiledMarkdown.split(/\s+/).length // Naive token estimation
    };
  }
}
