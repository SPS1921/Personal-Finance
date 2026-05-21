import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        outline: "border border-border",
        success: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
        warning: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
        danger: "bg-red-500/10 text-red-500 border border-red-500/20",
        info: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
