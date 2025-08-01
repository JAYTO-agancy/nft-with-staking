const basePath = process.cwd();
const sharp = require("sharp");
const {
  NETWORK,
} = require(`${basePath}/constants/network.js`);
const fs = require("fs");
const sha1 = require(`${basePath}/node_modules/sha1`);
const {
  createCanvas,
  loadImage,
} = require(`${basePath}/node_modules/canvas`);
const buildDir = `${basePath}/build`;
const layersDir = `${basePath}/layers`;
const {
  format,
  baseUri,
  description,
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  rarityDelimiter,
  shuffleLayerConfigurations,
  debugLogs,
  extraMetadata,
  text,
  namePrefix,
  network,
  solanaMetadata,
  gif,
} = require(`${basePath}/src/config.js`);
const canvas = createCanvas(
  format.width,
  format.height
);
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled =
  format.smoothing;
var metadataList = [];
var attributesList = [];
var dnaList = new Set();
const DNA_DELIMITER = "-";
const HashlipsGiffer = require(`${basePath}/modules/HashlipsGiffer.js`);

let hashlipsGiffer = null;

let rarityCounts = {
  1: 0, // Common
  2: 0, // Uncommon
  3: 0, // Rare
  4: 0, // Epic
  5: 0, // Legendary
};

const buildSetup = () => {
  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, {
      recursive: true,
    });
  }
  fs.mkdirSync(buildDir);
  fs.mkdirSync(`${buildDir}/json`);
  fs.mkdirSync(`${buildDir}/images`);
  if (gif.export) {
    fs.mkdirSync(`${buildDir}/gifs`);
  }
};

const getRarityWeight = (_str) => {
  let nameWithoutExtension = _str.slice(
    0,
    -4
  );
  var nameWithoutWeight = Number(
    nameWithoutExtension
      .split(rarityDelimiter)
      .pop()
  );
  if (isNaN(nameWithoutWeight)) {
    nameWithoutWeight = 1;
  }
  return nameWithoutWeight;
};

const cleanDna = (_str) => {
  const withoutOptions =
    removeQueryStrings(_str);
  var dna = Number(
    withoutOptions.split(":").shift()
  );
  return dna;
};

const cleanName = (_str) => {
  let nameWithoutExtension = _str.slice(
    0,
    -4
  );
  var nameWithoutWeight =
    nameWithoutExtension
      .split(rarityDelimiter)
      .shift();
  return nameWithoutWeight;
};

const getElements = (path) => {
  return fs
    .readdirSync(path)
    .filter(
      (item) =>
        !/(^|\/)\.[^\/\.]/g.test(item)
    )
    .map((i, index) => {
      if (i.includes("-")) {
        throw new Error(
          `layer name can not contain dashes, please fix: ${i}`
        );
      }
      return {
        id: index,
        name: cleanName(i),
        filename: i,
        path: `${path}${i}`,
        weight: getRarityWeight(i),
      };
    });
};

const layersSetup = (layersOrder) => {
  const layers = layersOrder.map(
    (layerObj, index) => ({
      id: index,
      elements: getElements(
        `${layersDir}/${layerObj.name}/`
      ),
      name:
        layerObj.options?.[
          "displayName"
        ] != undefined
          ? layerObj.options?.[
              "displayName"
            ]
          : layerObj.name,
      blend:
        layerObj.options?.["blend"] !=
        undefined
          ? layerObj.options?.["blend"]
          : "source-over",
      opacity:
        layerObj.options?.["opacity"] !=
        undefined
          ? layerObj.options?.[
              "opacity"
            ]
          : 1,
      bypassDNA:
        layerObj.options?.[
          "bypassDNA"
        ] !== undefined
          ? layerObj.options?.[
              "bypassDNA"
            ]
          : false,
    })
  );
  return layers;
};

const saveImage = async (
  _editionCount
) => {
  const imagePath = `${buildDir}/images/${_editionCount}.png`;

  try {
    // Конвертируем canvas в буфер и сжимаем
    await sharp(
      canvas.toBuffer("image/png")
    )
      .png({
        quality: 80, // 80% качества (1-100)
        compressionLevel: 9, // Максимальное сжатие (0-9)
      })
      .toFile(imagePath);

    console.log(
      `✓ Изображение ${_editionCount}.png сжато через sharp`
    );
  } catch (e) {
    console.error(
      `⚠️ Ошибка sharp: ${e.message}`
    );
    // Fallback: сохранение без сжатия
    fs.writeFileSync(
      imagePath,
      canvas.toBuffer("image/png")
    );
  }
};

const genColor = () => {
  let hue = Math.floor(
    Math.random() * 360
  );
  let pastel = `hsl(${hue}, 100%, ${background.brightness})`;
  return pastel;
};

const drawBackground = () => {
  ctx.fillStyle = background.static
    ? background.default
    : genColor();
  ctx.fillRect(
    0,
    0,
    format.width,
    format.height
  );
};

const addMetadata = (
  _dna,
  _edition,
  _rarityLevel
) => {
  const rarityTiers = [
    "Common",
    "Uncommon",
    "Rare",
    "Epic",
    "Legendary",
  ];
  const rarityName =
    rarityTiers[_rarityLevel - 1]; // Преобразуем число (1-5) в название

  console.log(
    "🖼️ Current rarity: ",
    rarityName
  );

  let dateTime = Date.now();
  let tempMetadata = {
    name: `${namePrefix} #${_edition}`,
    description: description,
    image: `${baseUri}/${_edition}.png`,
    dna: sha1(_dna),
    edition: _edition,
    date: dateTime,
    ...extraMetadata,
    attributes: [
      ...attributesList,
      {
        trait_type: "Rarity", // Добавляем новый атрибут
        value: rarityName,
      },
    ],
    compiler: "HashLips Art Engine",
  };
  if (network == NETWORK.sol) {
    tempMetadata = {
      //Added metadata for solana
      name: tempMetadata.name,
      symbol: solanaMetadata.symbol,
      description:
        tempMetadata.description,
      //Added metadata for solana
      seller_fee_basis_points:
        solanaMetadata.seller_fee_basis_points,
      image: `${_edition}.png`,
      //Added metadata for solana
      external_url:
        solanaMetadata.external_url,
      edition: _edition,
      ...extraMetadata,
      attributes:
        tempMetadata.attributes,
      properties: {
        files: [
          {
            uri: `${_edition}.png`,
            type: "image/png",
          },
        ],
        category: "image",
        creators:
          solanaMetadata.creators,
      },
    };
  }
  metadataList.push(tempMetadata);
  attributesList = [];
};

const addAttributes = (_element) => {
  let selectedElement =
    _element.layer.selectedElement;
  attributesList.push({
    trait_type: _element.layer.name,
    value: selectedElement.name,
  });
};

const loadLayerImg = async (_layer) => {
  try {
    return new Promise(
      async (resolve) => {
        const image = await loadImage(
          `${_layer.selectedElement.path}`
        );
        resolve({
          layer: _layer,
          loadedImage: image,
        });
      }
    );
  } catch (error) {
    console.error(
      "Error loading image:",
      error
    );
  }
};

const addText = (_sig, x, y, size) => {
  ctx.fillStyle = text.color;
  ctx.font = `${text.weight} ${size}pt ${text.family}`;
  ctx.textBaseline = text.baseline;
  ctx.textAlign = text.align;
  ctx.fillText(_sig, x, y);
};

const drawElement = (
  _renderObject,
  _index,
  _layersLen
) => {
  ctx.globalAlpha =
    _renderObject.layer.opacity;
  ctx.globalCompositeOperation =
    _renderObject.layer.blend;
  text.only
    ? addText(
        `${_renderObject.layer.name}${text.spacer}${_renderObject.layer.selectedElement.name}`,
        text.xGap,
        text.yGap * (_index + 1),
        text.size
      )
    : ctx.drawImage(
        _renderObject.loadedImage,
        0,
        0,
        format.width,
        format.height
      );

  addAttributes(_renderObject);
};

const constructLayerToDna = (
  _dna = "",
  _layers = []
) => {
  let mappedDnaToLayers = _layers.map(
    (layer, index) => {
      let selectedElement =
        layer.elements.find(
          (e) =>
            e.id ==
            cleanDna(
              _dna.split(DNA_DELIMITER)[
                index
              ]
            )
        );
      return {
        name: layer.name,
        blend: layer.blend,
        opacity: layer.opacity,
        selectedElement:
          selectedElement,
      };
    }
  );
  return mappedDnaToLayers;
};

/**
 * In some cases a DNA string may contain optional query parameters for options
 * such as bypassing the DNA isUnique check, this function filters out those
 * items without modifying the stored DNA.
 *
 * @param {String} _dna New DNA string
 * @returns new DNA string with any items that should be filtered, removed.
 */
const filterDNAOptions = (_dna) => {
  const dnaItems = _dna.split(
    DNA_DELIMITER
  );
  const filteredDNA = dnaItems.filter(
    (element) => {
      const query = /(\?.*$)/;
      const querystring =
        query.exec(element);
      if (!querystring) {
        return true;
      }
      const options = querystring[1]
        .split("&")
        .reduce((r, setting) => {
          const keyPairs =
            setting.split("=");
          return {
            ...r,
            [keyPairs[0]]: keyPairs[1],
          };
        }, []);

      return options.bypassDNA;
    }
  );

  return filteredDNA.join(
    DNA_DELIMITER
  );
};

/**
 * Cleaning function for DNA strings. When DNA strings include an option, it
 * is added to the filename with a ?setting=value query string. It needs to be
 * removed to properly access the file name before Drawing.
 *
 * @param {String} _dna The entire newDNA string
 * @returns Cleaned DNA string without querystring parameters.
 */
const removeQueryStrings = (_dna) => {
  const query = /(\?.*$)/;
  return _dna.replace(query, "");
};

const isDnaUnique = (
  _DnaList = new Set(),
  _dna = ""
) => {
  const _filteredDNA =
    filterDNAOptions(_dna);
  return !_DnaList.has(_filteredDNA);
};

const createDna = (_layers) => {
  let randNum = [];

  let rarityCurrentCounts = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  }; // Счетчик элементов каждой редкости

  // Шаг 1: Генерируем DNA и считаем элементы по редкости
  _layers.forEach((layer) => {
    let totalWeight = 0;
    layer.elements.forEach(
      (element) => {
        totalWeight += element.weight;
      }
    );

    let random = Math.floor(
      Math.random() * totalWeight
    );
    for (
      let i = 0;
      i < layer.elements.length;
      i++
    ) {
      random -=
        layer.elements[i].weight;
      if (random < 0) {
        const filename =
          layer.elements[i].filename;
        const rarityMatch =
          filename.match(/#(\d+)\./);
        const elementRarity =
          rarityMatch
            ? parseInt(rarityMatch[1])
            : 1;

        rarityCurrentCounts[
          elementRarity
        ]++; // Увеличиваем счетчик для этой редкости
        randNum.push(
          `${
            layer.elements[i].id
          }:${filename}${
            layer.bypassDNA
              ? "?bypassDNA=true"
              : ""
          }`
        );
        break;
      }
    }
  });

  // Шаг 2: Определяем общую редкость NFT по новым правилам
  let nftRarity;

  console.log(
    `Редкость NFT: Commons: ${rarityCounts[1]} | Uncommons: ${rarityCounts[2]} | Rare: ${rarityCounts[3]} | Epic: ${rarityCounts[4]} | Legendary: ${rarityCounts[5]}`
  );

  if (
    rarityCurrentCounts[1] >= 1 &&
    (rarityCurrentCounts[2] >= 2 ||
      rarityCurrentCounts[3] >= 2)
  ) {
    nftRarity = 5;
  } else if (
    rarityCurrentCounts[1] >= 1 &&
    rarityCurrentCounts[2] >= 1
  ) {
    nftRarity = 4;
  } else if (
    rarityCurrentCounts[1] >= 1 ||
    rarityCurrentCounts[2] >= 3
  ) {
    nftRarity = 3; // Rare (2+ элемента #3)
  } else if (
    rarityCurrentCounts[4] >= 3 ||
    rarityCurrentCounts[3] >= 1
  ) {
    nftRarity = 2; // Uncommon (2+ элемента #4 или 2 элемент #3)
  } else {
    nftRarity = 1; // Common (все остальное)
  }

  // Шаг 4: Увеличиваем счетчик и возвращаем DNA
  rarityCounts[nftRarity]++;
  return {
    dna: randNum.join(DNA_DELIMITER),
    rarityLevel: nftRarity,
  };
};

const writeMetaData = (_data) => {
  fs.writeFileSync(
    `${buildDir}/json/_metadata.json`,
    _data
  );
};

const saveMetaDataSingleFile = (
  _editionCount
) => {
  let metadata = metadataList.find(
    (meta) =>
      meta.edition == _editionCount
  );
  debugLogs
    ? console.log(
        `Writing metadata for ${_editionCount}: ${JSON.stringify(
          metadata
        )}`
      )
    : null;
  fs.writeFileSync(
    `${buildDir}/json/${_editionCount}.json`,
    JSON.stringify(metadata, null, 2)
  );
};

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(
      Math.random() * currentIndex
    );
    currentIndex--;
    [
      array[currentIndex],
      array[randomIndex],
    ] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

// Маппинг названий редкости на числовые значения
const rarityNameToNumber = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5,
};

// Функция для проверки, соответствует ли DNA требуемой редкости
const checkDnaMatchesRarity = (
  dna,
  layers,
  targetRarity
) => {
  let rarityCurrentCounts = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  // Подсчитываем элементы каждой редкости в DNA
  dna
    .split(DNA_DELIMITER)
    .forEach((dnaItem, index) => {
      const cleanedDna =
        cleanDna(dnaItem);
      const layer = layers[index];
      const element =
        layer.elements.find(
          (e) => e.id == cleanedDna
        );

      if (element) {
        const filename =
          element.filename;
        const rarityMatch =
          filename.match(/#(\d+)\./);
        const elementRarity =
          rarityMatch
            ? parseInt(rarityMatch[1])
            : 1;
        rarityCurrentCounts[
          elementRarity
        ]++;
      }
    });

  // Определяем редкость NFT по тем же правилам
  let nftRarity;

  if (
    rarityCurrentCounts[1] >= 1 &&
    (rarityCurrentCounts[2] >= 2 ||
      rarityCurrentCounts[3] >= 2)
  ) {
    nftRarity = 5;
  } else if (
    rarityCurrentCounts[1] >= 1 &&
    rarityCurrentCounts[2] >= 1
  ) {
    nftRarity = 4;
  } else if (
    rarityCurrentCounts[1] >= 1 ||
    rarityCurrentCounts[2] >= 3
  ) {
    nftRarity = 3;
  } else if (
    rarityCurrentCounts[4] >= 3 ||
    rarityCurrentCounts[3] >= 1
  ) {
    nftRarity = 2;
  } else {
    nftRarity = 1;
  }

  return nftRarity === targetRarity;
};

// Новая функция для создания DNA с конкретной редкостью
const createDnaWithRarity = (
  _layers,
  targetRarity,
  maxAttempts = 10000
) => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const dnaData = createDna(_layers);

    if (
      dnaData &&
      dnaData.rarityLevel ===
        targetRarity
    ) {
      return dnaData;
    }

    attempts++;
  }

  console.log(
    `⚠️ Не удалось создать NFT с редкостью ${targetRarity} после ${maxAttempts} попыток`
  );
  return null;
};

const startCreating = async (
  requestedRarity = null,
  requestedCount = 1
) => {
  let layerConfigIndex = 0;
  let editionCount = 1;
  let failedCount = 0;
  let abstractedIndexes = [];

  // Преобразуем название редкости в число
  let targetRarity = null;
  if (requestedRarity) {
    targetRarity =
      rarityNameToNumber[
        requestedRarity.toLowerCase()
      ];
    if (!targetRarity) {
      console.error(
        `❌ Неизвестная редкость: ${requestedRarity}`
      );
      console.log(
        `Доступные редкости: Common, Uncommon, Rare, Epic, Legendary`
      );
      process.exit(1);
    }
    console.log(
      `🎯 Генерация ${requestedCount} NFT с редкостью: ${requestedRarity}`
    );
  }

  // Если указана конкретная редкость, генерируем только запрошенное количество
  const totalToGenerate = targetRarity
    ? requestedCount
    : layerConfigurations[
        layerConfigurations.length - 1
      ].growEditionSizeTo;

  for (
    let i =
      network == NETWORK.sol ? 0 : 1;
    i <= totalToGenerate;
    i++
  ) {
    abstractedIndexes.push(i);
  }

  if (shuffleLayerConfigurations) {
    abstractedIndexes = shuffle(
      abstractedIndexes
    );
  }

  debugLogs
    ? console.log(
        "Editions left to create: ",
        abstractedIndexes
      )
    : null;

  let generatedCount = 0;

  while (
    layerConfigIndex <
      layerConfigurations.length &&
    generatedCount < totalToGenerate
  ) {
    const layers = layersSetup(
      layerConfigurations[
        layerConfigIndex
      ].layersOrder
    );

    while (
      editionCount <=
        layerConfigurations[
          layerConfigIndex
        ].growEditionSizeTo &&
      generatedCount < totalToGenerate
    ) {
      let dnaData;

      // Если указана конкретная редкость, используем специальную функцию
      if (targetRarity) {
        dnaData = createDnaWithRarity(
          layers,
          targetRarity
        );
        if (!dnaData) {
          console.log(
            `❌ Не удалось создать NFT с редкостью ${requestedRarity}`
          );
          failedCount++;
          if (
            failedCount >=
            uniqueDnaTorrance
          ) {
            console.log(
              `Слишком много неудачных попыток. Завершение процесса.`
            );
            break;
          }
          continue;
        }
      } else {
        dnaData = createDna(layers);
        if (!dnaData) {
          console.log(
            "Пропуск NFT из-за лимита редкости"
          );
          continue;
        }
      }

      const {
        dna: newDna,
        rarityLevel,
      } = dnaData;

      if (
        isDnaUnique(dnaList, newDna)
      ) {
        let results =
          constructLayerToDna(
            newDna,
            layers
          );

        // Проверка на Jacket/Neck
        const clothLayer = results.find(
          (layer) =>
            layer.name === "Cloth"
        );
        const neckLayer = results.find(
          (layer) =>
            layer.name === "Neck"
        );

        const hasJacket =
          clothLayer?.selectedElement?.name.startsWith(
            "Jacket"
          );

        if (hasJacket && neckLayer) {
          console.log(
            `🔄 Jacket detected ("${clothLayer.selectedElement.name}"), removing Neck layer`
          );
          results = results.filter(
            (layer) =>
              layer.name !== "Neck"
          );
        }

        console.log(
          `✅ Final layers: ${results
            .map((layer) => layer.name)
            .join(", ")}`
        );

        let loadedElements = [];
        results.forEach((layer) => {
          loadedElements.push(
            loadLayerImg(layer)
          );
        });

        await Promise.all(
          loadedElements
        ).then((renderObjectArray) => {
          debugLogs
            ? console.log(
                "Clearing canvas"
              )
            : null;
          ctx.clearRect(
            0,
            0,
            format.width,
            format.height
          );

          if (gif.export) {
            hashlipsGiffer =
              new HashlipsGiffer(
                canvas,
                ctx,
                `${buildDir}/gifs/${abstractedIndexes[0]}.gif`,
                gif.repeat,
                gif.quality,
                gif.delay
              );
            hashlipsGiffer.start();
          }

          if (background.generate) {
            drawBackground();
          }

          renderObjectArray.forEach(
            (renderObject, index) => {
              drawElement(
                renderObject,
                index,
                layerConfigurations[
                  layerConfigIndex
                ].layersOrder.length
              );
              if (gif.export) {
                hashlipsGiffer.add();
              }
            }
          );

          if (gif.export) {
            hashlipsGiffer.stop();
          }

          debugLogs
            ? console.log(
                "Editions left to create: ",
                abstractedIndexes
              )
            : null;

          saveImage(
            abstractedIndexes[0]
          );
          addMetadata(
            newDna,
            abstractedIndexes[0],
            rarityLevel
          );
          saveMetaDataSingleFile(
            abstractedIndexes[0]
          );

          const rarityTiers = [
            "Common",
            "Uncommon",
            "Rare",
            "Epic",
            "Legendary",
          ];
          console.log(
            `✅ Created edition: ${
              abstractedIndexes[0]
            }, Rarity: ${
              rarityTiers[
                rarityLevel - 1
              ]
            }, DNA: ${sha1(newDna)}`
          );
        });

        dnaList.add(
          filterDNAOptions(newDna)
        );
        editionCount++;
        generatedCount++;
        abstractedIndexes.shift();
      } else {
        console.log("DNA exists!");
        failedCount++;
        if (
          failedCount >=
          uniqueDnaTorrance
        ) {
          console.log(
            `You need more layers or elements to grow your edition to ${layerConfigurations[layerConfigIndex].growEditionSizeTo} artworks!`
          );
          process.exit();
        }
      }
    }
    layerConfigIndex++;
  }

  writeMetaData(
    JSON.stringify(
      metadataList,
      null,
      2
    )
  );

  if (targetRarity) {
    const rarityTiers = [
      "Common",
      "Uncommon",
      "Rare",
      "Epic",
      "Legendary",
    ];
    console.log(
      `\n✅ Успешно сгенерировано ${generatedCount} NFT с редкостью ${
        rarityTiers[targetRarity - 1]
      }`
    );
  }
};

module.exports = {
  startCreating,
  buildSetup,
  getElements,
};
