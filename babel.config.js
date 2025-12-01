module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // si usas alias "@", pon aquí module-resolver:
      // ["module-resolver", { alias: { "@": "./src" } }],
      // 👇 sólo agrega este si vuelves a instalar Reanimated
      // "react-native-reanimated/plugin",
    ],
  };
};
