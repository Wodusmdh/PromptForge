import crypto from "crypto";

interface BrowserSession {
  id: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

class BrowserSessionManager {
  private sessions = new Map<string, BrowserSession>();

  private getTtlMs(): number {
    const configured = process.env.PROMPTFORGE_BROWSER_SESSION_TTL_MS;
    if (configured) {
      return parseInt(configured, 10);
    }
    return 24 * 60 * 60 * 1000;
  }

  public createSession(): BrowserSession {
    const id = crypto.randomBytes(32).toString("hex");
    const userId = `browser_${crypto.randomBytes(8).toString("hex")}`;
    const now = Date.now();
    const expiresAt = now + this.getTtlMs();

    const session: BrowserSession = {
      id,
      userId,
      createdAt: now,
      expiresAt,
    };

    this.sessions.set(id, session);
    return session;
  }

  public getSession(id: string): BrowserSession | undefined {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    if (Date.now() > session.expiresAt) {
      this.sessions.delete(id);
      return undefined;
    }

    return session;
  }

  public deleteSession(id: string): void {
    this.sessions.delete(id);
  }

  public cleanup(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(id);
      }
    }
  }
}

export const browserSessionManager = new BrowserSessionManager();
