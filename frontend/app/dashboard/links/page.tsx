"use client";

import { useState } from "react";
import { LinkIcon, Plus, Search, Filter, Grid, List } from "lucide-react";
import { useLinks } from "@/features/links/hooks/useLinks";
import CreateLinkDialog from "@/components/createLinkDialog";
import type { LinkData } from "@/features/links/types";
import LinkPreviewDialog from "@/components/linkPreviewDialog";
import { useQueryClient } from "@tanstack/react-query";
import QrDialog from "@/components/getQR";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnhancedCard from "./card";
import EditLinkDialog from "@/components/editLinkDialog";

export default function LinksDashboard() {
  const [open, setOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<LinkData | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrLink, setQrLink] = useState<LinkData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "expired" | "protected"
  >("all");

  const queryClient = useQueryClient();
  const { links, isLoading, error } = useLinks();

  const shortCode = qrLink?.short_url.split("/").pop();
  const qrImage = `/api/protected/links/${shortCode}`;

  const handleQrCode = (link: LinkData) => {
    setQrLink(link);
    setQrOpen(true);
  };

  const [editOpen, setEditOpen] = useState(false);

  const handleEditLink = (link: LinkData) => {
    setSelectedLink(link);
    setEditOpen(true);
  };

  const handleDelete = async (shortUrl: string) => {
    const shortcode = shortUrl.split("/").pop();
    if (!shortcode) {
      console.error("Invalid shortUrl:", shortUrl);
      return;
    }

    try {
      await fetch(`/api/protected/links/${shortcode}`, {
        method: "DELETE",
        credentials: "include",
      });
      queryClient.invalidateQueries({ queryKey: ["links"] });
    } catch (error) {
      console.error("Failed to delete link:", error);
    }
  };

  // Helper functions for link status
  const isExpired = (link: LinkData) => {
    if (!link.expire_at) return false;
    console.log(link.expire_at);
    return new Date(link.expire_at) < new Date();
  };

  const isProtected = (link: LinkData) => {
    return link.password;
  };

  const isActive = (link: LinkData) => {
    return !isExpired(link) !== false;
  };

  // Filter links based on search query and status
  const filteredLinks = links?.filter((link) => {
    const matchesSearch =
      link.original_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.short_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.title.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    switch (filterStatus) {
      case "active":
        matchesFilter = isActive(link);
        break;
      case "expired":
        matchesFilter = isExpired(link);
        break;
      case "protected":
        matchesFilter = isProtected(link);
        break;
      case "all":
      default:
        matchesFilter = true;
        break;
    }

    return matchesSearch && matchesFilter;
  });

  // Get counts for each status
  const statusCounts = links
    ? {
        all: links.length,
        active: links.filter(isActive).length,
        expired: links.filter(isExpired).length,
        protected: links.filter(isProtected).length,
      }
    : { all: 0, active: 0, expired: 0, protected: 0 };

  const LoadingSkeleton = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-6 border rounded-lg space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Section */}

      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <LinkIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Your Links</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage your shortened links, track their performance, and generate QR
          codes
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          {links && links.length > 0 && (
            <div className="flex gap-2 flex-wrap justify-center">
              <Badge
                variant="secondary"
                className="text-sm bg-darkBackground text-white px-3 py-1"
              >
                {statusCounts.all} total
              </Badge>
              <Badge
                variant="outline"
                className="text-sm px-3 py-1 bg-black text-white"
              >
                {statusCounts.active} active
              </Badge>
              <Badge
                variant="destructive"
                className="text-sm px-3 py-1 bg-red-500 text-white"
              >
                {statusCounts.expired} expired
              </Badge>
              <Badge
                variant="secondary"
                className="text-sm px-3 py-1 bg-white text-black"
              >
                {statusCounts.protected} protected
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter Section */}
      {links && links.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-muted/30 rounded-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Filter className="w-4 h-4" />
                  Filter
                  {filterStatus !== "all" && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {filterStatus}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                  All Links ({statusCounts.all})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("active")}>
                  Active Links ({statusCounts.active})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("expired")}>
                  Expired Links ({statusCounts.expired})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("protected")}>
                  Protected Links ({statusCounts.protected})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "grid" | "list")}
            >
              <TabsList>
                <TabsTrigger value="grid" className="gap-2">
                  <Grid className="w-4 h-4" />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2">
                  <List className="w-4 h-4" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load links. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {isLoading && <LoadingSkeleton />}

        {!isLoading && !error && (!links || links.length === 0) && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <LinkIcon className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No links yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get started by creating your first shortened link. It's quick and
              easy!
            </p>
          </div>
        )}

        {!isLoading && !error && filteredLinks && filteredLinks.length > 0 && (
          <Tabs value={viewMode} className="w-full">
            <TabsContent value="grid">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredLinks.map((link) => (
                  <EnhancedCard
                    key={link.id}
                    link={link}
                    onPreview={() => {
                      setSelectedLink(link);
                      setPreviewOpen(true);
                    }}
                    onQrCode={() => handleQrCode(link)}
                    onDelete={() => handleDelete(link.short_url)}
                    onEditLink={() => handleEditLink(link)}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="list">
              <div className="space-y-4">
                {filteredLinks.map((link) => (
                  <EnhancedCard
                    key={link.id}
                    link={link}
                    variant="list"
                    onPreview={() => {
                      setSelectedLink(link);
                      setPreviewOpen(true);
                    }}
                    onQrCode={() => handleQrCode(link)}
                    onDelete={() => handleDelete(link.short_url)}
                    onEditLink={() => {
                      setSelectedLink(link);
                      setOpen(true);
                    }}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {!isLoading &&
          !error &&
          filteredLinks &&
          filteredLinks.length === 0 &&
          (searchQuery || filterStatus !== "all") && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No links found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? `No links match your search for "${searchQuery}"`
                  : `No ${filterStatus} links found`}
              </p>
            </div>
          )}
      </div>

      {/* Dialogs */}

      {selectedLink && (
        <LinkPreviewDialog
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          data={selectedLink}
        />
      )}
      {qrLink && (
        <QrDialog
          open={qrOpen}
          onClose={() => setQrOpen(false)}
          link={qrLink}
        />
      )}
      {selectedLink && (
        <EditLinkDialog
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          shortcode={selectedLink.short_url.split("/").pop() || ""}
          initialData={{
            title: selectedLink.title,
            original_url: selectedLink.original_url,
          }}
          onSuccess={() => setEditOpen(false)} // optional refresh behavior
        />
      )}
    </div>
  );
}
