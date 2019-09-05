module.exports = {
  extends: ['tui', 'prettier'],
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    jasmine: true,
    jquery: true,
    commonjs: true
  },
  globals: {
    tui: true,
    loadFixtures: true
  }
};
