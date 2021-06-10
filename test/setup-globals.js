// eslint-disable-next-line strict
var snippet = require('tui-code-snippet');
var Mock = require('./mock');
var  config = require('./autoConfig');
var path = require('path');
var fs = require('fs');
var $ = require('jquery')
var fixturesPath = './fixtures'

snippet.defineNamespace('tui.test.global', {
  Default: config.Default,
  Plane: config.Plane,
  mock: Mock.mock,
  n_mock: Mock.n_mock
});

global.$ = global.jQuery = $;

global.loadFixtures =  function (fileName) {
  var dir = path.resolve(__dirname, fixturesPath, fileName);

  try {
    // eslint-disable-next-line no-sync
    const data = fs.readFileSync(dir, 'utf8');
    document.body.innerHTML = data;
  } catch (err) {
    console.error(err);
  }
}

expect.extend({
  toBeEmpty(actual) {
    var result;
    try {
      result = $(actual).is(':empty');

      return {
        pass: result,
        message: function() { 
          if (result) {
            return 'recived value is empty.' 
          }

          return 'recived value is not empty.'
        }
      }
    } catch(error) {
      return {
        pass: false,
        message: function() { return 'received value cannot resolve to jQuery' }
      }
    }
  },
  toBeDisabled(actual) {
    var result;
    try {
      result = $(actual).is(':disabled');

      return {
        pass: result,
        message: function() { 
          if (result) {
            return 'recived value is disabled.' 
          }

          return 'recived value is not disabled.'
        }
      }
    } catch(error) {
      return {
        pass: false,
        message: function() { return 'received value cannot resolve to jQuery' }
      }
    }
  }
});
