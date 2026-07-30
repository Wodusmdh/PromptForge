import { RequestParser } from "./core/requestParser";
import { IntentAnalyzer } from "./core/intentAnalyzer";
import { RequirementExtractor } from "./core/requirementExtractor";
import { RuleRetriever } from "./core/ruleRetriever";
import { EngineSelector } from "./core/engineSelector";
import { ConflictResolver } from "./core/conflictResolver";
import { PromptAssembler } from "./core/promptAssembler";
import { ValidationPipeline } from "./core/validationPipeline";
import { CompilerOrchestrator } from "./core/orchestrator";
import { RuleRegistry } from "./rules/registry";
import { EngineRegistry } from "./engines/registry";

export function createCompiler(): CompilerOrchestrator {
  const ruleRegistry = new RuleRegistry();
  const engineRegistry = new EngineRegistry();

  const requestParser = new RequestParser();
  const intentAnalyzer = new IntentAnalyzer();
  const requirementExtractor = new RequirementExtractor();
  const ruleRetriever = new RuleRetriever(ruleRegistry);
  const engineSelector = new EngineSelector(engineRegistry);
  const conflictResolver = new ConflictResolver();
  const promptAssembler = new PromptAssembler();
  const validationPipeline = new ValidationPipeline();

  return new CompilerOrchestrator(
    requestParser,
    intentAnalyzer,
    requirementExtractor,
    ruleRetriever,
    engineSelector,
    conflictResolver,
    promptAssembler,
    validationPipeline
  );
}
