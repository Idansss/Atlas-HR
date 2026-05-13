"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, MessageSquare, BookOpen, Wrench, FileText, Users,
  GraduationCap, Settings, HelpCircle, ChevronLeft, X, LogIn,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UsageMeter as BillingUsageMeter } from "@/components/billing/UsageMeter";
import { useSidebar } from "@/stores/sidebar-store";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/copilot", label: "Atlas Copilot", icon: MessageSquare },
  { href: "/knowledge", label: "Knowledge Hub", icon: BookOpen },
  { href: "/tools", label: "Tools & Generators", icon: Wrench },
  { href: "/templates", label: "Templates", icon: FileText },
  { href: "/community", label: "Community", icon: Users },
  { href: "/learning", label: "Learning", icon: GraduationCap },
];

const BOTTOM_ITEMS = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help", icon: HelpCircle },
];

function NavItem({
  href, label, icon: Icon, isCollapsed, onClick,
}: {
  href: string; label: string; icon: React.ElementType;
  isCollapsed: boolean; onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  const item = (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors [duration:280ms]",
        "hover:bg-[--bg-hover]",
        isActive
          ? "bg-[--accent-soft] text-[--text-primary] border-l-2 border-[--accent]"
          : "text-[--text-secondary] border-l-2 border-transparent",
        isCollapsed && "justify-center px-2"
      )}
    >
      <Icon className="shrink-0" size={18} />
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15, delay: isCollapsed ? 0 : 0.1 }}
            className="overflow-hidden whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={item} />
        <TooltipContent side="right" className="font-medium">{label}</TooltipContent>
      </Tooltip>
    );
  }
  return item;
}

function UserBlock({ isCollapsed }: { isCollapsed: boolean }) {
  const { user, profile, loading } = useUser();

  if (loading) {
    return (
      <div className={cn("mt-2 flex items-center gap-3 px-3 py-2.5", isCollapsed && "justify-center px-2")}>
        <div className="h-7 w-7 shrink-0 rounded-full bg-[--bg-hover] animate-pulse" />
        {!isCollapsed && <div className="h-3 w-24 rounded bg-[--bg-hover] animate-pulse" />}
      </div>
    );
  }

  if (!user || !profile) {
    const signInContent = (
      <Link
        href="/sign-in"
        className={cn(
          "mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[--text-secondary] hover:bg-[--bg-hover] hover:text-[--text-primary] transition-colors",
          isCollapsed && "justify-center px-2"
        )}
      >
        <LogIn size={18} className="shrink-0" />
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15, delay: 0.1 }}
              className="overflow-hidden whitespace-nowrap"
            >
              Sign in
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger render={signInContent} />
          <TooltipContent side="right" className="font-medium">Sign in</TooltipContent>
        </Tooltip>
      );
    }
    return signInContent;
  }

  const initials = (profile.full_name ?? user.email ?? "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const userBlock = (
    <Link
      href="/settings"
      className={cn(
        "mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-[--bg-hover] cursor-pointer transition-colors",
        isCollapsed && "justify-center px-2"
      )}
    >
      <Avatar className="h-7 w-7 shrink-0">
        {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? ""} />}
        <AvatarFallback className="bg-[--accent] text-[--primary-foreground] text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15, delay: 0.1 }}
            className="overflow-hidden"
          >
            <p className="whitespace-nowrap text-sm font-medium text-[--text-primary]">
              {profile.full_name ?? "My Account"}
            </p>
            <p className="whitespace-nowrap text-xs text-[--text-tertiary] capitalize">
              {profile.role} plan
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={userBlock} />
        <TooltipContent side="right" className="font-medium">
          {profile.full_name ?? user.email}
        </TooltipContent>
      </Tooltip>
    );
  }
  return userBlock;
}

export function Sidebar() {
  const { isCollapsed, toggle } = useSidebar();

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 280 }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
      className="relative flex h-full shrink-0 flex-col overflow-hidden border-r border-[--border]"
      style={{ background: "var(--bg-sidebar)" }}
    >
      {/* Logo + collapse */}
      <div className="flex h-16 items-center justify-between px-3 shrink-0">
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[--accent] text-[--primary-foreground] font-bold text-sm">A</div>
              <span className="whitespace-nowrap font-bold text-[--text-primary] text-base">Atlas HR</span>
            </motion.div>
          )}
        </AnimatePresence>

        {isCollapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-[--accent] text-[--primary-foreground] font-bold text-sm">A</div>
        )}

        <button
          type="button"
          onClick={toggle}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md text-[--text-tertiary] hover:bg-[--bg-hover] hover:text-[--text-primary] transition-colors",
            isCollapsed && "absolute right-1 top-4.5"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}>
            <ChevronLeft size={16} />
          </motion.div>
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-2">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} isCollapsed={isCollapsed} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="shrink-0 px-2 py-2">
        <Separator className="mb-2 bg-[--border]" />
        {BOTTOM_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} isCollapsed={isCollapsed} />
        ))}
        {!isCollapsed && (
          <BillingUsageMeter resource="tool_generation" period="month" className="mx-0 mb-2" />
        )}
        <UserBlock isCollapsed={isCollapsed} />
      </div>
    </motion.aside>
  );
}

export function MobileSidebar() {
  const { isMobileOpen, closeMobile } = useSidebar();
  const { user, profile, loading } = useUser();

  const initials = !loading && user && profile
    ? (profile.full_name ?? user.email ?? "U").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "HR";

  return (
    <AnimatePresence>
      {isMobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={closeMobile}
          />
          <motion.div
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col border-r border-[--border] lg:hidden"
            style={{ background: "var(--bg-sidebar)" }}
          >
            <div className="flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[--accent] text-[--primary-foreground] font-bold text-sm">A</div>
                <span className="font-bold text-[--text-primary] text-base">Atlas HR</span>
              </div>
              <button type="button" onClick={closeMobile} aria-label="Close menu" className="flex h-7 w-7 items-center justify-center rounded-md text-[--text-tertiary] hover:bg-[--bg-hover]">
                <X size={16} />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-2">
              {NAV_ITEMS.map((item) => (
                <NavItem key={item.href} {...item} isCollapsed={false} onClick={closeMobile} />
              ))}
            </nav>

            <div className="shrink-0 px-2 py-2">
              <Separator className="mb-2 bg-[--border]" />
              {BOTTOM_ITEMS.map((item) => (
                <NavItem key={item.href} {...item} isCollapsed={false} onClick={closeMobile} />
              ))}
              <BillingUsageMeter resource="tool_generation" period="month" className="mx-0 mb-2" />

              {user && profile ? (
                <Link
                  href="/settings"
                  onClick={closeMobile}
                  className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-[--bg-hover] cursor-pointer transition-colors"
                >
                  <Avatar className="h-7 w-7 shrink-0">
                    {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt="" />}
                    <AvatarFallback className="bg-[--accent] text-[--primary-foreground] text-xs font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-[--text-primary]">{profile.full_name ?? "My Account"}</p>
                    <p className="text-xs text-[--text-tertiary] capitalize">{profile.role} plan</p>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={closeMobile}
                  className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-[--bg-hover] transition-colors"
                >
                  <LogIn size={18} className="text-[--text-secondary]" />
                  <p className="text-sm font-medium text-[--text-primary]">Sign in</p>
                </Link>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
