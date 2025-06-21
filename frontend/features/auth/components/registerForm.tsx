"use client";
import React from "react";
import Input from "@/components/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import UsernameInput from "./usernameInput";

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
  });

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    const url = "http://localhost:8080/api/register";
    const { username, email, password } = data;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleError = (error: any) => {
    console.error("Form submission error:", error);
    // Handle form submission error logic here
  };
  console.log("render");
  return (
    <form onSubmit={handleSubmit(onSubmit, handleError)} className="mt-8">
      <UsernameInput register={register} errors={errors} control={control} />
      <div className="mb-4">
        <label className="block text-[18px] mb-2" htmlFor="email">
          Email
          <span className="text-red-500"> *</span>
        </label>
        <Input
          {...register("email")}
          type="email"
          id="email"
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-[18px] mb-2" htmlFor="password">
          Password <span className="text-red-500"> *</span>
        </label>
        <Input
          {...register("password")}
          type="password"
          id="password"
          placeholder="Enter your password"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-[18px] mb-2" htmlFor="confirm-password">
          Confirm Password <span className="text-red-500"> *</span>
        </label>
        <Input
          {...register("confirmPassword")}
          type="password"
          id="confirm-password"
          placeholder="Enter your password"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-accent text-white p-2 rounded hover:bg-[#003135] transition-colors"
      >
        Create Account
      </button>

      <div className="flex flex-col justify-center items-center mt-4 text-[14px] text-gray-400 text-center">
        <span>
          By signing up, you agree to our Terms, Privacy Policy and Cookies
          Policy.
        </span>
      </div>
    </form>
  );
}
