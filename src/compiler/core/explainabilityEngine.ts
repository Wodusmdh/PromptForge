import { randomUUID } from "crypto";
import { RequirementGraph, ReqNode, RequestContext, IntentGraph } from "../models/domain";
import { PromptGraph } from "./promptGraph";

export type DecisionType = 
  | "Accepted" 
  | "Rejected" 
  | "Optional" 
  | "Conflict" 
  | "Suggestion" 
  | "Normalization" 
  | "Duplicate Removal" 
  | "Ambiguity Warning" 
  | "Missing Information";

export interface DecisionEntry {
  id: string;
  timestamp: Date;
  component: string;
  decision: DecisionType;
  status: string;
  reason: string;
  evidence: string;
  confidence: number;
}

export interface ChangeEntry {
  id: string;
  original: string;
  compiled: string;
  changes: {
    added: string;
    reason: string;
  }[];
}

export class PromptExplainabilityEngine {
  private decisionLog: DecisionEntry[] = [];
  private changeHistory: ChangeEntry[] = [];

  public logDecision(entry: Omit<DecisionEntry, "id" | "timestamp">) {
    this.decisionLog.push({
      id: randomUUID(),
      timestamp: new Date(),
      ...entry
    });
  }

  public logChange(entry: Omit<ChangeEntry, "id">) {
    this.changeHistory.push({
      id: randomUUID(),
      ...entry
    });
  }

  public generateExplanations(context: RequestContext, reqs: RequirementGraph, graph: PromptGraph) {
    // Normalization
    if (context.rawInput !== context.normalizedText) {
      this.logDecision({
        component: "RequestParser",
        decision: "Normalization",
        status: "Applied",
        reason: "Normalized input text.",
        evidence: context.rawInput,
        confidence: 100
      });
    }

    // Requirements
    if (reqs && reqs.nodes) {
      reqs.nodes.forEach(req => {
        let decision: DecisionType = "Accepted";
        if (req.status === "Rejected") decision = "Rejected";
        else if (req.status === "Optional") decision = "Optional";
        else if (req.status === "Conflict") decision = "Conflict";
        else if (req.status === "Missing Information") decision = "Missing Information";

        this.logDecision({
          component: "RequirementExtractor",
          decision: decision,
          status: req.status || "Unknown",
          reason: req.reason || "Processed requirement.",
          evidence: req.evidence || req.text || "None",
          confidence: req.confidence || 0
        });

        if (req.duplicateCount && req.duplicateCount > 1) {
          this.logDecision({
            component: "RequirementExtractor",
            decision: "Duplicate Removal",
            status: "Removed",
            reason: "Detected duplicate requirement.",
            evidence: req.text || "",
            confidence: 100
          });
        }
      });
    }

    // Ambiguities
    if (context.ambiguities && context.ambiguities.length > 0) {
      context.ambiguities.forEach(amb => {
        this.logDecision({
          component: "PromptAnalyzer",
          decision: "Ambiguity Warning",
          status: "Warning",
          reason: "Vague wording detected.",
          evidence: amb,
          confidence: 100
        });
      });
    }
    
    // Simulate change tracking for testing
    this.logChange({
      original: "Explain API.",
      compiled: "Explain what an API is to a beginner using simple language and headings.",
      changes: [
        { added: "headings", reason: "Explicit user request." },
        { added: "beginner language", reason: "Detected beginner audience." }
      ]
    });
  }

  public getDecisionLog() { return this.decisionLog; }
  public getChangeHistory() { return this.changeHistory; }

  public getRejectedItems() {
    return this.decisionLog.filter(d => d.decision === "Rejected");
  }

  public getAcceptedItems() {
    return this.decisionLog.filter(d => d.decision === "Accepted");
  }

  public getConflicts() {
    return this.decisionLog.filter(d => d.decision === "Conflict");
  }

  public getSuggestions() {
    return this.decisionLog.filter(d => d.decision === "Suggestion");
  }
}
