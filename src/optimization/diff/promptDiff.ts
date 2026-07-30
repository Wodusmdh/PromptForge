import { CompiledPrompt } from "../../compiler/models/schemas";
import { IPromptDiff } from "../models/types";

export class PromptDiffGenerator {
  generate(original: CompiledPrompt, optimized: CompiledPrompt, isPreserved: boolean): IPromptDiff {
    const removed: string[] = [];
    const added: string[] = [];
    
    if (original.compiledMarkdown.length > optimized.compiledMarkdown.length) {
      removed.push("Removed redundant tokens/sentences.");
    } else if (original.compiledMarkdown.length < optimized.compiledMarkdown.length) {
      added.push("Injected context structural markers.");
    }

    return {
      removed,
      added,
      reordered: true,
      preservedIntent: isPreserved
    };
  }
}
