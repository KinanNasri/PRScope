import { prepareDiffs, buildDiffBlock } from "./diff.js";
import { buildSystemPrompt, buildUserPrompt } from "./prompt.js";
import { parseReviewResult } from "./schema.js";
import { renderComment, renderFallbackComment } from "./renderer.js";
import { createProvider } from "./providers/factory.js";
import { computeReviewHash } from "./hash.js";
import type { PrismConfig, PullRequestFile, ReviewResult } from "./types.js";

export interface EngineResult {
    comment: string;
    review: ReviewResult | null;
    hash: string;
    truncated: boolean;
}

export async function runReview(
    config: PrismConfig,
    files: PullRequestFile[],
): Promise<EngineResult> {
    const { filtered, totalBytes } = prepareDiffs(files, config.maxFiles, config.maxDiffBytes);
    const truncated = totalBytes >= config.maxDiffBytes;

    if (filtered.length === 0) {
        const fallback: ReviewResult = {
            summary: "No reviewable files found in this PR — all changes are in generated, binary, or dependency files.",
            overall_risk: "low",
            findings: [],
            praise: [],
        };

        return {
            comment: renderComment(fallback),
            review: fallback,
            hash: computeReviewHash("empty", config),
            truncated: false,
        };
    }

    const diffBlock = buildDiffBlock(filtered);
    const hash = computeReviewHash(diffBlock, config);

    const provider = createProvider(config);
    const systemPrompt = buildSystemPrompt(config);
    const userPrompt = buildUserPrompt(diffBlock);

    const rawResponse = await provider.chat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
    ]);

    const parsed = extractAndParseJson(rawResponse);
    const review = parseReviewResult(parsed);

    if (!review) {
        return {
            comment: renderFallbackComment("Could not parse structured output from the model."),
            review: null,
            hash,
            truncated,
        };
    }

    return {
        comment: renderComment(review),
        review,
        hash,
        truncated,
    };
}

function extractAndParseJson(raw: string): unknown {
    const trimmed = raw.trim();

    const fenced = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    const toParse = fenced ? fenced[1]! : trimmed;

    try {
        return JSON.parse(toParse);
    } catch {
        return null;
    }
}
