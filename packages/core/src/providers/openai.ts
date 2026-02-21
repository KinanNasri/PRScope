import type { ChatMessage, ChatProvider, ModelInfo } from "./types.js";
import { withRetry } from "./retry.js";

interface OpenAIConfig {
    apiKey: string;
    baseUrl: string;
    model: string;
}

interface OpenAIChatResponse {
    choices: Array<{ message: { content: string } }>;
}

interface OpenAIModelsResponse {
    data: Array<{ id: string; created?: number; owned_by?: string }>;
}

const FEATURED_MODELS = new Set([
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
    "gpt-4o",
    "gpt-4o-mini",
    "o3",
    "o3-mini",
    "o4-mini",
]);

export function createOpenAIProvider(config: OpenAIConfig): ChatProvider {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
    };

    return {
        async chat(messages: ChatMessage[]): Promise<string> {
            return withRetry(async () => {
                const response = await fetch(`${config.baseUrl}/v1/chat/completions`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        model: config.model,
                        messages,
                        temperature: 0.2,
                        response_format: { type: "json_object" },
                    }),
                });

                if (!response.ok) {
                    const body = await response.text().catch(() => "unknown");
                    throw new Error(`OpenAI API error ${response.status}: ${body}`);
                }

                const data = (await response.json()) as OpenAIChatResponse;
                const content = data.choices[0]?.message?.content;

                if (!content) throw new Error("Empty response from OpenAI");
                return content;
            });
        },

        async listModels(): Promise<ModelInfo[]> {
            const response = await fetch(`${config.baseUrl}/v1/models`, { headers });

            if (!response.ok) return [];

            const data = (await response.json()) as OpenAIModelsResponse;

            return data.data
                .map((m) => ({
                    id: m.id,
                    name: m.id,
                    created: m.created,
                    owned_by: m.owned_by,
                    featured: FEATURED_MODELS.has(m.id),
                }))
                .sort((a, b) => {
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return (b.created ?? 0) - (a.created ?? 0);
                });
        },
    };
}
