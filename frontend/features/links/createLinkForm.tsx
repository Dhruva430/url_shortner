"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Calendar24 } from "@components/calender";
import Input from "@/components/input";
import Switch from "@components/ui/switch";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinkData } from "@/features/links/types";
import { useEffect } from "react";
import { useFetchTitle } from "@/features/auth/hooks/useFetchTitle";

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

export default function CreateLinkForm({
  onSuccess,
}: {
  onSuccess?: (link: LinkData) => void;
}) {
  const [password, setPassword] = useState(false);
  const [expiry, setExpiry] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    getFieldState,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const expireTime = watch("expire_at");

  const onSubmit = async (data: FormData) => {
    try {
      console.log(data);
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

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();

      if (onSuccess) {
        onSuccess({
          id: result.id || Date.now().toString(),
          title: result.title || data.title,
          originalUrl: result.original_url || data.original_url,
          shortUrl: result.short_url,
          clicks: 0,
          createdAt: result.format,
          status: data.password
            ? "Protected"
            : data.expire_at && new Date(data.expire_at) < new Date()
            ? "Expired"
            : "Active",
          thumbnail: result.thumbnail || "https://via.placeholder.com/48",
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const originalUrl = watch("original_url");
  const { title } = useFetchTitle(originalUrl);
  useEffect(() => {
    const isTitleDirty = getFieldState("title").isDirty;

    if (!isTitleDirty) {
      setValue("title", title, { shouldDirty: false });
    }
  }, [title, setValue, watch]);
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
          <Switch checked={password} onCheckedChange={setPassword} />
          <label htmlFor="password protection " className="font-medium">
            Password Protection
          </label>
        </div>
        {
          <div
            className={cn(
              "grid grid-rows-[0fr]  transition-all opacity-0",
              password && "grid-rows-[1fr] opacity-100"
            )}
          >
            <div className="overflow-hidden">
              <label htmlFor="password" className="font-medium">
                Password *
              </label>
              <Input placeholder="Enter Password" {...register("password")} />
            </div>
          </div>
        }
      </div>
      <div className="flex flex-col gap-4 m-2">
        <div className="flex m-1 gap-2">
          <Switch checked={expiry} onCheckedChange={setExpiry} />
          <label htmlFor="password-protection " className="font-medium">
            Set Expiry Date & Time
          </label>
        </div>
        {
          <div
            className={cn(
              "grid grid-rows-[0fr]  transition-all opacity-0",
              expiry && "grid-rows-[1fr] opacity-100"
            )}
          >
            <div className="overflow-hidden">
              <label
                htmlFor="datepicker"
                className="block text-gray-800 font-medium mb-1"
              >
                Select Date & Time
              </label>
              <Calendar24
                onChange={(v) => setValue("expire_at", v)}
                value={expireTime}
              />
            </div>
          </div>
        }
        <button className="flex items-center w-38 gap-2 px-6 py-2 rounded-lg bg-darkBackground text-white hover:bg-black font-medium text-lg cursor-pointer transition duration-200 shadow-sm hover:shadow-md">
          Create Link
        </button>
      </div>
    </form>
  );
}
