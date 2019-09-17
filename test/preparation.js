var snippet = require('tui-code-snippet');
var Mock = require('./mock'),
  config = require('./autoConfig');

snippet.defineNamespace('tui.test.global', {
  Default: config.Default,
  Plane: config.Plane,
  mock: Mock.mock,
  n_mock: Mock.n_mock
});

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';
