"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Download, Loader2, Pencil, RefreshCw, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Database } from "@/types/database";

type Doc = Database["public"]["Tables"]["generated_documents"]["Row"];

function downloadAsDoc(content: string, filename: string) {
  const escaped = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"></head><body><pre style="font-family:Calibri,sans-serif;font-size:11pt;white-space:pre-wrap">${escaped}</pre></body></html>`;
  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

interface Props {
  doc: Doc;
}

export function DocumentClient({ doc }: Props) {
  const [title, setTitle] = useState(doc.title ?? "Untitled Document");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(title);
  const [output, setOutput] = useState(doc.output);
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const inputs = doc.inputs as Record<string, string>;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = title.toLowerCase().replace(/\s+/g, "-");
    downloadAsDoc(output, filename);
  };

  const handleSaveTitle = async () => {
    const trimmed = titleDraft.trim() || "Untitled Document";
    setTitle(trimmed);
    setEditingTitle(false);

    await fetch(`/api/documents/${doc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });
  };

  const handleCancelTitle = () => {
    setTitleDraft(title);
    setEditingTitle(false);
  };

  const handleRegenerate = async () => {
    setOutput("");
    setIsRegenerating(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolSlug: doc.tool_slug, inputs }),
      });

      if (!res.ok || !res.body) throw new Error("Generation failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          if (!event.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(event.slice(6)) as { type: string; text?: string };
            if (parsed.type === "chunk" && parsed.text) {
              result += parsed.text;
              setOutput(result);
            }
          } catch {
            // ignore malformed events
          }
        }
      }
    } catch {
      setOutput("Something went wrong. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/documents"
        className="inline-flex items-center gap-1.5 text-sm text-[--text-tertiary] hover:text-[--accent] transition-colors"
      >
        <ArrowLeft size={14} /> All documents
      </Link>

      {/* Title */}
      <div className="flex items-start gap-3">
        {editingTitle ? (
          <div className="flex flex-1 items-center gap-2">
            <Input
              aria-label="Document title"
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") handleCancelTitle();
              }}
              className="flex-1 rounded-lg border-accent bg-[--bg-input] px-3 py-1.5 text-xl font-bold text-[--text-primary]"
            />
            <button
              type="button"
              onClick={handleSaveTitle}
              aria-label="Save title"
              className="flex items-center justify-center rounded-lg bg-[--accent] p-1.5 text-[--primary-foreground] hover:bg-[--accent-hover] transition-colors"
            >
              <Check size={14} />
            </button>
            <button
              type="button"
              onClick={handleCancelTitle}
              aria-label="Cancel edit"
              className="flex items-center justify-center rounded-lg border border-[--border] p-1.5 text-[--text-secondary] hover:bg-[--bg-hover] transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-1 items-center gap-2">
            <h1 className="text-2xl font-bold text-[--text-primary]">{title}</h1>
            <button
              type="button"
              onClick={() => {
                setTitleDraft(title);
                setEditingTitle(true);
              }}
              aria-label="Edit title"
              className="flex items-center justify-center rounded-lg p-1.5 text-[--text-tertiary] hover:bg-[--bg-hover] hover:text-[--accent] transition-colors"
            >
              <Pencil size={13} />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-[--text-tertiary]">
        <span className="rounded-full bg-[--accent-soft] px-2 py-0.5 font-medium text-[--accent]">
          {doc.tool_name}
        </span>
        <span>
          {new Date(doc.created_at).toLocaleDateString(undefined, {
            weekday: "short",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg border border-[--border] px-3 py-1.5 text-xs font-medium text-[--text-secondary] hover:bg-[--bg-hover] transition-colors"
        >
          <Copy size={12} />
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-1.5 rounded-lg border border-[--border] px-3 py-1.5 text-xs font-medium text-[--text-secondary] hover:bg-[--bg-hover] transition-colors"
        >
          <Download size={12} />
          Download as DOCX
        </button>
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="flex items-center gap-1.5 rounded-lg border border-[--border] px-3 py-1.5 text-xs font-medium text-[--text-secondary] hover:bg-[--bg-hover] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRegenerating ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <RefreshCw size={12} />
          )}
          Regenerate
        </button>
        <Link
          href={`/tools/${doc.tool_slug}`}
          className="flex items-center gap-1.5 rounded-lg border border-[--border] px-3 py-1.5 text-xs font-medium text-[--text-secondary] hover:bg-[--bg-hover] transition-colors"
        >
          <Sparkles size={12} />
          Open tool
        </Link>
      </div>

      {/* Output */}
      <div data-private className="rounded-2xl border border-[--border] bg-[--bg-card] p-6">
        <pre className="whitespace-pre-wrap font-sans text-sm text-[--text-secondary] leading-relaxed">
          {output}
          {isRegenerating && (
            <span className="inline-block h-4 w-0.5 animate-pulse bg-[--accent] ml-0.5" />
          )}
        </pre>
      </div>

      {/* Inputs used */}
      {Object.keys(inputs).length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-[--text-tertiary] hover:text-[--text-primary] transition-colors list-none flex items-center gap-1">
            <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
            Inputs used to generate this document
          </summary>
          <div className="mt-3 rounded-xl border border-[--border] bg-[--bg-card] p-4 space-y-2">
            {Object.entries(inputs).map(([key, val]) => (
              val ? (
                <div key={key} className="grid grid-cols-[160px_1fr] gap-2 text-sm">
                  <span className="font-medium text-[--text-tertiary] capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span className="text-[--text-primary]">{val}</span>
                </div>
              ) : null
            ))}
          </div>
        </details>
      )}
    </div>
  );
}