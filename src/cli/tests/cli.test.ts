import { PromptForgeCLI } from "../index";
import { ConfigManager } from "../core/config";
import { OutputFormatter } from "../core/output";
import assert from "assert";

async function runTests() {
  console.log("Starting CLI Tests...");

  // Test 1: Config priority
  process.env.PF_OUTPUT_FORMAT = "json";
  const config = ConfigManager.load({ format: "yaml" });
  assert.strictEqual(config.outputFormat, "yaml"); // CLI args beat Env
  console.log("Config priority test passed.");

  // Test 2: Output Formatter
  const data = { compiledMarkdown: "Test Output" };
  const human = OutputFormatter.format(data, "human");
  assert.ok(human.includes("=== Compiled Prompt ==="));
  
  const json = OutputFormatter.format(data, "json");
  assert.strictEqual(json, JSON.stringify(data, null, 2));
  console.log("Output formatter test passed.");

  // Test 3: CLI run mock
  const cli = new PromptForgeCLI();
  
  // Capture console.log
  let output = "";
  const originalLog = console.log;
  console.log = (msg: string) => { output += msg + "\\n"; };
  
  await cli.run(["node", "cli.js", "compile", "--format=json"]);
  
  console.log = originalLog;
  assert.ok(output.includes('"status": "success"'));
  console.log("CLI command test passed.");

  console.log("CLI integration test passed successfully.");
}

runTests().catch(console.error);
