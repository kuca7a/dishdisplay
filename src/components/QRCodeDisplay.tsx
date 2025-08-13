"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Share2,
  QrCode,
  Copy,
  ExternalLink,
  Settings,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { qrCodeGenerator, QRCodeOptions } from "@/lib/qrcode";
import { Restaurant } from "@/types/database";
import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";

interface QRCodeDisplayProps {
  restaurant: Restaurant;
  showControls?: boolean;
  size?: number;
  className?: string;
}

export function QRCodeDisplay({
  restaurant,
  showControls = true,
  size = 256,
  className = "",
}: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Customization options
  const [options, setOptions] = useState<QRCodeOptions>({
    size: size,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "M",
  });

  const menuUrl = qrCodeGenerator.getMenuUrl(restaurant.id);

  // Generate QR code when component mounts or options change
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setLoading(true);
        setError(null);
        const dataUrl = await qrCodeGenerator.generateDataURL(
          restaurant.id,
          options
        );
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error("Failed to generate QR code:", err);
        setError("Failed to generate QR code");
      } finally {
        setLoading(false);
      }
    };

    generateQRCode();
  }, [restaurant.id, options]);

  const generateQRCode = async () => {
    // This function is now only used for the "Try Again" button
    try {
      setLoading(true);
      setError(null);
      const dataUrl = await qrCodeGenerator.generateDataURL(
        restaurant.id,
        options
      );
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error("Failed to generate QR code:", err);
      setError("Failed to generate QR code");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPNG = async () => {
    try {
      await qrCodeGenerator.downloadPNG(
        restaurant.id,
        `${restaurant.name.toLowerCase().replace(/\s+/g, "-")}-menu-qr.png`,
        options
      );
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleDownloadSVG = async () => {
    try {
      await qrCodeGenerator.downloadSVG(
        restaurant.id,
        `${restaurant.name.toLowerCase().replace(/\s+/g, "-")}-menu-qr.svg`,
        options
      );
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${restaurant.name} Menu`,
          text: `Check out the menu for ${restaurant.name}`,
          url: menuUrl,
        });
      } catch (error) {
        console.error("Share failed:", error);
      }
    } else {
      // Fallback to copying URL
      handleCopyUrl();
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <ThreeDotsLoader size="md" />
              <p className="text-sm text-gray-600 mt-4">Generating QR code...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <QrCode className="h-12 w-12 mx-auto mb-2" />
            <p>{error}</p>
            <Button
              variant="outline"
              onClick={generateQRCode}
              className="mt-2 hover:cursor-pointer"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Menu QR Code
        </CardTitle>
        <CardDescription>
          Customers can scan this code to view your menu instantly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Display */}
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
            {qrDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt={`QR Code for ${restaurant.name} menu`}
                className="block"
                style={{ width: options.size, height: options.size }}
              />
            )}
          </div>
        </div>

        {/* URL Display */}
        <div className="text-center">
          <Badge variant="outline" className="mb-2">
            Menu URL
          </Badge>
          <p className="text-sm text-gray-600 break-all">{menuUrl}</p>
        </div>

        {showControls && (
          <>
            <Separator />

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPNG}
                className="hover:cursor-pointer"
              >
                <Download className="h-4 w-4 mr-2" />
                PNG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSVG}
                className="hover:cursor-pointer"
              >
                <Download className="h-4 w-4 mr-2" />
                SVG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="hover:cursor-pointer"
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "Copied!" : "Copy URL"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="hover:cursor-pointer"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(menuUrl, "_blank")}
                className="flex-1 hover:cursor-pointer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview Menu
              </Button>

              {/* Customization Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:cursor-pointer"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Customize QR Code</DialogTitle>
                    <DialogDescription>
                      Adjust the appearance of your QR code
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="qr-size">Size (pixels)</Label>
                      <Input
                        id="qr-size"
                        type="number"
                        min="128"
                        max="512"
                        value={options.size}
                        onChange={(e) =>
                          setOptions((prev) => ({
                            ...prev,
                            size: parseInt(e.target.value) || 256,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="qr-margin">Margin</Label>
                      <Input
                        id="qr-margin"
                        type="number"
                        min="0"
                        max="10"
                        value={options.margin}
                        onChange={(e) =>
                          setOptions((prev) => ({
                            ...prev,
                            margin: parseInt(e.target.value) || 2,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="qr-dark-color">Dark Color</Label>
                      <Input
                        id="qr-dark-color"
                        type="color"
                        value={options.color?.dark}
                        onChange={(e) =>
                          setOptions((prev) => ({
                            ...prev,
                            color: { ...prev.color, dark: e.target.value },
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="qr-light-color">Light Color</Label>
                      <Input
                        id="qr-light-color"
                        type="color"
                        value={options.color?.light}
                        onChange={(e) =>
                          setOptions((prev) => ({
                            ...prev,
                            color: { ...prev.color, light: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default QRCodeDisplay;
