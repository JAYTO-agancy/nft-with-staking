const basePath = process.cwd();
const { startCreating, buildSetup } = require(`${basePath}/src/main.js`);

(() => {
  // Получаем аргумент редкости из командной строки
  const args = process.argv.slice(2);
  const requestedRarity = args[0] || null;
  const requestedCount = parseInt(args[1]) || 1;

  buildSetup();
  startCreating(requestedRarity, requestedCount);
})();

// # Генерация одной Legendary NFT
// node index.js Legendary

// # Генерация 5 Epic NFT
// node index.js Epic 5

// # Генерация 10 Rare NFT
// node index.js rare 10

// # Обычная генерация всей коллекции
// node index.js