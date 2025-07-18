"use client";
import React, { useEffect, useState } from "react";
import { set, useForm, useWatch } from "react-hook-form";
import { Switch } from "@components/ui/switch";
import { Label } from "@components/ui/label";
import { Calendar24 } from "@/components/calender";
import Input from "@/components/input";
import { cn } from "@/lib/utils";
import ColorPicker from "@/components/colorPicker";
import saveAs from "file-saver";

type FormFields = {
  url: string;
  bg_color: string;
  fg_color: string;
  logo_url: string;
  expire_at?: Date;
};

const QRCode: React.FC = () => {
  const [expiryEnabled, setExpiryEnabled] = useState(false);
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  const { register, setValue, watch } = useForm<FormFields>({
    defaultValues: {
      url: "",
      bg_color: "",
      fg_color: "",
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
        "/api/protected/shorten/qr-with-logo",
        window.location.origin
      );
      newURL.search = "";
      newURL.searchParams.set("url", watched.url);
      newURL.searchParams.set("bg_color", watched.bg_color);
      newURL.searchParams.set("fg_color", watched.fg_color);

      if (watched.logo_url)
        newURL.searchParams.set("logo_url", watched.logo_url);
      // if (watched.expire_at)
      //   newURL.searchParams.set("expire_url", watched.expire_at.toISOString());

      setQrSrc(newURL.toString());
    }, 500);
    return () => clearTimeout(timeout);
  }, [watched]);

  const downloadQR = async () => {
    if (!qrSrc) return;

    try {
      const res = await fetch(qrSrc, { credentials: "include" });

      if (!res.ok) {
        console.error("Failed to fetch QR image", res.status);
        return;
      }

      const blob = await res.blob();
      saveAs(blob, "qr-code.png");
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <div className="grid grid-cols-2 items-start gap-4 m-15  ">
      <form className="border shadow p-4 flex flex-col gap-5 rounded-2xl">
        <h2 className="text-xl text-center font-bold">QR Code Generator</h2>

        <Input
          label="Enter Url"
          placeholder="Enter Short URL"
          {...register("url")}
        />
        <div className="grid grid-cols-2 gap-2">
          <ColorPicker
            value={watched.bg_color || "#ffffff"}
            onChange={(hex: string) => setValue("bg_color", hex)}
            label="Background Color"
            className="w-full"
          />
          <ColorPicker
            value={watched.fg_color || "#000000"}
            onChange={(hex: string) => setValue("fg_color", hex)}
            label="Foreground Color"
          />
        </div>
        <Input
          label="Enter Image Url"
          placeholder="Enter Logo URL"
          {...register("logo_url")}
        />

        {/* <div className="flex items-center gap-2">
          <Switch
            id="expiry"
            checked={expiryEnabled}
            onCheckedChange={(val) => {
              setExpiryEnabled(val);
              if (!val) setValue("expire_at", undefined);
            }}
          />
          <Label htmlFor="expiry">Expiry Date</Label>
        </div> */}

        {/* <div
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
        </div> */}
      </form>

      <div className="max-w-sm mx-auto px-20 shadow-lg rounded-2xl p-6 border border-gray-200 flex flex-col items-center space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Your QR Code</h2>

        {qrSrc ? (
          <div className="rounded-xl overflow-hidden border border-gray-300 p-2 bg-gray-50">
            <img
              src={qrSrc}
              alt="Enter valid url."
              className="w-48 h-48 object-contain"
            />
          </div>
        ) : (
          <div className="w-48 h-48 flex items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-400 text-sm">
            QR Preview
          </div>
        )}

        <button
          onClick={downloadQR}
          disabled={!qrSrc}
          className="mt-2 px-4 py-2 text-sm font-medium bg-darkBackground cursor-pointer text-white rounded-lg transition duration-200"
        >
          Download QR
        </button>
      </div>
    </div>
  );
};

export default QRCode;
