"use client";

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map(({ id, title, description, variant, ...props }) => (
        <ToastItem
          key={id}
          id={id}
          title={title}
          description={description}
          variant={variant}
          dismiss={dismiss}
          {...props}
        />
      ))}
    </div>
  );
}

function ToastItem({
  id,
  title,
  description,
  variant,
  dismiss,
}: {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  dismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      dismiss(id);
    }, 2000);

    return () => clearTimeout(timer);
  }, [id, dismiss]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dismiss(id);
  };

  return (
    <div
      className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-12 shadow-lg transition-all ${
        variant === "destructive"
          ? "border-red-500 bg-red-500 text-white"
          : "border-gray-700 bg-gray-800 text-white"
      }`}
    >
      <div className="grid gap-1 flex-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && (
          <div className="text-sm opacity-90">{description}</div>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity hover:bg-white/10"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
