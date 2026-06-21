import type { ReactNode } from "react";

// Root layout is a passthrough; the real <html>/<body> live in
// app/[locale]/layout.tsx so the document language matches the active locale.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
