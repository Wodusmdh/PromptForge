import { RuleDatabase } from "../database/ruleDb";
import { RuleIndexer } from "./indexer";
import { RuleRecord } from "../models/schema";

export interface SearchResult {
  rule: RuleRecord;
  score: number;
}

export class SearchEngine {
  constructor(private db: RuleDatabase, private indexer: RuleIndexer) {}

  search(query: string, limit: number = 10): SearchResult[] {
    const ids = this.indexer.searchKeyword(query);
    const results: SearchResult[] = [];

    for (const id of ids) {
      const rule = this.db.get(id);
      if (rule && !rule.deprecated) {
        // Mock scoring: base score 1 + tag matches
        let score = 1;
        if (rule.title.toLowerCase().includes(query.toLowerCase())) score += 2;
        if (rule.tags.some(t => t.toLowerCase() === query.toLowerCase())) score += 3;
        
        results.push({ rule, score });
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}
