# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in PRism, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, email **security@prism-review.dev** with:

1. A description of the vulnerability.
2. Steps to reproduce.
3. Any relevant logs or screenshots (redact secrets).

We'll acknowledge receipt within 48 hours and aim to resolve critical issues within 7 days.

## Security Design

PRism follows these security principles:

- **Secrets are never logged.** API keys are read from environment variables and used only in Authorization headers. Request bodies and headers are sanitized before any diagnostic output.
- **Event model.** PRism uses `pull_request` events, not `pull_request_target`. This prevents untrusted PR code from accessing repository secrets.
- **Token scope.** `GITHUB_TOKEN` is used exclusively for reading PR metadata and posting comments. No write access to code.
- **Input validation.** All LLM responses are validated against Zod schemas. Invalid responses produce a safe fallback — no crashes, no code execution.
- **Dependency hygiene.** Minimal dependencies, regularly audited.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅         |
