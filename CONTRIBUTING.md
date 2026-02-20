# Contributing to PRism

Thanks for your interest. Here's how to get going.

## Dev Setup

```bash
git clone https://github.com/prism-review/prism.git
cd prism
pnpm install
pnpm run build
```

This is a pnpm workspace with three packages:

- `packages/core` — review engine, providers, types
- `packages/cli` — interactive setup wizard
- `packages/action` — GitHub Action entry point

## Making Changes

1. Fork the repo and create a feature branch.
2. Make changes in the appropriate package.
3. Run `pnpm run typecheck` to verify types.
4. Run `pnpm run build` to check compilation.
5. Run `pnpm run test` if you're touching core logic.
6. Open a PR with a clear description of what changed and why.

## Code Style

- Strict TypeScript — no `any`, no `@ts-ignore`.
- Small focused modules. One concern per file.
- Meaningful names. If a function name reads like a sentence, it doesn't need a comment.
- Errors are values. Handle them explicitly, never swallow silently.
- No heavy dependencies. Every `npm install` is a decision.

## PR Guidelines

- Keep PRs small and focused. One concern per PR.
- Write a clear title and description.
- Reference related issues if applicable.
- Make sure CI passes before requesting review.

## Testing

Tests live alongside source files or in `__tests__` directories. We use Vitest:

```bash
pnpm run test           # all packages
pnpm --filter @prism-review/core run test  # core only
```

Focus testing on:
- Diff parsing and filtering
- Schema validation (valid + invalid payloads)
- Markdown rendering output

## Questions?

Open an issue. We're friendly.
