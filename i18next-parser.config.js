module.exports = {
  input: "src/*(components|pages)/**/*.tsx",
  output: "public/locales/$LOCALE/$NAMESPACE.json",
  verbose: true,
  locales: ["en"],
  keepRemoved: true,
  lineEnding: "lf",
};
