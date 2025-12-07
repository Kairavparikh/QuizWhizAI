'use client';

import { useSidebar } from "./SidebarProvider";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function MainContent({
  children,
  hasUser
}: {
  children: ReactNode;
  hasUser?: boolean;
}) {
  const { isOpen } = useSidebar();

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out min-h-screen",
        hasUser && isOpen ? "ml-72" : "ml-0"
      )}
    >
      {children}
    </div>
  );
}
