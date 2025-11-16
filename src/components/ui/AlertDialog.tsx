"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";
import { AlertCircle, CheckCircle, Info, XCircle, X } from "lucide-react";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  variant?: "success" | "error" | "warning" | "info";
  buttonText?: string;
}

export function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  variant = "info",
  buttonText = "OK",
}: AlertDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;
  if (typeof window === "undefined") return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          icon: CheckCircle,
          iconColor: "text-green-600 dark:text-green-400",
          title: title || "Success",
        };
      case "error":
        return {
          icon: XCircle,
          iconColor: "text-red-600 dark:text-red-400",
          title: title || "Error",
        };
      case "warning":
        return {
          icon: AlertCircle,
          iconColor: "text-yellow-600 dark:text-yellow-400",
          title: title || "Warning",
        };
      case "info":
        return {
          icon: Info,
          iconColor: "text-blue-600 dark:text-blue-400",
          title: title || "Information",
        };
    }
  };

  const { icon: Icon, iconColor, title: defaultTitle } = getVariantStyles();

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl">
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Icon className={`w-6 h-6 ${iconColor}`} />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {title || defaultTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400">{message}</p>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onClose} className="min-w-[100px]">
            {buttonText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
