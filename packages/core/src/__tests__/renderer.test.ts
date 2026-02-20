import { describe, it, expect } from "vitest";
import { renderComment, renderFallbackComment } from "../renderer.js";
import type { ReviewResult } from "../types.js";
import { PRISM_COMMENT_MARKER } from "../types.js";

describe("renderComment", () => {
    const result: ReviewResult = {
        summary: "This PR refactors the auth module for better separation of concerns.",
        overall_risk: "medium",
        findings: [
            {
                file: "src/auth.ts",
                line: 15,
                severity: "high",
                category: "security",
                title: "Unvalidated redirect URL",
                message: "The redirect URL is taken directly from user input without validation.",
                suggestion: "Validate against an allowlist of known redirect destinations.",
                confidence: 0.92,
            },
            {
                file: "src/utils.ts",
                line: null,
                severity: "low",
                category: "maintainability",
                title: "Unused import",
                message: "The lodash import is no longer used after the refactor.",
                suggestion: "Remove the unused import.",
                confidence: 0.99,
            },
        ],
        praise: ["Great test coverage on the new auth flow."],
    };

    it("includes the marker", () => {
        const comment = renderComment(result);
        expect(comment).toContain(PRISM_COMMENT_MARKER);
    });

    it("shows the risk badge", () => {
        const comment = renderComment(result);
        expect(comment).toContain("🟡 Medium Risk");
    });

    it("includes the summary", () => {
        const comment = renderComment(result);
        expect(comment).toContain("refactors the auth module");
    });

    it("renders findings in a table", () => {
        const comment = renderComment(result);
        expect(comment).toContain("| Severity |");
        expect(comment).toContain("Unvalidated redirect URL");
        expect(comment).toContain("Unused import");
    });

    it("sorts findings by severity (high first)", () => {
        const comment = renderComment(result);
        const highIdx = comment.indexOf("Unvalidated redirect URL");
        const lowIdx = comment.indexOf("Unused import");
        expect(highIdx).toBeLessThan(lowIdx);
    });

    it("includes collapsible details", () => {
        const comment = renderComment(result);
        expect(comment).toContain("<details>");
        expect(comment).toContain("Detailed Findings");
    });

    it("includes praise section", () => {
        const comment = renderComment(result);
        expect(comment).toContain("What looks great");
        expect(comment).toContain("Great test coverage");
    });

    it("handles empty findings gracefully", () => {
        const clean: ReviewResult = { summary: "All good.", overall_risk: "low", findings: [], praise: [] };
        const comment = renderComment(clean);
        expect(comment).toContain("looks great");
        expect(comment).toContain("🟢 Low Risk");
    });
});

describe("renderFallbackComment", () => {
    it("includes the marker", () => {
        const comment = renderFallbackComment("parse error");
        expect(comment).toContain(PRISM_COMMENT_MARKER);
    });

    it("shows the error reason", () => {
        const comment = renderFallbackComment("JSON parse failed");
        expect(comment).toContain("JSON parse failed");
    });

    it("provides helpful context", () => {
        const comment = renderFallbackComment("error");
        expect(comment).toContain("could not produce a structured review");
    });
});
