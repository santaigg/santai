"use client";
import React, { useState, useEffect } from "react";
import { cn } from "../../utils/cn";

interface SponsorImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  sponsor: string;
}

function SponsorImage({ sponsor, className, ...props }: SponsorImageProps) {
  const [sponsorImage, setSponsorImage] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const image = await import(
          `../../assets/images/sponsor-logos/${sponsor}.png`
        );
        setSponsorImage(image.default);
      } catch (error) {
        console.error(`Failed to load sponsor image: ${sponsor}.png`, error);
      }
    };
    loadImage();
  }, [sponsor]);

  if (!sponsorImage) {
    return null;
  }

  return (
    <div className={cn("relative h-10 w-auto", className)}>
      <img
        src={sponsorImage}
        alt={`${sponsor} Logo`}
        className="h-full w-auto object-contain"
        {...props}
      />
    </div>
  );
}

export { SponsorImage };
