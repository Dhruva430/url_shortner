"use client";
import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Calendar24 } from "@components/calender";
import Input from "@/components/input";
import { Switch } from "@components/ui/switch";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import PasswordInput from "@components/passwordinput";
import { useEffect } from "react";
import { useFetchTitle } from "@/features/auth/hooks/useFetchTitle";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  original_url: z
    .string()
    .url("Please enter a valid URL")
    .min(30, "We Need a longer URL"),
  title: z.string().min(1, "Title is required"),
  shortcode: z.string().max(8, "").optional(),
  password: z.string().optional(),
  expire_at: z.date().optional(),
});

type FormData = z.infer<typeof schema>;

type CreateLinkFormProps = {
  onClose: () => void;
};

export default function CreateLinkForm({ onClose }: CreateLinkFormProps) {
  const [password, setPassword] = useState(false);
  const [expiry, setExpiry] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    getFieldState,
    control,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const queryClient = useQueryClient();
  const onSubmit = async (data: FormData) => {
    const response = await fetch(
      "http://localhost:8080/api/protected/shorten",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Network response was not ok");
    }
    queryClient.invalidateQueries({ queryKey: ["links"] });
    onClose();
  };

  const originalUrl = watch("original_url");
  const { title } = useFetchTitle(originalUrl);

  useEffect(() => {
    const isTitleDirty = getFieldState("title").isDirty;

    if (!isTitleDirty) {
      setValue("title", title, { shouldDirty: false });
    }
  }, [title, setValue, getFieldState]);

  const expireAt = useWatch({
    control: control,
    name: "expire_at",
  });
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="text-black flex flex-col p-2"
    >
      <div className="m-2 grid gap-2">
        <label className="font-medium text-gray-800" htmlFor="original-url">
          Original URL *
        </label>
        <Input
          type="text"
          id="original-url"
          placeholder="Enter the original URL"
          required
          {...register("original_url")}
        />
        <div className="">
          <label className="font-medium text-gray-800" htmlFor="title">
            Title *
          </label>
          <Input
            type="text"
            id="title"
            placeholder="My Website"
            required
            {...register("title")}
          />
        </div>
        <div>
          <label className="font-medium text-gray-800" htmlFor="custom-slug">
            Shortcode
          </label>
          <Input
            type="text"
            placeholder="Enter shortcode"
            {...register("shortcode")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 m-2">
        <div className="flex m-1 gap-2">
          <Switch id="expiry" checked={expiry} onCheckedChange={setExpiry} />
          <Label htmlFor="expiry">Expiry Date</Label>
        </div>

        <div
          className={cn(
            "grid transition-all duration-300",
            expiry
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 pointer-events-none"
          )}
        >
          <div className="overflow-hidden">
            <label
              htmlFor="datepicker"
              className="block text-gray-800 font-medium mb-1"
            >
              Select Date &amp; Time
            </label>
            <Calendar24
              onChange={(v) => setValue("expire_at", v)}
              value={expireAt}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 m-2">
        <div className="flex m-1 gap-2">
          <Switch
            id="password"
            checked={password}
            onCheckedChange={setPassword}
          />
          <Label htmlFor="password">Set Password</Label>
        </div>
        <div
          className={cn(
            "grid transition-all duration-300",
            password
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 pointer-events-none"
          )}
        >
          <div className="overflow-hidden">
            <label htmlFor="password-input" className="font-medium">
              Password&nbsp;*
            </label>
            <PasswordInput
              id="password-input"
              placeholder="Enter Password"
              {...register("password")}
              disabled={!password}
            />
          </div>
        </div>
        <button className="flex items-center w-38 gap-2 px-6 py-2 rounded-lg bg-darkBackground text-white hover:bg-black font-medium text-lg cursor-pointer transition duration-200 shadow-sm hover:shadow-md">
          Create Link
        </button>
      </div>
    </form>
  );
}
