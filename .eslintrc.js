module.exports = {
  extends: ['tui', 'prettier'],
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    jest: true,
    jquery: true,
    commonjs: true
  },
  globals: {
    tui: true,
    loadFixtures: true
  }
};
