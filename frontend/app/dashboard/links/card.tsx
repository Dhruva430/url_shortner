"use client";

import { QrCode, Trash2, Eye, Copy, Calendar, Pen, Shield } from "lucide-react";
import type { LinkData } from "@/features/links/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import DeleteConfirmation from "./deleteConfimation";
import { useState } from "react";

interface EnhancedCardProps {
  link: LinkData;
  variant?: "grid" | "list";
  onPreview: () => void;
  onQrCode: () => void;
  onDelete: () => void;
  onEditLink: () => void;
}

export default function EnhancedCard({
  link,
  variant = "grid",
  onPreview,
  onQrCode,
  onDelete,
  onEditLink,
}: EnhancedCardProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link.short_url);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleConfirmDelete = () => {
    setShowConfirmDialog(false);
    onDelete();
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isExpired = () => {
    return link.is_expired;
  };

  const isProtected = () => {
    return link.password;
  };

  const isActive = () => {
    return !isExpired() !== false;
  };

  // Render status badges
  const renderStatusBadges = () => (
    <div className="flex gap-2 flex-wrap">
      {isExpired() && (
        <Badge
          variant="destructive"
          className="text-xs bg-red-500 hover:bg-red-600 text-white"
        >
          Expired
        </Badge>
      )}
      {isProtected() && (
        <Badge
          variant="secondary"
          className="text-xs bg-white border-black border text-black"
        >
          <Shield />
          Protected
        </Badge>
      )}
      {isActive() && !isExpired() && (
        <Badge variant="outline" className="text-xs bg-black  text-white ">
          Active
        </Badge>
      )}
    </div>
  );

  if (variant === "list") {
    return (
      <>
        <Card className="hover:shadow-md transition-all duration-200">
          <CardContent className="">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold truncate text-xl">
                    {link.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {link.clicks || 0} clicks
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate mb-2">
                  {link.original_url}
                </p>
                <div className="flex gap-1 mb-3">
                  Shinkr -
                  <a className="text-sm text-darkBackground truncate my-auto">
                    {link.short_url}
                  </a>
                </div>
                {/* Status badges */}
                <div className="mb-3">{renderStatusBadges()}</div>
                <div className="flex gap-4 flex-wrap">
                  {link.created_at && (
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3" />
                      Created {formatDate(link.created_at)}
                    </div>
                  )}
                  {link.expire_at && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Expires {formatDate(link.expire_at)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={handleCopy}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy link</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={onEditLink}>
                        <Pen className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={onPreview}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Preview</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={onQrCode}>
                        <QrCode className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Generate QR Code</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirmDialog(true)}
                        className="text-destructive hover:text-destructive "
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete link</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardContent>
        </Card>
        <DeleteConfirmation
          open={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Link"
          description={`Are you sure you want to delete "${link.title}"`}
        />
      </>
    );
  }

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                {link.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 break-all line-clamp-2 leading-relaxed mb-2">
                {link.original_url}
              </p>
              <div className="flex mb-3">
                <a className="text-sm text-darkBackground truncate my-auto">
                  {link.short_url}
                </a>
              </div>
              {/* Status badges */}
              {renderStatusBadges()}
            </div>
            <Badge variant="secondary" className="shrink-0">
              {link.clicks || 0} clicks
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-4 flex-wrap">
            {link.created_at && (
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="w-3 h-3" />
                Created {formatDate(link.created_at)}
              </div>
            )}
            {link.expire_at && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-3 h-3" />
                Expires {formatDate(link.expire_at)}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex-1 gap-2 bg-transparent"
            >
              <Copy className="w-4 h-4" />
              Copy
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={onEditLink}>
                    <Pen className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit Link</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={onPreview}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Preview</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={onQrCode}>
                    <QrCode className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>QR Code</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmDialog(true)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardFooter>
      </Card>
      <DeleteConfirmation
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Link"
        description={`Are you sure you want to delete "${link.title}".`}
      />
    </>
  );
}
