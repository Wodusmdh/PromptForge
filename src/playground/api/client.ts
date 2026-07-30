export class PromptForgeApiClient {
  private baseUrl = "/api/v1";

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      "X-API-Key": "test-key" // Mock API Key for local dev
    };
  }

  async compile(idea: string, targetAssistant: string = "gemini") {
    const res = await fetch(`${this.baseUrl}/compile`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ idea, targetAssistant })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async optimize(promptId: string) {
    const res = await fetch(`${this.baseUrl}/optimize`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ promptId })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async analyze(promptId: string) {
    const res = await fetch(`${this.baseUrl}/analyze`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ promptId })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async validate(promptId: string) {
    const res = await fetch(`${this.baseUrl}/validate`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ promptId })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async searchRules(query: string) {
    const res = await fetch(`${this.baseUrl}/rules/search`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ query })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
}

export const api = new PromptForgeApiClient();
