import crypto from "crypto";
import { CompiledPrompt } from "../../compiler/models/schemas";
import { ResolvedExecutionPlan, RuleSet } from "../../compiler/models/domain";

export interface SessionData {
  sessionId: string;
  ownerId: string;
  prompt: CompiledPrompt;
  plan: ResolvedExecutionPlan;
  rules: RuleSet;
  createdAt: number;
  lastAccessedAt: number;
}

const sessions = new Map<string, SessionData>();
const SESSION_TTL_MS = Number(process.env.PROMPTFORGE_SESSION_TTL_MS) || 1000 * 60 * 60; // default 1 hour

function cleanup() {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.lastAccessedAt > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
}

// Run cleanup periodically
setInterval(cleanup, 1000 * 60 * 5).unref(); // every 5 minutes

export class SessionStore {
  static createSession(ownerId: string, prompt: CompiledPrompt, plan: ResolvedExecutionPlan, rules: RuleSet): SessionData {
    const sessionId = crypto.randomUUID();
    const now = Date.now();
    const session: SessionData = {
      sessionId,
      ownerId,
      prompt,
      plan,
      rules,
      createdAt: now,
      lastAccessedAt: now,
    };
    sessions.set(sessionId, session);
    return session;
  }

  static getSession(sessionId: string, ownerId: string): SessionData | null | 'FORBIDDEN' {
    const session = sessions.get(sessionId);
    if (!session) {
      return null;
    }
    if (session.ownerId !== ownerId) {
      return 'FORBIDDEN';
    }
    session.lastAccessedAt = Date.now();
    return session;
  }

  static deleteSession(sessionId: string, ownerId: string): boolean {
    const session = sessions.get(sessionId);
    if (!session) return false;
    if (session.ownerId === ownerId) {
      sessions.delete(sessionId);
      return true;
    }
    return false;
  }
}
