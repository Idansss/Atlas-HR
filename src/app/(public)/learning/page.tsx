import type { Metadata } from "next";
import Link from "next/link";
import { Play, Clock, Star, Award, ArrowRight, BookOpen, GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "HR Learning Center",
  description:
    "Courses, micro-lessons, and certifications for HR professionals. Level up from fundamentals to advanced HR strategy.",
};

const COURSES = [
  {
    slug: "hr-fundamentals",
    title: "HR Fundamentals",
    description: "Everything a new HR professional needs to know — from contracts to compliance to culture.",
    instructor: "Atlas HR Team",
    level: "Beginner",
    duration: "4 hours",
    lessons: 18,
    isPremium: false,
    rating: 4.9,
    enrolled: 3400,
    category: "Core HR",
  },
  {
    slug: "mastering-recruitment",
    title: "Mastering Recruitment",
    description: "From job design to offer negotiation. Build a recruiting process that finds and keeps top talent.",
    instructor: "James Patel",
    level: "Intermediate",
    duration: "6 hours",
    lessons: 24,
    isPremium: true,
    rating: 4.8,
    enrolled: 1200,
    category: "Recruitment",
  },
  {
    slug: "performance-management-masterclass",
    title: "Performance Management Masterclass",
    description: "Build a performance culture. Design reviews, set OKRs, handle PIPs, and develop talent.",
    instructor: "Dr. Sarah Mensah",
    level: "Intermediate",
    duration: "5 hours",
    lessons: 20,
    isPremium: true,
    rating: 4.7,
    enrolled: 890,
    category: "Performance",
  },
  {
    slug: "employment-law-basics",
    title: "Employment Law Basics",
    description: "Understand the legal landscape — contracts, termination, discrimination, and compliance across key markets.",
    instructor: "Atlas HR Team",
    level: "Beginner",
    duration: "3 hours",
    lessons: 12,
    isPremium: false,
    rating: 4.8,
    enrolled: 2100,
    category: "Compliance",
  },
  {
    slug: "shrm-cp-prep",
    title: "SHRM-CP Exam Prep",
    description: "Structured certification preparation for the SHRM Certified Professional exam.",
    instructor: "Atlas HR Team",
    level: "Advanced",
    duration: "20 hours",
    lessons: 80,
    isPremium: true,
    rating: 4.9,
    enrolled: 560,
    category: "Certification",
  },
  {
    slug: "dei-foundations",
    title: "DEI in Practice",
    description: "Move from checkbox DEI to meaningful, measurable impact. Practical frameworks for HR professionals.",
    instructor: "Amara Osei",
    level: "Intermediate",
    duration: "4 hours",
    lessons: 16,
    isPremium: false,
    rating: 4.6,
    enrolled: 1800,
    category: "DEI",
  },
];

const LEARNING_PATHS = [
  { title: "New to HR", courses: 4, icon: BookOpen, description: "From zero to productive HR professional" },
  { title: "Become an HRBP", courses: 6, icon: GraduationCap, description: "Strategic partnership and business acumen" },
  { title: "SHRM-CP Certification", courses: 8, icon: Award, description: "Full prep track for the SHRM exam" },
];

export default function LearningPage() {
  return (
    <div className="min-h-screen bg-[--bg-app] py-12">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[--text-primary]">Learning</h1>
          <p className="mt-3 text-lg text-[--text-secondary] max-w-2xl">
            Free and premium courses, certification prep, and a career planner from HR Coordinator to CHRO.
          </p>
        </div>

        {/* Learning paths */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[--text-primary] mb-5">Learning paths</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {LEARNING_PATHS.map((path) => (
              <div
                key={path.title}
                className="rounded-2xl border border-[--border] bg-[--bg-card] p-5 hover:border-[--accent] hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[--accent-soft] mb-4 group-hover:bg-[--accent] transition-colors">
                  <path.icon size={18} className="text-[--accent] group-hover:text-[--primary-foreground] transition-colors" />
                </div>
                <h3 className="font-semibold text-[--text-primary]">{path.title}</h3>
                <p className="mt-1 text-sm text-[--text-secondary]">{path.description}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-[--accent]">
                  {path.courses} courses <ArrowRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Courses */}
        <div>
          <h2 className="text-2xl font-bold text-[--text-primary] mb-5">All courses</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {COURSES.map((course) => (
              <Link
                key={course.slug}
                href={`/learning/course/${course.slug}`}
                className="group flex flex-col rounded-2xl border border-[--border] bg-[--bg-card] overflow-hidden hover:border-[--accent] hover:shadow-md transition-all"
              >
                {/* Thumbnail */}
                <div className="h-36 bg-gradient-to-br from-[--accent-soft] to-[--bg-hover] flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[--accent] opacity-80">
                    <Play size={20} className="text-white" />
                  </div>
                </div>

                <div className="flex flex-col flex-1 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[--text-tertiary]">
                      {course.category}
                    </span>
                    {course.isPremium && (
                      <span className="rounded-full bg-[--warning] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        Pro
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-[--text-primary] group-hover:text-[--accent] transition-colors">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-sm text-[--text-secondary] leading-relaxed flex-1">
                    {course.description}
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-[--text-tertiary]">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={11} className="fill-[--warning] text-[--warning]" /> {course.rating}
                    </span>
                    <span>{course.enrolled.toLocaleString()} enrolled</span>
                  </div>
                  <div className="mt-3 text-xs text-[--text-tertiary]">by {course.instructor}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Career path planner CTA */}
        <div className="mt-12 rounded-2xl border border-[--accent] bg-[--accent-soft] p-8 text-center">
          <GraduationCap size={32} className="text-[--accent] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[--text-primary]">Career Path Planner</h2>
          <p className="mt-2 text-[--text-secondary] max-w-lg mx-auto">
            See your path from HR Coordinator to CHRO. Find the skills and courses you need for each step.
          </p>
          <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[--accent] px-6 py-3 text-sm font-semibold text-white hover:bg-[--accent-hover] transition-colors">
            Plan my career <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
