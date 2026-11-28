const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ["dist/**", "node_modules/**", ".expo/**"],
  },
  {
    rules: {
      // Aturan baru eslint-config-expo 57 terlalu ketat untuk pola data-fetching
      // React Native (setState async di useEffect adalah pola standar).
      "react-hooks/set-state-in-effect": "off",
      // Animated.Value dibungkus useRef dan dipakai di style — false positive.
      "react-hooks/refs": "off",
    },
  },
]);
