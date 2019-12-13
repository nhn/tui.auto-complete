/**
 * @fileoverview Utility module
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */

var forEachArray = require('tui-code-snippet/collection/forEachArray');
var sendHostname = require('tui-code-snippet/request/sendHostname');

var utils = {
  /**
   * Execute the provided callback function once for each element in an array, in order, and constructs a new array from the results.
   * @param {Array} arr - array to iterate
   * @param {function} iteratee  - callback function
   * @param {object} [context] - context of callback function
   * @returns {Array}
   */
  map: function(arr, iteratee, context) {
    var result = [];

    forEachArray(arr, function() {
      result.push(iteratee.apply(context || null, arguments));
    });

    return result;
  },

  /**
   * Send hostname for GA
   * @ignore
   */
  sendHostName: function() {
    sendHostname('auto-complete', 'UA-129987462-1');
  }
};

module.exports = utils;
