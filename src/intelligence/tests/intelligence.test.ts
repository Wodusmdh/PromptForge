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
    const userReq = {
      idea,
      additionalRules,
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
    return { intent, reqs };
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

  console.log("Rule Intelligence integration test passed successfully.");
}

runTests().catch(console.error);
