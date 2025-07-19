"use client";

import { useState } from "react";
import AuthInput from "@/components/authInput";
import { XIcon } from "lucide-react";
import Link from "next/link";
import z from "zod";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import SlideNotification from "@/app/login/slide-notification";

const loginSchema = z.object({
  identifier: z.string().min(2, "Email/Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginSchema = z.infer<typeof loginSchema>;

interface NotificationState {
  message: string;
  type: "success" | "error" | "warning";
  isVisible: boolean;
}

export default function LoginForm() {
  const router = useRouter();
  const [notification, setNotification] = useState<NotificationState>({
    message: "",
    type: "success",
    isVisible: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const showNotification = (
    message: string,
    type: "success" | "error" | "warning"
  ) => {
    setNotification({
      message,
      type,
      isVisible: true,
    });
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  const onSubmit = async (data: LoginSchema) => {
    const url = "/api/login";
    const { identifier, password } = data;

    setIsLoading(true);
    clearErrors();

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ identifier, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle different error types
        switch (response.status) {
          case 404:
            setError("identifier", {
              type: "manual",
              message: "User not found. Please register first.",
            });
            showNotification("User not found. Please register first.", "error");
            break;
          case 401:
            setError("password", {
              type: "manual",
              message: "Incorrect password",
            });
            showNotification("Incorrect password. Please try again.", "error");
            break;
          case 400:
            if (result.message?.includes("email")) {
              setError("identifier", {
                type: "manual",
                message: "Invalid email format",
              });
              showNotification("Please enter a valid email address.", "error");
            } else {
              showNotification(
                result.message || "Invalid credentials",
                "error"
              );
            }
            break;
          default:
            showNotification("Login failed. Please try again.", "error");
        }
        return;
      }

      // Success
      showNotification("Login successful! Redirecting...", "success");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      showNotification("Network error. Please check your connection.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (error: FieldErrors<LoginSchema>) => {
    console.error("Form submission error:", error);
  };

  return (
    <>
      <form
        className="mt-6 sm:mt-8 text-white space-y-4 sm:space-y-6"
        onSubmit={handleSubmit(onSubmit, handleError)}
      >
        <div className="space-y-2">
          <label
            className="block text-sm sm:text-base lg:text-lg font-medium"
            htmlFor="email"
          >
            Username/Email
            <span className="text-red-500"> *</span>
          </label>
          <AuthInput
            {...register("identifier")}
            type="text"
            id="email"
            placeholder="Enter your email or username"
            className="w-full"
          />
          {errors.identifier && (
            <p className="text-red-400 text-xs sm:text-sm mt-1 animate-pulse">
              {errors.identifier.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            className="block text-sm sm:text-base lg:text-lg font-medium"
            htmlFor="password"
          >
            Password
            <span className="text-red-500"> *</span>
          </label>
          <AuthInput
            {...register("password")}
            type="password"
            id="password"
            placeholder="Enter your password"
            className="w-full"
          />
          {errors.password && (
            <p className="text-red-400 text-xs sm:text-sm mt-1 animate-pulse">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 sm:py-4 bg-accent text-white font-medium rounded-lg hover:bg-[#003135] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Logging in...
            </div>
          ) : (
            "Login"
          )}
        </button>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 pt-2">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember-me" className="sr-only peer" />
            <label
              htmlFor="remember-me"
              className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 bg-white flex justify-center items-center cursor-pointer peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors rounded"
            >
              <XIcon className="w-3 h-3 sm:w-4 sm:h-4 text-black opacity-0 peer-checked:opacity-100 transition-opacity" />
            </label>
            <label
              htmlFor="remember-me"
              className="cursor-pointer select-none text-sm sm:text-base"
            >
              Remember Me
            </label>
          </div>

          <Link
            href="/forget-password"
            className="text-blue-400 hover:text-blue-300 hover:underline visited:text-purple-400 text-sm sm:text-base transition-colors"
          >
            Forgot Password?
          </Link>
        </div>
      </form>

      <SlideNotification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </>
  );
}
