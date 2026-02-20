import { createHash } from "node:crypto";
import type { PrismConfig } from "./types.js";

export function computeReviewHash(diffContent: string, config: PrismConfig): string {
    const input = JSON.stringify({
        diff: diffContent,
        model: config.model,
        provider: config.provider,
        profile: config.profile,
    });

    return createHash("sha256").update(input).digest("hex").slice(0, 16);
}
