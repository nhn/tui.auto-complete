/**
 * tui-component-auto-complete
 * @author NHNEnt FE Development Lab <dl_javascript@nhnent.com>
 * @version v1.1.3
 * @license MIT
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
tui.util.defineNamespace('tui.component',{
    AutoComplete: require('./src/js/autoComplete')
});

},{"./src/js/autoComplete":2}],2:[function(require,module,exports){
/**
 * @fileoverview Auto complete's Core element. All of auto complete objects belong with this object.
 * @version 1.1.2
 * @author NHN Entertainment FE Dev Team. <dl_javascript@nhnent.com>
*/
'use strict';

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
 * @example
 *  var autoCompleteObj = new tui.component.AutoComplete({
 *     "config" : "Default"    // Dataset in autoConfig.js
 *  });
 * @example
 *  // The form of config file "autoConfig.js"
 *  var Default = {
 *      // Result element
 *      'resultListElement': '._resultBox',
 *
 *      // Input element
 *      'searchBoxElement':  '#ac_input1',
 *
 *      // Hidden element that is for throwing query that user type.
 *      'orgQueryElement' : '#org_query',
 *
 *      // on,off Button element
 *      'toggleBtnElement' : "#onoffBtn",
 *
 *      // on,off State element
 *      'onoffTextElement' : ".baseBox .bottom",
 *
 *      // on, off State image source
 *      'toggleImg' : {
 *          'on' : '../img/btn_on.jpg',
 *          'off' : '../img/btn_off.jpg'
 *      },
 *
 *      // Collection items each count.
 *      'viewCount' : 3,
 *
 *      // Key arrays (sub query keys' array)
 *      'subQuerySet': [
 *          ['key1', 'key2', 'key3'],
 *          ['dep1', 'dep2', 'dep3'],
 *          ['ch1', 'ch2', 'ch3'],
 *          ['cid']
 *      ],
 *
 *      // Config for auto complete list by index of collection
 *      'listConfig': {
 *          '0': {
 *              'template': 'department',
 *              'subQuerySet' : 0,
 *              'action': 0
 *          },
 *          '1': {
 *              'template': 'srch_in_department',
 *              'subQuerySet' : 1,
 *              'action': 0
 *          },
 *          '2': {
 *              'template': 'srch_in_department',
 *              'subQuerySet' : 2,
 *              'action': 1,
 *              'staticParams': 0
 *          },
 *          '3': {
 *              'template': 'department',
 *              'subQuerySet' : 0,
 *              'action': 1,
 *              'staticParams': 1
 *          }
 *      },
 *
 *      // Mark up for each collection. (Default markup is defaults.)
 *      // This markup has to have "keywold-field" but title.
 *      'template': {
 *          department: {
 *              element: '<li class="department">' +
 *                            '<span class="slot-field">Shop the</span> ' +
 *                            '<a href="#" class="keyword-field">@subject@</a> ' +
 *                            '<span class="slot-field">Store</span>' +
 *                        '</li>',
 *              attr: ['subject']
 *          },
 *          srch: {
 *              element: '<li class="srch"><span class="keyword-field">@subject@</span></li>',
 *              attr: ['subject']
 *          },
 *          srch_in_department: {
 *              element: '<li class="inDepartment">' +
 *                           '<a href="#" class="keyword-field">@subject@</a> ' +
 *                           '<span class="slot-field">in </span>' +
 *                           '<span class="depart-field">@department@</span>' +
 *                       '</li>',
 *              attr: ['subject', 'department']
 *          },
 *          title: {
 *              element: '<li class="title"><span>@title@</span></li>',
 *              attr: ['title']
 *          },
 *          defaults: {
 *              element: '<li class="srch"><span class="keyword-field">@subject@</span></li>',
 *              attr: ['subject']
 *          }
 *      },
 *
 *      // Action attribute for each collection
 *      'actions': [
 *          "http://www.fashiongo.net/catalog.aspx",
 *          "http://www.fashiongo.net/search2.aspx"
 *      ],
 *
 *      // Set static options for each collection.
 *      'staticParams':[
 *          "qt=ProductName",
 *          "at=TEST,bt=ACT"
 *      ],
 *
 *      // Whether use title or not.
 *      'useTitle': true,
 *
 *      // Form element that include search element
 *      'formElement' : '#ac_form1',
 *
 *      // Cookie name for save state
 *      'cookieName' : "usecookie",
 *
 *      // Class name for selected element
 *      'mouseOverClass' : 'emp',
 *
 *      // Auto complete API
 *      'searchUrl' : 'http://12.123.123.123:20011/ac',
 *
 *      // Auto complete API request config
 *      'searchApi' : {
 *          'st' : 1111,
 *          'r_lt' : 1111,
 *          'r_enc' : 'UTF-8',
 *          'q_enc' : 'UTF-8',
 *          'r_format' : 'json'
 *      }
 *  }
 */
var AutoComplete = tui.util.defineClass(/**@lends AutoComplete.prototype */{
    init: function(options) {
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
        var isExisty = tui.util.isExisty,
            config = options.config;

        if (!isExisty(config)) {
            throw new Error('No configuration #' + config);
        }

        tui.util.forEach(requiredOptions, function(name) {
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
            cookieValue = $.cookie(config.cookieName);
            this.isUse = (cookieValue === 'use' || !cookieValue);
        }
        config.cookieName = config.cookieName || DEFAULT_COOKIE_NAME;

        if (tui.util.isFalsy(config.watchInterval)) {
            config.watchInterval = this.watchInterval;
        }

        tui.util.forEach(config, function(value, name) {
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
        $.cookie(this.options.cookieName, isUse ? 'use' : 'notUse');
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
        tui.util.extend(this.options.searchApi, options);
    },

    /**
     * clear ready value and set idle state
     */
    clearReadyValue: function() {
        if (tui.util.isExisty(this.readyValue)) {
            this.request(this.readyValue);
        } else {
            this.isIdle = true;
        }
        this.readyValue = null;
    }
});
tui.util.CustomEvents.mixin(AutoComplete);
module.exports = AutoComplete;

},{"./manager/data":3,"./manager/input":4,"./manager/result":5}],3:[function(require,module,exports){
/**
 * @fileoverview Data is kind of manager module to request data at API with input queries.
 * @author NHN Entertainment FE dev Lab. <dl_javascript@nhnent.com>
 */
'use strict';

var CALLBACK_NAME = 'dataCallback',
    SERACH_QUERY_IDENTIFIER = 'q';

var forEach = tui.util.forEach,
    map = tui.util.map,
    isEmpty = tui.util.isEmpty,
    extend = tui.util.extend;

/**
 * Unit of auto complete connecting server.
 * @ignore
 * @constructor
 */
var Data = tui.util.defineClass(/**@lends Data.prototype */{
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

},{}],4:[function(require,module,exports){
/**
 * @fileOverview Input is kind of manager module to support input element events and all of input functions.
 * @author NHN Entertainment FE dev team <dl_javascript@nhnent.com>
 */
'use strict';
var util = tui.util;

/**
 * Unit of auto complete component that belong with input element.
 * @ignore
 * @constructor
 */
var Input = tui.util.defineClass(/**@lends Input.prototype */{
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
        if (subQueryValues && tui.util.isString(subQueryValues)) {
            subQueryValues = subQueryValues.split(',');
        }

        if ((!subQueryValues || tui.util.isEmpty(subQueryValues))) {
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

        util.forEach(subQueryValues, function(value, idx) {
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
        util.forEach(staticParams, function(value) {
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
        if (!this.options.toggleImg || util.isEmpty(this.$toggleBtn)) {
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

        if (!util.isEmpty(this.$toggleBtn)) {
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
        //입력된 키워드가 없거나 자동완성 기능 사용하지 않으면 펼칠 필요 없으므로 그냥 리턴하고 끝.
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
        //setInterval 설정해서 일정 시간 주기로 _onWatch 함수를 실행한다.
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
    /*eslint-disable complexity*/
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
    /*eslint-enable complexity*/

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

},{}],5:[function(require,module,exports){
/**
 * @fileoverview Result is kind of managing module to draw auto complete result list from server and apply template.
 * @author  NHN entertainment FE dev team<dl_javascript@nhnent.com>
 */
'use strict';
var DEFAULT_VIEW_COUNT = 10,
    WHITE_SPACES = '[\\s]*';

var isEmpty = tui.util.isEmpty,
    forEach = tui.util.forEach,
    map = tui.util.map;

var rIsSpeicalCharacters = /[\\^$.*+?()[\]{}|]/,
    rWhiteSpace = '/\s+/g';

/**
 * Unit of auto complete that belong with search result list.
 * Handle the submit data from resultList.
 * See {@link Result.prototype._orderElement} which set the request data from arrow-key input
 * @ignore
 * @constructor
 */
var Result = tui.util.defineClass(/** @lends Result.prototype */{
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

        if (tui.util.isString(data)) {
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
        tui.util.forEach(dataObj, function(value, key) {
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

        tui.util.forEach(queries, function(query) {
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
        var flowMap = this.flowMap,
            $children = this.$resultList.children();

        if (type === flowMap.FIRST) {
            return $children.first();
        } else if (type === flowMap.LAST) {
            return $children.last();
        }

        return null;
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9hdXRvQ29tcGxldGUuanMiLCJzcmMvanMvbWFuYWdlci9kYXRhLmpzIiwic3JjL2pzL21hbmFnZXIvaW5wdXQuanMiLCJzcmMvanMvbWFuYWdlci9yZXN1bHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInR1aS51dGlsLmRlZmluZU5hbWVzcGFjZSgndHVpLmNvbXBvbmVudCcse1xuICAgIEF1dG9Db21wbGV0ZTogcmVxdWlyZSgnLi9zcmMvanMvYXV0b0NvbXBsZXRlJylcbn0pO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEF1dG8gY29tcGxldGUncyBDb3JlIGVsZW1lbnQuIEFsbCBvZiBhdXRvIGNvbXBsZXRlIG9iamVjdHMgYmVsb25nIHdpdGggdGhpcyBvYmplY3QuXG4gKiBAdmVyc2lvbiAxLjEuMlxuICogQGF1dGhvciBOSE4gRW50ZXJ0YWlubWVudCBGRSBEZXYgVGVhbS4gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBEYXRhTWFuYWdlciA9IHJlcXVpcmUoJy4vbWFuYWdlci9kYXRhJyksXG4gICAgSW5wdXRNYW5hZ2VyID0gcmVxdWlyZSgnLi9tYW5hZ2VyL2lucHV0JyksXG4gICAgUmVzdWx0TWFuYWdlciA9IHJlcXVpcmUoJy4vbWFuYWdlci9yZXN1bHQnKTtcblxudmFyIERFRkFVTFRfQ09PS0lFX05BTUUgPSAnX2F0Y3BfdXNlX2Nvb2tpZSc7XG5cbnZhciByZXF1aXJlZE9wdGlvbnMgPSBbXG4gICAgICAgICdyZXN1bHRMaXN0RWxlbWVudCcsXG4gICAgICAgICdzZWFyY2hCb3hFbGVtZW50JyxcbiAgICAgICAgJ29yZ1F1ZXJ5RWxlbWVudCcsXG4gICAgICAgICdmb3JtRWxlbWVudCcsXG4gICAgICAgICdzdWJRdWVyeVNldCcsXG4gICAgICAgICd0ZW1wbGF0ZScsXG4gICAgICAgICdsaXN0Q29uZmlnJyxcbiAgICAgICAgJ2FjdGlvbnMnLFxuICAgICAgICAnc2VhcmNoVXJsJ1xuICAgIF0sXG4gICAgcklzRWxlbWVudE9wdGlvbiA9IC9lbGVtZW50L2k7XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQGV4YW1wbGVcbiAqICB2YXIgYXV0b0NvbXBsZXRlT2JqID0gbmV3IHR1aS5jb21wb25lbnQuQXV0b0NvbXBsZXRlKHtcbiAqICAgICBcImNvbmZpZ1wiIDogXCJEZWZhdWx0XCIgICAgLy8gRGF0YXNldCBpbiBhdXRvQ29uZmlnLmpzXG4gKiAgfSk7XG4gKiBAZXhhbXBsZVxuICogIC8vIFRoZSBmb3JtIG9mIGNvbmZpZyBmaWxlIFwiYXV0b0NvbmZpZy5qc1wiXG4gKiAgdmFyIERlZmF1bHQgPSB7XG4gKiAgICAgIC8vIFJlc3VsdCBlbGVtZW50XG4gKiAgICAgICdyZXN1bHRMaXN0RWxlbWVudCc6ICcuX3Jlc3VsdEJveCcsXG4gKlxuICogICAgICAvLyBJbnB1dCBlbGVtZW50XG4gKiAgICAgICdzZWFyY2hCb3hFbGVtZW50JzogICcjYWNfaW5wdXQxJyxcbiAqXG4gKiAgICAgIC8vIEhpZGRlbiBlbGVtZW50IHRoYXQgaXMgZm9yIHRocm93aW5nIHF1ZXJ5IHRoYXQgdXNlciB0eXBlLlxuICogICAgICAnb3JnUXVlcnlFbGVtZW50JyA6ICcjb3JnX3F1ZXJ5JyxcbiAqXG4gKiAgICAgIC8vIG9uLG9mZiBCdXR0b24gZWxlbWVudFxuICogICAgICAndG9nZ2xlQnRuRWxlbWVudCcgOiBcIiNvbm9mZkJ0blwiLFxuICpcbiAqICAgICAgLy8gb24sb2ZmIFN0YXRlIGVsZW1lbnRcbiAqICAgICAgJ29ub2ZmVGV4dEVsZW1lbnQnIDogXCIuYmFzZUJveCAuYm90dG9tXCIsXG4gKlxuICogICAgICAvLyBvbiwgb2ZmIFN0YXRlIGltYWdlIHNvdXJjZVxuICogICAgICAndG9nZ2xlSW1nJyA6IHtcbiAqICAgICAgICAgICdvbicgOiAnLi4vaW1nL2J0bl9vbi5qcGcnLFxuICogICAgICAgICAgJ29mZicgOiAnLi4vaW1nL2J0bl9vZmYuanBnJ1xuICogICAgICB9LFxuICpcbiAqICAgICAgLy8gQ29sbGVjdGlvbiBpdGVtcyBlYWNoIGNvdW50LlxuICogICAgICAndmlld0NvdW50JyA6IDMsXG4gKlxuICogICAgICAvLyBLZXkgYXJyYXlzIChzdWIgcXVlcnkga2V5cycgYXJyYXkpXG4gKiAgICAgICdzdWJRdWVyeVNldCc6IFtcbiAqICAgICAgICAgIFsna2V5MScsICdrZXkyJywgJ2tleTMnXSxcbiAqICAgICAgICAgIFsnZGVwMScsICdkZXAyJywgJ2RlcDMnXSxcbiAqICAgICAgICAgIFsnY2gxJywgJ2NoMicsICdjaDMnXSxcbiAqICAgICAgICAgIFsnY2lkJ11cbiAqICAgICAgXSxcbiAqXG4gKiAgICAgIC8vIENvbmZpZyBmb3IgYXV0byBjb21wbGV0ZSBsaXN0IGJ5IGluZGV4IG9mIGNvbGxlY3Rpb25cbiAqICAgICAgJ2xpc3RDb25maWcnOiB7XG4gKiAgICAgICAgICAnMCc6IHtcbiAqICAgICAgICAgICAgICAndGVtcGxhdGUnOiAnZGVwYXJ0bWVudCcsXG4gKiAgICAgICAgICAgICAgJ3N1YlF1ZXJ5U2V0JyA6IDAsXG4gKiAgICAgICAgICAgICAgJ2FjdGlvbic6IDBcbiAqICAgICAgICAgIH0sXG4gKiAgICAgICAgICAnMSc6IHtcbiAqICAgICAgICAgICAgICAndGVtcGxhdGUnOiAnc3JjaF9pbl9kZXBhcnRtZW50JyxcbiAqICAgICAgICAgICAgICAnc3ViUXVlcnlTZXQnIDogMSxcbiAqICAgICAgICAgICAgICAnYWN0aW9uJzogMFxuICogICAgICAgICAgfSxcbiAqICAgICAgICAgICcyJzoge1xuICogICAgICAgICAgICAgICd0ZW1wbGF0ZSc6ICdzcmNoX2luX2RlcGFydG1lbnQnLFxuICogICAgICAgICAgICAgICdzdWJRdWVyeVNldCcgOiAyLFxuICogICAgICAgICAgICAgICdhY3Rpb24nOiAxLFxuICogICAgICAgICAgICAgICdzdGF0aWNQYXJhbXMnOiAwXG4gKiAgICAgICAgICB9LFxuICogICAgICAgICAgJzMnOiB7XG4gKiAgICAgICAgICAgICAgJ3RlbXBsYXRlJzogJ2RlcGFydG1lbnQnLFxuICogICAgICAgICAgICAgICdzdWJRdWVyeVNldCcgOiAwLFxuICogICAgICAgICAgICAgICdhY3Rpb24nOiAxLFxuICogICAgICAgICAgICAgICdzdGF0aWNQYXJhbXMnOiAxXG4gKiAgICAgICAgICB9XG4gKiAgICAgIH0sXG4gKlxuICogICAgICAvLyBNYXJrIHVwIGZvciBlYWNoIGNvbGxlY3Rpb24uIChEZWZhdWx0IG1hcmt1cCBpcyBkZWZhdWx0cy4pXG4gKiAgICAgIC8vIFRoaXMgbWFya3VwIGhhcyB0byBoYXZlIFwia2V5d29sZC1maWVsZFwiIGJ1dCB0aXRsZS5cbiAqICAgICAgJ3RlbXBsYXRlJzoge1xuICogICAgICAgICAgZGVwYXJ0bWVudDoge1xuICogICAgICAgICAgICAgIGVsZW1lbnQ6ICc8bGkgY2xhc3M9XCJkZXBhcnRtZW50XCI+JyArXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJzbG90LWZpZWxkXCI+U2hvcCB0aGU8L3NwYW4+ICcgK1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxhIGhyZWY9XCIjXCIgY2xhc3M9XCJrZXl3b3JkLWZpZWxkXCI+QHN1YmplY3RAPC9hPiAnICtcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cInNsb3QtZmllbGRcIj5TdG9yZTwvc3Bhbj4nICtcbiAqICAgICAgICAgICAgICAgICAgICAgICAgJzwvbGk+JyxcbiAqICAgICAgICAgICAgICBhdHRyOiBbJ3N1YmplY3QnXVxuICogICAgICAgICAgfSxcbiAqICAgICAgICAgIHNyY2g6IHtcbiAqICAgICAgICAgICAgICBlbGVtZW50OiAnPGxpIGNsYXNzPVwic3JjaFwiPjxzcGFuIGNsYXNzPVwia2V5d29yZC1maWVsZFwiPkBzdWJqZWN0QDwvc3Bhbj48L2xpPicsXG4gKiAgICAgICAgICAgICAgYXR0cjogWydzdWJqZWN0J11cbiAqICAgICAgICAgIH0sXG4gKiAgICAgICAgICBzcmNoX2luX2RlcGFydG1lbnQ6IHtcbiAqICAgICAgICAgICAgICBlbGVtZW50OiAnPGxpIGNsYXNzPVwiaW5EZXBhcnRtZW50XCI+JyArXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICc8YSBocmVmPVwiI1wiIGNsYXNzPVwia2V5d29yZC1maWVsZFwiPkBzdWJqZWN0QDwvYT4gJyArXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cInNsb3QtZmllbGRcIj5pbiA8L3NwYW4+JyArXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImRlcGFydC1maWVsZFwiPkBkZXBhcnRtZW50QDwvc3Bhbj4nICtcbiAqICAgICAgICAgICAgICAgICAgICAgICAnPC9saT4nLFxuICogICAgICAgICAgICAgIGF0dHI6IFsnc3ViamVjdCcsICdkZXBhcnRtZW50J11cbiAqICAgICAgICAgIH0sXG4gKiAgICAgICAgICB0aXRsZToge1xuICogICAgICAgICAgICAgIGVsZW1lbnQ6ICc8bGkgY2xhc3M9XCJ0aXRsZVwiPjxzcGFuPkB0aXRsZUA8L3NwYW4+PC9saT4nLFxuICogICAgICAgICAgICAgIGF0dHI6IFsndGl0bGUnXVxuICogICAgICAgICAgfSxcbiAqICAgICAgICAgIGRlZmF1bHRzOiB7XG4gKiAgICAgICAgICAgICAgZWxlbWVudDogJzxsaSBjbGFzcz1cInNyY2hcIj48c3BhbiBjbGFzcz1cImtleXdvcmQtZmllbGRcIj5Ac3ViamVjdEA8L3NwYW4+PC9saT4nLFxuICogICAgICAgICAgICAgIGF0dHI6IFsnc3ViamVjdCddXG4gKiAgICAgICAgICB9XG4gKiAgICAgIH0sXG4gKlxuICogICAgICAvLyBBY3Rpb24gYXR0cmlidXRlIGZvciBlYWNoIGNvbGxlY3Rpb25cbiAqICAgICAgJ2FjdGlvbnMnOiBbXG4gKiAgICAgICAgICBcImh0dHA6Ly93d3cuZmFzaGlvbmdvLm5ldC9jYXRhbG9nLmFzcHhcIixcbiAqICAgICAgICAgIFwiaHR0cDovL3d3dy5mYXNoaW9uZ28ubmV0L3NlYXJjaDIuYXNweFwiXG4gKiAgICAgIF0sXG4gKlxuICogICAgICAvLyBTZXQgc3RhdGljIG9wdGlvbnMgZm9yIGVhY2ggY29sbGVjdGlvbi5cbiAqICAgICAgJ3N0YXRpY1BhcmFtcyc6W1xuICogICAgICAgICAgXCJxdD1Qcm9kdWN0TmFtZVwiLFxuICogICAgICAgICAgXCJhdD1URVNULGJ0PUFDVFwiXG4gKiAgICAgIF0sXG4gKlxuICogICAgICAvLyBXaGV0aGVyIHVzZSB0aXRsZSBvciBub3QuXG4gKiAgICAgICd1c2VUaXRsZSc6IHRydWUsXG4gKlxuICogICAgICAvLyBGb3JtIGVsZW1lbnQgdGhhdCBpbmNsdWRlIHNlYXJjaCBlbGVtZW50XG4gKiAgICAgICdmb3JtRWxlbWVudCcgOiAnI2FjX2Zvcm0xJyxcbiAqXG4gKiAgICAgIC8vIENvb2tpZSBuYW1lIGZvciBzYXZlIHN0YXRlXG4gKiAgICAgICdjb29raWVOYW1lJyA6IFwidXNlY29va2llXCIsXG4gKlxuICogICAgICAvLyBDbGFzcyBuYW1lIGZvciBzZWxlY3RlZCBlbGVtZW50XG4gKiAgICAgICdtb3VzZU92ZXJDbGFzcycgOiAnZW1wJyxcbiAqXG4gKiAgICAgIC8vIEF1dG8gY29tcGxldGUgQVBJXG4gKiAgICAgICdzZWFyY2hVcmwnIDogJ2h0dHA6Ly8xMi4xMjMuMTIzLjEyMzoyMDAxMS9hYycsXG4gKlxuICogICAgICAvLyBBdXRvIGNvbXBsZXRlIEFQSSByZXF1ZXN0IGNvbmZpZ1xuICogICAgICAnc2VhcmNoQXBpJyA6IHtcbiAqICAgICAgICAgICdzdCcgOiAxMTExLFxuICogICAgICAgICAgJ3JfbHQnIDogMTExMSxcbiAqICAgICAgICAgICdyX2VuYycgOiAnVVRGLTgnLFxuICogICAgICAgICAgJ3FfZW5jJyA6ICdVVEYtOCcsXG4gKiAgICAgICAgICAncl9mb3JtYXQnIDogJ2pzb24nXG4gKiAgICAgIH1cbiAqICB9XG4gKi9cbnZhciBBdXRvQ29tcGxldGUgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKipAbGVuZHMgQXV0b0NvbXBsZXRlLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHt9O1xuICAgICAgICB0aGlzLmlzVXNlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5xdWVyaWVzID0gbnVsbDtcbiAgICAgICAgdGhpcy5pc0lkbGUgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuX2NoZWNrVmFsaWRhdGlvbihvcHRpb25zKTtcbiAgICAgICAgdGhpcy5fc2V0T3B0aW9ucyhvcHRpb25zKTtcblxuICAgICAgICB0aGlzLmRhdGFNYW5hZ2VyID0gbmV3IERhdGFNYW5hZ2VyKHRoaXMsIHRoaXMub3B0aW9ucyk7XG4gICAgICAgIHRoaXMuaW5wdXRNYW5hZ2VyID0gbmV3IElucHV0TWFuYWdlcih0aGlzLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICB0aGlzLnJlc3VsdE1hbmFnZXIgPSBuZXcgUmVzdWx0TWFuYWdlcih0aGlzLCB0aGlzLm9wdGlvbnMpO1xuXG4gICAgICAgIHRoaXMuc2V0VG9nZ2xlQnRuSW1nKHRoaXMuaXNVc2UpO1xuICAgICAgICB0aGlzLnNldENvb2tpZVZhbHVlKHRoaXMuaXNVc2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEaXJlY3Rpb24gdmFsdWUgZm9yIGtleVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGZsb3dNYXA6IHtcbiAgICAgICAgJ05FWFQnOiAnbmV4dCcsXG4gICAgICAgICdQUkVWJzogJ3ByZXYnLFxuICAgICAgICAnRklSU1QnOiAnZmlyc3QnLFxuICAgICAgICAnTEFTVCc6ICdsYXN0J1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnRlcnZhbCBmb3IgY2hlY2sgdXBkYXRlIGlucHV0XG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAzMDBcbiAgICAgKi9cbiAgICB3YXRjaEludGVydmFsOiAzMDAsXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayByZXF1aXJlZCBmaWVsZHMgYW5kIHZhbGlkYXRlIGZpZWxkcy5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBjb21wb25lbnQgY29uZmlndXJhdGlvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jaGVja1ZhbGlkYXRpb246IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGlzRXhpc3R5ID0gdHVpLnV0aWwuaXNFeGlzdHksXG4gICAgICAgICAgICBjb25maWcgPSBvcHRpb25zLmNvbmZpZztcblxuICAgICAgICBpZiAoIWlzRXhpc3R5KGNvbmZpZykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gY29uZmlndXJhdGlvbiAjJyArIGNvbmZpZyk7XG4gICAgICAgIH1cblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHJlcXVpcmVkT3B0aW9ucywgZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAgICAgaWYgKCFpc0V4aXN0eShjb25maWdbbmFtZV0pKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG5hbWUgKyAnZG9lcyBub3Qgbm90IGV4aXN0LicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNvbXBvbmVudCBvcHRpb25zXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgY29tcG9uZW50IGNvbmZpZ3VyYXRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0T3B0aW9uczogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB2YXIgY29uZmlnID0gb3B0aW9ucy5jb25maWcsXG4gICAgICAgICAgICBjb29raWVWYWx1ZTtcblxuICAgICAgICBpZiAoIWNvbmZpZy50b2dnbGVJbWcgfHwgIWNvbmZpZy5vbm9mZlRleHRFbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLmlzVXNlID0gdHJ1ZTtcbiAgICAgICAgICAgIGRlbGV0ZSBjb25maWcub25vZmZUZXh0RWxlbWVudDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvb2tpZVZhbHVlID0gJC5jb29raWUoY29uZmlnLmNvb2tpZU5hbWUpO1xuICAgICAgICAgICAgdGhpcy5pc1VzZSA9IChjb29raWVWYWx1ZSA9PT0gJ3VzZScgfHwgIWNvb2tpZVZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBjb25maWcuY29va2llTmFtZSA9IGNvbmZpZy5jb29raWVOYW1lIHx8IERFRkFVTFRfQ09PS0lFX05BTUU7XG5cbiAgICAgICAgaWYgKHR1aS51dGlsLmlzRmFsc3koY29uZmlnLndhdGNoSW50ZXJ2YWwpKSB7XG4gICAgICAgICAgICBjb25maWcud2F0Y2hJbnRlcnZhbCA9IHRoaXMud2F0Y2hJbnRlcnZhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goY29uZmlnLCBmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICAgICAgaWYgKHJJc0VsZW1lbnRPcHRpb24udGVzdChuYW1lKSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1tuYW1lXSA9ICQodmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlcXVlc3QgZGF0YSBhdCBhcGkgc2VydmVyIHdpdGgga2V5d29yZFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBrZXl3b3JkIFRoZSBrZXkgd29yZCB0byBzZW5kIHRvIEF1dG8gY29tcGxldGUgQVBJXG4gICAgICovXG4gICAgcmVxdWVzdDogZnVuY3Rpb24oa2V5d29yZCkge1xuICAgICAgICB0aGlzLmRhdGFNYW5hZ2VyLnJlcXVlc3Qoa2V5d29yZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBzdHJpbmcgaW4gaW5wdXQgZWxlbWVudC5cbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgICAqL1xuICAgIGdldFZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXRNYW5hZ2VyLmdldFZhbHVlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBpbnB1dE1hbmFnZXIncyB2YWx1ZSB0byBzaG93IGF0IHNlYXJjaCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGtleXdvcmQgVGhlIHN0cmluZyB0byBzaG93IHVwIGF0IHNlYXJjaCBlbGVtZW50XG4gICAgICovXG4gICAgc2V0VmFsdWU6IGZ1bmN0aW9uKGtleXdvcmQpIHtcbiAgICAgICAgdGhpcy5pbnB1dE1hbmFnZXIuc2V0VmFsdWUoa2V5d29yZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBhZGRpdGlvbmFsIHBhcmFtZXRlcnMgYXQgaW5wdXRNYW5hZ2VyLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJhbVN0ciBTdHJpbmcgdG8gYmUgYWRkaXRpb24gcGFyYW1ldGVycy4oc2FwZXJhdG9yICcmJylcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaW5kZXggVGhlIGluZGV4IGZvciBzZXR0aW5nIGtleSB2YWx1ZVxuICAgICAqL1xuICAgIHNldFBhcmFtczogZnVuY3Rpb24ocGFyYW1TdHIsIGluZGV4KSB7XG4gICAgICAgIHRoaXMuaW5wdXRNYW5hZ2VyLnNldFBhcmFtcyhwYXJhbVN0ciwgaW5kZXgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0IHRvIGRyYXcgcmVzdWx0IGF0IHJlc3VsdE1hbmFnZXIgd2l0aCBkYXRhIGZyb20gYXBpIHNlcnZlci5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBkYXRhQXJyIERhdGEgYXJyYXkgZnJvbSBhcGkgc2VydmVyXG4gICAgICovXG4gICAgc2V0U2VydmVyRGF0YTogZnVuY3Rpb24oZGF0YUFycikge1xuICAgICAgICB0aGlzLnJlc3VsdE1hbmFnZXIuZHJhdyhkYXRhQXJyKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IENvb2tpZSB2YWx1ZSB3aXRoIHdoZXRoZXIgdXNlIGF1dG8gY29tcGxldGUgb3Igbm90XG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpc1VzZSBXaGV0aGVyIHVzZSBhdXRvIGNvbXBsZXRlIG9yIG5vdFxuICAgICAqL1xuICAgIHNldENvb2tpZVZhbHVlOiBmdW5jdGlvbihpc1VzZSkge1xuICAgICAgICAkLmNvb2tpZSh0aGlzLm9wdGlvbnMuY29va2llTmFtZSwgaXNVc2UgPyAndXNlJyA6ICdub3RVc2UnKTtcbiAgICAgICAgdGhpcy5pc1VzZSA9IGlzVXNlO1xuICAgICAgICB0aGlzLnNldFRvZ2dsZUJ0bkltZyhpc1VzZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNhdmUgbWF0Y2hlZCBxdWVyaWVzIGZyb20gc2VydmVyLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHF1ZXJpZXMgUmVzdWx0IHF1ZXJpZXNcbiAgICAgKi9cbiAgICBzZXRRdWVyaWVzOiBmdW5jdGlvbihxdWVyaWVzKSB7XG4gICAgICAgIHRoaXMucXVlcmllcyA9IFtdLmNvbmNhdChxdWVyaWVzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdoZXRoZXIgdXNlIGF1dG8gY29tcGxldGUgb3Igbm90XG4gICAgICogQGFwaVxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgICAqIEBleGFtcGxlXG4gICAgICogIGF1dG9Db21wbGV0ZS5pc1VzZUF1dG9Db21wbGV0ZSgpOyA9PiB0cnVlfGZhbHNlXG4gICAgICovXG4gICAgaXNVc2VBdXRvQ29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc1VzZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBzaG93IHRoZSByZXN1bHQgbGlzdCBhcmVhIG9yIG5vdC5cbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1Nob3dSZXN1bHRMaXN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0TWFuYWdlci5pc1Nob3dSZXN1bHRMaXN0KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSB0b2dnbGUgYnV0dG9uIGltYWdlIGJ5IGF1dG8gY29tcGxldGUgc3RhdGVcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzVXNlIHdoZXRoZXIgdXNlIGF1dG8gY29tcGxldGUgb3Igbm90XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBzZXRUb2dnbGVCdG5JbWc6IGZ1bmN0aW9uKGlzVXNlKSB7XG4gICAgICAgIHRoaXMuaW5wdXRNYW5hZ2VyLnNldFRvZ2dsZUJ0bkltZyhpc1VzZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgc2VhcmNoIHJlc3VsdCBsaXN0IGFyZWFcbiAgICAgKi9cbiAgICBoaWRlUmVzdWx0TGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVzdWx0TWFuYWdlci5oaWRlUmVzdWx0TGlzdCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IHNlYXJjaCByZXN1bHQgbGlzdCBhcmVhXG4gICAgICovXG4gICAgc2hvd1Jlc3VsdExpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5pc1VzZUF1dG9Db21wbGV0ZSgpKSB7XG4gICAgICAgICAgICB0aGlzLnJlc3VsdE1hbmFnZXIuc2hvd1Jlc3VsdExpc3QoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlIHRvIG5leHQgaXRlbSBpbiByZXN1bHQgbGlzdC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmxvdyBEaXJlY3Rpb24gdG8gbW92ZS5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIG1vdmVOZXh0UmVzdWx0OiBmdW5jdGlvbihmbG93KSB7XG4gICAgICAgIHRoaXMucmVzdWx0TWFuYWdlci5tb3ZlTmV4dFJlc3VsdChmbG93KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHRleHQgdG8gYXV0byBjb21wbGV0ZSBzd2l0Y2hcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzVXNlIFdoZXRoZXIgdXNlIGF1dG8gY29tcGxldGUgb3Igbm90XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBjaGFuZ2VPbk9mZlRleHQ6IGZ1bmN0aW9uKGlzVXNlKSB7XG4gICAgICAgIHRoaXMucmVzdWx0TWFuYWdlci5jaGFuZ2VPbk9mZlRleHQoaXNVc2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXNldCBzZXJhY2hBcGlcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgc2VhcmNoQXBpIG9wdGlvblxuICAgICAqIEBleGFtcGxlXG4gICAgICogIGF1dG9Db21wbGV0ZS5zZXRTZWFyY2hBcGkoe1xuICAgICAqICAgICAgJ3N0JyA6IDExMSxcbiAgICAgKiAgICAgICdyX2x0JyA6IDExMSxcbiAgICAgKiAgICAgICdyX2VuYycgOiAnVVRGLTgnLFxuICAgICAqICAgICAgJ3FfZW5jJyA6ICdVVEYtOCcsXG4gICAgICogICAgICAncl9mb3JtYXQnIDogJ2pzb24nXG4gICAgICogIH0pO1xuICAgICAqL1xuICAgIHNldFNlYXJjaEFwaTogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB0dWkudXRpbC5leHRlbmQodGhpcy5vcHRpb25zLnNlYXJjaEFwaSwgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNsZWFyIHJlYWR5IHZhbHVlIGFuZCBzZXQgaWRsZSBzdGF0ZVxuICAgICAqL1xuICAgIGNsZWFyUmVhZHlWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0dWkudXRpbC5pc0V4aXN0eSh0aGlzLnJlYWR5VmFsdWUpKSB7XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3QodGhpcy5yZWFkeVZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaXNJZGxlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlYWR5VmFsdWUgPSBudWxsO1xuICAgIH1cbn0pO1xudHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKEF1dG9Db21wbGV0ZSk7XG5tb2R1bGUuZXhwb3J0cyA9IEF1dG9Db21wbGV0ZTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBEYXRhIGlzIGtpbmQgb2YgbWFuYWdlciBtb2R1bGUgdG8gcmVxdWVzdCBkYXRhIGF0IEFQSSB3aXRoIGlucHV0IHF1ZXJpZXMuXG4gKiBAYXV0aG9yIE5ITiBFbnRlcnRhaW5tZW50IEZFIGRldiBMYWIuIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIENBTExCQUNLX05BTUUgPSAnZGF0YUNhbGxiYWNrJyxcbiAgICBTRVJBQ0hfUVVFUllfSURFTlRJRklFUiA9ICdxJztcblxudmFyIGZvckVhY2ggPSB0dWkudXRpbC5mb3JFYWNoLFxuICAgIG1hcCA9IHR1aS51dGlsLm1hcCxcbiAgICBpc0VtcHR5ID0gdHVpLnV0aWwuaXNFbXB0eSxcbiAgICBleHRlbmQgPSB0dWkudXRpbC5leHRlbmQ7XG5cbi8qKlxuICogVW5pdCBvZiBhdXRvIGNvbXBsZXRlIGNvbm5lY3Rpbmcgc2VydmVyLlxuICogQGlnbm9yZVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbnZhciBEYXRhID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqQGxlbmRzIERhdGEucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKGF1dG9Db21wbGV0ZU9iaiwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iaiA9IGF1dG9Db21wbGV0ZU9iajtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdCBkYXRhIGF0IGFwaSBzZXJ2ZXIgdXNlIGpzb25wXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGtleXdvcmQgU3RyaW5nIHRvIHJlcXVlc3QgYXQgc2VydmVyXG4gICAgICovXG4gICAgcmVxdWVzdDogZnVuY3Rpb24oa2V5d29yZCkge1xuICAgICAgICB2YXIgcnNLZXlXcm9kID0ga2V5d29yZC5yZXBsYWNlKC9cXHMvZywgJycpLFxuICAgICAgICAgICAgYWNPYmogPSB0aGlzLmF1dG9Db21wbGV0ZU9iaixcbiAgICAgICAgICAgIGtleURhdGE7XG5cbiAgICAgICAgaWYgKCFrZXl3b3JkIHx8ICFyc0tleVdyb2QpIHtcbiAgICAgICAgICAgIGFjT2JqLmhpZGVSZXN1bHRMaXN0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm9wdGlvbnMuc2VhcmNoQXBpW1NFUkFDSF9RVUVSWV9JREVOVElGSUVSXSA9IGtleXdvcmQ7XG4gICAgICAgICQuYWpheCh0aGlzLm9wdGlvbnMuc2VhcmNoVXJsLCB7XG4gICAgICAgICAgICAnZGF0YVR5cGUnOiAnanNvbnAnLFxuICAgICAgICAgICAgJ2pzb25wQ2FsbGJhY2snOiBDQUxMQkFDS19OQU1FLFxuICAgICAgICAgICAgJ2RhdGEnOiB0aGlzLm9wdGlvbnMuc2VhcmNoQXBpLFxuICAgICAgICAgICAgJ3R5cGUnOiAnZ2V0JyxcbiAgICAgICAgICAgICdzdWNjZXNzJzogJC5wcm94eShmdW5jdGlvbihkYXRhT2JqKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAga2V5RGF0YSA9IHRoaXMuX2dldENvbGxlY3Rpb25EYXRhKGRhdGFPYmopO1xuICAgICAgICAgICAgICAgICAgICBhY09iai5zZXRRdWVyaWVzKGRhdGFPYmoucXVlcnkpO1xuICAgICAgICAgICAgICAgICAgICBhY09iai5zZXRTZXJ2ZXJEYXRhKGtleURhdGEpO1xuICAgICAgICAgICAgICAgICAgICBhY09iai5jbGVhclJlYWR5VmFsdWUoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignW0RhdGFNYW5hZ2VyXSBpbnZhbGlkIHJlc3BvbnNlIGRhdGEuJywgZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcylcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1ha2UgY29sbGVjdGlvbiBkYXRhIHRvIGRpc3BsYXlcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YU9iaiBDb2xsZWN0aW9uIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q29sbGVjdGlvbkRhdGE6IGZ1bmN0aW9uKGRhdGFPYmopIHtcbiAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBkYXRhT2JqLmNvbGxlY3Rpb25zLFxuICAgICAgICAgICAgaXRlbURhdGFMaXN0ID0gW107XG5cbiAgICAgICAgZm9yRWFjaChjb2xsZWN0aW9uLCBmdW5jdGlvbihpdGVtU2V0KSB7XG4gICAgICAgICAgICB2YXIga2V5cztcblxuICAgICAgICAgICAgaWYgKGlzRW1wdHkoaXRlbVNldC5pdGVtcykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGtleXMgPSB0aGlzLl9nZXRSZWRpcmVjdERhdGEoaXRlbVNldCk7XG4gICAgICAgICAgICBpdGVtRGF0YUxpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3RpdGxlJyxcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IFtpdGVtU2V0LnRpdGxlXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdGVtRGF0YUxpc3QgPSBpdGVtRGF0YUxpc3QuY29uY2F0KGtleXMpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gaXRlbURhdGFMaXN0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNYWtlIGl0ZW0gb2YgY29sbGVjdGlvbiB0byBkaXNwbGF5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGl0ZW1TZXQgSXRlbSBvZiBjb2xsZWN0aW9uIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEByZXR1cm5zIHtBcnJheX1cbiAgICAgKi9cbiAgICBfZ2V0UmVkaXJlY3REYXRhOiBmdW5jdGlvbihpdGVtU2V0KSB7XG4gICAgICAgIHZhciBkZWZhdWx0RGF0YSA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBpdGVtU2V0LnR5cGUsXG4gICAgICAgICAgICAgICAgaW5kZXg6IGl0ZW1TZXQuaW5kZXgsXG4gICAgICAgICAgICAgICAgZGVzdDogaXRlbVNldC5kZXN0aW5hdGlvblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGl0ZW1zID0gaXRlbVNldC5pdGVtcy5zbGljZSgwLCB0aGlzLm9wdGlvbnMudmlld0NvdW50IC0gMSk7XG5cbiAgICAgICAgaXRlbXMgPSBtYXAoaXRlbXMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBleHRlbmQoe1xuICAgICAgICAgICAgICAgIHZhbHVlczogaXRlbVxuICAgICAgICAgICAgfSwgZGVmYXVsdERhdGEpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gaXRlbXM7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRGF0YTtcbiIsIi8qKlxuICogQGZpbGVPdmVydmlldyBJbnB1dCBpcyBraW5kIG9mIG1hbmFnZXIgbW9kdWxlIHRvIHN1cHBvcnQgaW5wdXQgZWxlbWVudCBldmVudHMgYW5kIGFsbCBvZiBpbnB1dCBmdW5jdGlvbnMuXG4gKiBAYXV0aG9yIE5ITiBFbnRlcnRhaW5tZW50IEZFIGRldiB0ZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cbid1c2Ugc3RyaWN0JztcbnZhciB1dGlsID0gdHVpLnV0aWw7XG5cbi8qKlxuICogVW5pdCBvZiBhdXRvIGNvbXBsZXRlIGNvbXBvbmVudCB0aGF0IGJlbG9uZyB3aXRoIGlucHV0IGVsZW1lbnQuXG4gKiBAaWdub3JlXG4gKiBAY29uc3RydWN0b3JcbiAqL1xudmFyIElucHV0ID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqQGxlbmRzIElucHV0LnByb3RvdHlwZSAqL3tcbiAgICAvKipcbiAgICAgKiBrZXlib2FyZCBJbnB1dCBLZXlDb2RlIGVudW1cbiAgICAgKi9cbiAgICBrZXlDb2RlTWFwOiB7XG4gICAgICAgICdUQUInOiA5LFxuICAgICAgICAnVVBfQVJST1cnOiAzOCxcbiAgICAgICAgJ0RPV05fQVJST1cnOiA0MCxcbiAgICAgICAgJ0VTQyc6IDI3XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXV0b0NvbXBsZXRlT2JqIEF1dG9Db21wbGV0ZSBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGF1dG8gY29tcGxldGUgb3B0aW9uc1xuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKGF1dG9Db21wbGV0ZU9iaiwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iaiA9IGF1dG9Db21wbGV0ZU9iajtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcblxuICAgICAgICAvKipcbiAgICAgICAgICogRmxhZyB0byBkaXN0aW5ndWlzaCBuZXcgY2hhbmdlZCBpbnB1dFZhbHVlIGZyb20gbW92aW5nLXZhbHVlIGluIHJlc3VsdExpc3RcbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmlzS2V5TW92aW5nID0gZmFsc2U7XG5cbiAgICAgICAgLy8gU2F2ZSBlbGVtZW50cyBmcm9tIGNvbmZpZ3VyYXRpb24uXG4gICAgICAgIHRoaXMuJHNlYXJjaEJveCA9IHRoaXMub3B0aW9ucy5zZWFyY2hCb3hFbGVtZW50O1xuICAgICAgICB0aGlzLiR0b2dnbGVCdG4gPSB0aGlzLm9wdGlvbnMudG9nZ2xlQnRuRWxlbWVudDtcbiAgICAgICAgdGhpcy4kb3JnUXVlcnkgPSB0aGlzLm9wdGlvbnMub3JnUXVlcnlFbGVtZW50O1xuICAgICAgICB0aGlzLiRmb3JtRWxlbWVudCA9IHRoaXMub3B0aW9ucy5mb3JtRWxlbWVudDtcbiAgICAgICAgdGhpcy5wcmV2VmFsdWUgPSAnJztcblxuICAgICAgICB0aGlzLl9hdHRhY2hFdmVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gaW5wdXQgZWxlbWVudCB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFNlYXJjaGJveCB2YWx1ZVxuICAgICAqL1xuICAgIGdldFZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJHNlYXJjaEJveC52YWwoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGtleXdvcmQgdG8gaW5wdXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIGtleXdvcmQgdG8gc2V0IHZhbHVlLlxuICAgICAqL1xuICAgIHNldFZhbHVlOiBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgdGhpcy4kc2VhcmNoQm94LnZhbChzdHIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGNvbmZpZyBmaWxlcyBwYXJhbWV0ZXIgb3B0aW9uIGFuZCBzZXQgcGFyYW1ldGVyLlxuICAgICAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBzdWJRdWVyeVZhbHVlcyBUaGUgc3ViUXVlcnlWYWx1ZXMgZnJvbSByZXN1bHRMaXN0XG4gICAgICogQHBhcmFtIHtudW1iZXJ8c3RyaW5nfSBpbmRleCBUaGUgaW5kZXggZm9yIHN1YlF1ZXJ5U2V0IGluIGNvbmZpZ1xuICAgICAqL1xuICAgIHNldFBhcmFtczogZnVuY3Rpb24oc3ViUXVlcnlWYWx1ZXMsIGluZGV4KSB7XG4gICAgICAgIGlmIChzdWJRdWVyeVZhbHVlcyAmJiB0dWkudXRpbC5pc1N0cmluZyhzdWJRdWVyeVZhbHVlcykpIHtcbiAgICAgICAgICAgIHN1YlF1ZXJ5VmFsdWVzID0gc3ViUXVlcnlWYWx1ZXMuc3BsaXQoJywnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgoIXN1YlF1ZXJ5VmFsdWVzIHx8IHR1aS51dGlsLmlzRW1wdHkoc3ViUXVlcnlWYWx1ZXMpKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2NyZWF0ZVBhcmFtU2V0QnlUeXBlKHN1YlF1ZXJ5VmFsdWVzLCBpbmRleCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBpbnB1dEVsZW1lbnQgYnkgdHlwZVxuICAgICAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBzdWJRdWVyeVZhbHVlcyBUaGUgc3ViUXVlcnlWYWx1ZXMgZnJvbSByZXN1bHRMaXN0XG4gICAgICogQHBhcmFtIHtudW1iZXJ8c3RyaW5nfSBpbmRleCBUaGUgaW5kZXggZm9yIHN1YlF1ZXJ5U2V0IGluIGNvbmZpZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NyZWF0ZVBhcmFtU2V0QnlUeXBlOiBmdW5jdGlvbihzdWJRdWVyeVZhbHVlcywgaW5kZXgpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgICBsaXN0Q29uZmlnID0gb3B0aW9ucy5saXN0Q29uZmlnW2luZGV4XSxcbiAgICAgICAgICAgIHN1YlF1ZXJ5U2V0SW5kZXggPSBsaXN0Q29uZmlnLnN1YlF1ZXJ5U2V0LFxuICAgICAgICAgICAgc3RhdGljUGFyYW1zSW5kZXggPSBsaXN0Q29uZmlnLnN0YXRpY1BhcmFtcyxcbiAgICAgICAgICAgIHN1YlF1ZXJ5S2V5cyA9IG9wdGlvbnMuc3ViUXVlcnlTZXRbc3ViUXVlcnlTZXRJbmRleF0sXG4gICAgICAgICAgICBzdGF0aWNQYXJhbXMgPSBvcHRpb25zLnN0YXRpY1BhcmFtc1tzdGF0aWNQYXJhbXNJbmRleF07XG5cbiAgICAgICAgaWYgKCF0aGlzLmhpZGRlbnMpIHtcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZVBhcmFtQ29udGFpbmVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICB1dGlsLmZvckVhY2goc3ViUXVlcnlWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlLCBpZHgpIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBzdWJRdWVyeUtleXNbaWR4XTtcbiAgICAgICAgICAgIHRoaXMuaGlkZGVucy5hcHBlbmQoJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiJyArIGtleSArICdcIiB2YWx1ZT1cIicgKyB2YWx1ZSArICdcIiAvPicpKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5fY3JlYXRlU3RhdGljUGFyYW1zKHN0YXRpY1BhcmFtcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBzdGF0aWMgcGFyYW1ldGVyc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0aWNQYXJhbXMgU3RhdGljIHBhcmFtZXRlcnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jcmVhdGVTdGF0aWNQYXJhbXM6IGZ1bmN0aW9uKHN0YXRpY1BhcmFtcykge1xuICAgICAgICBpZiAoIXN0YXRpY1BhcmFtcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGljUGFyYW1zID0gc3RhdGljUGFyYW1zLnNwbGl0KCcsJyk7XG4gICAgICAgIHV0aWwuZm9yRWFjaChzdGF0aWNQYXJhbXMsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgdmFsID0gdmFsdWUuc3BsaXQoJz0nKTtcbiAgICAgICAgICAgIHRoaXMuaGlkZGVucy5hcHBlbmQoJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiJyArIHZhbFswXSArICdcIiB2YWx1ZT1cIicgKyB2YWxbMV0gKyAnXCIgLz4nKSk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgd3JhcHBlciB0aGF0IGJlY29tZSBjb250YWluZXIgb2YgaGlkZGVuIGVsZW1lbnRzLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NyZWF0ZVBhcmFtQ29udGFpbmVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5oaWRkZW5zID0gJCgnPGRpdiBjbGFzcz1cImhpZGRlbi1pbnB1dHNcIj48L2Rpdj4nKVxuICAgICAgICAgICAgLmhpZGUoKVxuICAgICAgICAgICAgLmFwcGVuZFRvKHRoaXMuJGZvcm1FbGVtZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hhbmdlIHRvZ2dsZSBidXR0b24gaW1hZ2UuXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpc1VzZSDsnpDrj5nsmYTshLEg7IKs7JqpIOyXrOu2gFxuICAgICAqL1xuICAgIHNldFRvZ2dsZUJ0bkltZzogZnVuY3Rpb24oaXNVc2UpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMudG9nZ2xlSW1nIHx8IHV0aWwuaXNFbXB0eSh0aGlzLiR0b2dnbGVCdG4pKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNVc2UpIHtcbiAgICAgICAgICAgIHRoaXMuJHRvZ2dsZUJ0bi5hdHRyKCdzcmMnLCB0aGlzLm9wdGlvbnMudG9nZ2xlSW1nLm9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJHRvZ2dsZUJ0bi5hdHRyKCdzcmMnLCB0aGlzLm9wdGlvbnMudG9nZ2xlSW1nLm9mZik7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgYmluZGluZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kc2VhcmNoQm94Lm9uKHtcbiAgICAgICAgICAgIGZvY3VzOiAkLnByb3h5KHRoaXMuX29uRm9jdXMsIHRoaXMpLFxuICAgICAgICAgICAgYmx1cjogJC5wcm94eSh0aGlzLl9vbkJsdXIsIHRoaXMpLFxuICAgICAgICAgICAga2V5ZG93bjogJC5wcm94eSh0aGlzLl9vbktleURvd24sIHRoaXMpLFxuICAgICAgICAgICAgY2xpY2s6ICQucHJveHkodGhpcy5fb25DbGljaywgdGhpcylcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKCF1dGlsLmlzRW1wdHkodGhpcy4kdG9nZ2xlQnRuKSkge1xuICAgICAgICAgICAgdGhpcy4kdG9nZ2xlQnRuLm9uKCdjbGljaycsICQucHJveHkodGhpcy5fb25DbGlja1RvZ2dsZSwgdGhpcykpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNhdmUgdXNlciBxdWVyeSBpbnRvIGhpZGRlbiBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyB0eXBlZCBieSB1c2VyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0T3JnUXVlcnk6IGZ1bmN0aW9uKHN0cikge1xuICAgICAgICB0aGlzLiRvcmdRdWVyeS52YWwoc3RyKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5wdXQgZWxlbWVudCBvbmNsaWNrIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZXZlbnQgTW91c2UgZXZlbnRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gRmFsc2UgaWYgbm8gaW5wdXQta2V5d29yZCBvciBub3QgdXNlIGF1dG8tY29tcGxldGVcbiAgICAgKi9cbiAgICBfb25DbGljazogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgLy/snoXroKXrkJwg7YKk7JuM65Oc6rCAIOyXhuqxsOuCmCDsnpDrj5nsmYTshLEg6riw64qlIOyCrOyaqe2VmOyngCDslYrsnLzrqbQg7Y687LmgIO2VhOyalCDsl4bsnLzrr4DroZwg6re464OlIOumrO2EtO2VmOqzoCDrgZ0uXG4gICAgICAgIGlmICghdGhpcy5hdXRvQ29tcGxldGVPYmouZ2V0VmFsdWUoKSB8fFxuICAgICAgICAgICAgIXRoaXMuYXV0b0NvbXBsZXRlT2JqLmlzVXNlQXV0b0NvbXBsZXRlKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5hdXRvQ29tcGxldGVPYmouaXNTaG93UmVzdWx0TGlzdCgpKSB7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5zaG93UmVzdWx0TGlzdCgpO1xuICAgICAgICB9XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5wdXQgZWxlbWVudCBmb2N1cyBldmVudCBoYW5kbGVyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25Gb2N1czogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vc2V0SW50ZXJ2YWwg7ISk7KCV7ZW07IScIOydvOyglSDsi5zqsIQg7KO86riw66GcIF9vbldhdGNoIO2VqOyImOulvCDsi6TtlontlZzri6QuXG4gICAgICAgIHRoaXMuaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKFxuICAgICAgICAgICAgJC5wcm94eSh0aGlzLl9vbldhdGNoLCB0aGlzKSxcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy53YXRjaEludGVydmFsXG4gICAgICAgICk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJvb3AgZm9yIGNoZWNrIHVwZGF0ZSBpbnB1dCBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25XYXRjaDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWFyY2hCb3hWYWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblxuICAgICAgICBpZiAoIXNlYXJjaEJveFZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5oaWRlUmVzdWx0TGlzdCgpO1xuICAgICAgICAgICAgdGhpcy5wcmV2VmFsdWUgPSAnJztcbiAgICAgICAgICAgIHRoaXMuX3NldE9yZ1F1ZXJ5KCcnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmlzS2V5TW92aW5nKSB7XG4gICAgICAgICAgICB0aGlzLl9zZXRPcmdRdWVyeShzZWFyY2hCb3hWYWx1ZSk7XG4gICAgICAgICAgICB0aGlzLnByZXZWYWx1ZSA9IHNlYXJjaEJveFZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJldlZhbHVlICE9PSBzZWFyY2hCb3hWYWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fb25DaGFuZ2UoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnB1dCBlbGVtZW50IG9uY2hhbmdlIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhY09iaiA9IHRoaXMuYXV0b0NvbXBsZXRlT2JqLFxuICAgICAgICAgICAgc2VhcmNoQm94VmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmF1dG9Db21wbGV0ZU9iai5pc1VzZUF1dG9Db21wbGV0ZSgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYWNPYmouaXNJZGxlKSB7XG4gICAgICAgICAgICBhY09iai5pc0lkbGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGFjT2JqLnJlcXVlc3Qoc2VhcmNoQm94VmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWNPYmoucmVhZHlWYWx1ZSA9IHNlYXJjaEJveFZhbHVlO1xuICAgICAgICAgICAgYWNPYmouc2hvd1Jlc3VsdExpc3QoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByZXZWYWx1ZSA9IHNlYXJjaEJveFZhbHVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnB1dCBlbGVtZW50IGJsdXIgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQmx1cjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElkKTtcbiAgICAgICAgdGhpcy5pbnRlcnZhbElkID0gbnVsbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5wdXQgZWxlbWVudCBrZXlkb3duIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBTZXQgYWN0aW5vIGJ5IGlucHV0IHZhbHVlXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQga2V5RG93biBFdmVudCBpbnN0YW5jZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgLyplc2xpbnQtZGlzYWJsZSBjb21wbGV4aXR5Ki9cbiAgICBfb25LZXlEb3duOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgYWNPYmogPSB0aGlzLmF1dG9Db21wbGV0ZU9iaixcbiAgICAgICAgICAgIGZsb3csIGNvZGVNYXAsIGZsb3dNYXA7XG5cbiAgICAgICAgaWYgKCFhY09iai5pc1VzZUF1dG9Db21wbGV0ZSgpIHx8ICFhY09iai5pc1Nob3dSZXN1bHRMaXN0KCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvZGVNYXAgPSB0aGlzLmtleUNvZGVNYXA7XG4gICAgICAgIGZsb3dNYXAgPSBhY09iai5mbG93TWFwO1xuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgY29kZU1hcC5UQUI6XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBmbG93ID0gZXZlbnQuc2hpZnRLZXkgPyBmbG93TWFwLk5FWFQgOiBmbG93TWFwLlBSRVY7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNvZGVNYXAuRE9XTl9BUlJPVzpcbiAgICAgICAgICAgICAgICBmbG93ID0gZmxvd01hcC5ORVhUO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBjb2RlTWFwLlVQX0FSUk9XOlxuICAgICAgICAgICAgICAgIGZsb3cgPSBmbG93TWFwLlBSRVY7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNvZGVNYXAuRVNDOlxuICAgICAgICAgICAgICAgIGFjT2JqLmhpZGVSZXN1bHRMaXN0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZsb3cpIHtcbiAgICAgICAgICAgIHRoaXMuaXNLZXlNb3ZpbmcgPSB0cnVlO1xuICAgICAgICAgICAgYWNPYmoubW92ZU5leHRSZXN1bHQoZmxvdyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmlzS2V5TW92aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qZXNsaW50LWVuYWJsZSBjb21wbGV4aXR5Ki9cblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBidXR0b24gY2xpY2sgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZXZlbnQgTW91c2UgY2xpY2sgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkNsaWNrVG9nZ2xlOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgY3VyVmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGlmICghdGhpcy5hdXRvQ29tcGxldGVPYmouaXNVc2VBdXRvQ29tcGxldGUoKSkge1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouc2V0Q29va2llVmFsdWUodHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5jaGFuZ2VPbk9mZlRleHQodHJ1ZSk7XG4gICAgICAgICAgICBpZiAoIWN1clZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMucHJldlZhbHVlICE9PSBjdXJWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnJlcXVlc3QoY3VyVmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5zaG93UmVzdWx0TGlzdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouc2V0Q29va2llVmFsdWUoZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouY2hhbmdlT25PZmZUZXh0KGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLmhpZGVSZXN1bHRMaXN0KCk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnB1dDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBSZXN1bHQgaXMga2luZCBvZiBtYW5hZ2luZyBtb2R1bGUgdG8gZHJhdyBhdXRvIGNvbXBsZXRlIHJlc3VsdCBsaXN0IGZyb20gc2VydmVyIGFuZCBhcHBseSB0ZW1wbGF0ZS5cbiAqIEBhdXRob3IgIE5ITiBlbnRlcnRhaW5tZW50IEZFIGRldiB0ZWFtPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xudmFyIERFRkFVTFRfVklFV19DT1VOVCA9IDEwLFxuICAgIFdISVRFX1NQQUNFUyA9ICdbXFxcXHNdKic7XG5cbnZhciBpc0VtcHR5ID0gdHVpLnV0aWwuaXNFbXB0eSxcbiAgICBmb3JFYWNoID0gdHVpLnV0aWwuZm9yRWFjaCxcbiAgICBtYXAgPSB0dWkudXRpbC5tYXA7XG5cbnZhciBySXNTcGVpY2FsQ2hhcmFjdGVycyA9IC9bXFxcXF4kLiorPygpW1xcXXt9fF0vLFxuICAgIHJXaGl0ZVNwYWNlID0gJy9cXHMrL2cnO1xuXG4vKipcbiAqIFVuaXQgb2YgYXV0byBjb21wbGV0ZSB0aGF0IGJlbG9uZyB3aXRoIHNlYXJjaCByZXN1bHQgbGlzdC5cbiAqIEhhbmRsZSB0aGUgc3VibWl0IGRhdGEgZnJvbSByZXN1bHRMaXN0LlxuICogU2VlIHtAbGluayBSZXN1bHQucHJvdG90eXBlLl9vcmRlckVsZW1lbnR9IHdoaWNoIHNldCB0aGUgcmVxdWVzdCBkYXRhIGZyb20gYXJyb3cta2V5IGlucHV0XG4gKiBAaWdub3JlXG4gKiBAY29uc3RydWN0b3JcbiAqL1xudmFyIFJlc3VsdCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgUmVzdWx0LnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihhdXRvQ29tcGxldGVPYmosIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmogPSBhdXRvQ29tcGxldGVPYmo7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICAgICAgdGhpcy4kcmVzdWx0TGlzdCA9IG9wdGlvbnMucmVzdWx0TGlzdEVsZW1lbnQ7XG4gICAgICAgIHRoaXMudmlld0NvdW50ID0gb3B0aW9ucy52aWV3Q291bnQgfHwgREVGQVVMVF9WSUVXX0NPVU5UO1xuICAgICAgICB0aGlzLiRvbk9mZlR4dCA9IG9wdGlvbnMub25vZmZUZXh0RWxlbWVudDtcbiAgICAgICAgdGhpcy5tb3VzZU92ZXJDbGFzcyA9IG9wdGlvbnMubW91c2VPdmVyQ2xhc3M7XG4gICAgICAgIHRoaXMuZmxvd01hcCA9IGF1dG9Db21wbGV0ZU9iai5mbG93TWFwO1xuXG4gICAgICAgIHRoaXMuX2F0dGFjaEV2ZW50KCk7XG4gICAgICAgIHRoaXMuJHNlbGVjdGVkRWxlbWVudCA9ICQoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRGVsZXRlIGxhc3QgcmVzdWx0IGxpc3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9kZWxldGVCZWZvcmVFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kc2VsZWN0ZWRFbGVtZW50ID0gJCgpO1xuICAgICAgICB0aGlzLiRyZXN1bHRMaXN0XG4gICAgICAgICAgICAuaGlkZSgpXG4gICAgICAgICAgICAuaHRtbCgnJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERyYXcgcmVzdWx0IGZvcm0gYXBpIHNlcnZlclxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGRhdGFBcnIgUmVzdWx0IGRhdGFcbiAgICAgKi9cbiAgICBkcmF3OiBmdW5jdGlvbihkYXRhQXJyKSB7XG4gICAgICAgIHZhciBsZW4gPSBkYXRhQXJyLmxlbmd0aDtcblxuICAgICAgICB0aGlzLl9kZWxldGVCZWZvcmVFbGVtZW50KCk7XG4gICAgICAgIGlmIChsZW4gPCAxKSB7XG4gICAgICAgICAgICB0aGlzLl9oaWRlQm90dG9tQXJlYSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbWFrZVJlc3VsdExpc3QoZGF0YUFyciwgbGVuKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNob3dSZXN1bHRMaXN0KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1ha2Ugc2VhcmNoIHJlc3VsdCBsaXN0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBkYXRhQXJyIC0gRGF0YSBhcnJheVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsZW4gLSBMZW5ndGggb2YgZGF0YUFycmF5XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVJlc3VsdExpc3Q6IGZ1bmN0aW9uKGRhdGFBcnIsIGxlbikge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSB0aGlzLm9wdGlvbnMudGVtcGxhdGUsXG4gICAgICAgICAgICBsaXN0Q29uZmlnID0gdGhpcy5vcHRpb25zLmxpc3RDb25maWcsXG4gICAgICAgICAgICB1c2VUaXRsZSA9ICh0aGlzLm9wdGlvbnMudXNlVGl0bGUgJiYgISF0ZW1wbGF0ZS50aXRsZSksXG4gICAgICAgICAgICB0bXBsLCBpbmRleCwgdG1wbFZhbHVlLCBpLCBkYXRhO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgICAgICAgICAgZGF0YSA9IGRhdGFBcnJbaV07XG4gICAgICAgICAgICBpbmRleCA9IGRhdGEuaW5kZXg7XG4gICAgICAgICAgICB0bXBsID0gbGlzdENvbmZpZ1tpbmRleF0gPyB0ZW1wbGF0ZVtsaXN0Q29uZmlnW2luZGV4XS50ZW1wbGF0ZV0gOiB0ZW1wbGF0ZS5kZWZhdWx0cztcblxuICAgICAgICAgICAgaWYgKGRhdGEudHlwZSA9PT0gJ3RpdGxlJykge1xuICAgICAgICAgICAgICAgIHRtcGwgPSB0ZW1wbGF0ZS50aXRsZTtcbiAgICAgICAgICAgICAgICBpZiAoIXVzZVRpdGxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRtcGxWYWx1ZSA9IHRoaXMuX2dldFRtcGxEYXRhKHRtcGwuYXR0ciwgZGF0YSk7XG4gICAgICAgICAgICAkKHRoaXMuX2FwcGx5VGVtcGxhdGUodG1wbC5lbGVtZW50LCB0bXBsVmFsdWUpKVxuICAgICAgICAgICAgICAgIC5kYXRhKHtcbiAgICAgICAgICAgICAgICAgICAgJ3BhcmFtcyc6IHRtcGxWYWx1ZS5wYXJhbXMsXG4gICAgICAgICAgICAgICAgICAgICdpbmRleCc6IGluZGV4XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuYXBwZW5kVG8odGhpcy4kcmVzdWx0TGlzdCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWFrZSB0ZW1wbGF0ZSBkYXRhXG4gICAgICogQHBhcmFtIHtBcnJheX0gYXR0cnMgVGVtcGxhdGUgYXR0cmlidXRlc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfE9iamVjdH0gZGF0YSBUaGUgZGF0YSB0byBtYWtlIHRlbXBsYXRlXG4gICAgICogQHJldHVybnMge09iamVjdH0gVGVtcGxhdGUgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFRtcGxEYXRhOiBmdW5jdGlvbihhdHRycywgZGF0YSkge1xuICAgICAgICB2YXIgdG1wbFZhbHVlID0ge30sXG4gICAgICAgICAgICB2YWx1ZXMgPSBkYXRhLnZhbHVlcyB8fCBudWxsO1xuXG4gICAgICAgIGlmICh0dWkudXRpbC5pc1N0cmluZyhkYXRhKSkge1xuICAgICAgICAgICAgdG1wbFZhbHVlW2F0dHJzWzBdXSA9IGRhdGE7XG4gICAgICAgICAgICByZXR1cm4gdG1wbFZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yRWFjaChhdHRycywgZnVuY3Rpb24oYXR0ciwgaWR4KSB7XG4gICAgICAgICAgICB0bXBsVmFsdWVbYXR0cl0gPSB2YWx1ZXNbaWR4XTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChhdHRycy5sZW5ndGggPCB2YWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0bXBsVmFsdWUucGFyYW1zID0gdmFsdWVzLnNsaWNlKGF0dHJzLmxlbmd0aCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdG1wbFZhbHVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gd2hldGhlciByZXN1bHQgbGlzdCBzaG93IG9yIG5vdFxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzU2hvd1Jlc3VsdExpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kcmVzdWx0TGlzdC5jc3MoJ2Rpc3BsYXknKSA9PT0gJ2Jsb2NrJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSByZXN1bHQgbGlzdCBhcmVhXG4gICAgICovXG4gICAgaGlkZVJlc3VsdExpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLiRyZXN1bHRMaXN0LmhpZGUoKTtcbiAgICAgICAgdGhpcy5faGlkZUJvdHRvbUFyZWEoKTtcbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouaXNJZGxlID0gdHJ1ZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRmlyZWQgd2hlbiBoaWRlIHRoZSByZXN1bHQgbGlzdFxuICAgICAgICAgKiBAZXZlbnQgQXV0b0NvbXBsZXRlI2Nsb3NlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5maXJlKCdjbG9zZScpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IHJlc3VsdCBsaXN0IGFyZWFcbiAgICAgKi9cbiAgICBzaG93UmVzdWx0TGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJHJlc3VsdExpc3Quc2hvdygpO1xuICAgICAgICB0aGlzLl9zaG93Qm90dG9tQXJlYSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlIGZvY3VzIHRvIG5leHQgaXRlbSwgY2hhbmdlIGlucHV0IGVsZW1lbnQgdmFsdWUgYXMgZm9jdXMgdmFsdWUuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZsb3cgRGlyZWN0aW9uIGJ5IGtleSBjb2RlXG4gICAgICovXG4gICAgbW92ZU5leHRSZXN1bHQ6IGZ1bmN0aW9uKGZsb3cpIHtcbiAgICAgICAgdmFyICRzZWxlY3RFbCA9IHRoaXMuJHNlbGVjdGVkRWxlbWVudCxcbiAgICAgICAgICAgIGtleXdvcmQ7XG5cbiAgICAgICAgaWYgKCFpc0VtcHR5KCRzZWxlY3RFbCkpIHtcbiAgICAgICAgICAgICRzZWxlY3RFbC5yZW1vdmVDbGFzcyh0aGlzLm1vdXNlT3ZlckNsYXNzKTtcbiAgICAgICAgfVxuICAgICAgICAkc2VsZWN0RWwgPSB0aGlzLiRzZWxlY3RlZEVsZW1lbnQgPSB0aGlzLl9vcmRlckVsZW1lbnQoZmxvdyk7XG5cbiAgICAgICAga2V5d29yZCA9ICRzZWxlY3RFbC5maW5kKCcua2V5d29yZC1maWVsZCcpLnRleHQoKTtcbiAgICAgICAgaWYgKGtleXdvcmQpIHtcbiAgICAgICAgICAgICRzZWxlY3RFbC5hZGRDbGFzcyh0aGlzLm1vdXNlT3ZlckNsYXNzKTtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnNldFZhbHVlKGtleXdvcmQpO1xuICAgICAgICAgICAgdGhpcy5fc2V0U3VibWl0T3B0aW9uKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm1vdmVOZXh0UmVzdWx0KGZsb3cpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYWdlIHRleHQgYnkgd2hldGhlciBhdXRvIGNvbXBsZXRlIHVzZSBvciBub3RcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzVXNlIG9uL29mZiDsl6zrtoBcbiAgICAgKi9cbiAgICBjaGFuZ2VPbk9mZlRleHQ6IGZ1bmN0aW9uKGlzVXNlKSB7XG4gICAgICAgIGlmIChpc1VzZSkge1xuICAgICAgICAgICAgdGhpcy4kb25PZmZUeHQudGV4dCgn7J6Q64+Z7JmE7ISxIOuBhOq4sCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy4kb25PZmZUeHQudGV4dCgn7J6Q64+Z7JmE7ISxIOy8nOq4sCcpO1xuICAgICAgICB9XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGF1dG8gY29tcGxldGUgZXZlbnQgYmVsb25ncyB3aXRoIHJlc3VsdCBsaXN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXR0YWNoRXZlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLiRyZXN1bHRMaXN0Lm9uKHtcbiAgICAgICAgICAgIG1vdXNlb3ZlcjogJC5wcm94eSh0aGlzLl9vbk1vdXNlT3ZlciwgdGhpcyksXG4gICAgICAgICAgICBjbGljazogJC5wcm94eSh0aGlzLl9vbkNsaWNrLCB0aGlzKVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy4kb25PZmZUeHQpIHtcbiAgICAgICAgICAgIHRoaXMuJG9uT2ZmVHh0Lm9uKCdjbGljaycsICQucHJveHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdXNlQXV0b0NvbXBsZXRlKCk7XG4gICAgICAgICAgICB9LCB0aGlzKSk7XG4gICAgICAgIH1cblxuICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAkLnByb3h5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5oaWRlUmVzdWx0TGlzdCgpO1xuICAgICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZ2hsaWdodCBrZXkgd29yZFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0bXBsU3RyIFRlbXBsYXRlIHN0cmluZ1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhT2JqIFJlcGxhY2Ugc3RyaW5nIG1hcFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXBwbHlUZW1wbGF0ZTogZnVuY3Rpb24odG1wbFN0ciwgZGF0YU9iaikge1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKGRhdGFPYmosIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdzdWJqZWN0Jykge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhpcy5faGlnaGxpZ2h0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRtcGxTdHIgPSB0bXBsU3RyLnJlcGxhY2UobmV3IFJlZ0V4cCgnQCcgKyBrZXkgKyAnQCcsICdnJyksIHZhbHVlKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIHRtcGxTdHI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBhcHBsaWVkIGhpZ2hsaWdodCBlZmZlY3Qga2V5IHdvcmRcbiAgICAgKiAodGV4dDogTmlrZSBhaXIgIC8gIHF1ZXJ5IDogW05pa2VdIC8gUmVzdWx0IDogPHN0cm9uZz5OaWtlIDwvc3Ryb25nPmFpclxuICAgICAqIHRleHQgOiAncmhkaWRkbOyZgCDqs6DslpHsnbQnIC8gcXVlcnkgOiAgW3JoZGlkZGwsIOqzoOyWkeydtF0gLyDrpqzthLTqsrDqs7wgPHN0cm9uZz5yaGRpZGRsPC9zdHJvbmc+7JmAIDxzdHJvbmc+6rOg7JaR7J20PC9zdHJvbmc+XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRleHQgSW5wdXQgc3RyaW5nXG4gICAgICogQHJldHVybnMge1N0cmluZ31cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9oaWdobGlnaHQ6IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgdmFyIHF1ZXJpZXMgPSB0aGlzLmF1dG9Db21wbGV0ZU9iai5xdWVyaWVzLFxuICAgICAgICAgICAgcmV0dXJuU3RyO1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2gocXVlcmllcywgZnVuY3Rpb24ocXVlcnkpIHtcbiAgICAgICAgICAgIGlmICghcmV0dXJuU3RyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuU3RyID0gdGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVyblN0ciA9IHRoaXMuX21ha2VTdHJvbmcocmV0dXJuU3RyLCBxdWVyeSk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICByZXR1cm4gcmV0dXJuU3RyIHx8IHRleHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbnRhaW4gdGV4dCBieSBzdHJvbmcgdGFnXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRleHQgUmVjb21tZW5kIHNlYXJjaCBkYXRhICDstpTsspzqsoDsg4nslrQg642w7J207YSwXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHF1ZXJ5IElucHV0IGtleXdvcmRcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTdHJvbmc6IGZ1bmN0aW9uKHRleHQsIHF1ZXJ5KSB7XG4gICAgICAgIHZhciB0bXBBcnIsIHJlZ1F1ZXJ5O1xuXG4gICAgICAgIGlmICghcXVlcnkgfHwgcXVlcnkubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgIH1cblxuICAgICAgICB0bXBBcnIgPSBxdWVyeS5yZXBsYWNlKHJXaGl0ZVNwYWNlLCAnJykuc3BsaXQoJycpO1xuICAgICAgICB0bXBBcnIgPSBtYXAodG1wQXJyLCBmdW5jdGlvbihjaGFyKSB7XG4gICAgICAgICAgICBpZiAocklzU3BlaWNhbENoYXJhY3RlcnMudGVzdChjaGFyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnXFxcXCcgKyBjaGFyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNoYXI7XG4gICAgICAgIH0pO1xuICAgICAgICByZWdRdWVyeSA9IG5ldyBSZWdFeHAodG1wQXJyLmpvaW4oV0hJVEVfU1BBQ0VTKSwgJ2dpJyk7XG5cbiAgICAgICAgcmV0dXJuIHRleHQucmVwbGFjZShyZWdRdWVyeSwgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgICAgICAgIHJldHVybiAnPHN0cm9uZz4nICsgbWF0Y2ggKyAnPC9zdHJvbmc+JztcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgZmlyc3QgcmVzdWx0IGl0ZW1cbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEZpcnN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29yZGVyU3RhZ2UodGhpcy5mbG93TWFwLkZJUlNUKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBsYXN0IHJlc3VsdCBpdGVtXG4gICAgICogQHJldHVybnMge2pRdWVyeX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRMYXN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29yZGVyU3RhZ2UodGhpcy5mbG93TWFwLkxBU1QpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gd2hldGhlciBmaXJzdCBvciBsYXN0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgRmlyc3QvZW5kIGVsZW1lbnQgdHlwZVxuICAgICAqIEByZXR1cm5zIHtqUXVlcnl9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb3JkZXJTdGFnZTogZnVuY3Rpb24odHlwZSkge1xuICAgICAgICB2YXIgZmxvd01hcCA9IHRoaXMuZmxvd01hcCxcbiAgICAgICAgICAgICRjaGlsZHJlbiA9IHRoaXMuJHJlc3VsdExpc3QuY2hpbGRyZW4oKTtcblxuICAgICAgICBpZiAodHlwZSA9PT0gZmxvd01hcC5GSVJTVCkge1xuICAgICAgICAgICAgcmV0dXJuICRjaGlsZHJlbi5maXJzdCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IGZsb3dNYXAuTEFTVCkge1xuICAgICAgICAgICAgcmV0dXJuICRjaGlsZHJlbi5sYXN0KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHByZXZpb3VzIG9yIG5leHQgZWxlbWVudCBmcm9tIHJlc3VsdExpc3QgYnkgZGlyZWN0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgVGhlIGRpcmVjdGlvbiB0eXBlIGZvciBmaW5kaW5nIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29yZGVyRWxlbWVudDogZnVuY3Rpb24odHlwZSkge1xuICAgICAgICB2YXIgJHNlbGVjdGVkRWxlbWVudCA9IHRoaXMuJHNlbGVjdGVkRWxlbWVudCxcbiAgICAgICAgICAgICRvcmRlcjtcblxuICAgICAgICBpZiAodHlwZSA9PT0gdGhpcy5mbG93TWFwLk5FWFQpIHtcbiAgICAgICAgICAgICRvcmRlciA9ICRzZWxlY3RlZEVsZW1lbnQubmV4dCgpO1xuICAgICAgICAgICAgcmV0dXJuICRvcmRlci5sZW5ndGggPyAkb3JkZXIgOiB0aGlzLl9nZXRGaXJzdCgpO1xuICAgICAgICB9XG4gICAgICAgICRvcmRlciA9ICRzZWxlY3RlZEVsZW1lbnQucHJldigpO1xuICAgICAgICByZXR1cm4gJG9yZGVyLmxlbmd0aCA/ICRvcmRlciA6IHRoaXMuX2dldExhc3QoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHdoZXRoZXIgYXV0byBjb21wbGV0ZSB1c2Ugb3Igbm90IGFuZCBjaGFuZ2Ugc3dpdGNoJ3Mgc3RhdGUuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfdXNlQXV0b0NvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGlzVXNlID0gdGhpcy5hdXRvQ29tcGxldGVPYmouaXNVc2VBdXRvQ29tcGxldGUoKTtcbiAgICAgICAgdGhpcy5jaGFuZ2VPbk9mZlRleHQoaXNVc2UpO1xuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5zZXRDb29raWVWYWx1ZShpc1VzZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgYXV0byBjb21wbGV0ZSBzd2l0Y2ggYXJlYVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3Nob3dCb3R0b21BcmVhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuJG9uT2ZmVHh0KSB7XG4gICAgICAgICAgICB0aGlzLiRvbk9mZlR4dC5zaG93KCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSBhdXRvIGNvbXBsZXRlIHN3aXRjaCBhcmVhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaGlkZUJvdHRvbUFyZWE6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy4kb25PZmZUeHQpIHtcbiAgICAgICAgICAgIHRoaXMuJG9uT2ZmVHh0LmhpZGUoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgYWN0aW9uIGF0dHJpYnV0ZSBvZiBmb3JtIGVsZW1lbnQgYW5kIHNldCBhZGRpdGlvbiB2YWx1ZXMgaW4gaGlkZGVuIHR5cGUgZWxlbWVudHMuXG4gICAgICogKENhbGxlZCB3aGVuIGNsaWNrIHRoZSA8bGk+KVxuICAgICAqIEBwYXJhbSB7ZWxlbWVudH0gWyR0YXJnZXRdIFN1Ym1pdCBvcHRpb25zIHRhcmdldFxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKi9cbiAgICBfc2V0U3VibWl0T3B0aW9uOiBmdW5jdGlvbigkdGFyZ2V0KSB7XG4gICAgICAgIHZhciAkc2VsZWN0RmllbGQgPSAkdGFyZ2V0ID8gJCgkdGFyZ2V0KS5jbG9zZXN0KCdsaScpIDogdGhpcy4kc2VsZWN0ZWRFbGVtZW50LFxuICAgICAgICAgICAgcGFyYW1zU3RyaW5nID0gJHNlbGVjdEZpZWxkLmRhdGEoJ3BhcmFtcycpLFxuICAgICAgICAgICAgaW5kZXggPSAkc2VsZWN0RmllbGQuZGF0YSgnaW5kZXgnKSxcbiAgICAgICAgICAgIGNvbmZpZyA9IHRoaXMub3B0aW9ucy5saXN0Q29uZmlnW2luZGV4XSxcbiAgICAgICAgICAgIGFjdGlvbiA9IHRoaXMub3B0aW9ucy5hY3Rpb25zW2NvbmZpZy5hY3Rpb25dLFxuICAgICAgICAgICAgJGZvcm1FbGVtZW50ID0gdGhpcy5vcHRpb25zLmZvcm1FbGVtZW50O1xuXG4gICAgICAgICRmb3JtRWxlbWVudC5hdHRyKCdhY3Rpb24nLCBhY3Rpb24pO1xuICAgICAgICB0aGlzLl9jbGVhclN1Ym1pdE9wdGlvbigpO1xuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5zZXRQYXJhbXMocGFyYW1zU3RyaW5nLCBpbmRleCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpcmVkIHdoZW4gdGhlIHVzZXIncyBzZWxlY3RlZCBlbGVtZW50IGluIHJlc3VsdCBsaXN0IGlzIGNoYW5nZWRcbiAgICAgICAgICogQGV2ZW50IEF1dG9Db21wbGV0ZSNjaGFuZ2VcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSBEYXRhIGZvciBzdWJtaXRcbiAgICAgICAgICogIEBwYXJhbSB7c3RyaW5nfSBkYXRhLmluZGV4IC0gSW5kZXggb2YgY29sbGVjdGlvblxuICAgICAgICAgKiAgQHBhcmFtIHtzdHJpbmd9IGRhdGEuYWN0aW9uIC0gRm9ybSBhY3Rpb25cbiAgICAgICAgICogIEBwYXJhbSB7c3RyaW5nfSBkYXRhLnBhcmFtcyAtIFBhcmFtZXRlcnNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLmZpcmUoJ2NoYW5nZScsIHtcbiAgICAgICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgICAgIGFjdGlvbjogYWN0aW9uLFxuICAgICAgICAgICAgcGFyYW1zOiBwYXJhbXNTdHJpbmdcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlc2V0IGZvcm0gZWxlbWVudC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jbGVhclN1Ym1pdE9wdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkZm9ybUVsZW1lbnQgPSB0aGlzLm9wdGlvbnMuZm9ybUVsZW1lbnQ7XG5cbiAgICAgICAgJGZvcm1FbGVtZW50LmZpbmQoJy5oaWRkZW4taW5wdXRzJykuaHRtbCgnJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlc3VsdCBsaXN0IG1vdXNlb3ZlciBldmVudCBoYW5kbGVyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgRXZlbnQgaW5zdGFuc2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbk1vdXNlT3ZlcjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldCksXG4gICAgICAgICAgICAkYXJyID0gdGhpcy4kcmVzdWx0TGlzdC5maW5kKCdsaScpLFxuICAgICAgICAgICAgJHNlbGVjdGVkSXRlbSA9ICR0YXJnZXQuY2xvc2VzdCgnbGknKTtcblxuICAgICAgICAkYXJyLnJlbW92ZUNsYXNzKHRoaXMubW91c2VPdmVyQ2xhc3MpO1xuICAgICAgICBpZiAoJHNlbGVjdGVkSXRlbS5maW5kKCcua2V5d29yZC1maWVsZCcpLmxlbmd0aCkge1xuICAgICAgICAgICAgJHNlbGVjdGVkSXRlbS5hZGRDbGFzcyh0aGlzLm1vdXNlT3ZlckNsYXNzKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiRzZWxlY3RlZEVsZW1lbnQgPSAkdGFyZ2V0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXN1bHQgbGlzdCBjbGljayBldm5ldCBoYW5kbGVyXG4gICAgICogU3VibWl0IGZvcm0gZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBFdmVudCBpbnN0YW5zZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ2xpY2s6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpLFxuICAgICAgICAgICAgJGZvcm1FbGVtZW50ID0gdGhpcy5vcHRpb25zLmZvcm1FbGVtZW50LFxuICAgICAgICAgICAgJHNlbGVjdEZpZWxkID0gJHRhcmdldC5jbG9zZXN0KCdsaScpLFxuICAgICAgICAgICAgJGtleXdvcmRGaWVsZCA9ICRzZWxlY3RGaWVsZC5maW5kKCcua2V5d29yZC1maWVsZCcpLFxuICAgICAgICAgICAgc2VsZWN0ZWRLZXl3b3JkID0gJGtleXdvcmRGaWVsZC50ZXh0KCk7XG5cbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouc2V0VmFsdWUoc2VsZWN0ZWRLZXl3b3JkKTtcbiAgICAgICAgaWYgKHNlbGVjdGVkS2V5d29yZCkge1xuICAgICAgICAgICAgdGhpcy5fc2V0U3VibWl0T3B0aW9uKCR0YXJnZXQpO1xuICAgICAgICAgICAgJGZvcm1FbGVtZW50LnN1Ym1pdCgpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVzdWx0O1xuIl19
