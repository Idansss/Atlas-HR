"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Copy, Download, RefreshCw, Loader2, ExternalLink } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UpgradeDialog } from "@/components/shared/upgrade-dialog";
import { useUsage } from "@/hooks/use-usage";
import { UsageMeter } from "@/components/billing/UsageMeter";
import { track } from "@/lib/analytics/track";
import type { SerializableToolConfig, ToolConfig } from "@/lib/tools-config";

interface Props {
  tool: SerializableToolConfig;
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: ToolConfig["inputs"][number];
  value: string;
  onChange: (v: string) => void;
}) {
  const baseClass =
    "w-full rounded-lg border border-[--border] bg-[--bg-input] px-3 py-2 text-sm text-[--text-primary] outline-none focus:border-[--accent] focus:ring-1 focus:ring-[--accent] transition-colors placeholder:text-[--text-tertiary]";

  if (field.type === "select") {
    return (
      <Select
        value={value || null}
        onValueChange={(nextValue) => onChange(nextValue ?? "")}
        items={field.options ?? []}
      >
        <SelectTrigger aria-label={field.label}>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {field.options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        className={`${baseClass} min-h-[80px] resize-y`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
      />
    );
  }

  if (field.type === "tags") {
    return (
      <input
        className={baseClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder ?? "Comma-separated values"}
      />
    );
  }

  return (
    <input
      className={baseClass}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
    />
  );
}

function downloadAsDoc(content: string, filename: string) {
  const escaped = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

export function ToolPageClient({ tool }: Props) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | undefined>();
  const { summary, isFree, loading: usageLoading } = useUsage();

  useEffect(() => {
    track("tool_viewed", { tool_slug: tool.slug, category: tool.category ?? "general" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async () => {
    setOutput("");
    setDocumentId(null);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolSlug: tool.slug, inputs }),
      });

      if (res.status === 429) {
        const body = await res.json().catch(() => ({}));
        setUpgradeReason(body.reason ?? "You've reached your monthly generation limit.");
        setShowUpgrade(true);
        setIsGenerating(false);
        return;
      }

      if (!res.ok || !res.body) throw new Error("Generation failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events: split on double newlines
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          if (!event.startsWith("data: ")) continue;
          const json = event.slice(6);
          try {
            const parsed = JSON.parse(json) as { type: string; text?: string; documentId?: string | null };
            if (parsed.type === "chunk" && parsed.text) {
              result += parsed.text;
              setOutput(result);
            } else if (parsed.type === "done") {
              setDocumentId(parsed.documentId ?? null);
            }
          } catch {
            // ignore malformed events
          }
        }
      }
    } catch {
      setOutput("Something went wrong. Please try again or check your API key configuration.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    track("tool_output_copied", { tool_slug: tool.slug });
  };

  const handleDownload = () => {
    const filename = `${tool.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
    downloadAsDoc(output, filename);
    track("tool_output_downloaded", { tool_slug: tool.slug, format: "docx" });
  };

  const genLimit = summary.tool_generations.limit;
  const limitReached =
    isFree &&
    !usageLoading &&
    isFinite(genLimit) &&
    summary.tool_generations.used >= genLimit;

  return (
    <>
    <UpgradeDialog
      open={showUpgrade}
      onClose={() => setShowUpgrade(false)}
      reason={upgradeReason}
    />
    <div className="min-h-screen bg-[--bg-app] py-12">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link
          href="/tools"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[--text-tertiary] hover:text-[--accent] transition-colors"
        >
          <ArrowLeft size={14} />
          All tools
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Form */}
          <div>
            <h1 className="text-3xl font-bold text-[--text-primary]">{tool.name}</h1>
            <p className="mt-2 text-[--text-secondary]">{tool.description}</p>

            <div className="mt-8 space-y-5">
              {tool.inputs.map((field) => (
                <div key={field.name}>
                  <label className="mb-1.5 block text-sm font-medium text-[--text-primary]">
                    {field.label}
                    {field.required && <span className="ml-1 text-[--danger]">*</span>}
                  </label>
                  <FieldInput
                    field={field}
                    value={inputs[field.name] ?? ""}
                    onChange={(v) => setInputs((prev) => ({ ...prev, [field.name]: v }))}
                  />
                </div>
              ))}
            </div>

            <UsageMeter resource="tool_generation" period="month" className="mt-6" />

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || limitReached}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[--accent] py-3 text-sm font-semibold text-[--primary-foreground] hover:bg-[--accent-hover] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  {limitReached ? "Upgrade for unlimited" : "Generate"}
                </>
              )}
            </button>
          </div>

          {/* Right: Output */}
          <div>
            <div className="sticky top-24 rounded-2xl border border-[--border] bg-[--bg-card]">
              <div className="flex items-center justify-between border-b border-[--border] px-5 py-3">
                <span className="text-sm font-semibold text-[--text-primary]">Output</span>
                {output && (
                  <div className="flex gap-2">
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
                      onClick={handleGenerate}
                      className="flex items-center gap-1.5 rounded-lg border border-[--border] px-3 py-1.5 text-xs font-medium text-[--text-secondary] hover:bg-[--bg-hover] transition-colors"
                    >
                      <RefreshCw size={12} />
                      Regenerate
                    </button>
                  </div>
                )}
              </div>

              <div className="min-h-[400px] p-5">
                <AnimatePresence mode="wait">
                  {!output && !isGenerating ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex h-[360px] flex-col items-center justify-center gap-3 text-center"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[--accent-soft]">
                        <Sparkles size={20} className="text-[--accent]" />
                      </div>
                      <p className="text-sm font-medium text-[--text-primary]">
                        Fill in the form and click Generate
                      </p>
                      <p className="text-xs text-[--text-tertiary]">
                        Your document will appear here, streamed in real time.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="output"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <pre className="whitespace-pre-wrap font-sans text-sm text-[--text-secondary] leading-relaxed">
                        {output}
                        {isGenerating && (
                          <span className="inline-block h-4 w-0.5 animate-pulse bg-[--accent] ml-0.5" />
                        )}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {output && !isGenerating && (
                <div className="border-t border-[--border] px-5 py-3 space-y-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[--accent-soft] py-2 text-xs font-medium text-[--accent] hover:bg-[--accent] hover:text-[--primary-foreground] transition-colors"
                  >
                    <Download size={13} />
                    Download as DOCX
                  </button>
                  {documentId && (
                    <Link
                      href={`/dashboard/documents/${documentId}`}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-[--border] py-2 text-xs font-medium text-[--text-secondary] hover:bg-[--bg-hover] transition-colors"
                    >
                      <ExternalLink size={12} />
                      View in document library
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
