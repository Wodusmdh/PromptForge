import { PromptValidationEngine } from "../../compiler/core/validationEngine";
import { PromptExplainabilityEngine } from "../../compiler/core/explainabilityEngine";
import { PromptGraphBuilder } from "../../compiler/core/promptGraph";
import { PromptKnowledgeEngine } from "../../compiler/core/knowledgeEngine";
import { PromptQualityAnalyzer } from "../../compiler/core/promptAnalyzer";
import { IntentAnalyzer } from "../../compiler/core/intentAnalyzer";
import { RequirementExtractor } from "../../compiler/core/requirementExtractor";
import { RequestParser } from "../../compiler/core/requestParser";
import { MemoryRuleCache } from "../cache/ruleCache";
import { RuleDatabase } from "../database/ruleDb";
import { RuleIndexer } from "../search/indexer";
import { SearchEngine } from "../search/searchEngine";
import { ConflictDetector } from "../selection/conflictDetector";
import { RuleSelector } from "../selection/selector";
import { RuleAnalytics } from "../analytics/analytics";
import { RuleRecord, RuleSelectionContext } from "../models/schema";
import assert from "assert";

async function runTests() {
  console.log("Starting Rule Intelligence Integration Tests...");

  // Setup DI
  const cache = new MemoryRuleCache();
  const db = new RuleDatabase(cache);
  const indexer = new RuleIndexer();
  const searchEngine = new SearchEngine(db, indexer);
  const conflictDetector = new ConflictDetector();
  const selector = new RuleSelector(db);
  const analytics = new RuleAnalytics();

  // Insert Mock Rules
  const r1: RuleRecord = {
    id: "R001", version: "1.0", title: "Security Baseline", part: "Core", category: "Security",
    priority: "High", description: "All requests must enforce security baseline.", dependencies: [], conflicts: ["R002"],
    tags: ["security", "auth"], requiredEngines: ["GovernanceEngine"], requestTypes: ["Backend API"], examples: []
  };

  const r2: RuleRecord = {
    id: "R002", version: "1.0", title: "Legacy Auth", part: "Core", category: "Security",
    priority: "High", description: "Use legacy auth.", dependencies: [], conflicts: ["R001"],
    tags: ["auth", "legacy"], requiredEngines: [], requestTypes: ["Backend API"], examples: [], deprecated: true
  };

  const r3: RuleRecord = {
    id: "R003", version: "1.0", title: "React Best Practices", part: "UI", category: "Frontend",
    priority: "Medium", description: "Use functional components.", dependencies: [], conflicts: [],
    tags: ["react", "ui"], requiredEngines: ["ReactEngine"], requestTypes: ["Frontend Application"], examples: []
  };

  [r1, r2, r3].forEach(r => {
    db.insert(r);
    indexer.index(r);
  });

  // Test 1: Search
  const searchRes = searchEngine.search("security");
  assert.strictEqual(searchRes.length, 1);
  assert.strictEqual(searchRes[0].rule.id, "R001");
  console.log("Search test passed.");

  // Test 2: Selection
  const ctx: RuleSelectionContext = {
    requestType: "Backend API",
    tags: ["security"],
    engines: ["GovernanceEngine"]
  };
  const selectionRes = selector.select(ctx);
  assert.strictEqual(selectionRes.mandatory.length, 1);
  assert.strictEqual(selectionRes.mandatory[0].rule.id, "R001");
  assert.ok(selectionRes.mandatory[0].reason.includes("High priority"));
  console.log("Selection test passed.");

  // Test 3: Conflicts
  const conflicts = conflictDetector.detectConflicts([r1, r2]);
  assert.strictEqual(conflicts.length, 3); // R001 conflicts with R002, R002 deprecated, R002 conflicts with R001
  console.log("Conflicts test passed.");

  // Test 4: Analytics
  analytics.recordUsage("R001");
  analytics.recordUsage("R001");
  analytics.recordUsage("R003");
  const mostUsed = analytics.getMostUsed();
  assert.strictEqual(mostUsed[0].id, "R001");
  assert.strictEqual(mostUsed[0].count, 2);
  console.log("Analytics test passed.");

  // Test 5: Cache
  const cachedR1 = cache.get("R001", "1.0");
  assert.ok(cachedR1);
  assert.strictEqual(cachedR1!.id, "R001");
  console.log("Cache test passed.");

  
  // === PHASE 2: INTELLIGENCE CORE REGRESSION TESTS ===
  console.log("Starting Intelligence Core Regression Tests...");

  const reqParser = new RequestParser();
  const intentAnalyzer = new IntentAnalyzer();
  const reqExtractor = new RequirementExtractor();

  async function testIntelligence(idea, additionalRules) {
    const userReq: any = {
      idea,
      additionalRules,
      timestamp: new Date(),
      targetAssistant: "gemini-ai-studio",
      complexity: "Medium",
      stack: "None",
      architectureStyle: "None",
      uiStyle: "None",
      dbType: "None",
      securityLevel: "Standard"
    };
    const ctx = await reqParser.parse(userReq);
    const intent = await intentAnalyzer.analyze(ctx);
    const reqs = await reqExtractor.extract(ctx, intent);
    return { intent, reqs, ctx };
  }

  // Test 1: General
  const res1 = await testIntelligence("Hello", "");
  assert.strictEqual(res1.intent.primary.intent, "General");
  
  // Test 2: Mathematics
  const res2 = await testIntelligence("What is 2 + 2?", "");
  assert.strictEqual(res2.intent.primary.intent, "Mathematics");
  
  // Test 3: Education (Explanation)
  const res3 = await testIntelligence("Explain APIs to beginners.", "");
  assert.strictEqual(res3.intent.primary.intent, "Education");
  const reqs3 = res3.reqs.nodes.map(n => n.description.toLowerCase());
  assert.ok(reqs3.some(r => r.includes("jargon") || r.includes("simple")));
  assert.ok(!reqs3.some(r => r.includes("react")));
  
  // Test 4: Coding
  const res4 = await testIntelligence("Build a React application.", "");
  assert.strictEqual(res4.intent.primary.intent, "Coding");
  // Test 5: Translation
  const res5 = await testIntelligence("Translate this into Japanese.", "");
  assert.strictEqual(res5.intent.primary.intent, "Translation");
  
  // Test 6: Writing
  const res6 = await testIntelligence("Write a horror story.", "");
  assert.strictEqual(res6.intent.primary.intent, "Writing");

  console.log("Intelligence Core Regression Tests passed.");
  // === PHASE 2.1: REQUIREMENT SCORING ENGINE TESTS ===
  console.log("Starting Requirement Scoring Engine Tests...");
  
  // Test: Duplicate requirements
  const dupRes = await testIntelligence("App", "- I want a dark theme.\n- Use dark mode.\n- Make the dark ui.");
  const darkReq = dupRes.reqs.nodes.find(n => n.text === "Use dark mode");
  assert.ok(darkReq);
  // It should be deduplicated
  assert.strictEqual(darkReq.duplicateCount > 1, true);
  assert.strictEqual(dupRes.reqs.metrics.duplicateCount > 0, true);

  // Test: Contradictory requirements
  const conflictRes = await testIntelligence("App", "- Use React.\n- Do not use React.");
  const reactConf = conflictRes.reqs.nodes.find(n => n.text === "Use React.");
  const noReactConf = conflictRes.reqs.nodes.find(n => n.text === "Do not use React.");
  assert.ok(reactConf);
  assert.ok(noReactConf);
  assert.strictEqual(reactConf.status, "Conflict");
  assert.strictEqual(noReactConf.status, "Conflict");
  assert.strictEqual(conflictRes.reqs.metrics.conflictCount > 0, true);

  // Test: Explicit React
  const reactRes = await testIntelligence("Build a website.", "- Use React");
  const explReact = reactRes.reqs.nodes.find(n => n.text === "Use React.");
  assert.ok(explReact);
  assert.strictEqual(explReact.category, "Explicit");
  assert.strictEqual(explReact.confidence > 90, true);

  // Test: Implicit beginner
  const begRes = await testIntelligence("Explain how to code for a beginner.", "");
  const begReq = begRes.reqs.nodes.find(n => n.text.includes("jargon"));
  assert.ok(begReq);
  assert.strictEqual(begReq.category, "Implicit");
  assert.strictEqual(begReq.confidence > 70 && begReq.confidence < 95, true);
  assert.strictEqual(begReq.reason, "The user identified themselves as a beginner.");

  // Test: Hallucinated PostgreSQL
  const pgRes = await testIntelligence("Build a simple calculator.", "");
  const pgReq = pgRes.reqs.nodes.find(n => n.text === "Use PostgreSQL.");
  assert.ok(pgReq);
  assert.strictEqual(pgReq.category, "Rejected");
  assert.strictEqual(pgReq.confidence < 40, true);
  assert.strictEqual(pgReq.status, "Rejected");
  assert.strictEqual(pgReq.reason, "No supporting evidence.");

  // Test: Empty prompt
  const emptyRes = await testIntelligence("", "");
  assert.ok(emptyRes.reqs.nodes.length > 0); // At least defaults/hallucinated will exist
  
  // Test: General prompt
  const genRes = await testIntelligence("Hello", "");
  assert.strictEqual(genRes.intent.primary.intent, "General");

  // Test: Coding prompt
  const codeRes = await testIntelligence("Build a node API.", "");
  assert.strictEqual(codeRes.intent.primary.intent, "Coding");
  const codeImplicit = codeRes.reqs.nodes.find(n => n.text === "Must adhere to standard coding conventions");
  assert.ok(codeImplicit);
  assert.strictEqual(codeImplicit.category, "Implicit");
  assert.strictEqual(codeImplicit.status, "Accepted");


  
  // === PHASE 3: PROMPT QUALITY ANALYZER TESTS ===
  console.log("Starting Prompt Quality Analyzer Tests...");
  
  const qualityAnalyzer = new PromptQualityAnalyzer();

  // Test: Hello
  const helloRes3 = await testIntelligence("Hello", "");
  const helloQuality = qualityAnalyzer.analyze(helloRes3.ctx, helloRes3.reqs);
  assert.ok(helloQuality.overallScore < 50);

  // Test: Explain APIs to beginners.
  const explainRes3 = await testIntelligence("Explain APIs for beginners.", "");
  const explainQuality = qualityAnalyzer.analyze(explainRes3.ctx, explainRes3.reqs);
  assert.ok(explainQuality.dimensionScores["Objective Clarity"].score > 90);

  // Test: Build a React application.
  const reactRes3 = await testIntelligence("Build a React application.", "");
  const reactQuality = qualityAnalyzer.analyze(reactRes3.ctx, reactRes3.reqs);
  assert.strictEqual(reactRes3.intent.primary.intent, "Coding");

  // Test: Write a horror story.
  const horrorRes3 = await testIntelligence("Write a horror story.", "");
  const horrorQuality = qualityAnalyzer.analyze(horrorRes3.ctx, horrorRes3.reqs);
  assert.strictEqual(horrorRes3.intent.primary.intent, "Writing");

  // Test: Translate this into Japanese.
  const transRes3 = await testIntelligence("Translate this into Japanese.", "");
  const transQuality = qualityAnalyzer.analyze(transRes3.ctx, transRes3.reqs);
  assert.strictEqual(transRes3.intent.primary.intent, "Translation");

  // Test: Conflicting prompt.
  const conflictRes3 = await testIntelligence("App", "- Use React.\n- Do not use React.");
  const conflictQuality = qualityAnalyzer.analyze(conflictRes3.ctx, conflictRes3.reqs);
  assert.strictEqual(conflictQuality.dimensionScores["Conflicting Instructions"].score, 20);

  console.log("Prompt Quality Analyzer Tests passed.");

  
  // === PHASE 3.5: PROMPT KNOWLEDGE ENGINE TESTS ===
  console.log("Starting Prompt Knowledge Engine Tests...");
  
  const knowledgeEngine = new PromptKnowledgeEngine();
  
  // Test: Unknown prompt (Hello)
  const evalHello = knowledgeEngine.evaluate(helloRes3.ctx, helloRes3.reqs);
  assert.ok(evalHello.matchedRules.some(r => r.id === "objective_required"));
  assert.ok(evalHello.matchedRules.some(r => r.id === "audience_required"));
  assert.ok(evalHello.matchedRules.some(r => r.id === "output_format_required"));

  // Test: Explain APIs for beginners (Audience rule)
  const evalExplain = knowledgeEngine.evaluate(explainRes3.ctx, explainRes3.reqs);
  // It shouldn't trigger audience missing
  assert.ok(!evalExplain.matchedRules.some(r => r.id === "audience_required"));

  // Test: Constraint rule (Build a React application.)
  const reactCtx = { normalizedText: "build a react app", rawInput: "build a react app", explicitRequirements: [] };
  const evalReact = knowledgeEngine.evaluate(reactCtx as any);
  assert.ok(evalReact.matchedRules.some(r => r.id === "constraints_recommended"));

  // Test: Coding rule
  const codeCtx = { normalizedText: "build a simple app", rawInput: "build a simple app", language: "en", category: "General", explicitRequirements: [], implicitRequirements: [], ambiguities: [] };
  const evalCoding = knowledgeEngine.evaluate(codeCtx as any);
  assert.ok(evalCoding.matchedRules.some(r => r.id === "coding_guidelines"));

  // Test: Writing rule
  const writeCtx = { normalizedText: "write a story about a dog", rawInput: "write a story about a dog", language: "en", category: "General", explicitRequirements: [], implicitRequirements: [], ambiguities: [] };
  const evalWriting = knowledgeEngine.evaluate(writeCtx as any);
  assert.ok(evalWriting.matchedRules.some(r => r.id === "writing_guidelines"));

  // Test: Translation rule
  const transCtx = { normalizedText: "translate this document", rawInput: "translate this document", language: "en", category: "General", explicitRequirements: [], implicitRequirements: [], ambiguities: [] };
  const evalTrans = knowledgeEngine.evaluate(transCtx as any);
  assert.ok(evalTrans.matchedRules.some(r => r.id === "translation_guidelines"));

  // Test: Business rule
  const busCtx = { normalizedText: "write a business plan", rawInput: "write a business plan", language: "en", category: "General", explicitRequirements: [], implicitRequirements: [], ambiguities: [] };
  const evalBus = knowledgeEngine.evaluate(busCtx as any);
  assert.ok(evalBus.matchedRules.some(r => r.id === "business_guidelines"));

  // Test: No duplicate rules
  const ruleIds = knowledgeEngine.getRules().map(r => r.id);
  const uniqueRuleIds = new Set(ruleIds);
  assert.strictEqual(ruleIds.length, uniqueRuleIds.size);

  console.log("Prompt Knowledge Engine Tests passed.");

  
  // === PHASE 4: PROMPT GRAPH ENGINE TESTS ===
  console.log("Starting Prompt Graph Engine Tests...");
  const graphBuilder = new PromptGraphBuilder();
  
  // Test: Hello
  const helloEval = knowledgeEngine.evaluate(helloRes3.ctx, helloRes3.reqs);
  const helloGraph = graphBuilder.build(helloRes3.ctx, helloRes3.intent, helloRes3.reqs, helloEval);
  assert.ok(helloGraph.findMissingNodes().some(n => n.type === "Objective"));
  assert.ok(helloGraph.findMissingNodes().some(n => n.type === "Audience"));
  assert.ok(helloGraph.nodes.size > 0);
  assert.ok(helloGraph.edges.length > 0);

  // Test: Explain APIs
  const explainEval = knowledgeEngine.evaluate(explainRes3.ctx, explainRes3.reqs);
  const explainGraph = graphBuilder.build(explainRes3.ctx, explainRes3.intent, explainRes3.reqs, explainEval);
  assert.ok(explainGraph.completedNodes.some(n => n.type === "Audience"));

  // Test: React app
  const reactCtx2 = { normalizedText: "build a react app", rawInput: "build a react app", explicitRequirements: [] };
  const reactEval2 = knowledgeEngine.evaluate(reactCtx2 as any, reactRes3.reqs);
  const reactGraph = graphBuilder.build(reactCtx2 as any, reactRes3.intent, reactRes3.reqs, reactEval2);
  assert.ok(reactGraph.completedNodes.some(n => n.type === "Objective"));

  // Test: Business plan
  const busEval = knowledgeEngine.evaluate(busCtx as any);
  const busGraph = graphBuilder.build(busCtx as any, res1.intent, res1.reqs, busEval); // dummy intent/reqs
  assert.ok(busGraph.nodes.size > 0);

  // Test: Translation
  const transEval = knowledgeEngine.evaluate(transCtx as any);
  const transGraph = graphBuilder.build(transCtx as any, res5.intent, res5.reqs, transEval);
  assert.ok(transGraph.nodes.size > 0);

  // Test: Story writing
  const writeEval = knowledgeEngine.evaluate(writeCtx as any);
  const writeGraph = graphBuilder.build(writeCtx as any, res6.intent, res6.reqs, writeEval);
  assert.ok(writeGraph.nodes.size > 0);

  // Test: Conflicting prompt
  const conflictEval = knowledgeEngine.evaluate(conflictRes3.ctx, conflictRes3.reqs);
  const conflictGraph = graphBuilder.build(conflictRes3.ctx, conflictRes3.intent, conflictRes3.reqs, conflictEval);
  assert.ok(conflictGraph.findConflictingNodes().length > 0);

  // Test: Duplicate constraints
  const dupEval = knowledgeEngine.evaluate(dupRes.ctx, dupRes.reqs);
  const dupGraph = graphBuilder.build(dupRes.ctx, dupRes.intent, dupRes.reqs, dupEval);
  assert.ok(dupGraph.findDuplicatedConstraints().length > 0);

  // Serialize check
  const jsonGraph = helloGraph.toJSON();
  assert.ok(jsonGraph.graphVersion === "1.0.0");
  assert.ok(jsonGraph.nodes.length > 0);

  console.log("Prompt Graph Engine Tests passed.");

  
  // === PHASE 5: PROMPT EXPLAINABILITY ENGINE TESTS ===
  console.log("Starting Prompt Explainability Engine Tests...");
  const explainabilityEngine = new PromptExplainabilityEngine();
  
  // Test: Normalization, Duplicate, Conflict, Accepted, Rejected, Missing Info
  explainabilityEngine.generateExplanations(dupRes.ctx, dupRes.reqs, dupGraph);
  explainabilityEngine.generateExplanations(conflictRes3.ctx, conflictRes3.reqs, conflictGraph);
  explainabilityEngine.generateExplanations(pgRes.ctx, pgRes.reqs, null as any); // pgRes has Rejected requirement
  
  const log = explainabilityEngine.getDecisionLog();
  assert.ok(log.length > 0);
  assert.ok(explainabilityEngine.getRejectedItems().length > 0); // pgRes Rejected
  assert.ok(explainabilityEngine.getConflicts().length > 0); // conflictRes3 Conflict
  assert.ok(log.some(d => d.decision === "Duplicate Removal")); // dupRes Duplicate Removal
  
  const changeHist = explainabilityEngine.getChangeHistory();
  assert.ok(changeHist.length > 0);
  
  console.log("Prompt Explainability Engine Tests passed.");

  
  // === PHASE 6: PROMPT VALIDATION ENGINE TESTS ===
  console.log("Starting Prompt Validation Engine Tests...");
  const validationEngine = new PromptValidationEngine();
  
  // Test: Hello
  const helloVal = validationEngine.validate(helloRes3.ctx, helloRes3.reqs, helloGraph, helloQuality, helloEval);
  assert.ok(helloVal.validationScore < 50);
  assert.ok(helloVal.issues.some(i => i.type === "Missing Objective"));
  
  // Test: Explain APIs
  const explainVal = validationEngine.validate(explainRes3.ctx, explainRes3.reqs, explainGraph, explainQuality, explainEval);
  assert.ok(explainVal.passedChecks.some(c => c.ruleName === "Missing Audience"));
  
  // Test: React app
  const reactVal = validationEngine.validate(reactCtx2 as any, reactRes3.reqs, reactGraph, reactQuality, reactEval2);
  assert.ok(reactVal.validationScore > 0);
  
  // Test: Business plan
  const busVal = validationEngine.validate(busCtx as any, res1.reqs, busGraph, helloQuality, busEval);
  assert.ok(busVal.overallStatus !== undefined);
  
  // Test: Translation
  const transVal = validationEngine.validate(transCtx as any, res5.reqs, transGraph, transQuality, transEval);
  assert.ok(transVal.passedChecks.length > 0);
  
  // Test: Conflicting prompt
  const conflictVal = validationEngine.validate(conflictRes3.ctx, conflictRes3.reqs, conflictGraph, conflictQuality, conflictEval);
  assert.ok(conflictVal.issues.some(i => i.type === "Conflicting Constraints"));
  
  // Test: Duplicate constraints
  const dupVal = validationEngine.validate(dupRes.ctx, dupRes.reqs, dupGraph, helloQuality, dupEval);
  assert.ok(dupVal.suggestions.some(i => i.type === "Duplicate Requirements") || dupVal.warnings.some(i => i.type === "Duplicate Requirements") || dupVal.issues.some(i => i.type === "Duplicate Requirements"));
  
  // Test: Empty prompt
  const emptyVal = validationEngine.validate(emptyRes.ctx, emptyRes.reqs, helloGraph, helloQuality, helloEval);
  assert.ok(emptyVal.validationScore === 0);

  console.log("Prompt Validation Engine Tests passed.");

  console.log("Rule Intelligence integration test passed successfully.");
}

runTests().catch(console.error);
