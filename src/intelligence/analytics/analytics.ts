export class RuleAnalytics {
  private usageCount = new Map<string, number>();

  recordUsage(ruleId: string): void {
    const count = this.usageCount.get(ruleId) || 0;
    this.usageCount.set(ruleId, count + 1);
  }

  getMostUsed(limit: number = 5): Array<{ id: string, count: number }> {
    const sorted = Array.from(this.usageCount.entries()).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, limit).map(([id, count]) => ({ id, count }));
  }
}
