"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { GlossaryEntry } from "@/lib/glossary";

interface Props {
  entries: GlossaryEntry[];
}

function anchorFor(term: string) {
  return term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function GlossaryClient({ entries }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return entries;

    return entries.filter((entry) => {
      const haystack = [
        entry.term,
        entry.fullName,
        entry.definition,
        entry.category,
        ...entry.synonyms,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [entries, query]);

  const grouped = filtered.reduce<Record<string, GlossaryEntry[]>>((acc, item) => {
    const letter = item.term.charAt(0).toUpperCase();
    acc[letter] = acc[letter] ?? [];
    acc[letter].push(item);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort();

  return (
    <>
      <div className="mb-8 rounded-xl border border-[--border] bg-[--bg-card] p-3">
        <div className="flex items-center gap-2 rounded-lg bg-[--bg-input] px-3 py-2">
          <Search size={16} className="text-[--text-tertiary]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search terms, acronyms, laws, and HR concepts..."
            className="w-full bg-transparent text-sm text-[--text-primary] outline-none placeholder:text-[--text-tertiary]"
          />
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#${letter}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[--border] text-sm font-semibold text-[--text-secondary] transition-colors hover:border-[--accent] hover:bg-[--accent] hover:text-[--primary-foreground]"
          >
            {letter}
          </a>
        ))}
      </div>

      <div className="space-y-10">
        {letters.map((letter) => (
          <section key={letter} id={letter}>
            <h2 className="mb-4 text-2xl font-bold text-[--accent]">{letter}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {grouped[letter].map((item) => (
                <article
                  key={item.term}
                  id={anchorFor(item.term)}
                  className="scroll-mt-24 rounded-xl border border-[--border] bg-[--bg-card] p-5"
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-semibold text-[--text-primary]">{item.term}</h3>
                    {item.fullName !== item.term ? (
                      <p className="text-sm text-[--text-tertiary]">{item.fullName}</p>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[--text-secondary]">{item.definition}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[--accent-soft] px-2.5 py-1 text-xs font-medium text-[--accent]">
                      {item.category}
                    </span>
                    {item.alsoSeeTools.slice(0, 2).map((tool) => (
                      <Link
                        key={tool}
                        href={`/tools/${tool}`}
                        className="rounded-full border border-[--border] px-2.5 py-1 text-xs text-[--text-secondary] hover:border-[--accent] hover:text-[--accent]"
                      >
                        {tool.replace(/-/g, " ")}
                      </Link>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[--border] bg-[--bg-card] p-8 text-center text-sm text-[--text-secondary]">
          No glossary terms match your search.
        </div>
      ) : null}
    </>
  );
}
