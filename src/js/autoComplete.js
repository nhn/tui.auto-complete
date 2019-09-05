/**
 * @fileoverview Auto complete's Core element. All of auto complete objects belong with this object.
 * @author NHN FE Dev Lab. <dl_javascript@nhn.com>
 */
var snippet = require('tui-code-snippet');
var Cookies = require('js-cookie');
var $ = require('jquery');
var DataManager = require('./manager/data'),
  InputManager = require('./manager/input'),
  ResultManager = require('./manager/result');

var DEFAULT_COOKIE_NAME = '_atcp_use_cookie';

var requiredOptions = [
    'resultListElement',
    'searchBoxElement',
    'orgQueryElement',
    'formElement',
    'subQuerySet',
    'template',
    'listConfig',
    'actions',
    'searchUrl'
  ],
  rIsElementOption = /element/i;

/**
 * @constructor
 * @param {Object} options
 * @param {Boolean} [options.usageStatistics=true] - Let us know the hostname. If you don't want to send the hostname, please set to false.
 * @example <caption>CommonJS</caption>
 * var AutoComplete = require('tui-auto-complete');
 * var autoComplete = new AutoComplete({'config': 'Default'});
 * @example <caption>Global Namespace</caption>
 * var autoComplete = new tui.AutoComplete({"config" : "Default"});
 * @example <caption>Arguments of AutoComplete Constructor</caption>
 * SAMPLE FILE: [AutoConfig.json]{@link https://github.com/nhn/tui.auto-complete/blob/master/src/js/autoComplete.js}
 */
var AutoComplete = snippet.defineClass(
  /** @lends AutoComplete.prototype */ {
    init: function(options) {
      options = snippet.extend(
        {
          usageStatistics: true
        },
        options
      );

      this.options = {};
      this.isUse = true;
      this.queries = null;
      this.isIdle = true;

      this._checkValidation(options);
      this._setOptions(options);

      this.dataManager = new DataManager(this, this.options);
      this.inputManager = new InputManager(this, this.options);
      this.resultManager = new ResultManager(this, this.options);

      this.setToggleBtnImg(this.isUse);
      this.setCookieValue(this.isUse);

      if (options.usageStatistics) {
        snippet.sendHostname('auto-complete', 'UA-129987462-1');
      }
    },

    /**
     * Direction value for key
     * @static
     * @private
     */
    flowMap: {
      NEXT: 'next',
      PREV: 'prev',
      FIRST: 'first',
      LAST: 'last'
    },

    /**
     * Interval for check update input
     * @type {number}
     * @default 300
     */
    watchInterval: 300,

    /**
     * Check required fields and validate fields.
     * @param {Object} options component configurations
     * @private
     */
    _checkValidation: function(options) {
      var isExisty = snippet.isExisty,
        config = options.config;

      if (!isExisty(config)) {
        throw new Error('No configuration #' + config);
      }

      snippet.forEach(requiredOptions, function(name) {
        if (!isExisty(config[name])) {
          throw new Error(name + 'does not not exist.');
        }
      });
    },

    /**
     * Set component options
     * @param {Object} options component configurations
     * @private
     */
    _setOptions: function(options) {
      var config = options.config,
        cookieValue;

      if (!config.toggleImg || !config.onoffTextElement) {
        this.isUse = true;
        delete config.onoffTextElement;
      } else {
        cookieValue = Cookies.get(config.cookieName);
        this.isUse = cookieValue === 'use' || !cookieValue;
      }
      config.cookieName = config.cookieName || DEFAULT_COOKIE_NAME;

      if (snippet.isFalsy(config.watchInterval)) {
        config.watchInterval = this.watchInterval;
      }

      snippet.forEach(
        config,
        function(value, name) {
          if (rIsElementOption.test(name)) {
            this.options[name] = $(value);
          } else {
            this.options[name] = value;
          }
        },
        this
      );
    },

    /**
     * Request data at api server with keyword
     * @param {String} keyword The key word to send to Auto complete API
     */
    request: function(keyword) {
      this.dataManager.request(keyword);
    },

    /**
     * Return string in input element.
     * @returns {String}
     */
    getValue: function() {
      return this.inputManager.getValue();
    },

    /**
     * Set inputManager's value to show at search element
     * @param {String} keyword The string to show up at search element
     */
    setValue: function(keyword) {
      this.inputManager.setValue(keyword);
    },

    /**
     * Set additional parameters at inputManager.
     * @param {string} paramStr String to be addition parameters.(saperator '&')
     * @param {string} index The index for setting key value
     */
    setParams: function(paramStr, index) {
      this.inputManager.setParams(paramStr, index);
    },

    /**
     * Request to draw result at resultManager with data from api server.
     * @param {Array} dataArr Data array from api server
     */
    setServerData: function(dataArr) {
      this.resultManager.draw(dataArr);
    },

    /**
     * Set Cookie value with whether use auto complete or not
     * @param {Boolean} isUse Whether use auto complete or not
     */
    setCookieValue: function(isUse) {
      Cookies.set(this.options.cookieName, isUse ? 'use' : 'notUse');
      this.isUse = isUse;
      this.setToggleBtnImg(isUse);
    },

    /**
     * Save matched queries from server.
     * @param {Array} queries Result queries
     */
    setQueries: function(queries) {
      this.queries = [].concat(queries);
    },

    /**
     * Get whether use auto complete or not
     * @api
     * @returns {Boolean}
     * @example
     *  autoComplete.isUseAutoComplete(); => true|false
     */
    isUseAutoComplete: function() {
      return this.isUse;
    },

    /**
     * Whether show the result list area or not.
     * @returns {Boolean}
     */
    isShowResultList: function() {
      return this.resultManager.isShowResultList();
    },

    /**
     * Change toggle button image by auto complete state
     * @param {Boolean} isUse whether use auto complete or not
     * @private
     */
    setToggleBtnImg: function(isUse) {
      this.inputManager.setToggleBtnImg(isUse);
    },

    /**
     * Hide search result list area
     */
    hideResultList: function() {
      this.resultManager.hideResultList();
    },

    /**
     * Show search result list area
     */
    showResultList: function() {
      if (this.isUseAutoComplete()) {
        this.resultManager.showResultList();
      }
    },

    /**
     * Move to next item in result list.
     * @param {string} flow Direction to move.
     * @private
     */
    moveNextResult: function(flow) {
      this.resultManager.moveNextResult(flow);
    },

    /**
     * Set text to auto complete switch
     * @param {Boolean} isUse Whether use auto complete or not
     * @private
     */
    changeOnOffText: function(isUse) {
      this.resultManager.changeOnOffText(isUse);
    },

    /**
     * Reset serachApi
     * @api
     * @param {Object} options searchApi option
     * @example
     *  autoComplete.setSearchApi({
     *      'st' : 111,
     *      'r_lt' : 111,
     *      'r_enc' : 'UTF-8',
     *      'q_enc' : 'UTF-8',
     *      'r_format' : 'json'
     *  });
     */
    setSearchApi: function(options) {
      snippet.extend(this.options.searchApi, options);
    },

    /**
     * clear ready value and set idle state
     */
    clearReadyValue: function() {
      if (snippet.isExisty(this.readyValue)) {
        this.request(this.readyValue);
      } else {
        this.isIdle = true;
      }
      this.readyValue = null;
    }
  }
);

snippet.CustomEvents.mixin(AutoComplete);

module.exports = AutoComplete;
