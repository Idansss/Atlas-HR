"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Users, UserPlus, FileText, Calendar, DollarSign, Gift, TrendingUp,
  BookOpen, Heart, AlertTriangle, Book, Scale, Smile, Shield, BarChart2,
  LogOut, Monitor, Globe, Briefcase, Layers,
} from "lucide-react";
import type { HR_CATEGORIES } from "@/lib/constants";

const ICON_MAP: Record<string, React.ElementType> = {
  Users, UserPlus, FileText, Calendar, DollarSign, Gift, TrendingUp,
  BookOpen, Heart, AlertTriangle, Book, Scale, Smile, Shield, BarChart2,
  LogOut, Monitor, Globe, Briefcase, Layers,
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const item: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

interface Props {
  categories: typeof HR_CATEGORIES;
}

export function KnowledgeGrid({ categories }: Props) {
  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      initial="hidden"
      animate="show"
      variants={container}
    >
      {categories.map((cat) => {
        const Icon = ICON_MAP[cat.icon] ?? BookOpen;
        return (
          <motion.div key={cat.slug} variants={item}>
            <Link
              href={`/knowledge/${cat.slug}`}
              className="group flex items-start gap-4 rounded-2xl border border-[--border] bg-[--bg-card] p-5 hover:border-[--accent] hover:shadow-md transition-all"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[--accent-soft] group-hover:bg-[--accent] transition-colors">
                <Icon size={18} className="text-[--accent] group-hover:text-[--primary-foreground] transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[--text-primary] leading-tight">
                  {cat.label}
                </h3>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
