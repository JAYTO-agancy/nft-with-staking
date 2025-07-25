const stats = {
  total: 10000,
  minted: 4321,
  rarities: [
    { name: "Legendary", count: 12, color: "bg-yellow-400" },
    { name: "Epic", count: 100, color: "bg-purple-500" },
    { name: "Rare", count: 400, color: "bg-blue-400" },
    { name: "Uncommon", count: 1200, color: "bg-green-400" },
    { name: "Common", count: 2609, color: "bg-gray-300" },
  ],
};

export function StatsSection() {
  const remaining = stats.total - stats.minted;
  return (
    <section className="w-full bg-white py-12">
      <div className="container mx-auto">
        <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl">
          Collection Stats
        </h2>
        <div className="mb-8 flex flex-col justify-center gap-8 md:flex-row">
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold">{stats.minted}</div>
            <div className="text-gray-600">Minted</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold">{remaining}</div>
            <div className="text-gray-600">Remaining</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold">{stats.total}</div>
            <div className="text-gray-600">Total</div>
          </div>
        </div>
        <div className="mx-auto max-w-2xl">
          {stats.rarities.map((r) => (
            <div key={r.name} className="mb-4">
              <div className="mb-1 flex justify-between">
                <span className="font-semibold text-gray-700">{r.name}</span>
                <span className="text-gray-500">{r.count}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-200">
                <div
                  className={`${r.color} h-3 rounded-full`}
                  style={{ width: `${(r.count / stats.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
