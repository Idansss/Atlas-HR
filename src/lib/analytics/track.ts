"use client";

import { isAnalyticsReady, posthog } from "./posthog";

// All client-side events and their required properties.
// Adding a new event? Add it here first, then to docs/tracking-plan.md.
type EventMap = {
  // Acquisition
  signup_started: { source: "pricing" | "landing" | "invite" | "direct" };
  signup_completed: {
    source: string;
    country?: string;
    industry?: string;
    company_size?: string;
    goals_count: number;
  };
  oauth_initiated: { provider: "google" | "linkedin" };
  onboarding_step_completed: { step: 1 | 2 | 3; time_on_step_seconds: number };
  onboarding_completed: { total_time_seconds: number };

  // Tools (client events)
  tool_viewed: { tool_slug: string; category: string };
  tool_output_copied: { tool_slug: string };
  tool_output_downloaded: { tool_slug: string; format: "docx" };
  tool_output_regenerated: { tool_slug: string };

  // Knowledge
  article_viewed: {
    category: string;
    slug: string;
    source: "direct" | "search" | "related";
  };
  article_saved: { category: string; slug: string };
  article_helpful_voted: { category: string; slug: string; helpful: boolean };
  glossary_term_clicked: { term: string };
  country_guide_viewed: { country: string };
  industry_guide_viewed: { industry: string };

  // Templates
  template_viewed: { template_slug: string; category: string };
  template_downloaded: { template_slug: string; format: string };
  template_premium_lock_clicked: { template_slug: string };

  // Copilot (client events — open/close)
  copilot_opened: { source: "panel_button" | "ask_about_button" | "standalone" };

  // Community (client events)
  community_thread_viewed: { thread_id: string; category: string };
  community_voted: { target_type: "thread" | "reply"; target_id: string; voted: boolean };
  community_reply_created: { thread_id: string };

  // Monetisation (client events)
  pricing_viewed: { source: string };
  upgrade_dialog_shown: { trigger_feature: string };
  upgrade_dialog_clicked: { trigger_feature: string; target_plan: string };
  usage_limit_hit: { resource: string; plan: string };

  // Engagement
  theme_changed: { from: string; to: string };
  accent_changed: { from: string; to: string };
  appearance_mode_changed: { theme: string; accent: string };
  search_performed: { query_chars: number; results_count: number };
};

export function track<T extends keyof EventMap>(
  event: T,
  properties: EventMap[T]
) {
  if (typeof window === "undefined") return;
  if (!isAnalyticsReady()) return;
  posthog.capture(event as string, properties as Record<string, unknown>);
}
