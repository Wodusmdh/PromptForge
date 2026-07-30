import { RuleRecord } from "../models/schema";

export class RuleIndexer {
  private keywordIndex = new Map<string, Set<string>>(); // keyword -> rule ids
  
  index(rule: RuleRecord) {
    const text = `${rule.title} ${rule.description} ${rule.category} ${rule.tags.join(" ")}`.toLowerCase();
    const tokens = text.split(/\W+/).filter(t => t.length > 2);
    
    for (const token of tokens) {
      if (!this.keywordIndex.has(token)) {
        this.keywordIndex.set(token, new Set());
      }
      this.keywordIndex.get(token)!.add(rule.id);
    }
  }

  searchKeyword(keyword: string): string[] {
    const term = keyword.toLowerCase();
    const matches = new Set<string>();
    
    for (const [token, ids] of this.keywordIndex.entries()) {
      if (token.includes(term)) {
        for (const id of ids) matches.add(id);
      }
    }
    return Array.from(matches);
  }
}
