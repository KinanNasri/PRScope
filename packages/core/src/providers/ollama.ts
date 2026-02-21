import type { ChatMessage, ChatProvider, ModelInfo } from "./types.js";
import { withRetry } from "./retry.js";

interface OllamaConfig {
    host: string;
    model: string;
}

interface OllamaChatResponse {
    message: { content: string };
}

interface OllamaTagsResponse {
    models: Array<{
        name: string;
        modified_at: string;
        size: number;
        details?: { family?: string; parameter_size?: string };
    }>;
}

const RECOMMENDED_MODELS = [
    "llama3.3:70b",
    "llama3.2:8b",
    "qwen2.5-coder:32b",
    "qwen2.5-coder:7b",
    "deepseek-r1:14b",
    "deepseek-coder-v2:16b",
    "codestral:22b",
    "mistral-small:22b",
];

export function createOllamaProvider(config: OllamaConfig): ChatProvider {
    const host = config.host.replace(/\/+$/, "");

    return {
        async chat(messages: ChatMessage[]): Promise<string> {
            return withRetry(async () => {
                const response = await fetch(`${host}/api/chat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        model: config.model,
                        messages,
                        stream: false,
                        options: { temperature: 0.2 },
                    }),
                });

                if (!response.ok) {
                    const body = await response.text().catch(() => "unknown");
                    throw new Error(`Ollama error ${response.status}: ${body}`);
                }

                const data = (await response.json()) as OllamaChatResponse;
                if (!data.message?.content) throw new Error("Empty response from Ollama");
                return data.message.content;
            });
        },

        async listModels(): Promise<ModelInfo[]> {
            try {
                const response = await fetch(`${host}/api/tags`);
                if (!response.ok) return [];

                const data = (await response.json()) as OllamaTagsResponse;
                return data.models.map((m) => ({
                    id: m.name,
                    name: m.name,
                    created: new Date(m.modified_at).getTime() / 1000,
                    owned_by: m.details?.family,
                }));
            } catch {
                return [];
            }
        },
    };
}

export { RECOMMENDED_MODELS as OLLAMA_RECOMMENDED_MODELS };
