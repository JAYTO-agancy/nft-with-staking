import { Button } from "@/shared/ui/kit/button";
import Image from "next/image";

export function HeroSection({ onMint }: { onMint?: () => void }) {
  return (
    <section className="w-full bg-gradient-to-br from-pink-100 to-blue-100 py-12 md:py-24 lg:py-32">
      <div className="container mx-auto flex flex-col items-center gap-8 md:flex-row">
        <div className="flex flex-1 flex-col items-start gap-6">
          <h1 className="text-4xl font-bold text-gray-900 md:text-6xl">
            Plumffel NFT
          </h1>
          <p className="max-w-xl text-lg text-gray-700 md:text-2xl">
            Plumffel are fluffy, adorable plush toys — an NFT collection where
            each character is unique, charming, and created to bring joy to its
            owner. Collect your own set of Plumffels and participate in staking!
          </p>
          {onMint && (
            <Button size="lg" onClick={onMint} className="mt-4">
              Mint NFT
            </Button>
          )}
        </div>
        <div className="flex flex-1 justify-center">
          <Image
            src="/img/logo.png"
            alt="Plumffel Logo"
            width={240}
            height={240}
            className="rounded-2xl shadow-xl"
          />
        </div>
      </div>
    </section>
  );
}
