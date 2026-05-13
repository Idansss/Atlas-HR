"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Loader2, Lock, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { SaveButton } from "@/components/shared/save-button";
import { UpgradeDialog } from "@/components/shared/upgrade-dialog";
import { useUsage } from "@/hooks/use-usage";
import {
  TEMPLATE_VARIABLES,
  VARIANT_LABELS,
  type Template,
  type TemplateVariant,
} from "@/lib/templates-data";

interface Props {
  template: Template;
}

const inputClass =
  "w-full rounded-lg border border-[--border] bg-[--bg-input] px-3 py-2 text-sm text-[--text-primary] outline-none transition-colors placeholder:text-[--text-tertiary] focus:border-[--accent] focus:ring-1 focus:ring-[--accent]";

function filenameFromHeader(header: string | null, fallback: string) {
  const match = header?.match(/filename="([^"]+)"/);
  return match?.[1] ?? `${fallback}.docx`;
}

async function downloadBlob(response: Response, fallbackName: string) {
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filenameFromHeader(response.headers.get("Content-Disposition"), fallbackName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function TemplateDownloadPanel({ template }: Props) {
  const [variant, setVariant] = useState<TemplateVariant>(
    template.defaultVariant ?? template.variants?.[0] ?? "global"
  );
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "custom" | "blank">("idle");
  const [error, setError] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { summary, loading } = useUsage();
  const premiumLocked = template.isPremium && !loading && summary.role === "free";

  const variableDefs = useMemo(
    () =>
      (template.variables ?? []).map((name) => TEMPLATE_VARIABLES[name]).filter(Boolean),
    [template.variables]
  );

  const requestDownload = async (mode: "custom" | "blank") => {
    setError("");
    setStatus(mode);

    try {
      if (premiumLocked) {
        setUpgradeOpen(true);
        setStatus("idle");
        return;
      }

      const response = await fetch(`/api/templates/${template.slug}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant,
          variables: mode === "blank" ? {} : variables,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Template download failed");
      }

      await downloadBlob(response, template.slug);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Template download failed");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-5">
        <h3 className="font-semibold text-[--text-primary]">Customize and download</h3>
        <p className="mt-1 text-xs leading-relaxed text-[--text-secondary]">
          Fill only what you know. Empty fields stay as editable Word placeholders.
        </p>

        <div className="mt-4 space-y-4">
          {template.variants?.length ? (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[--text-primary]">
                Country variant
              </label>
              <Select
                value={variant}
                onValueChange={(nextValue) => setVariant((nextValue ?? "global") as TemplateVariant)}
                items={template.variants.map((item) => ({
                  value: item,
                  label: VARIANT_LABELS[item],
                }))}
              >
                <SelectTrigger aria-label="Country variant">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {template.variants.map((item) => (
                    <SelectItem key={item} value={item}>
                      {VARIANT_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {variableDefs.map((field) => (
            <div key={field.name}>
              <label className="mb-1.5 block text-xs font-semibold text-[--text-primary]">
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  className={`${inputClass} min-h-20 resize-y`}
                  value={variables[field.name] ?? ""}
                  onChange={(event) =>
                    setVariables((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                  placeholder={field.placeholder}
                />
              ) : (
                <Input
                  className={inputClass}
                  type={field.type === "date" ? "date" : "text"}
                  value={variables[field.name] ?? ""}
                  onChange={(event) =>
                    setVariables((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}
        </div>

        {error ? (
          <p className="mt-3 rounded-lg border border-[--danger] bg-red-500/10 px-3 py-2 text-xs text-[--danger]">
            {error}
          </p>
        ) : null}

        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={() => requestDownload("custom")}
            disabled={status !== "idle"}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
              premiumLocked
                ? "border border-[--border] text-[--text-tertiary]"
                : "bg-[--accent] text-white hover:bg-[--accent-hover]"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {premiumLocked ? <Lock size={14} /> : status === "custom" ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Download customized DOCX
          </button>

          <button
            type="button"
            onClick={() => requestDownload("blank")}
            disabled={status !== "idle"}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[--border] py-2.5 text-sm font-semibold text-[--text-secondary] transition-colors hover:bg-[--bg-hover] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "blank" ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Skip and download blank
          </button>
        </div>

        {premiumLocked ? (
          <button
            type="button"
            onClick={() => setUpgradeOpen(true)}
            className="mt-3 block w-full rounded-xl bg-[--accent] py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[--accent-hover]"
          >
            Upgrade to Pro
          </button>
        ) : null}
      </div>
      <UpgradeDialog
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature="premium_templates"
        reason="Premium templates are included with Pro and Team plans."
      />

      <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-5">
        <h3 className="mb-3 text-sm font-semibold text-[--text-primary]">Save for later</h3>
        <SaveButton itemType="template" itemSlug={template.slug} className="w-full justify-center" />
      </div>

      {template.relatedTool ? (
        <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-5">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[--accent-soft]">
            <Sparkles size={16} className="text-[--accent]" />
          </div>
          <h3 className="text-sm font-semibold text-[--text-primary]">Customize with AI</h3>
          <p className="mt-1 text-xs text-[--text-secondary]">
            Generate a tailored draft before downloading the reusable Word template.
          </p>
          <Link
            href={`/tools/${template.relatedTool}`}
            className="mt-3 block w-full rounded-lg bg-[--accent-soft] py-2 text-center text-xs font-medium text-[--accent] transition-colors hover:bg-[--accent] hover:text-[--primary-foreground]"
          >
            Open generator
          </Link>
        </div>
      ) : null}
    </div>
  );
}
