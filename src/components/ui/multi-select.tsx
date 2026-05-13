"use client"

import * as React from "react"
import { Command } from "cmdk"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronDown, Search, X } from "lucide-react"

import { cn } from "@/lib/utils"

export type MultiSelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export type MultiSelectProps = {
  options: MultiSelectOption[]
  value?: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  id?: string
  name?: string
  className?: string
  triggerClassName?: string
  "aria-label"?: string
  "aria-labelledby"?: string
}

function assignRef<T>(ref: React.ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") {
    ref(value)
  } else if (ref) {
    ref.current = value
  }
}

const panelMotion = {
  initial: { opacity: 0, scale: 0.95, y: -4 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.18, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -4,
    transition: { duration: 0.15, ease: "easeIn" },
  },
} as const

const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      options,
      value = [],
      onValueChange,
      placeholder = "Select...",
      searchPlaceholder = "Search...",
      emptyMessage = "No results found.",
      disabled = false,
      id,
      name,
      className,
      triggerClassName,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
    },
    ref
  ) => {
    const generatedId = React.useId()
    const listId = `${id ?? generatedId}-listbox`
    const rootRef = React.useRef<HTMLDivElement>(null)
    const triggerRef = React.useRef<HTMLDivElement | null>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")
    const selectedOptions = value
      .map((selectedValue) => options.find((option) => option.value === selectedValue))
      .filter((option): option is MultiSelectOption => Boolean(option))

    const setTriggerRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        triggerRef.current = node
        assignRef(ref, node)
      },
      [ref]
    )

    const close = React.useCallback(() => {
      setOpen(false)
      setSearch("")
    }, [])

    React.useEffect(() => {
      if (!open) {
        return
      }

      const frame = requestAnimationFrame(() => inputRef.current?.focus())
      return () => cancelAnimationFrame(frame)
    }, [open])

    React.useEffect(() => {
      if (!open) {
        return
      }

      function handlePointerDown(event: PointerEvent) {
        if (!rootRef.current?.contains(event.target as Node)) {
          close()
        }
      }

      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") {
          close()
          triggerRef.current?.focus()
        }
      }

      document.addEventListener("pointerdown", handlePointerDown)
      document.addEventListener("keydown", handleKeyDown)

      return () => {
        document.removeEventListener("pointerdown", handlePointerDown)
        document.removeEventListener("keydown", handleKeyDown)
      }
    }, [close, open])

    function toggleOption(option: MultiSelectOption) {
      if (option.disabled) {
        return
      }

      const selected = value.includes(option.value)
      onValueChange(
        selected
          ? value.filter((currentValue) => currentValue !== option.value)
          : [...value, option.value]
      )
    }

    function removeValue(selectedValue: string) {
      onValueChange(value.filter((currentValue) => currentValue !== selectedValue))
    }

    function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
      if (disabled) {
        return
      }

      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        setOpen(true)
        return
      }

      if (event.key === "Backspace" && value.length > 0) {
        event.preventDefault()
        removeValue(value[value.length - 1])
        return
      }

      if (
        event.key.length === 1 &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey
      ) {
        setSearch(event.key)
        setOpen(true)
      }
    }

    return (
      <div ref={rootRef} className={cn("relative w-full", className)}>
        {name
          ? value.map((selectedValue) => (
              <input
                key={selectedValue}
                name={`${name}[]`}
                value={selectedValue}
                type="hidden"
                readOnly
              />
            ))
          : null}
        <div
          ref={setTriggerRef}
          id={id}
          role="combobox"
          tabIndex={disabled ? -1 : 0}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-disabled={disabled}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          onClick={() => {
            if (!disabled) {
              setOpen((current) => !current)
            }
          }}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            "flex min-h-10 w-full cursor-default items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-input)] px-2 py-1.5 text-sm text-[var(--text-primary)] outline-none transition-[background-color,border-color,box-shadow,color] [duration:280ms] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30",
            open && "border-[var(--accent)]",
            disabled && "cursor-not-allowed opacity-50",
            triggerClassName
          )}
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex max-w-full items-center gap-1 rounded-md bg-[var(--accent-soft)] px-2 py-1 text-xs font-medium text-[var(--accent)]"
                >
                  <span className="truncate">{option.label}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${option.label}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      removeValue(option.value)
                    }}
                    onPointerDown={(event) => event.stopPropagation()}
                    className="flex size-4 items-center justify-center rounded-sm text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--primary-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </span>
              ))
            ) : (
              <span className="px-1 text-[var(--text-tertiary)]">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={cn(
              "shrink-0 text-[var(--text-secondary)] transition-transform [duration:280ms]",
              open && "rotate-180"
            )}
          />
        </div>
        <span className="sr-only" aria-live="polite">
          {selectedOptions.length > 0
            ? `${selectedOptions.map((option) => option.label).join(", ")} selected`
            : "No options selected"}
        </span>

        <AnimatePresence>
          {open ? (
            <motion.div
              key="multi-select-panel"
              {...panelMotion}
              className="absolute left-0 top-[calc(100%+4px)] z-50 w-full origin-top rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-1 text-[var(--text-primary)] shadow-[var(--shadow-dropdown)]"
            >
              <Command shouldFilter loop className="w-full">
                <div className="flex h-10 items-center gap-2 border-b border-[var(--border)] px-2">
                  <Search size={15} aria-hidden="true" className="shrink-0 text-[var(--text-tertiary)]" />
                  <Command.Input
                    ref={inputRef}
                    value={search}
                    onValueChange={setSearch}
                    placeholder={searchPlaceholder}
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
                  />
                </div>
                <Command.List
                  id={listId}
                  role="listbox"
                  aria-multiselectable="true"
                  className="max-h-80 overflow-y-auto scroll-smooth py-1"
                >
                  <Command.Empty className="px-2 py-6 text-center text-sm text-[var(--text-tertiary)]">
                    {emptyMessage}
                  </Command.Empty>
                  {options.map((option) => {
                    const selected = value.includes(option.value)

                    return (
                      <Command.Item
                        key={option.value}
                        value={`${option.label} ${option.value}`}
                        disabled={option.disabled}
                        data-current={selected ? "true" : undefined}
                        onSelect={() => toggleOption(option)}
                        className="relative flex min-h-9 cursor-default select-none items-center gap-2 rounded-md py-2 pr-8 pl-2 text-sm text-[var(--text-primary)] outline-none transition-colors data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-[var(--bg-hover)] data-[current=true]:bg-[var(--accent-soft)] data-[current=true]:text-text-primary"
                      >
                        <span className="min-w-0 flex-1 truncate">{option.label}</span>
                        {selected ? (
                          <Check
                            size={16}
                            aria-hidden="true"
                            className="absolute right-2 text-[var(--accent)]"
                          />
                        ) : null}
                      </Command.Item>
                    )
                  })}
                </Command.List>
              </Command>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    )
  }
)

MultiSelect.displayName = "MultiSelect"

export { MultiSelect }
