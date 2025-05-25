import * as React from "react";

export function Card({ className, ...props }) {
  return (
    <div className={`rounded-xl border bg-card text-card-foreground shadow ${className}`} {...props} />
  );
}

export function CardContent({ className, ...props }) {
  return (
    <div className={`p-4 ${className}`} {...props} />
  );
}
