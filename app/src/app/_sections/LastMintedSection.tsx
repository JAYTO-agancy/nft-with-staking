import Image from "next/image";

const mockNfts = [
  { id: 1001, imageUrl: "/img/logo.png", rarity: "Legendary" },
  { id: 1000, imageUrl: "/img/logo.png", rarity: "Epic" },
  { id: 999, imageUrl: "/img/logo.png", rarity: "Rare" },
  { id: 998, imageUrl: "/img/logo.png", rarity: "Uncommon" },
  { id: 997, imageUrl: "/img/logo.png", rarity: "Common" },
];

const rarityColors: Record<string, string> = {
  Legendary: "border-yellow-400",
  Epic: "border-purple-500",
  Rare: "border-blue-400",
  Uncommon: "border-green-400",
  Common: "border-gray-300",
};

export function LastMintedSection() {
  return (
    <section className="w-full bg-gray-50 py-12">
      <div className="container mx-auto">
        <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl">
          Last Minted
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {mockNfts.map((nft) => (
            <div
              key={nft.id}
              className={`flex flex-col items-center rounded-xl border-4 p-4 ${rarityColors[nft.rarity]}`}
            >
              <Image
                src={nft.imageUrl}
                alt={`NFT #${nft.id}`}
                width={120}
                height={120}
                className="mb-2 rounded-lg"
              />
              <div className="font-semibold">#{nft.id}</div>
              <div className="text-sm text-gray-600">{nft.rarity}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
