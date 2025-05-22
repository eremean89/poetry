"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

function Progress({
  className,
  value = 0,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { value?: number }) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-gray-300",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full bg-[#996633] transition-[width] duration-700 ease-in-out"
        style={{ width: `${value}%` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
