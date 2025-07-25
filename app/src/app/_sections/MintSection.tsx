import { Button } from "@/shared/ui/kit/button";

export function MintSection({
  onMint,
  mintedNft,
}: {
  onMint: () => void;
  mintedNft?: { imageUrl: string; rarity: string; txHash: string } | null;
}) {
  return (
    <section className="w-full bg-gradient-to-br from-pink-50 to-blue-50 py-12">
      <div className="container mx-auto flex flex-col items-center gap-8">
        <h2 className="mb-4 text-3xl font-bold md:text-4xl">
          Mint Your Plumffel
        </h2>
        <p className="mb-4 max-w-xl text-center text-lg text-gray-700">
          Get your unique Plumffel NFT and join the cutest staking community!
        </p>
        <Button size="lg" onClick={onMint}>
          Mint NFT
        </Button>
        {mintedNft && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <img
              src={mintedNft.imageUrl}
              alt="Your NFT"
              className="h-64 w-64 rounded-xl border"
            />
            <div className="text-lg font-bold">Rarity: {mintedNft.rarity}</div>
            <a
              href={`https://sepolia.etherscan.io/tx/${mintedNft.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View on Etherscan
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
