"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText, Download, Lock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/templates-data";

const FORMAT_LABELS = { docx: "DOCX", pdf: "PDF", gdoc: "Google Doc" };

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showPremium, setShowPremium] = useState(true);

  const filtered = TEMPLATES.filter((t) => {
    const matchesSearch =
      !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || t.category === activeCategory;
    const matchesPremium = showPremium || !t.isPremium;
    return matchesSearch && matchesCategory && matchesPremium;
  });

  return (
    <div className="min-h-screen bg-[--bg-app] py-12">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[--text-primary]">Templates Library</h1>
          <p className="mt-3 text-lg text-[--text-secondary] max-w-2xl">
            30+ HR templates, ready to download. Free and premium. Every format.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-[--border] bg-[--bg-input] px-3 py-2 min-w-[200px] max-w-xs">
            <Search size={14} className="text-[--text-tertiary]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              aria-label="Search templates"
              className="flex-1 border-0 bg-transparent px-0 text-sm text-[--text-primary] shadow-none focus-visible:ring-0 placeholder:text-[--text-tertiary]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {["All", ...TEMPLATE_CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-[--accent] text-white"
                    : "border border-[--border] text-[--text-secondary] hover:bg-[--bg-hover]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-[--text-secondary]">
            <Checkbox
              checked={showPremium}
              onCheckedChange={(value) => setShowPremium(Boolean(value))}
              aria-label="Show premium templates"
            />
            Show premium
          </label>
        </div>

        {/* Results */}
        <p className="mb-5 text-sm text-[--text-tertiary]">
          {filtered.length} template{filtered.length !== 1 ? "s" : ""}
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <Link
              key={template.slug}
              href={`/templates/${template.slug}`}
              className="group relative flex flex-col rounded-2xl border border-[--border] bg-[--bg-card] p-5 hover:border-[--accent] hover:shadow-md transition-all"
            >
              {template.isPremium && (
                <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[--warning] px-2 py-0.5 text-[10px] font-semibold text-white">
                  <Lock size={9} />
                  Pro
                </span>
              )}

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[--accent-soft] mb-4 group-hover:bg-[--accent] transition-colors">
                <FileText size={18} className="text-[--accent] group-hover:text-[--primary-foreground] transition-colors" />
              </div>

              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-[--text-tertiary] mb-1">
                  {template.category}
                </p>
                <h3 className="font-semibold text-[--text-primary]">{template.name}</h3>
                <p className="mt-1 text-sm text-[--text-secondary] leading-relaxed">
                  {template.description}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {template.formats.map((fmt) => (
                  <span
                    key={fmt}
                    className="flex items-center gap-1 rounded-md border border-[--border] px-2 py-0.5 text-xs text-[--text-tertiary]"
                  >
                    <Download size={10} />
                    {FORMAT_LABELS[fmt]}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-[--text-tertiary]">No templates match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
