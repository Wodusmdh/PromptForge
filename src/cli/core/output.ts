export class OutputFormatter {
  static format(data: any, format: "human" | "json" | "yaml" | "markdown"): string {
    switch (format) {
      case "json":
        return JSON.stringify(data, null, 2);
      case "yaml":
        // Mock YAML
        return Object.keys(data).map(k => `${k}: ${typeof data[k] === 'object' ? JSON.stringify(data[k]) : data[k]}`).join("\n");
      case "markdown":
        return `## Output\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
      case "human":
      default:
        if (data.compiledMarkdown) {
          return `=== Compiled Prompt ===\n${data.compiledMarkdown}\n=======================`;
        }
        return JSON.stringify(data, null, 2);
    }
  }
}
