import type { ChatMessage, ChatProvider, ModelInfo } from "./types.js";
import { withRetry } from "./retry.js";

interface OpenAICompatConfig {
    apiKey: string;
    baseUrl: string;
    model: string;
}

interface CompatChatResponse {
    choices: Array<{ message: { content: string } }>;
}

interface CompatModelsResponse {
    data: Array<{ id: string; created?: number; owned_by?: string }>;
}

export function createOpenAICompatProvider(config: OpenAICompatConfig): ChatProvider {
    const baseUrl = config.baseUrl.replace(/\/+$/, "");

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
    };

    return {
        async chat(messages: ChatMessage[]): Promise<string> {
            return withRetry(async () => {
                const response = await fetch(`${baseUrl}/v1/chat/completions`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        model: config.model,
                        messages,
                        temperature: 0.2,
                    }),
                });

                if (!response.ok) {
                    const body = await response.text().catch(() => "unknown");
                    throw new Error(`API error ${response.status}: ${body}`);
                }

                const data = (await response.json()) as CompatChatResponse;
                const content = data.choices[0]?.message?.content;

                if (!content) throw new Error("Empty response from endpoint");
                return content;
            });
        },

        async listModels(): Promise<ModelInfo[]> {
            try {
                const response = await fetch(`${baseUrl}/v1/models`, { headers });

                if (!response.ok) return [];

                const data = (await response.json()) as CompatModelsResponse;
                return data.data.map((m) => ({
                    id: m.id,
                    name: m.id,
                    created: m.created,
                    owned_by: m.owned_by,
                }));
            } catch {
                return [];
            }
        },
    };
}
