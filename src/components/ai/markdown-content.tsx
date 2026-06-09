import type React from "react";

// Lightweight, dependency-free markdown renderer shared by the full /copilot
// page and the compact in-app Atlas AI widget so AI answers look identical in
// both: headings, rules, lists, blockquotes, code, and inline emphasis.

function inlineFormat(text: string, nextKey: () => number): React.ReactNode {
  const parts = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/);
  return (
    <>
      {parts.map((part) => {
        const k = nextKey();
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return <strong key={k} className="font-semibold text-navy-900">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2 && !part.startsWith("**")) {
          return <em key={k} className="italic text-navy-600">{part.slice(1, -1)}</em>;
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return <code key={k} className="bg-navy-100 text-navy-800 px-1.5 py-0.5 rounded text-[11px] font-mono">{part.slice(1, -1)}</code>;
        }
        return <span key={k}>{part}</span>;
      })}
    </>
  );
}

export function MarkdownContent({ text }: { text: string }) {
  let keyCounter = 0;
  function nextKey() { return keyCounter++; }
  function inlineFormatLocal(value: string) { return inlineFormat(value, nextKey); }
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Legal review flag
    if (line.startsWith("⚠️ LEGAL REVIEW:") || line.startsWith("⚠️ Legal review:")) {
      const msg = line.replace(/^⚠️ (LEGAL REVIEW|Legal review):?\s*/i, "").trim();
      elements.push(
        <div key={nextKey()} className="flex items-start gap-2.5 mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <svg className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-xs font-semibold text-amber-800">Legal Review Recommended</p>
            {msg && <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">{msg}</p>}
          </div>
        </div>
      );
      i++; continue;
    }

    // Fenced code block
    if (line.trimStart().startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={nextKey()} className="bg-navy-950 text-blue-300 rounded-xl p-4 text-xs font-mono overflow-x-auto my-3 leading-relaxed">
          {codeLines.join("\n")}
        </pre>
      );
      i++;
      continue;
    }

    // H1
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={nextKey()} className="font-bold text-base text-navy-900 mt-5 mb-2 pb-1.5 border-b border-navy-100">
          {inlineFormatLocal(line.slice(2))}
        </h1>
      );
      i++; continue;
    }
    // H2
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={nextKey()} className="font-semibold text-sm text-navy-900 mt-4 mb-1.5">
          {inlineFormatLocal(line.slice(3))}
        </h2>
      );
      i++; continue;
    }
    // H3
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={nextKey()} className="font-semibold text-sm text-navy-800 mt-3 mb-1">
          {inlineFormatLocal(line.slice(4))}
        </h3>
      );
      i++; continue;
    }

    // HR
    if (line.match(/^[-*_]{3,}$/)) {
      elements.push(<hr key={nextKey()} className="border-navy-200 my-4" />);
      i++; continue;
    }

    // Table — header row followed by a |---|---| separator row.
    if (
      line.includes("|") &&
      i + 1 < lines.length &&
      lines[i + 1].includes("-") &&
      /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1])
    ) {
      const parseRow = (l: string) =>
        l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      const headers = parseRow(line);
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        rows.push(parseRow(lines[i]));
        i++;
      }
      elements.push(
        <div key={nextKey()} className="my-3 overflow-x-auto rounded-xl border border-navy-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-navy-50">
                {headers.map((h) => (
                  <th key={nextKey()} className="px-3 py-2 text-left font-semibold text-navy-900 border-b border-navy-200">
                    {inlineFormatLocal(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={nextKey()} className="even:bg-navy-50/40">
                  {headers.map((_, ci) => (
                    <td key={nextKey()} className="px-3 py-2 align-top text-navy-700 border-b border-navy-100 last:border-b-0">
                      {inlineFormatLocal(row[ci] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Bullet list
    if (line.match(/^[-*+] /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*+] /)) {
        items.push(lines[i].replace(/^[-*+] /, ""));
        i++;
      }
      elements.push(
        <ul key={nextKey()} className="my-2 space-y-1 pl-5 list-disc marker:text-navy-400">
          {items.map((item) => (
            <li key={nextKey()} className="text-sm text-navy-700 leading-relaxed">{inlineFormatLocal(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (line.match(/^\d+[.)]\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+[.)]\s/)) {
        items.push(lines[i].replace(/^\d+[.)]\s/, ""));
        i++;
      }
      elements.push(
        <ol key={nextKey()} className="my-2 space-y-1.5 pl-5 list-decimal marker:text-navy-500 marker:font-semibold">
          {items.map((item) => (
            <li key={nextKey()} className="text-sm text-navy-700 leading-relaxed">{inlineFormatLocal(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const qLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        qLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote key={nextKey()} className="border-l-4 border-blue-300 bg-blue-50 pl-4 py-2 my-3 rounded-r-lg">
          {qLines.map((l) => <p key={nextKey()} className="text-sm text-navy-600 italic">{inlineFormatLocal(l)}</p>)}
        </blockquote>
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") { i++; continue; }

    // Paragraph
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].match(/^[-*+] /) &&
      !lines[i].match(/^\d+[.)]\s/) &&
      !lines[i].trimStart().startsWith("```") &&
      !lines[i].startsWith("> ") &&
      !lines[i].match(/^[-*_]{3,}$/) &&
      !lines[i].startsWith("⚠️")
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      elements.push(
        <p key={nextKey()} className="text-sm text-navy-700 leading-relaxed mb-2">
          {inlineFormatLocal(paraLines.join(" "))}
        </p>
      );
    } else {
      // Safety net: this line started with a marker we don't render as a block
      // (e.g. an H4 "#### ", a "#tag", or a "⚠️ …" line that isn't LEGAL
      // REVIEW), so the paragraph collector above consumed nothing. Render it
      // as plain text and advance — without this, `i` never moves and the
      // outer while-loop hangs the browser tab mid-stream.
      elements.push(
        <p key={nextKey()} className="text-sm text-navy-700 leading-relaxed mb-2">
          {inlineFormatLocal(line)}
        </p>
      );
      i++;
    }
  }

  return <>{elements}</>;
}
