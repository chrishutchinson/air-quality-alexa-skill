module.exports = {
  env: {
    es6: true,
    node: true,
    jest: true
  },
  globals: {},
  extends: ["eslint:recommended"],
  rules: {
    "linebreak-style": ["error", "unix"],
    "no-eval": ["error"],
    eqeqeq: ["error"],
    "no-console": "off", // We should change this for prod
    "no-unused-expressions": 1,
    "no-unused-vars": 1,
    "no-useless-constructor": 1,
    "no-debugger": 1
  },
  parserOptions: {
    sourceType: "module"
  },
  plugins: [],
  parser: "babel-eslint"
};
