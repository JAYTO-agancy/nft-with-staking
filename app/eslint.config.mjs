import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "url";
import { dirname } from "path";
import eslintBoundariesConfig from "./eslint.boundaries.mjs";

// Для совместимости с Next.js расширениями
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default tseslint.config(
  // Базовые игнорируемые директории
  {
    ignores: [
      "dist",
      ".next",
      "out",
      "node_modules",
      "next-env.d.ts",
      "*.js",
      "**/*.js",
    ],
  },

  // Основные конфигурации
  {
    extends: [
      ...tseslint.configs.recommended,
      ...compat.extends("next/core-web-vitals"),
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // Next.js не требует React в области видимости
      "react/react-in-jsx-scope": "off",

      // Дополнительные правила для Next.js
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // Специальные правила для определенных файлов Next.js
  {
    files: [
      "**/page.tsx",
      "**/layout.tsx",
      "**/route.tsx",
      "**/loading.tsx",
      "**/error.tsx",
    ],
    rules: {
      // В файлах Next.js App Router экспорт по умолчанию - обязателен
      "import/no-default-export": "off",
      "import/prefer-default-export": "error",
    },
  },

  // Подключаем границы архитектуры
  eslintBoundariesConfig
);
