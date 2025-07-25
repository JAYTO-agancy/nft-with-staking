import { Users, Sparkles } from "lucide-react";

export function ProjectStorySection() {
  return (
    <section className="w-full bg-gradient-to-br from-blue-50 to-pink-50 py-12">
      <div className="container mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
        <div>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Our Story</h2>
          <p className="mb-4 text-lg text-gray-700">
            Plumffel NFT was born from a love for plush toys and a passion for
            web3. Our mission is to bring joy, cuteness, and real utility to the
            NFT space. Each Plumffel is not just a collectible, but a gateway to
            staking, rewards, and a vibrant community.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-8 md:flex-row">
          <div className="flex flex-col items-center">
            <Sparkles className="mb-2 h-10 w-10 text-pink-400" />
            <div className="font-semibold">Mission</div>
            <div className="text-sm text-gray-600">
              Spread joy and utility through adorable NFTs.
            </div>
          </div>
          <div className="flex flex-col items-center">
            <Users className="mb-2 h-10 w-10 text-blue-400" />
            <div className="font-semibold">Community</div>
            <div className="text-sm text-gray-600">
              Build a friendly, inclusive, and rewarding ecosystem.
            </div>
          </div>
        </div>
        <div className="mt-8">
          <div className="mb-2 text-lg font-bold">Meet the Team</div>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-2xl font-bold">
                A
              </div>
              <div className="mt-2 font-semibold">Alice</div>
              <div className="text-xs text-gray-500">Founder</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-2xl font-bold">
                B
              </div>
              <div className="mt-2 font-semibold">Bob</div>
              <div className="text-xs text-gray-500">Dev</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-2xl font-bold">
                C
              </div>
              <div className="mt-2 font-semibold">Carol</div>
              <div className="text-xs text-gray-500">Artist</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
