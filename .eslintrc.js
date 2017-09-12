module.exports = {
  "extends": "tui",
  "parserOptions": {
    "sourceType": "module"
  },
  "env": {
    "browser": true,
    "jasmine": true,
    "jquery": true,
    "commonjs": true
  },
  "globals": {
    "tui": true,
    "loadFixtures": true
  },
  "rules": {
    "lines-around-directive": 0,
    "newline-before-return": 0,
    "padding-line-between-statements": [2,
        { blankLine: "always", prev: "*", next: "return" },
        { blankLine: "always", prev: "directive", next: "*" }, { blankLine: "any", prev: "directive", next: "directive" },
        { blankLine: "always", prev: ["const", "let", "var"], next: "*"}, { blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"]}
    ]
  }
};
