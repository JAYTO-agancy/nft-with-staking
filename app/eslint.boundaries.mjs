import boundaries from "eslint-plugin-boundaries";

const eslintBoundariesConfig = {
  plugins: {
    boundaries,
  },
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.json",
      },
      node: {
        extensions: [".ts", ".tsx"],
      },
    },

    "boundaries/elements": [
      {
        type: "app",
        pattern: "./src/app",
      },
      {
        type: "pages",
        pattern: "./src/pages",
      },
      {
        type: "features",
        pattern: "./src/features/*",
      },
      {
        type: "widgets",
        pattern: "./src/widgets/*",
      },
      {
        type: "entities",
        pattern: "./src/entities/*",
      },
      {
        type: "shared",
        pattern: "./src/shared",
      },
    ],
  },
  rules: {
    "boundaries/element-types": [
      2,
      {
        default: "allow",
        rules: [
          {
            from: "shared",
            disallow: ["app", "pages", "features", "widgets", "entities"],
            message:
              "Модуль нижележащего слоя (${file.type}) не может импортировать модуль вышележащего слоя (${dependency.type})",
          },
          {
            from: "entities",
            disallow: ["app", "pages", "features", "widgets"],
            message:
              "Модуль нижележащего слоя (${file.type}) не может импортировать модуль вышележащего слоя (${dependency.type})",
          },
          {
            from: "widgets",
            disallow: ["app", "pages", "features"],
            message:
              "Модуль нижележащего слоя (${file.type}) не может импортировать модуль вышележащего слоя (${dependency.type})",
          },
          {
            from: "features",
            disallow: ["app", "pages"],
            message:
              "Модуль нижележащего слоя (${file.type}) не может импортировать модуль вышележащего слоя (${dependency.type})",
          },
        ],
      },
    ],
    "boundaries/entry-point": [
      2,
      {
        default: "disallow",
        message:
          "Модуль (${file.type}) должен импортироваться через public API. Прямой импорт из ${dependency.source} запрещен",

        rules: [
          {
            target: ["shared", "app", "pages"],
            allow: "**",
          },
          {
            target: ["features", "widgets", "entities"],
            allow: ["index.(ts|tsx)", "*.tsx"],
          },
        ],
      },
    ],
  },
};

export default eslintBoundariesConfig;
