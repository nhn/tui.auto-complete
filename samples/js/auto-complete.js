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
    SERACH_KEYWORD_IDENTIFIER = 'q',
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
            acObj = this.autoCompleteObj, keyDatas;

        if (!keyword || !rsKeyWrod) {
            acObj.hideResultList();
            return;
        }

        DEFAULT_PARAMS[SERACH_KEYWORD_IDENTIFIER] = keyword;
        $.ajax(this.options.searchUrl, {
            'dataType': 'jsonp',
            'jsonpCallback': CALLBACK_NAME,
            'data': $.extend(this.options.searchApi, DEFAULT_PARAMS),
            'type': 'get',
            'success': $.proxy(function(dataObj) {
                try {
                    keyDatas = this._getCollectionData(dataObj);
                    acObj.setQueries(dataObj.query);
                    acObj.setServerData(keyDatas);
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

        query = query.replace(WHITE_SPACES_RE_G, '');
        tmpArr = map(query, function(char) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9BdXRvQ29tcGxldGUuanMiLCJzcmMvanMvbWFuYWdlci9kYXRhLmpzIiwic3JjL2pzL21hbmFnZXIvaW5wdXQuanMiLCJzcmMvanMvbWFuYWdlci9yZXN1bHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0YUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInR1aS51dGlsLmRlZmluZU5hbWVzcGFjZSgndHVpLmNvbXBvbmVudC5BdXRvQ29tcGxldGUnLCByZXF1aXJlKCcuL3NyYy9qcy9BdXRvQ29tcGxldGUnKSk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQXV0byBjb21wbGV0ZSdzIENvcmUgZWxlbWVudC4gQWxsIG9mIGF1dG8gY29tcGxldGUgb2JqZWN0cyBiZWxvbmcgd2l0aCB0aGlzIG9iamVjdC5cbiAqIEB2ZXJzaW9uIDEuMS4wXG4gKiBAYXV0aG9yIE5ITiBFbnRlcnRhaW5tZW50IEZFIERldiBUZWFtLiA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIERhdGFNYW5hZ2VyID0gcmVxdWlyZSgnLi9tYW5hZ2VyL2RhdGEnKSxcbiAgICBJbnB1dE1hbmFnZXIgPSByZXF1aXJlKCcuL21hbmFnZXIvaW5wdXQnKSxcbiAgICBSZXN1bHRNYW5hZ2VyID0gcmVxdWlyZSgnLi9tYW5hZ2VyL3Jlc3VsdCcpO1xuXG52YXIgUkVRVUlSRURfRklFTERTID0gW1xuICAgICAgICAncmVzdWx0TGlzdEVsZW1lbnQnLFxuICAgICAgICAnc2VhcmNoQm94RWxlbWVudCcsXG4gICAgICAgICdvcmdRdWVyeUVsZW1lbnQnLFxuICAgICAgICAnZm9ybUVsZW1lbnQnLFxuICAgICAgICAnc3ViUXVlcnlTZXQnLFxuICAgICAgICAndGVtcGxhdGUnLFxuICAgICAgICAnbGlzdENvbmZpZycsXG4gICAgICAgICdhY3Rpb25zJyxcbiAgICAgICAgJ3NlYXJjaFVybCdcbiAgICBdLFxuICAgIERFRkFVTFRfQ09PS0lFX05BTUUgPSAnX2F0Y3BfdXNlX2Nvb2tpZScsXG4gICAgSVNfRUxFTUVOVF9PUFRJT05fUkVfSSA9IC9lbGVtZW50L2k7XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQGV4YW1wbGVcbiAqICB2YXIgYXV0b0NvbXBsZXRlT2JqID0gbmV3IG5lLmNvbXBvbmVudC5BdXRvQ29tcGxldGUoe1xuICogICAgIFwiY29uZmlnXCIgOiBcIkRlZmF1bHRcIiAgICAvLyBEYXRhc2V0IGluIGF1dG9Db25maWcuanNcbiAqICB9KTtcbiAqXG4gKiAgLy8gVGhlIGZvcm0gb2YgY29uZmlnIGZpbGUgXCJhdXRvQ29uZmlnLmpzXCJcbiAqICAvLyB2YXIgRGVmYXVsdCA9IHtcbiAqICAvLyAgICAgLy8gUmVzdWx0IGVsZW1lbnRcbiAqICAvLyAgICAgJ3Jlc3VsdExpc3RFbGVtZW50JzogJy5fcmVzdWx0Qm94JyxcbiAqICAvL1xuICogIC8vICAgICAvLyBJbnB1dCBlbGVtZW50XG4gKiAgLy8gICAgICdzZWFyY2hCb3hFbGVtZW50JzogICcjYWNfaW5wdXQxJyxcbiAqICAvL1xuICogIC8vICAgICAvLyBIaWRkZW4gZWxlbWVudCB0aGF0IGlzIGZvciB0aHJvd2luZyBxdWVyeSB0aGF0IHVzZXIgdHlwZS5cbiAqICAvLyAgICAgJ29yZ1F1ZXJ5RWxlbWVudCcgOiAnI29yZ19xdWVyeScsXG4gKiAgLy9cbiAqICAvLyAgICAgLy8gb24sb2ZmIEJ1dHRvbiBlbGVtZW50XG4gKiAgLy8gICAgICd0b2dnbGVCdG5FbGVtZW50JyA6IFwiI29ub2ZmQnRuXCIsXG4gKiAgLy9cbiAqICAvLyAgICAgLy8gb24sb2ZmIFN0YXRlIGVsZW1lbnRcbiAqICAvLyAgICAgJ29ub2ZmVGV4dEVsZW1lbnQnIDogXCIuYmFzZUJveCAuYm90dG9tXCIsXG4gKiAgLy9cbiAqICAvLyAgICAgLy8gb24sIG9mZiBTdGF0ZSBpbWFnZSBzb3VyY2VcbiAqICAvLyAgICAgJ3RvZ2dsZUltZycgOiB7XG4gKiAgLy8gICAgICAgICAnb24nIDogJy4uL2ltZy9idG5fb24uanBnJyxcbiAqICAvLyAgICAgICAgICdvZmYnIDogJy4uL2ltZy9idG5fb2ZmLmpwZydcbiAqICAvLyAgICAgfSxcbiAqICAvL1xuICogIC8vICAgICAvLyBDb2xsZWN0aW9uIGl0ZW1zIGVhY2ggY291bnQuXG4gKiAgLy8gICAgICd2aWV3Q291bnQnIDogMyxcbiAqICAvL1xuICogIC8vICAgICAvLyBLZXkgYXJyYXlzIChzdWIgcXVlcnkga2V5cycgYXJyYXkpXG4gKiAgLy8gICAgICdzdWJRdWVyeVNldCc6IFtcbiAqICAvLyAgICAgICAgIFsna2V5MScsICdrZXkyJywgJ2tleTMnXSxcbiAqICAvLyAgICAgICAgIFsnZGVwMScsICdkZXAyJywgJ2RlcDMnXSxcbiAqICAvLyAgICAgICAgIFsnY2gxJywgJ2NoMicsICdjaDMnXSxcbiAqICAvLyAgICAgICAgIFsnY2lkJ11cbiAqICAvLyAgICAgXSxcbiAqICAvL1xuICogIC8vICAgICAvLyBDb25maWcgZm9yIGF1dG8gY29tcGxldGUgbGlzdCBieSBpbmRleCBvZiBjb2xsZWN0aW9uXG4gKiAgLy8gICAgICdsaXN0Q29uZmlnJzoge1xuICogIC8vICAgICAgICAgJzAnOiB7XG4gKiAgLy8gICAgICAgICAgICAgJ3RlbXBsYXRlJzogJ2RlcGFydG1lbnQnLFxuICogIC8vICAgICAgICAgICAgICdzdWJRdWVyeVNldCcgOiAwLFxuICogIC8vICAgICAgICAgICAgICdhY3Rpb24nOiAwXG4gKiAgLy8gICAgICAgICB9LFxuICogIC8vICAgICAgICAgJzEnOiB7XG4gKiAgLy8gICAgICAgICAgICAgJ3RlbXBsYXRlJzogJ3NyY2hfaW5fZGVwYXJ0bWVudCcsXG4gKiAgLy8gICAgICAgICAgICAgJ3N1YlF1ZXJ5U2V0JyA6IDEsXG4gKiAgLy8gICAgICAgICAgICAgJ2FjdGlvbic6IDBcbiAqICAvLyAgICAgICAgIH0sXG4gKiAgLy8gICAgICAgICAnMic6IHtcbiAqICAvLyAgICAgICAgICAgICAndGVtcGxhdGUnOiAnc3JjaF9pbl9kZXBhcnRtZW50JyxcbiAqICAvLyAgICAgICAgICAgICAnc3ViUXVlcnlTZXQnIDogMixcbiAqICAvLyAgICAgICAgICAgICAnYWN0aW9uJzogMSxcbiAqICAvLyAgICAgICAgICAgICAnc3RhdGljUGFyYW1zJzogMFxuICogIC8vICAgICAgICAgfSxcbiAqICAvLyAgICAgICAgICczJzoge1xuICogIC8vICAgICAgICAgICAgICd0ZW1wbGF0ZSc6ICdkZXBhcnRtZW50JyxcbiAqICAvLyAgICAgICAgICAgICAnc3ViUXVlcnlTZXQnIDogMCxcbiAqICAvLyAgICAgICAgICAgICAnYWN0aW9uJzogMSxcbiAqICAvLyAgICAgICAgICAgICAnc3RhdGljUGFyYW1zJzogMVxuICogIC8vICAgICAgICAgfVxuICogIC8vICAgICB9LFxuICogIC8vXG4gKiAgLy8gICAgIC8vIE1hcmsgdXAgZm9yIGVhY2ggY29sbGVjdGlvbi4gKERlZmF1bHQgbWFya3VwIGlzIGRlZmF1bHRzLilcbiAqICAvLyAgICAgLy8gVGhpcyBtYXJrdXAgaGFzIHRvIGhhdmUgXCJrZXl3b2xkLWZpZWxkXCIgYnV0IHRpdGxlLlxuICogIC8vICAgICAndGVtcGxhdGUnOiB7XG4gKiAgLy8gICAgICAgICBkZXBhcnRtZW50OiB7XG4gKiAgLy8gICAgICAgICAgICAgZWxlbWVudDogJzxsaSBjbGFzcz1cImRlcGFydG1lbnRcIj4nICtcbiAqICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cInNsb3QtZmllbGRcIj5TaG9wIHRoZTwvc3Bhbj4gJyArXG4gKiAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAnPGEgaHJlZj1cIiNcIiBjbGFzcz1cImtleXdvcmQtZmllbGRcIj5Ac3ViamVjdEA8L2E+ICcgK1xuICogIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwic2xvdC1maWVsZFwiPlN0b3JlPC9zcGFuPicgK1xuICogIC8vICAgICAgICAgICAgICAgICAgICAgICAnPC9saT4nLFxuICogIC8vICAgICAgICAgICAgIGF0dHI6IFsnc3ViamVjdCddXG4gKiAgLy8gICAgICAgICB9LFxuICogIC8vICAgICAgICAgc3JjaDoge1xuICogIC8vICAgICAgICAgICAgIGVsZW1lbnQ6ICc8bGkgY2xhc3M9XCJzcmNoXCI+PHNwYW4gY2xhc3M9XCJrZXl3b3JkLWZpZWxkXCI+QHN1YmplY3RAPC9zcGFuPjwvbGk+JyxcbiAqICAvLyAgICAgICAgICAgICBhdHRyOiBbJ3N1YmplY3QnXVxuICogIC8vICAgICAgICAgfSxcbiAqICAvLyAgICAgICAgIHNyY2hfaW5fZGVwYXJ0bWVudDoge1xuICogIC8vICAgICAgICAgICAgIGVsZW1lbnQ6ICc8bGkgY2xhc3M9XCJpbkRlcGFydG1lbnRcIj4nICtcbiAqICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgJzxhIGhyZWY9XCIjXCIgY2xhc3M9XCJrZXl3b3JkLWZpZWxkXCI+QHN1YmplY3RAPC9hPiAnICtcbiAqICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwic2xvdC1maWVsZFwiPmluIDwvc3Bhbj4nICtcbiAqICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiZGVwYXJ0LWZpZWxkXCI+QGRlcGFydG1lbnRAPC9zcGFuPicgK1xuICogIC8vICAgICAgICAgICAgICAgICAgICAgICc8L2xpPicsXG4gKiAgLy8gICAgICAgICAgICAgYXR0cjogWydzdWJqZWN0JywgJ2RlcGFydG1lbnQnXVxuICogIC8vICAgICAgICAgfSxcbiAqICAvLyAgICAgICAgIHRpdGxlOiB7XG4gKiAgLy8gICAgICAgICAgICAgZWxlbWVudDogJzxsaSBjbGFzcz1cInRpdGxlXCI+PHNwYW4+QHRpdGxlQDwvc3Bhbj48L2xpPicsXG4gKiAgLy8gICAgICAgICAgICAgYXR0cjogWyd0aXRsZSddXG4gKiAgLy8gICAgICAgICB9LFxuICogIC8vICAgICAgICAgZGVmYXVsdHM6IHtcbiAqICAvLyAgICAgICAgICAgICBlbGVtZW50OiAnPGxpIGNsYXNzPVwic3JjaFwiPjxzcGFuIGNsYXNzPVwia2V5d29yZC1maWVsZFwiPkBzdWJqZWN0QDwvc3Bhbj48L2xpPicsXG4gKiAgLy8gICAgICAgICAgICAgYXR0cjogWydzdWJqZWN0J11cbiAqICAvLyAgICAgICAgIH1cbiAqICAvLyAgICAgfSxcbiAqICAvL1xuICogIC8vICAgICAvLyBBY3Rpb24gYXR0cmlidXRlIGZvciBlYWNoIGNvbGxlY3Rpb25cbiAqICAvLyAgICAgJ2FjdGlvbnMnOiBbXG4gKiAgLy8gICAgICAgICBcImh0dHA6Ly93d3cuZmFzaGlvbmdvLm5ldC9jYXRhbG9nLmFzcHhcIixcbiAqICAvLyAgICAgICAgIFwiaHR0cDovL3d3dy5mYXNoaW9uZ28ubmV0L3NlYXJjaDIuYXNweFwiXG4gKiAgLy8gICAgIF0sXG4gKiAgLy9cbiAqICAvLyAgICAgLy8gU2V0IHN0YXRpYyBvcHRpb25zIGZvciBlYWNoIGNvbGxlY3Rpb24uXG4gKiAgLy8gICAgICdzdGF0aWNQYXJhbXMnOltcbiAqICAvLyAgICAgICAgIFwicXQ9UHJvZHVjdE5hbWVcIixcbiAqICAvLyAgICAgICAgIFwiYXQ9VEVTVCxidD1BQ1RcIlxuICogIC8vICAgICBdLFxuICogIC8vXG4gKiAgLy8gICAgIC8vIFdoZXRoZXIgdXNlIHRpdGxlIG9yIG5vdC5cbiAqICAvLyAgICAgJ3VzZVRpdGxlJzogdHJ1ZSxcbiAqICAvL1xuICogIC8vICAgICAvLyBGb3JtIGVsZW1lbnQgdGhhdCBpbmNsdWRlIHNlYXJjaCBlbGVtZW50XG4gKiAgLy8gICAgICdmb3JtRWxlbWVudCcgOiAnI2FjX2Zvcm0xJyxcbiAqICAvL1xuICogIC8vICAgICAvLyBDb29raWUgbmFtZSBmb3Igc2F2ZSBzdGF0ZVxuICogIC8vICAgICAnY29va2llTmFtZScgOiBcInVzZWNvb2tpZVwiLFxuICogIC8vXG4gKiAgLy8gICAgIC8vIENsYXNzIG5hbWUgZm9yIHNlbGVjdGVkIGVsZW1lbnRcbiAqICAvLyAgICAgJ21vdXNlT3ZlckNsYXNzJyA6ICdlbXAnLFxuICogIC8vXG4gKiAgLy8gICAgIC8vIEF1dG8gY29tcGxldGUgQVBJXG4gKiAgLy8gICAgICdzZWFyY2hVcmwnIDogJ2h0dHA6Ly8xMC4yNC4xMzYuMTcyOjIwMDExL2FjJyxcbiAqICAvL1xuICogIC8vICAgICAvLyBBdXRvIGNvbXBsZXRlIEFQSSByZXF1ZXN0IGNvbmZpZ1xuICogIC8vICAgICAnc2VhcmNoQXBpJyA6IHtcbiAqICAvLyAgICAgICAgICdzdCcgOiAxMTExLFxuICogIC8vICAgICAgICAgJ3JfbHQnIDogMTExMSxcbiAqICAvLyAgICAgICAgICdyX2VuYycgOiAnVVRGLTgnLFxuICogIC8vICAgICAgICAgJ3FfZW5jJyA6ICdVVEYtOCcsXG4gKiAgLy8gICAgICAgICAncl9mb3JtYXQnIDogJ2pzb24nXG4gKiAgLy8gICAgIH1cbiAqICAvLyB9XG4gKi9cbnZhciBBdXRvQ29tcGxldGUgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKipAbGVuZHMgQXV0b0NvbXBsZXRlLnByb3RvdHlwZSAqL3tcbiAgICAvKipcbiAgICAgKiBEaXJlY3Rpb24gdmFsdWUgZm9yIGtleVxuICAgICAqL1xuICAgIGZsb3dNYXA6IHtcbiAgICAgICAgJ05FWFQnOiAnbmV4dCcsXG4gICAgICAgICdQUkVWJzogJ3ByZXYnLFxuICAgICAgICAnRklSU1QnOiAnZmlyc3QnLFxuICAgICAgICAnTEFTVCc6ICdsYXN0J1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnRlcnZhbCBmb3IgY2hlY2sgdXBkYXRlIGlucHV0XG4gICAgICovXG4gICAgd2F0Y2hJbnRlcnZhbDogMjAwLFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIGF1dG9jb25maWcgdmFsdWVzXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB7fTtcbiAgICAgICAgdGhpcy5fY2hlY2tWYWxpZGF0aW9uKG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl9zZXRPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgICAgIHRoaXMuZGF0YU1hbmFnZXIgPSBuZXcgRGF0YU1hbmFnZXIodGhpcywgdGhpcy5vcHRpb25zKTtcbiAgICAgICAgdGhpcy5pbnB1dE1hbmFnZXIgPSBuZXcgSW5wdXRNYW5hZ2VyKHRoaXMsIHRoaXMub3B0aW9ucyk7XG4gICAgICAgIHRoaXMucmVzdWx0TWFuYWdlciA9IG5ldyBSZXN1bHRNYW5hZ2VyKHRoaXMsIHRoaXMub3B0aW9ucyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNhdmUgbWF0Y2hlZCBpbnB1dCBlbmdsaXNoIHN0cmluZyB3aXRoIEtvcmVhbi5cbiAgICAgICAgICogQHR5cGUge251bGx9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnF1ZXJpZXMgPSBudWxsO1xuICAgICAgICB0aGlzLmlzSWRsZSA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5zZXRUb2dnbGVCdG5JbWcodGhpcy5pc1VzZSk7XG4gICAgICAgIHRoaXMuc2V0Q29va2llVmFsdWUodGhpcy5pc1VzZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIHJlcXVpcmVkIGZpZWxkcyBhbmQgdmFsaWRhdGUgZmllbGRzLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIGNvbXBvbmVudCBjb25maWd1cmF0aW9uc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NoZWNrVmFsaWRhdGlvbjogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB2YXIgaXNFeGlzdHkgPSB0dWkudXRpbC5pc0V4aXN0eSxcbiAgICAgICAgICAgIGNvbmZpZyA9IG9wdGlvbnMuY29uZmlnO1xuXG4gICAgICAgIGlmICghaXNFeGlzdHkoY29uZmlnKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBjb25maWd1cmF0aW9uICMnICsgY29uZmlnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goUkVRVUlSRURfRklFTERTLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgICAgICBpZiAoIWlzRXhpc3R5KGNvbmZpZ1tuYW1lXSkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IobmFtZSArICdkb2VzIG5vdCBub3QgZXhpc3QuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY29tcG9uZW50IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBjb21wb25lbnQgY29uZmlndXJhdGlvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRPcHRpb25zOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHZhciBjb25maWcgPSBvcHRpb25zLmNvbmZpZyxcbiAgICAgICAgICAgIGNvb2tpZVZhbHVlO1xuXG4gICAgICAgIGlmICghY29uZmlnLnRvZ2dsZUltZyB8fCAhY29uZmlnLm9ub2ZmVGV4dEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuaXNVc2UgPSB0cnVlO1xuICAgICAgICAgICAgZGVsZXRlIGNvbmZpZy5vbm9mZlRleHRFbGVtZW50O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29va2llVmFsdWUgPSAkLmNvb2tpZShjb25maWcuY29va2llTmFtZSk7XG4gICAgICAgICAgICB0aGlzLmlzVXNlID0gISEoY29va2llVmFsdWUgPT09ICd1c2UnIHx8ICFjb29raWVWYWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25maWcuY29va2llTmFtZSA9IGNvbmZpZy5jb29raWVOYW1lIHx8IERFRkFVTFRfQ09PS0lFX05BTUU7XG5cbiAgICAgICAgaWYgKCF0dWkudXRpbC5pc0ZhbHN5KGNvbmZpZy53YXRjaEludGVydmFsKSkge1xuICAgICAgICAgICAgY29uZmlnLndhdGNoSW50ZXJ2YWwgPSB0aGlzLndhdGNoSW50ZXJ2YWw7XG4gICAgICAgIH1cblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKGNvbmZpZywgZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgICAgIGlmIChJU19FTEVNRU5UX09QVElPTl9SRV9JLnRlc3QobmFtZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNbbmFtZV0gPSAkKHZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zW25hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0IGRhdGEgYXQgYXBpIHNlcnZlciB3aXRoIGtleXdvcmRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5d29yZCBUaGUga2V5IHdvcmQgdG8gc2VuZCB0byBBdXRvIGNvbXBsZXRlIEFQSVxuICAgICAqL1xuICAgIHJlcXVlc3Q6IGZ1bmN0aW9uKGtleXdvcmQpIHtcbiAgICAgICAgdGhpcy5kYXRhTWFuYWdlci5yZXF1ZXN0KGtleXdvcmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gc3RyaW5nIGluIGlucHV0IGVsZW1lbnQuXG4gICAgICogQHJldHVybnMge1N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlucHV0TWFuYWdlci5nZXRWYWx1ZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgaW5wdXRNYW5hZ2VyJ3MgdmFsdWUgdG8gc2hvdyBhdCBzZWFyY2ggZWxlbWVudFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBrZXl3b3JkIFRoZSBzdHJpbmcgdG8gc2hvdyB1cCBhdCBzZWFyY2ggZWxlbWVudFxuICAgICAqL1xuICAgIHNldFZhbHVlOiBmdW5jdGlvbihrZXl3b3JkKSB7XG4gICAgICAgIHRoaXMuaW5wdXRNYW5hZ2VyLnNldFZhbHVlKGtleXdvcmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgYWRkaXRpb25hbCBwYXJhbWV0ZXJzIGF0IGlucHV0TWFuYWdlci5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyYW1TdHIgU3RyaW5nIHRvIGJlIGFkZGl0aW9uIHBhcmFtZXRlcnMuKHNhcGVyYXRvciAnJicpXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGluZGV4IFRoZSBpbmRleCBmb3Igc2V0dGluZyBrZXkgdmFsdWVcbiAgICAgKi9cbiAgICBzZXRQYXJhbXM6IGZ1bmN0aW9uKHBhcmFtU3RyLCBpbmRleCkge1xuICAgICAgICB0aGlzLmlucHV0TWFuYWdlci5zZXRQYXJhbXMocGFyYW1TdHIsIGluZGV4KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdCB0byBkcmF3IHJlc3VsdCBhdCByZXN1bHRNYW5hZ2VyIHdpdGggZGF0YSBmcm9tIGFwaSBzZXJ2ZXIuXG4gICAgICogQHBhcmFtIHtBcnJheX0gZGF0YUFyciBEYXRhIGFycmF5IGZyb20gYXBpIHNlcnZlclxuICAgICAqL1xuICAgIHNldFNlcnZlckRhdGE6IGZ1bmN0aW9uKGRhdGFBcnIpIHtcbiAgICAgICAgdGhpcy5yZXN1bHRNYW5hZ2VyLmRyYXcoZGF0YUFycik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBDb29raWUgdmFsdWUgd2l0aCB3aGV0aGVyIHVzZSBhdXRvIGNvbXBsZXRlIG9yIG5vdFxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNVc2UgV2hldGhlciB1c2UgYXV0byBjb21wbGV0ZSBvciBub3RcbiAgICAgKi9cbiAgICBzZXRDb29raWVWYWx1ZTogZnVuY3Rpb24oaXNVc2UpIHtcbiAgICAgICAgJC5jb29raWUodGhpcy5vcHRpb25zLmNvb2tpZU5hbWUsIGlzVXNlID8gJ3VzZScgOiAnbm90VXNlJyk7XG4gICAgICAgIHRoaXMuaXNVc2UgPSBpc1VzZTtcbiAgICAgICAgdGhpcy5zZXRUb2dnbGVCdG5JbWcoaXNVc2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTYXZlIEtvcmVhbiB0aGF0IGlzIG1hdGNoZWQgcmVhbCBxdWVyeS5cbiAgICAgKiBAcGFyYW0ge2FycmF5fSBxdWVyaWVzIFJlc3VsdCBxdWVyaWVzXG4gICAgICovXG4gICAgc2V0UXVlcmllczogZnVuY3Rpb24ocXVlcmllcykge1xuICAgICAgICB0aGlzLnF1ZXJpZXMgPSBbXS5jb25jYXQocXVlcmllcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3aGV0aGVyIHVzZSBhdXRvIGNvbXBsZXRlIG9yIG5vdFxuICAgICAqIEBhcGlcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqICBhdXRvQ29tcGxldGUuaXNVc2VBdXRvQ29tcGxldGUoKTsgPT4gdHJ1ZXxmYWxzZVxuICAgICAqL1xuICAgIGlzVXNlQXV0b0NvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNVc2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3aGV0aGVyIHJlc3VsdCBsaXN0IGFyZWEgc2hvdyBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1Nob3dSZXN1bHRMaXN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0TWFuYWdlci5pc1Nob3dSZXN1bHRMaXN0KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSB0b2dnbGUgYnV0dG9uIGltYWdlIGJ5IGF1dG8gY29tcGxldGUgc3RhdGVcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzVXNlIHdoZXRoZXIgdXNlIGF1dG8gY29tcGxldGUgb3Igbm90XG4gICAgICovXG4gICAgc2V0VG9nZ2xlQnRuSW1nOiBmdW5jdGlvbihpc1VzZSkge1xuICAgICAgICB0aGlzLmlucHV0TWFuYWdlci5zZXRUb2dnbGVCdG5JbWcoaXNVc2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIHNlYXJjaCByZXN1bHQgbGlzdCBhcmVhXG4gICAgICovXG4gICAgaGlkZVJlc3VsdExpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5pc1VzZUF1dG9Db21wbGV0ZSgpKSB7XG4gICAgICAgICAgICB0aGlzLnJlc3VsdE1hbmFnZXIuaGlkZVJlc3VsdExpc3QoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IHNlYXJjaCByZXN1bHQgbGlzdCBhcmVhXG4gICAgICovXG4gICAgc2hvd1Jlc3VsdExpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5pc1VzZUF1dG9Db21wbGV0ZSgpKSB7XG4gICAgICAgICAgICB0aGlzLnJlc3VsdE1hbmFnZXIuc2hvd1Jlc3VsdExpc3QoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlIHRvIG5leHQgaXRlbSBpbiByZXN1bHQgbGlzdC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmxvdyBEaXJlY3Rpb24gdG8gbW92ZS5cbiAgICAgKi9cbiAgICBtb3ZlTmV4dExpc3Q6IGZ1bmN0aW9uKGZsb3cpIHtcbiAgICAgICAgdGhpcy5yZXN1bHRNYW5hZ2VyLm1vdmVOZXh0TGlzdChmbG93KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHRleHQgdG8gYXV0byBjb21wbGV0ZSBzd2l0Y2hcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzVXNlIFdoZXRoZXIgdXNlIGF1dG8gY29tcGxldGUgb3Igbm90XG4gICAgICovXG4gICAgY2hhbmdlT25PZmZUZXh0OiBmdW5jdGlvbihpc1VzZSkge1xuICAgICAgICB0aGlzLnJlc3VsdE1hbmFnZXIuY2hhbmdlT25PZmZUZXh0KGlzVXNlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHJlc3VsdE1hbmFnZXIgd2hldGhlciBsb2NrZWQgb3Igbm90XG4gICAgICogQHJldHVybnMge0Jvb2xlYW59IHJlc3VsdE1hbmFnZXLsnZggaXNNb3ZlZOqwklxuICAgICAqL1xuICAgIGdldE1vdmVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0TWFuYWdlci5pc01vdmVkO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgcmVzdWx0TWFuYWdlcidzIGlzTW92ZWQgZmllbGRcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzTW92ZWQgV2hldGhlciBsb2NrZWQgb3Igbm90LlxuICAgICAqL1xuICAgIHNldE1vdmVkOiBmdW5jdGlvbihpc01vdmVkKSB7XG4gICAgICAgIHRoaXMucmVzdWx0TWFuYWdlci5pc01vdmVkID0gaXNNb3ZlZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVzZXQgc2VyYWNoQXBpXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIHNlYXJjaEFwaeyYteyFmCDshKTsoJVcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqICBhdXRvQ29tcGxldGUuc2V0U2VhcmNoQXBpKHtcbiAgICAgKiAgICAgICdzdCcgOiAxMTEsXG4gICAgICogICAgICAncl9sdCcgOiAxMTEsXG4gICAgICogICAgICAncl9lbmMnIDogJ1VURi04JyxcbiAgICAgKiAgICAgICdxX2VuYycgOiAnVVRGLTgnLFxuICAgICAqICAgICAgJ3JfZm9ybWF0JyA6ICdqc29uJ1xuICAgICAqICB9KTtcbiAgICAgKi9cbiAgICBzZXRTZWFyY2hBcGk6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdHVpLnV0aWwuZXh0ZW5kKHRoaXMub3B0aW9ucy5zZWFyY2hBcGksIG9wdGlvbnMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjbGVhciByZWFkeSB2YWx1ZSBhbmQgc2V0IGlkbGUgc3RhdGVcbiAgICAgKi9cbiAgICBjbGVhclJlYWR5VmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodHVpLnV0aWwuaXNFeGlzdHkodGhpcy5yZWFkeVZhbHVlKSkge1xuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0KHRoaXMucmVhZHlWYWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmlzSWRsZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZWFkeVZhbHVlID0gbnVsbDtcbiAgICB9XG59KTtcbnR1aS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihBdXRvQ29tcGxldGUpO1xubW9kdWxlLmV4cG9ydHMgPSBBdXRvQ29tcGxldGU7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgRGF0YSBpcyBraW5kIG9mIG1hbmFnZXIgbW9kdWxlIHRvIHJlcXVlc3QgZGF0YSBhdCBBUEkgd2l0aCBpbnB1dCBxdWVyaWVzLlxuICogQHZlcnNpb24gMS4xLjBcbiAqIEBhdXRob3IgTkhOIEVudGVydGFpbm1lbnQgRkUgZGV2IHRlYW0uIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIENBTExCQUNLX05BTUUgPSAnZGF0YUNhbGxiYWNrJyxcbiAgICBTRVJBQ0hfS0VZV09SRF9JREVOVElGSUVSID0gJ3EnLFxuICAgIERFRkFVTFRfUEFSQU1TID0ge1xuICAgICAgICAncl9lbmMnOiAnVVRGLTgnLFxuICAgICAgICAncV9lbmMnOiAnVVRGLTgnLFxuICAgICAgICAncl9mb3JtYXQnOiAnanNvbidcbiAgICB9LFxuICAgIGZvckVhY2ggPSB0dWkudXRpbC5mb3JFYWNoLFxuICAgIGlzRW1wdHkgPSB0dWkudXRpbC5pc0VtcHR5O1xuXG4vKipcbiAqIFVuaXQgb2YgYXV0byBjb21wbGV0ZSBjb25uZWN0aW5nIHNlcnZlci5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgRGF0YSA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKkBsZW5kcyBEYXRhLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihhdXRvQ29tcGxldGVPYmosIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmogPSBhdXRvQ29tcGxldGVPYmo7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlcXVlc3QgZGF0YSBhdCBhcGkgc2VydmVyIHVzZSBqc29ucFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBrZXl3b3JkIFN0cmluZyB0byByZXF1ZXN0IGF0IHNlcnZlclxuICAgICAqL1xuICAgIHJlcXVlc3Q6IGZ1bmN0aW9uKGtleXdvcmQpIHtcbiAgICAgICAgdmFyIHJzS2V5V3JvZCA9IGtleXdvcmQucmVwbGFjZSgvXFxzL2csICcnKSxcbiAgICAgICAgICAgIGFjT2JqID0gdGhpcy5hdXRvQ29tcGxldGVPYmosIGtleURhdGFzO1xuXG4gICAgICAgIGlmICgha2V5d29yZCB8fCAhcnNLZXlXcm9kKSB7XG4gICAgICAgICAgICBhY09iai5oaWRlUmVzdWx0TGlzdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgREVGQVVMVF9QQVJBTVNbU0VSQUNIX0tFWVdPUkRfSURFTlRJRklFUl0gPSBrZXl3b3JkO1xuICAgICAgICAkLmFqYXgodGhpcy5vcHRpb25zLnNlYXJjaFVybCwge1xuICAgICAgICAgICAgJ2RhdGFUeXBlJzogJ2pzb25wJyxcbiAgICAgICAgICAgICdqc29ucENhbGxiYWNrJzogQ0FMTEJBQ0tfTkFNRSxcbiAgICAgICAgICAgICdkYXRhJzogJC5leHRlbmQodGhpcy5vcHRpb25zLnNlYXJjaEFwaSwgREVGQVVMVF9QQVJBTVMpLFxuICAgICAgICAgICAgJ3R5cGUnOiAnZ2V0JyxcbiAgICAgICAgICAgICdzdWNjZXNzJzogJC5wcm94eShmdW5jdGlvbihkYXRhT2JqKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAga2V5RGF0YXMgPSB0aGlzLl9nZXRDb2xsZWN0aW9uRGF0YShkYXRhT2JqKTtcbiAgICAgICAgICAgICAgICAgICAgYWNPYmouc2V0UXVlcmllcyhkYXRhT2JqLnF1ZXJ5KTtcbiAgICAgICAgICAgICAgICAgICAgYWNPYmouc2V0U2VydmVyRGF0YShrZXlEYXRhcyk7XG4gICAgICAgICAgICAgICAgICAgIGFjT2JqLmNsZWFyUmVhZHlWYWx1ZSgpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdbRGF0YU1hbmFnZXJdIGludmFsaWQgcmVzcG9uc2UgZGF0YS4nLCBlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzKVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWFrZSBjb2xsZWN0aW9uIGRhdGEgdG8gZGlzcGxheVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhT2JqIENvbGxlY3Rpb24gZGF0YVxuICAgICAqIEByZXR1cm5zIHtBcnJheX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDb2xsZWN0aW9uRGF0YTogZnVuY3Rpb24oZGF0YU9iaikge1xuICAgICAgICB2YXIgY29sbGVjdGlvbiA9IGRhdGFPYmouY29sbGVjdGlvbnMsXG4gICAgICAgICAgICBpdGVtRGF0YUxpc3QgPSBbXTtcblxuICAgICAgICBmb3JFYWNoKGNvbGxlY3Rpb24sIGZ1bmN0aW9uKGl0ZW1TZXQpIHtcbiAgICAgICAgICAgIHZhciBrZXlzO1xuXG4gICAgICAgICAgICBpZiAoaXNFbXB0eShpdGVtU2V0Lml0ZW1zKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAga2V5cyA9IHRoaXMuX2dldFJlZGlyZWN0RGF0YShpdGVtU2V0KTtcbiAgICAgICAgICAgIGl0ZW1EYXRhTGlzdC5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAndGl0bGUnLFxuICAgICAgICAgICAgICAgIHZhbHVlczogW2l0ZW1TZXQudGl0bGVdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0ZW1EYXRhTGlzdCA9IGl0ZW1EYXRhTGlzdC5jb25jYXQoa2V5cyk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBpdGVtRGF0YUxpc3Q7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1ha2UgaXRlbSBvZiBjb2xsZWN0aW9uIHRvIGRpc3BsYXlcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaXRlbVNldCBJdGVtIG9mIGNvbGxlY3Rpb24gZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHJldHVybnMge0FycmF5fVxuICAgICAqL1xuICAgIF9nZXRSZWRpcmVjdERhdGE6IGZ1bmN0aW9uKGl0ZW1TZXQpIHtcbiAgICAgICAgdmFyIHR5cGUgPSBpdGVtU2V0LnR5cGUsXG4gICAgICAgICAgICBpbmRleCA9IGl0ZW1TZXQuaW5kZXgsXG4gICAgICAgICAgICBkZXN0ID0gaXRlbVNldC5kZXN0aW5hdGlvbixcbiAgICAgICAgICAgIGl0ZW1zID0gW10sXG4gICAgICAgICAgICB2aWV3Q291bnQgPSB0aGlzLm9wdGlvbnMudmlld0NvdW50O1xuXG4gICAgICAgIC8qIGVzbGludC1kaXNhYmxlIGNvbnNpc3RlbnQtcmV0dXJuICovXG4gICAgICAgIGZvckVhY2goaXRlbVNldC5pdGVtcywgZnVuY3Rpb24oaXRlbSwgaWR4KSB7XG4gICAgICAgICAgICBpZiAoaWR4ID49IHZpZXdDb3VudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaXRlbXMucHVzaCh7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiBpdGVtLFxuICAgICAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICAgICAgICAgIGRlc3Q6IGRlc3RcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgLyogZXNsaW50LWVuYWJsZSBjb25zaXN0ZW50LXJldHVybiAqL1xuICAgICAgICByZXR1cm4gaXRlbXM7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRGF0YTtcbiIsIi8qKlxuICogQGZpbGVPdmVydmlldyBJbnB1dCBpcyBraW5kIG9mIG1hbmFnZXIgbW9kdWxlIHRvIHN1cHBvcnQgaW5wdXQgZWxlbWVudCBldmVudHMgYW5kIGFsbCBvZiBpbnB1dCBmdW5jdGlvbnMuXG4gKiBAdmVyc2lvbiAxLjEuMFxuICogQGF1dGhvciBOSE4gRW50ZXJ0YWlubWVudCBGRSBkZXYgdGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG4ndXNlIHN0cmljdCc7XG4vKipcbiAqIFVuaXQgb2YgYXV0byBjb21wbGV0ZSBjb21wb25lbnQgdGhhdCBiZWxvbmcgd2l0aCBpbnB1dCBlbGVtZW50LlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbnZhciBJbnB1dCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKkBsZW5kcyBJbnB1dC5wcm90b3R5cGUgKi97XG4gICAgLyoqXG4gICAgICoga2V5Ym9hcmQgSW5wdXQgS2V5Q29kZSBlbnVtXG4gICAgICovXG4gICAga2V5Q29kZU1hcDoge1xuICAgICAgICAnVEFCJzogOSxcbiAgICAgICAgJ1VQX0FSUk9XJzogMzgsXG4gICAgICAgICdET1dOX0FSUk9XJzogNDBcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdXRvQ29tcGxldGVPYmogQXV0b0NvbXBsZXRlIGluc3RhbmNlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgYXV0byBjb21wbGV0ZSBvcHRpb25zXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24oYXV0b0NvbXBsZXRlT2JqLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqID0gYXV0b0NvbXBsZXRlT2JqO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgICAgIC8vIFNhdmUgZWxlbWVudHMgZnJvbSBjb25maWd1cmF0aW9uLlxuICAgICAgICB0aGlzLiRzZWFyY2hCb3ggPSB0aGlzLm9wdGlvbnMuc2VhcmNoQm94RWxlbWVudDtcbiAgICAgICAgdGhpcy4kdG9nZ2xlQnRuID0gdGhpcy5vcHRpb25zLnRvZ2dsZUJ0bkVsZW1lbnQ7XG4gICAgICAgIHRoaXMuJG9yZ1F1ZXJ5ID0gdGhpcy5vcHRpb25zLm9yZ1F1ZXJ5RWxlbWVudDtcbiAgICAgICAgdGhpcy4kZm9ybUVsZW1lbnQgPSB0aGlzLm9wdGlvbnMuZm9ybUVsZW1lbnQ7XG4gICAgICAgIHRoaXMuaW5wdXRWYWx1ZSA9IHRoaXMuJHNlYXJjaEJveC52YWwoKTtcblxuICAgICAgICB0aGlzLl9hdHRhY2hFdmVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gaW5wdXQgZWxlbWVudCB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFNlYXJjaGJveCB2YWx1ZVxuICAgICAqL1xuICAgIGdldFZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJHNlYXJjaEJveC52YWwoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGtleXdvcmQgdG8gaW5wdXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIGtleXdvcmQgdG8gc2V0IHZhbHVlLlxuICAgICAqL1xuICAgIHNldFZhbHVlOiBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgdGhpcy4kc2VhcmNoQm94LnZhbChzdHIpO1xuICAgICAgICB0aGlzLmlucHV0VmFsdWUgPSBzdHI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlYWQgY29uZmlnIGZpbGVzIHBhcmFtZXRlciBvcHRpb24gYW5kIHNldCBwYXJhbWV0ZXIuXG4gICAgICogQHBhcmFtIHtBcnJheXxzdHJpbmd9IHN1YlF1ZXJ5VmFsdWVzIFRoZSBzdWJRdWVyeVZhbHVlcyBmcm9tIHJlc3VsdExpc3RcbiAgICAgKiBAcGFyYW0ge251bWJlcnxzdHJpbmd9IGluZGV4IFRoZSBpbmRleCBmb3Igc3ViUXVlcnlTZXQgaW4gY29uZmlnXG4gICAgICovXG4gICAgc2V0UGFyYW1zOiBmdW5jdGlvbihzdWJRdWVyeVZhbHVlcywgaW5kZXgpIHtcbiAgICAgICAgaWYgKHN1YlF1ZXJ5VmFsdWVzICYmIHR1aS51dGlsLmlzU3RyaW5nKHN1YlF1ZXJ5VmFsdWVzKSkge1xuICAgICAgICAgICAgc3ViUXVlcnlWYWx1ZXMgPSBzdWJRdWVyeVZhbHVlcy5zcGxpdCgnLCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCghc3ViUXVlcnlWYWx1ZXMgfHwgdHVpLnV0aWwuaXNFbXB0eShzdWJRdWVyeVZhbHVlcykpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY3JlYXRlUGFyYW1TZXRCeVR5cGUoc3ViUXVlcnlWYWx1ZXMsIGluZGV4KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGlucHV0RWxlbWVudCBieSB0eXBlXG4gICAgICogQHBhcmFtIHtBcnJheXxzdHJpbmd9IHN1YlF1ZXJ5VmFsdWVzIFRoZSBzdWJRdWVyeVZhbHVlcyBmcm9tIHJlc3VsdExpc3RcbiAgICAgKiBAcGFyYW0ge251bWJlcnxzdHJpbmd9IGluZGV4IFRoZSBpbmRleCBmb3Igc3ViUXVlcnlTZXQgaW4gY29uZmlnXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY3JlYXRlUGFyYW1TZXRCeVR5cGU6IGZ1bmN0aW9uKHN1YlF1ZXJ5VmFsdWVzLCBpbmRleCkge1xuICAgICAgICB2YXIgb3B0dGlvbnMgPSB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgICBsaXN0Q29uZmlnID0gb3B0dGlvbnMubGlzdENvbmZpZ1tpbmRleF0sXG4gICAgICAgICAgICBzdWJRdWVyeVNldEluZGV4ID0gbGlzdENvbmZpZy5zdWJRdWVyeVNldCxcbiAgICAgICAgICAgIHN0YXRpY1BhcmFtc0luZGV4ID0gbGlzdENvbmZpZy5zdGF0aWNQYXJhbXMsXG4gICAgICAgICAgICBzdWJRdWVyeUtleXMgPSBvcHR0aW9ucy5zdWJRdWVyeVNldFtzdWJRdWVyeVNldEluZGV4XSxcbiAgICAgICAgICAgIHN0YXRpY1BhcmFtcyA9IG9wdHRpb25zLnN0YXRpY1BhcmFtc1tzdGF0aWNQYXJhbXNJbmRleF07XG5cbiAgICAgICAgaWYgKCF0aGlzLmhpZGRlbnMpIHtcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZVBhcmFtQ29udGFpbmVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHN1YlF1ZXJ5VmFsdWVzLCBmdW5jdGlvbih2YWx1ZSwgaWR4KSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gc3ViUXVlcnlLZXlzW2lkeF07XG4gICAgICAgICAgICB0aGlzLmhpZGRlbnMuYXBwZW5kKCQoJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cIicgKyBrZXkgKyAnXCIgdmFsdWU9XCInICsgdmFsdWUgKyAnXCIgLz4nKSk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHRoaXMuX2NyZWF0ZVN0YXRpY1BhcmFtcyhzdGF0aWNQYXJhbXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgc3RhdGljIHBhcmFtZXRlcnNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGljUGFyYW1zIFN0YXRpYyBwYXJhbWV0ZXJzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY3JlYXRlU3RhdGljUGFyYW1zOiBmdW5jdGlvbihzdGF0aWNQYXJhbXMpIHtcbiAgICAgICAgaWYgKCFzdGF0aWNQYXJhbXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRpY1BhcmFtcyA9IHN0YXRpY1BhcmFtcy5zcGxpdCgnLCcpO1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHN0YXRpY1BhcmFtcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHZhciB2YWwgPSB2YWx1ZS5zcGxpdCgnPScpO1xuICAgICAgICAgICAgdGhpcy5oaWRkZW5zLmFwcGVuZCgkKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCInICsgdmFsWzBdICsgJ1wiIHZhbHVlPVwiJyArIHZhbFsxXSArICdcIiAvPicpKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSB3cmFwcGVyIHRoYXQgYmVjb21lIGNvbnRhaW5lciBvZiBoaWRkZW4gZWxlbWVudHMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY3JlYXRlUGFyYW1Db250YWluZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmhpZGRlbnMgPSAkKCc8ZGl2IGNsYXNzPVwiaGlkZGVuLWlucHV0c1wiPjwvZGl2PicpXG4gICAgICAgICAgICAuaGlkZSgpXG4gICAgICAgICAgICAuYXBwZW5kVG8odGhpcy4kZm9ybUVsZW1lbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgdG9nZ2xlIGJ1dHRvbiBpbWFnZS5cbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzVXNlIOyekOuPmeyZhOyEsSDsgqzsmqkg7Jes67aAXG4gICAgICovXG4gICAgc2V0VG9nZ2xlQnRuSW1nOiBmdW5jdGlvbihpc1VzZSkge1xuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy50b2dnbGVJbWcgfHwgIXRoaXMuJHRvZ2dsZUJ0biB8fCAhdGhpcy4kdG9nZ2xlQnRuLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzVXNlKSB7XG4gICAgICAgICAgICB0aGlzLiR0b2dnbGVCdG4uYXR0cignc3JjJywgdGhpcy5vcHRpb25zLnRvZ2dsZUltZy5vbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiR0b2dnbGVCdG4uYXR0cignc3JjJywgdGhpcy5vcHRpb25zLnRvZ2dsZUltZy5vZmYpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IGJpbmRpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hdHRhY2hFdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJHNlYXJjaEJveC5vbih7XG4gICAgICAgICAgICBmb2N1czogJC5wcm94eSh0aGlzLl9vbkZvY3VzLCB0aGlzKSxcbiAgICAgICAgICAgIGJsdXI6ICQucHJveHkodGhpcy5fb25CbHVyLCB0aGlzKSxcbiAgICAgICAgICAgIGtleXVwOiAkLnByb3h5KHRoaXMuX29uS2V5VXAsIHRoaXMpLFxuICAgICAgICAgICAga2V5ZG93bjogJC5wcm94eSh0aGlzLl9vbktleURvd24sIHRoaXMpLFxuICAgICAgICAgICAgY2xpY2s6ICQucHJveHkodGhpcy5jbGljaywgdGhpcylcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHRoaXMuJHRvZ2dsZUJ0biAmJiB0aGlzLiR0b2dnbGVCdG4ubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLiR0b2dnbGVCdG4ub24oJ2NsaWNrJywgJC5wcm94eSh0aGlzLl9vbkNsaWNrVG9nZ2xlLCB0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2F2ZSB1c2VyIHF1ZXJ5IGludG8gaGlkZGVuIGVsZW1lbnQuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgc3RyaW5nIHR5cGVkIGJ5IHVzZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRPcmdRdWVyeTogZnVuY3Rpb24oc3RyKSB7XG4gICAgICAgIHRoaXMuJG9yZ1F1ZXJ5LnZhbChzdHIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnB1dCBlbGVtZW50IG9uY2xpY2sgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IEZhbHNlIGlmIG5vIGlucHV0LWtleXdvcmQgb3Igbm90IHVzZSBhdXRvLWNvbXBsZXRlXG4gICAgICovXG4gICAgX29uQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvL+yeheugpeuQnCDtgqTsm4zrk5zqsIAg7JeG6rGw64KYIOyekOuPmeyZhOyEsSDquLDriqUg7IKs7Jqp7ZWY7KeAIOyViuycvOuptCDtjrzsuaAg7ZWE7JqUIOyXhuycvOuvgOuhnCDqt7jrg6Ug66as7YS07ZWY6rOgIOuBnS5cbiAgICAgICAgaWYgKCF0aGlzLmF1dG9Db21wbGV0ZU9iai5nZXRWYWx1ZSgpIHx8XG4gICAgICAgICAgICAhdGhpcy5hdXRvQ29tcGxldGVPYmouaXNVc2VBdXRvQ29tcGxldGUoKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuYXV0b0NvbXBsZXRlT2JqLmlzU2hvd1Jlc3VsdExpc3QoKSkge1xuICAgICAgICAgICAgLy/qsrDqs7wg66as7Iqk7Yq4IOyYgeyXreydtCBzaG93IOyDge2DnOydtOuptChpc1Jlc3VsdFNob3dpbmc9PXRydWUpIOqysOqzvCDrpqzsiqTtirggaGlkZSDsmpTssq1cbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLmhpZGVSZXN1bHRMaXN0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL+qysOqzvCDrpqzsiqTtirgg7JiB7Jet7J20IGhpZGUg7IOB7YOc7J2066m0KGlzUmVzdWx0U2hvd2luZz09ZmFsc2UpIOqysOqzvCDrpqzsiqTtirggc2hvdyDsmpTssq1cbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnNob3dSZXN1bHRMaXN0KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIElucHV0IGVsZW1lbnQgZm9jdXMgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uRm9jdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvL3NldEludGVydmFsIOyEpOygle2VtOyEnCDsnbzsoJUg7Iuc6rCEIOyjvOq4sOuhnCBfb25XYXRjaCDtlajsiJjrpbwg7Iuk7ZaJ7ZWc64ukLlxuICAgICAgICB0aGlzLmludGVydmFsSWQgPSBzZXRJbnRlcnZhbCgkLnByb3h5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5fb25XYXRjaCgpO1xuICAgICAgICB9LCB0aGlzKSwgdGhpcy5vcHRpb25zLndhdGNoSW50ZXJ2YWwpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSb29wIGZvciBjaGVjayB1cGRhdGUgaW5wdXQgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uV2F0Y2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VhcmNoYm94VmFsdWUgPSB0aGlzLiRzZWFyY2hCb3gudmFsKCk7XG5cbiAgICAgICAgaWYgKCFzZWFyY2hib3hWYWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fc2V0T3JnUXVlcnkoJycpO1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouc2V0TW92ZWQoZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaW5wdXRWYWx1ZSAhPT0gc2VhcmNoYm94VmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRWYWx1ZSA9IHNlYXJjaGJveFZhbHVlO1xuICAgICAgICAgICAgdGhpcy5fb25DaGFuZ2UoKTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5hdXRvQ29tcGxldGVPYmouZ2V0TW92ZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5fc2V0T3JnUXVlcnkoc2VhcmNoYm94VmFsdWUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIElucHV0IGVsZW1lbnQga2V5dXAgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uS2V5VXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VhcmNoQm94VmFsdWUgPSB0aGlzLiRzZWFyY2hCb3gudmFsKCk7XG5cbiAgICAgICAgaWYgKHRoaXMuaW5wdXRWYWx1ZSAhPT0gc2VhcmNoQm94VmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRWYWx1ZSA9IHNlYXJjaEJveFZhbHVlO1xuICAgICAgICAgICAgdGhpcy5fb25DaGFuZ2UoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnB1dCBlbGVtZW50IG9uY2hhbmdlIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhY09iaiA9IHRoaXMuYXV0b0NvbXBsZXRlT2JqO1xuICAgICAgICBpZiAoIWFjT2JqLmlzVXNlQXV0b0NvbXBsZXRlKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhY09iai5pc0lkbGUpIHtcbiAgICAgICAgICAgIGFjT2JqLmlzSWRsZSA9IGZhbHNlO1xuICAgICAgICAgICAgYWNPYmoucmVxdWVzdCh0aGlzLiRzZWFyY2hCb3gudmFsKCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWNPYmoucmVhZHlWYWx1ZSA9IHRoaXMuJHNlYXJjaEJveC52YWwoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnB1dCBlbGVtZW50IGJsdXIgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQmx1cjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElkKTtcbiAgICAgICAgdGhpcy5pbnRlcnZhbElkID0gbnVsbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5wdXQgZWxlbWVudCBrZXlkb3duIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBTZXQgYWN0aW5vIGJ5IGlucHV0IHZhbHVlXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQga2V5RG93biBFdmVudCBpbnN0YW5jZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgLyplc2xpbnQtZGlzYWJsZSBjb21wbGV4aXR5Ki9cbiAgICBfb25LZXlEb3duOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgYWNPYmogPSB0aGlzLmF1dG9Db21wbGV0ZU9iaixcbiAgICAgICAgICAgIGZsb3csIGNvZGVNYXAsIGZsb3dNYXA7XG5cbiAgICAgICAgaWYgKCFhY09iai5pc1VzZUF1dG9Db21wbGV0ZSgpIHx8ICFhY09iai5pc1Nob3dSZXN1bHRMaXN0KCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvZGVNYXAgPSB0aGlzLmtleUNvZGVNYXA7XG4gICAgICAgIGZsb3dNYXAgPSBhY09iai5mbG93TWFwO1xuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgY29kZU1hcC5UQUI6XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBmbG93ID0gZXZlbnQuc2hpZnRLZXkgPyBmbG93TWFwLk5FWFQgOiBmbG93TWFwLlBSRVY7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGNvZGVNYXAuRE9XTl9BUlJPVzpcbiAgICAgICAgICAgICAgICBmbG93ID0gZmxvd01hcC5ORVhUO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBjb2RlTWFwLlVQX0FSUk9XOlxuICAgICAgICAgICAgICAgIGZsb3cgPSBmbG93TWFwLlBSRVY7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBhY09iai5tb3ZlTmV4dExpc3QoZmxvdyk7XG4gICAgfSxcbiAgICAvKmVzbGludC1lbmFibGUgY29tcGxleGl0eSovXG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgYnV0dG9uIGNsaWNrIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkNsaWNrVG9nZ2xlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmF1dG9Db21wbGV0ZU9iai5pc1VzZUF1dG9Db21wbGV0ZSgpKSB7XG4gICAgICAgICAgICB0aGlzLnNldFRvZ2dsZUJ0bkltZyh0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnNldENvb2tpZVZhbHVlKHRydWUpO1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouY2hhbmdlT25PZmZUZXh0KGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLmhpZGVSZXN1bHRMaXN0KCk7XG4gICAgICAgICAgICB0aGlzLnNldFRvZ2dsZUJ0bkltZyhmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5zZXRDb29raWVWYWx1ZShmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5jaGFuZ2VPbk9mZlRleHQodHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnB1dDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBSZXN1bHQgaXMga2luZCBvZiBtYW5hZ2luZyBtb2R1bGUgdG8gZHJhdyBhdXRvIGNvbXBsZXRlIHJlc3VsdCBsaXN0IGZyb20gc2VydmVyIGFuZCBhcHBseSB0ZW1wbGF0ZS5cbiAqIEB2ZXJzaW9uIDEuMS4wXG4gKiBAYXV0aG9yICBOSE4gZW50ZXJ0YWlubWVudCBGRSBkZXYgdGVhbTxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cbid1c2Ugc3RyaWN0JztcbnZhciBERUZBVUxUX1ZJRVdfQ09VTlQgPSAxMCxcbiAgICBpc0VtcHR5ID0gdHVpLnV0aWwuaXNFbXB0eSxcbiAgICBtYXAgPSB0dWkudXRpbC5tYXAsXG4gICAgU1BFQ0lBTF9DSEFSQUNURVJTX1JFID0gL1tcXFxcXiQuKis/KClbXFxde318XS8sXG4gICAgV0hJVEVfU1BBQ0VTX1JFX0cgPSAnL1xccysvZycsXG4gICAgV0hJVEVfU1BBQ0VTID0gJ1tcXFxcc10qJztcblxuLyoqXG4gKiBVbml0IG9mIGF1dG8gY29tcGxldGUgdGhhdCBiZWxvbmcgd2l0aCBzZWFyY2ggcmVzdWx0IGxpc3QuXG4gKiBAY29uc3RydWN0b3JcbiAqL1xudmFyIFJlc3VsdCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgUmVzdWx0LnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihhdXRvQ29tcGxldGVPYmosIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmogPSBhdXRvQ29tcGxldGVPYmo7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICAgICAgdGhpcy4kcmVzdWx0TGlzdCA9IG9wdGlvbnMucmVzdWx0TGlzdEVsZW1lbnQ7XG4gICAgICAgIHRoaXMudmlld0NvdW50ID0gb3B0aW9ucy52aWV3Q291bnQgfHwgREVGQVVMVF9WSUVXX0NPVU5UO1xuICAgICAgICB0aGlzLiRvbk9mZlR4dCA9IG9wdGlvbnMub25vZmZUZXh0RWxlbWVudDtcbiAgICAgICAgdGhpcy5tb3VzZU92ZXJDbGFzcyA9IG9wdGlvbnMubW91c2VPdmVyQ2xhc3M7XG4gICAgICAgIHRoaXMuZmxvd01hcCA9IGF1dG9Db21wbGV0ZU9iai5mbG93TWFwO1xuXG4gICAgICAgIHRoaXMuX2F0dGFjaEV2ZW50KCk7XG5cbiAgICAgICAgdGhpcy4kc2VsZWN0ZWRFbGVtZW50ID0gbnVsbDtcblxuICAgICAgICB0aGlzLmlzTW92ZWQgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRGVsZXRlIGxhc3QgcmVzdWx0IGxpc3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9kZWxldGVCZWZvcmVFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kcmVzdWx0TGlzdFxuICAgICAgICAgICAgLmhpZGUoKVxuICAgICAgICAgICAgLmh0bWwoJycpO1xuICAgICAgICB0aGlzLiRzZWxlY3RlZEVsZW1lbnQgPSBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEcmF3IHJlc3VsdCBmb3JtIGFwaSBzZXJ2ZXJcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBkYXRhQXJyIFJlc3VsdCBkYXRhXG4gICAgICovXG4gICAgZHJhdzogZnVuY3Rpb24oZGF0YUFycikge1xuICAgICAgICB2YXIgbGVuID0gZGF0YUFyci5sZW5ndGg7XG5cbiAgICAgICAgdGhpcy5fZGVsZXRlQmVmb3JlRWxlbWVudCgpO1xuICAgICAgICBpZiAobGVuIDwgMSkge1xuICAgICAgICAgICAgdGhpcy5faGlkZUJvdHRvbUFyZWEoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX21ha2VSZXN1bHRMaXN0KGRhdGFBcnIsIGxlbik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zaG93UmVzdWx0TGlzdCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNYWtlIHNlYXJjaCByZXN1bHQgbGlzdCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtBcnJheX0gZGF0YUFyciAtIERhdGEgYXJyYXlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGVuIC0gTGVuZ3RoIG9mIGRhdGFBcnJheVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VSZXN1bHRMaXN0OiBmdW5jdGlvbihkYXRhQXJyLCBsZW4pIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gdGhpcy5vcHRpb25zLnRlbXBsYXRlLFxuICAgICAgICAgICAgbGlzdENvbmZpZyA9IHRoaXMub3B0aW9ucy5saXN0Q29uZmlnLFxuICAgICAgICAgICAgdXNlVGl0bGUgPSAodGhpcy5vcHRpb25zLnVzZVRpdGxlICYmICEhdGVtcGxhdGUudGl0bGUpLFxuICAgICAgICAgICAgdG1wbCwgaW5kZXgsIHRtcGxWYWx1ZSwgaSwgZGF0YTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGRhdGEgPSBkYXRhQXJyW2ldO1xuICAgICAgICAgICAgaW5kZXggPSBkYXRhLmluZGV4O1xuICAgICAgICAgICAgdG1wbCA9IGxpc3RDb25maWdbaW5kZXhdID8gdGVtcGxhdGVbbGlzdENvbmZpZ1tpbmRleF0udGVtcGxhdGVdIDogdGVtcGxhdGUuZGVmYXVsdHM7XG5cbiAgICAgICAgICAgIGlmIChkYXRhLnR5cGUgPT09ICd0aXRsZScpIHtcbiAgICAgICAgICAgICAgICB0bXBsID0gdGVtcGxhdGUudGl0bGU7XG4gICAgICAgICAgICAgICAgaWYgKCF1c2VUaXRsZSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0bXBsVmFsdWUgPSB0aGlzLl9nZXRUbXBsRGF0YSh0bXBsLmF0dHIsIGRhdGEpO1xuICAgICAgICAgICAgJCh0aGlzLl9hcHBseVRlbXBsYXRlKHRtcGwuZWxlbWVudCwgdG1wbFZhbHVlKSlcbiAgICAgICAgICAgICAgICAuZGF0YSh7XG4gICAgICAgICAgICAgICAgICAgICdwYXJhbXMnOiB0bXBsVmFsdWUucGFyYW1zLFxuICAgICAgICAgICAgICAgICAgICAnaW5kZXgnOiBpbmRleFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmFwcGVuZFRvKHRoaXMuJHJlc3VsdExpc3QpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1ha2UgdGVtcGxhdGUgZGF0YVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGF0dHJzIFRlbXBsYXRlIGF0dHJpYnV0ZXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xPYmplY3R9IGRhdGEgVGhlIGRhdGEgdG8gbWFrZSB0ZW1wbGF0ZVxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFRlbXBsYXRlIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRUbXBsRGF0YTogZnVuY3Rpb24oYXR0cnMsIGRhdGEpIHtcbiAgICAgICAgdmFyIHRtcGxWYWx1ZSA9IHt9LFxuICAgICAgICAgICAgdmFsdWVzID0gZGF0YS52YWx1ZXMgfHwgbnVsbDtcblxuICAgICAgICBpZiAodHVpLnV0aWwuaXNTdHJpbmcoZGF0YSkpIHtcbiAgICAgICAgICAgIHRtcGxWYWx1ZVthdHRyc1swXV0gPSBkYXRhO1xuICAgICAgICAgICAgcmV0dXJuIHRtcGxWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goYXR0cnMsIGZ1bmN0aW9uKGF0dHIsIGlkeCkge1xuICAgICAgICAgICAgdG1wbFZhbHVlW2F0dHJdID0gdmFsdWVzW2lkeF07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChhdHRycy5sZW5ndGggPCB2YWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0bXBsVmFsdWUucGFyYW1zID0gdmFsdWVzLnNsaWNlKGF0dHJzLmxlbmd0aCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdG1wbFZhbHVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gd2hldGhlciByZXN1bHQgbGlzdCBzaG93IG9yIG5vdFxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzU2hvd1Jlc3VsdExpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kcmVzdWx0TGlzdC5jc3MoJ2Rpc3BsYXknKSA9PT0gJ2Jsb2NrJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSByZXN1bHQgbGlzdCBhcmVhXG4gICAgICovXG4gICAgaGlkZVJlc3VsdExpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLiRyZXN1bHRMaXN0LmhpZGUoKTtcbiAgICAgICAgdGhpcy5faGlkZUJvdHRvbUFyZWEoKTtcbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouaXNJZGxlID0gdHJ1ZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRmlyZWQgd2hlbiBoaWRlIHRoZSByZXN1bHQgbGlzdFxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBBdXRvQ29tcGxldGUjY2xvc2VcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLmZpcmUoJ2Nsb3NlJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgcmVzdWx0IGxpc3QgYXJlYVxuICAgICAqL1xuICAgIHNob3dSZXN1bHRMaXN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kcmVzdWx0TGlzdC5zaG93KCk7XG4gICAgICAgIHRoaXMuX3Nob3dCb3R0b21BcmVhKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1vdmUgZm9jdXMgdG8gbmV4dCBpdGVtLCBjaGFuZ2UgaW5wdXQgZWxlbWVudCB2YWx1ZSBhcyBmb2N1cyB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmxvdyBEaXJlY3Rpb24gYnkga2V5IGNvZGVcbiAgICAgKi9cbiAgICBtb3ZlTmV4dExpc3Q6IGZ1bmN0aW9uKGZsb3cpIHtcbiAgICAgICAgdmFyIGZsb3dNYXAgPSB0aGlzLmZsb3dNYXAsXG4gICAgICAgICAgICAkc2VsZWN0RWwgPSB0aGlzLiRzZWxlY3RlZEVsZW1lbnQsXG4gICAgICAgICAgICBnZXROZXh0ID0gKGZsb3cgPT09IGZsb3dNYXAuTkVYVCkgPyB0aGlzLl9nZXROZXh0IDogdGhpcy5fZ2V0UHJldixcbiAgICAgICAgICAgIGdldEJvdW5kID0gKGZsb3cgPT09IGZsb3dNYXAuTkVYVCkgPyB0aGlzLl9nZXRGaXJzdCA6IHRoaXMuX2dldExhc3QsXG4gICAgICAgICAgICBrZXl3b3JkO1xuXG4gICAgICAgIHRoaXMuaXNNb3ZlZCA9IHRydWU7XG4gICAgICAgIGlmIChpc0VtcHR5KCRzZWxlY3RFbCkpIHtcbiAgICAgICAgICAgICRzZWxlY3RFbCA9IHRoaXMuJHNlbGVjdGVkRWxlbWVudCA9IGdldEJvdW5kLmNhbGwodGhpcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkc2VsZWN0RWwucmVtb3ZlQ2xhc3ModGhpcy5tb3VzZU92ZXJDbGFzcyk7XG4gICAgICAgICAgICAkc2VsZWN0RWwgPSB0aGlzLiRzZWxlY3RlZEVsZW1lbnQgPSBnZXROZXh0LmNhbGwodGhpcywgJHNlbGVjdEVsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGtleXdvcmQgPSAkc2VsZWN0RWwuZmluZCgnLmtleXdvcmQtZmllbGQnKS50ZXh0KCk7XG4gICAgICAgIGlmIChrZXl3b3JkKSB7XG4gICAgICAgICAgICAkc2VsZWN0RWwuYWRkQ2xhc3ModGhpcy5tb3VzZU92ZXJDbGFzcyk7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5zZXRWYWx1ZShrZXl3b3JkKTtcbiAgICAgICAgICAgIHRoaXMuX3NldFN1Ym1pdE9wdGlvbigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5tb3ZlTmV4dExpc3QoZmxvdyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hhZ2UgdGV4dCBieSB3aGV0aGVyIGF1dG8gY29tcGxldGUgdXNlIG9yIG5vdFxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNVc2Ugb24vb2ZmIOyXrOu2gFxuICAgICAqL1xuICAgIGNoYW5nZU9uT2ZmVGV4dDogZnVuY3Rpb24oaXNVc2UpIHtcbiAgICAgICAgaWYgKGlzVXNlKSB7XG4gICAgICAgICAgICB0aGlzLiRvbk9mZlR4dC50ZXh0KCfsnpDrj5nsmYTshLEg7Lyc6riwJyk7XG4gICAgICAgICAgICB0aGlzLmhpZGVSZXN1bHRMaXN0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiRvbk9mZlR4dC50ZXh0KCfsnpDrj5nsmYTshLEg64GE6riwJyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggYXV0byBjb21wbGV0ZSBldmVudCBiZWxvbmdzIHdpdGggcmVzdWx0IGxpc3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hdHRhY2hFdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJHJlc3VsdExpc3Qub24oe1xuICAgICAgICAgICAgbW91c2VvdmVyOiAkLnByb3h5KHRoaXMuX29uTW91c2VPdmVyLCB0aGlzKSxcbiAgICAgICAgICAgIGNsaWNrOiAkLnByb3h5KHRoaXMuX29uQ2xpY2ssIHRoaXMpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0aGlzLiRvbk9mZlR4dCkge1xuICAgICAgICAgICAgdGhpcy4kb25PZmZUeHQub24oJ2NsaWNrJywgJC5wcm94eShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl91c2VBdXRvQ29tcGxldGUoKTtcbiAgICAgICAgICAgIH0sIHRoaXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICQucHJveHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVSZXN1bHRMaXN0KCk7XG4gICAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlnaGxpZ2h0IGtleSB3b3JkXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRtcGxTdHIgVGVtcGxhdGUgc3RyaW5nXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGFPYmogUmVwbGFjZSBzdHJpbmcgbWFwXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hcHBseVRlbXBsYXRlOiBmdW5jdGlvbih0bXBsU3RyLCBkYXRhT2JqKSB7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goZGF0YU9iaiwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3N1YmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGlzLl9oaWdobGlnaHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG1wbFN0ciA9IHRtcGxTdHIucmVwbGFjZShuZXcgUmVnRXhwKCdAJyArIGtleSArICdAJywgJ2cnKSwgdmFsdWUpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gdG1wbFN0cjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGFwcGxpZWQgaGlnaGxpZ2h0IGVmZmVjdCBrZXkgd29yZFxuICAgICAqICh0ZXh0OiBOaWtlIGFpciAgLyAgcXVlcnkgOiBbTmlrZV0gLyBSZXN1bHQgOiA8c3Ryb25nPk5pa2UgPC9zdHJvbmc+YWlyXG4gICAgICogdGV4dCA6ICdyaGRpZGRs7JmAIOqzoOyWkeydtCcgLyBxdWVyeSA6ICBbcmhkaWRkbCwg6rOg7JaR7J20XSAvIOumrO2EtOqysOqzvCA8c3Ryb25nPnJoZGlkZGw8L3N0cm9uZz7smYAgPHN0cm9uZz7qs6DslpHsnbQ8L3N0cm9uZz5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdGV4dCBJbnB1dCBzdHJpbmdcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2hpZ2hsaWdodDogZnVuY3Rpb24odGV4dCkge1xuICAgICAgICB2YXIgcXVlcmllcyA9IHRoaXMuYXV0b0NvbXBsZXRlT2JqLnF1ZXJpZXMsXG4gICAgICAgICAgICByZXR1cm5TdHI7XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChxdWVyaWVzLCBmdW5jdGlvbihxdWVyeSkge1xuICAgICAgICAgICAgaWYgKCFyZXR1cm5TdHIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm5TdHIgPSB0ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuU3RyID0gdGhpcy5fbWFrZVN0cm9uZyhyZXR1cm5TdHIsIHF1ZXJ5KTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIHJldHVybiByZXR1cm5TdHIgfHwgdGV4dDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29udGFpbiB0ZXh0IGJ5IHN0cm9uZyB0YWdcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdGV4dCBSZWNvbW1lbmQgc2VhcmNoIGRhdGEgIOy2lOyynOqygOyDieyWtCDrjbDsnbTthLBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcXVlcnkgSW5wdXQga2V5d29yZFxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVN0cm9uZzogZnVuY3Rpb24odGV4dCwgcXVlcnkpIHtcbiAgICAgICAgdmFyIHRtcEFyciwgcmVnUXVlcnk7XG5cbiAgICAgICAgaWYgKCFxdWVyeSB8fCBxdWVyeS5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIHF1ZXJ5ID0gcXVlcnkucmVwbGFjZShXSElURV9TUEFDRVNfUkVfRywgJycpO1xuICAgICAgICB0bXBBcnIgPSBtYXAocXVlcnksIGZ1bmN0aW9uKGNoYXIpIHtcbiAgICAgICAgICAgIGlmIChTUEVDSUFMX0NIQVJBQ1RFUlNfUkUudGVzdChjaGFyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnXFxcXCcgKyBjaGFyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNoYXI7XG4gICAgICAgIH0pO1xuICAgICAgICByZWdRdWVyeSA9IG5ldyBSZWdFeHAodG1wQXJyLmpvaW4oV0hJVEVfU1BBQ0VTKSwgJ2dpJyk7XG5cbiAgICAgICAgcmV0dXJuIHRleHQucmVwbGFjZShyZWdRdWVyeSwgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgICAgICAgIHJldHVybiAnPHN0cm9uZz4nICsgbWF0Y2ggKyAnPC9zdHJvbmc+JztcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgZmlyc3QgcmVzdWx0IGl0ZW1cbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEZpcnN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29yZGVyU3RhZ2UodGhpcy5mbG93TWFwLkZJUlNUKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBsYXN0IHJlc3VsdCBpdGVtXG4gICAgICogQHJldHVybnMge2pRdWVyeX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRMYXN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29yZGVyU3RhZ2UodGhpcy5mbG93TWFwLkxBU1QpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gd2hldGhlciBmaXJzdCBvciBsYXN0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgRmlyc3QvZW5kIGVsZW1lbnQgdHlwZVxuICAgICAqIEByZXR1cm5zIHtqUXVlcnl8bnVsbH1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vcmRlclN0YWdlOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHZhciAkY2hpbGRyZW4gPSB0aGlzLiRyZXN1bHRMaXN0LmNoaWxkcmVuKCk7XG5cbiAgICAgICAgdHlwZSA9ICh0eXBlID09PSB0aGlzLmZsb3dNYXAuRklSU1QpID8gJ2ZpcnN0JyA6ICdsYXN0JztcbiAgICAgICAgcmV0dXJuICRjaGlsZHJlblt0eXBlXSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gbmV4dCBlbGVtZW50IGZyb20gc2VsZWN0ZWQgZWxlbWVudFxuICAgICAqIElmIG5leHQgZWxlbWVudCBpcyBub3QgZXhpc3QsIHJldHVybiBmaXJzdCBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWwgZm9jdXNlZCBlbGVtZW50XG4gICAgICogQHJldHVybnMge2pRdWVyeX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXROZXh0OiBmdW5jdGlvbigkZWwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29yZGVyRWxlbWVudCh0aGlzLmZsb3dNYXAuTkVYVCwgJGVsKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHByZXZpb3VzIGVsZW1lbnQgZnJvbSBzZWxlY3RlZCBlbGVtZW50XG4gICAgICogSWYgcHJldmlvdXMgZWxlbWVudCBpcyBub3QgZXhpc3QsIHJldHVybiB0aGUgbGFzdCBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWwgZm9jdXNlZCBlbGVtZW50XG4gICAgICogQHJldHVybnMge2pRdWVyeX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRQcmV2OiBmdW5jdGlvbigkZWwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29yZGVyRWxlbWVudCh0aGlzLmZsb3dNYXAuUFJFViwgJGVsKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHByZXZpb3VzIG9yIG5leHQgZWxlbWVudCBieSBkaXJlY3Rpb24uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgVGhlIGRpcmVjdGlvbiB0eXBlIGZvciBmaW5kaW5nIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsIGZvY3VzZWQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnl9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb3JkZXJFbGVtZW50OiBmdW5jdGlvbih0eXBlLCAkZWwpIHtcbiAgICAgICAgdmFyICRvcmRlcjtcblxuICAgICAgICBpZiAodHlwZSA9PT0gdGhpcy5mbG93TWFwLk5FWFQpIHtcbiAgICAgICAgICAgICRvcmRlciA9ICRlbC5uZXh0KCk7XG4gICAgICAgICAgICByZXR1cm4gJG9yZGVyLmxlbmd0aCA/ICRvcmRlciA6IHRoaXMuX2dldEZpcnN0KCk7XG4gICAgICAgIH1cbiAgICAgICAgJG9yZGVyID0gJGVsLnByZXYoKTtcbiAgICAgICAgcmV0dXJuICRvcmRlci5sZW5ndGggPyAkb3JkZXIgOiB0aGlzLl9nZXRMYXN0KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCB3aGV0aGVyIGF1dG8gY29tcGxldGUgdXNlIG9yIG5vdCBhbmQgY2hhbmdlIHN3aXRjaCdzIHN0YXRlLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3VzZUF1dG9Db21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpc1VzZSA9IHRoaXMuYXV0b0NvbXBsZXRlT2JqLmlzVXNlQXV0b0NvbXBsZXRlKCk7XG4gICAgICAgIHRoaXMuY2hhbmdlT25PZmZUZXh0KGlzVXNlKTtcbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouc2V0Q29va2llVmFsdWUoIWlzVXNlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyBhdXRvIGNvbXBsZXRlIHN3aXRjaCBhcmVhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2hvd0JvdHRvbUFyZWE6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy4kb25PZmZUeHQpIHtcbiAgICAgICAgICAgIHRoaXMuJG9uT2ZmVHh0LnNob3coKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIGF1dG8gY29tcGxldGUgc3dpdGNoIGFyZWFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9oaWRlQm90dG9tQXJlYTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLiRvbk9mZlR4dCkge1xuICAgICAgICAgICAgdGhpcy4kb25PZmZUeHQuaGlkZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSBhY3Rpb24gYXR0cmlidXRlIG9mIGZvcm0gZWxlbWVudCBhbmQgc2V0IGFkZGl0aW9uIHZhbHVlcyBpbiBoaWRkZW4gdHlwZSBlbGVtZW50cy5cbiAgICAgKiAoQ2FsbGVkIHdoZW4gY2xpY2sgdGhlIDxsaT4pXG4gICAgICogQHBhcmFtIHtlbGVtZW50fSBbJHRhcmdldF0gU3VibWl0IG9wdGlvbnMgdGFyZ2V0XG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqL1xuICAgIF9zZXRTdWJtaXRPcHRpb246IGZ1bmN0aW9uKCR0YXJnZXQpIHtcbiAgICAgICAgdmFyICRzZWxlY3RGaWVsZCA9ICR0YXJnZXQgPyAkKCR0YXJnZXQpLmNsb3Nlc3QoJ2xpJykgOiB0aGlzLiRzZWxlY3RlZEVsZW1lbnQsXG4gICAgICAgICAgICBwYXJhbXNTdHJpbmcgPSAkc2VsZWN0RmllbGQuZGF0YSgncGFyYW1zJyksXG4gICAgICAgICAgICBpbmRleCA9ICRzZWxlY3RGaWVsZC5kYXRhKCdpbmRleCcpLFxuICAgICAgICAgICAgY29uZmlnID0gdGhpcy5vcHRpb25zLmxpc3RDb25maWdbaW5kZXhdLFxuICAgICAgICAgICAgYWN0aW9uID0gdGhpcy5vcHRpb25zLmFjdGlvbnNbY29uZmlnLmFjdGlvbl0sXG4gICAgICAgICAgICAkZm9ybUVsZW1lbnQgPSB0aGlzLm9wdGlvbnMuZm9ybUVsZW1lbnQ7XG5cbiAgICAgICAgJGZvcm1FbGVtZW50LmF0dHIoJ2FjdGlvbicsIGFjdGlvbik7XG4gICAgICAgIHRoaXMuX2NsZWFyU3VibWl0T3B0aW9uKCk7XG4gICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnNldFBhcmFtcyhwYXJhbXNTdHJpbmcsIGluZGV4KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRmlyZWQgd2hlbiB0aGUgdXNlcidzIHNlbGVjdGVkIGVsZW1lbnQgaW4gcmVzdWx0IGxpc3QgaXMgY2hhbmdlZFxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBBdXRvQ29tcGxldGUjY2hhbmdlXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0gRGF0YSBmb3Igc3VibWl0XG4gICAgICAgICAqICBAcGFyYW0ge3N0cmluZ30gZGF0YS5pbmRleCAtIEluZGV4IG9mIGNvbGxlY3Rpb25cbiAgICAgICAgICogIEBwYXJhbSB7c3RyaW5nfSBkYXRhLmFjdGlvbiAtIEZvcm0gYWN0aW9uXG4gICAgICAgICAqICBAcGFyYW0ge3N0cmluZ30gZGF0YS5wYXJhbXMgLSBQYXJhbWV0ZXJzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5maXJlKCdjaGFuZ2UnLCB7XG4gICAgICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgICAgICBhY3Rpb246IGFjdGlvbixcbiAgICAgICAgICAgIHBhcmFtczogcGFyYW1zU3RyaW5nXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXNldCBmb3JtIGVsZW1lbnQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2xlYXJTdWJtaXRPcHRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJGZvcm1FbGVtZW50ID0gdGhpcy5vcHRpb25zLmZvcm1FbGVtZW50O1xuXG4gICAgICAgICRmb3JtRWxlbWVudC5maW5kKCcuaGlkZGVuLWlucHV0cycpLmh0bWwoJycpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXN1bHQgbGlzdCBtb3VzZW92ZXIgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IEV2ZW50IGluc3RhbnNlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25Nb3VzZU92ZXI6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpLFxuICAgICAgICAgICAgJGFyciA9IHRoaXMuJHJlc3VsdExpc3QuZmluZCgnbGknKSxcbiAgICAgICAgICAgICRzZWxlY3RlZEl0ZW0gPSAkdGFyZ2V0LmNsb3Nlc3QoJ2xpJyk7XG5cbiAgICAgICAgJGFyci5yZW1vdmVDbGFzcyh0aGlzLm1vdXNlT3ZlckNsYXNzKTtcbiAgICAgICAgaWYgKCRzZWxlY3RlZEl0ZW0uZmluZCgnLmtleXdvcmQtZmllbGQnKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICRzZWxlY3RlZEl0ZW0uYWRkQ2xhc3ModGhpcy5tb3VzZU92ZXJDbGFzcyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy4kc2VsZWN0ZWRFbGVtZW50ID0gJHRhcmdldDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVzdWx0IGxpc3QgY2xpY2sgZXZuZXQgaGFuZGxlclxuICAgICAqIFN1Ym1pdCBmb3JtIGVsZW1lbnQuXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgRXZlbnQgaW5zdGFuc2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkNsaWNrOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KSxcbiAgICAgICAgICAgICRmb3JtRWxlbWVudCA9IHRoaXMub3B0aW9ucy5mb3JtRWxlbWVudCxcbiAgICAgICAgICAgICRzZWxlY3RGaWVsZCA9ICR0YXJnZXQuY2xvc2VzdCgnbGknKSxcbiAgICAgICAgICAgICRrZXl3b3JkRmllbGQgPSAkc2VsZWN0RmllbGQuZmluZCgnLmtleXdvcmQtZmllbGQnKSxcbiAgICAgICAgICAgIHNlbGVjdGVkS2V5d29yZCA9ICRrZXl3b3JkRmllbGQudGV4dCgpO1xuXG4gICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnNldFZhbHVlKHNlbGVjdGVkS2V5d29yZCk7XG4gICAgICAgIGlmIChzZWxlY3RlZEtleXdvcmQpIHtcbiAgICAgICAgICAgIHRoaXMuX3NldFN1Ym1pdE9wdGlvbigkdGFyZ2V0KTtcbiAgICAgICAgICAgICRmb3JtRWxlbWVudC5zdWJtaXQoKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlc3VsdDtcbiJdfQ==
