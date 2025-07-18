"use client";

import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Input from "@/components/input";

type FormFields = {
  password: string;
};

export default function RedirectWithPassword() {
  const { shortcode } = useParams() as { shortcode: string };
  const [error, setError] = useState("");

  const { register, handleSubmit, formState } = useForm<FormFields>();

  const onSubmit = async (data: FormFields) => {
    setError("");

    try {
      const res = await fetch(`/s/${shortcode}/unlock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: data.password }),
        redirect: "follow",
      });

      if (res.ok) {
        const { original_url } = await res.json();
        window.location.href = original_url;
      } else {
        const data = await res.json();
        setError(data.error || "Failed to verify password");
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white p-6 shadow-lg rounded-2xl flex flex-col gap-5"
      >
        <h2 className="text-xl font-bold text-center">Enter Password</h2>
        <p className="text-sm text-gray-600 text-center">
          This link is protected. Please enter the password to continue.
        </p>

        <Input
          type="password"
          label="Password"
          placeholder="Enter password"
          {...register("password", { required: true })}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-darkBackground text-white py-2 rounded-md hover:bg-opacity-90 transition"
          disabled={formState.isSubmitting}
        >
          {formState.isSubmitting ? "Verifying..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
