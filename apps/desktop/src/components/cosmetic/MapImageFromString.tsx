"use client";
import React, { useState, useEffect } from "react";
import { cn } from "../../utils/cn";

export function getMapName(
  map: string
): "Commons" | "Metro" | "Mill" | "Skyway" | "Unknown" {
  switch (map.toLowerCase()) {
    case "commons_p":
      return "Commons";
    case "metro_p":
      return "Metro";
    case "greenbelt_p":
      return "Mill";
    case "junction_p":
      return "Skyway";
    default:
      return "Unknown";
  }
}

interface MapImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  map: string;
}

function MapImage({ map, className, ...props }: MapImageProps) {
  const [mapImage, setMapImage] = useState<string | null>(null);

  const mapKey = getMapName(map);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const image = await import(
          `../../assets/images/map-previews/${mapKey}_800x800.webp`
        );
        setMapImage(image.default);
      } catch (error) {
        console.error(`Failed to load map image: ${map}.png`, error);
      }
    };
    loadImage();
  }, [map]);

  if (!mapImage) {
    return null;
  }

  return (
    <div className={cn("relative h-10 w-auto overflow-hidden", className)}>
      <img
        src={mapImage}
        alt={`${mapKey} Preview`}
        className="h-full w-auto object-cover"
        {...props}
      />
    </div>
  );
}

export { MapImage };
