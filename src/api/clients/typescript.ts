export class PromptForgeClient {
  constructor(private apiKey: string, private baseUrl = "https://api.promptforge.dev/v1") {}

  async compile(idea: string, targetAssistant: string) {
    const res = await fetch(`${this.baseUrl}/compile`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": this.apiKey },
      body: JSON.stringify({ idea, targetAssistant })
    });
    if (!res.ok) throw new Error("Compilation failed");
    return res.json();
  }
}
