interface RateLimitConfig {
    uniqueTokenPerInterval: number;
    interval: number;
}

export class RateLimiter {
    private tokenCache: Map<string, number[]>;
    private uniqueTokenPerInterval: number;
    private interval: number;

    constructor(config: RateLimitConfig) {
        this.tokenCache = new Map();
        this.uniqueTokenPerInterval = config.uniqueTokenPerInterval;
        this.interval = config.interval;
    }

    check(limit: number, token: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const now = Date.now();
            const tokenCount = this.tokenCache.get(token) || [0];

            // Filter out timestamps that are outside the current interval
            const validTimestamps = tokenCount.filter((timestamp) => now - timestamp < this.interval);

            if (validTimestamps.length >= limit) {
                // Rate limit exceeded
                return reject();
            }

            // Add current timestamp
            validTimestamps.push(now);
            this.tokenCache.set(token, validTimestamps);

            // Cleanup mechanism: if map is too big, clear it (simple LRU-ish behavior)
            if (this.tokenCache.size > this.uniqueTokenPerInterval) {
                const keysToDelete = Array.from(this.tokenCache.keys()).slice(0, 100); // Delete oldest 100 keys (approx) - Map keys are insertion ordered
                keysToDelete.forEach(k => this.tokenCache.delete(k));
            }

            return resolve();
        });
    }
}
