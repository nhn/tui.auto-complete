var snippet = require('tui-code-snippet');
var Mock = require('./mock');
var config = require('./autoConfig');
var path = require('path');
var fs = require('fs');
var $ = require('jquery');
var fixturesPath = './fixtures';

snippet.defineNamespace('tui.test.global', {
  Default: config.Default,
  Plane: config.Plane,
  mock: Mock.mock,
  n_mock: Mock.n_mock,
});

global.$ = global.jQuery = $;

global.loadFixtures = function (fileName) {
  var data = '';
  var dir = path.resolve(__dirname, fixturesPath, fileName);

  try {
    data = fs.readFileSync(dir, 'utf8'); // eslint-disable-line no-sync
  } catch (err) {} // eslint-disable-line no-empty
  finally {
    document.body.innerHTML = data;
  }
};

expect.extend({
  toBeEmpty: function (actual) {
    var result;
    try {
      result = $(actual).is(':empty');

      return {
        pass: result,
        message: function () {
          return `recived value is ${result ? '' : 'not '}empty.`;
        },
      };
    } catch (error) {
      return {
        pass: false,
        message: function () {
          return 'received value cannot resolve to jQuery';
        },
      };
    }
  },
  toBeDisabled: function (actual) {
    var result;
    try {
      result = $(actual).is(':disabled');

      return {
        pass: result,
        message: function () {
          return `recived value is ${result ? '' : 'not '}disabled.`;
        },
      };
    } catch (error) {
      return {
        pass: false,
        message: function () {
          return 'received value cannot resolve to jQuery';
        },
      };
    }
  },
});
