import Disclaimer from "@/components/Disclaimer/Disclaimer";
import DitheredVideo from "@/components/DitheredVideo/DitheredVideo";
import HeroSearch from "@/components/HeroSearch/HeroSearch";
import LeaderboardPreviewTrio from "@/components/LeaderboardPreviewTrio/LeaderboardPreviewTrio";
import { Input } from "@/components/ui/input";
import { bebasneue, dharma, inter, orbitron, projectkosmos } from "@/lib/font";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {/* <DitheredVideo/> */}
      {/* <Disclaimer/> */}
      <section className="fixed left-0 top-0 flex size-full items-center justify-center overflow-hidden bg-gray-900">
        {/* <video
          playsInline
          autoPlay
          loop
          className="absolute size-full object-cover opacity-30 mix-blend-color-dodge saturate-0"
          muted
        >
          <source
            // media="(max-width: 480px)"
            src="/herovid.mp4"
            type="video/mp4"
          />

        </video> */}
        <Image className="absolute size-full object-cover opacity-30 mix-blend-color-dodge saturate-0 pointer-events-none" src={"/hero.png"} alt="hero image" width={2160} height={1440}/>
        <div className="flex flex-col gap-10 items-center">
          <div className="pointer-events-none flex w-full flex-col items-center justify-center uppercase mix-blend-difference">
            <h1 className={cn("text-[10rem] font-bold italic leading-none sm:text-[16rem] lg:text-[24rem] text-blue-100 opacity-85", projectkosmos.className)}>
              SANTAI
            </h1>
            <p className={cn("-mt-2 text-lg uppercase leading-none tracking-widest opacity-50 sm:-mt-5 sm:text-xl lg:-mt-5 lg:text-2xl text-white", inter.className)}>
              EVERYTHING DUALITY
            </p>
          </div>
          <HeroSearch/>
          <div className="w-fit z-[1] flex items-center">
            <LeaderboardPreviewTrio />
          </div>
        </div>
      </section>
    </main>
  );
}