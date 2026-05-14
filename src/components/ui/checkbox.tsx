"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer flex size-4 shrink-0 items-center justify-center rounded border border-[var(--border)] bg-[var(--bg-input)] outline-none transition-[border-color,box-shadow,background-color] [duration:280ms] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-[var(--accent)] data-checked:bg-[var(--accent)] data-checked:text-[var(--primary-foreground)]",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className="flex text-current data-[unchecked]:hidden"
        keepMounted
      >
        <Check className="size-3" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
