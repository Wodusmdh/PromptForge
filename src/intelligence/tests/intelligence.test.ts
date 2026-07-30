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

  console.log("Rule Intelligence integration test passed successfully.");
}

runTests().catch(console.error);
