import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  children,
  padding = "md",
  className = "",
  ...props
}: CardProps) {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      {...props}
      className={`rounded-2xl bg-white shadow-sm dark:bg-gray-800 ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  );
}