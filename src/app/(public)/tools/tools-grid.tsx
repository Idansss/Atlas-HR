"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Calculator,
  Calendar,
  CheckSquare,
  FileText,
  LogOut,
  Mail,
  MessageSquare,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { SerializableToolConfig } from "@/lib/tools-config";

const ICON_MAP: Record<string, React.ElementType> = {
  AlertCircle,
  AlertTriangle,
  Calculator,
  Calendar,
  CheckSquare,
  FileText,
  LogOut,
  Mail,
  MessageSquare,
  TrendingUp,
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

interface Props {
  tools: SerializableToolConfig[];
}

export function ToolsGrid({ tools }: Props) {
  const [activeGroup, setActiveGroup] = useState<"all" | "ai" | "calculator">("all");

  const filtered = useMemo(() => {
    if (activeGroup === "all") return tools;
    if (activeGroup === "ai") return tools.filter((tool) => tool.toolType !== "calculator");
    return tools.filter((tool) => tool.toolType === "calculator");
  }, [activeGroup, tools]);

  const categories = [...new Set(filtered.map((tool) => tool.category))];
  const toolsByCategory = Object.fromEntries(categories.map((category) => [category, filtered.filter((tool) => tool.category === category)]));

  const groups = [
    { id: "all" as const, label: "All tools", count: tools.length },
    { id: "ai" as const, label: "AI generators", count: tools.filter((tool) => tool.toolType !== "calculator").length },
    { id: "calculator" as const, label: "Calculators", count: tools.filter((tool) => tool.toolType === "calculator").length },
  ];

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        {groups.map((group) => (
          <button
            key={group.id}
            type="button"
            onClick={() => setActiveGroup(group.id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeGroup === group.id
                ? "bg-[--accent] text-white"
                : "border border-[--border] text-[--text-secondary] hover:bg-[--bg-hover]"
            }`}
          >
            {group.id === "calculator" ? <Calculator size={15} /> : <Sparkles size={15} />}
            {group.label}
            <span className={activeGroup === group.id ? "text-white/80" : "text-[--text-tertiary]"}>{group.count}</span>
          </button>
        ))}
      </div>

      {categories.map((category, groupIndex) => (
        <motion.div
          key={category}
          className="mb-12"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={container}
        >
          <motion.h2
            className="mb-5 text-xl font-bold text-[--text-primary]"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: groupIndex * 0.05 }}
          >
            {category === "Calculators" ? "Calculator Tools" : category}
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {toolsByCategory[category].map((tool) => {
              const Icon = ICON_MAP[tool.icon] ?? FileText;
              const isCalculator = tool.toolType === "calculator";
              return (
                <motion.div key={tool.slug} variants={item}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="group flex items-start gap-4 rounded-lg border border-[--border] bg-[--bg-card] p-5 transition-all hover:border-[--accent] hover:shadow-md"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isCalculator ? "bg-[--bg-input] group-hover:bg-[--accent]" : "bg-[--accent-soft] group-hover:bg-[--accent]"
                      }`}
                    >
                      <Icon size={18} className="text-[--accent] transition-colors group-hover:text-[--primary-foreground]" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-[--text-primary]">{tool.name}</h3>
                        {isCalculator && (
                          <span className="rounded-full border border-[--border] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[--text-tertiary]">
                            Free
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[--text-secondary]">{tool.description}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </>
  );
}
