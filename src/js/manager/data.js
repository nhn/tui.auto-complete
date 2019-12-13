/**
 * @fileoverview Data is kind of manager module to request data at API with input queries.
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */

var forEachOwnProperties = require('tui-code-snippet/collection/forEachOwnProperties');
var defineClass = require('tui-code-snippet/defineClass/defineClass');
var extend = require('tui-code-snippet/object/extend');
var isEmpty = require('tui-code-snippet/type/isEmpty');
var map = require('../util').map;

var $ = require('jquery');
var CALLBACK_NAME = 'dataCallback',
  SERACH_QUERY_IDENTIFIER = 'q';

/**
 * Unit of auto complete connecting server.
 * @ignore
 * @constructor
 */
var Data = defineClass(
  /** @lends Data.prototype */ {
    init: function(autoCompleteObj, options) {
      this.autoCompleteObj = autoCompleteObj;
      this.options = options;
    },

    /**
     * Request data at api server use jsonp
     * @param {String} keyword String to request at server
     */
    request: function(keyword) {
      var rsKeyWrod = keyword.replace(/\s/g, ''),
        acObj = this.autoCompleteObj,
        keyData;

      if (!keyword || !rsKeyWrod) {
        acObj.hideResultList();

        return;
      }

      this.options.searchApi[SERACH_QUERY_IDENTIFIER] = keyword;
      $.ajax(this.options.searchUrl, {
        dataType: 'jsonp',
        jsonpCallback: CALLBACK_NAME,
        data: this.options.searchApi,
        type: 'get',
        success: $.proxy(function(dataObj) {
          try {
            keyData = this._getCollectionData(dataObj);
            acObj.setQueries(dataObj.query);
            acObj.setServerData(keyData);
            acObj.clearReadyValue();
          } catch (e) {
            throw new Error('[DataManager] invalid response data.', e);
          }
        }, this)
      });
    },

    /**
     * Make collection data to display
     * @param {object} dataObj Collection data
     * @returns {Array}
     * @private
     */
    _getCollectionData: function(dataObj) {
      var collection = dataObj.collections,
        itemDataList = [];

      forEachOwnProperties(
        collection,
        function(itemSet) {
          var keys;

          if (isEmpty(itemSet.items)) {
            return;
          }

          keys = this._getRedirectData(itemSet);
          itemDataList.push({
            type: 'title',
            values: [itemSet.title]
          });
          itemDataList = itemDataList.concat(keys);
        },
        this
      );

      return itemDataList;
    },

    /**
     * Make item of collection to display
     * @param {object} itemSet Item of collection data
     * @private
     * @returns {Array}
     */
    _getRedirectData: function(itemSet) {
      var defaultData = {
          type: itemSet.type,
          index: itemSet.index,
          dest: itemSet.destination
        },
        items = itemSet.items.slice(0, this.options.viewCount - 1);

      items = map(items, function(item) {
        return extend(
          {
            values: item
          },
          defaultData
        );
      });

      return items;
    }
  }
);

module.exports = Data;
