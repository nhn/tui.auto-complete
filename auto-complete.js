(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
tui.util.defineNamespace('tui.component.AutoComplete', require('./src/js/AutoComplete'));

},{"./src/js/AutoComplete":2}],2:[function(require,module,exports){
/**
 * @fileoverview Auto complete's Core element. All of auto complete objects belong with this object.
 * @version 1.1.0
 * @author NHN Entertainment FE Dev Team. <dl_javascript@nhnent.com>
*/
'use strict';

var DataManager = require('./manager/data'),
    InputManager = require('./manager/input'),
    ResultManager = require('./manager/result');

var REQUIRED_FIELDS = [
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
    DEFAULT_COOKIE_NAME = '_atcp_use_cookie',
    IS_ELEMENT_OPTION_RE_I = /element/i;

/**
 * @constructor
 * @param {Object} options
 * @example
 *  var autoCompleteObj = new ne.component.AutoComplete({
 *     "config" : "Default"    // Dataset in autoConfig.js
 *  });
 *
 *  // The form of config file "autoConfig.js"
 *  // var Default = {
 *  //     // Result element
 *  //     'resultListElement': '._resultBox',
 *  //
 *  //     // Input element
 *  //     'searchBoxElement':  '#ac_input1',
 *  //
 *  //     // Hidden element that is for throwing query that user type.
 *  //     'orgQueryElement' : '#org_query',
 *  //
 *  //     // on,off Button element
 *  //     'toggleBtnElement' : "#onoffBtn",
 *  //
 *  //     // on,off State element
 *  //     'onoffTextElement' : ".baseBox .bottom",
 *  //
 *  //     // on, off State image source
 *  //     'toggleImg' : {
 *  //         'on' : '../img/btn_on.jpg',
 *  //         'off' : '../img/btn_off.jpg'
 *  //     },
 *  //
 *  //     // Collection items each count.
 *  //     'viewCount' : 3,
 *  //
 *  //     // Key arrays (sub query keys' array)
 *  //     'subQuerySet': [
 *  //         ['key1', 'key2', 'key3'],
 *  //         ['dep1', 'dep2', 'dep3'],
 *  //         ['ch1', 'ch2', 'ch3'],
 *  //         ['cid']
 *  //     ],
 *  //
 *  //     // Config for auto complete list by index of collection
 *  //     'listConfig': {
 *  //         '0': {
 *  //             'template': 'department',
 *  //             'subQuerySet' : 0,
 *  //             'action': 0
 *  //         },
 *  //         '1': {
 *  //             'template': 'srch_in_department',
 *  //             'subQuerySet' : 1,
 *  //             'action': 0
 *  //         },
 *  //         '2': {
 *  //             'template': 'srch_in_department',
 *  //             'subQuerySet' : 2,
 *  //             'action': 1,
 *  //             'staticParams': 0
 *  //         },
 *  //         '3': {
 *  //             'template': 'department',
 *  //             'subQuerySet' : 0,
 *  //             'action': 1,
 *  //             'staticParams': 1
 *  //         }
 *  //     },
 *  //
 *  //     // Mark up for each collection. (Default markup is defaults.)
 *  //     // This markup has to have "keywold-field" but title.
 *  //     'template': {
 *  //         department: {
 *  //             element: '<li class="department">' +
 *  //                           '<span class="slot-field">Shop the</span> ' +
 *  //                           '<a href="#" class="keyword-field">@subject@</a> ' +
 *  //                           '<span class="slot-field">Store</span>' +
 *  //                       '</li>',
 *  //             attr: ['subject']
 *  //         },
 *  //         srch: {
 *  //             element: '<li class="srch"><span class="keyword-field">@subject@</span></li>',
 *  //             attr: ['subject']
 *  //         },
 *  //         srch_in_department: {
 *  //             element: '<li class="inDepartment">' +
 *  //                          '<a href="#" class="keyword-field">@subject@</a> ' +
 *  //                          '<span class="slot-field">in </span>' +
 *  //                          '<span class="depart-field">@department@</span>' +
 *  //                      '</li>',
 *  //             attr: ['subject', 'department']
 *  //         },
 *  //         title: {
 *  //             element: '<li class="title"><span>@title@</span></li>',
 *  //             attr: ['title']
 *  //         },
 *  //         defaults: {
 *  //             element: '<li class="srch"><span class="keyword-field">@subject@</span></li>',
 *  //             attr: ['subject']
 *  //         }
 *  //     },
 *  //
 *  //     // Action attribute for each collection
 *  //     'actions': [
 *  //         "http://www.fashiongo.net/catalog.aspx",
 *  //         "http://www.fashiongo.net/search2.aspx"
 *  //     ],
 *  //
 *  //     // Set static options for each collection.
 *  //     'staticParams':[
 *  //         "qt=ProductName",
 *  //         "at=TEST,bt=ACT"
 *  //     ],
 *  //
 *  //     // Whether use title or not.
 *  //     'useTitle': true,
 *  //
 *  //     // Form element that include search element
 *  //     'formElement' : '#ac_form1',
 *  //
 *  //     // Cookie name for save state
 *  //     'cookieName' : "usecookie",
 *  //
 *  //     // Class name for selected element
 *  //     'mouseOverClass' : 'emp',
 *  //
 *  //     // Auto complete API
 *  //     'searchUrl' : 'http://10.24.136.172:20011/ac',
 *  //
 *  //     // Auto complete API request config
 *  //     'searchApi' : {
 *  //         'st' : 1111,
 *  //         'r_lt' : 1111,
 *  //         'r_enc' : 'UTF-8',
 *  //         'q_enc' : 'UTF-8',
 *  //         'r_format' : 'json'
 *  //     }
 *  // }
 */
var AutoComplete = tui.util.defineClass(/**@lends AutoComplete.prototype */{
    /**
     * Direction value for key
     */
    flowMap: {
        'NEXT': 'next',
        'PREV': 'prev',
        'FIRST': 'first',
        'LAST': 'last'
    },

    /**
     * Interval for check update input
     */
    watchInterval: 200,

    /**
     * Initialize
     * @param {Object} options autoconfig values
     */
    init: function(options) {
        this.options = {};
        this._checkValidation(options);
        this._setOptions(options);

        this.dataManager = new DataManager(this, this.options);
        this.inputManager = new InputManager(this, this.options);
        this.resultManager = new ResultManager(this, this.options);

        /**
         * Save matched input english string with Korean.
         * @type {null}
         */
        this.queries = null;
        this.isIdle = true;

        this.setToggleBtnImg(this.isUse);
        this.setCookieValue(this.isUse);
    },

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

        tui.util.forEach(REQUIRED_FIELDS, function(name) {
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
            this.isUse = !!(cookieValue === 'use' || !cookieValue);
        }

        config.cookieName = config.cookieName || DEFAULT_COOKIE_NAME;

        if (!tui.util.isFalsy(config.watchInterval)) {
            config.watchInterval = this.watchInterval;
        }

        tui.util.forEach(config, function(value, name) {
            if (IS_ELEMENT_OPTION_RE_I.test(name)) {
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
     * Save Korean that is matched real query.
     * @param {array} queries Result queries
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
     * Get whether result list area show or not
     * @returns {Boolean}
     */
    isShowResultList: function() {
        return this.resultManager.isShowResultList();
    },

    /**
     * Change toggle button image by auto complete state
     * @param {Boolean} isUse whether use auto complete or not
     */
    setToggleBtnImg: function(isUse) {
        this.inputManager.setToggleBtnImg(isUse);
    },

    /**
     * Hide search result list area
     */
    hideResultList: function() {
        if (this.isUseAutoComplete()) {
            this.resultManager.hideResultList();
        }
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
     */
    moveNextList: function(flow) {
        this.resultManager.moveNextList(flow);
    },

    /**
     * Set text to auto complete switch
     * @param {Boolean} isUse Whether use auto complete or not
     */
    changeOnOffText: function(isUse) {
        this.resultManager.changeOnOffText(isUse);
    },

    /**
     * Return resultManager whether locked or not
     * @returns {Boolean} resultManager의 isMoved값
     */
    getMoved: function() {
        return this.resultManager.isMoved;
    },

    /**
     * Set resultManager's isMoved field
     * @param {Boolean} isMoved Whether locked or not.
     */
    setMoved: function(isMoved) {
        this.resultManager.isMoved = isMoved;
    },

    /**
     * Reset serachApi
     * @api
     * @param {Object} options searchApi옵션 설정
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
 * @version 1.1.0
 * @author NHN Entertainment FE dev team. <dl_javascript@nhnent.com>
 */
'use strict';

var CALLBACK_NAME = 'dataCallback',
    SERACH_QUERY_IDENTIFIER = 'q',
    DEFAULT_PARAMS = {
        'r_enc': 'UTF-8',
        'q_enc': 'UTF-8',
        'r_format': 'json'
    },
    forEach = tui.util.forEach,
    isEmpty = tui.util.isEmpty;

/**
 * Unit of auto complete connecting server.
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

        DEFAULT_PARAMS[SERACH_QUERY_IDENTIFIER] = keyword;
        $.ajax(this.options.searchUrl, {
            'dataType': 'jsonp',
            'jsonpCallback': CALLBACK_NAME,
            'data': $.extend(this.options.searchApi, DEFAULT_PARAMS),
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
        var type = itemSet.type,
            index = itemSet.index,
            dest = itemSet.destination,
            items = [],
            viewCount = this.options.viewCount;

        /* eslint-disable consistent-return */
        forEach(itemSet.items, function(item, idx) {
            if (idx >= viewCount) {
                return false;
            }

            items.push({
                values: item,
                type: type,
                index: index,
                dest: dest
            });
        }, this);
        /* eslint-enable consistent-return */
        return items;
    }
});

module.exports = Data;

},{}],4:[function(require,module,exports){
/**
 * @fileOverview Input is kind of manager module to support input element events and all of input functions.
 * @version 1.1.0
 * @author NHN Entertainment FE dev team <dl_javascript@nhnent.com>
 */
'use strict';
/**
 * Unit of auto complete component that belong with input element.
 * @constructor
 */
var Input = tui.util.defineClass(/**@lends Input.prototype */{
    /**
     * keyboard Input KeyCode enum
     */
    keyCodeMap: {
        'TAB': 9,
        'UP_ARROW': 38,
        'DOWN_ARROW': 40
    },

    /**
     * Initialize
     * @param {Object} autoCompleteObj AutoComplete instance
     * @param {object} options auto complete options
     */
    init: function(autoCompleteObj, options) {
        this.autoCompleteObj = autoCompleteObj;
        this.options = options;

        // Save elements from configuration.
        this.$searchBox = this.options.searchBoxElement;
        this.$toggleBtn = this.options.toggleBtnElement;
        this.$orgQuery = this.options.orgQueryElement;
        this.$formElement = this.options.formElement;
        this.inputValue = this.$searchBox.val();

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
        this.inputValue = str;
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
        var opttions = this.options,
            listConfig = opttions.listConfig[index],
            subQuerySetIndex = listConfig.subQuerySet,
            staticParamsIndex = listConfig.staticParams,
            subQueryKeys = opttions.subQuerySet[subQuerySetIndex],
            staticParams = opttions.staticParams[staticParamsIndex];

        if (!this.hiddens) {
            this._createParamContainer();
        }

        tui.util.forEach(subQueryValues, function(value, idx) {
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
        tui.util.forEach(staticParams, function(value) {
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
        if (!this.options.toggleImg || !this.$toggleBtn || !this.$toggleBtn.length) {
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
            keyup: $.proxy(this._onKeyUp, this),
            keydown: $.proxy(this._onKeyDown, this),
            click: $.proxy(this.click, this)
        });

        if (this.$toggleBtn && this.$toggleBtn.length) {
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
     * @returns {boolean} False if no input-keyword or not use auto-complete
     */
    _onClick: function() {
        //입력된 키워드가 없거나 자동완성 기능 사용하지 않으면 펼칠 필요 없으므로 그냥 리턴하고 끝.
        if (!this.autoCompleteObj.getValue() ||
            !this.autoCompleteObj.isUseAutoComplete()) {
            return false;
        }

        if (this.autoCompleteObj.isShowResultList()) {
            //결과 리스트 영역이 show 상태이면(isResultShowing==true) 결과 리스트 hide 요청
            this.autoCompleteObj.hideResultList();
        } else {
            //결과 리스트 영역이 hide 상태이면(isResultShowing==false) 결과 리스트 show 요청
            this.autoCompleteObj.showResultList();
        }
        return true;
    },

    /**
     * Input element focus event handler
     * @private
     */
    _onFocus: function() {
        //setInterval 설정해서 일정 시간 주기로 _onWatch 함수를 실행한다.
        this.intervalId = setInterval($.proxy(function() {
            this._onWatch();
        }, this), this.options.watchInterval);
    },

    /**
     * Roop for check update input element
     * @private
     */
    _onWatch: function() {
        var searchboxValue = this.$searchBox.val();

        if (!searchboxValue) {
            this._setOrgQuery('');
            this.autoCompleteObj.setMoved(false);
        }

        if (this.inputValue !== searchboxValue) {
            this.inputValue = searchboxValue;
            this._onChange();
        } else if (!this.autoCompleteObj.getMoved()) {
            this._setOrgQuery(searchboxValue);
        }
    },

    /**
     * Input element keyup event handler
     * @private
     */
    _onKeyUp: function() {
        var searchBoxValue = this.$searchBox.val();

        if (this.inputValue !== searchBoxValue) {
            this.inputValue = searchBoxValue;
            this._onChange();
        }
    },

    /**
     * Input element onchange event handler
     * @private
     */
    _onChange: function() {
        var acObj = this.autoCompleteObj;
        if (!acObj.isUseAutoComplete()) {
            return;
        }

        if (acObj.isIdle) {
            acObj.isIdle = false;
            acObj.request(this.$searchBox.val());
        } else {
            acObj.readyValue = this.$searchBox.val();
        }
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
            default:
                return;
        }
        acObj.moveNextList(flow);
    },
    /*eslint-enable complexity*/

    /**
     * Toggle button click event handler
     * @private
     */
    _onClickToggle: function() {
        if (!this.autoCompleteObj.isUseAutoComplete()) {
            this.setToggleBtnImg(true);
            this.autoCompleteObj.setCookieValue(true);
            this.autoCompleteObj.changeOnOffText(false);
        } else {
            this.autoCompleteObj.hideResultList();
            this.setToggleBtnImg(false);
            this.autoCompleteObj.setCookieValue(false);
            this.autoCompleteObj.changeOnOffText(true);
        }
    }
});

module.exports = Input;

},{}],5:[function(require,module,exports){
/**
 * @fileoverview Result is kind of managing module to draw auto complete result list from server and apply template.
 * @version 1.1.0
 * @author  NHN entertainment FE dev team<dl_javascript@nhnent.com>
 */
'use strict';
var DEFAULT_VIEW_COUNT = 10,
    isEmpty = tui.util.isEmpty,
    map = tui.util.map,
    SPECIAL_CHARACTERS_RE = /[\\^$.*+?()[\]{}|]/,
    WHITE_SPACES_RE_G = '/\s+/g',
    WHITE_SPACES = '[\\s]*';

/**
 * Unit of auto complete that belong with search result list.
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

        this.$selectedElement = null;

        this.isMoved = false;
    },

    /**
     * Delete last result list
     * @private
     */
    _deleteBeforeElement: function() {
        this.$resultList
            .hide()
            .html('');
        this.$selectedElement = null;
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

        tui.util.forEach(attrs, function(attr, idx) {
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
         * @api
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
    moveNextList: function(flow) {
        var flowMap = this.flowMap,
            $selectEl = this.$selectedElement,
            getNext = (flow === flowMap.NEXT) ? this._getNext : this._getPrev,
            getBound = (flow === flowMap.NEXT) ? this._getFirst : this._getLast,
            keyword;

        this.isMoved = true;
        if (isEmpty($selectEl)) {
            $selectEl = this.$selectedElement = getBound.call(this);
        } else {
            $selectEl.removeClass(this.mouseOverClass);
            $selectEl = this.$selectedElement = getNext.call(this, $selectEl);
        }

        keyword = $selectEl.find('.keyword-field').text();
        if (keyword) {
            $selectEl.addClass(this.mouseOverClass);
            this.autoCompleteObj.setValue(keyword);
            this._setSubmitOption();
        } else {
            this.moveNextList(flow);
        }
    },

    /**
     * Chage text by whether auto complete use or not
     * @param {Boolean} isUse on/off 여부
     */
    changeOnOffText: function(isUse) {
        if (isUse) {
            this.$onOffTxt.text('자동완성 켜기');
            this.hideResultList();
        } else {
            this.$onOffTxt.text('자동완성 끄기');
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

        tmpArr = query.replace(WHITE_SPACES_RE_G, '').split('');
        tmpArr = map(tmpArr, function(char) {
            if (SPECIAL_CHARACTERS_RE.test(char)) {
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
     * @returns {jQuery|null}
     * @private
     */
    _orderStage: function(type) {
        var $children = this.$resultList.children();

        type = (type === this.flowMap.FIRST) ? 'first' : 'last';
        return $children[type]();
    },

    /**
     * Return next element from selected element
     * If next element is not exist, return first element.
     * @param {jQuery} $el focused element
     * @returns {jQuery}
     * @private
     */
    _getNext: function($el) {
        return this._orderElement(this.flowMap.NEXT, $el);
    },

    /**
     * Return previous element from selected element
     * If previous element is not exist, return the last element.
     * @param {jQuery} $el focused element
     * @returns {jQuery}
     * @private
     */
    _getPrev: function($el) {
        return this._orderElement(this.flowMap.PREV, $el);
    },

    /**
     * Return previous or next element by direction.
     * @param {string} type The direction type for finding element
     * @param {jQuery} $el focused element
     * @returns {jQuery}
     * @private
     */
    _orderElement: function(type, $el) {
        var $order;

        if (type === this.flowMap.NEXT) {
            $order = $el.next();
            return $order.length ? $order : this._getFirst();
        }
        $order = $el.prev();
        return $order.length ? $order : this._getLast();
    },

    /**
     * Set whether auto complete use or not and change switch's state.
     * @private
     */
    _useAutoComplete: function() {
        var isUse = this.autoCompleteObj.isUseAutoComplete();
        this.changeOnOffText(isUse);
        this.autoCompleteObj.setCookieValue(!isUse);
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
         * @api
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9BdXRvQ29tcGxldGUuanMiLCJzcmMvanMvbWFuYWdlci9kYXRhLmpzIiwic3JjL2pzL21hbmFnZXIvaW5wdXQuanMiLCJzcmMvanMvbWFuYWdlci9yZXN1bHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0YUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LkF1dG9Db21wbGV0ZScsIHJlcXVpcmUoJy4vc3JjL2pzL0F1dG9Db21wbGV0ZScpKTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBBdXRvIGNvbXBsZXRlJ3MgQ29yZSBlbGVtZW50LiBBbGwgb2YgYXV0byBjb21wbGV0ZSBvYmplY3RzIGJlbG9uZyB3aXRoIHRoaXMgb2JqZWN0LlxuICogQHZlcnNpb24gMS4xLjBcbiAqIEBhdXRob3IgTkhOIEVudGVydGFpbm1lbnQgRkUgRGV2IFRlYW0uIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4qL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgRGF0YU1hbmFnZXIgPSByZXF1aXJlKCcuL21hbmFnZXIvZGF0YScpLFxuICAgIElucHV0TWFuYWdlciA9IHJlcXVpcmUoJy4vbWFuYWdlci9pbnB1dCcpLFxuICAgIFJlc3VsdE1hbmFnZXIgPSByZXF1aXJlKCcuL21hbmFnZXIvcmVzdWx0Jyk7XG5cbnZhciBSRVFVSVJFRF9GSUVMRFMgPSBbXG4gICAgICAgICdyZXN1bHRMaXN0RWxlbWVudCcsXG4gICAgICAgICdzZWFyY2hCb3hFbGVtZW50JyxcbiAgICAgICAgJ29yZ1F1ZXJ5RWxlbWVudCcsXG4gICAgICAgICdmb3JtRWxlbWVudCcsXG4gICAgICAgICdzdWJRdWVyeVNldCcsXG4gICAgICAgICd0ZW1wbGF0ZScsXG4gICAgICAgICdsaXN0Q29uZmlnJyxcbiAgICAgICAgJ2FjdGlvbnMnLFxuICAgICAgICAnc2VhcmNoVXJsJ1xuICAgIF0sXG4gICAgREVGQVVMVF9DT09LSUVfTkFNRSA9ICdfYXRjcF91c2VfY29va2llJyxcbiAgICBJU19FTEVNRU5UX09QVElPTl9SRV9JID0gL2VsZW1lbnQvaTtcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAZXhhbXBsZVxuICogIHZhciBhdXRvQ29tcGxldGVPYmogPSBuZXcgbmUuY29tcG9uZW50LkF1dG9Db21wbGV0ZSh7XG4gKiAgICAgXCJjb25maWdcIiA6IFwiRGVmYXVsdFwiICAgIC8vIERhdGFzZXQgaW4gYXV0b0NvbmZpZy5qc1xuICogIH0pO1xuICpcbiAqICAvLyBUaGUgZm9ybSBvZiBjb25maWcgZmlsZSBcImF1dG9Db25maWcuanNcIlxuICogIC8vIHZhciBEZWZhdWx0ID0ge1xuICogIC8vICAgICAvLyBSZXN1bHQgZWxlbWVudFxuICogIC8vICAgICAncmVzdWx0TGlzdEVsZW1lbnQnOiAnLl9yZXN1bHRCb3gnLFxuICogIC8vXG4gKiAgLy8gICAgIC8vIElucHV0IGVsZW1lbnRcbiAqICAvLyAgICAgJ3NlYXJjaEJveEVsZW1lbnQnOiAgJyNhY19pbnB1dDEnLFxuICogIC8vXG4gKiAgLy8gICAgIC8vIEhpZGRlbiBlbGVtZW50IHRoYXQgaXMgZm9yIHRocm93aW5nIHF1ZXJ5IHRoYXQgdXNlciB0eXBlLlxuICogIC8vICAgICAnb3JnUXVlcnlFbGVtZW50JyA6ICcjb3JnX3F1ZXJ5JyxcbiAqICAvL1xuICogIC8vICAgICAvLyBvbixvZmYgQnV0dG9uIGVsZW1lbnRcbiAqICAvLyAgICAgJ3RvZ2dsZUJ0bkVsZW1lbnQnIDogXCIjb25vZmZCdG5cIixcbiAqICAvL1xuICogIC8vICAgICAvLyBvbixvZmYgU3RhdGUgZWxlbWVudFxuICogIC8vICAgICAnb25vZmZUZXh0RWxlbWVudCcgOiBcIi5iYXNlQm94IC5ib3R0b21cIixcbiAqICAvL1xuICogIC8vICAgICAvLyBvbiwgb2ZmIFN0YXRlIGltYWdlIHNvdXJjZVxuICogIC8vICAgICAndG9nZ2xlSW1nJyA6IHtcbiAqICAvLyAgICAgICAgICdvbicgOiAnLi4vaW1nL2J0bl9vbi5qcGcnLFxuICogIC8vICAgICAgICAgJ29mZicgOiAnLi4vaW1nL2J0bl9vZmYuanBnJ1xuICogIC8vICAgICB9LFxuICogIC8vXG4gKiAgLy8gICAgIC8vIENvbGxlY3Rpb24gaXRlbXMgZWFjaCBjb3VudC5cbiAqICAvLyAgICAgJ3ZpZXdDb3VudCcgOiAzLFxuICogIC8vXG4gKiAgLy8gICAgIC8vIEtleSBhcnJheXMgKHN1YiBxdWVyeSBrZXlzJyBhcnJheSlcbiAqICAvLyAgICAgJ3N1YlF1ZXJ5U2V0JzogW1xuICogIC8vICAgICAgICAgWydrZXkxJywgJ2tleTInLCAna2V5MyddLFxuICogIC8vICAgICAgICAgWydkZXAxJywgJ2RlcDInLCAnZGVwMyddLFxuICogIC8vICAgICAgICAgWydjaDEnLCAnY2gyJywgJ2NoMyddLFxuICogIC8vICAgICAgICAgWydjaWQnXVxuICogIC8vICAgICBdLFxuICogIC8vXG4gKiAgLy8gICAgIC8vIENvbmZpZyBmb3IgYXV0byBjb21wbGV0ZSBsaXN0IGJ5IGluZGV4IG9mIGNvbGxlY3Rpb25cbiAqICAvLyAgICAgJ2xpc3RDb25maWcnOiB7XG4gKiAgLy8gICAgICAgICAnMCc6IHtcbiAqICAvLyAgICAgICAgICAgICAndGVtcGxhdGUnOiAnZGVwYXJ0bWVudCcsXG4gKiAgLy8gICAgICAgICAgICAgJ3N1YlF1ZXJ5U2V0JyA6IDAsXG4gKiAgLy8gICAgICAgICAgICAgJ2FjdGlvbic6IDBcbiAqICAvLyAgICAgICAgIH0sXG4gKiAgLy8gICAgICAgICAnMSc6IHtcbiAqICAvLyAgICAgICAgICAgICAndGVtcGxhdGUnOiAnc3JjaF9pbl9kZXBhcnRtZW50JyxcbiAqICAvLyAgICAgICAgICAgICAnc3ViUXVlcnlTZXQnIDogMSxcbiAqICAvLyAgICAgICAgICAgICAnYWN0aW9uJzogMFxuICogIC8vICAgICAgICAgfSxcbiAqICAvLyAgICAgICAgICcyJzoge1xuICogIC8vICAgICAgICAgICAgICd0ZW1wbGF0ZSc6ICdzcmNoX2luX2RlcGFydG1lbnQnLFxuICogIC8vICAgICAgICAgICAgICdzdWJRdWVyeVNldCcgOiAyLFxuICogIC8vICAgICAgICAgICAgICdhY3Rpb24nOiAxLFxuICogIC8vICAgICAgICAgICAgICdzdGF0aWNQYXJhbXMnOiAwXG4gKiAgLy8gICAgICAgICB9LFxuICogIC8vICAgICAgICAgJzMnOiB7XG4gKiAgLy8gICAgICAgICAgICAgJ3RlbXBsYXRlJzogJ2RlcGFydG1lbnQnLFxuICogIC8vICAgICAgICAgICAgICdzdWJRdWVyeVNldCcgOiAwLFxuICogIC8vICAgICAgICAgICAgICdhY3Rpb24nOiAxLFxuICogIC8vICAgICAgICAgICAgICdzdGF0aWNQYXJhbXMnOiAxXG4gKiAgLy8gICAgICAgICB9XG4gKiAgLy8gICAgIH0sXG4gKiAgLy9cbiAqICAvLyAgICAgLy8gTWFyayB1cCBmb3IgZWFjaCBjb2xsZWN0aW9uLiAoRGVmYXVsdCBtYXJrdXAgaXMgZGVmYXVsdHMuKVxuICogIC8vICAgICAvLyBUaGlzIG1hcmt1cCBoYXMgdG8gaGF2ZSBcImtleXdvbGQtZmllbGRcIiBidXQgdGl0bGUuXG4gKiAgLy8gICAgICd0ZW1wbGF0ZSc6IHtcbiAqICAvLyAgICAgICAgIGRlcGFydG1lbnQ6IHtcbiAqICAvLyAgICAgICAgICAgICBlbGVtZW50OiAnPGxpIGNsYXNzPVwiZGVwYXJ0bWVudFwiPicgK1xuICogIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwic2xvdC1maWVsZFwiPlNob3AgdGhlPC9zcGFuPiAnICtcbiAqICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICc8YSBocmVmPVwiI1wiIGNsYXNzPVwia2V5d29yZC1maWVsZFwiPkBzdWJqZWN0QDwvYT4gJyArXG4gKiAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJzbG90LWZpZWxkXCI+U3RvcmU8L3NwYW4+JyArXG4gKiAgLy8gICAgICAgICAgICAgICAgICAgICAgICc8L2xpPicsXG4gKiAgLy8gICAgICAgICAgICAgYXR0cjogWydzdWJqZWN0J11cbiAqICAvLyAgICAgICAgIH0sXG4gKiAgLy8gICAgICAgICBzcmNoOiB7XG4gKiAgLy8gICAgICAgICAgICAgZWxlbWVudDogJzxsaSBjbGFzcz1cInNyY2hcIj48c3BhbiBjbGFzcz1cImtleXdvcmQtZmllbGRcIj5Ac3ViamVjdEA8L3NwYW4+PC9saT4nLFxuICogIC8vICAgICAgICAgICAgIGF0dHI6IFsnc3ViamVjdCddXG4gKiAgLy8gICAgICAgICB9LFxuICogIC8vICAgICAgICAgc3JjaF9pbl9kZXBhcnRtZW50OiB7XG4gKiAgLy8gICAgICAgICAgICAgZWxlbWVudDogJzxsaSBjbGFzcz1cImluRGVwYXJ0bWVudFwiPicgK1xuICogIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAnPGEgaHJlZj1cIiNcIiBjbGFzcz1cImtleXdvcmQtZmllbGRcIj5Ac3ViamVjdEA8L2E+ICcgK1xuICogIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJzbG90LWZpZWxkXCI+aW4gPC9zcGFuPicgK1xuICogIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJkZXBhcnQtZmllbGRcIj5AZGVwYXJ0bWVudEA8L3NwYW4+JyArXG4gKiAgLy8gICAgICAgICAgICAgICAgICAgICAgJzwvbGk+JyxcbiAqICAvLyAgICAgICAgICAgICBhdHRyOiBbJ3N1YmplY3QnLCAnZGVwYXJ0bWVudCddXG4gKiAgLy8gICAgICAgICB9LFxuICogIC8vICAgICAgICAgdGl0bGU6IHtcbiAqICAvLyAgICAgICAgICAgICBlbGVtZW50OiAnPGxpIGNsYXNzPVwidGl0bGVcIj48c3Bhbj5AdGl0bGVAPC9zcGFuPjwvbGk+JyxcbiAqICAvLyAgICAgICAgICAgICBhdHRyOiBbJ3RpdGxlJ11cbiAqICAvLyAgICAgICAgIH0sXG4gKiAgLy8gICAgICAgICBkZWZhdWx0czoge1xuICogIC8vICAgICAgICAgICAgIGVsZW1lbnQ6ICc8bGkgY2xhc3M9XCJzcmNoXCI+PHNwYW4gY2xhc3M9XCJrZXl3b3JkLWZpZWxkXCI+QHN1YmplY3RAPC9zcGFuPjwvbGk+JyxcbiAqICAvLyAgICAgICAgICAgICBhdHRyOiBbJ3N1YmplY3QnXVxuICogIC8vICAgICAgICAgfVxuICogIC8vICAgICB9LFxuICogIC8vXG4gKiAgLy8gICAgIC8vIEFjdGlvbiBhdHRyaWJ1dGUgZm9yIGVhY2ggY29sbGVjdGlvblxuICogIC8vICAgICAnYWN0aW9ucyc6IFtcbiAqICAvLyAgICAgICAgIFwiaHR0cDovL3d3dy5mYXNoaW9uZ28ubmV0L2NhdGFsb2cuYXNweFwiLFxuICogIC8vICAgICAgICAgXCJodHRwOi8vd3d3LmZhc2hpb25nby5uZXQvc2VhcmNoMi5hc3B4XCJcbiAqICAvLyAgICAgXSxcbiAqICAvL1xuICogIC8vICAgICAvLyBTZXQgc3RhdGljIG9wdGlvbnMgZm9yIGVhY2ggY29sbGVjdGlvbi5cbiAqICAvLyAgICAgJ3N0YXRpY1BhcmFtcyc6W1xuICogIC8vICAgICAgICAgXCJxdD1Qcm9kdWN0TmFtZVwiLFxuICogIC8vICAgICAgICAgXCJhdD1URVNULGJ0PUFDVFwiXG4gKiAgLy8gICAgIF0sXG4gKiAgLy9cbiAqICAvLyAgICAgLy8gV2hldGhlciB1c2UgdGl0bGUgb3Igbm90LlxuICogIC8vICAgICAndXNlVGl0bGUnOiB0cnVlLFxuICogIC8vXG4gKiAgLy8gICAgIC8vIEZvcm0gZWxlbWVudCB0aGF0IGluY2x1ZGUgc2VhcmNoIGVsZW1lbnRcbiAqICAvLyAgICAgJ2Zvcm1FbGVtZW50JyA6ICcjYWNfZm9ybTEnLFxuICogIC8vXG4gKiAgLy8gICAgIC8vIENvb2tpZSBuYW1lIGZvciBzYXZlIHN0YXRlXG4gKiAgLy8gICAgICdjb29raWVOYW1lJyA6IFwidXNlY29va2llXCIsXG4gKiAgLy9cbiAqICAvLyAgICAgLy8gQ2xhc3MgbmFtZSBmb3Igc2VsZWN0ZWQgZWxlbWVudFxuICogIC8vICAgICAnbW91c2VPdmVyQ2xhc3MnIDogJ2VtcCcsXG4gKiAgLy9cbiAqICAvLyAgICAgLy8gQXV0byBjb21wbGV0ZSBBUElcbiAqICAvLyAgICAgJ3NlYXJjaFVybCcgOiAnaHR0cDovLzEwLjI0LjEzNi4xNzI6MjAwMTEvYWMnLFxuICogIC8vXG4gKiAgLy8gICAgIC8vIEF1dG8gY29tcGxldGUgQVBJIHJlcXVlc3QgY29uZmlnXG4gKiAgLy8gICAgICdzZWFyY2hBcGknIDoge1xuICogIC8vICAgICAgICAgJ3N0JyA6IDExMTEsXG4gKiAgLy8gICAgICAgICAncl9sdCcgOiAxMTExLFxuICogIC8vICAgICAgICAgJ3JfZW5jJyA6ICdVVEYtOCcsXG4gKiAgLy8gICAgICAgICAncV9lbmMnIDogJ1VURi04JyxcbiAqICAvLyAgICAgICAgICdyX2Zvcm1hdCcgOiAnanNvbidcbiAqICAvLyAgICAgfVxuICogIC8vIH1cbiAqL1xudmFyIEF1dG9Db21wbGV0ZSA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKkBsZW5kcyBBdXRvQ29tcGxldGUucHJvdG90eXBlICove1xuICAgIC8qKlxuICAgICAqIERpcmVjdGlvbiB2YWx1ZSBmb3Iga2V5XG4gICAgICovXG4gICAgZmxvd01hcDoge1xuICAgICAgICAnTkVYVCc6ICduZXh0JyxcbiAgICAgICAgJ1BSRVYnOiAncHJldicsXG4gICAgICAgICdGSVJTVCc6ICdmaXJzdCcsXG4gICAgICAgICdMQVNUJzogJ2xhc3QnXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEludGVydmFsIGZvciBjaGVjayB1cGRhdGUgaW5wdXRcbiAgICAgKi9cbiAgICB3YXRjaEludGVydmFsOiAyMDAsXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgYXV0b2NvbmZpZyB2YWx1ZXNcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHt9O1xuICAgICAgICB0aGlzLl9jaGVja1ZhbGlkYXRpb24ob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX3NldE9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5kYXRhTWFuYWdlciA9IG5ldyBEYXRhTWFuYWdlcih0aGlzLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICB0aGlzLmlucHV0TWFuYWdlciA9IG5ldyBJbnB1dE1hbmFnZXIodGhpcywgdGhpcy5vcHRpb25zKTtcbiAgICAgICAgdGhpcy5yZXN1bHRNYW5hZ2VyID0gbmV3IFJlc3VsdE1hbmFnZXIodGhpcywgdGhpcy5vcHRpb25zKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2F2ZSBtYXRjaGVkIGlucHV0IGVuZ2xpc2ggc3RyaW5nIHdpdGggS29yZWFuLlxuICAgICAgICAgKiBAdHlwZSB7bnVsbH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucXVlcmllcyA9IG51bGw7XG4gICAgICAgIHRoaXMuaXNJZGxlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLnNldFRvZ2dsZUJ0bkltZyh0aGlzLmlzVXNlKTtcbiAgICAgICAgdGhpcy5zZXRDb29raWVWYWx1ZSh0aGlzLmlzVXNlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgcmVxdWlyZWQgZmllbGRzIGFuZCB2YWxpZGF0ZSBmaWVsZHMuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgY29tcG9uZW50IGNvbmZpZ3VyYXRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2hlY2tWYWxpZGF0aW9uOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHZhciBpc0V4aXN0eSA9IHR1aS51dGlsLmlzRXhpc3R5LFxuICAgICAgICAgICAgY29uZmlnID0gb3B0aW9ucy5jb25maWc7XG5cbiAgICAgICAgaWYgKCFpc0V4aXN0eShjb25maWcpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvbmZpZ3VyYXRpb24gIycgKyBjb25maWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChSRVFVSVJFRF9GSUVMRFMsIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgICAgIGlmICghaXNFeGlzdHkoY29uZmlnW25hbWVdKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihuYW1lICsgJ2RvZXMgbm90IG5vdCBleGlzdC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBjb21wb25lbnQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIGNvbXBvbmVudCBjb25maWd1cmF0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldE9wdGlvbnM6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGNvbmZpZyA9IG9wdGlvbnMuY29uZmlnLFxuICAgICAgICAgICAgY29va2llVmFsdWU7XG5cbiAgICAgICAgaWYgKCFjb25maWcudG9nZ2xlSW1nIHx8ICFjb25maWcub25vZmZUZXh0RWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5pc1VzZSA9IHRydWU7XG4gICAgICAgICAgICBkZWxldGUgY29uZmlnLm9ub2ZmVGV4dEVsZW1lbnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb29raWVWYWx1ZSA9ICQuY29va2llKGNvbmZpZy5jb29raWVOYW1lKTtcbiAgICAgICAgICAgIHRoaXMuaXNVc2UgPSAhIShjb29raWVWYWx1ZSA9PT0gJ3VzZScgfHwgIWNvb2tpZVZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbmZpZy5jb29raWVOYW1lID0gY29uZmlnLmNvb2tpZU5hbWUgfHwgREVGQVVMVF9DT09LSUVfTkFNRTtcblxuICAgICAgICBpZiAoIXR1aS51dGlsLmlzRmFsc3koY29uZmlnLndhdGNoSW50ZXJ2YWwpKSB7XG4gICAgICAgICAgICBjb25maWcud2F0Y2hJbnRlcnZhbCA9IHRoaXMud2F0Y2hJbnRlcnZhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goY29uZmlnLCBmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICAgICAgaWYgKElTX0VMRU1FTlRfT1BUSU9OX1JFX0kudGVzdChuYW1lKSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1tuYW1lXSA9ICQodmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlcXVlc3QgZGF0YSBhdCBhcGkgc2VydmVyIHdpdGgga2V5d29yZFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBrZXl3b3JkIFRoZSBrZXkgd29yZCB0byBzZW5kIHRvIEF1dG8gY29tcGxldGUgQVBJXG4gICAgICovXG4gICAgcmVxdWVzdDogZnVuY3Rpb24oa2V5d29yZCkge1xuICAgICAgICB0aGlzLmRhdGFNYW5hZ2VyLnJlcXVlc3Qoa2V5d29yZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBzdHJpbmcgaW4gaW5wdXQgZWxlbWVudC5cbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgICAqL1xuICAgIGdldFZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXRNYW5hZ2VyLmdldFZhbHVlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBpbnB1dE1hbmFnZXIncyB2YWx1ZSB0byBzaG93IGF0IHNlYXJjaCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGtleXdvcmQgVGhlIHN0cmluZyB0byBzaG93IHVwIGF0IHNlYXJjaCBlbGVtZW50XG4gICAgICovXG4gICAgc2V0VmFsdWU6IGZ1bmN0aW9uKGtleXdvcmQpIHtcbiAgICAgICAgdGhpcy5pbnB1dE1hbmFnZXIuc2V0VmFsdWUoa2V5d29yZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBhZGRpdGlvbmFsIHBhcmFtZXRlcnMgYXQgaW5wdXRNYW5hZ2VyLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJhbVN0ciBTdHJpbmcgdG8gYmUgYWRkaXRpb24gcGFyYW1ldGVycy4oc2FwZXJhdG9yICcmJylcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaW5kZXggVGhlIGluZGV4IGZvciBzZXR0aW5nIGtleSB2YWx1ZVxuICAgICAqL1xuICAgIHNldFBhcmFtczogZnVuY3Rpb24ocGFyYW1TdHIsIGluZGV4KSB7XG4gICAgICAgIHRoaXMuaW5wdXRNYW5hZ2VyLnNldFBhcmFtcyhwYXJhbVN0ciwgaW5kZXgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0IHRvIGRyYXcgcmVzdWx0IGF0IHJlc3VsdE1hbmFnZXIgd2l0aCBkYXRhIGZyb20gYXBpIHNlcnZlci5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBkYXRhQXJyIERhdGEgYXJyYXkgZnJvbSBhcGkgc2VydmVyXG4gICAgICovXG4gICAgc2V0U2VydmVyRGF0YTogZnVuY3Rpb24oZGF0YUFycikge1xuICAgICAgICB0aGlzLnJlc3VsdE1hbmFnZXIuZHJhdyhkYXRhQXJyKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IENvb2tpZSB2YWx1ZSB3aXRoIHdoZXRoZXIgdXNlIGF1dG8gY29tcGxldGUgb3Igbm90XG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpc1VzZSBXaGV0aGVyIHVzZSBhdXRvIGNvbXBsZXRlIG9yIG5vdFxuICAgICAqL1xuICAgIHNldENvb2tpZVZhbHVlOiBmdW5jdGlvbihpc1VzZSkge1xuICAgICAgICAkLmNvb2tpZSh0aGlzLm9wdGlvbnMuY29va2llTmFtZSwgaXNVc2UgPyAndXNlJyA6ICdub3RVc2UnKTtcbiAgICAgICAgdGhpcy5pc1VzZSA9IGlzVXNlO1xuICAgICAgICB0aGlzLnNldFRvZ2dsZUJ0bkltZyhpc1VzZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNhdmUgS29yZWFuIHRoYXQgaXMgbWF0Y2hlZCByZWFsIHF1ZXJ5LlxuICAgICAqIEBwYXJhbSB7YXJyYXl9IHF1ZXJpZXMgUmVzdWx0IHF1ZXJpZXNcbiAgICAgKi9cbiAgICBzZXRRdWVyaWVzOiBmdW5jdGlvbihxdWVyaWVzKSB7XG4gICAgICAgIHRoaXMucXVlcmllcyA9IFtdLmNvbmNhdChxdWVyaWVzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdoZXRoZXIgdXNlIGF1dG8gY29tcGxldGUgb3Igbm90XG4gICAgICogQGFwaVxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgICAqIEBleGFtcGxlXG4gICAgICogIGF1dG9Db21wbGV0ZS5pc1VzZUF1dG9Db21wbGV0ZSgpOyA9PiB0cnVlfGZhbHNlXG4gICAgICovXG4gICAgaXNVc2VBdXRvQ29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc1VzZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdoZXRoZXIgcmVzdWx0IGxpc3QgYXJlYSBzaG93IG9yIG5vdFxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzU2hvd1Jlc3VsdExpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHRNYW5hZ2VyLmlzU2hvd1Jlc3VsdExpc3QoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hhbmdlIHRvZ2dsZSBidXR0b24gaW1hZ2UgYnkgYXV0byBjb21wbGV0ZSBzdGF0ZVxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNVc2Ugd2hldGhlciB1c2UgYXV0byBjb21wbGV0ZSBvciBub3RcbiAgICAgKi9cbiAgICBzZXRUb2dnbGVCdG5JbWc6IGZ1bmN0aW9uKGlzVXNlKSB7XG4gICAgICAgIHRoaXMuaW5wdXRNYW5hZ2VyLnNldFRvZ2dsZUJ0bkltZyhpc1VzZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgc2VhcmNoIHJlc3VsdCBsaXN0IGFyZWFcbiAgICAgKi9cbiAgICBoaWRlUmVzdWx0TGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmlzVXNlQXV0b0NvbXBsZXRlKCkpIHtcbiAgICAgICAgICAgIHRoaXMucmVzdWx0TWFuYWdlci5oaWRlUmVzdWx0TGlzdCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgc2VhcmNoIHJlc3VsdCBsaXN0IGFyZWFcbiAgICAgKi9cbiAgICBzaG93UmVzdWx0TGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmlzVXNlQXV0b0NvbXBsZXRlKCkpIHtcbiAgICAgICAgICAgIHRoaXMucmVzdWx0TWFuYWdlci5zaG93UmVzdWx0TGlzdCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1vdmUgdG8gbmV4dCBpdGVtIGluIHJlc3VsdCBsaXN0LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmbG93IERpcmVjdGlvbiB0byBtb3ZlLlxuICAgICAqL1xuICAgIG1vdmVOZXh0TGlzdDogZnVuY3Rpb24oZmxvdykge1xuICAgICAgICB0aGlzLnJlc3VsdE1hbmFnZXIubW92ZU5leHRMaXN0KGZsb3cpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGV4dCB0byBhdXRvIGNvbXBsZXRlIHN3aXRjaFxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNVc2UgV2hldGhlciB1c2UgYXV0byBjb21wbGV0ZSBvciBub3RcbiAgICAgKi9cbiAgICBjaGFuZ2VPbk9mZlRleHQ6IGZ1bmN0aW9uKGlzVXNlKSB7XG4gICAgICAgIHRoaXMucmVzdWx0TWFuYWdlci5jaGFuZ2VPbk9mZlRleHQoaXNVc2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gcmVzdWx0TWFuYWdlciB3aGV0aGVyIGxvY2tlZCBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gcmVzdWx0TWFuYWdlcuydmCBpc01vdmVk6rCSXG4gICAgICovXG4gICAgZ2V0TW92ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHRNYW5hZ2VyLmlzTW92ZWQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCByZXN1bHRNYW5hZ2VyJ3MgaXNNb3ZlZCBmaWVsZFxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNNb3ZlZCBXaGV0aGVyIGxvY2tlZCBvciBub3QuXG4gICAgICovXG4gICAgc2V0TW92ZWQ6IGZ1bmN0aW9uKGlzTW92ZWQpIHtcbiAgICAgICAgdGhpcy5yZXN1bHRNYW5hZ2VyLmlzTW92ZWQgPSBpc01vdmVkO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXNldCBzZXJhY2hBcGlcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgc2VhcmNoQXBp7Ji17IWYIOyEpOyglVxuICAgICAqIEBleGFtcGxlXG4gICAgICogIGF1dG9Db21wbGV0ZS5zZXRTZWFyY2hBcGkoe1xuICAgICAqICAgICAgJ3N0JyA6IDExMSxcbiAgICAgKiAgICAgICdyX2x0JyA6IDExMSxcbiAgICAgKiAgICAgICdyX2VuYycgOiAnVVRGLTgnLFxuICAgICAqICAgICAgJ3FfZW5jJyA6ICdVVEYtOCcsXG4gICAgICogICAgICAncl9mb3JtYXQnIDogJ2pzb24nXG4gICAgICogIH0pO1xuICAgICAqL1xuICAgIHNldFNlYXJjaEFwaTogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB0dWkudXRpbC5leHRlbmQodGhpcy5vcHRpb25zLnNlYXJjaEFwaSwgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNsZWFyIHJlYWR5IHZhbHVlIGFuZCBzZXQgaWRsZSBzdGF0ZVxuICAgICAqL1xuICAgIGNsZWFyUmVhZHlWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0dWkudXRpbC5pc0V4aXN0eSh0aGlzLnJlYWR5VmFsdWUpKSB7XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3QodGhpcy5yZWFkeVZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaXNJZGxlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlYWR5VmFsdWUgPSBudWxsO1xuICAgIH1cbn0pO1xudHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKEF1dG9Db21wbGV0ZSk7XG5tb2R1bGUuZXhwb3J0cyA9IEF1dG9Db21wbGV0ZTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBEYXRhIGlzIGtpbmQgb2YgbWFuYWdlciBtb2R1bGUgdG8gcmVxdWVzdCBkYXRhIGF0IEFQSSB3aXRoIGlucHV0IHF1ZXJpZXMuXG4gKiBAdmVyc2lvbiAxLjEuMFxuICogQGF1dGhvciBOSE4gRW50ZXJ0YWlubWVudCBGRSBkZXYgdGVhbS4gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ0FMTEJBQ0tfTkFNRSA9ICdkYXRhQ2FsbGJhY2snLFxuICAgIFNFUkFDSF9RVUVSWV9JREVOVElGSUVSID0gJ3EnLFxuICAgIERFRkFVTFRfUEFSQU1TID0ge1xuICAgICAgICAncl9lbmMnOiAnVVRGLTgnLFxuICAgICAgICAncV9lbmMnOiAnVVRGLTgnLFxuICAgICAgICAncl9mb3JtYXQnOiAnanNvbidcbiAgICB9LFxuICAgIGZvckVhY2ggPSB0dWkudXRpbC5mb3JFYWNoLFxuICAgIGlzRW1wdHkgPSB0dWkudXRpbC5pc0VtcHR5O1xuXG4vKipcbiAqIFVuaXQgb2YgYXV0byBjb21wbGV0ZSBjb25uZWN0aW5nIHNlcnZlci5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgRGF0YSA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKkBsZW5kcyBEYXRhLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihhdXRvQ29tcGxldGVPYmosIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmogPSBhdXRvQ29tcGxldGVPYmo7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlcXVlc3QgZGF0YSBhdCBhcGkgc2VydmVyIHVzZSBqc29ucFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBrZXl3b3JkIFN0cmluZyB0byByZXF1ZXN0IGF0IHNlcnZlclxuICAgICAqL1xuICAgIHJlcXVlc3Q6IGZ1bmN0aW9uKGtleXdvcmQpIHtcbiAgICAgICAgdmFyIHJzS2V5V3JvZCA9IGtleXdvcmQucmVwbGFjZSgvXFxzL2csICcnKSxcbiAgICAgICAgICAgIGFjT2JqID0gdGhpcy5hdXRvQ29tcGxldGVPYmosXG4gICAgICAgICAgICBrZXlEYXRhO1xuXG4gICAgICAgIGlmICgha2V5d29yZCB8fCAhcnNLZXlXcm9kKSB7XG4gICAgICAgICAgICBhY09iai5oaWRlUmVzdWx0TGlzdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgREVGQVVMVF9QQVJBTVNbU0VSQUNIX1FVRVJZX0lERU5USUZJRVJdID0ga2V5d29yZDtcbiAgICAgICAgJC5hamF4KHRoaXMub3B0aW9ucy5zZWFyY2hVcmwsIHtcbiAgICAgICAgICAgICdkYXRhVHlwZSc6ICdqc29ucCcsXG4gICAgICAgICAgICAnanNvbnBDYWxsYmFjayc6IENBTExCQUNLX05BTUUsXG4gICAgICAgICAgICAnZGF0YSc6ICQuZXh0ZW5kKHRoaXMub3B0aW9ucy5zZWFyY2hBcGksIERFRkFVTFRfUEFSQU1TKSxcbiAgICAgICAgICAgICd0eXBlJzogJ2dldCcsXG4gICAgICAgICAgICAnc3VjY2Vzcyc6ICQucHJveHkoZnVuY3Rpb24oZGF0YU9iaikge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGtleURhdGEgPSB0aGlzLl9nZXRDb2xsZWN0aW9uRGF0YShkYXRhT2JqKTtcbiAgICAgICAgICAgICAgICAgICAgYWNPYmouc2V0UXVlcmllcyhkYXRhT2JqLnF1ZXJ5KTtcbiAgICAgICAgICAgICAgICAgICAgYWNPYmouc2V0U2VydmVyRGF0YShrZXlEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgYWNPYmouY2xlYXJSZWFkeVZhbHVlKCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1tEYXRhTWFuYWdlcl0gaW52YWxpZCByZXNwb25zZSBkYXRhLicsIGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMpXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNYWtlIGNvbGxlY3Rpb24gZGF0YSB0byBkaXNwbGF5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGFPYmogQ29sbGVjdGlvbiBkYXRhXG4gICAgICogQHJldHVybnMge0FycmF5fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENvbGxlY3Rpb25EYXRhOiBmdW5jdGlvbihkYXRhT2JqKSB7XG4gICAgICAgIHZhciBjb2xsZWN0aW9uID0gZGF0YU9iai5jb2xsZWN0aW9ucyxcbiAgICAgICAgICAgIGl0ZW1EYXRhTGlzdCA9IFtdO1xuXG4gICAgICAgIGZvckVhY2goY29sbGVjdGlvbiwgZnVuY3Rpb24oaXRlbVNldCkge1xuICAgICAgICAgICAgdmFyIGtleXM7XG5cbiAgICAgICAgICAgIGlmIChpc0VtcHR5KGl0ZW1TZXQuaXRlbXMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBrZXlzID0gdGhpcy5fZ2V0UmVkaXJlY3REYXRhKGl0ZW1TZXQpO1xuICAgICAgICAgICAgaXRlbURhdGFMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6ICd0aXRsZScsXG4gICAgICAgICAgICAgICAgdmFsdWVzOiBbaXRlbVNldC50aXRsZV1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXRlbURhdGFMaXN0ID0gaXRlbURhdGFMaXN0LmNvbmNhdChrZXlzKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIGl0ZW1EYXRhTGlzdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWFrZSBpdGVtIG9mIGNvbGxlY3Rpb24gdG8gZGlzcGxheVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtU2V0IEl0ZW0gb2YgY29sbGVjdGlvbiBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9XG4gICAgICovXG4gICAgX2dldFJlZGlyZWN0RGF0YTogZnVuY3Rpb24oaXRlbVNldCkge1xuICAgICAgICB2YXIgdHlwZSA9IGl0ZW1TZXQudHlwZSxcbiAgICAgICAgICAgIGluZGV4ID0gaXRlbVNldC5pbmRleCxcbiAgICAgICAgICAgIGRlc3QgPSBpdGVtU2V0LmRlc3RpbmF0aW9uLFxuICAgICAgICAgICAgaXRlbXMgPSBbXSxcbiAgICAgICAgICAgIHZpZXdDb3VudCA9IHRoaXMub3B0aW9ucy52aWV3Q291bnQ7XG5cbiAgICAgICAgLyogZXNsaW50LWRpc2FibGUgY29uc2lzdGVudC1yZXR1cm4gKi9cbiAgICAgICAgZm9yRWFjaChpdGVtU2V0Lml0ZW1zLCBmdW5jdGlvbihpdGVtLCBpZHgpIHtcbiAgICAgICAgICAgIGlmIChpZHggPj0gdmlld0NvdW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpdGVtcy5wdXNoKHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IGl0ZW0sXG4gICAgICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgICAgICAgICAgZGVzdDogZGVzdFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIGNvbnNpc3RlbnQtcmV0dXJuICovXG4gICAgICAgIHJldHVybiBpdGVtcztcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBEYXRhO1xuIiwiLyoqXG4gKiBAZmlsZU92ZXJ2aWV3IElucHV0IGlzIGtpbmQgb2YgbWFuYWdlciBtb2R1bGUgdG8gc3VwcG9ydCBpbnB1dCBlbGVtZW50IGV2ZW50cyBhbmQgYWxsIG9mIGlucHV0IGZ1bmN0aW9ucy5cbiAqIEB2ZXJzaW9uIDEuMS4wXG4gKiBAYXV0aG9yIE5ITiBFbnRlcnRhaW5tZW50IEZFIGRldiB0ZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cbid1c2Ugc3RyaWN0Jztcbi8qKlxuICogVW5pdCBvZiBhdXRvIGNvbXBsZXRlIGNvbXBvbmVudCB0aGF0IGJlbG9uZyB3aXRoIGlucHV0IGVsZW1lbnQuXG4gKiBAY29uc3RydWN0b3JcbiAqL1xudmFyIElucHV0ID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqQGxlbmRzIElucHV0LnByb3RvdHlwZSAqL3tcbiAgICAvKipcbiAgICAgKiBrZXlib2FyZCBJbnB1dCBLZXlDb2RlIGVudW1cbiAgICAgKi9cbiAgICBrZXlDb2RlTWFwOiB7XG4gICAgICAgICdUQUInOiA5LFxuICAgICAgICAnVVBfQVJST1cnOiAzOCxcbiAgICAgICAgJ0RPV05fQVJST1cnOiA0MFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF1dG9Db21wbGV0ZU9iaiBBdXRvQ29tcGxldGUgaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBhdXRvIGNvbXBsZXRlIG9wdGlvbnNcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihhdXRvQ29tcGxldGVPYmosIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmogPSBhdXRvQ29tcGxldGVPYmo7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICAgICAgLy8gU2F2ZSBlbGVtZW50cyBmcm9tIGNvbmZpZ3VyYXRpb24uXG4gICAgICAgIHRoaXMuJHNlYXJjaEJveCA9IHRoaXMub3B0aW9ucy5zZWFyY2hCb3hFbGVtZW50O1xuICAgICAgICB0aGlzLiR0b2dnbGVCdG4gPSB0aGlzLm9wdGlvbnMudG9nZ2xlQnRuRWxlbWVudDtcbiAgICAgICAgdGhpcy4kb3JnUXVlcnkgPSB0aGlzLm9wdGlvbnMub3JnUXVlcnlFbGVtZW50O1xuICAgICAgICB0aGlzLiRmb3JtRWxlbWVudCA9IHRoaXMub3B0aW9ucy5mb3JtRWxlbWVudDtcbiAgICAgICAgdGhpcy5pbnB1dFZhbHVlID0gdGhpcy4kc2VhcmNoQm94LnZhbCgpO1xuXG4gICAgICAgIHRoaXMuX2F0dGFjaEV2ZW50KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBpbnB1dCBlbGVtZW50IHZhbHVlXG4gICAgICogQHJldHVybnMge1N0cmluZ30gU2VhcmNoYm94IHZhbHVlXG4gICAgICovXG4gICAgZ2V0VmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kc2VhcmNoQm94LnZhbCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQga2V5d29yZCB0byBpbnB1dCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUga2V5d29yZCB0byBzZXQgdmFsdWUuXG4gICAgICovXG4gICAgc2V0VmFsdWU6IGZ1bmN0aW9uKHN0cikge1xuICAgICAgICB0aGlzLiRzZWFyY2hCb3gudmFsKHN0cik7XG4gICAgICAgIHRoaXMuaW5wdXRWYWx1ZSA9IHN0cjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVhZCBjb25maWcgZmlsZXMgcGFyYW1ldGVyIG9wdGlvbiBhbmQgc2V0IHBhcmFtZXRlci5cbiAgICAgKiBAcGFyYW0ge0FycmF5fHN0cmluZ30gc3ViUXVlcnlWYWx1ZXMgVGhlIHN1YlF1ZXJ5VmFsdWVzIGZyb20gcmVzdWx0TGlzdFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfHN0cmluZ30gaW5kZXggVGhlIGluZGV4IGZvciBzdWJRdWVyeVNldCBpbiBjb25maWdcbiAgICAgKi9cbiAgICBzZXRQYXJhbXM6IGZ1bmN0aW9uKHN1YlF1ZXJ5VmFsdWVzLCBpbmRleCkge1xuICAgICAgICBpZiAoc3ViUXVlcnlWYWx1ZXMgJiYgdHVpLnV0aWwuaXNTdHJpbmcoc3ViUXVlcnlWYWx1ZXMpKSB7XG4gICAgICAgICAgICBzdWJRdWVyeVZhbHVlcyA9IHN1YlF1ZXJ5VmFsdWVzLnNwbGl0KCcsJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKCFzdWJRdWVyeVZhbHVlcyB8fCB0dWkudXRpbC5pc0VtcHR5KHN1YlF1ZXJ5VmFsdWVzKSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jcmVhdGVQYXJhbVNldEJ5VHlwZShzdWJRdWVyeVZhbHVlcywgaW5kZXgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgaW5wdXRFbGVtZW50IGJ5IHR5cGVcbiAgICAgKiBAcGFyYW0ge0FycmF5fHN0cmluZ30gc3ViUXVlcnlWYWx1ZXMgVGhlIHN1YlF1ZXJ5VmFsdWVzIGZyb20gcmVzdWx0TGlzdFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfHN0cmluZ30gaW5kZXggVGhlIGluZGV4IGZvciBzdWJRdWVyeVNldCBpbiBjb25maWdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jcmVhdGVQYXJhbVNldEJ5VHlwZTogZnVuY3Rpb24oc3ViUXVlcnlWYWx1ZXMsIGluZGV4KSB7XG4gICAgICAgIHZhciBvcHR0aW9ucyA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICAgIGxpc3RDb25maWcgPSBvcHR0aW9ucy5saXN0Q29uZmlnW2luZGV4XSxcbiAgICAgICAgICAgIHN1YlF1ZXJ5U2V0SW5kZXggPSBsaXN0Q29uZmlnLnN1YlF1ZXJ5U2V0LFxuICAgICAgICAgICAgc3RhdGljUGFyYW1zSW5kZXggPSBsaXN0Q29uZmlnLnN0YXRpY1BhcmFtcyxcbiAgICAgICAgICAgIHN1YlF1ZXJ5S2V5cyA9IG9wdHRpb25zLnN1YlF1ZXJ5U2V0W3N1YlF1ZXJ5U2V0SW5kZXhdLFxuICAgICAgICAgICAgc3RhdGljUGFyYW1zID0gb3B0dGlvbnMuc3RhdGljUGFyYW1zW3N0YXRpY1BhcmFtc0luZGV4XTtcblxuICAgICAgICBpZiAoIXRoaXMuaGlkZGVucykge1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlUGFyYW1Db250YWluZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goc3ViUXVlcnlWYWx1ZXMsIGZ1bmN0aW9uKHZhbHVlLCBpZHgpIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBzdWJRdWVyeUtleXNbaWR4XTtcbiAgICAgICAgICAgIHRoaXMuaGlkZGVucy5hcHBlbmQoJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiJyArIGtleSArICdcIiB2YWx1ZT1cIicgKyB2YWx1ZSArICdcIiAvPicpKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5fY3JlYXRlU3RhdGljUGFyYW1zKHN0YXRpY1BhcmFtcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBzdGF0aWMgcGFyYW1ldGVyc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0aWNQYXJhbXMgU3RhdGljIHBhcmFtZXRlcnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jcmVhdGVTdGF0aWNQYXJhbXM6IGZ1bmN0aW9uKHN0YXRpY1BhcmFtcykge1xuICAgICAgICBpZiAoIXN0YXRpY1BhcmFtcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGljUGFyYW1zID0gc3RhdGljUGFyYW1zLnNwbGl0KCcsJyk7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goc3RhdGljUGFyYW1zLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHZhbCA9IHZhbHVlLnNwbGl0KCc9Jyk7XG4gICAgICAgICAgICB0aGlzLmhpZGRlbnMuYXBwZW5kKCQoJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cIicgKyB2YWxbMF0gKyAnXCIgdmFsdWU9XCInICsgdmFsWzFdICsgJ1wiIC8+JykpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHdyYXBwZXIgdGhhdCBiZWNvbWUgY29udGFpbmVyIG9mIGhpZGRlbiBlbGVtZW50cy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jcmVhdGVQYXJhbUNvbnRhaW5lcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuaGlkZGVucyA9ICQoJzxkaXYgY2xhc3M9XCJoaWRkZW4taW5wdXRzXCI+PC9kaXY+JylcbiAgICAgICAgICAgIC5oaWRlKClcbiAgICAgICAgICAgIC5hcHBlbmRUbyh0aGlzLiRmb3JtRWxlbWVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSB0b2dnbGUgYnV0dG9uIGltYWdlLlxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNVc2Ug7J6Q64+Z7JmE7ISxIOyCrOyaqSDsl6zrtoBcbiAgICAgKi9cbiAgICBzZXRUb2dnbGVCdG5JbWc6IGZ1bmN0aW9uKGlzVXNlKSB7XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnRvZ2dsZUltZyB8fCAhdGhpcy4kdG9nZ2xlQnRuIHx8ICF0aGlzLiR0b2dnbGVCdG4ubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNVc2UpIHtcbiAgICAgICAgICAgIHRoaXMuJHRvZ2dsZUJ0bi5hdHRyKCdzcmMnLCB0aGlzLm9wdGlvbnMudG9nZ2xlSW1nLm9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJHRvZ2dsZUJ0bi5hdHRyKCdzcmMnLCB0aGlzLm9wdGlvbnMudG9nZ2xlSW1nLm9mZik7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgYmluZGluZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kc2VhcmNoQm94Lm9uKHtcbiAgICAgICAgICAgIGZvY3VzOiAkLnByb3h5KHRoaXMuX29uRm9jdXMsIHRoaXMpLFxuICAgICAgICAgICAgYmx1cjogJC5wcm94eSh0aGlzLl9vbkJsdXIsIHRoaXMpLFxuICAgICAgICAgICAga2V5dXA6ICQucHJveHkodGhpcy5fb25LZXlVcCwgdGhpcyksXG4gICAgICAgICAgICBrZXlkb3duOiAkLnByb3h5KHRoaXMuX29uS2V5RG93biwgdGhpcyksXG4gICAgICAgICAgICBjbGljazogJC5wcm94eSh0aGlzLmNsaWNrLCB0aGlzKVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy4kdG9nZ2xlQnRuICYmIHRoaXMuJHRvZ2dsZUJ0bi5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuJHRvZ2dsZUJ0bi5vbignY2xpY2snLCAkLnByb3h5KHRoaXMuX29uQ2xpY2tUb2dnbGUsIHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTYXZlIHVzZXIgcXVlcnkgaW50byBoaWRkZW4gZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgdHlwZWQgYnkgdXNlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldE9yZ1F1ZXJ5OiBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgdGhpcy4kb3JnUXVlcnkudmFsKHN0cik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIElucHV0IGVsZW1lbnQgb25jbGljayBldmVudCBoYW5kbGVyXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gRmFsc2UgaWYgbm8gaW5wdXQta2V5d29yZCBvciBub3QgdXNlIGF1dG8tY29tcGxldGVcbiAgICAgKi9cbiAgICBfb25DbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8v7J6F66Cl65CcIO2CpOybjOuTnOqwgCDsl4bqsbDrgpgg7J6Q64+Z7JmE7ISxIOq4sOuKpSDsgqzsmqntlZjsp4Ag7JWK7Jy866m0IO2OvOy5oCDtlYTsmpQg7JeG7Jy866+A66GcIOq3uOuDpSDrpqzthLTtlZjqs6Ag64GdLlxuICAgICAgICBpZiAoIXRoaXMuYXV0b0NvbXBsZXRlT2JqLmdldFZhbHVlKCkgfHxcbiAgICAgICAgICAgICF0aGlzLmF1dG9Db21wbGV0ZU9iai5pc1VzZUF1dG9Db21wbGV0ZSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5hdXRvQ29tcGxldGVPYmouaXNTaG93UmVzdWx0TGlzdCgpKSB7XG4gICAgICAgICAgICAvL+qysOqzvCDrpqzsiqTtirgg7JiB7Jet7J20IHNob3cg7IOB7YOc7J2066m0KGlzUmVzdWx0U2hvd2luZz09dHJ1ZSkg6rKw6rO8IOumrOyKpO2KuCBoaWRlIOyalOyyrVxuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouaGlkZVJlc3VsdExpc3QoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8v6rKw6rO8IOumrOyKpO2KuCDsmIHsl63snbQgaGlkZSDsg4Htg5zsnbTrqbQoaXNSZXN1bHRTaG93aW5nPT1mYWxzZSkg6rKw6rO8IOumrOyKpO2KuCBzaG93IOyalOyyrVxuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouc2hvd1Jlc3VsdExpc3QoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5wdXQgZWxlbWVudCBmb2N1cyBldmVudCBoYW5kbGVyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25Gb2N1czogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vc2V0SW50ZXJ2YWwg7ISk7KCV7ZW07IScIOydvOyglSDsi5zqsIQg7KO86riw66GcIF9vbldhdGNoIO2VqOyImOulvCDsi6TtlontlZzri6QuXG4gICAgICAgIHRoaXMuaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKCQucHJveHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLl9vbldhdGNoKCk7XG4gICAgICAgIH0sIHRoaXMpLCB0aGlzLm9wdGlvbnMud2F0Y2hJbnRlcnZhbCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJvb3AgZm9yIGNoZWNrIHVwZGF0ZSBpbnB1dCBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25XYXRjaDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWFyY2hib3hWYWx1ZSA9IHRoaXMuJHNlYXJjaEJveC52YWwoKTtcblxuICAgICAgICBpZiAoIXNlYXJjaGJveFZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9zZXRPcmdRdWVyeSgnJyk7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5zZXRNb3ZlZChmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5pbnB1dFZhbHVlICE9PSBzZWFyY2hib3hWYWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5pbnB1dFZhbHVlID0gc2VhcmNoYm94VmFsdWU7XG4gICAgICAgICAgICB0aGlzLl9vbkNoYW5nZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmF1dG9Db21wbGV0ZU9iai5nZXRNb3ZlZCgpKSB7XG4gICAgICAgICAgICB0aGlzLl9zZXRPcmdRdWVyeShzZWFyY2hib3hWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5wdXQgZWxlbWVudCBrZXl1cCBldmVudCBoYW5kbGVyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25LZXlVcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWFyY2hCb3hWYWx1ZSA9IHRoaXMuJHNlYXJjaEJveC52YWwoKTtcblxuICAgICAgICBpZiAodGhpcy5pbnB1dFZhbHVlICE9PSBzZWFyY2hCb3hWYWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5pbnB1dFZhbHVlID0gc2VhcmNoQm94VmFsdWU7XG4gICAgICAgICAgICB0aGlzLl9vbkNoYW5nZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIElucHV0IGVsZW1lbnQgb25jaGFuZ2UgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFjT2JqID0gdGhpcy5hdXRvQ29tcGxldGVPYmo7XG4gICAgICAgIGlmICghYWNPYmouaXNVc2VBdXRvQ29tcGxldGUoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFjT2JqLmlzSWRsZSkge1xuICAgICAgICAgICAgYWNPYmouaXNJZGxlID0gZmFsc2U7XG4gICAgICAgICAgICBhY09iai5yZXF1ZXN0KHRoaXMuJHNlYXJjaEJveC52YWwoKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhY09iai5yZWFkeVZhbHVlID0gdGhpcy4kc2VhcmNoQm94LnZhbCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIElucHV0IGVsZW1lbnQgYmx1ciBldmVudCBoYW5kbGVyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25CbHVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSWQpO1xuICAgICAgICB0aGlzLmludGVydmFsSWQgPSBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnB1dCBlbGVtZW50IGtleWRvd24gZXZlbnQgaGFuZGxlclxuICAgICAqIFNldCBhY3Rpbm8gYnkgaW5wdXQgdmFsdWVcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBrZXlEb3duIEV2ZW50IGluc3RhbmNlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICAvKmVzbGludC1kaXNhYmxlIGNvbXBsZXhpdHkqL1xuICAgIF9vbktleURvd246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciBhY09iaiA9IHRoaXMuYXV0b0NvbXBsZXRlT2JqLFxuICAgICAgICAgICAgZmxvdywgY29kZU1hcCwgZmxvd01hcDtcblxuICAgICAgICBpZiAoIWFjT2JqLmlzVXNlQXV0b0NvbXBsZXRlKCkgfHwgIWFjT2JqLmlzU2hvd1Jlc3VsdExpc3QoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29kZU1hcCA9IHRoaXMua2V5Q29kZU1hcDtcbiAgICAgICAgZmxvd01hcCA9IGFjT2JqLmZsb3dNYXA7XG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgICAgICAgY2FzZSBjb2RlTWFwLlRBQjpcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGZsb3cgPSBldmVudC5zaGlmdEtleSA/IGZsb3dNYXAuTkVYVCA6IGZsb3dNYXAuUFJFVjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgY29kZU1hcC5ET1dOX0FSUk9XOlxuICAgICAgICAgICAgICAgIGZsb3cgPSBmbG93TWFwLk5FWFQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNvZGVNYXAuVVBfQVJST1c6XG4gICAgICAgICAgICAgICAgZmxvdyA9IGZsb3dNYXAuUFJFVjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGFjT2JqLm1vdmVOZXh0TGlzdChmbG93KTtcbiAgICB9LFxuICAgIC8qZXNsaW50LWVuYWJsZSBjb21wbGV4aXR5Ki9cblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBidXR0b24gY2xpY2sgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ2xpY2tUb2dnbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuYXV0b0NvbXBsZXRlT2JqLmlzVXNlQXV0b0NvbXBsZXRlKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0VG9nZ2xlQnRuSW1nKHRydWUpO1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouc2V0Q29va2llVmFsdWUodHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5jaGFuZ2VPbk9mZlRleHQoZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouaGlkZVJlc3VsdExpc3QoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0VG9nZ2xlQnRuSW1nKGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnNldENvb2tpZVZhbHVlKGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLmNoYW5nZU9uT2ZmVGV4dCh0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IElucHV0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJlc3VsdCBpcyBraW5kIG9mIG1hbmFnaW5nIG1vZHVsZSB0byBkcmF3IGF1dG8gY29tcGxldGUgcmVzdWx0IGxpc3QgZnJvbSBzZXJ2ZXIgYW5kIGFwcGx5IHRlbXBsYXRlLlxuICogQHZlcnNpb24gMS4xLjBcbiAqIEBhdXRob3IgIE5ITiBlbnRlcnRhaW5tZW50IEZFIGRldiB0ZWFtPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xudmFyIERFRkFVTFRfVklFV19DT1VOVCA9IDEwLFxuICAgIGlzRW1wdHkgPSB0dWkudXRpbC5pc0VtcHR5LFxuICAgIG1hcCA9IHR1aS51dGlsLm1hcCxcbiAgICBTUEVDSUFMX0NIQVJBQ1RFUlNfUkUgPSAvW1xcXFxeJC4qKz8oKVtcXF17fXxdLyxcbiAgICBXSElURV9TUEFDRVNfUkVfRyA9ICcvXFxzKy9nJyxcbiAgICBXSElURV9TUEFDRVMgPSAnW1xcXFxzXSonO1xuXG4vKipcbiAqIFVuaXQgb2YgYXV0byBjb21wbGV0ZSB0aGF0IGJlbG9uZyB3aXRoIHNlYXJjaCByZXN1bHQgbGlzdC5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgUmVzdWx0ID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBSZXN1bHQucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKGF1dG9Db21wbGV0ZU9iaiwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iaiA9IGF1dG9Db21wbGV0ZU9iajtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcblxuICAgICAgICB0aGlzLiRyZXN1bHRMaXN0ID0gb3B0aW9ucy5yZXN1bHRMaXN0RWxlbWVudDtcbiAgICAgICAgdGhpcy52aWV3Q291bnQgPSBvcHRpb25zLnZpZXdDb3VudCB8fCBERUZBVUxUX1ZJRVdfQ09VTlQ7XG4gICAgICAgIHRoaXMuJG9uT2ZmVHh0ID0gb3B0aW9ucy5vbm9mZlRleHRFbGVtZW50O1xuICAgICAgICB0aGlzLm1vdXNlT3ZlckNsYXNzID0gb3B0aW9ucy5tb3VzZU92ZXJDbGFzcztcbiAgICAgICAgdGhpcy5mbG93TWFwID0gYXV0b0NvbXBsZXRlT2JqLmZsb3dNYXA7XG5cbiAgICAgICAgdGhpcy5fYXR0YWNoRXZlbnQoKTtcblxuICAgICAgICB0aGlzLiRzZWxlY3RlZEVsZW1lbnQgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuaXNNb3ZlZCA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEZWxldGUgbGFzdCByZXN1bHQgbGlzdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2RlbGV0ZUJlZm9yZUVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLiRyZXN1bHRMaXN0XG4gICAgICAgICAgICAuaGlkZSgpXG4gICAgICAgICAgICAuaHRtbCgnJyk7XG4gICAgICAgIHRoaXMuJHNlbGVjdGVkRWxlbWVudCA9IG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERyYXcgcmVzdWx0IGZvcm0gYXBpIHNlcnZlclxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGRhdGFBcnIgUmVzdWx0IGRhdGFcbiAgICAgKi9cbiAgICBkcmF3OiBmdW5jdGlvbihkYXRhQXJyKSB7XG4gICAgICAgIHZhciBsZW4gPSBkYXRhQXJyLmxlbmd0aDtcblxuICAgICAgICB0aGlzLl9kZWxldGVCZWZvcmVFbGVtZW50KCk7XG4gICAgICAgIGlmIChsZW4gPCAxKSB7XG4gICAgICAgICAgICB0aGlzLl9oaWRlQm90dG9tQXJlYSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbWFrZVJlc3VsdExpc3QoZGF0YUFyciwgbGVuKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNob3dSZXN1bHRMaXN0KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1ha2Ugc2VhcmNoIHJlc3VsdCBsaXN0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBkYXRhQXJyIC0gRGF0YSBhcnJheVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsZW4gLSBMZW5ndGggb2YgZGF0YUFycmF5XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVJlc3VsdExpc3Q6IGZ1bmN0aW9uKGRhdGFBcnIsIGxlbikge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSB0aGlzLm9wdGlvbnMudGVtcGxhdGUsXG4gICAgICAgICAgICBsaXN0Q29uZmlnID0gdGhpcy5vcHRpb25zLmxpc3RDb25maWcsXG4gICAgICAgICAgICB1c2VUaXRsZSA9ICh0aGlzLm9wdGlvbnMudXNlVGl0bGUgJiYgISF0ZW1wbGF0ZS50aXRsZSksXG4gICAgICAgICAgICB0bXBsLCBpbmRleCwgdG1wbFZhbHVlLCBpLCBkYXRhO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgICAgICAgICAgZGF0YSA9IGRhdGFBcnJbaV07XG4gICAgICAgICAgICBpbmRleCA9IGRhdGEuaW5kZXg7XG4gICAgICAgICAgICB0bXBsID0gbGlzdENvbmZpZ1tpbmRleF0gPyB0ZW1wbGF0ZVtsaXN0Q29uZmlnW2luZGV4XS50ZW1wbGF0ZV0gOiB0ZW1wbGF0ZS5kZWZhdWx0cztcblxuICAgICAgICAgICAgaWYgKGRhdGEudHlwZSA9PT0gJ3RpdGxlJykge1xuICAgICAgICAgICAgICAgIHRtcGwgPSB0ZW1wbGF0ZS50aXRsZTtcbiAgICAgICAgICAgICAgICBpZiAoIXVzZVRpdGxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRtcGxWYWx1ZSA9IHRoaXMuX2dldFRtcGxEYXRhKHRtcGwuYXR0ciwgZGF0YSk7XG4gICAgICAgICAgICAkKHRoaXMuX2FwcGx5VGVtcGxhdGUodG1wbC5lbGVtZW50LCB0bXBsVmFsdWUpKVxuICAgICAgICAgICAgICAgIC5kYXRhKHtcbiAgICAgICAgICAgICAgICAgICAgJ3BhcmFtcyc6IHRtcGxWYWx1ZS5wYXJhbXMsXG4gICAgICAgICAgICAgICAgICAgICdpbmRleCc6IGluZGV4XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuYXBwZW5kVG8odGhpcy4kcmVzdWx0TGlzdCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWFrZSB0ZW1wbGF0ZSBkYXRhXG4gICAgICogQHBhcmFtIHtBcnJheX0gYXR0cnMgVGVtcGxhdGUgYXR0cmlidXRlc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfE9iamVjdH0gZGF0YSBUaGUgZGF0YSB0byBtYWtlIHRlbXBsYXRlXG4gICAgICogQHJldHVybnMge09iamVjdH0gVGVtcGxhdGUgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFRtcGxEYXRhOiBmdW5jdGlvbihhdHRycywgZGF0YSkge1xuICAgICAgICB2YXIgdG1wbFZhbHVlID0ge30sXG4gICAgICAgICAgICB2YWx1ZXMgPSBkYXRhLnZhbHVlcyB8fCBudWxsO1xuXG4gICAgICAgIGlmICh0dWkudXRpbC5pc1N0cmluZyhkYXRhKSkge1xuICAgICAgICAgICAgdG1wbFZhbHVlW2F0dHJzWzBdXSA9IGRhdGE7XG4gICAgICAgICAgICByZXR1cm4gdG1wbFZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChhdHRycywgZnVuY3Rpb24oYXR0ciwgaWR4KSB7XG4gICAgICAgICAgICB0bXBsVmFsdWVbYXR0cl0gPSB2YWx1ZXNbaWR4XTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGF0dHJzLmxlbmd0aCA8IHZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRtcGxWYWx1ZS5wYXJhbXMgPSB2YWx1ZXMuc2xpY2UoYXR0cnMubGVuZ3RoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0bXBsVmFsdWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB3aGV0aGVyIHJlc3VsdCBsaXN0IHNob3cgb3Igbm90XG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAgICovXG4gICAgaXNTaG93UmVzdWx0TGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRyZXN1bHRMaXN0LmNzcygnZGlzcGxheScpID09PSAnYmxvY2snO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIHJlc3VsdCBsaXN0IGFyZWFcbiAgICAgKi9cbiAgICBoaWRlUmVzdWx0TGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJHJlc3VsdExpc3QuaGlkZSgpO1xuICAgICAgICB0aGlzLl9oaWRlQm90dG9tQXJlYSgpO1xuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5pc0lkbGUgPSB0cnVlO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaXJlZCB3aGVuIGhpZGUgdGhlIHJlc3VsdCBsaXN0XG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IEF1dG9Db21wbGV0ZSNjbG9zZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouZmlyZSgnY2xvc2UnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyByZXN1bHQgbGlzdCBhcmVhXG4gICAgICovXG4gICAgc2hvd1Jlc3VsdExpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLiRyZXN1bHRMaXN0LnNob3coKTtcbiAgICAgICAgdGhpcy5fc2hvd0JvdHRvbUFyZWEoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTW92ZSBmb2N1cyB0byBuZXh0IGl0ZW0sIGNoYW5nZSBpbnB1dCBlbGVtZW50IHZhbHVlIGFzIGZvY3VzIHZhbHVlLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmbG93IERpcmVjdGlvbiBieSBrZXkgY29kZVxuICAgICAqL1xuICAgIG1vdmVOZXh0TGlzdDogZnVuY3Rpb24oZmxvdykge1xuICAgICAgICB2YXIgZmxvd01hcCA9IHRoaXMuZmxvd01hcCxcbiAgICAgICAgICAgICRzZWxlY3RFbCA9IHRoaXMuJHNlbGVjdGVkRWxlbWVudCxcbiAgICAgICAgICAgIGdldE5leHQgPSAoZmxvdyA9PT0gZmxvd01hcC5ORVhUKSA/IHRoaXMuX2dldE5leHQgOiB0aGlzLl9nZXRQcmV2LFxuICAgICAgICAgICAgZ2V0Qm91bmQgPSAoZmxvdyA9PT0gZmxvd01hcC5ORVhUKSA/IHRoaXMuX2dldEZpcnN0IDogdGhpcy5fZ2V0TGFzdCxcbiAgICAgICAgICAgIGtleXdvcmQ7XG5cbiAgICAgICAgdGhpcy5pc01vdmVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKGlzRW1wdHkoJHNlbGVjdEVsKSkge1xuICAgICAgICAgICAgJHNlbGVjdEVsID0gdGhpcy4kc2VsZWN0ZWRFbGVtZW50ID0gZ2V0Qm91bmQuY2FsbCh0aGlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRzZWxlY3RFbC5yZW1vdmVDbGFzcyh0aGlzLm1vdXNlT3ZlckNsYXNzKTtcbiAgICAgICAgICAgICRzZWxlY3RFbCA9IHRoaXMuJHNlbGVjdGVkRWxlbWVudCA9IGdldE5leHQuY2FsbCh0aGlzLCAkc2VsZWN0RWwpO1xuICAgICAgICB9XG5cbiAgICAgICAga2V5d29yZCA9ICRzZWxlY3RFbC5maW5kKCcua2V5d29yZC1maWVsZCcpLnRleHQoKTtcbiAgICAgICAgaWYgKGtleXdvcmQpIHtcbiAgICAgICAgICAgICRzZWxlY3RFbC5hZGRDbGFzcyh0aGlzLm1vdXNlT3ZlckNsYXNzKTtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnNldFZhbHVlKGtleXdvcmQpO1xuICAgICAgICAgICAgdGhpcy5fc2V0U3VibWl0T3B0aW9uKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm1vdmVOZXh0TGlzdChmbG93KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFnZSB0ZXh0IGJ5IHdoZXRoZXIgYXV0byBjb21wbGV0ZSB1c2Ugb3Igbm90XG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpc1VzZSBvbi9vZmYg7Jes67aAXG4gICAgICovXG4gICAgY2hhbmdlT25PZmZUZXh0OiBmdW5jdGlvbihpc1VzZSkge1xuICAgICAgICBpZiAoaXNVc2UpIHtcbiAgICAgICAgICAgIHRoaXMuJG9uT2ZmVHh0LnRleHQoJ+yekOuPmeyZhOyEsSDsvJzquLAnKTtcbiAgICAgICAgICAgIHRoaXMuaGlkZVJlc3VsdExpc3QoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJG9uT2ZmVHh0LnRleHQoJ+yekOuPmeyZhOyEsSDrgYTquLAnKTtcbiAgICAgICAgfVxuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBhdXRvIGNvbXBsZXRlIGV2ZW50IGJlbG9uZ3Mgd2l0aCByZXN1bHQgbGlzdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kcmVzdWx0TGlzdC5vbih7XG4gICAgICAgICAgICBtb3VzZW92ZXI6ICQucHJveHkodGhpcy5fb25Nb3VzZU92ZXIsIHRoaXMpLFxuICAgICAgICAgICAgY2xpY2s6ICQucHJveHkodGhpcy5fb25DbGljaywgdGhpcylcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHRoaXMuJG9uT2ZmVHh0KSB7XG4gICAgICAgICAgICB0aGlzLiRvbk9mZlR4dC5vbignY2xpY2snLCAkLnByb3h5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3VzZUF1dG9Db21wbGV0ZSgpO1xuICAgICAgICAgICAgfSwgdGhpcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJC5wcm94eShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuaGlkZVJlc3VsdExpc3QoKTtcbiAgICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWdobGlnaHQga2V5IHdvcmRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdG1wbFN0ciBUZW1wbGF0ZSBzdHJpbmdcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YU9iaiBSZXBsYWNlIHN0cmluZyBtYXBcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FwcGx5VGVtcGxhdGU6IGZ1bmN0aW9uKHRtcGxTdHIsIGRhdGFPYmopIHtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChkYXRhT2JqLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnc3ViamVjdCcpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMuX2hpZ2hsaWdodCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0bXBsU3RyID0gdG1wbFN0ci5yZXBsYWNlKG5ldyBSZWdFeHAoJ0AnICsga2V5ICsgJ0AnLCAnZycpLCB2YWx1ZSk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiB0bXBsU3RyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gYXBwbGllZCBoaWdobGlnaHQgZWZmZWN0IGtleSB3b3JkXG4gICAgICogKHRleHQ6IE5pa2UgYWlyICAvICBxdWVyeSA6IFtOaWtlXSAvIFJlc3VsdCA6IDxzdHJvbmc+TmlrZSA8L3N0cm9uZz5haXJcbiAgICAgKiB0ZXh0IDogJ3JoZGlkZGzsmYAg6rOg7JaR7J20JyAvIHF1ZXJ5IDogIFtyaGRpZGRsLCDqs6DslpHsnbRdIC8g66as7YS06rKw6rO8IDxzdHJvbmc+cmhkaWRkbDwvc3Ryb25nPuyZgCA8c3Ryb25nPuqzoOyWkeydtDwvc3Ryb25nPlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0IElucHV0IHN0cmluZ1xuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaGlnaGxpZ2h0OiBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgIHZhciBxdWVyaWVzID0gdGhpcy5hdXRvQ29tcGxldGVPYmoucXVlcmllcyxcbiAgICAgICAgICAgIHJldHVyblN0cjtcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHF1ZXJpZXMsIGZ1bmN0aW9uKHF1ZXJ5KSB7XG4gICAgICAgICAgICBpZiAoIXJldHVyblN0cikge1xuICAgICAgICAgICAgICAgIHJldHVyblN0ciA9IHRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm5TdHIgPSB0aGlzLl9tYWtlU3Ryb25nKHJldHVyblN0ciwgcXVlcnkpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIHJldHVyblN0ciB8fCB0ZXh0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb250YWluIHRleHQgYnkgc3Ryb25nIHRhZ1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0IFJlY29tbWVuZCBzZWFyY2ggZGF0YSAg7LaU7LKc6rKA7IOJ7Ja0IOuNsOydtO2EsFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBxdWVyeSBJbnB1dCBrZXl3b3JkXG4gICAgICogQHJldHVybnMge1N0cmluZ31cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU3Ryb25nOiBmdW5jdGlvbih0ZXh0LCBxdWVyeSkge1xuICAgICAgICB2YXIgdG1wQXJyLCByZWdRdWVyeTtcblxuICAgICAgICBpZiAoIXF1ZXJ5IHx8IHF1ZXJ5Lmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgdG1wQXJyID0gcXVlcnkucmVwbGFjZShXSElURV9TUEFDRVNfUkVfRywgJycpLnNwbGl0KCcnKTtcbiAgICAgICAgdG1wQXJyID0gbWFwKHRtcEFyciwgZnVuY3Rpb24oY2hhcikge1xuICAgICAgICAgICAgaWYgKFNQRUNJQUxfQ0hBUkFDVEVSU19SRS50ZXN0KGNoYXIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdcXFxcJyArIGNoYXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY2hhcjtcbiAgICAgICAgfSk7XG4gICAgICAgIHJlZ1F1ZXJ5ID0gbmV3IFJlZ0V4cCh0bXBBcnIuam9pbihXSElURV9TUEFDRVMpLCAnZ2knKTtcblxuICAgICAgICByZXR1cm4gdGV4dC5yZXBsYWNlKHJlZ1F1ZXJ5LCBmdW5jdGlvbihtYXRjaCkge1xuICAgICAgICAgICAgcmV0dXJuICc8c3Ryb25nPicgKyBtYXRjaCArICc8L3N0cm9uZz4nO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBmaXJzdCByZXN1bHQgaXRlbVxuICAgICAqIEByZXR1cm5zIHtqUXVlcnl9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Rmlyc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3JkZXJTdGFnZSh0aGlzLmZsb3dNYXAuRklSU1QpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIGxhc3QgcmVzdWx0IGl0ZW1cbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldExhc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3JkZXJTdGFnZSh0aGlzLmZsb3dNYXAuTEFTVCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB3aGV0aGVyIGZpcnN0IG9yIGxhc3RcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBGaXJzdC9lbmQgZWxlbWVudCB0eXBlXG4gICAgICogQHJldHVybnMge2pRdWVyeXxudWxsfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29yZGVyU3RhZ2U6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgdmFyICRjaGlsZHJlbiA9IHRoaXMuJHJlc3VsdExpc3QuY2hpbGRyZW4oKTtcblxuICAgICAgICB0eXBlID0gKHR5cGUgPT09IHRoaXMuZmxvd01hcC5GSVJTVCkgPyAnZmlyc3QnIDogJ2xhc3QnO1xuICAgICAgICByZXR1cm4gJGNoaWxkcmVuW3R5cGVdKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBuZXh0IGVsZW1lbnQgZnJvbSBzZWxlY3RlZCBlbGVtZW50XG4gICAgICogSWYgbmV4dCBlbGVtZW50IGlzIG5vdCBleGlzdCwgcmV0dXJuIGZpcnN0IGVsZW1lbnQuXG4gICAgICogQHBhcmFtIHtqUXVlcnl9ICRlbCBmb2N1c2VkIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldE5leHQ6IGZ1bmN0aW9uKCRlbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3JkZXJFbGVtZW50KHRoaXMuZmxvd01hcC5ORVhULCAkZWwpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gcHJldmlvdXMgZWxlbWVudCBmcm9tIHNlbGVjdGVkIGVsZW1lbnRcbiAgICAgKiBJZiBwcmV2aW91cyBlbGVtZW50IGlzIG5vdCBleGlzdCwgcmV0dXJuIHRoZSBsYXN0IGVsZW1lbnQuXG4gICAgICogQHBhcmFtIHtqUXVlcnl9ICRlbCBmb2N1c2VkIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFByZXY6IGZ1bmN0aW9uKCRlbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3JkZXJFbGVtZW50KHRoaXMuZmxvd01hcC5QUkVWLCAkZWwpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gcHJldmlvdXMgb3IgbmV4dCBlbGVtZW50IGJ5IGRpcmVjdGlvbi5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBUaGUgZGlyZWN0aW9uIHR5cGUgZm9yIGZpbmRpbmcgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWwgZm9jdXNlZCBlbGVtZW50XG4gICAgICogQHJldHVybnMge2pRdWVyeX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vcmRlckVsZW1lbnQ6IGZ1bmN0aW9uKHR5cGUsICRlbCkge1xuICAgICAgICB2YXIgJG9yZGVyO1xuXG4gICAgICAgIGlmICh0eXBlID09PSB0aGlzLmZsb3dNYXAuTkVYVCkge1xuICAgICAgICAgICAgJG9yZGVyID0gJGVsLm5leHQoKTtcbiAgICAgICAgICAgIHJldHVybiAkb3JkZXIubGVuZ3RoID8gJG9yZGVyIDogdGhpcy5fZ2V0Rmlyc3QoKTtcbiAgICAgICAgfVxuICAgICAgICAkb3JkZXIgPSAkZWwucHJldigpO1xuICAgICAgICByZXR1cm4gJG9yZGVyLmxlbmd0aCA/ICRvcmRlciA6IHRoaXMuX2dldExhc3QoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHdoZXRoZXIgYXV0byBjb21wbGV0ZSB1c2Ugb3Igbm90IGFuZCBjaGFuZ2Ugc3dpdGNoJ3Mgc3RhdGUuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfdXNlQXV0b0NvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGlzVXNlID0gdGhpcy5hdXRvQ29tcGxldGVPYmouaXNVc2VBdXRvQ29tcGxldGUoKTtcbiAgICAgICAgdGhpcy5jaGFuZ2VPbk9mZlRleHQoaXNVc2UpO1xuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5zZXRDb29raWVWYWx1ZSghaXNVc2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IGF1dG8gY29tcGxldGUgc3dpdGNoIGFyZWFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zaG93Qm90dG9tQXJlYTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLiRvbk9mZlR4dCkge1xuICAgICAgICAgICAgdGhpcy4kb25PZmZUeHQuc2hvdygpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgYXV0byBjb21wbGV0ZSBzd2l0Y2ggYXJlYVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2hpZGVCb3R0b21BcmVhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuJG9uT2ZmVHh0KSB7XG4gICAgICAgICAgICB0aGlzLiRvbk9mZlR4dC5oaWRlKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hhbmdlIGFjdGlvbiBhdHRyaWJ1dGUgb2YgZm9ybSBlbGVtZW50IGFuZCBzZXQgYWRkaXRpb24gdmFsdWVzIGluIGhpZGRlbiB0eXBlIGVsZW1lbnRzLlxuICAgICAqIChDYWxsZWQgd2hlbiBjbGljayB0aGUgPGxpPilcbiAgICAgKiBAcGFyYW0ge2VsZW1lbnR9IFskdGFyZ2V0XSBTdWJtaXQgb3B0aW9ucyB0YXJnZXRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICovXG4gICAgX3NldFN1Ym1pdE9wdGlvbjogZnVuY3Rpb24oJHRhcmdldCkge1xuICAgICAgICB2YXIgJHNlbGVjdEZpZWxkID0gJHRhcmdldCA/ICQoJHRhcmdldCkuY2xvc2VzdCgnbGknKSA6IHRoaXMuJHNlbGVjdGVkRWxlbWVudCxcbiAgICAgICAgICAgIHBhcmFtc1N0cmluZyA9ICRzZWxlY3RGaWVsZC5kYXRhKCdwYXJhbXMnKSxcbiAgICAgICAgICAgIGluZGV4ID0gJHNlbGVjdEZpZWxkLmRhdGEoJ2luZGV4JyksXG4gICAgICAgICAgICBjb25maWcgPSB0aGlzLm9wdGlvbnMubGlzdENvbmZpZ1tpbmRleF0sXG4gICAgICAgICAgICBhY3Rpb24gPSB0aGlzLm9wdGlvbnMuYWN0aW9uc1tjb25maWcuYWN0aW9uXSxcbiAgICAgICAgICAgICRmb3JtRWxlbWVudCA9IHRoaXMub3B0aW9ucy5mb3JtRWxlbWVudDtcblxuICAgICAgICAkZm9ybUVsZW1lbnQuYXR0cignYWN0aW9uJywgYWN0aW9uKTtcbiAgICAgICAgdGhpcy5fY2xlYXJTdWJtaXRPcHRpb24oKTtcbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouc2V0UGFyYW1zKHBhcmFtc1N0cmluZywgaW5kZXgpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaXJlZCB3aGVuIHRoZSB1c2VyJ3Mgc2VsZWN0ZWQgZWxlbWVudCBpbiByZXN1bHQgbGlzdCBpcyBjaGFuZ2VkXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IEF1dG9Db21wbGV0ZSNjaGFuZ2VcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSBEYXRhIGZvciBzdWJtaXRcbiAgICAgICAgICogIEBwYXJhbSB7c3RyaW5nfSBkYXRhLmluZGV4IC0gSW5kZXggb2YgY29sbGVjdGlvblxuICAgICAgICAgKiAgQHBhcmFtIHtzdHJpbmd9IGRhdGEuYWN0aW9uIC0gRm9ybSBhY3Rpb25cbiAgICAgICAgICogIEBwYXJhbSB7c3RyaW5nfSBkYXRhLnBhcmFtcyAtIFBhcmFtZXRlcnNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLmZpcmUoJ2NoYW5nZScsIHtcbiAgICAgICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgICAgIGFjdGlvbjogYWN0aW9uLFxuICAgICAgICAgICAgcGFyYW1zOiBwYXJhbXNTdHJpbmdcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlc2V0IGZvcm0gZWxlbWVudC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jbGVhclN1Ym1pdE9wdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkZm9ybUVsZW1lbnQgPSB0aGlzLm9wdGlvbnMuZm9ybUVsZW1lbnQ7XG5cbiAgICAgICAgJGZvcm1FbGVtZW50LmZpbmQoJy5oaWRkZW4taW5wdXRzJykuaHRtbCgnJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlc3VsdCBsaXN0IG1vdXNlb3ZlciBldmVudCBoYW5kbGVyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgRXZlbnQgaW5zdGFuc2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbk1vdXNlT3ZlcjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldCksXG4gICAgICAgICAgICAkYXJyID0gdGhpcy4kcmVzdWx0TGlzdC5maW5kKCdsaScpLFxuICAgICAgICAgICAgJHNlbGVjdGVkSXRlbSA9ICR0YXJnZXQuY2xvc2VzdCgnbGknKTtcblxuICAgICAgICAkYXJyLnJlbW92ZUNsYXNzKHRoaXMubW91c2VPdmVyQ2xhc3MpO1xuICAgICAgICBpZiAoJHNlbGVjdGVkSXRlbS5maW5kKCcua2V5d29yZC1maWVsZCcpLmxlbmd0aCkge1xuICAgICAgICAgICAgJHNlbGVjdGVkSXRlbS5hZGRDbGFzcyh0aGlzLm1vdXNlT3ZlckNsYXNzKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiRzZWxlY3RlZEVsZW1lbnQgPSAkdGFyZ2V0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXN1bHQgbGlzdCBjbGljayBldm5ldCBoYW5kbGVyXG4gICAgICogU3VibWl0IGZvcm0gZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBFdmVudCBpbnN0YW5zZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ2xpY2s6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpLFxuICAgICAgICAgICAgJGZvcm1FbGVtZW50ID0gdGhpcy5vcHRpb25zLmZvcm1FbGVtZW50LFxuICAgICAgICAgICAgJHNlbGVjdEZpZWxkID0gJHRhcmdldC5jbG9zZXN0KCdsaScpLFxuICAgICAgICAgICAgJGtleXdvcmRGaWVsZCA9ICRzZWxlY3RGaWVsZC5maW5kKCcua2V5d29yZC1maWVsZCcpLFxuICAgICAgICAgICAgc2VsZWN0ZWRLZXl3b3JkID0gJGtleXdvcmRGaWVsZC50ZXh0KCk7XG5cbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouc2V0VmFsdWUoc2VsZWN0ZWRLZXl3b3JkKTtcbiAgICAgICAgaWYgKHNlbGVjdGVkS2V5d29yZCkge1xuICAgICAgICAgICAgdGhpcy5fc2V0U3VibWl0T3B0aW9uKCR0YXJnZXQpO1xuICAgICAgICAgICAgJGZvcm1FbGVtZW50LnN1Ym1pdCgpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVzdWx0O1xuIl19
