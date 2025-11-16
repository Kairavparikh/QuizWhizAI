"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
}: ConfirmDialogProps) {
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
      case "danger":
        return {
          icon: "text-red-600 dark:text-red-400",
          confirmBtn: "bg-red-600 hover:bg-red-700 text-white",
        };
      case "warning":
        return {
          icon: "text-yellow-600 dark:text-yellow-400",
          confirmBtn: "bg-yellow-600 hover:bg-yellow-700 text-white",
        };
      case "info":
        return {
          icon: "text-blue-600 dark:text-blue-400",
          confirmBtn: "bg-blue-600 hover:bg-blue-700 text-white",
        };
    }
  };

  const styles = getVariantStyles();

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl">
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {title}
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

        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onClose} variant="outline" className="flex-1">
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 ${styles.confirmBtn}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
