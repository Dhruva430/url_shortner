"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Calendar24 } from "@/components/calender";
import Input from "@/components/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { XIcon } from "lucide-react";
import { LinkData } from "@/features/links/types";
import { useQueryClient } from "@tanstack/react-query";
import PasswordInput from "@components/passwordinput";
const EditLinkSchema = z.object({
  title: z.string().min(1, "Title is required"),
  original_url: z.string().url("Enter a valid URL"),
  expire_at: z.date().optional(),
  password: z.string().optional(),
});

export type EditLinkData = z.infer<typeof EditLinkSchema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialData: Partial<EditLinkData>;
  shortcode: string;
  onSuccess?: (link: LinkData) => void;
};

export default function EditLinkDialog({
  isOpen,
  initialData,
  shortcode: shortcode,
  onSuccess,
  onClose,
}: Props) {
  const [password, setPassword] = useState(!!initialData.password);
  const [mounted, setMounted] = useState(false);
  const [expiry, setExpiry] = useState(!!initialData.expire_at);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<EditLinkData>({
    resolver: zodResolver(EditLinkSchema),
    defaultValues: {
      title: initialData.title ?? "",
      original_url: initialData.original_url ?? "",
      expire_at: initialData.expire_at
        ? new Date(initialData.expire_at)
        : undefined,
      password: initialData.password ?? "",
    },
  });

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const expireAt = useWatch({ control, name: "expire_at" });

  const queryClient = useQueryClient();

  const onSubmit = async (formData: EditLinkData) => {
    try {
      const res = await fetch(`/api/protected/edit/${shortcode}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      const data = result.data;
      if (!res.ok) {
        throw new Error(result.message || "Update failed");
      }
      console.log("Update successful:", data);
      queryClient.invalidateQueries({ queryKey: ["links"] });
      onSuccess?.({ ...data });
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg relative"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
        >
          <XIcon className="size-5" />
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
            <Input type="url" {...register("original_url")} />
            {errors.original_url && (
              <p className="text-red-500 text-sm">
                {errors.original_url.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Switch
              id="expiry"
              checked={expiry}
              onCheckedChange={(val) => {
                setExpiry(val);
                if (!val) setValue("expire_at", undefined);
              }}
            />
            <Label htmlFor="expiry">Expiry Date</Label>
          </div>

          <div
            className={cn(
              "transition-all duration-300 overflow-hidden",
              expiry
                ? "max-h-40 opacity-100"
                : "max-h-0 opacity-0 pointer-events-none"
            )}
          >
            <label
              htmlFor="datepicker"
              className="block text-sm font-medium mb-1"
            >
              Select Date &amp; Time
            </label>
            <Calendar24
              value={expireAt}
              onChange={(v) => setValue("expire_at", v)}
            />
          </div>

          <div className="flex gap-2">
            <Switch
              id="password"
              checked={password}
              onCheckedChange={(val) => {
                setPassword(val);
                if (!val) {
                  setValue("password", undefined);
                }
              }}
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
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-2 rounded-lg bg-darkBackground text-white hover:bg-black font-medium text-lg cursor-pointer transition duration-200 shadow-sm hover:shadow-md"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
