"use client";
import React, { useEffect, useState } from "react";
import { set, useForm, useWatch } from "react-hook-form";
import { Switch } from "@components/ui/switch";
import { Label } from "@components/ui/label";
import { Calendar24 } from "@/components/calender";
import Input from "@/components/input";
import { cn } from "@/lib/utils";

type FormFields = {
  url: string;
  bg_color: string;
  fg_color: string;
  logo_url: string;
  expire_at?: Date;
};

const QRCodeDialog: React.FC = () => {
  const [expiryEnabled, setExpiryEnabled] = useState(false);
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  const { register, setValue, watch } = useForm<FormFields>({
    defaultValues: {
      url: "",
      bg_color: "#ffffff",
      fg_color: "#000000",
      logo_url: "",
    },
  });

  const watched = watch();

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("watched", watched);
      if (!watched.url) {
        setQrSrc(null);
        return;
      }

      const newURL = new URL(
        "http://localhost:8080/api/protected/shorten/qr-with-logo"
      );
      newURL.search = "";
      newURL.searchParams.set("url", watched.url);
      newURL.searchParams.set("bg_color", watched.bg_color);
      newURL.searchParams.set("fg_color", watched.fg_color);

      if (watched.logo_url)
        newURL.searchParams.set("logo_url", watched.logo_url);
      if (watched.expire_at)
        newURL.searchParams.set("expire_url", watched.expire_at.toISOString());

      setQrSrc(newURL.toString());
    }, 500);
    return () => clearTimeout(timeout);
  }, [watched]);

  return (
    <div className="w-full grid grid-cols-2 gap-4">
      <form className="border border-black p-4 flex flex-col gap-3">
        <h2 className="text-xl font-bold">QR Code Generator</h2>

        <Input placeholder="Enter Short URL" {...register("url")} />
        <Input placeholder="Enter Background Color" {...register("bg_color")} />
        <Input placeholder="Enter Foreground Color" {...register("fg_color")} />
        <Input placeholder="Enter Logo URL" {...register("logo_url")} />

        <div className="flex items-center gap-2">
          <Switch
            id="expiry"
            checked={expiryEnabled}
            onCheckedChange={(val) => {
              setExpiryEnabled(val);
              if (!val) setValue("expire_at", undefined);
            }}
          />
          <Label htmlFor="expiry">Expiry Date</Label>
        </div>

        <div
          className={cn(
            "transition-all duration-300 overflow-hidden",
            expiryEnabled
              ? "max-h-40 opacity-100"
              : "max-h-0 opacity-0 pointer-events-none"
          )}
        >
          <Calendar24
            value={watched.expire_at}
            onChange={(v) => setValue("expire_at", v)}
          />
        </div>
      </form>

      <div className="border border-red-600 flex items-center justify-center">
        {qrSrc ? (
          <img src={qrSrc} alt="Generated QR" className="max-w-full max-h-72" />
        ) : (
          <span className="text-sm text-gray-500">QR Preview</span>
        )}
      </div>
    </div>
  );
};

export default QRCodeDialog;
