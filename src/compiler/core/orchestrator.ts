import { UserRequest } from "../models/schemas";
import { CompilerOutput } from "../models/domain";
import { IRequestParser } from "./requestParser";
import { IIntentAnalyzer } from "./intentAnalyzer";
import { IRequirementExtractor } from "./requirementExtractor";
import { IRuleRetriever } from "./ruleRetriever";
import { IEngineSelector } from "./engineSelector";
import { IConflictResolver } from "./conflictResolver";
import { IPromptAssembler } from "./promptAssembler";
import { IValidationPipeline } from "./validationPipeline";

export class CompilerOrchestrator {
  constructor(
    private requestParser: IRequestParser,
    private intentAnalyzer: IIntentAnalyzer,
    private requirementExtractor: IRequirementExtractor,
    private ruleRetriever: IRuleRetriever,
    private engineSelector: IEngineSelector,
    private conflictResolver: IConflictResolver,
    private promptAssembler: IPromptAssembler,
    private validationPipeline: IValidationPipeline
  ) {}

  async compile(request: UserRequest): Promise<CompilerOutput> {
    // Stage 1: Parse Request
    const context = await this.requestParser.parse(request);

    // Stage 2: Intent Analysis
    const intent = await this.intentAnalyzer.analyze(context);

    // Stage 3: Requirement Extraction
    const requirements = await this.requirementExtractor.extract(context, intent);

    // Stage 4: Rule Retrieval
    const rules = await this.ruleRetriever.retrieve(requirements);

    // Stage 5: Engine Selection
    const executionPlan = await this.engineSelector.select(requirements, rules);

    // Stage 6: Conflict Resolution
    const resolvedPlan = await this.conflictResolver.resolve(executionPlan, rules, requirements);

    // Stage 7: Prompt Assembly
    const compiledPrompt = await this.promptAssembler.assemble(context, resolvedPlan, rules, requirements);

    // Stage 8: Validation
    const validationResult = await this.validationPipeline.validate(compiledPrompt, resolvedPlan, rules);

    // Stage 9: Generate Output
    return {
      compiledPrompt,
      executionSummary: `Compiled in 8 stages. Found ${requirements.nodes.length} requirements.`,
      selectedRules: rules.mandatory.concat(rules.optional),
      selectedEngines: resolvedPlan.orderedEngines,
      validationResult
    };
  }
}
