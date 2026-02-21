<div align="center">

# PRism

**See through your pull requests.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

AI-powered pull request reviews that catch bugs, flag security risks, and surface real issues — not noise.

</div>

---

## 60-Second Setup

```bash
npx prism-review init
```

The wizard will:

1. Ask your LLM provider (OpenAI, Anthropic, Ollama, or any OpenAI-compatible endpoint)
2. Auto-detect available models and let you pick from a searchable list
3. Generate `prism.config.json` and `.github/workflows/prism.yml`

Then add your API key as a repo secret, commit, open a PR, and watch.

---

## Features

**Multi-Provider Support** — OpenAI, Anthropic, Ollama, LM Studio, vLLM, and any `/v1/chat/completions` endpoint.

**Auto-Model Detection** — No guessing model names. PRism fetches available models and shows a searchable picker during setup.

**Structured Reviews** — Every review is typed, validated against a Zod schema, and rendered as a clean PR comment with risk levels and categorized findings.

**Review Profiles** — `balanced`, `security`, `performance`, or `strict` — tune the reviewer to what matters for your project.

**Zero Spam** — One comment per PR, updated in place. No notification storms.

**Noise Filtering** — Lockfiles, build artifacts, vendored code, and binaries are automatically skipped. Large diffs are truncated with markers.

**Secure by Default** — Secrets never logged. Uses `pull_request` event (not `pull_request_target`). Defensive validation everywhere.

---

## Demo

<!-- TODO: Add demo GIF showing a PRism review comment on a real PR -->

*Coming soon.*

---

## How It Works

```
PR Opened → Action Triggers → PRism reads changed files
    → Filters noise → Builds prompt (profile-aware)
    → Calls LLM → Validates response (Zod)
    → Renders Markdown → Posts/updates on PR
```

PRism produces a single, high-signal comment with:

- **Risk level** — Low, Medium, or High
- **Findings table** — severity, category, location
- **Collapsible details** — reasoning and suggestions
- **Praise** — good patterns worth calling out

---

## Providers

| Provider | Models API | Chat API | Notes |
|----------|-----------|----------|-------|
| **OpenAI** | `GET /v1/models` | `POST /v1/chat/completions` | Featured: gpt-4.1, o3, o4-mini |
| **Anthropic** | `GET /v1/models` | `POST /v1/messages` | Newest-first sort, fallback list |
| **OpenAI-compatible** | `GET /v1/models` | `POST /v1/chat/completions` | LM Studio, vLLM, text-gen-webui |
| **Ollama** | `GET /api/tags` | `POST /api/chat` | Local models, recommended picks |

All providers include retry with exponential backoff, configurable timeouts, and secret sanitization.

---

## Configuration

### `prism.config.json`

```json
{
  "provider": "openai",
  "model": "gpt-4.1",
  "apiKeyEnv": "OPENAI_API_KEY",
  "profile": "balanced",
  "commentMode": "summary-only",
  "maxFiles": 30,
  "maxDiffBytes": 100000
}
```

Also supports `.prismrc.json`.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `provider` | `openai \| anthropic \| openai-compat \| ollama` | — | LLM provider |
| `model` | `string` | — | Model identifier |
| `apiKeyEnv` | `string` | — | Env var name for the API key |
| `baseUrl` | `string?` | provider default | Custom API base URL |
| `profile` | `balanced \| security \| performance \| strict` | `balanced` | Review focus |
| `commentMode` | `summary-only \| inline+summary` | `summary-only` | Comment style |
| `maxFiles` | `number` | `30` | Max files to review |
| `maxDiffBytes` | `number` | `100000` | Max total diff size |

### Action Inputs

All config fields can be overridden via action inputs:

```yaml
- uses: KinanNasri/PRism/packages/action@main
  with:
    provider: openai
    model: gpt-4.1
    api_key_env: OPENAI_API_KEY
    profile: strict
    config_path: prism.config.json
```

---

## Security

- **Secrets** are read from environment variables and never logged.
- **Event safety**: uses `pull_request` (not `pull_request_target`) to prevent untrusted code from accessing secrets.
- **Validation**: all LLM responses are validated with Zod. Invalid responses produce a safe fallback comment.
- **Token scope**: `GITHUB_TOKEN` is used only for reading PR files and posting comments.
- **Rate limiting**: retry logic respects rate limits with exponential backoff.

See [SECURITY.md](SECURITY.md) for the vulnerability disclosure policy.

---

## Roadmap

- [ ] Inline review comments (file-level annotations)
- [ ] PR description analysis
- [ ] Custom review rules via config
- [ ] Review caching (skip re-reviews on unchanged commits)
- [ ] Dashboard and analytics
- [ ] VS Code extension
- [ ] GitLab and Bitbucket support

---

## Architecture

```
packages/
├── core/          Review engine, providers, types, schemas
│   └── src/
│       ├── types.ts           Shared type definitions
│       ├── schema.ts          Zod schemas
│       ├── config.ts          Config loader
│       ├── diff.ts            Diff parser + filter
│       ├── prompt.ts          Prompt builder
│       ├── engine.ts          Review orchestrator
│       ├── renderer.ts        Markdown renderer
│       ├── hash.ts            Cache key utility
│       └── providers/
│           ├── openai.ts
│           ├── anthropic.ts
│           ├── openai-compat.ts
│           ├── ollama.ts
│           ├── factory.ts
│           └── retry.ts
├── cli/           Interactive setup wizard
│   └── src/
│       ├── index.ts
│       ├── ui.ts
│       ├── commands/
│       │   ├── init.ts
│       │   └── init-prompts.ts
│       └── generators/
│           ├── config.ts
│           └── workflow.ts
└── action/        GitHub Action entry
    └── src/
        ├── index.ts
        └── github.ts
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, PR guidelines, and code style.

## License

[MIT](LICENSE)
