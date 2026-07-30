export interface ApiError {
  code: string;
  message: string;
  cause?: string;
  suggestedFix?: string;
}

export class PromptForgeError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public cause?: string,
    public suggestedFix?: string
  ) {
    super(message);
    this.name = "PromptForgeError";
  }
}
