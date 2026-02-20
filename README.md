<div align="center">

# 🔬 PRism

**See through your pull requests.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

AI-powered pull request reviews that catch bugs, flag security risks, and surface real issues — not noise.

</div>

---

## ⚡ 60-Second Setup

```bash
npx prism init
```

That's it. The wizard will:

1. Ask your LLM provider (OpenAI, Anthropic, Ollama, or any OpenAI-compatible endpoint)
2. **Auto-detect available models** and let you pick from a searchable list
3. Generate `prism.config.json` and `.github/workflows/prism.yml`

Then: add your API key as a repo secret, commit, open a PR, and watch PRism review your code.

---

## ✨ Features

**🤖 Multi-Provider Support** — OpenAI, Anthropic, Ollama, LM Studio, vLLM, and any `/v1/chat/completions` endpoint.

**🔍 Auto-Model Detection** — No guessing model names. PRism fetches available models and shows a searchable list during setup.

**📊 Structured Reviews** — Every review is typed, validated with Zod, and rendered as a clean GitHub comment with risk badges and categorized findings.

**🎯 Review Profiles** — `balanced`, `security`, `performance`, or `strict` — tune PRism to what matters for your project.

**🔇 Zero Spam** — One comment per PR, updated in place. No notification storms, no clutter.

**🧹 Noise Filtering** — Lockfiles, build artifacts, vendored code, and binaries are automatically skipped. Large diffs are truncated with clear markers.

**🔒 Secure by Default** — Secrets never logged. Uses `pull_request` event (not `pull_request_target`). Defensive validation everywhere.

---

## 📸 Demo

<!-- TODO: Add demo GIF showing a PRism review comment on a real PR -->
<!-- ![PRism Review Demo](assets/demo.gif) -->

*Coming soon — PRism review on a real pull request.*

---

## 🏗️ How It Works

```
PR Opened → GitHub Action Triggers → PRism reads changed files
    → Filters noise → Builds prompt (profile-aware)
    → Calls LLM → Validates response (Zod)
    → Renders Markdown comment → Posts/updates on PR
```

PRism produces a single, high-signal comment with:

- **Risk badge** — 🟢 Low / 🟡 Medium / 🔴 High
- **Findings table** — severity, category, location
- **Collapsible details** — reasoning and suggestions
- **Praise** — good patterns called out

---

## 🔌 Providers

| Provider | Models API | Chat API | Notes |
|----------|-----------|----------|-------|
| **OpenAI** | `GET /v1/models` | `POST /v1/chat/completions` | Featured models: gpt-4o, o1, o3-mini |
| **Anthropic** | `GET /v1/models` | `POST /v1/messages` | Newest-first sorting, fallback list |
| **OpenAI-compatible** | `GET /v1/models` | `POST /v1/chat/completions` | LM Studio, vLLM, text-gen-webui |
| **Ollama** | `GET /api/tags` | `POST /api/chat` | Local models, recommended picks |

All providers include:
- Retry with exponential backoff + jitter
- Configurable timeouts
- Secret sanitization (keys never logged)
- Graceful fallback if model listing fails

---

## ⚙️ Configuration

### `prism.config.json`

```json
{
  "provider": "openai",
  "model": "gpt-4o",
  "apiKeyEnv": "OPENAI_API_KEY",
  "profile": "balanced",
  "commentMode": "summary-only",
  "maxFiles": 30,
  "maxDiffBytes": 100000
}
```

PRism also reads `.prismrc.json` — use whichever you prefer.

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
- uses: ./packages/action
  with:
    provider: openai
    model: gpt-4o
    api_key_env: OPENAI_API_KEY
    profile: strict
    config_path: prism.config.json
```

---

## 🔒 Security

- **Secrets**: API keys are read from environment variables, never hardcoded or logged.
- **Event safety**: Uses `pull_request` (not `pull_request_target`) to prevent untrusted code access to secrets.
- **Validation**: All LLM responses are validated with Zod schemas. Invalid responses produce a safe fallback comment.
- **Token scope**: `GITHUB_TOKEN` is used only for reading PR files and posting comments.
- **Rate limiting**: Retry logic respects rate limits with exponential backoff.

See [SECURITY.md](SECURITY.md) for our vulnerability disclosure policy.

---

## 🗺️ Roadmap

- [ ] Inline review comments (file-level annotations)
- [ ] PR description analysis
- [ ] Custom review rules via config
- [ ] Review caching (skip re-reviews for unchanged commits)
- [ ] Dashboard + analytics
- [ ] VS Code extension
- [ ] Support for GitLab and Bitbucket

---

## 🏛️ Architecture

```
packages/
├── core/          # Review engine, providers, types, schemas
│   └── src/
│       ├── types.ts           # Shared type definitions
│       ├── schema.ts          # Zod schemas
│       ├── config.ts          # Config loader
│       ├── diff.ts            # Diff parser + filter
│       ├── prompt.ts          # Prompt builder
│       ├── engine.ts          # Review orchestrator
│       ├── renderer.ts        # Markdown renderer
│       ├── hash.ts            # Cache key utility
│       └── providers/
│           ├── openai.ts
│           ├── anthropic.ts
│           ├── openai-compat.ts
│           ├── ollama.ts
│           ├── factory.ts
│           └── retry.ts
├── cli/           # Interactive setup wizard
│   └── src/
│       ├── index.ts
│       ├── ui.ts
│       ├── commands/
│       │   ├── init.ts
│       │   └── init-prompts.ts
│       └── generators/
│           ├── config.ts
│           └── workflow.ts
└── action/        # GitHub Action entry
    └── src/
        ├── index.ts
        └── github.ts
```

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, PR guidelines, and code style.

## 📄 License

[MIT](LICENSE) — do whatever you want.
