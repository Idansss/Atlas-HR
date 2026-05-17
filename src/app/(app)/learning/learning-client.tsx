"use client";

import { useState, useTransition, useActionState, useEffect } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import type { LMSCourse, LMSEnrolment, LMSCertification, Employee } from "@/types/database";
import {
  createCourse, updateCourse, deleteCourse,
  enrolEmployees, updateEnrolmentProgress,
  addCertification, deleteCertification,
} from "./actions";
import type { LMSActionResult } from "./actions";

// ─── Types ────────────────────────────────────────────────────────────────────

type EmployeeRow = Pick<Employee, "id" | "full_name" | "job_title" | "department" | "status">;
type Tab = "courses" | "enrolments" | "certifications";

interface Props {
  courses: LMSCourse[];
  enrolments: LMSEnrolment[];
  certifications: LMSCertification[];
  employees: EmployeeRow[];
  isAdmin: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: "compliance",  label: "Compliance",  icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", color: "bg-red-100 text-red-700" },
  { key: "technical",   label: "Technical",   icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", color: "bg-blue-100 text-blue-700" },
  { key: "soft_skills", label: "Soft Skills", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: "bg-purple-100 text-purple-700" },
  { key: "leadership",  label: "Leadership",  icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", color: "bg-amber-100 text-amber-700" },
  { key: "onboarding",  label: "Onboarding",  icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", color: "bg-green-100 text-green-700" },
  { key: "other",       label: "Other",       icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", color: "bg-navy-100 text-navy-600" },
] as const;

const FORMATS = [
  { key: "video",    label: "Video",    icon: "M15 10l4.553-2.069A1 1 0 0121 8.816v6.368a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
  { key: "document", label: "Document", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { key: "live",     label: "Live",     icon: "M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" },
  { key: "external", label: "External", icon: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" },
  { key: "scorm",    label: "SCORM",    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
] as const;

const ENROLMENT_STATUSES = {
  enrolled:    { label: "Enrolled",    cls: "bg-blue-100 text-blue-700" },
  in_progress: { label: "In progress", cls: "bg-amber-100 text-amber-700" },
  completed:   { label: "Completed",   cls: "bg-green-100 text-green-700" },
  failed:      { label: "Failed",      cls: "bg-red-100 text-red-700" },
  dropped:     { label: "Dropped",     cls: "bg-navy-100 text-navy-500" },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Ico({ path, cls = "h-4 w-4" }: { path: string; cls?: string }) {
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function getCat(key: string) {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1];
}

function getFmt(key: string) {
  return FORMATS.find((f) => f.key === key) ?? FORMATS[1];
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function daysUntil(d: string | null) {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);
}

// ─── Create / Edit Course Modal ───────────────────────────────────────────────

function CourseModal({
  course,
  onClose,
}: {
  course?: LMSCourse;
  onClose: () => void;
}) {
  const action = course ? updateCourse : createCourse;
  const [state, formAction, isPending] = useActionState<LMSActionResult, FormData>(action, null);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state, onClose]);

  const inputCls = "flex h-10 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent";
  const labelCls = "text-xs font-semibold text-navy-600 uppercase tracking-wide block mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-navy-900">{course ? "Edit course" : "Add course"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-navy-400 hover:text-navy-700 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form action={formAction} className="space-y-4">
          {course && <input type="hidden" name="course_id" value={course.id} />}
          {state?.error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{state.error}</div>
          )}

          <div>
            <label htmlFor="course-title" className={labelCls}>Title <span className="text-red-500">*</span></label>
            <input id="course-title" name="title" required defaultValue={course?.title} className={inputCls} placeholder="e.g. Data Protection & GDPR" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="course-category" className={labelCls}>Category</label>
              <Select
                id="course-category"
                name="category"
                defaultValue={course?.category ?? "other"}
                options={CATEGORIES.map((c) => ({ value: c.key, label: c.label }))}
              />
              <select id="course-category-native" aria-hidden="true" disabled className="hidden">
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="course-format" className={labelCls}>Format</label>
              <Select
                id="course-format"
                name="format"
                defaultValue={course?.format ?? "document"}
                options={FORMATS.map((f) => ({ value: f.key, label: f.label }))}
              />
              <select id="course-format-native" aria-hidden="true" disabled className="hidden">
                {FORMATS.map((f) => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="course-duration" className={labelCls}>Duration (mins)</label>
              <input id="course-duration" name="duration_mins" type="number" min="1" defaultValue={course?.duration_mins ?? ""} className={inputCls} placeholder="e.g. 45" />
            </div>
            <div>
              <label htmlFor="course-mandatory" className={labelCls}>Mandatory</label>
              <Select
                id="course-mandatory"
                name="is_mandatory"
                defaultValue={course?.is_mandatory ? "true" : "false"}
                options={[
                  { value: "false", label: "No" },
                  { value: "true", label: "Yes - required for all" },
                ]}
              />
              <select id="course-mandatory-native" aria-hidden="true" disabled className="hidden">
                <option value="false">No</option>
                <option value="true">Yes — required for all</option>
              </select>
            </div>
          </div>

          {course && (
            <div>
              <label htmlFor="course-status" className={labelCls}>Status</label>
              <Select
                id="course-status"
                name="status"
                defaultValue={course.status}
                options={[
                  { value: "published", label: "Published" },
                  { value: "draft", label: "Draft" },
                  { value: "archived", label: "Archived" },
                ]}
              />
              <select id="course-status-native" aria-hidden="true" disabled className="hidden">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}

          <div>
            <label htmlFor="course-url" className={labelCls}>External URL</label>
            <input id="course-url" name="external_url" type="url" defaultValue={course?.external_url ?? ""} className={inputCls} placeholder="https://…" />
          </div>

          <div>
            <label htmlFor="course-desc" className={labelCls}>Description</label>
            <textarea
              id="course-desc"
              name="description"
              defaultValue={course?.description ?? ""}
              className="flex min-h-[72px] w-full rounded-xl border border-navy-200 bg-white px-3 py-2.5 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
              placeholder="What will employees learn?"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="text-sm font-medium text-navy-600 hover:text-navy-800 px-4 py-2 rounded-lg hover:bg-navy-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-xl transition-colors disabled:opacity-60">
              {isPending ? "Saving…" : course ? "Save changes" : "Add course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Enrol Modal ──────────────────────────────────────────────────────────────

function EnrolModal({
  courses,
  employees,
  enrolments,
  defaultCourseId,
  onClose,
}: {
  courses: LMSCourse[];
  employees: EmployeeRow[];
  enrolments: LMSEnrolment[];
  defaultCourseId?: string;
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState<LMSActionResult, FormData>(enrolEmployees, null);
  const [selectedCourse, setSelectedCourse] = useState(defaultCourseId ?? courses[0]?.id ?? "");

  useEffect(() => {
    if (state?.success) onClose();
  }, [state, onClose]);

  const enrolled = new Set(
    enrolments.filter((e) => e.course_id === selectedCourse).map((e) => e.employee_id),
  );

  const labelCls = "text-xs font-semibold text-navy-600 uppercase tracking-wide block mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-navy-900">Enrol employee</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-navy-400 hover:text-navy-700 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{state.error}</div>
          )}

          <div>
            <label htmlFor="enrol-course" className={labelCls}>Course <span className="text-red-500">*</span></label>
            <Select
              id="enrol-course"
              name="course_id"
              value={selectedCourse}
              onChange={setSelectedCourse}
              options={courses
                .filter((c) => c.status === "published")
                .map((c) => ({ value: c.id, label: c.title }))}
            />
            <select id="enrol-course-native" aria-hidden="true" disabled className="hidden">
              {courses.filter((c) => c.status === "published").map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="enrol-employee" className={labelCls}>Employee <span className="text-red-500">*</span></label>
            <Select
              id="enrol-employee"
              name="employee_id"
              options={employees.map((e) => {
                const isEnrolled = enrolled.has(e.id);
                return {
                  value: e.id,
                  label: `${e.full_name}${isEnrolled ? " (already enrolled)" : ""}`,
                  disabled: isEnrolled,
                };
              })}
            />
            <select id="enrol-employee-native" aria-hidden="true" disabled className="hidden">
              {employees.map((e) => {
                const isEnrolled = enrolled.has(e.id);
                return (
                  <option key={e.id} value={e.id} disabled={isEnrolled}>
                    {e.full_name}{isEnrolled ? " (already enrolled)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label htmlFor="enrol-due" className={labelCls}>Due date</label>
            <DatePicker id="enrol-due" name="due_date" placeholder="Select due date" />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="text-sm font-medium text-navy-600 hover:text-navy-800 px-4 py-2 rounded-lg hover:bg-navy-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-xl transition-colors disabled:opacity-60">
              {isPending ? "Enrolling…" : "Enrol employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Add Certification Modal ──────────────────────────────────────────────────

function CertModal({
  courses,
  employees,
  onClose,
}: {
  courses: LMSCourse[];
  employees: EmployeeRow[];
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState<LMSActionResult, FormData>(addCertification, null);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state, onClose]);

  const inputCls = "flex h-10 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent";
  const labelCls = "text-xs font-semibold text-navy-600 uppercase tracking-wide block mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-navy-900">Add certification</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-navy-400 hover:text-navy-700 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{state.error}</div>
          )}

          <div>
            <label htmlFor="cert-employee" className={labelCls}>Employee <span className="text-red-500">*</span></label>
            <Select
              id="cert-employee"
              name="employee_id"
              options={employees.map((e) => ({ value: e.id, label: e.full_name }))}
            />
            <select id="cert-employee-native" aria-hidden="true" disabled className="hidden">
              {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="cert-name" className={labelCls}>Certification name <span className="text-red-500">*</span></label>
            <input id="cert-name" name="name" required className={inputCls} placeholder="e.g. AWS Solutions Architect" />
          </div>

          <div>
            <label htmlFor="cert-course" className={labelCls}>Linked course (optional)</label>
            <Select
              id="cert-course"
              name="course_id"
              options={[
                { value: "", label: "None" },
                ...courses.map((c) => ({ value: c.id, label: c.title })),
              ]}
            />
            <select id="cert-course-native" aria-hidden="true" disabled className="hidden">
              <option value="">None</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="cert-issuer" className={labelCls}>Issuing organisation</label>
            <input id="cert-issuer" name="issuer" className={inputCls} placeholder="e.g. AWS, Google, Coursera" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cert-issued" className={labelCls}>Issued date</label>
              <DatePicker id="cert-issued" name="issued_date" placeholder="Select date" />
            </div>
            <div>
              <label htmlFor="cert-expiry" className={labelCls}>Expiry date</label>
              <DatePicker id="cert-expiry" name="expiry_date" placeholder="Select expiry date" />
            </div>
          </div>

          <div>
            <label htmlFor="cert-url" className={labelCls}>Credential URL</label>
            <input id="cert-url" name="credential_url" type="url" className={inputCls} placeholder="https://…" />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="text-sm font-medium text-navy-600 hover:text-navy-800 px-4 py-2 rounded-lg hover:bg-navy-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-xl transition-colors disabled:opacity-60">
              {isPending ? "Adding…" : "Add certification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({
  course,
  enrolledCount,
  completedCount,
  isAdmin,
  onEnrol,
}: {
  course: LMSCourse;
  enrolledCount: number;
  completedCount: number;
  isAdmin: boolean;
  onEnrol: (courseId: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const cat = getCat(course.category);
  const fmt = getFmt(course.format);
  const completionRate = enrolledCount > 0 ? Math.round((completedCount / enrolledCount) * 100) : 0;

  function handleDelete() {
    setMenuOpen(false);
    if (!confirm(`Delete "${course.title}"? All enrolments will also be removed.`)) return;
    startTransition(() => { void deleteCourse(course.id); });
  }

  return (
    <>
      {showEdit && <CourseModal course={course} onClose={() => setShowEdit(false)} />}
      <div className={`bg-white rounded-2xl border border-navy-200 p-5 flex flex-col gap-4 hover:shadow-sm transition-all ${isPending ? "opacity-60" : ""}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${cat.color}`}>
              <Ico path={cat.icon} cls="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-navy-900 text-sm leading-tight">{course.title}</h3>
                {course.is_mandatory && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-100 text-red-700">Required</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cat.color}`}>{cat.label}</span>
                <span className="inline-flex items-center gap-1 text-xs text-navy-400">
                  <Ico path={fmt.icon} cls="h-3.5 w-3.5" />
                  {fmt.label}
                </span>
                {course.duration_mins && (
                  <span className="inline-flex items-center gap-1 text-xs text-navy-400">
                    <Ico path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" cls="h-3.5 w-3.5" />
                    {course.duration_mins}m
                  </span>
                )}
              </div>
            </div>
          </div>
          {isAdmin && (
            <div className="relative flex-shrink-0">
              <button
                type="button"
                aria-label="Course actions"
                onClick={() => setMenuOpen((v) => !v)}
                className="h-7 w-7 flex items-center justify-center rounded-lg text-navy-400 hover:bg-navy-100 hover:text-navy-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
                </svg>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-8 z-20 bg-white border border-navy-200 rounded-xl shadow-lg py-1 w-40 text-sm">
                    <button type="button" onClick={() => { setMenuOpen(false); setShowEdit(true); }} className="w-full text-left px-4 py-2 hover:bg-navy-50 text-navy-700 transition-colors">
                      Edit course
                    </button>
                    <button type="button" onClick={() => { setMenuOpen(false); onEnrol(course.id); }} className="w-full text-left px-4 py-2 hover:bg-navy-50 text-navy-700 transition-colors">
                      Enrol employee
                    </button>
                    <div className="border-t border-navy-100 my-1" />
                    <button type="button" onClick={handleDelete} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 transition-colors">
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {course.description && (
          <p className="text-xs text-navy-500 leading-relaxed line-clamp-2">{course.description}</p>
        )}

        {/* Completion bar */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-navy-500 mb-1.5">
            <span>{completedCount}/{enrolledCount} completed</span>
            <span>{completionRate}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-navy-100 overflow-hidden">
            <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-navy-100">
          {course.external_url ? (
            <a
              href={course.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Open course →
            </a>
          ) : <span />}
          {isAdmin && (
            <button
              type="button"
              onClick={() => onEnrol(course.id)}
              className="text-xs font-medium text-navy-500 hover:text-navy-700 transition-colors"
            >
              + Enrol
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Enrolment Status Select ──────────────────────────────────────────────────

function EnrolmentStatusSelect({ enrolment }: { enrolment: LMSEnrolment }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(enrolment.status);

  function handleChange(value: string) {
    const next = value as LMSEnrolment["status"];
    setStatus(next);
    const pct = next === "completed" ? 100 : next === "in_progress" ? Math.max(enrolment.progress_pct, 10) : enrolment.progress_pct;
    startTransition(() => { void updateEnrolmentProgress(enrolment.id, pct, next); });
  }

  const cfg = ENROLMENT_STATUSES[status] ?? ENROLMENT_STATUSES.enrolled;

  return (
    <Select
      aria-label="Enrolment status"
      value={status}
      onChange={handleChange}
      disabled={isPending}
      className="w-36"
      triggerClassName={`h-8 rounded-full border-0 px-3 text-xs font-semibold ${cfg.cls} ${isPending ? "opacity-60" : ""}`}
      menuClassName="text-xs"
      options={Object.entries(ENROLMENT_STATUSES).map(([k, v]) => ({ value: k, label: v.label }))}
    />
  );
}

// ─── Main Client ──────────────────────────────────────────────────────────────

export function LearningClient({ courses, enrolments, certifications, employees, isAdmin }: Props) {
  const [tab, setTab] = useState<Tab>("courses");
  const [showCourse, setShowCourse] = useState(false);
  const [enrolCourseId, setEnrolCourseId] = useState<string | undefined>();
  const [showCert, setShowCert] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const empMap = Object.fromEntries(employees.map((e) => [e.id, e]));
  const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]));

  // ── Stats ──
  const totalEnrolments = enrolments.length;
  const completed = enrolments.filter((e) => e.status === "completed").length;
  const mandatory = courses.filter((c) => c.is_mandatory).length;

  // ── Course counts ──
  const enrolledByCourse: Record<string, number> = {};
  const completedByCourse: Record<string, number> = {};
  for (const e of enrolments) {
    enrolledByCourse[e.course_id] = (enrolledByCourse[e.course_id] ?? 0) + 1;
    if (e.status === "completed") completedByCourse[e.course_id] = (completedByCourse[e.course_id] ?? 0) + 1;
  }

  // ── Filtered courses ──
  const filteredCourses = courses.filter((c) => {
    if (filterCategory !== "all" && c.category !== filterCategory) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // ── Filtered enrolments ──
  const filteredEnrolments = enrolments.filter((e) => {
    if (filterStatus !== "all" && e.status !== filterStatus) return false;
    if (search) {
      const emp = empMap[e.employee_id];
      const course = courseMap[e.course_id];
      const q = search.toLowerCase();
      if (
        !emp?.full_name.toLowerCase().includes(q) &&
        !course?.title.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  // ── Filtered certifications ──
  const filteredCerts = certifications.filter((c) => {
    if (search) {
      const emp = empMap[c.employee_id];
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !emp?.full_name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  function handleDeleteCert(id: string) {
    if (!confirm("Delete this certification? This cannot be undone.")) return;
    startTransition(() => { void deleteCertification(id); });
  }

  return (
    <>
      {showCourse && <CourseModal onClose={() => setShowCourse(false)} />}
      {enrolCourseId !== undefined && (
        <EnrolModal
          courses={courses}
          employees={employees}
          enrolments={enrolments}
          defaultCourseId={enrolCourseId}
          onClose={() => setEnrolCourseId(undefined)}
        />
      )}
      {showCert && <CertModal courses={courses} employees={employees} onClose={() => setShowCert(false)} />}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Courses",        value: courses.length },
          { label: "Enrolments",     value: totalEnrolments },
          { label: "Completed",      value: completed },
          { label: "Mandatory",      value: mandatory, warn: mandatory > 0 },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-navy-200 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-navy-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold tabular-nums ${s.warn ? "text-amber-600" : "text-navy-900"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs + toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-1 border-b border-navy-200">
          {(["courses", "enrolments", "certifications"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px capitalize ${
                tab === t ? "border-blue-600 text-blue-700" : "border-transparent text-navy-500 hover:text-navy-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
          <input
            type="search"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search"
            className="h-9 rounded-xl border border-navy-200 bg-white px-3 text-sm text-navy-700 focus:outline-none focus:ring-2 focus:ring-blue-600 w-40"
          />
          {tab === "courses" && (
            <Select
              aria-label="Filter by category"
              value={filterCategory}
              onChange={setFilterCategory}
              className="w-52"
              triggerClassName="h-9"
              options={[
                { value: "all", label: "All categories" },
                ...CATEGORIES.map((c) => ({ value: c.key, label: c.label })),
              ]}
            />
          )}
          {tab === "courses" && (
            <select
              aria-label="Filter by category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              disabled
              className="hidden"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          )}
          {tab === "enrolments" && (
            <Select
              aria-label="Filter by status"
              value={filterStatus}
              onChange={setFilterStatus}
              className="w-52"
              triggerClassName="h-9"
              options={[
                { value: "all", label: "All statuses" },
                ...Object.entries(ENROLMENT_STATUSES).map(([k, v]) => ({ value: k, label: v.label })),
              ]}
            />
          )}
          {tab === "enrolments" && (
            <select
              aria-label="Filter by status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              disabled
              className="hidden"
            >
              <option value="all">All statuses</option>
              {Object.entries(ENROLMENT_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          )}
          {isAdmin && (
            <div className="flex items-center gap-2">
              {tab === "courses" && (
                <button
                  type="button"
                  onClick={() => setShowCourse(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add course
                </button>
              )}
              {tab === "enrolments" && (
                <button
                  type="button"
                  onClick={() => setEnrolCourseId("")}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Enrol employee
                </button>
              )}
              {tab === "certifications" && (
                <button
                  type="button"
                  onClick={() => setShowCert(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add certification
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Courses tab ── */}
      {tab === "courses" && (
        filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                enrolledCount={enrolledByCourse[course.id] ?? 0}
                completedCount={completedByCourse[course.id] ?? 0}
                isAdmin={isAdmin}
                onEnrol={(id) => setEnrolCourseId(id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState iconPath="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" title="No courses found" sub={courses.length === 0 ? "Add your first course to start building your learning library." : "Try adjusting your search or filters."} action={isAdmin && courses.length === 0 ? { label: "Add course", onClick: () => setShowCourse(true) } : undefined} />
        )
      )}

      {/* ── Enrolments tab ── */}
      {tab === "enrolments" && (
        filteredEnrolments.length > 0 ? (
          <div className="bg-white rounded-2xl border border-navy-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-navy-50 border-b border-navy-200 text-xs font-semibold text-navy-500 uppercase tracking-wide">
              <div className="col-span-3">Employee</div>
              <div className="col-span-4">Course</div>
              <div className="col-span-2 hidden md:block">Progress</div>
              <div className="col-span-2">Due date</div>
              <div className="col-span-1">Status</div>
            </div>
            <div className="divide-y divide-navy-100">
              {filteredEnrolments.map((enrolment) => {
                const emp = empMap[enrolment.employee_id];
                const course = courseMap[enrolment.course_id];
                const cat = course ? getCat(course.category) : null;
                const days = daysUntil(enrolment.due_date);
                const overdue = days !== null && days < 0 && enrolment.status !== "completed";
                return (
                  <div key={enrolment.id} className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-navy-50/50 transition-colors">
                    <div className="col-span-3 min-w-0">
                      <p className="text-sm font-semibold text-navy-800 truncate">{emp?.full_name ?? "—"}</p>
                      <p className="text-xs text-navy-400 truncate">{emp?.job_title ?? emp?.department ?? "—"}</p>
                    </div>
                    <div className="col-span-4 min-w-0">
                      {course && cat ? (
                        <div className="flex items-center gap-1.5">
                          <span className={`flex items-center justify-center h-5 w-5 rounded ${cat.color} shrink-0`}>
                            <Ico path={cat.icon} cls="h-3 w-3" />
                          </span>
                          <span className="text-sm text-navy-700 truncate">{course.title}</span>
                        </div>
                      ) : <span className="text-sm text-navy-400 italic">Removed</span>}
                    </div>
                    <div className="col-span-2 hidden md:flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-navy-100 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${enrolment.progress_pct}%` }} />
                      </div>
                      <span className="text-xs text-navy-500 w-8 text-right">{enrolment.progress_pct}%</span>
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${overdue ? "text-red-600" : "text-navy-500"}`}>
                        {enrolment.due_date ? fmtDate(enrolment.due_date) : "—"}
                        {overdue && <Ico path="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" cls="h-3.5 w-3.5 text-red-500" />}
                      </span>
                    </div>
                    <div className="col-span-1">
                      {isAdmin ? (
                        <EnrolmentStatusSelect enrolment={enrolment} />
                      ) : (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ENROLMENT_STATUSES[enrolment.status]?.cls ?? ""}`}>
                          {ENROLMENT_STATUSES[enrolment.status]?.label ?? enrolment.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <EmptyState iconPath="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" title="No enrolments found" sub={enrolments.length === 0 ? "Enrol employees in courses to start tracking their progress." : "Try adjusting your search."} action={isAdmin && enrolments.length === 0 ? { label: "Enrol employee", onClick: () => setEnrolCourseId("") } : undefined} />
        )
      )}

      {/* ── Certifications tab ── */}
      {tab === "certifications" && (
        filteredCerts.length > 0 ? (
          <div className="bg-white rounded-2xl border border-navy-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-navy-50 border-b border-navy-200 text-xs font-semibold text-navy-500 uppercase tracking-wide">
              <div className="col-span-3">Employee</div>
              <div className="col-span-3">Certification</div>
              <div className="col-span-2">Issuer</div>
              <div className="col-span-2">Issued</div>
              <div className="col-span-2">Expiry</div>
            </div>
            <div className="divide-y divide-navy-100">
              {filteredCerts.map((cert) => {
                const emp = empMap[cert.employee_id];
                const days = daysUntil(cert.expiry_date);
                const expiringSoon = days !== null && days >= 0 && days <= 60;
                const expired = days !== null && days < 0;
                return (
                  <div key={cert.id} className={`grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-navy-50/50 transition-colors ${isPending ? "opacity-50" : ""}`}>
                    <div className="col-span-3 min-w-0">
                      <p className="text-sm font-semibold text-navy-800 truncate">{emp?.full_name ?? "—"}</p>
                      <p className="text-xs text-navy-400 truncate">{emp?.job_title ?? "—"}</p>
                    </div>
                    <div className="col-span-3 min-w-0">
                      {cert.credential_url ? (
                        <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate block">{cert.name}</a>
                      ) : (
                        <span className="text-sm text-navy-800 truncate block">{cert.name}</span>
                      )}
                    </div>
                    <div className="col-span-2 text-sm text-navy-500 truncate">{cert.issuer ?? "—"}</div>
                    <div className="col-span-2 text-sm text-navy-500">{fmtDate(cert.issued_date)}</div>
                    <div className="col-span-2 flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${expired ? "text-red-600" : expiringSoon ? "text-amber-600" : "text-navy-500"}`}>
                        {fmtDate(cert.expiry_date)}
                        {expiringSoon && !expired && <Ico path="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" cls="h-3.5 w-3.5 text-amber-500" />}
                        {expired && <Ico path="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" cls="h-3.5 w-3.5 text-red-500" />}
                      </span>
                      {isAdmin && (
                        <button
                          type="button"
                          aria-label="Delete certification"
                          onClick={() => handleDeleteCert(cert.id)}
                          className="text-navy-300 hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <EmptyState iconPath="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" title="No certifications found" sub={certifications.length === 0 ? "Track employee certifications and credentials here." : "Try adjusting your search."} action={isAdmin && certifications.length === 0 ? { label: "Add certification", onClick: () => setShowCert(true) } : undefined} />
        )
      )}
    </>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  iconPath, title, sub, action,
}: {
  iconPath: string; title: string; sub: string; action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="text-center py-20 bg-white rounded-2xl border border-navy-200">
      <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-navy-100 flex items-center justify-center text-navy-400">
        <Ico path={iconPath} cls="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold text-navy-900 mb-1">{title}</h3>
      <p className="text-sm text-navy-500 mb-5">{sub}</p>
      {action && (
        <button type="button" onClick={action.onClick} className="inline-flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors">
          {action.label}
        </button>
      )}
    </div>
  );
}
