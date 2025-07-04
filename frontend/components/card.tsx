import React from "react";
import ThemeDropdown from "@/components/linkOperationDropdown";
import { LinkData } from "@/features/links/types";
import { Calendar1, ChartColumnBig, Shield } from "lucide-react";
import { useState } from "react";
import EditLinkDialog from "@/components/editLinkDialog";

type CardProps = {
  link: LinkData;
  onDelete: (short_url: string) => void;
  onPreview: (link: LinkData) => void;
  onQrCode?: (url: string) => void;
};

export default function Card({
  link,
  onDelete,
  onPreview,
  onQrCode,
}: CardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const onEdit = () => {
    setEditOpen(true);
  };
  const onSuccess = (updatedLink: LinkData) => {
    setEditOpen(false);
    console.log("Link updated successfully:", updatedLink);
  };
  const handleQrCode = (url: string) => {
    if (onQrCode) {
      onQrCode(url);
    }
  };
  const expire = link.expire_at ? new Date(link.expire_at) < new Date() : false;
  const active = link.expire_at ? new Date(link.expire_at) > new Date() : true;
  const passwordProtected = link.password ? true : false;
  return (
    <div
      key={link.id}
      className="p-6 flex gap-2 mx-40 my-10 rounded-lg border bg-white border-gray-300 text-gray-900 shadow-sm"
    >
      <img
        loading="lazy"
        src={link.thumbnail}
        alt="Link Thumbnail"
        className="rounded-full size-12 object-cover"
      />
      <div className="w-full flex flex-col justify-between gap-1">
        <div className="flex justify-between">
          <h1 className="flex items-center font-bold px-2">{link.title}</h1>
          <ThemeDropdown
            shortUrl={link.short_url}
            id={link.id}
            onDelete={() => onDelete(link.short_url)}
            onPreview={() => onPreview(link)}
            onQrCode={() => handleQrCode(link.short_url)}
            onEdit={onEdit}
          />
        </div>
        <p className="text-sm text-gray-500 px-2">{link.original_url}</p>
        <a
          href={link.short_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline break-all cursor-pointer text-sm pb-2 px-2"
        >
          {link.short_url}
        </a>
        <div className="gap-4 flex">
          <div className="flex gap-1">
            <ChartColumnBig className="size-5" />
            <p className="text-gray-500">{link.clicks} Clicks</p>
          </div>
          <div className="flex gap-1">
            <Calendar1 className="size-5" />
            <p className="text-gray-500">{link.created_at}</p>
          </div>
          <div className="gap-3 flex items-center justify-center">
            {active && (
              <div className="bg-black text-xs font-semibold text-white px-4 py-1 rounded-xl">
                Active
              </div>
            )}
            {passwordProtected && (
              <div className="bg-white text-black border border-gray-300 text-xs font-semibold px-4 py-1 flex items-center gap-1 rounded-xl">
                <Shield className="size-4 text-black" />
                Protected
              </div>
            )}
            {expire && (
              <div className="bg-red-500 text-xs font-semibold text-white px-4 py-1 rounded-xl">
                Expired
              </div>
            )}
            {
              <EditLinkDialog
                isOpen={editOpen}
                onSuccess={onSuccess}
                onClose={() => {
                  setEditOpen(false);
                }}
                initialData={{
                  title: link.title,
                  original_url: link.original_url,
                  expire_at: link.expire_at
                    ? new Date(link.expire_at)
                    : undefined,
                  password: "",
                }} //TODO: Add password field if needed
                shortCode={link.short_url.split("/").pop()!}
              />
            }
          </div>
        </div>
      </div>
    </div>
  );
}
