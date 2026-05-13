"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn(
        "flex min-w-0 flex-1 items-center text-left text-[var(--text-primary)] data-[placeholder]:text-[var(--text-tertiary)]",
        className
      )}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-input)] px-3 text-sm text-[var(--text-primary)] outline-none transition-[background-color,border-color,box-shadow,color] [duration:280ms] placeholder:text-[var(--text-tertiary)] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-[var(--text-tertiary)] data-[popup-open]:border-[var(--accent)] aria-invalid:border-[var(--danger)] aria-invalid:ring-2 aria-invalid:ring-[var(--danger)]/20 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        className="flex shrink-0 items-center text-[var(--text-secondary)] transition-transform [duration:280ms] data-[popup-open]:rotate-180"
        render={<ChevronDown size={16} aria-hidden="true" />}
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            "relative isolate z-50 max-h-[min(var(--available-height),20rem)] w-[var(--anchor-width)] min-w-40 origin-[var(--transform-origin)] overflow-x-hidden overflow-y-auto scroll-smooth rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-1 text-[var(--text-primary)] shadow-[var(--shadow-dropdown)] outline-none transition-[opacity,transform] duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-[ending-style]:duration-[280ms] data-[ending-style]:ease-[cubic-bezier(0.32,0.72,0,1)] data-[ending-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:-translate-y-1 data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:-translate-y-1",
            className
          )}
          {...props}
        >
          <AnimatePresence>
            <motion.div
              key="select-motion"
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { duration: 0.18, ease: "easeOut" },
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: -4,
                transition: { duration: 0.15, ease: "easeIn" },
              }}
            >
              <SelectScrollUpButton />
              <SelectPrimitive.List>{children}</SelectPrimitive.List>
              <SelectScrollDownButton />
            </motion.div>
          </AnimatePresence>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn(
        "px-2 py-1.5 text-xs font-medium text-[var(--text-tertiary)]",
        className
      )}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex min-h-9 w-full cursor-default select-none items-center gap-2 rounded-md py-2 pr-8 pl-2 text-sm text-[var(--text-primary)] outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-[var(--bg-hover)] data-[selected]:bg-[var(--accent-soft)] data-selected:text-text-primary",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex min-w-0 flex-1 items-center gap-2 truncate">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center text-[var(--accent)]" />
        }
      >
        <Check size={16} aria-hidden="true" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="select-separator"
      role="separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-[var(--border)]", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-[var(--bg-card)] py-1 text-[var(--text-secondary)]",
        className
      )}
      {...props}
    >
      <ChevronUp size={16} aria-hidden="true" />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-[var(--bg-card)] py-1 text-[var(--text-secondary)]",
        className
      )}
      {...props}
    >
      <ChevronDown size={16} aria-hidden="true" />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
