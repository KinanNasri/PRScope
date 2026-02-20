import type { ChatMessage, ChatProvider, ModelInfo } from "./types.js";
import { withRetry } from "./retry.js";

interface AnthropicConfig {
    apiKey: string;
    model: string;
}

interface AnthropicResponse {
    content: Array<{ type: string; text: string }>;
}

interface AnthropicModelsResponse {
    data: Array<{ id: string; display_name: string; created_at?: string }>;
}

const ANTHROPIC_API = "https://api.anthropic.com";
const ANTHROPIC_VERSION = "2023-06-01";

export function createAnthropicProvider(config: AnthropicConfig): ChatProvider {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
    };

    return {
        async chat(messages: ChatMessage[]): Promise<string> {
            return withRetry(async () => {
                const systemMsg = messages.find((m) => m.role === "system");
                const userMessages = messages
                    .filter((m) => m.role !== "system")
                    .map((m) => ({ role: m.role, content: m.content }));

                const response = await fetch(`${ANTHROPIC_API}/v1/messages`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        model: config.model,
                        max_tokens: 4096,
                        system: systemMsg?.content ?? "",
                        messages: userMessages,
                    }),
                });

                if (!response.ok) {
                    const body = await response.text().catch(() => "unknown");
                    throw new Error(`Anthropic API error ${response.status}: ${body}`);
                }

                const data = (await response.json()) as AnthropicResponse;
                const textBlock = data.content.find((c) => c.type === "text");

                if (!textBlock?.text) throw new Error("Empty response from Anthropic");
                return textBlock.text;
            });
        },

        async listModels(): Promise<ModelInfo[]> {
            try {
                const response = await fetch(`${ANTHROPIC_API}/v1/models`, { headers });

                if (!response.ok) return getAnthropicFallbackModels();

                const data = (await response.json()) as AnthropicModelsResponse;

                return data.data
                    .map((m) => ({
                        id: m.id,
                        name: m.display_name || m.id,
                        created: m.created_at ? new Date(m.created_at).getTime() / 1000 : undefined,
                    }))
                    .sort((a, b) => (b.created ?? 0) - (a.created ?? 0));
            } catch {
                return getAnthropicFallbackModels();
            }
        },
    };
}

function getAnthropicFallbackModels(): ModelInfo[] {
    return [
        { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4" },
        { id: "claude-haiku-4-20250514", name: "Claude Haiku 4" },
        { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
        { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku" },
        { id: "claude-3-opus-20240229", name: "Claude 3 Opus" },
    ];
}
