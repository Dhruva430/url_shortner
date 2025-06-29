"use client";
import React, { useState, useEffect } from "react";
import {
  Shield,
  Calendar1,
  ChartColumnBig,
  LinkIcon,
  Plus,
} from "lucide-react";
import ThemeDropdown from "@/components/linkOperationDropdown";
import CreateLinkDialog from "@/components/createLinkDialog";
import { LinkData } from "@/features/links/types";
import LinkPreviewDialog from "@/components/linkPreviewDialog";
import EditLinkDialog, { EditLinkData } from "@/components/editLinkDialog";

export default function LinksDashboard() {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [selectedLink, setSelectedLink] = useState<LinkData | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editLink, setEditLink] = useState<LinkData | null>(null);

  const addNewLink = (link: LinkData) => {
    setLinks((prev) => [link, ...prev]);
  };

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/protected/links", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch links");

        const data = await res.json();

        const formattedLinks: LinkData[] = data.map((link: any) => ({
          id: link.id.toString(),
          title: link.title,
          originalUrl: link.original_url,
          shortUrl: link.short_url,
          clicks: link.click_count,
          createdAt: new Date(link.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          status: link.password_hash
            ? "Protected"
            : link.expire_at && new Date(link.expire_at) < new Date()
            ? "Expired"
            : "Active",
          thumbnail: link.thumbnail || "https://via.placeholder.com/48",
        }));

        setLinks(formattedLinks);
      } catch (err) {
        console.error("Error fetching links:", err);
      }
    };

    fetchLinks();
  }, []);

  const handleDelete = async (shortUrl: string) => {
    try {
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

      if (res.ok) {
        setLinks((prev) => prev.filter((l) => l.shortUrl !== shortUrl));
      } else {
        const error = await res.json();
        console.error("Delete failed:", error);
      }
    } catch (err) {
      console.error("Network error deleting link:", err);
    }
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
          onCreateLink={addNewLink}
        />
      </div>

      {links.map((link) => (
        <div
          key={link.id}
          className="p-6 flex gap-2 my-5 mx-10 rounded-lg border bg-white border-gray-300 text-gray-900 shadow-sm"
        >
          <img
            loading="lazy"
            src={link.thumbnail}
            alt="Link Thumbnail"
            className="rounded-full size-12 object-cover"
          />
          <div className="w-full">
            <div className="flex w-full justify-between">
              <h1 className="font-bold px-2">{link.title}</h1>
              <ThemeDropdown
                shortUrl={link.shortUrl}
                id={link.id}
                onDelete={handleDelete}
                onPreview={() => {
                  setSelectedLink(link);
                  setPreviewOpen(true);
                }}
                onEdit={() => {
                  setEditLink(link);
                  setEditOpen(true);
                }}
              />
            </div>
            <p className="text-sm text-gray-500 px-2">{link.originalUrl}</p>
            <a
              href={link.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline break-all cursor-pointer text-sm pb-2 px-2"
            >
              {link.shortUrl}
            </a>
            <div className="gap-4 flex">
              <div className="flex gap-1">
                <ChartColumnBig className="size-5" />
                <p className="text-gray-500">{link.clicks} Clicks</p>
              </div>
              <div className="flex gap-1">
                <Calendar1 className="size-5" />
                <p className="text-gray-500">{link.createdAt}</p>
              </div>
              <div className="gap-3 flex items-center justify-center">
                {link.status === "Active" && (
                  <div className="bg-black text-xs font-semibold text-white px-4 py-1 rounded-xl">
                    Active
                  </div>
                )}
                {link.status === "Protected" && (
                  <div className="bg-white text-black border border-gray-300 text-xs font-semibold px-4 py-1 flex items-center gap-1 rounded-xl">
                    <Shield className="size-4 text-black" />
                    Protected
                  </div>
                )}
                {link.status === "Expired" && (
                  <div className="bg-red-500 text-xs font-semibold text-white px-4 py-1 rounded-xl">
                    Expired
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      {selectedLink && (
        <LinkPreviewDialog
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          data={selectedLink}
        />
      )}
      {editLink && (
        <EditLinkDialog
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          initialData={{
            title: editLink.title,
            originalURL: editLink.originalUrl,
            expireAt: "2025-12-31", // Replace with actual `editLink.expireAt` if available
            isPasswordProtected: editLink.status === "Protected",
          }}
          shortCode={editLink.shortUrl.split("/").pop()!}
          onSave={(updated) => {
            setLinks((prev) =>
              prev.map((l) => (l.id === editLink.id ? { ...l, ...updated } : l))
            );
            setEditOpen(false);
          }}
        />
      )}
    </>
  );
}
