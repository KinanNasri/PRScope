import { z } from "zod";

const SeveritySchema = z.enum(["low", "medium", "high"]);
const RiskLevelSchema = z.enum(["low", "medium", "high"]);
const CategorySchema = z.enum(["bug", "security", "performance", "maintainability", "dx"]);
const ProviderTypeSchema = z.enum(["openai", "anthropic", "openai-compat", "ollama"]);
const ReviewProfileSchema = z.enum(["balanced", "security", "performance", "strict"]);
const CommentModeSchema = z.enum(["summary-only", "inline+summary"]);

export const FindingSchema = z.object({
    file: z.string(),
    line: z.number().nullable(),
    severity: SeveritySchema,
    category: CategorySchema,
    title: z.string(),
    message: z.string(),
    suggestion: z.string(),
    confidence: z.number().min(0).max(1),
});

export const ReviewResultSchema = z.object({
    summary: z.string(),
    overall_risk: RiskLevelSchema,
    findings: z.array(FindingSchema),
    praise: z.array(z.string()),
});

export const PrismConfigSchema = z.object({
    provider: ProviderTypeSchema,
    model: z.string().min(1),
    apiKeyEnv: z.string().min(1),
    baseUrl: z.string().url().optional(),
    profile: ReviewProfileSchema.default("balanced"),
    commentMode: CommentModeSchema.default("summary-only"),
    maxFiles: z.number().int().positive().default(30),
    maxDiffBytes: z.number().int().positive().default(100_000),
    configPath: z.string().optional(),
});

export function parseReviewResult(raw: unknown): z.infer<typeof ReviewResultSchema> | null {
    const result = ReviewResultSchema.safeParse(raw);
    return result.success ? result.data : null;
}

export function parseConfig(raw: unknown): z.infer<typeof PrismConfigSchema> {
    return PrismConfigSchema.parse(raw);
}
