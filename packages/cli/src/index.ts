import { runInit } from "./commands/init.js";
import * as ui from "./ui.js";

const HELP_TEXT = `
  Usage: prism <command>

  Commands:
    init    Set up PRism in your repository

  Options:
    --help  Show this help message

  Examples:
    npx prism init
    bunx prism init
`;

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command || command === "--help" || command === "-h") {
        ui.banner();
        console.log(HELP_TEXT);
        return;
    }

    if (command === "init") {
        await runInit();
        return;
    }

    ui.error(`Unknown command: ${command}`);
    console.log(HELP_TEXT);
    process.exitCode = 1;
}

main().catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    ui.error(message);
    process.exitCode = 1;
});
