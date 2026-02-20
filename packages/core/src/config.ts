import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseConfig } from "./schema.js";
import type { PrismConfig } from "./types.js";
import { CONFIG_FILENAMES, DEFAULT_CONFIG } from "./types.js";

export async function loadConfig(cwd = process.cwd()): Promise<PrismConfig> {
    for (const filename of CONFIG_FILENAMES) {
        const filepath = resolve(cwd, filename);
        try {
            const raw = await readFile(filepath, "utf-8");
            const parsed = JSON.parse(raw) as unknown;
            return parseConfig(parsed);
        } catch {
            continue;
        }
    }

    throw new Error(
        `No PRism config found. Run \`npx prism init\` or create ${CONFIG_FILENAMES.join(" / ")} in your project root.`,
    );
}

export function resolveConfig(overrides: Partial<PrismConfig>, base?: Partial<PrismConfig>): PrismConfig {
    const merged = { ...DEFAULT_CONFIG, ...base, ...overrides };
    return parseConfig(merged);
}
