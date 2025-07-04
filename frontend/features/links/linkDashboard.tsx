"use client";
import React, { useState, useEffect } from "react";
import { LinkIcon, Plus } from "lucide-react";
import { useLinks } from "@/features/links/hooks/useLinks";
import CreateLinkDialog from "@/components/createLinkDialog";
import { LinkData } from "@/features/links/types";
import LinkPreviewDialog from "@/components/linkPreviewDialog";

import Card from "@/components/card";

export default function LinksDashboard() {
  const [open, setOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<LinkData | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { links, isLoading, refetch } = useLinks();

  const handleDelete = async (shortUrl: string) => {
    const shortcode = shortUrl.split("/").pop();
    if (!shortcode) {
      console.error("Invalid shortUrl:", shortUrl);
      return;
    }

    const res = await fetch(
      `http://localhost:8080/api/protected/links/${shortcode}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold tracking-tight text-black flex items-center gap-2">
          <LinkIcon className="inline size-6" />
          <p>Your Links</p>
        </h3>
        <p className="text-sm text-gray-500">
          Manage your shortened links and track their performance
        </p>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-darkBackground text-white hover:bg-black font-medium text-lg cursor-pointer transition duration-200 shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Create Link
        </button>
        <CreateLinkDialog
          open={open}
          onOpenChange={setOpen}
          onCreateLink={refetch}
        />
      </div>

      {links?.map((link) => (
        <Card
          key={link.id}
          link={link}
          onPreview={() => {
            setSelectedLink(link);
            setPreviewOpen(true);
          }}
          onDelete={() => handleDelete(link.short_url)}
        />
      ))}
      {selectedLink && (
        <LinkPreviewDialog
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          data={selectedLink}
        />
      )}
    </>
  );
}
