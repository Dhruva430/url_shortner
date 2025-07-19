"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

interface NotificationProps {
  message: string;
  type: "success" | "error" | "warning";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function SlideNotification({
  message,
  type,
  isVisible,
  onClose,
  duration = 5000,
}: NotificationProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-900/90 border-green-500";
      case "error":
        return "bg-red-900/90 border-red-500";
      case "warning":
        return "bg-yellow-900/90 border-yellow-500";
    }
  };

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 transform transition-all duration-500 ease-in-out ${
        isVisible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
      }`}
    >
      <div
        className={`flex items-center gap-3 p-4 rounded-lg border backdrop-blur-sm shadow-lg max-w-sm ${getBgColor()}`}
      >
        {getIcon()}
        <p className="text-white text-sm font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-gray-300 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
