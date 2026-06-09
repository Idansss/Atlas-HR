import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MarkdownContent } from "@/components/ai/markdown-content";
import { AiMarkdown } from "@/components/ai/ai-markdown";

// Regression guard: certain lines (H4+ headings, "#tag", and "⚠️ …" lines that
// are NOT the LEGAL REVIEW callout) match no block rule AND are rejected by the
// paragraph collector. Without a fallback that advances the cursor, the render
// loop never terminates and freezes the browser tab. These tests would hang
// (and fail by timeout) if the infinite loop regressed.
const PATHOLOGICAL = [
  "#### Subheading four",
  "##### Subheading five",
  "#tag-without-space",
  "⚠️ Warning: this is not a legal review line",
  "Normal paragraph after the tricky lines.",
].join("\n");

describe("markdown renderers terminate on pathological input", () => {
  it("MarkdownContent renders H4/#tag/⚠️ lines without hanging", () => {
    const html = renderToStaticMarkup(<MarkdownContent text={PATHOLOGICAL} />);
    expect(html).toContain("Subheading four");
    expect(html).toContain("Warning: this is not a legal review line");
    expect(html).toContain("Normal paragraph after the tricky lines.");
  });

  it("AiMarkdown renders the same input without hanging", () => {
    const html = renderToStaticMarkup(<AiMarkdown text={PATHOLOGICAL} />);
    expect(html).toContain("Subheading four");
    expect(html).toContain("Normal paragraph after the tricky lines.");
  });

  it("still renders the LEGAL REVIEW callout and normal headings", () => {
    const html = renderToStaticMarkup(
      <MarkdownContent text={"# Title\n## Section\n⚠️ LEGAL REVIEW: Verify with counsel."} />
    );
    expect(html).toContain("Title");
    expect(html).toContain("Legal Review Recommended");
  });
});
