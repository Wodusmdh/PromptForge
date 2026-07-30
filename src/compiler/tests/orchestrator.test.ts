import { createCompiler } from "../di";
import { UserRequest } from "../models/schemas";
import assert from "assert";

async function runTests() {
  console.log("Starting Compiler Core Integration Tests...");

  const compiler = createCompiler();

  const mockRequest: UserRequest = {
    idea: "I need a high security real-time chat application for enterprise use.",
    targetAssistant: "cursor-claude",
    complexity: "Enterprise",
    stack: "React + Node + Socket.io",
    architectureStyle: "Microservices",
    uiStyle: "Dark mode luxury",
    dbType: "PostgreSQL",
    securityLevel: "High",
timestamp: new Date(),
  };

  console.log("Compiling prompt...");
  const result = await compiler.compile(mockRequest);

  console.log("--- COMPILATION OUTPUT ---");
  console.log("Quality Score:", result.compiledPrompt.qualityScore);
  console.log("Validation Valid:", result.validationResult.isValid);
  console.log("Execution Summary:", result.executionSummary);

  assert.strictEqual(result.compiledPrompt.title, "General application Master Prompt", "Category was parsed correctly");
  assert.ok(result.compiledPrompt.compiledMarkdown.includes("high security real-time chat"), "Raw input present");
  
  console.log("Integration test passed successfully.");
}

runTests().catch(console.error);
