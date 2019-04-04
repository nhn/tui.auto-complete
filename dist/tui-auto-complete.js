/*!
 * tui-auto-complete.js
 * @version 2.1.4
 * @author NHN FE Development Lab <dl_javascript@nhn.com>
 * @license MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("tui-code-snippet"), require("js-cookie"), require("jquery"));
	else if(typeof define === 'function' && define.amd)
		define(["tui-code-snippet", "js-cookie", "jquery"], factory);
	else if(typeof exports === 'object')
		exports["AutoComplete"] = factory(require("tui-code-snippet"), require("js-cookie"), require("jquery"));
	else
		root["tui"] = root["tui"] || {}, root["tui"]["AutoComplete"] = factory((root["tui"] && root["tui"]["util"]), root["Cookies"], root["$"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_3__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "dist/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Auto complete's Core element. All of auto complete objects belong with this object.
	 * @author NHN FE Dev Lab. <dl_javascript@nhn.com>
	*/
	var snippet = __webpack_require__(1);
	var Cookies = __webpack_require__(2);
	var $ = __webpack_require__(3);
	var DataManager = __webpack_require__(4),
	    InputManager = __webpack_require__(5),
	    ResultManager = __webpack_require__(6);

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
	 * SAMPLE FILE: [AutoConfig.json]{@link http://nhnent.github.io/tui.auto-complete/latest/dist/src/js/autoComplete.js}
	 */
	var AutoComplete = snippet.defineClass(/** @lends AutoComplete.prototype */{
	    init: function(options) {
	        options = snippet.extend({
	            usageStatistics: true
	        }, options);

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
	        'NEXT': 'next',
	        'PREV': 'prev',
	        'FIRST': 'first',
	        'LAST': 'last'
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
	            this.isUse = (cookieValue === 'use' || !cookieValue);
	        }
	        config.cookieName = config.cookieName || DEFAULT_COOKIE_NAME;

	        if (snippet.isFalsy(config.watchInterval)) {
	            config.watchInterval = this.watchInterval;
	        }

	        snippet.forEach(config, function(value, name) {
	            if (rIsElementOption.test(name)) {
	                this.options[name] = $(value);
	            } else {
	                this.options[name] = value;
	            }
	        }, this);
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
	});

	snippet.CustomEvents.mixin(AutoComplete);

	module.exports = AutoComplete;


/***/ }),
/* 1 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Data is kind of manager module to request data at API with input queries.
	 * @author NHN FE dev Lab. <dl_javascript@nhn.com>
	 */
	var snippet = __webpack_require__(1);
	var $ = __webpack_require__(3);
	var CALLBACK_NAME = 'dataCallback',
	    SERACH_QUERY_IDENTIFIER = 'q';

	var forEach = snippet.forEach,
	    map = snippet.map,
	    isEmpty = snippet.isEmpty,
	    extend = snippet.extend;

	/**
	 * Unit of auto complete connecting server.
	 * @ignore
	 * @constructor
	 */
	var Data = snippet.defineClass(/** @lends Data.prototype */{
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
	            'dataType': 'jsonp',
	            'jsonpCallback': CALLBACK_NAME,
	            'data': this.options.searchApi,
	            'type': 'get',
	            'success': $.proxy(function(dataObj) {
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

	        forEach(collection, function(itemSet) {
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
	        }, this);

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
	            return extend({
	                values: item
	            }, defaultData);
	        });

	        return items;
	    }
	});

	module.exports = Data;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileOverview Input is kind of manager module to support input element events and all of input functions.
	 * @author NHN FE dev Lab <dl_javascript@nhn.com>
	 */
	var snippet = __webpack_require__(1);
	var $ = __webpack_require__(3);

	/**
	 * Unit of auto complete component that belong with input element.
	 * @ignore
	 * @constructor
	 */
	var Input = snippet.defineClass(/** @lends Input.prototype */{
	    /**
	     * keyboard Input KeyCode enum
	     */
	    keyCodeMap: {
	        'TAB': 9,
	        'UP_ARROW': 38,
	        'DOWN_ARROW': 40,
	        'ESC': 27
	    },

	    /**
	     * Initialize
	     * @param {Object} autoCompleteObj AutoComplete instance
	     * @param {object} options auto complete options
	     */
	    init: function(autoCompleteObj, options) {
	        this.autoCompleteObj = autoCompleteObj;
	        this.options = options;

	        /**
	         * Flag to distinguish new changed inputValue from moving-value in resultList
	         * @type {boolean}
	         */
	        this.isKeyMoving = false;

	        // Save elements from configuration.
	        this.$searchBox = this.options.searchBoxElement;
	        this.$toggleBtn = this.options.toggleBtnElement;
	        this.$orgQuery = this.options.orgQueryElement;
	        this.$formElement = this.options.formElement;
	        this.prevValue = '';

	        this._attachEvent();
	    },

	    /**
	     * Return input element value
	     * @returns {String} Searchbox value
	     */
	    getValue: function() {
	        return this.$searchBox.val();
	    },

	    /**
	     * Set keyword to input element
	     * @param {String} str The keyword to set value.
	     */
	    setValue: function(str) {
	        this.$searchBox.val(str);
	    },

	    /**
	     * Read config files parameter option and set parameter.
	     * @param {Array|string} subQueryValues The subQueryValues from resultList
	     * @param {number|string} index The index for subQuerySet in config
	     */
	    setParams: function(subQueryValues, index) {
	        if (subQueryValues && snippet.isString(subQueryValues)) {
	            subQueryValues = subQueryValues.split(',');
	        }

	        if ((!subQueryValues || snippet.isEmpty(subQueryValues))) {
	            return;
	        }
	        this._createParamSetByType(subQueryValues, index);
	    },

	    /**
	     * Create inputElement by type
	     * @param {Array|string} subQueryValues The subQueryValues from resultList
	     * @param {number|string} index The index for subQuerySet in config
	     * @private
	     */
	    _createParamSetByType: function(subQueryValues, index) {
	        var options = this.options,
	            listConfig = options.listConfig[index],
	            subQuerySetIndex = listConfig.subQuerySet,
	            staticParamsIndex = listConfig.staticParams,
	            subQueryKeys = options.subQuerySet[subQuerySetIndex],
	            staticParams = options.staticParams[staticParamsIndex];

	        if (!this.hiddens) {
	            this._createParamContainer();
	        }

	        snippet.forEach(subQueryValues, function(value, idx) {
	            var key = subQueryKeys[idx];

	            this.hiddens.append($('<input type="hidden" name="' + key + '" value="' + value + '" />'));
	        }, this);

	        this._createStaticParams(staticParams);
	    },

	    /**
	     * Create static parameters
	     * @param {string} staticParams Static parameters
	     * @private
	     */
	    _createStaticParams: function(staticParams) {
	        if (!staticParams) {
	            return;
	        }

	        staticParams = staticParams.split(',');
	        snippet.forEach(staticParams, function(value) {
	            var val = value.split('=');

	            this.hiddens.append($('<input type="hidden" name="' + val[0] + '" value="' + val[1] + '" />'));
	        }, this);
	    },

	    /**
	     * Create wrapper that become container of hidden elements.
	     * @private
	     */
	    _createParamContainer: function() {
	        this.hiddens = $('<div class="hidden-inputs"></div>')
	            .hide()
	            .appendTo(this.$formElement);
	    },

	    /**
	     * Change toggle button image.
	     * @param {Boolean} isUse 자동완성 사용 여부
	     */
	    setToggleBtnImg: function(isUse) {
	        if (!this.options.toggleImg || snippet.isEmpty(this.$toggleBtn)) {
	            return;
	        }

	        if (isUse) {
	            this.$toggleBtn.attr('src', this.options.toggleImg.on);
	        } else {
	            this.$toggleBtn.attr('src', this.options.toggleImg.off);
	        }
	    },

	    /**
	     * Event binding
	     * @private
	     */
	    _attachEvent: function() {
	        this.$searchBox.on({
	            focus: $.proxy(this._onFocus, this),
	            blur: $.proxy(this._onBlur, this),
	            keydown: $.proxy(this._onKeyDown, this),
	            click: $.proxy(this._onClick, this)
	        });

	        if (!snippet.isEmpty(this.$toggleBtn)) {
	            this.$toggleBtn.on('click', $.proxy(this._onClickToggle, this));
	        }
	    },

	    /**
	     * Save user query into hidden element.
	     * @param {String} str The string typed by user
	     * @private
	     */
	    _setOrgQuery: function(str) {
	        this.$orgQuery.val(str);
	    },

	    /**
	     * Input element onclick event handler
	     * @private
	     * @param {MouseEvent} event Mouse event
	     * @returns {boolean} False if no input-keyword or not use auto-complete
	     */
	    _onClick: function(event) {
	        // 입력된 키워드가 없거나 자동완성 기능 사용하지 않으면 펼칠 필요 없으므로 그냥 리턴하고 끝.
	        if (!this.autoCompleteObj.getValue() ||
	            !this.autoCompleteObj.isUseAutoComplete()) {
	            return false;
	        }

	        if (!this.autoCompleteObj.isShowResultList()) {
	            this.autoCompleteObj.showResultList();
	        }
	        event.stopPropagation();

	        return true;
	    },

	    /**
	     * Input element focus event handler
	     * @private
	     */
	    _onFocus: function() {
	        // setInterval 설정해서 일정 시간 주기로 _onWatch 함수를 실행한다.
	        this.intervalId = setInterval(
	            $.proxy(this._onWatch, this),
	            this.options.watchInterval
	        );
	    },

	    /**
	     * Roop for check update input element
	     * @private
	     */
	    _onWatch: function() {
	        var searchBoxValue = this.getValue();

	        if (!searchBoxValue) {
	            this.autoCompleteObj.hideResultList();
	            this.prevValue = '';
	            this._setOrgQuery('');

	            return;
	        }

	        if (this.isKeyMoving) {
	            this._setOrgQuery(searchBoxValue);
	            this.prevValue = searchBoxValue;
	        } else if (this.prevValue !== searchBoxValue) {
	            this._onChange();
	        }
	    },

	    /**
	     * Input element onchange event handler
	     * @private
	     */
	    _onChange: function() {
	        var acObj = this.autoCompleteObj,
	            searchBoxValue = this.getValue();

	        if (!this.autoCompleteObj.isUseAutoComplete()) {
	            return;
	        }

	        if (acObj.isIdle) {
	            acObj.isIdle = false;
	            acObj.request(searchBoxValue);
	        } else {
	            acObj.readyValue = searchBoxValue;
	            acObj.showResultList();
	        }
	        this.prevValue = searchBoxValue;
	    },

	    /**
	     * Input element blur event handler
	     * @private
	     */
	    _onBlur: function() {
	        clearInterval(this.intervalId);
	        this.intervalId = null;
	    },

	    /**
	     * Input element keydown event handler
	     * Set actino by input value
	     * @param {Event} event keyDown Event instance
	     * @private
	     */
	    /* eslint-disable complexity */
	    _onKeyDown: function(event) {
	        var acObj = this.autoCompleteObj,
	            flow, codeMap, flowMap;

	        if (!acObj.isUseAutoComplete() || !acObj.isShowResultList()) {
	            return;
	        }

	        codeMap = this.keyCodeMap;
	        flowMap = acObj.flowMap;
	        switch (event.keyCode) {
	            case codeMap.TAB:
	                event.preventDefault();
	                flow = event.shiftKey ? flowMap.NEXT : flowMap.PREV;
	                break;
	            case codeMap.DOWN_ARROW:
	                flow = flowMap.NEXT;
	                break;
	            case codeMap.UP_ARROW:
	                flow = flowMap.PREV;
	                break;
	            case codeMap.ESC:
	                acObj.hideResultList();
	                break;
	            default:
	                break;
	        }

	        if (flow) {
	            this.isKeyMoving = true;
	            acObj.moveNextResult(flow);
	        } else {
	            this.isKeyMoving = false;
	        }
	    },
	    /* eslint-enable complexity */

	    /**
	     * Toggle button click event handler
	     * @param {MouseEvent} event Mouse click event
	     * @private
	     */
	    _onClickToggle: function(event) {
	        var curValue = this.getValue();

	        event.stopPropagation();

	        if (!this.autoCompleteObj.isUseAutoComplete()) {
	            this.autoCompleteObj.setCookieValue(true);
	            this.autoCompleteObj.changeOnOffText(true);
	            if (!curValue) {
	                return;
	            }
	            if (this.prevValue !== curValue) {
	                this.autoCompleteObj.request(curValue);
	            } else {
	                this.autoCompleteObj.showResultList();
	            }
	        } else {
	            this.autoCompleteObj.setCookieValue(false);
	            this.autoCompleteObj.changeOnOffText(false);
	            this.autoCompleteObj.hideResultList();
	        }
	    }
	});

	module.exports = Input;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Result is kind of managing module to draw auto complete result list from server and apply template.
	 * @author  NHN FE dev Lab<dl_javascript@nhn.com>
	 */
	var snippet = __webpack_require__(1);
	var $ = __webpack_require__(3);
	var DEFAULT_VIEW_COUNT = 10,
	    WHITE_SPACES = '[\\s]*';

	var isEmpty = snippet.isEmpty,
	    forEach = snippet.forEach,
	    map = snippet.map;

	var rIsSpeicalCharacters = /[\\^$.*+?()[\]{}|]/,
	    rWhiteSpace = '/s+/g';

	/**
	 * Unit of auto complete that belong with search result list.
	 * Handle the submit data from resultList.
	 * See {@link Result.prototype._orderElement} which set the request data from arrow-key input
	 * @ignore
	 * @constructor
	 */
	var Result = snippet.defineClass(/** @lends Result.prototype */{
	    init: function(autoCompleteObj, options) {
	        this.autoCompleteObj = autoCompleteObj;
	        this.options = options;

	        this.$resultList = options.resultListElement;
	        this.viewCount = options.viewCount || DEFAULT_VIEW_COUNT;
	        this.$onOffTxt = options.onoffTextElement;
	        this.mouseOverClass = options.mouseOverClass;
	        this.flowMap = autoCompleteObj.flowMap;

	        this._attachEvent();
	        this.$selectedElement = $();
	    },

	    /**
	     * Delete last result list
	     * @private
	     */
	    _deleteBeforeElement: function() {
	        this.$selectedElement = $();
	        this.$resultList
	            .hide()
	            .html('');
	    },

	    /**
	     * Draw result form api server
	     * @param {Array} dataArr Result data
	     */
	    draw: function(dataArr) {
	        var len = dataArr.length;

	        this._deleteBeforeElement();
	        if (len < 1) {
	            this._hideBottomArea();
	        } else {
	            this._makeResultList(dataArr, len);
	        }
	        this.showResultList();
	    },

	    /**
	     * Make search result list element
	     * @param {Array} dataArr - Data array
	     * @param {number} len - Length of dataArray
	     * @private
	     */
	    _makeResultList: function(dataArr, len) {
	        var template = this.options.template,
	            listConfig = this.options.listConfig,
	            useTitle = (this.options.useTitle && !!template.title),
	            tmpl, index, tmplValue, i, data;

	        for (i = 0; i < len; i += 1) {
	            data = dataArr[i];
	            index = data.index;
	            tmpl = listConfig[index] ? template[listConfig[index].template] : template.defaults;

	            if (data.type === 'title') {
	                tmpl = template.title;
	                if (!useTitle) {
	                    continue;
	                }
	            }
	            tmplValue = this._getTmplData(tmpl.attr, data);
	            $(this._applyTemplate(tmpl.element, tmplValue))
	                .data({
	                    'params': tmplValue.params,
	                    'index': index
	                })
	                .appendTo(this.$resultList);
	        }
	    },

	    /**
	     * Make template data
	     * @param {Array} attrs Template attributes
	     * @param {string|Object} data The data to make template
	     * @returns {Object} Template data
	     * @private
	     */
	    _getTmplData: function(attrs, data) {
	        var tmplValue = {},
	            values = data.values || null;

	        if (snippet.isString(data)) {
	            tmplValue[attrs[0]] = data;

	            return tmplValue;
	        }

	        forEach(attrs, function(attr, idx) {
	            tmplValue[attr] = values[idx];
	        });
	        if (attrs.length < values.length) {
	            tmplValue.params = values.slice(attrs.length);
	        }

	        return tmplValue;
	    },

	    /**
	     * Return whether result list show or not
	     * @returns {Boolean}
	     */
	    isShowResultList: function() {
	        return this.$resultList.css('display') === 'block';
	    },

	    /**
	     * Hide result list area
	     */
	    hideResultList: function() {
	        this.$resultList.hide();
	        this._hideBottomArea();
	        this.autoCompleteObj.isIdle = true;

	        /**
	         * Fired when hide the result list
	         * @event AutoComplete#close
	         */
	        this.autoCompleteObj.fire('close');
	    },

	    /**
	     * Show result list area
	     */
	    showResultList: function() {
	        this.$resultList.show();
	        this._showBottomArea();
	    },

	    /**
	     * Move focus to next item, change input element value as focus value.
	     * @param {string} flow Direction by key code
	     */
	    moveNextResult: function(flow) {
	        var $selectEl = this.$selectedElement,
	            keyword;

	        if (!isEmpty($selectEl)) {
	            $selectEl.removeClass(this.mouseOverClass);
	        }
	        $selectEl = this.$selectedElement = this._orderElement(flow);

	        keyword = $selectEl.find('.keyword-field').text();
	        if (keyword) {
	            $selectEl.addClass(this.mouseOverClass);
	            this.autoCompleteObj.setValue(keyword);
	            this._setSubmitOption();
	        } else {
	            this.moveNextResult(flow);
	        }
	    },

	    /**
	     * Chage text by whether auto complete use or not
	     * @param {Boolean} isUse on/off 여부
	     */
	    changeOnOffText: function(isUse) {
	        if (isUse) {
	            this.$onOffTxt.text('자동완성 끄기');
	        } else {
	            this.$onOffTxt.text('자동완성 켜기');
	        }
	    },

	    /**
	     * Attach auto complete event belongs with result list
	     * @private
	     */
	    _attachEvent: function() {
	        this.$resultList.on({
	            mouseover: $.proxy(this._onMouseOver, this),
	            click: $.proxy(this._onClick, this)
	        });

	        if (this.$onOffTxt) {
	            this.$onOffTxt.on('click', $.proxy(function() {
	                this._useAutoComplete();
	            }, this));
	        }

	        $(document).on('click', $.proxy(function() {
	            this.hideResultList();
	        }, this));
	    },

	    /**
	     * Highlight key word
	     * @param {string} tmplStr Template string
	     * @param {Object} dataObj Replace string map
	     * @returns {string}
	     * @private
	     */
	    _applyTemplate: function(tmplStr, dataObj) {
	        snippet.forEach(dataObj, function(value, key) {
	            if (key === 'subject') {
	                value = this._highlight(value);
	            }
	            tmplStr = tmplStr.replace(new RegExp('@' + key + '@', 'g'), value);
	        }, this);

	        return tmplStr;
	    },

	    /**
	     * Return applied highlight effect key word
	     * (text: Nike air  /  query : [Nike] / Result : <strong>Nike </strong>air
	     * text : 'rhdiddl와 고양이' / query :  [rhdiddl, 고양이] / 리턴결과 <strong>rhdiddl</strong>와 <strong>고양이</strong>
	     * @param {String} text Input string
	     * @returns {String}
	     * @private
	     */
	    _highlight: function(text) {
	        var queries = this.autoCompleteObj.queries,
	            returnStr;

	        snippet.forEach(queries, function(query) {
	            if (!returnStr) {
	                returnStr = text;
	            }
	            returnStr = this._makeStrong(returnStr, query);
	        }, this);

	        return returnStr || text;
	    },

	    /**
	     * Contain text by strong tag
	     * @param {String} text Recommend search data  추천검색어 데이터
	     * @param {String} query Input keyword
	     * @returns {String}
	     * @private
	     */
	    _makeStrong: function(text, query) {
	        var tmpArr, regQuery;

	        if (!query || query.length < 1) {
	            return text;
	        }

	        tmpArr = query.replace(rWhiteSpace, '').split('');
	        tmpArr = map(tmpArr, function(char) {
	            if (rIsSpeicalCharacters.test(char)) {
	                return '\\' + char;
	            }

	            return char;
	        });
	        regQuery = new RegExp(tmpArr.join(WHITE_SPACES), 'gi');

	        return text.replace(regQuery, function(match) {
	            return '<strong>' + match + '</strong>';
	        });
	    },

	    /**
	     * Return the first result item
	     * @returns {jQuery}
	     * @private
	     */
	    _getFirst: function() {
	        return this._orderStage(this.flowMap.FIRST);
	    },

	    /**
	     * Return the last result item
	     * @returns {jQuery}
	     * @private
	     */
	    _getLast: function() {
	        return this._orderStage(this.flowMap.LAST);
	    },

	    /**
	     * Return whether first or last
	     * @param {string} type First/end element type
	     * @returns {jQuery}
	     * @private
	     */
	    _orderStage: function(type) {
	        var flowMap = this.flowMap;
	        var $children = this.$resultList.children();
	        var reuslt = null;

	        if (type === flowMap.FIRST) {
	            reuslt = $children.first();
	        } else if (type === flowMap.LAST) {
	            reuslt = $children.last();
	        }

	        return reuslt;
	    },

	    /**
	     * Return previous or next element from resultList by direction
	     * @param {string} type The direction type for finding element
	     * @returns {jQuery}
	     * @private
	     */
	    _orderElement: function(type) {
	        var $selectedElement = this.$selectedElement,
	            $order;

	        if (type === this.flowMap.NEXT) {
	            $order = $selectedElement.next();

	            return $order.length ? $order : this._getFirst();
	        }
	        $order = $selectedElement.prev();

	        return $order.length ? $order : this._getLast();
	    },

	    /**
	     * Set whether auto complete use or not and change switch's state.
	     * @private
	     */
	    _useAutoComplete: function() {
	        var isUse = this.autoCompleteObj.isUseAutoComplete();

	        this.changeOnOffText(isUse);
	        this.autoCompleteObj.setCookieValue(isUse);
	    },

	    /**
	     * Show auto complete switch area
	     * @private
	     */
	    _showBottomArea: function() {
	        if (this.$onOffTxt) {
	            this.$onOffTxt.show();
	        }
	    },

	    /**
	     * Hide auto complete switch area
	     * @private
	     */
	    _hideBottomArea: function() {
	        if (this.$onOffTxt) {
	            this.$onOffTxt.hide();
	        }
	    },

	    /**
	     * Change action attribute of form element and set addition values in hidden type elements.
	     * (Called when click the <li>)
	     * @param {element} [$target] Submit options target
	     * @private
	     *
	     */
	    _setSubmitOption: function($target) {
	        var $selectField = $target ? $($target).closest('li') : this.$selectedElement,
	            paramsString = $selectField.data('params'),
	            index = $selectField.data('index'),
	            config = this.options.listConfig[index],
	            action = this.options.actions[config.action],
	            $formElement = this.options.formElement;

	        $formElement.attr('action', action);
	        this._clearSubmitOption();
	        this.autoCompleteObj.setParams(paramsString, index);

	        /**
	         * Fired when the user's selected element in result list is changed
	         * @event AutoComplete#change
	         * @param {Object} data - Data for submit
	         *  @param {string} data.index - Index of collection
	         *  @param {string} data.action - Form action
	         *  @param {string} data.params - Parameters
	         */
	        this.autoCompleteObj.fire('change', {
	            index: index,
	            action: action,
	            params: paramsString
	        });
	    },

	    /**
	     * Reset form element.
	     * @private
	     */
	    _clearSubmitOption: function() {
	        var $formElement = this.options.formElement;

	        $formElement.find('.hidden-inputs').html('');
	    },

	    /**
	     * Result list mouseover event handler
	     * @param {Event} event Event instanse
	     * @private
	     */
	    _onMouseOver: function(event) {
	        var $target = $(event.target),
	            $arr = this.$resultList.find('li'),
	            $selectedItem = $target.closest('li');

	        $arr.removeClass(this.mouseOverClass);
	        if ($selectedItem.find('.keyword-field').length) {
	            $selectedItem.addClass(this.mouseOverClass);
	        }
	        this.$selectedElement = $target;
	    },

	    /**
	     * Result list click evnet handler
	     * Submit form element.
	     * @param {Event} event Event instanse
	     * @private
	     */
	    _onClick: function(event) {
	        var $target = $(event.target),
	            $formElement = this.options.formElement,
	            $selectField = $target.closest('li'),
	            $keywordField = $selectField.find('.keyword-field'),
	            selectedKeyword = $keywordField.text();

	        this.autoCompleteObj.setValue(selectedKeyword);
	        if (selectedKeyword) {
	            this._setSubmitOption($target);
	            $formElement.submit();
	        }
	    }
	});

	module.exports = Result;


/***/ })
/******/ ])
});
;