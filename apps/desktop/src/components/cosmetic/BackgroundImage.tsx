import { cn } from "../..//utils/cn";
import type { StaticImageData } from "next/image";

export default function BackgroundImage({
  image,
  className,
}: {
  image?: StaticImageData;
  className?: string;
}) {
  return (
    <img
      //   src={image} TEMP IMAGE FOR TESTING -- DID NOT WORK WELL ://
      src="/src/assets/images/background/background-spectators.png"
      alt="Background Image."
      className={cn(
        "absolute select-none top-0 -z-50 size-full object-cover blur-md mix-blend-color-dodge saturate-[30%] brightness-50 pointer-events-none",
        className
      )}
    />
  );
}
