"use client";

import { useEffect, useState } from "react";

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  const generateNFT = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generateNFT", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.nft);
        setStats(data.stats);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Generation failed");
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const response = await fetch("/api/generateNFT");
    const data = await response.json();
    setStats(data.stats);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl">NFT Generator</h1>

      <button
        onClick={generateNFT}
        disabled={loading}
        className="rounded bg-blue-500 px-4 py-2 text-white"
      >
        {loading ? "Generating..." : "Generate Random NFT"}
      </button>

      <button
        onClick={fetchStats}
        className="ml-2 rounded bg-gray-500 px-4 py-2 text-white"
      >
        Refresh Stats
      </button>

      {result && (
        <div className="mt-4 rounded border p-4">
          <h2 className="text-xl">Generated NFT</h2>
          <p>Name: {result.name}</p>
          <p>Rarity: {result.rarity}</p>
          <p>Edition: {result.edition}</p>
          <img
            src={result.imageUrl}
            alt={result.name}
            className="mt-2 h-64 w-64"
          />
        </div>
      )}

      {stats && (
        <div className="mt-4">
          <h2 className="mb-2 text-xl">Generation Statistics</h2>
          <table className="w-full border">
            <thead>
              <tr>
                <th className="border p-2">Rarity</th>
                <th className="border p-2">Generated</th>
                <th className="border p-2">Limit</th>
                <th className="border p-2">Remaining</th>
                <th className="border p-2">Current Chance</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s: any) => (
                <tr key={s.rarity}>
                  <td className="border p-2">{s.rarity}</td>
                  <td className="border p-2">{s.generated}</td>
                  <td className="border p-2">{s.limit}</td>
                  <td className="border p-2">{s.remaining}</td>
                  <td className="border p-2">{s.currentChance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
