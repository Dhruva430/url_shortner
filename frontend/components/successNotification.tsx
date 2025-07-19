"use client";

import { CheckCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

interface SuccessNotificationProps {
  show: boolean;
  message: string;
  onClose?: () => void;
}

export default function SuccessNotification({
  show,
  message,
  onClose,
}: SuccessNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleClose = () => {
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`
          bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-[400px]
          transform transition-all duration-300 ease-in-out
          ${show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        `}
      >
        <CheckCircle className="size-5 flex-shrink-0" />
        <span className="flex-1 text-sm sm:text-base">{message}</span>
        <button
          onClick={handleClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
