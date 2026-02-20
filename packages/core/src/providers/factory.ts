import type { ChatProvider, PrismConfig } from "../types.js";
import { createOpenAIProvider } from "./openai.js";
import { createAnthropicProvider } from "./anthropic.js";
import { createOpenAICompatProvider } from "./openai-compat.js";
import { createOllamaProvider } from "./ollama.js";

export function createProvider(config: PrismConfig): ChatProvider {
    const apiKey = resolveApiKey(config.apiKeyEnv);

    switch (config.provider) {
        case "openai":
            return createOpenAIProvider({
                apiKey,
                baseUrl: config.baseUrl ?? "https://api.openai.com",
                model: config.model,
            });

        case "anthropic":
            return createAnthropicProvider({
                apiKey,
                model: config.model,
            });

        case "openai-compat":
            if (!config.baseUrl) {
                throw new Error("baseUrl is required for openai-compat provider");
            }
            return createOpenAICompatProvider({
                apiKey,
                baseUrl: config.baseUrl,
                model: config.model,
            });

        case "ollama":
            return createOllamaProvider({
                host: config.baseUrl ?? "http://localhost:11434",
                model: config.model,
            });

        default: {
            const _exhaustive: never = config.provider;
            throw new Error(`Unknown provider: ${_exhaustive}`);
        }
    }
}

function resolveApiKey(envVarName: string): string {
    const value = process.env[envVarName];

    if (!value && envVarName !== "OLLAMA_HOST") {
        throw new Error(
            `Missing API key: environment variable "${envVarName}" is not set.`,
        );
    }

    return value ?? "";
}
