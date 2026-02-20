export interface RetryOptions {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
    timeoutMs: number;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30_000,
    timeoutMs: 120_000,
};

export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = DEFAULT_RETRY_OPTIONS,
): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

            try {
                const result = await fn();
                return result;
            } finally {
                clearTimeout(timeout);
            }
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            if (attempt === options.maxRetries) break;

            const jitter = Math.random() * 0.3 + 0.85;
            const delay = Math.min(
                options.baseDelayMs * Math.pow(2, attempt) * jitter,
                options.maxDelayMs,
            );
            await sleep(delay);
        }
    }

    throw lastError ?? new Error("Retry exhausted with no error captured");
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
        if (/auth|key|token|secret/i.test(key)) {
            sanitized[key] = "[REDACTED]";
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}
