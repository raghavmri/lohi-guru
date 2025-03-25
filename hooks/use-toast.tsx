"use client";

import { useState, useEffect, createContext, useContext } from "react";

type ToastType = "default" | "success" | "error" | "warning";

type Toast = {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
};

type ToastContextType = {
  toasts: Toast[];
  toast: (props: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({
    title,
    description,
    type = "default",
    duration = 5000,
  }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, description, type, duration };
    setToasts((prev) => [...prev, newToast]);

    if (duration !== Infinity) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const dismissAll = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, dismissAll }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer = () => {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-md shadow-md ${
            toast.type === "success"
              ? "bg-green-100 text-green-800"
              : toast.type === "error"
              ? "bg-red-100 text-red-800"
              : toast.type === "warning"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-white text-gray-800"
          }`}
        >
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{toast.title}</h3>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          {toast.description && (
            <p className="mt-1 text-sm">{toast.description}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
