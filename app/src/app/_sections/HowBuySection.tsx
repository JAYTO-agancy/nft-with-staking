import { CheckCircle } from "lucide-react";

const steps = [
  {
    title: "Connect Wallet",
    description:
      "Use the button in the header to connect your Ethereum wallet (Sepolia network).",
  },
  {
    title: "Mint NFT",
    description:
      "Click the Mint button and confirm the transaction in your wallet.",
  },
  {
    title: "View Your NFT",
    description:
      "After minting, your NFT will appear in your collection and you can see its rarity.",
  },
  {
    title: "Stake & Earn",
    description:
      "Stake your Plumffel NFT to earn rewards and participate in the ecosystem.",
  },
];

export function HowBuySection() {
  return (
    <section className="w-full bg-white py-12">
      <div className="container mx-auto">
        <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl">
          How to Buy
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-xl bg-gray-50 p-6 text-center shadow-sm"
            >
              <CheckCircle className="mb-4 h-10 w-10 text-green-500" />
              <div className="mb-2 text-xl font-semibold">{step.title}</div>
              <div className="text-gray-600">{step.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
