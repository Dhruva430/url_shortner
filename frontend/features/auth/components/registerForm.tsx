"use client";

import AuthInput from "@/components/authInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import UsernameInput from "@/components/checkUsername";
import EmailInput from "@/components/checkEmail";
import { useState } from "react";
import SlideNotification from "@/app/login/slide-notification";
import { useRouter } from "next/navigation";

const registerSchema = z
  .object({
    username: z.string().min(2, "Username is required"),
    email: z
      .string()
      .email("Invalid email address")
      .min(1, "Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterSchema = z.infer<typeof registerSchema>;

interface NotificationState {
  message: string;
  type: "success" | "error" | "warning";
  isVisible: boolean;
}

interface RegisterFormProps {
  onSuccess?: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const {
    register,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  const Router = useRouter();
  const [notification, setNotification] = useState<NotificationState>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const showNotification = (
    message: string,
    type: "success" | "error" | "warning"
  ) => {
    setNotification({ message, type, isVisible: true });
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  const onSubmit = async (data: RegisterSchema) => {
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        switch (response.status) {
          case 401:
            setError("password", {
              type: "manual",
              message: "Incorrect password",
            });
            showNotification(result.error, "error");
            break;
          case 400:
            if (result.message?.includes("email")) {
              setError("email", {
                type: "manual",
                message: "Invalid email format",
              });
              showNotification(result.error, "error");
            } else {
              showNotification(
                result.message || "Invalid credentials",
                "error"
              );
            }
            break;
          default:
            showNotification(result.error, "error");
        }
      }

      showNotification("Account created successfully!", "success");
      Router.push("/login");
      setTimeout(() => {
        onSuccess?.();
      }, 3000);
    } catch {
      showNotification("Something went wrong. Please try again.", "error");
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 sm:space-y-6 text-white mt-6 sm:mt-8"
      >
        <UsernameInput register={register} errors={errors} control={control} />
        <EmailInput register={register} errors={errors} control={control} />

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm sm:text-base lg:text-lg font-medium"
          >
            Password <span className="text-red-500">*</span>
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

        <div className="space-y-2">
          <label
            htmlFor="confirm-password"
            className="block text-sm sm:text-base lg:text-lg font-medium"
          >
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <AuthInput
            {...register("confirmPassword")}
            type="password"
            id="confirm-password"
            placeholder="Confirm your password"
            className="w-full"
          />
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs sm:text-sm mt-1 animate-pulse">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 sm:py-4 bg-accent text-white font-medium rounded-lg hover:bg-[#003135] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating Account...
            </div>
          ) : (
            "Create Account"
          )}
        </button>

        <div className="text-xs sm:text-sm text-gray-400 text-center px-2">
          By signing up, you agree to our Terms, Privacy Policy and Cookies
          Policy.
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
