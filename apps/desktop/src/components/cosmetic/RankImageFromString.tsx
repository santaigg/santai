import React from "react";
import { useState, useEffect } from "react";
import { cn } from "../..//utils/cn";

interface RankImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  rank: string;
}

const RankImage: React.FC<RankImageProps> = ({ rank, className, ...props }) => {
  const [rankImage, setRankImage] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      const image = await import(
        `../../assets/images/ranks/solo_ranks/${rank}.png`
      );
      setRankImage(image.default);
    };
    loadImage();
  }, [rank]);

  if (!rankImage) {
    return null;
  }

  return (
    <div>
      <img
        src={rankImage}
        alt={`${rank} rank`}
        className={cn("h-8 w-8 shrink-0 min-w-8 min-h-8", className)}
        {...props}
      />
    </div>
  );
};

export { RankImage };
