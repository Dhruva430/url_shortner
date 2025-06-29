"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Switch from "@components/ui/switch";
import Input from "@/components/input";
import { Calendar24 } from "@components/calender";
import { cn } from "@/lib/utils";

const EditLinkSchema = z.object({
  title: z.string().min(1, "Title is required"),
  originalURL: z.string().url("Enter a valid URL"),
  expireAt: z.string().optional(),
  password: z.string().optional(),
});

export type EditLinkData = z.infer<typeof EditLinkSchema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialData: EditLinkData;
  onSave: (updated: Partial<EditLinkData>) => void;
  shortCode: string;
};

export default function EditLinkDialog({
  isOpen,
  onClose,
  initialData,
  onSave,
  shortCode,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [expiry, setExpiry] = useState(!!initialData.expireAt);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditLinkData>({
    resolver: zodResolver(EditLinkSchema),
    defaultValues: {
      title: initialData.title,
      originalURL: initialData.originalURL,
      expireAt: initialData.expireAt,
      password: initialData.password,
    },
  });

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const onSubmit = async (formData: EditLinkData) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/protected/edit/${shortCode}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.error("Update failed:", err);
        return;
      }

      const updated = await res.json();
      onSave(updated);
      onClose();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const expireAtRaw = watch("expireAt");
  const expireTime = expireAtRaw ? new Date(expireAtRaw) : undefined;

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold mb-4">Edit Link</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <Input {...register("title")} />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Original URL</label>
            <Input type="url" {...register("originalURL")} />
            {errors.originalURL && (
              <p className="text-red-500 text-sm">
                {errors.originalURL.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("password")}
              className="h-4 w-4"
            />
            <label className="text-sm">Password Protected</label>
          </div>

          <div className="flex flex-col gap-4 m-2">
            <div className="flex m-1 gap-2">
              <Switch checked={expiry} onCheckedChange={setExpiry} />
              <label htmlFor="expiry-toggle" className="font-medium">
                Set Expiry Date & Time
              </label>
            </div>

            <div
              className={cn(
                "grid grid-rows-[0fr] transition-all opacity-0",
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
                  onChange={(v: Date) => {
                    if (v instanceof Date && !isNaN(v.getTime())) {
                      setValue("expireAt", v.toISOString());
                    } else {
                      setValue("expireAt", "");
                    }
                  }}
                  value={expireTime}
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center w-38 gap-2 px-6 py-2 rounded-lg bg-darkBackground text-white hover:bg-black font-medium text-lg cursor-pointer transition duration-200 shadow-sm hover:shadow-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
