"use client";
import React from "react";
import Input from "@/components/input";
import { XIcon } from "lucide-react";
import Link from "next/link";
import z from "zod";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  identifier: z.string().min(2, "Email/Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });
  const onSubmit = async (data: LoginSchema) => {
    const url = "http://localhost:8080/api/login";
    const { identifier, password } = data;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      router.push("/");
      // Handle successful login here
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleError = (error: FieldErrors<LoginSchema>) => {
    console.error("Form submission error:", error);
  };
  return (
    <form className="mt-8" onSubmit={handleSubmit(onSubmit, handleError)}>
      <div className="mb-4">
        <label className="block text-[18px] mb-2" htmlFor="email">
          Username/Email
          <span className="text-red-500"> *</span>
        </label>
        <Input
          {...register("identifier")}
          type="text"
          id="email"
          placeholder="Enter your email or username"
        />
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
          <p className="text-red-500 text-sm mt-1">Incorrect Credentials</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-accent text-white p-2 rounded hover:bg-[#003135] transition-colors"
      >
        Login
      </button>

      <div className="justify-between flex mt-4">
        <div className="relative">
          <div className="flex justify-center gap-2">
            <input type="checkbox" id="remember-me" className="sr-only peer" />
            <label
              htmlFor="remember-me"
              className="size-6 border-2 border-gray-300 bg-white flex justify-center items-center cursor-pointer peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"
            >
              <XIcon className="size-4 text-black opacity-0 peer-checked:opacity-100 transition-opacity" />
            </label>
            <label
              htmlFor="remember-me"
              className="cursor-pointer select-none text-[18px]"
            >
              Remember Me
            </label>
          </div>
        </div>
        {/* #TODO: ADD End boundary */}
        <Link
          href={"/forget-password"}
          className={"text-blue-600 hover:underline visited:text-purple-600"}
        >
          Forget Password
        </Link>
      </div>
    </form>
  );
}
