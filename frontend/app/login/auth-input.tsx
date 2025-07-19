import type React from "react";
import { forwardRef } from "react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-sm sm:text-base ${className}`}
        {...props}
      />
    );
  }
);

AuthInput.displayName = "AuthInput";

export default AuthInput;
