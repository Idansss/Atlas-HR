"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Wrench, FileText, Users, GraduationCap, Sparkles, ArrowRight } from "lucide-react";

const PILLARS = [
  {
    icon: BookOpen,
    title: "Knowledge Hub",
    description: "20 HR categories. Country guides. Industry guides. A full glossary. Every answer in one place.",
    href: "/knowledge",
  },
  {
    icon: Wrench,
    title: "Tools & Generators",
    description: "50+ AI-powered tools — job descriptions, contracts, policies, PIPs, and more.",
    href: "/tools",
  },
  {
    icon: FileText,
    title: "Templates",
    description: "Every HR document, downloadable as DOCX/PDF/Google Doc. Free and premium.",
    href: "/templates",
  },
  {
    icon: Users,
    title: "Community",
    description: "Forum, mentorship, local chapters, expert AMAs — with verified HR professionals.",
    href: "/community",
  },
  {
    icon: GraduationCap,
    title: "Learning",
    description: "Courses, certification prep, microlearning, and a career path planner from Coordinator to CHRO.",
    href: "/learning",
  },
  {
    icon: Sparkles,
    title: "Atlas Copilot",
    description: "Your always-on AI HR assistant. Answers questions, generates documents, and cites sources.",
    href: "/copilot",
  },
];

export function PillarsSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-[--text-primary]">Everything HR, in one place</h2>
          <p className="mt-3 text-[--text-secondary]">Six integrated pillars that work together so you don&apos;t have to switch tabs.</p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
            >
              <Link
                href={pillar.href}
                className="group flex flex-col rounded-2xl border border-[--border] bg-[--bg-card] p-6 hover:border-[--accent] hover:shadow-md transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[--accent-soft] mb-4 group-hover:bg-[--accent] transition-colors">
                  <pillar.icon size={20} className="text-[--accent] group-hover:text-[--primary-foreground] transition-colors" />
                </div>
                <h3 className="font-semibold text-[--text-primary] mb-2">{pillar.title}</h3>
                <p className="text-sm text-[--text-secondary] leading-relaxed flex-1">
                  {pillar.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[--accent]">
                  Explore <ArrowRight size={12} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
