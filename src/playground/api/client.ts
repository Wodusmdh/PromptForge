export class PromptForgeApiClient {
  private baseUrl = "/api/v1";

  private getHeaders() {
    return {
      "Content-Type": "application/json"
    };
  }

  private async handleResponse(res: Response) {
    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch (e) {
        errorData = { message: await res.text() };
      }
      
      const requestId = res.headers.get("x-request-id") || errorData.requestId;
      const errorCode = errorData.code || res.statusText;
      const errorMessage = errorData.message || errorData.error || "Unknown error";
      
      let formattedMsg = `${res.status} ${errorCode}:\n${errorMessage}`;
      if (requestId) {
        formattedMsg += `\n\nRequest ID:\n${requestId}`;
      }
      
      throw new Error(formattedMsg);
    }
    return res.json();
  }

  async initSession() {
    const res = await fetch(`${this.baseUrl}/auth/session`, {
      method: "POST",
      headers: this.getHeaders(),
      credentials: "same-origin"
    });
    return this.handleResponse(res);
  }

  async logout() {
    const res = await fetch(`${this.baseUrl}/auth/logout`, {
      method: "POST",
      headers: this.getHeaders(),
      credentials: "same-origin"
    });
    return this.handleResponse(res);
  }

  async compile(idea: string, targetAssistant?: string) {
    const res = await fetch(`${this.baseUrl}/compile`, {
      method: "POST",
      headers: this.getHeaders(),
      credentials: "same-origin",
      body: JSON.stringify({ idea, targetAssistant })
    });
    return this.handleResponse(res);
  }

  async optimize(sessionId: string) {
    const res = await fetch(`${this.baseUrl}/optimize`, {
      method: "POST",
      headers: this.getHeaders(),
      credentials: "same-origin",
      body: JSON.stringify({ sessionId })
    });
    return this.handleResponse(res);
  }

  async analyze(sessionId: string) {
    const res = await fetch(`${this.baseUrl}/analyze`, {
      method: "POST",
      headers: this.getHeaders(),
      credentials: "same-origin",
      body: JSON.stringify({ sessionId })
    });
    return this.handleResponse(res);
  }

  async validate(sessionId: string) {
    const res = await fetch(`${this.baseUrl}/validate`, {
      method: "POST",
      headers: this.getHeaders(),
      credentials: "same-origin",
      body: JSON.stringify({ sessionId })
    });
    return this.handleResponse(res);
  }

  async searchRules(query: string) {
    const res = await fetch(`${this.baseUrl}/rules/search`, {
      method: "POST",
      headers: this.getHeaders(),
      credentials: "same-origin",
      body: JSON.stringify({ query })
    });
    return this.handleResponse(res);
  }
}

export const api = new PromptForgeApiClient();
