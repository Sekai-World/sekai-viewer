module.exports = {
  input: "src/components/**/*.tsx",
  output: "public/locales/$LOCALE/$NAMESPACE.json",
  verbose: true,
  locales: ["en", "zh-CN", "zh-TW", "ja", "ko", "es", "de", "pt-BR", "ru"],
  keepRemoved: true,
  lineEnding: "lf",
};
