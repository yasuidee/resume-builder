import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({
  className,
  children,
  optional,
  required,
  ...props
}: React.ComponentProps<"label"> & {
  optional?: boolean;
  required?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex items-center gap-2 text-sm font-medium text-slate-800",
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="text-xs text-red-500">必須</span>}
      {optional && (
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-normal text-slate-500">
          任意
        </span>
      )}
    </label>
  );
}
