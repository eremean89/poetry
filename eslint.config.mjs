import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // базовые правила Next.js
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // наш дополнительный блок с отключением правила
  {
    rules: {
      // полностью выключаем ворнинг про <img>
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
