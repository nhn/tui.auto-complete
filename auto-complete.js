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

/**
 * @constructor
 * @param {Object} htOptions
 * @example
 *  var autoCompleteObj = new ne.component.AutoComplete({
 *     "configId" : "Default"    // Dataset in autoConfig.js
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
 *  //     'toggleBtnElement' : $("#onoffBtn"),
 *  //
 *  //     // on,off State element
 *  //     'onoffTextElement' : $(".baseBox .bottom"),
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
     * @param {Object} htOptions autoconfig values
     */
    init: function(htOptions) {
        var cookieValue,
            defaultCookieName = '_atcp_use_cookie';

        this.options = {};

        if (!this._checkValidation(htOptions)) {
            return;
        }

        if (!this.options.toggleImg || !this.options.onoffTextElement) {
            this.isUse = true;
            delete this.options.onoffTextElement;
        } else {
            cookieValue = $.cookie(this.options.cookieName);
            this.isUse = !!(cookieValue === 'use' || !cookieValue);
        }

        if (!this.options.cookieName) {
            this.options.cookieName = defaultCookieName;
        }

        if (!tui.util.isExisty(this.options.watchInterval)) {
            this.options.watchInterval = this.watchInterval;
        }

        this.dataManager = new DataManager(this, this.options);
        this.inputManager = new InputManager(this, this.options);
        this.resultManager = new ResultManager(this, this.options);

        /**
         * Save matched input english string with Korean.
         * @type {null}
         */
        this.querys = null;
        this.isIdle = true;

        this.setToggleBtnImg(this.isUse);
        this.setCookieValue(this.isUse);
    },

    /**
     * Check required fields and validate fields.
     * @param {Object} htOptions component configurations
     * @returns {Boolean}
     * @private
     */
    _checkValidation: function(htOptions) {
        var config, configArr, configLen,
            i, requiredFields, checkedFields,
            configName, configValue;

        config = htOptions.config;
        if (!tui.util.isExisty(config)) {
            throw new Error('Config file is not avaliable. #' + config);
        }

        configArr = tui.util.keys(config);
        configLen = configArr.length;
        requiredFields = [
            'resultListElement',
            'searchBoxElement',
            'orgQueryElement',
            'subQuerySet',
            'template',
            'listConfig',
            'actions',
            'formElement',
            'searchUrl'
        ];
        checkedFields = [];

        for (i = 0; i < configLen; i += 1) {
            if (tui.util.inArray(configArr[i], requiredFields, 0) >= 0) {
                checkedFields.push(configArr[i]);
            }
        }

        tui.util.forEach(requiredFields, function(el) {
            if (tui.util.inArray(el, checkedFields, 0) === -1) {
                throw new Error(el + 'does not not exist.');
            }
        });

        for (i = 0; i < configLen; i += 1) {
            configName = configArr[i];
            configValue = config[configName];

            if (typeof configValue === 'string' &&
               (configValue.charAt(0) === '.' || configValue.charAt(0) === '#')) {
                this.options[configName] = $(configValue);
            } else {
                this.options[configName] = config[configName];
            }
        }

        return true;
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
     * @todo param - type??
     * Request to create addition parameters at inputManager.
     * @param {string} paramStr String to be addition parameters.(saperator '&')
     * @param {string} type Type
     */
    setParams: function(paramStr, type) {
        this.inputManager.setParams(paramStr, type);
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
     * @param {array} querys Result qureys
     */
    setQuerys: function(querys) {
        this.querys = [].concat(querys);
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
 * @fileoverview Data is kind of manager module to request data at API with input querys.
 * @version 1.1.0
 * @author NHN Entertainment FE dev team. <dl_javascript@nhnent.com>
 */
'use strict';

/**
 * Unit of auto complete connecting server.
 * @constructor
 */
var Data = tui.util.defineClass(/**@lends Data.prototype */{
    init: function(autoCompleteObj, options) {
        if (arguments.length !== 2) {
            alert('argument length error !');
            return;
        }

        this.autoCompleteObj = autoCompleteObj;
        this.options = options;
    },

    /**
     * Request data at api server use jsonp
     * @param {String} keyword String to request at server
     */
    request: function(keyword) {
        var rsKeyWrod = keyword.replace(/\s/g, ''),
            defaultParam, requestParam, keyDatas;

        if (!keyword || !rsKeyWrod) {
            this.autoCompleteObj.hideResultList();
            return;
        }

        defaultParam = {
            'q': keyword,
            'r_enc': 'UTF-8',
            'q_enc': 'UTF-8',
            'r_format': 'json',
            '_callback': 'dataCallback'
        };
        requestParam = tui.util.extend(this.options.searchApi, defaultParam);

        $.ajax(this.options.searchUrl, {
            'dataType': 'jsonp',
            'jsonpCallback': 'dataCallback',
            'data': requestParam,
            'type': 'get',
            'success': tui.util.bind(function(dataObj) {
                try {
                    keyDatas = this._getCollectionData(dataObj);
                    this.autoCompleteObj.setQuerys(dataObj.query);
                    this.autoCompleteObj.setServerData(keyDatas);
                    this.autoCompleteObj.clearReadyValue();
                } catch (e) {
                    throw new Error('[DataManager] Request faild.', e);
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

        tui.util.forEach(collection, function(itemSet) {
            var keys;

            if (tui.util.isEmpty(itemSet.items)) {
                return;
            }

            // create collection items.
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
            items = [];

        tui.util.forEachArray(itemSet.items, function(item, idx) {
            if (idx <= (this.options.viewCount - 1)) {
                items.push({
                    values: item,
                    type: type,
                    index: index,
                    dest: dest
                });
            }
        }, this);
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
        if (arguments.length !== 2) {
            alert('argument length error !');
            return;
        }
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
        this.inputValue = str;
        this.$searchBox.val(str);
    },

    /**
     * Read config files parameter option and set parameter.
     * @param {array} options The parameters from config
     * @param {number} index The index for setting key value
     */
    setParams: function(options, index) {
        var opt = this.options,
            listConfig = opt.listConfig[index],
            statics = opt.staticParams[listConfig.staticParams];

        if (options && tui.util.isString(options)) {
            options = options.split(',');
        }

        if ((!options || tui.util.isEmpty(options)) && !tui.util.isExisty(statics)) {
            return;
        }

        this._createParamSetByType(options, index);
    },

    /**
     * Create inputElement by type
     * @param {object} options The values to send search api
     * @param {number} index The index of query key array
     * @private
     */
    _createParamSetByType: function(options, index) {
        var opt = this.options,
            listConfig = opt.listConfig[index],
            config = opt.subQuerySet[listConfig.subQuerySet],
            statics = opt.staticParams[listConfig.staticParams];

        if (!this.hiddens) {
            this._createParamContainer();
        }

        tui.util.forEach(options, function(value, idx) {
            var key = config[idx];
            this.hiddens.append($('<input type="hidden" name="' + key + '" value="' + value + '" />'));
        }, this);

        if (statics) {
            this._createStaticParams(statics);
        }
    },

    /**
     * Create static parameters
     * @param {string} statics Static values
     * @private
     */
    _createStaticParams: function(statics) {
        statics = statics.split(',');
        tui.util.forEach(statics, function(value) {
            var val = value.split('=');
            this.hiddens.append($('<input type="hidden" name="' + val[0] + '" value="' + val[1] + '" />'));
        }, this);
    },

    /**
     * Create wrapper that become container of hidden elements.
     * @private
     */
    _createParamContainer: function() {
        this.hiddens = $('<div class="hidden-inputs"></div>');
        this.hiddens.hide();
        this.hiddens.appendTo($(this.$formElement));
    },

    /**
     * Change toggle button image.
     * @param {Boolean} isUse 자동완성 사용 여부
     */
    setToggleBtnImg: function(isUse) {
        if (!this.options.toggleImg || !(this.$toggleBtn)) {
            return;
        }

        if (isUse) {
            this.$toggleBtn.attr('src', this.options.toggleImg.on);
        } else {
            this.$toggleBtn.attr('src', this.options.toggleImg.off);
        }
    },

    /**************************** Private Functions **************************/
    /**
     * Event binding
     * @private
     */
    _attachEvent: function() {
        //검색창에 focus, keyup, keydown, click 이벤트 바인딩.
        this.$searchBox.bind('focus keyup keydown blur click', $.proxy(function(e) {
            switch (e.type) {
                case 'focus' :
                    this._onFocus();
                    break;
                case 'blur' :
                    this._onBlur(e);
                    break;
                case 'keyup' :
                    this._onKeyUp(e);
                    break;
                case 'keydown' :
                    this._onKeyDown(e);
                    break;
                case 'click' :
                    this._onClick();
                    break;
                default :
                    break;
            }
        }, this));

        if (this.$toggleBtn) {
            this.$toggleBtn.bind('click', $.proxy(function() {
                this._onClickToggle();
            }, this));
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

    /**************************** Event Handlers *****************************/
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
        if (this.$searchBox.val() === '') {
            this._setOrgQuery('');
            this.autoCompleteObj.setMoved(false);
        }

        if (this.inputValue !== this.$searchBox.val()) {
            this.inputValue = this.$searchBox.val();
            this._onChange();
        } else if (!this.autoCompleteObj.getMoved()) {
            this._setOrgQuery(this.$searchBox.val());
        }
    },

    /**
     * Input element keyup event handler
     * @private
     */
    _onKeyUp: function() {
        if (this.inputValue !== this.$searchBox.val()) {
            this.inputValue = this.$searchBox.val();
            this._onChange();
        }
    },

    /**
     * Input element onchange event handler
     * @private
     */
    _onChange: function() {
        if (!this.autoCompleteObj.isUseAutoComplete()) {
            return;
        }

        if (this.autoCompleteObj.isIdle) {
            this.autoCompleteObj.isIdle = false;
            this.autoCompleteObj.request(this.$searchBox.val());
        } else {
            this.autoCompleteObj.readyValue = this.$searchBox.val();
        }
    },

    /**
     * Input element blur event handler
     * @private
     */
    _onBlur: function() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    },

    /**
     * Input element keydown event handler
     * Set actino by input value
     * @param {Event} e keyDown Event instance
     * @private
     */
    _onKeyDown: function(e) {
        var autoCompleteObj = this.autoCompleteObj,
            code, flow, codeMap, flowMap;

        if (!autoCompleteObj.isUseAutoComplete() ||
            !autoCompleteObj.isShowResultList()) {
            return;
        }

        code = e.keyCode;
        flow = null;
        codeMap = this.keyCodeMap;
        flowMap = autoCompleteObj.flowMap;

        if (code === codeMap.TAB) {
            e.preventDefault();
            flow = e.shiftKey ? flowMap.NEXT : flowMap.PREV;
        } else if (code === codeMap.DOWN_ARROW) {
            flow = flowMap.NEXT;
        } else if (code === codeMap.UP_ARROW) {
            flow = flowMap.PREV;
        } else {
            return;
        }
        autoCompleteObj.moveNextList(flow);
    },

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
/**
 * Unit of auto complete that belong with search result list.
 * @constructor
 */
var Result = tui.util.defineClass(/** @lends Result.prototype */{
    init: function(autoCompleteObj, options) {
        this.autoCompleteObj = autoCompleteObj;
        this.options = options;

        this.$resultList = this.options.resultListElement;
        this.resultSelector = this.options.resultListElement;
        this.viewCount = this.options.viewCount || 10;
        this.$onOffTxt = this.options.onoffTextElement;
        this.mouseOverClass = this.options.mouseOverClass;
        this.flowMap = this.autoCompleteObj.flowMap;

        this._attachEvent();

        this.selectedElement = null;

        this.isMoved = false;
    },

    /**
     * Delete last result list
     * @private
     */
    _deleteBeforeElement: function() {
        this.$resultList.html('');
        this.$resultList.hide();
        this.selectedElement = null;
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

        this.$resultList.show();
        // show auto complete switch
        this._showBottomArea();
    },

    /**
     * Make search result list element
     * @param {Array} dataArr - Data array
     * @param {number} len - Length of dataArray
     * @private
     */
    _makeResultList: function(dataArr, len) {
        var template = this.options.template,
            config = this.options.listConfig,
            tmpl,
            useTitle = (this.options.useTitle && !!template.title),
            index,
            type,
            tmplValue,
            $el,
            i;

        for (i = 0; i < len; i += 1) {
            type = dataArr[i].type;
            index = dataArr[i].index;
            tmpl = config[index] ? template[config[index].template] : template.defaults;
            if (type === 'title') {
                tmpl = template.title;
                if (!useTitle) {
                    continue;
                }
            }
            tmplValue = this._getTmplData(tmpl.attr, dataArr[i]);
            $el = $(this._applyTemplate(tmpl.element, tmplValue));
            $el.attr('data-params', tmplValue.params);
            $el.attr('data-index', index);
            this.$resultList.append($el);
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
        return (this.$resultList.css('display') === 'block');
    },

    /**
     * Hide result list area
     */
    hideResultList: function() {
        this.$resultList.css('display', 'none');
        this._hideBottomArea();
        this.autoCompleteObj.isIdle = true;
        this.autoCompleteObj.fire('close');
    },

    /**
     * Show result list area
     */
    showResultList: function() {
        var self = this;
        setTimeout(function() {
            self.$resultList.css('display', 'block');
        }, 0);

        this._showBottomArea();
    },

    /**
     * Move focus to next item, change input element value as focus value.
     * @param {string} flow Direction by key code
     */
    moveNextList: function(flow) {
        var flowMap = this.flowMap,
            selectEl = this.selectedElement,
            getNext = (flow === flowMap.NEXT) ? this._getNext : this._getPrev,
            getBound = (flow === flowMap.NEXT) ? this._getFirst : this._getLast,
            keyword;
        this.isMoved = true;

        if (selectEl) {
            selectEl.removeClass(this.mouseOverClass);
            selectEl = this.selectedElement = getNext.call(this, selectEl);
        } else {
            selectEl = this.selectedElement = getBound.call(this);
        }

        keyword = selectEl.find('.keyword-field').text();

        if (selectEl && keyword) {
            selectEl.addClass(this.mouseOverClass);
            this.autoCompleteObj.setValue(keyword);
            this._setSubmitOption();
        } else if (selectEl) {
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
        this.$resultList.bind('mouseover click', $.proxy(function(e) {
            if (e.type === 'mouseover') {
                this._onMouseOver(e);
            } else if (e.type === 'click') {
                this._onClick(e);
            }
        }, this));

        if (this.$onOffTxt) {
            this.$onOffTxt.bind('click', $.proxy(function() {
                this._useAutoComplete();
            }, this));
        }

        $(document).bind('click', $.proxy(function(e) {
            if (e.target.tagName.toLowerCase() !== 'html') {
                return;
            }
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
        var temp = {},
            keyStr;

        tui.util.forEach(dataObj, function(value, key) {
            if (!dataObj.propertyIsEnumerable(key)) { //@todo: Is it necessary?
                return;
            }

            if (key === 'subject') {
                temp.subject = this._highlight(value);
            } else {
                temp[key] = value;
            }

            tmplStr = tmplStr.replace(new RegExp('@' + keyStr + '@', 'g'), temp[keyStr]);
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
        var querys = this.autoCompleteObj.querys,
            returnStr;

        tui.util.forEach(querys, function(query) {
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
        var escRegExp, tmpStr, tmpCharacters,
            tmpCharLen, tmpArr, returnStr,
            regQuery, cnt, i;

        if (!query || query.length < 1) {
            return text;
        }

        escRegExp = new RegExp('[.*+?|()\\[\\]{}\\\\]', 'g');
        tmpStr = query.replace(/()/g, ' ').replace(/^\s+|\s+$/g, '');
        tmpCharacters = tmpStr.match(/\S/g);
        tmpCharLen = tmpCharacters.length;
        tmpArr = [];
        returnStr = '';

        for (i = 0, cnt = tmpCharLen; i < cnt; i += 1) {
            tmpArr.push(
                tmpCharacters[i]
                    .replace(/[\S]+/g,
                        '['
                        + tmpCharacters[i].toLowerCase().replace(escRegExp, '\\$&')
                        + '|' + tmpCharacters[i].toUpperCase().replace(escRegExp, '\\$&')
                        + '] '
                    )
                    .replace(/[\s]+/g, '[\\s]*')
            );
        }

        tmpStr = '(' + tmpArr.join('') + ')';
        regQuery = new RegExp(tmpStr);

        if (regQuery.test(text)) {
            returnStr = text.replace(regQuery, '<strong>' + RegExp.$1 + '</strong>');
        }

        return returnStr;
    },

    /**
     * Return the first result item
     * @returns {Element}
     * @private
     */
    _getFirst: function() {
        return this._orderStage(this.flowMap.FIRST);
    },

    /**
     * Return the last result item
     * @returns {Element}
     * @private
     */
    _getLast: function() {
        return this._orderStage(this.flowMap.LAST);
    },

    /**
     * Return whether first or last
     * @param {string} type First/end element type
     * @returns {*}
     * @private
     */
    _orderStage: function(type) {
        type = (type === this.flowMap.FIRST) ? 'first' : 'last';

        if (this.$resultList &&
            this.$resultList.children() &&
            this.$resultList.children().length) {
            return this.$resultList.children()[type]();
        }
        return null;
    },

    /**
     * Return next element from selected element
     * If next element is not exist, return first element.
     * @param {Element} element focused element
     * @returns {Element}
     * @private
     */
    _getNext: function(element) {
        return this._orderElement(this.flowMap.NEXT, element);
    },

    /**
     * Return previous element from selected element
     * If previous element is not exist, return the last element.
     * @param {Element} element focused element
     * @returns {Element}
     * @private
     */
    _getPrev: function(element) {
        return this._orderElement(this.flowMap.PREV, element);
    },

    /**
     * Return previous or next element by direction.
     * @param {string} type The direction type for finding element
     * @param {Element} element focused element
     * @returns {*}
     * @private
     */
    _orderElement: function(type, element) {
        var $current, isNext, order;

        if (!tui.util.isExisty(element)) {
            return null;
        }

        $current = $(element);
        isNext = (type === this.flowMap.NEXT);
        if ($current.closest(this.resultSelector)) {
            order = isNext ? element.next() : element.prev();
            if (order.length) {
                return order;
            }
            return isNext ? this._getFirst() : this._getLast();
        }
        return null;
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
     * @param {element} [$target] Submit options target
     * @private
     */
    _setSubmitOption: function($target) {
        var formElement, $selectField, actions,
            index, config, action, paramsString;

        this._clearSubmitOption();
        formElement = this.options.formElement;
        $selectField = $target ? $($target).closest('li') : $(this.selectedElement);
        actions = this.options.actions;
        index = $selectField.attr('data-index');
        config = this.options.listConfig[index];
        action = actions[config.action];

        $(formElement).attr('action', action);
        paramsString = $selectField.attr('data-params');

        this.autoCompleteObj.setParams(paramsString, index);

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
        var formElement = this.options.formElement,
            hiddenWrap = $(formElement).find('.hidden-inputs');

        hiddenWrap.html('');
    },

    /************************* Event Handlers *********************/
    /**
     * Result list mouseover event handler
     * @param {Event} e Event instanse
     * @private
     */
    _onMouseOver: function(e) {
        var $target = $(e.target),
            $arr = this.$resultList.find('li'),
            selectedItem = $target.closest('li');

        tui.util.forEachArray($arr, function(val) {
            $(val).removeClass(this.mouseOverClass);
        }, this);

        if (selectedItem && selectedItem.find('.keyword-field').length) {
            selectedItem.addClass(this.mouseOverClass);
        }

        this.selectedElement = $target;
    },

    /**
     * Result list click evnet handler
     * Submit form element.
     * @param {Event} e Event instanse
     * @private
     */
    _onClick: function(e) {
        var $target = $(e.target),
            formElement = this.options.formElement,
            $selectField = $target.closest('li'),
            $keywordField = $selectField.find('.keyword-field'),
            selectedKeyword = $keywordField.text();

        this.autoCompleteObj.setValue(selectedKeyword);

        if (formElement && selectedKeyword) {
            this._setSubmitOption($target);
            formElement.submit();
        }
    }
});

module.exports = Result;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9BdXRvQ29tcGxldGUuanMiLCJzcmMvanMvbWFuYWdlci9kYXRhLmpzIiwic3JjL2pzL21hbmFnZXIvaW5wdXQuanMiLCJzcmMvanMvbWFuYWdlci9yZXN1bHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25iQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ0dWkudXRpbC5kZWZpbmVOYW1lc3BhY2UoJ3R1aS5jb21wb25lbnQuQXV0b0NvbXBsZXRlJywgcmVxdWlyZSgnLi9zcmMvanMvQXV0b0NvbXBsZXRlJykpO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEF1dG8gY29tcGxldGUncyBDb3JlIGVsZW1lbnQuIEFsbCBvZiBhdXRvIGNvbXBsZXRlIG9iamVjdHMgYmVsb25nIHdpdGggdGhpcyBvYmplY3QuXG4gKiBAdmVyc2lvbiAxLjEuMFxuICogQGF1dGhvciBOSE4gRW50ZXJ0YWlubWVudCBGRSBEZXYgVGVhbS4gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBEYXRhTWFuYWdlciA9IHJlcXVpcmUoJy4vbWFuYWdlci9kYXRhJyksXG4gICAgSW5wdXRNYW5hZ2VyID0gcmVxdWlyZSgnLi9tYW5hZ2VyL2lucHV0JyksXG4gICAgUmVzdWx0TWFuYWdlciA9IHJlcXVpcmUoJy4vbWFuYWdlci9yZXN1bHQnKTtcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBodE9wdGlvbnNcbiAqIEBleGFtcGxlXG4gKiAgdmFyIGF1dG9Db21wbGV0ZU9iaiA9IG5ldyBuZS5jb21wb25lbnQuQXV0b0NvbXBsZXRlKHtcbiAqICAgICBcImNvbmZpZ0lkXCIgOiBcIkRlZmF1bHRcIiAgICAvLyBEYXRhc2V0IGluIGF1dG9Db25maWcuanNcbiAqICB9KTtcbiAqXG4gKiAgLy8gVGhlIGZvcm0gb2YgY29uZmlnIGZpbGUgXCJhdXRvQ29uZmlnLmpzXCJcbiAqICAvLyB2YXIgRGVmYXVsdCA9IHtcbiAqICAvLyAgICAgLy8gUmVzdWx0IGVsZW1lbnRcbiAqICAvLyAgICAgJ3Jlc3VsdExpc3RFbGVtZW50JzogJy5fcmVzdWx0Qm94JyxcbiAqICAvL1xuICogIC8vICAgICAvLyBJbnB1dCBlbGVtZW50XG4gKiAgLy8gICAgICdzZWFyY2hCb3hFbGVtZW50JzogICcjYWNfaW5wdXQxJyxcbiAqICAvL1xuICogIC8vICAgICAvLyBIaWRkZW4gZWxlbWVudCB0aGF0IGlzIGZvciB0aHJvd2luZyBxdWVyeSB0aGF0IHVzZXIgdHlwZS5cbiAqICAvLyAgICAgJ29yZ1F1ZXJ5RWxlbWVudCcgOiAnI29yZ19xdWVyeScsXG4gKiAgLy9cbiAqICAvLyAgICAgLy8gb24sb2ZmIEJ1dHRvbiBlbGVtZW50XG4gKiAgLy8gICAgICd0b2dnbGVCdG5FbGVtZW50JyA6ICQoXCIjb25vZmZCdG5cIiksXG4gKiAgLy9cbiAqICAvLyAgICAgLy8gb24sb2ZmIFN0YXRlIGVsZW1lbnRcbiAqICAvLyAgICAgJ29ub2ZmVGV4dEVsZW1lbnQnIDogJChcIi5iYXNlQm94IC5ib3R0b21cIiksXG4gKiAgLy9cbiAqICAvLyAgICAgLy8gb24sIG9mZiBTdGF0ZSBpbWFnZSBzb3VyY2VcbiAqICAvLyAgICAgJ3RvZ2dsZUltZycgOiB7XG4gKiAgLy8gICAgICAgICAnb24nIDogJy4uL2ltZy9idG5fb24uanBnJyxcbiAqICAvLyAgICAgICAgICdvZmYnIDogJy4uL2ltZy9idG5fb2ZmLmpwZydcbiAqICAvLyAgICAgfSxcbiAqICAvL1xuICogIC8vICAgICAvLyBDb2xsZWN0aW9uIGl0ZW1zIGVhY2ggY291bnQuXG4gKiAgLy8gICAgICd2aWV3Q291bnQnIDogMyxcbiAqICAvL1xuICogIC8vICAgICAvLyBLZXkgYXJyYXlzIChzdWIgcXVlcnkga2V5cycgYXJyYXkpXG4gKiAgLy8gICAgICdzdWJRdWVyeVNldCc6IFtcbiAqICAvLyAgICAgICAgIFsna2V5MScsICdrZXkyJywgJ2tleTMnXSxcbiAqICAvLyAgICAgICAgIFsnZGVwMScsICdkZXAyJywgJ2RlcDMnXSxcbiAqICAvLyAgICAgICAgIFsnY2gxJywgJ2NoMicsICdjaDMnXSxcbiAqICAvLyAgICAgICAgIFsnY2lkJ11cbiAqICAvLyAgICAgXSxcbiAqICAvL1xuICogIC8vICAgICAvLyBDb25maWcgZm9yIGF1dG8gY29tcGxldGUgbGlzdCBieSBpbmRleCBvZiBjb2xsZWN0aW9uXG4gKiAgLy8gICAgICdsaXN0Q29uZmlnJzoge1xuICogIC8vICAgICAgICAgJzAnOiB7XG4gKiAgLy8gICAgICAgICAgICAgJ3RlbXBsYXRlJzogJ2RlcGFydG1lbnQnLFxuICogIC8vICAgICAgICAgICAgICdzdWJRdWVyeVNldCcgOiAwLFxuICogIC8vICAgICAgICAgICAgICdhY3Rpb24nOiAwXG4gKiAgLy8gICAgICAgICB9LFxuICogIC8vICAgICAgICAgJzEnOiB7XG4gKiAgLy8gICAgICAgICAgICAgJ3RlbXBsYXRlJzogJ3NyY2hfaW5fZGVwYXJ0bWVudCcsXG4gKiAgLy8gICAgICAgICAgICAgJ3N1YlF1ZXJ5U2V0JyA6IDEsXG4gKiAgLy8gICAgICAgICAgICAgJ2FjdGlvbic6IDBcbiAqICAvLyAgICAgICAgIH0sXG4gKiAgLy8gICAgICAgICAnMic6IHtcbiAqICAvLyAgICAgICAgICAgICAndGVtcGxhdGUnOiAnc3JjaF9pbl9kZXBhcnRtZW50JyxcbiAqICAvLyAgICAgICAgICAgICAnc3ViUXVlcnlTZXQnIDogMixcbiAqICAvLyAgICAgICAgICAgICAnYWN0aW9uJzogMSxcbiAqICAvLyAgICAgICAgICAgICAnc3RhdGljUGFyYW1zJzogMFxuICogIC8vICAgICAgICAgfSxcbiAqICAvLyAgICAgICAgICczJzoge1xuICogIC8vICAgICAgICAgICAgICd0ZW1wbGF0ZSc6ICdkZXBhcnRtZW50JyxcbiAqICAvLyAgICAgICAgICAgICAnc3ViUXVlcnlTZXQnIDogMCxcbiAqICAvLyAgICAgICAgICAgICAnYWN0aW9uJzogMSxcbiAqICAvLyAgICAgICAgICAgICAnc3RhdGljUGFyYW1zJzogMVxuICogIC8vICAgICAgICAgfVxuICogIC8vICAgICB9LFxuICogIC8vXG4gKiAgLy8gICAgIC8vIE1hcmsgdXAgZm9yIGVhY2ggY29sbGVjdGlvbi4gKERlZmF1bHQgbWFya3VwIGlzIGRlZmF1bHRzLilcbiAqICAvLyAgICAgLy8gVGhpcyBtYXJrdXAgaGFzIHRvIGhhdmUgXCJrZXl3b2xkLWZpZWxkXCIgYnV0IHRpdGxlLlxuICogIC8vICAgICAndGVtcGxhdGUnOiB7XG4gKiAgLy8gICAgICAgICBkZXBhcnRtZW50OiB7XG4gKiAgLy8gICAgICAgICAgICAgZWxlbWVudDogJzxsaSBjbGFzcz1cImRlcGFydG1lbnRcIj4nICtcbiAqICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cInNsb3QtZmllbGRcIj5TaG9wIHRoZTwvc3Bhbj4gJyArXG4gKiAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAnPGEgaHJlZj1cIiNcIiBjbGFzcz1cImtleXdvcmQtZmllbGRcIj5Ac3ViamVjdEA8L2E+ICcgK1xuICogIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwic2xvdC1maWVsZFwiPlN0b3JlPC9zcGFuPicgK1xuICogIC8vICAgICAgICAgICAgICAgICAgICAgICAnPC9saT4nLFxuICogIC8vICAgICAgICAgICAgIGF0dHI6IFsnc3ViamVjdCddXG4gKiAgLy8gICAgICAgICB9LFxuICogIC8vICAgICAgICAgc3JjaDoge1xuICogIC8vICAgICAgICAgICAgIGVsZW1lbnQ6ICc8bGkgY2xhc3M9XCJzcmNoXCI+PHNwYW4gY2xhc3M9XCJrZXl3b3JkLWZpZWxkXCI+QHN1YmplY3RAPC9zcGFuPjwvbGk+JyxcbiAqICAvLyAgICAgICAgICAgICBhdHRyOiBbJ3N1YmplY3QnXVxuICogIC8vICAgICAgICAgfSxcbiAqICAvLyAgICAgICAgIHNyY2hfaW5fZGVwYXJ0bWVudDoge1xuICogIC8vICAgICAgICAgICAgIGVsZW1lbnQ6ICc8bGkgY2xhc3M9XCJpbkRlcGFydG1lbnRcIj4nICtcbiAqICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgJzxhIGhyZWY9XCIjXCIgY2xhc3M9XCJrZXl3b3JkLWZpZWxkXCI+QHN1YmplY3RAPC9hPiAnICtcbiAqICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwic2xvdC1maWVsZFwiPmluIDwvc3Bhbj4nICtcbiAqICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiZGVwYXJ0LWZpZWxkXCI+QGRlcGFydG1lbnRAPC9zcGFuPicgK1xuICogIC8vICAgICAgICAgICAgICAgICAgICAgICc8L2xpPicsXG4gKiAgLy8gICAgICAgICAgICAgYXR0cjogWydzdWJqZWN0JywgJ2RlcGFydG1lbnQnXVxuICogIC8vICAgICAgICAgfSxcbiAqICAvLyAgICAgICAgIHRpdGxlOiB7XG4gKiAgLy8gICAgICAgICAgICAgZWxlbWVudDogJzxsaSBjbGFzcz1cInRpdGxlXCI+PHNwYW4+QHRpdGxlQDwvc3Bhbj48L2xpPicsXG4gKiAgLy8gICAgICAgICAgICAgYXR0cjogWyd0aXRsZSddXG4gKiAgLy8gICAgICAgICB9LFxuICogIC8vICAgICAgICAgZGVmYXVsdHM6IHtcbiAqICAvLyAgICAgICAgICAgICBlbGVtZW50OiAnPGxpIGNsYXNzPVwic3JjaFwiPjxzcGFuIGNsYXNzPVwia2V5d29yZC1maWVsZFwiPkBzdWJqZWN0QDwvc3Bhbj48L2xpPicsXG4gKiAgLy8gICAgICAgICAgICAgYXR0cjogWydzdWJqZWN0J11cbiAqICAvLyAgICAgICAgIH1cbiAqICAvLyAgICAgfSxcbiAqICAvL1xuICogIC8vICAgICAvLyBBY3Rpb24gYXR0cmlidXRlIGZvciBlYWNoIGNvbGxlY3Rpb25cbiAqICAvLyAgICAgJ2FjdGlvbnMnOiBbXG4gKiAgLy8gICAgICAgICBcImh0dHA6Ly93d3cuZmFzaGlvbmdvLm5ldC9jYXRhbG9nLmFzcHhcIixcbiAqICAvLyAgICAgICAgIFwiaHR0cDovL3d3dy5mYXNoaW9uZ28ubmV0L3NlYXJjaDIuYXNweFwiXG4gKiAgLy8gICAgIF0sXG4gKiAgLy9cbiAqICAvLyAgICAgLy8gU2V0IHN0YXRpYyBvcHRpb25zIGZvciBlYWNoIGNvbGxlY3Rpb24uXG4gKiAgLy8gICAgICdzdGF0aWNQYXJhbXMnOltcbiAqICAvLyAgICAgICAgIFwicXQ9UHJvZHVjdE5hbWVcIixcbiAqICAvLyAgICAgICAgIFwiYXQ9VEVTVCxidD1BQ1RcIlxuICogIC8vICAgICBdLFxuICogIC8vXG4gKiAgLy8gICAgIC8vIFdoZXRoZXIgdXNlIHRpdGxlIG9yIG5vdC5cbiAqICAvLyAgICAgJ3VzZVRpdGxlJzogdHJ1ZSxcbiAqICAvL1xuICogIC8vICAgICAvLyBGb3JtIGVsZW1lbnQgdGhhdCBpbmNsdWRlIHNlYXJjaCBlbGVtZW50XG4gKiAgLy8gICAgICdmb3JtRWxlbWVudCcgOiAnI2FjX2Zvcm0xJyxcbiAqICAvL1xuICogIC8vICAgICAvLyBDb29raWUgbmFtZSBmb3Igc2F2ZSBzdGF0ZVxuICogIC8vICAgICAnY29va2llTmFtZScgOiBcInVzZWNvb2tpZVwiLFxuICogIC8vXG4gKiAgLy8gICAgIC8vIENsYXNzIG5hbWUgZm9yIHNlbGVjdGVkIGVsZW1lbnRcbiAqICAvLyAgICAgJ21vdXNlT3ZlckNsYXNzJyA6ICdlbXAnLFxuICogIC8vXG4gKiAgLy8gICAgIC8vIEF1dG8gY29tcGxldGUgQVBJXG4gKiAgLy8gICAgICdzZWFyY2hVcmwnIDogJ2h0dHA6Ly8xMC4yNC4xMzYuMTcyOjIwMDExL2FjJyxcbiAqICAvL1xuICogIC8vICAgICAvLyBBdXRvIGNvbXBsZXRlIEFQSSByZXF1ZXN0IGNvbmZpZ1xuICogIC8vICAgICAnc2VhcmNoQXBpJyA6IHtcbiAqICAvLyAgICAgICAgICdzdCcgOiAxMTExLFxuICogIC8vICAgICAgICAgJ3JfbHQnIDogMTExMSxcbiAqICAvLyAgICAgICAgICdyX2VuYycgOiAnVVRGLTgnLFxuICogIC8vICAgICAgICAgJ3FfZW5jJyA6ICdVVEYtOCcsXG4gKiAgLy8gICAgICAgICAncl9mb3JtYXQnIDogJ2pzb24nXG4gKiAgLy8gICAgIH1cbiAqICAvLyB9XG4gKi9cbnZhciBBdXRvQ29tcGxldGUgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKipAbGVuZHMgQXV0b0NvbXBsZXRlLnByb3RvdHlwZSAqL3tcbiAgICAvKipcbiAgICAgKiBEaXJlY3Rpb24gdmFsdWUgZm9yIGtleVxuICAgICAqL1xuICAgIGZsb3dNYXA6IHtcbiAgICAgICAgJ05FWFQnOiAnbmV4dCcsXG4gICAgICAgICdQUkVWJzogJ3ByZXYnLFxuICAgICAgICAnRklSU1QnOiAnZmlyc3QnLFxuICAgICAgICAnTEFTVCc6ICdsYXN0J1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogSW50ZXJ2YWwgZm9yIGNoZWNrIHVwZGF0ZSBpbnB1dFxuICAgICAqL1xuICAgIHdhdGNoSW50ZXJ2YWw6IDIwMCxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaHRPcHRpb25zIGF1dG9jb25maWcgdmFsdWVzXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24oaHRPcHRpb25zKSB7XG4gICAgICAgIHZhciBjb29raWVWYWx1ZSxcbiAgICAgICAgICAgIGRlZmF1bHRDb29raWVOYW1lID0gJ19hdGNwX3VzZV9jb29raWUnO1xuXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHt9O1xuXG4gICAgICAgIGlmICghdGhpcy5fY2hlY2tWYWxpZGF0aW9uKGh0T3B0aW9ucykpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnRvZ2dsZUltZyB8fCAhdGhpcy5vcHRpb25zLm9ub2ZmVGV4dEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuaXNVc2UgPSB0cnVlO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMub3B0aW9ucy5vbm9mZlRleHRFbGVtZW50O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29va2llVmFsdWUgPSAkLmNvb2tpZSh0aGlzLm9wdGlvbnMuY29va2llTmFtZSk7XG4gICAgICAgICAgICB0aGlzLmlzVXNlID0gISEoY29va2llVmFsdWUgPT09ICd1c2UnIHx8ICFjb29raWVWYWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5jb29raWVOYW1lKSB7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuY29va2llTmFtZSA9IGRlZmF1bHRDb29raWVOYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0dWkudXRpbC5pc0V4aXN0eSh0aGlzLm9wdGlvbnMud2F0Y2hJbnRlcnZhbCkpIHtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy53YXRjaEludGVydmFsID0gdGhpcy53YXRjaEludGVydmFsO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5kYXRhTWFuYWdlciA9IG5ldyBEYXRhTWFuYWdlcih0aGlzLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICB0aGlzLmlucHV0TWFuYWdlciA9IG5ldyBJbnB1dE1hbmFnZXIodGhpcywgdGhpcy5vcHRpb25zKTtcbiAgICAgICAgdGhpcy5yZXN1bHRNYW5hZ2VyID0gbmV3IFJlc3VsdE1hbmFnZXIodGhpcywgdGhpcy5vcHRpb25zKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2F2ZSBtYXRjaGVkIGlucHV0IGVuZ2xpc2ggc3RyaW5nIHdpdGggS29yZWFuLlxuICAgICAgICAgKiBAdHlwZSB7bnVsbH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucXVlcnlzID0gbnVsbDtcbiAgICAgICAgdGhpcy5pc0lkbGUgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuc2V0VG9nZ2xlQnRuSW1nKHRoaXMuaXNVc2UpO1xuICAgICAgICB0aGlzLnNldENvb2tpZVZhbHVlKHRoaXMuaXNVc2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayByZXF1aXJlZCBmaWVsZHMgYW5kIHZhbGlkYXRlIGZpZWxkcy5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaHRPcHRpb25zIGNvbXBvbmVudCBjb25maWd1cmF0aW9uc1xuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NoZWNrVmFsaWRhdGlvbjogZnVuY3Rpb24oaHRPcHRpb25zKSB7XG4gICAgICAgIHZhciBjb25maWcsIGNvbmZpZ0FyciwgY29uZmlnTGVuLFxuICAgICAgICAgICAgaSwgcmVxdWlyZWRGaWVsZHMsIGNoZWNrZWRGaWVsZHMsXG4gICAgICAgICAgICBjb25maWdOYW1lLCBjb25maWdWYWx1ZTtcblxuICAgICAgICBjb25maWcgPSBodE9wdGlvbnMuY29uZmlnO1xuICAgICAgICBpZiAoIXR1aS51dGlsLmlzRXhpc3R5KGNvbmZpZykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ29uZmlnIGZpbGUgaXMgbm90IGF2YWxpYWJsZS4gIycgKyBjb25maWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uZmlnQXJyID0gdHVpLnV0aWwua2V5cyhjb25maWcpO1xuICAgICAgICBjb25maWdMZW4gPSBjb25maWdBcnIubGVuZ3RoO1xuICAgICAgICByZXF1aXJlZEZpZWxkcyA9IFtcbiAgICAgICAgICAgICdyZXN1bHRMaXN0RWxlbWVudCcsXG4gICAgICAgICAgICAnc2VhcmNoQm94RWxlbWVudCcsXG4gICAgICAgICAgICAnb3JnUXVlcnlFbGVtZW50JyxcbiAgICAgICAgICAgICdzdWJRdWVyeVNldCcsXG4gICAgICAgICAgICAndGVtcGxhdGUnLFxuICAgICAgICAgICAgJ2xpc3RDb25maWcnLFxuICAgICAgICAgICAgJ2FjdGlvbnMnLFxuICAgICAgICAgICAgJ2Zvcm1FbGVtZW50JyxcbiAgICAgICAgICAgICdzZWFyY2hVcmwnXG4gICAgICAgIF07XG4gICAgICAgIGNoZWNrZWRGaWVsZHMgPSBbXTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY29uZmlnTGVuOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGlmICh0dWkudXRpbC5pbkFycmF5KGNvbmZpZ0FycltpXSwgcmVxdWlyZWRGaWVsZHMsIDApID49IDApIHtcbiAgICAgICAgICAgICAgICBjaGVja2VkRmllbGRzLnB1c2goY29uZmlnQXJyW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2gocmVxdWlyZWRGaWVsZHMsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICBpZiAodHVpLnV0aWwuaW5BcnJheShlbCwgY2hlY2tlZEZpZWxkcywgMCkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVsICsgJ2RvZXMgbm90IG5vdCBleGlzdC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvbmZpZ0xlbjsgaSArPSAxKSB7XG4gICAgICAgICAgICBjb25maWdOYW1lID0gY29uZmlnQXJyW2ldO1xuICAgICAgICAgICAgY29uZmlnVmFsdWUgPSBjb25maWdbY29uZmlnTmFtZV07XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgY29uZmlnVmFsdWUgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICAgICAoY29uZmlnVmFsdWUuY2hhckF0KDApID09PSAnLicgfHwgY29uZmlnVmFsdWUuY2hhckF0KDApID09PSAnIycpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zW2NvbmZpZ05hbWVdID0gJChjb25maWdWYWx1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1tjb25maWdOYW1lXSA9IGNvbmZpZ1tjb25maWdOYW1lXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0IGRhdGEgYXQgYXBpIHNlcnZlciB3aXRoIGtleXdvcmRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5d29yZCBUaGUga2V5IHdvcmQgdG8gc2VuZCB0byBBdXRvIGNvbXBsZXRlIEFQSVxuICAgICAqL1xuICAgIHJlcXVlc3Q6IGZ1bmN0aW9uKGtleXdvcmQpIHtcbiAgICAgICAgdGhpcy5kYXRhTWFuYWdlci5yZXF1ZXN0KGtleXdvcmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gc3RyaW5nIGluIGlucHV0IGVsZW1lbnQuXG4gICAgICogQHJldHVybnMge1N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlucHV0TWFuYWdlci5nZXRWYWx1ZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgaW5wdXRNYW5hZ2VyJ3MgdmFsdWUgdG8gc2hvdyBhdCBzZWFyY2ggZWxlbWVudFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBrZXl3b3JkIFRoZSBzdHJpbmcgdG8gc2hvdyB1cCBhdCBzZWFyY2ggZWxlbWVudFxuICAgICAqL1xuICAgIHNldFZhbHVlOiBmdW5jdGlvbihrZXl3b3JkKSB7XG4gICAgICAgIHRoaXMuaW5wdXRNYW5hZ2VyLnNldFZhbHVlKGtleXdvcmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAdG9kbyBwYXJhbSAtIHR5cGU/P1xuICAgICAqIFJlcXVlc3QgdG8gY3JlYXRlIGFkZGl0aW9uIHBhcmFtZXRlcnMgYXQgaW5wdXRNYW5hZ2VyLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJhbVN0ciBTdHJpbmcgdG8gYmUgYWRkaXRpb24gcGFyYW1ldGVycy4oc2FwZXJhdG9yICcmJylcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBUeXBlXG4gICAgICovXG4gICAgc2V0UGFyYW1zOiBmdW5jdGlvbihwYXJhbVN0ciwgdHlwZSkge1xuICAgICAgICB0aGlzLmlucHV0TWFuYWdlci5zZXRQYXJhbXMocGFyYW1TdHIsIHR5cGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0IHRvIGRyYXcgcmVzdWx0IGF0IHJlc3VsdE1hbmFnZXIgd2l0aCBkYXRhIGZyb20gYXBpIHNlcnZlci5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBkYXRhQXJyIERhdGEgYXJyYXkgZnJvbSBhcGkgc2VydmVyXG4gICAgICovXG4gICAgc2V0U2VydmVyRGF0YTogZnVuY3Rpb24oZGF0YUFycikge1xuICAgICAgICB0aGlzLnJlc3VsdE1hbmFnZXIuZHJhdyhkYXRhQXJyKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IENvb2tpZSB2YWx1ZSB3aXRoIHdoZXRoZXIgdXNlIGF1dG8gY29tcGxldGUgb3Igbm90XG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpc1VzZSBXaGV0aGVyIHVzZSBhdXRvIGNvbXBsZXRlIG9yIG5vdFxuICAgICAqL1xuICAgIHNldENvb2tpZVZhbHVlOiBmdW5jdGlvbihpc1VzZSkge1xuICAgICAgICAkLmNvb2tpZSh0aGlzLm9wdGlvbnMuY29va2llTmFtZSwgaXNVc2UgPyAndXNlJyA6ICdub3RVc2UnKTtcbiAgICAgICAgdGhpcy5pc1VzZSA9IGlzVXNlO1xuICAgICAgICB0aGlzLnNldFRvZ2dsZUJ0bkltZyhpc1VzZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNhdmUgS29yZWFuIHRoYXQgaXMgbWF0Y2hlZCByZWFsIHF1ZXJ5LlxuICAgICAqIEBwYXJhbSB7YXJyYXl9IHF1ZXJ5cyBSZXN1bHQgcXVyZXlzXG4gICAgICovXG4gICAgc2V0UXVlcnlzOiBmdW5jdGlvbihxdWVyeXMpIHtcbiAgICAgICAgdGhpcy5xdWVyeXMgPSBbXS5jb25jYXQocXVlcnlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdoZXRoZXIgdXNlIGF1dG8gY29tcGxldGUgb3Igbm90XG4gICAgICogQGFwaVxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgICAqIEBleGFtcGxlXG4gICAgICogIGF1dG9Db21wbGV0ZS5pc1VzZUF1dG9Db21wbGV0ZSgpOyA9PiB0cnVlfGZhbHNlXG4gICAgICovXG4gICAgaXNVc2VBdXRvQ29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc1VzZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdoZXRoZXIgcmVzdWx0IGxpc3QgYXJlYSBzaG93IG9yIG5vdFxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzU2hvd1Jlc3VsdExpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHRNYW5hZ2VyLmlzU2hvd1Jlc3VsdExpc3QoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hhbmdlIHRvZ2dsZSBidXR0b24gaW1hZ2UgYnkgYXV0byBjb21wbGV0ZSBzdGF0ZVxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNVc2Ugd2hldGhlciB1c2UgYXV0byBjb21wbGV0ZSBvciBub3RcbiAgICAgKi9cbiAgICBzZXRUb2dnbGVCdG5JbWc6IGZ1bmN0aW9uKGlzVXNlKSB7XG4gICAgICAgIHRoaXMuaW5wdXRNYW5hZ2VyLnNldFRvZ2dsZUJ0bkltZyhpc1VzZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgc2VhcmNoIHJlc3VsdCBsaXN0IGFyZWFcbiAgICAgKi9cbiAgICBoaWRlUmVzdWx0TGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmlzVXNlQXV0b0NvbXBsZXRlKCkpIHtcbiAgICAgICAgICAgIHRoaXMucmVzdWx0TWFuYWdlci5oaWRlUmVzdWx0TGlzdCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgc2VhcmNoIHJlc3VsdCBsaXN0IGFyZWFcbiAgICAgKi9cbiAgICBzaG93UmVzdWx0TGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmlzVXNlQXV0b0NvbXBsZXRlKCkpIHtcbiAgICAgICAgICAgIHRoaXMucmVzdWx0TWFuYWdlci5zaG93UmVzdWx0TGlzdCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1vdmUgdG8gbmV4dCBpdGVtIGluIHJlc3VsdCBsaXN0LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmbG93IERpcmVjdGlvbiB0byBtb3ZlLlxuICAgICAqL1xuICAgIG1vdmVOZXh0TGlzdDogZnVuY3Rpb24oZmxvdykge1xuICAgICAgICB0aGlzLnJlc3VsdE1hbmFnZXIubW92ZU5leHRMaXN0KGZsb3cpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGV4dCB0byBhdXRvIGNvbXBsZXRlIHN3aXRjaFxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNVc2UgV2hldGhlciB1c2UgYXV0byBjb21wbGV0ZSBvciBub3RcbiAgICAgKi9cbiAgICBjaGFuZ2VPbk9mZlRleHQ6IGZ1bmN0aW9uKGlzVXNlKSB7XG4gICAgICAgIHRoaXMucmVzdWx0TWFuYWdlci5jaGFuZ2VPbk9mZlRleHQoaXNVc2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gcmVzdWx0TWFuYWdlciB3aGV0aGVyIGxvY2tlZCBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gcmVzdWx0TWFuYWdlcuydmCBpc01vdmVk6rCSXG4gICAgICovXG4gICAgZ2V0TW92ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHRNYW5hZ2VyLmlzTW92ZWQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCByZXN1bHRNYW5hZ2VyJ3MgaXNNb3ZlZCBmaWVsZFxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNNb3ZlZCBXaGV0aGVyIGxvY2tlZCBvciBub3QuXG4gICAgICovXG4gICAgc2V0TW92ZWQ6IGZ1bmN0aW9uKGlzTW92ZWQpIHtcbiAgICAgICAgdGhpcy5yZXN1bHRNYW5hZ2VyLmlzTW92ZWQgPSBpc01vdmVkO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXNldCBzZXJhY2hBcGlcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgc2VhcmNoQXBp7Ji17IWYIOyEpOyglVxuICAgICAqIEBleGFtcGxlXG4gICAgICogIGF1dG9Db21wbGV0ZS5zZXRTZWFyY2hBcGkoe1xuICAgICAqICAgICAgJ3N0JyA6IDExMSxcbiAgICAgKiAgICAgICdyX2x0JyA6IDExMSxcbiAgICAgKiAgICAgICdyX2VuYycgOiAnVVRGLTgnLFxuICAgICAqICAgICAgJ3FfZW5jJyA6ICdVVEYtOCcsXG4gICAgICogICAgICAncl9mb3JtYXQnIDogJ2pzb24nXG4gICAgICogIH0pO1xuICAgICAqL1xuICAgIHNldFNlYXJjaEFwaTogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB0dWkudXRpbC5leHRlbmQodGhpcy5vcHRpb25zLnNlYXJjaEFwaSwgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNsZWFyIHJlYWR5IHZhbHVlIGFuZCBzZXQgaWRsZSBzdGF0ZVxuICAgICAqL1xuICAgIGNsZWFyUmVhZHlWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0dWkudXRpbC5pc0V4aXN0eSh0aGlzLnJlYWR5VmFsdWUpKSB7XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3QodGhpcy5yZWFkeVZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaXNJZGxlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlYWR5VmFsdWUgPSBudWxsO1xuICAgIH1cbn0pO1xudHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKEF1dG9Db21wbGV0ZSk7XG5tb2R1bGUuZXhwb3J0cyA9IEF1dG9Db21wbGV0ZTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBEYXRhIGlzIGtpbmQgb2YgbWFuYWdlciBtb2R1bGUgdG8gcmVxdWVzdCBkYXRhIGF0IEFQSSB3aXRoIGlucHV0IHF1ZXJ5cy5cbiAqIEB2ZXJzaW9uIDEuMS4wXG4gKiBAYXV0aG9yIE5ITiBFbnRlcnRhaW5tZW50IEZFIGRldiB0ZWFtLiA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVW5pdCBvZiBhdXRvIGNvbXBsZXRlIGNvbm5lY3Rpbmcgc2VydmVyLlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbnZhciBEYXRhID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqQGxlbmRzIERhdGEucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKGF1dG9Db21wbGV0ZU9iaiwgb3B0aW9ucykge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCAhPT0gMikge1xuICAgICAgICAgICAgYWxlcnQoJ2FyZ3VtZW50IGxlbmd0aCBlcnJvciAhJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iaiA9IGF1dG9Db21wbGV0ZU9iajtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdCBkYXRhIGF0IGFwaSBzZXJ2ZXIgdXNlIGpzb25wXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGtleXdvcmQgU3RyaW5nIHRvIHJlcXVlc3QgYXQgc2VydmVyXG4gICAgICovXG4gICAgcmVxdWVzdDogZnVuY3Rpb24oa2V5d29yZCkge1xuICAgICAgICB2YXIgcnNLZXlXcm9kID0ga2V5d29yZC5yZXBsYWNlKC9cXHMvZywgJycpLFxuICAgICAgICAgICAgZGVmYXVsdFBhcmFtLCByZXF1ZXN0UGFyYW0sIGtleURhdGFzO1xuXG4gICAgICAgIGlmICgha2V5d29yZCB8fCAhcnNLZXlXcm9kKSB7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5oaWRlUmVzdWx0TGlzdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmYXVsdFBhcmFtID0ge1xuICAgICAgICAgICAgJ3EnOiBrZXl3b3JkLFxuICAgICAgICAgICAgJ3JfZW5jJzogJ1VURi04JyxcbiAgICAgICAgICAgICdxX2VuYyc6ICdVVEYtOCcsXG4gICAgICAgICAgICAncl9mb3JtYXQnOiAnanNvbicsXG4gICAgICAgICAgICAnX2NhbGxiYWNrJzogJ2RhdGFDYWxsYmFjaydcbiAgICAgICAgfTtcbiAgICAgICAgcmVxdWVzdFBhcmFtID0gdHVpLnV0aWwuZXh0ZW5kKHRoaXMub3B0aW9ucy5zZWFyY2hBcGksIGRlZmF1bHRQYXJhbSk7XG5cbiAgICAgICAgJC5hamF4KHRoaXMub3B0aW9ucy5zZWFyY2hVcmwsIHtcbiAgICAgICAgICAgICdkYXRhVHlwZSc6ICdqc29ucCcsXG4gICAgICAgICAgICAnanNvbnBDYWxsYmFjayc6ICdkYXRhQ2FsbGJhY2snLFxuICAgICAgICAgICAgJ2RhdGEnOiByZXF1ZXN0UGFyYW0sXG4gICAgICAgICAgICAndHlwZSc6ICdnZXQnLFxuICAgICAgICAgICAgJ3N1Y2Nlc3MnOiB0dWkudXRpbC5iaW5kKGZ1bmN0aW9uKGRhdGFPYmopIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBrZXlEYXRhcyA9IHRoaXMuX2dldENvbGxlY3Rpb25EYXRhKGRhdGFPYmopO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5zZXRRdWVyeXMoZGF0YU9iai5xdWVyeSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnNldFNlcnZlckRhdGEoa2V5RGF0YXMpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5jbGVhclJlYWR5VmFsdWUoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignW0RhdGFNYW5hZ2VyXSBSZXF1ZXN0IGZhaWxkLicsIGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMpXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNYWtlIGNvbGxlY3Rpb24gZGF0YSB0byBkaXNwbGF5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGFPYmogQ29sbGVjdGlvbiBkYXRhXG4gICAgICogQHJldHVybnMge0FycmF5fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENvbGxlY3Rpb25EYXRhOiBmdW5jdGlvbihkYXRhT2JqKSB7XG4gICAgICAgIHZhciBjb2xsZWN0aW9uID0gZGF0YU9iai5jb2xsZWN0aW9ucyxcbiAgICAgICAgICAgIGl0ZW1EYXRhTGlzdCA9IFtdO1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goY29sbGVjdGlvbiwgZnVuY3Rpb24oaXRlbVNldCkge1xuICAgICAgICAgICAgdmFyIGtleXM7XG5cbiAgICAgICAgICAgIGlmICh0dWkudXRpbC5pc0VtcHR5KGl0ZW1TZXQuaXRlbXMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjcmVhdGUgY29sbGVjdGlvbiBpdGVtcy5cbiAgICAgICAgICAgIGtleXMgPSB0aGlzLl9nZXRSZWRpcmVjdERhdGEoaXRlbVNldCk7XG4gICAgICAgICAgICBpdGVtRGF0YUxpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3RpdGxlJyxcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IFtpdGVtU2V0LnRpdGxlXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdGVtRGF0YUxpc3QgPSBpdGVtRGF0YUxpc3QuY29uY2F0KGtleXMpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gaXRlbURhdGFMaXN0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNYWtlIGl0ZW0gb2YgY29sbGVjdGlvbiB0byBkaXNwbGF5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGl0ZW1TZXQgSXRlbSBvZiBjb2xsZWN0aW9uIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEByZXR1cm5zIHtBcnJheX1cbiAgICAgKi9cbiAgICBfZ2V0UmVkaXJlY3REYXRhOiBmdW5jdGlvbihpdGVtU2V0KSB7XG4gICAgICAgIHZhciB0eXBlID0gaXRlbVNldC50eXBlLFxuICAgICAgICAgICAgaW5kZXggPSBpdGVtU2V0LmluZGV4LFxuICAgICAgICAgICAgZGVzdCA9IGl0ZW1TZXQuZGVzdGluYXRpb24sXG4gICAgICAgICAgICBpdGVtcyA9IFtdO1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShpdGVtU2V0Lml0ZW1zLCBmdW5jdGlvbihpdGVtLCBpZHgpIHtcbiAgICAgICAgICAgIGlmIChpZHggPD0gKHRoaXMub3B0aW9ucy52aWV3Q291bnQgLSAxKSkge1xuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgICAgICAgICAgICAgZGVzdDogZGVzdFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGE7XG4iLCIvKipcbiAqIEBmaWxlT3ZlcnZpZXcgSW5wdXQgaXMga2luZCBvZiBtYW5hZ2VyIG1vZHVsZSB0byBzdXBwb3J0IGlucHV0IGVsZW1lbnQgZXZlbnRzIGFuZCBhbGwgb2YgaW5wdXQgZnVuY3Rpb25zLlxuICogQHZlcnNpb24gMS4xLjBcbiAqIEBhdXRob3IgTkhOIEVudGVydGFpbm1lbnQgRkUgZGV2IHRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuLyoqXG4gKiBVbml0IG9mIGF1dG8gY29tcGxldGUgY29tcG9uZW50IHRoYXQgYmVsb25nIHdpdGggaW5wdXQgZWxlbWVudC5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgSW5wdXQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKipAbGVuZHMgSW5wdXQucHJvdG90eXBlICove1xuICAgIC8qKlxuICAgICAqIGtleWJvYXJkIElucHV0IEtleUNvZGUgZW51bVxuICAgICAqL1xuICAgIGtleUNvZGVNYXA6IHtcbiAgICAgICAgJ1RBQic6IDksXG4gICAgICAgICdVUF9BUlJPVyc6IDM4LFxuICAgICAgICAnRE9XTl9BUlJPVyc6IDQwXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXV0b0NvbXBsZXRlT2JqIEF1dG9Db21wbGV0ZSBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIGF1dG8gY29tcGxldGUgb3B0aW9uc1xuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKGF1dG9Db21wbGV0ZU9iaiwgb3B0aW9ucykge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCAhPT0gMikge1xuICAgICAgICAgICAgYWxlcnQoJ2FyZ3VtZW50IGxlbmd0aCBlcnJvciAhJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmogPSBhdXRvQ29tcGxldGVPYmo7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICAgICAgLy8gU2F2ZSBlbGVtZW50cyBmcm9tIGNvbmZpZ3VyYXRpb24uXG4gICAgICAgIHRoaXMuJHNlYXJjaEJveCA9IHRoaXMub3B0aW9ucy5zZWFyY2hCb3hFbGVtZW50O1xuICAgICAgICB0aGlzLiR0b2dnbGVCdG4gPSB0aGlzLm9wdGlvbnMudG9nZ2xlQnRuRWxlbWVudDtcbiAgICAgICAgdGhpcy4kb3JnUXVlcnkgPSB0aGlzLm9wdGlvbnMub3JnUXVlcnlFbGVtZW50O1xuICAgICAgICB0aGlzLiRmb3JtRWxlbWVudCA9IHRoaXMub3B0aW9ucy5mb3JtRWxlbWVudDtcblxuICAgICAgICB0aGlzLmlucHV0VmFsdWUgPSB0aGlzLiRzZWFyY2hCb3gudmFsKCk7XG5cbiAgICAgICAgdGhpcy5fYXR0YWNoRXZlbnQoKTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gaW5wdXQgZWxlbWVudCB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFNlYXJjaGJveCB2YWx1ZVxuICAgICAqL1xuICAgIGdldFZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJHNlYXJjaEJveC52YWwoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGtleXdvcmQgdG8gaW5wdXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIGtleXdvcmQgdG8gc2V0IHZhbHVlLlxuICAgICAqL1xuICAgIHNldFZhbHVlOiBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgdGhpcy5pbnB1dFZhbHVlID0gc3RyO1xuICAgICAgICB0aGlzLiRzZWFyY2hCb3gudmFsKHN0cik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlYWQgY29uZmlnIGZpbGVzIHBhcmFtZXRlciBvcHRpb24gYW5kIHNldCBwYXJhbWV0ZXIuXG4gICAgICogQHBhcmFtIHthcnJheX0gb3B0aW9ucyBUaGUgcGFyYW1ldGVycyBmcm9tIGNvbmZpZ1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBUaGUgaW5kZXggZm9yIHNldHRpbmcga2V5IHZhbHVlXG4gICAgICovXG4gICAgc2V0UGFyYW1zOiBmdW5jdGlvbihvcHRpb25zLCBpbmRleCkge1xuICAgICAgICB2YXIgb3B0ID0gdGhpcy5vcHRpb25zLFxuICAgICAgICAgICAgbGlzdENvbmZpZyA9IG9wdC5saXN0Q29uZmlnW2luZGV4XSxcbiAgICAgICAgICAgIHN0YXRpY3MgPSBvcHQuc3RhdGljUGFyYW1zW2xpc3RDb25maWcuc3RhdGljUGFyYW1zXTtcblxuICAgICAgICBpZiAob3B0aW9ucyAmJiB0dWkudXRpbC5pc1N0cmluZyhvcHRpb25zKSkge1xuICAgICAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMuc3BsaXQoJywnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgoIW9wdGlvbnMgfHwgdHVpLnV0aWwuaXNFbXB0eShvcHRpb25zKSkgJiYgIXR1aS51dGlsLmlzRXhpc3R5KHN0YXRpY3MpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jcmVhdGVQYXJhbVNldEJ5VHlwZShvcHRpb25zLCBpbmRleCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBpbnB1dEVsZW1lbnQgYnkgdHlwZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIFRoZSB2YWx1ZXMgdG8gc2VuZCBzZWFyY2ggYXBpXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IFRoZSBpbmRleCBvZiBxdWVyeSBrZXkgYXJyYXlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jcmVhdGVQYXJhbVNldEJ5VHlwZTogZnVuY3Rpb24ob3B0aW9ucywgaW5kZXgpIHtcbiAgICAgICAgdmFyIG9wdCA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICAgIGxpc3RDb25maWcgPSBvcHQubGlzdENvbmZpZ1tpbmRleF0sXG4gICAgICAgICAgICBjb25maWcgPSBvcHQuc3ViUXVlcnlTZXRbbGlzdENvbmZpZy5zdWJRdWVyeVNldF0sXG4gICAgICAgICAgICBzdGF0aWNzID0gb3B0LnN0YXRpY1BhcmFtc1tsaXN0Q29uZmlnLnN0YXRpY1BhcmFtc107XG5cbiAgICAgICAgaWYgKCF0aGlzLmhpZGRlbnMpIHtcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZVBhcmFtQ29udGFpbmVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKG9wdGlvbnMsIGZ1bmN0aW9uKHZhbHVlLCBpZHgpIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBjb25maWdbaWR4XTtcbiAgICAgICAgICAgIHRoaXMuaGlkZGVucy5hcHBlbmQoJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiJyArIGtleSArICdcIiB2YWx1ZT1cIicgKyB2YWx1ZSArICdcIiAvPicpKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgaWYgKHN0YXRpY3MpIHtcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZVN0YXRpY1BhcmFtcyhzdGF0aWNzKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgc3RhdGljIHBhcmFtZXRlcnNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGljcyBTdGF0aWMgdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY3JlYXRlU3RhdGljUGFyYW1zOiBmdW5jdGlvbihzdGF0aWNzKSB7XG4gICAgICAgIHN0YXRpY3MgPSBzdGF0aWNzLnNwbGl0KCcsJyk7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goc3RhdGljcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHZhciB2YWwgPSB2YWx1ZS5zcGxpdCgnPScpO1xuICAgICAgICAgICAgdGhpcy5oaWRkZW5zLmFwcGVuZCgkKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCInICsgdmFsWzBdICsgJ1wiIHZhbHVlPVwiJyArIHZhbFsxXSArICdcIiAvPicpKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSB3cmFwcGVyIHRoYXQgYmVjb21lIGNvbnRhaW5lciBvZiBoaWRkZW4gZWxlbWVudHMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY3JlYXRlUGFyYW1Db250YWluZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmhpZGRlbnMgPSAkKCc8ZGl2IGNsYXNzPVwiaGlkZGVuLWlucHV0c1wiPjwvZGl2PicpO1xuICAgICAgICB0aGlzLmhpZGRlbnMuaGlkZSgpO1xuICAgICAgICB0aGlzLmhpZGRlbnMuYXBwZW5kVG8oJCh0aGlzLiRmb3JtRWxlbWVudCkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgdG9nZ2xlIGJ1dHRvbiBpbWFnZS5cbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzVXNlIOyekOuPmeyZhOyEsSDsgqzsmqkg7Jes67aAXG4gICAgICovXG4gICAgc2V0VG9nZ2xlQnRuSW1nOiBmdW5jdGlvbihpc1VzZSkge1xuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy50b2dnbGVJbWcgfHwgISh0aGlzLiR0b2dnbGVCdG4pKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNVc2UpIHtcbiAgICAgICAgICAgIHRoaXMuJHRvZ2dsZUJ0bi5hdHRyKCdzcmMnLCB0aGlzLm9wdGlvbnMudG9nZ2xlSW1nLm9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJHRvZ2dsZUJ0bi5hdHRyKCdzcmMnLCB0aGlzLm9wdGlvbnMudG9nZ2xlSW1nLm9mZik7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKiogUHJpdmF0ZSBGdW5jdGlvbnMgKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gICAgLyoqXG4gICAgICogRXZlbnQgYmluZGluZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy/qsoDsg4nssL3sl5AgZm9jdXMsIGtleXVwLCBrZXlkb3duLCBjbGljayDsnbTrsqTtirgg67CU7J2465SpLlxuICAgICAgICB0aGlzLiRzZWFyY2hCb3guYmluZCgnZm9jdXMga2V5dXAga2V5ZG93biBibHVyIGNsaWNrJywgJC5wcm94eShmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGUudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2ZvY3VzJyA6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uRm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnYmx1cicgOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbkJsdXIoZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2tleXVwJyA6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uS2V5VXAoZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2tleWRvd24nIDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25LZXlEb3duKGUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdjbGljaycgOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbkNsaWNrKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQgOlxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcykpO1xuXG4gICAgICAgIGlmICh0aGlzLiR0b2dnbGVCdG4pIHtcbiAgICAgICAgICAgIHRoaXMuJHRvZ2dsZUJ0bi5iaW5kKCdjbGljaycsICQucHJveHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fb25DbGlja1RvZ2dsZSgpO1xuICAgICAgICAgICAgfSwgdGhpcykpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNhdmUgdXNlciBxdWVyeSBpbnRvIGhpZGRlbiBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyB0eXBlZCBieSB1c2VyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0T3JnUXVlcnk6IGZ1bmN0aW9uKHN0cikge1xuICAgICAgICB0aGlzLiRvcmdRdWVyeS52YWwoc3RyKTtcbiAgICB9LFxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKiogRXZlbnQgSGFuZGxlcnMgKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gICAgLyoqXG4gICAgICogSW5wdXQgZWxlbWVudCBvbmNsaWNrIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBGYWxzZSBpZiBubyBpbnB1dC1rZXl3b3JkIG9yIG5vdCB1c2UgYXV0by1jb21wbGV0ZVxuICAgICAqL1xuICAgIF9vbkNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy/snoXroKXrkJwg7YKk7JuM65Oc6rCAIOyXhuqxsOuCmCDsnpDrj5nsmYTshLEg6riw64qlIOyCrOyaqe2VmOyngCDslYrsnLzrqbQg7Y687LmgIO2VhOyalCDsl4bsnLzrr4DroZwg6re464OlIOumrO2EtO2VmOqzoCDrgZ0uXG4gICAgICAgIGlmICghdGhpcy5hdXRvQ29tcGxldGVPYmouZ2V0VmFsdWUoKSB8fFxuICAgICAgICAgICAgIXRoaXMuYXV0b0NvbXBsZXRlT2JqLmlzVXNlQXV0b0NvbXBsZXRlKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmF1dG9Db21wbGV0ZU9iai5pc1Nob3dSZXN1bHRMaXN0KCkpIHtcbiAgICAgICAgICAgIC8v6rKw6rO8IOumrOyKpO2KuCDsmIHsl63snbQgc2hvdyDsg4Htg5zsnbTrqbQoaXNSZXN1bHRTaG93aW5nPT10cnVlKSDqsrDqs7wg66as7Iqk7Yq4IGhpZGUg7JqU7LKtXG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5oaWRlUmVzdWx0TGlzdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy/qsrDqs7wg66as7Iqk7Yq4IOyYgeyXreydtCBoaWRlIOyDge2DnOydtOuptChpc1Jlc3VsdFNob3dpbmc9PWZhbHNlKSDqsrDqs7wg66as7Iqk7Yq4IHNob3cg7JqU7LKtXG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5zaG93UmVzdWx0TGlzdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnB1dCBlbGVtZW50IGZvY3VzIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkZvY3VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy9zZXRJbnRlcnZhbCDshKTsoJXtlbTshJwg7J287KCVIOyLnOqwhCDso7zquLDroZwgX29uV2F0Y2gg7ZWo7IiY66W8IOyLpO2Wie2VnOuLpC5cbiAgICAgICAgdGhpcy5pbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoJC5wcm94eShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuX29uV2F0Y2goKTtcbiAgICAgICAgfSwgdGhpcyksIHRoaXMub3B0aW9ucy53YXRjaEludGVydmFsKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUm9vcCBmb3IgY2hlY2sgdXBkYXRlIGlucHV0IGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbldhdGNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuJHNlYXJjaEJveC52YWwoKSA9PT0gJycpIHtcbiAgICAgICAgICAgIHRoaXMuX3NldE9yZ1F1ZXJ5KCcnKTtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnNldE1vdmVkKGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmlucHV0VmFsdWUgIT09IHRoaXMuJHNlYXJjaEJveC52YWwoKSkge1xuICAgICAgICAgICAgdGhpcy5pbnB1dFZhbHVlID0gdGhpcy4kc2VhcmNoQm94LnZhbCgpO1xuICAgICAgICAgICAgdGhpcy5fb25DaGFuZ2UoKTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5hdXRvQ29tcGxldGVPYmouZ2V0TW92ZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5fc2V0T3JnUXVlcnkodGhpcy4kc2VhcmNoQm94LnZhbCgpKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnB1dCBlbGVtZW50IGtleXVwIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbktleVVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5wdXRWYWx1ZSAhPT0gdGhpcy4kc2VhcmNoQm94LnZhbCgpKSB7XG4gICAgICAgICAgICB0aGlzLmlucHV0VmFsdWUgPSB0aGlzLiRzZWFyY2hCb3gudmFsKCk7XG4gICAgICAgICAgICB0aGlzLl9vbkNoYW5nZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIElucHV0IGVsZW1lbnQgb25jaGFuZ2UgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmF1dG9Db21wbGV0ZU9iai5pc1VzZUF1dG9Db21wbGV0ZSgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5hdXRvQ29tcGxldGVPYmouaXNJZGxlKSB7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5pc0lkbGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnJlcXVlc3QodGhpcy4kc2VhcmNoQm94LnZhbCgpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnJlYWR5VmFsdWUgPSB0aGlzLiRzZWFyY2hCb3gudmFsKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5wdXQgZWxlbWVudCBibHVyIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkJsdXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5pbnRlcnZhbElkKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWxJZCk7XG4gICAgICAgICAgICB0aGlzLmludGVydmFsSWQgPSBudWxsO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIElucHV0IGVsZW1lbnQga2V5ZG93biBldmVudCBoYW5kbGVyXG4gICAgICogU2V0IGFjdGlubyBieSBpbnB1dCB2YWx1ZVxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGUga2V5RG93biBFdmVudCBpbnN0YW5jZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uS2V5RG93bjogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgYXV0b0NvbXBsZXRlT2JqID0gdGhpcy5hdXRvQ29tcGxldGVPYmosXG4gICAgICAgICAgICBjb2RlLCBmbG93LCBjb2RlTWFwLCBmbG93TWFwO1xuXG4gICAgICAgIGlmICghYXV0b0NvbXBsZXRlT2JqLmlzVXNlQXV0b0NvbXBsZXRlKCkgfHxcbiAgICAgICAgICAgICFhdXRvQ29tcGxldGVPYmouaXNTaG93UmVzdWx0TGlzdCgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb2RlID0gZS5rZXlDb2RlO1xuICAgICAgICBmbG93ID0gbnVsbDtcbiAgICAgICAgY29kZU1hcCA9IHRoaXMua2V5Q29kZU1hcDtcbiAgICAgICAgZmxvd01hcCA9IGF1dG9Db21wbGV0ZU9iai5mbG93TWFwO1xuXG4gICAgICAgIGlmIChjb2RlID09PSBjb2RlTWFwLlRBQikge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZmxvdyA9IGUuc2hpZnRLZXkgPyBmbG93TWFwLk5FWFQgOiBmbG93TWFwLlBSRVY7XG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gY29kZU1hcC5ET1dOX0FSUk9XKSB7XG4gICAgICAgICAgICBmbG93ID0gZmxvd01hcC5ORVhUO1xuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IGNvZGVNYXAuVVBfQVJST1cpIHtcbiAgICAgICAgICAgIGZsb3cgPSBmbG93TWFwLlBSRVY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYXV0b0NvbXBsZXRlT2JqLm1vdmVOZXh0TGlzdChmbG93KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlIGJ1dHRvbiBjbGljayBldmVudCBoYW5kbGVyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25DbGlja1RvZ2dsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5hdXRvQ29tcGxldGVPYmouaXNVc2VBdXRvQ29tcGxldGUoKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRUb2dnbGVCdG5JbWcodHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5zZXRDb29raWVWYWx1ZSh0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLmNoYW5nZU9uT2ZmVGV4dChmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5oaWRlUmVzdWx0TGlzdCgpO1xuICAgICAgICAgICAgdGhpcy5zZXRUb2dnbGVCdG5JbWcoZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouc2V0Q29va2llVmFsdWUoZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouY2hhbmdlT25PZmZUZXh0KHRydWUpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW5wdXQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUmVzdWx0IGlzIGtpbmQgb2YgbWFuYWdpbmcgbW9kdWxlIHRvIGRyYXcgYXV0byBjb21wbGV0ZSByZXN1bHQgbGlzdCBmcm9tIHNlcnZlciBhbmQgYXBwbHkgdGVtcGxhdGUuXG4gKiBAdmVyc2lvbiAxLjEuMFxuICogQGF1dGhvciAgTkhOIGVudGVydGFpbm1lbnQgRkUgZGV2IHRlYW08ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG4ndXNlIHN0cmljdCc7XG4vKipcbiAqIFVuaXQgb2YgYXV0byBjb21wbGV0ZSB0aGF0IGJlbG9uZyB3aXRoIHNlYXJjaCByZXN1bHQgbGlzdC5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgUmVzdWx0ID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBSZXN1bHQucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKGF1dG9Db21wbGV0ZU9iaiwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iaiA9IGF1dG9Db21wbGV0ZU9iajtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcblxuICAgICAgICB0aGlzLiRyZXN1bHRMaXN0ID0gdGhpcy5vcHRpb25zLnJlc3VsdExpc3RFbGVtZW50O1xuICAgICAgICB0aGlzLnJlc3VsdFNlbGVjdG9yID0gdGhpcy5vcHRpb25zLnJlc3VsdExpc3RFbGVtZW50O1xuICAgICAgICB0aGlzLnZpZXdDb3VudCA9IHRoaXMub3B0aW9ucy52aWV3Q291bnQgfHwgMTA7XG4gICAgICAgIHRoaXMuJG9uT2ZmVHh0ID0gdGhpcy5vcHRpb25zLm9ub2ZmVGV4dEVsZW1lbnQ7XG4gICAgICAgIHRoaXMubW91c2VPdmVyQ2xhc3MgPSB0aGlzLm9wdGlvbnMubW91c2VPdmVyQ2xhc3M7XG4gICAgICAgIHRoaXMuZmxvd01hcCA9IHRoaXMuYXV0b0NvbXBsZXRlT2JqLmZsb3dNYXA7XG5cbiAgICAgICAgdGhpcy5fYXR0YWNoRXZlbnQoKTtcblxuICAgICAgICB0aGlzLnNlbGVjdGVkRWxlbWVudCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5pc01vdmVkID0gZmFsc2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERlbGV0ZSBsYXN0IHJlc3VsdCBsaXN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZGVsZXRlQmVmb3JlRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJHJlc3VsdExpc3QuaHRtbCgnJyk7XG4gICAgICAgIHRoaXMuJHJlc3VsdExpc3QuaGlkZSgpO1xuICAgICAgICB0aGlzLnNlbGVjdGVkRWxlbWVudCA9IG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERyYXcgcmVzdWx0IGZvcm0gYXBpIHNlcnZlclxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGRhdGFBcnIgUmVzdWx0IGRhdGFcbiAgICAgKi9cbiAgICBkcmF3OiBmdW5jdGlvbihkYXRhQXJyKSB7XG4gICAgICAgIHZhciBsZW4gPSBkYXRhQXJyLmxlbmd0aDtcblxuICAgICAgICB0aGlzLl9kZWxldGVCZWZvcmVFbGVtZW50KCk7XG4gICAgICAgIGlmIChsZW4gPCAxKSB7XG4gICAgICAgICAgICB0aGlzLl9oaWRlQm90dG9tQXJlYSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbWFrZVJlc3VsdExpc3QoZGF0YUFyciwgbGVuKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuJHJlc3VsdExpc3Quc2hvdygpO1xuICAgICAgICAvLyBzaG93IGF1dG8gY29tcGxldGUgc3dpdGNoXG4gICAgICAgIHRoaXMuX3Nob3dCb3R0b21BcmVhKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1ha2Ugc2VhcmNoIHJlc3VsdCBsaXN0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBkYXRhQXJyIC0gRGF0YSBhcnJheVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsZW4gLSBMZW5ndGggb2YgZGF0YUFycmF5XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVJlc3VsdExpc3Q6IGZ1bmN0aW9uKGRhdGFBcnIsIGxlbikge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSB0aGlzLm9wdGlvbnMudGVtcGxhdGUsXG4gICAgICAgICAgICBjb25maWcgPSB0aGlzLm9wdGlvbnMubGlzdENvbmZpZyxcbiAgICAgICAgICAgIHRtcGwsXG4gICAgICAgICAgICB1c2VUaXRsZSA9ICh0aGlzLm9wdGlvbnMudXNlVGl0bGUgJiYgISF0ZW1wbGF0ZS50aXRsZSksXG4gICAgICAgICAgICBpbmRleCxcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICB0bXBsVmFsdWUsXG4gICAgICAgICAgICAkZWwsXG4gICAgICAgICAgICBpO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgICAgICAgICAgdHlwZSA9IGRhdGFBcnJbaV0udHlwZTtcbiAgICAgICAgICAgIGluZGV4ID0gZGF0YUFycltpXS5pbmRleDtcbiAgICAgICAgICAgIHRtcGwgPSBjb25maWdbaW5kZXhdID8gdGVtcGxhdGVbY29uZmlnW2luZGV4XS50ZW1wbGF0ZV0gOiB0ZW1wbGF0ZS5kZWZhdWx0cztcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAndGl0bGUnKSB7XG4gICAgICAgICAgICAgICAgdG1wbCA9IHRlbXBsYXRlLnRpdGxlO1xuICAgICAgICAgICAgICAgIGlmICghdXNlVGl0bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG1wbFZhbHVlID0gdGhpcy5fZ2V0VG1wbERhdGEodG1wbC5hdHRyLCBkYXRhQXJyW2ldKTtcbiAgICAgICAgICAgICRlbCA9ICQodGhpcy5fYXBwbHlUZW1wbGF0ZSh0bXBsLmVsZW1lbnQsIHRtcGxWYWx1ZSkpO1xuICAgICAgICAgICAgJGVsLmF0dHIoJ2RhdGEtcGFyYW1zJywgdG1wbFZhbHVlLnBhcmFtcyk7XG4gICAgICAgICAgICAkZWwuYXR0cignZGF0YS1pbmRleCcsIGluZGV4KTtcbiAgICAgICAgICAgIHRoaXMuJHJlc3VsdExpc3QuYXBwZW5kKCRlbCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWFrZSB0ZW1wbGF0ZSBkYXRhXG4gICAgICogQHBhcmFtIHtBcnJheX0gYXR0cnMgVGVtcGxhdGUgYXR0cmlidXRlc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfE9iamVjdH0gZGF0YSBUaGUgZGF0YSB0byBtYWtlIHRlbXBsYXRlXG4gICAgICogQHJldHVybnMge09iamVjdH0gVGVtcGxhdGUgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFRtcGxEYXRhOiBmdW5jdGlvbihhdHRycywgZGF0YSkge1xuICAgICAgICB2YXIgdG1wbFZhbHVlID0ge30sXG4gICAgICAgICAgICB2YWx1ZXMgPSBkYXRhLnZhbHVlcyB8fCBudWxsO1xuXG4gICAgICAgIGlmICh0dWkudXRpbC5pc1N0cmluZyhkYXRhKSkge1xuICAgICAgICAgICAgdG1wbFZhbHVlW2F0dHJzWzBdXSA9IGRhdGE7XG4gICAgICAgICAgICByZXR1cm4gdG1wbFZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChhdHRycywgZnVuY3Rpb24oYXR0ciwgaWR4KSB7XG4gICAgICAgICAgICB0bXBsVmFsdWVbYXR0cl0gPSB2YWx1ZXNbaWR4XTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGF0dHJzLmxlbmd0aCA8IHZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRtcGxWYWx1ZS5wYXJhbXMgPSB2YWx1ZXMuc2xpY2UoYXR0cnMubGVuZ3RoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0bXBsVmFsdWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB3aGV0aGVyIHJlc3VsdCBsaXN0IHNob3cgb3Igbm90XG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAgICovXG4gICAgaXNTaG93UmVzdWx0TGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAodGhpcy4kcmVzdWx0TGlzdC5jc3MoJ2Rpc3BsYXknKSA9PT0gJ2Jsb2NrJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgcmVzdWx0IGxpc3QgYXJlYVxuICAgICAqL1xuICAgIGhpZGVSZXN1bHRMaXN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kcmVzdWx0TGlzdC5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICAgICAgICB0aGlzLl9oaWRlQm90dG9tQXJlYSgpO1xuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5pc0lkbGUgPSB0cnVlO1xuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5maXJlKCdjbG9zZScpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IHJlc3VsdCBsaXN0IGFyZWFcbiAgICAgKi9cbiAgICBzaG93UmVzdWx0TGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuJHJlc3VsdExpc3QuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gICAgICAgIH0sIDApO1xuXG4gICAgICAgIHRoaXMuX3Nob3dCb3R0b21BcmVhKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1vdmUgZm9jdXMgdG8gbmV4dCBpdGVtLCBjaGFuZ2UgaW5wdXQgZWxlbWVudCB2YWx1ZSBhcyBmb2N1cyB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmxvdyBEaXJlY3Rpb24gYnkga2V5IGNvZGVcbiAgICAgKi9cbiAgICBtb3ZlTmV4dExpc3Q6IGZ1bmN0aW9uKGZsb3cpIHtcbiAgICAgICAgdmFyIGZsb3dNYXAgPSB0aGlzLmZsb3dNYXAsXG4gICAgICAgICAgICBzZWxlY3RFbCA9IHRoaXMuc2VsZWN0ZWRFbGVtZW50LFxuICAgICAgICAgICAgZ2V0TmV4dCA9IChmbG93ID09PSBmbG93TWFwLk5FWFQpID8gdGhpcy5fZ2V0TmV4dCA6IHRoaXMuX2dldFByZXYsXG4gICAgICAgICAgICBnZXRCb3VuZCA9IChmbG93ID09PSBmbG93TWFwLk5FWFQpID8gdGhpcy5fZ2V0Rmlyc3QgOiB0aGlzLl9nZXRMYXN0LFxuICAgICAgICAgICAga2V5d29yZDtcbiAgICAgICAgdGhpcy5pc01vdmVkID0gdHJ1ZTtcblxuICAgICAgICBpZiAoc2VsZWN0RWwpIHtcbiAgICAgICAgICAgIHNlbGVjdEVsLnJlbW92ZUNsYXNzKHRoaXMubW91c2VPdmVyQ2xhc3MpO1xuICAgICAgICAgICAgc2VsZWN0RWwgPSB0aGlzLnNlbGVjdGVkRWxlbWVudCA9IGdldE5leHQuY2FsbCh0aGlzLCBzZWxlY3RFbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxlY3RFbCA9IHRoaXMuc2VsZWN0ZWRFbGVtZW50ID0gZ2V0Qm91bmQuY2FsbCh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGtleXdvcmQgPSBzZWxlY3RFbC5maW5kKCcua2V5d29yZC1maWVsZCcpLnRleHQoKTtcblxuICAgICAgICBpZiAoc2VsZWN0RWwgJiYga2V5d29yZCkge1xuICAgICAgICAgICAgc2VsZWN0RWwuYWRkQ2xhc3ModGhpcy5tb3VzZU92ZXJDbGFzcyk7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5zZXRWYWx1ZShrZXl3b3JkKTtcbiAgICAgICAgICAgIHRoaXMuX3NldFN1Ym1pdE9wdGlvbigpO1xuICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdEVsKSB7XG4gICAgICAgICAgICB0aGlzLm1vdmVOZXh0TGlzdChmbG93KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFnZSB0ZXh0IGJ5IHdoZXRoZXIgYXV0byBjb21wbGV0ZSB1c2Ugb3Igbm90XG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpc1VzZSBvbi9vZmYg7Jes67aAXG4gICAgICovXG4gICAgY2hhbmdlT25PZmZUZXh0OiBmdW5jdGlvbihpc1VzZSkge1xuICAgICAgICBpZiAoaXNVc2UpIHtcbiAgICAgICAgICAgIHRoaXMuJG9uT2ZmVHh0LnRleHQoJ+yekOuPmeyZhOyEsSDsvJzquLAnKTtcbiAgICAgICAgICAgIHRoaXMuaGlkZVJlc3VsdExpc3QoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJG9uT2ZmVHh0LnRleHQoJ+yekOuPmeyZhOyEsSDrgYTquLAnKTtcbiAgICAgICAgfVxuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBhdXRvIGNvbXBsZXRlIGV2ZW50IGJlbG9uZ3Mgd2l0aCByZXN1bHQgbGlzdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kcmVzdWx0TGlzdC5iaW5kKCdtb3VzZW92ZXIgY2xpY2snLCAkLnByb3h5KGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGlmIChlLnR5cGUgPT09ICdtb3VzZW92ZXInKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fb25Nb3VzZU92ZXIoZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGUudHlwZSA9PT0gJ2NsaWNrJykge1xuICAgICAgICAgICAgICAgIHRoaXMuX29uQ2xpY2soZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpKTtcblxuICAgICAgICBpZiAodGhpcy4kb25PZmZUeHQpIHtcbiAgICAgICAgICAgIHRoaXMuJG9uT2ZmVHh0LmJpbmQoJ2NsaWNrJywgJC5wcm94eShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl91c2VBdXRvQ29tcGxldGUoKTtcbiAgICAgICAgICAgIH0sIHRoaXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQoZG9jdW1lbnQpLmJpbmQoJ2NsaWNrJywgJC5wcm94eShmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBpZiAoZS50YXJnZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSAnaHRtbCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmhpZGVSZXN1bHRMaXN0KCk7XG4gICAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlnaGxpZ2h0IGtleSB3b3JkXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRtcGxTdHIgVGVtcGxhdGUgc3RyaW5nXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGFPYmogUmVwbGFjZSBzdHJpbmcgbWFwXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hcHBseVRlbXBsYXRlOiBmdW5jdGlvbih0bXBsU3RyLCBkYXRhT2JqKSB7XG4gICAgICAgIHZhciB0ZW1wID0ge30sXG4gICAgICAgICAgICBrZXlTdHI7XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChkYXRhT2JqLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICBpZiAoIWRhdGFPYmoucHJvcGVydHlJc0VudW1lcmFibGUoa2V5KSkgeyAvL0B0b2RvOiBJcyBpdCBuZWNlc3Nhcnk/XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnc3ViamVjdCcpIHtcbiAgICAgICAgICAgICAgICB0ZW1wLnN1YmplY3QgPSB0aGlzLl9oaWdobGlnaHQodmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZW1wW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdG1wbFN0ciA9IHRtcGxTdHIucmVwbGFjZShuZXcgUmVnRXhwKCdAJyArIGtleVN0ciArICdAJywgJ2cnKSwgdGVtcFtrZXlTdHJdKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIHRtcGxTdHI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBhcHBsaWVkIGhpZ2hsaWdodCBlZmZlY3Qga2V5IHdvcmRcbiAgICAgKiAodGV4dDogTmlrZSBhaXIgIC8gIHF1ZXJ5IDogW05pa2VdIC8gUmVzdWx0IDogPHN0cm9uZz5OaWtlIDwvc3Ryb25nPmFpclxuICAgICAqIHRleHQgOiAncmhkaWRkbOyZgCDqs6DslpHsnbQnIC8gcXVlcnkgOiAgW3JoZGlkZGwsIOqzoOyWkeydtF0gLyDrpqzthLTqsrDqs7wgPHN0cm9uZz5yaGRpZGRsPC9zdHJvbmc+7JmAIDxzdHJvbmc+6rOg7JaR7J20PC9zdHJvbmc+XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRleHQgSW5wdXQgc3RyaW5nXG4gICAgICogQHJldHVybnMge1N0cmluZ31cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9oaWdobGlnaHQ6IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgdmFyIHF1ZXJ5cyA9IHRoaXMuYXV0b0NvbXBsZXRlT2JqLnF1ZXJ5cyxcbiAgICAgICAgICAgIHJldHVyblN0cjtcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHF1ZXJ5cywgZnVuY3Rpb24ocXVlcnkpIHtcbiAgICAgICAgICAgIGlmICghcmV0dXJuU3RyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuU3RyID0gdGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVyblN0ciA9IHRoaXMuX21ha2VTdHJvbmcocmV0dXJuU3RyLCBxdWVyeSk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICByZXR1cm4gcmV0dXJuU3RyIHx8IHRleHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbnRhaW4gdGV4dCBieSBzdHJvbmcgdGFnXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRleHQgUmVjb21tZW5kIHNlYXJjaCBkYXRhICDstpTsspzqsoDsg4nslrQg642w7J207YSwXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHF1ZXJ5IElucHV0IGtleXdvcmRcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTdHJvbmc6IGZ1bmN0aW9uKHRleHQsIHF1ZXJ5KSB7XG4gICAgICAgIHZhciBlc2NSZWdFeHAsIHRtcFN0ciwgdG1wQ2hhcmFjdGVycyxcbiAgICAgICAgICAgIHRtcENoYXJMZW4sIHRtcEFyciwgcmV0dXJuU3RyLFxuICAgICAgICAgICAgcmVnUXVlcnksIGNudCwgaTtcblxuICAgICAgICBpZiAoIXF1ZXJ5IHx8IHF1ZXJ5Lmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgZXNjUmVnRXhwID0gbmV3IFJlZ0V4cCgnWy4qKz98KClcXFxcW1xcXFxde31cXFxcXFxcXF0nLCAnZycpO1xuICAgICAgICB0bXBTdHIgPSBxdWVyeS5yZXBsYWNlKC8oKS9nLCAnICcpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbiAgICAgICAgdG1wQ2hhcmFjdGVycyA9IHRtcFN0ci5tYXRjaCgvXFxTL2cpO1xuICAgICAgICB0bXBDaGFyTGVuID0gdG1wQ2hhcmFjdGVycy5sZW5ndGg7XG4gICAgICAgIHRtcEFyciA9IFtdO1xuICAgICAgICByZXR1cm5TdHIgPSAnJztcblxuICAgICAgICBmb3IgKGkgPSAwLCBjbnQgPSB0bXBDaGFyTGVuOyBpIDwgY250OyBpICs9IDEpIHtcbiAgICAgICAgICAgIHRtcEFyci5wdXNoKFxuICAgICAgICAgICAgICAgIHRtcENoYXJhY3RlcnNbaV1cbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1tcXFNdKy9nLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1snXG4gICAgICAgICAgICAgICAgICAgICAgICArIHRtcENoYXJhY3RlcnNbaV0udG9Mb3dlckNhc2UoKS5yZXBsYWNlKGVzY1JlZ0V4cCwgJ1xcXFwkJicpXG4gICAgICAgICAgICAgICAgICAgICAgICArICd8JyArIHRtcENoYXJhY3RlcnNbaV0udG9VcHBlckNhc2UoKS5yZXBsYWNlKGVzY1JlZ0V4cCwgJ1xcXFwkJicpXG4gICAgICAgICAgICAgICAgICAgICAgICArICddICdcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvW1xcc10rL2csICdbXFxcXHNdKicpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgdG1wU3RyID0gJygnICsgdG1wQXJyLmpvaW4oJycpICsgJyknO1xuICAgICAgICByZWdRdWVyeSA9IG5ldyBSZWdFeHAodG1wU3RyKTtcblxuICAgICAgICBpZiAocmVnUXVlcnkudGVzdCh0ZXh0KSkge1xuICAgICAgICAgICAgcmV0dXJuU3RyID0gdGV4dC5yZXBsYWNlKHJlZ1F1ZXJ5LCAnPHN0cm9uZz4nICsgUmVnRXhwLiQxICsgJzwvc3Ryb25nPicpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJldHVyblN0cjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBmaXJzdCByZXN1bHQgaXRlbVxuICAgICAqIEByZXR1cm5zIHtFbGVtZW50fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEZpcnN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29yZGVyU3RhZ2UodGhpcy5mbG93TWFwLkZJUlNUKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBsYXN0IHJlc3VsdCBpdGVtXG4gICAgICogQHJldHVybnMge0VsZW1lbnR9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0TGFzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcmRlclN0YWdlKHRoaXMuZmxvd01hcC5MQVNUKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHdoZXRoZXIgZmlyc3Qgb3IgbGFzdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIEZpcnN0L2VuZCBlbGVtZW50IHR5cGVcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vcmRlclN0YWdlOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHR5cGUgPSAodHlwZSA9PT0gdGhpcy5mbG93TWFwLkZJUlNUKSA/ICdmaXJzdCcgOiAnbGFzdCc7XG5cbiAgICAgICAgaWYgKHRoaXMuJHJlc3VsdExpc3QgJiZcbiAgICAgICAgICAgIHRoaXMuJHJlc3VsdExpc3QuY2hpbGRyZW4oKSAmJlxuICAgICAgICAgICAgdGhpcy4kcmVzdWx0TGlzdC5jaGlsZHJlbigpLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJHJlc3VsdExpc3QuY2hpbGRyZW4oKVt0eXBlXSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gbmV4dCBlbGVtZW50IGZyb20gc2VsZWN0ZWQgZWxlbWVudFxuICAgICAqIElmIG5leHQgZWxlbWVudCBpcyBub3QgZXhpc3QsIHJldHVybiBmaXJzdCBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudCBmb2N1c2VkIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7RWxlbWVudH1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXROZXh0OiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcmRlckVsZW1lbnQodGhpcy5mbG93TWFwLk5FWFQsIGVsZW1lbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gcHJldmlvdXMgZWxlbWVudCBmcm9tIHNlbGVjdGVkIGVsZW1lbnRcbiAgICAgKiBJZiBwcmV2aW91cyBlbGVtZW50IGlzIG5vdCBleGlzdCwgcmV0dXJuIHRoZSBsYXN0IGVsZW1lbnQuXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IGZvY3VzZWQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtFbGVtZW50fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFByZXY6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29yZGVyRWxlbWVudCh0aGlzLmZsb3dNYXAuUFJFViwgZWxlbWVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBwcmV2aW91cyBvciBuZXh0IGVsZW1lbnQgYnkgZGlyZWN0aW9uLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIFRoZSBkaXJlY3Rpb24gdHlwZSBmb3IgZmluZGluZyBlbGVtZW50XG4gICAgICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IGZvY3VzZWQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29yZGVyRWxlbWVudDogZnVuY3Rpb24odHlwZSwgZWxlbWVudCkge1xuICAgICAgICB2YXIgJGN1cnJlbnQsIGlzTmV4dCwgb3JkZXI7XG5cbiAgICAgICAgaWYgKCF0dWkudXRpbC5pc0V4aXN0eShlbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAkY3VycmVudCA9ICQoZWxlbWVudCk7XG4gICAgICAgIGlzTmV4dCA9ICh0eXBlID09PSB0aGlzLmZsb3dNYXAuTkVYVCk7XG4gICAgICAgIGlmICgkY3VycmVudC5jbG9zZXN0KHRoaXMucmVzdWx0U2VsZWN0b3IpKSB7XG4gICAgICAgICAgICBvcmRlciA9IGlzTmV4dCA/IGVsZW1lbnQubmV4dCgpIDogZWxlbWVudC5wcmV2KCk7XG4gICAgICAgICAgICBpZiAob3JkZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yZGVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGlzTmV4dCA/IHRoaXMuX2dldEZpcnN0KCkgOiB0aGlzLl9nZXRMYXN0KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCB3aGV0aGVyIGF1dG8gY29tcGxldGUgdXNlIG9yIG5vdCBhbmQgY2hhbmdlIHN3aXRjaCdzIHN0YXRlLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3VzZUF1dG9Db21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpc1VzZSA9IHRoaXMuYXV0b0NvbXBsZXRlT2JqLmlzVXNlQXV0b0NvbXBsZXRlKCk7XG4gICAgICAgIHRoaXMuY2hhbmdlT25PZmZUZXh0KGlzVXNlKTtcbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouc2V0Q29va2llVmFsdWUoIWlzVXNlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyBhdXRvIGNvbXBsZXRlIHN3aXRjaCBhcmVhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2hvd0JvdHRvbUFyZWE6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy4kb25PZmZUeHQpIHtcbiAgICAgICAgICAgIHRoaXMuJG9uT2ZmVHh0LnNob3coKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIGF1dG8gY29tcGxldGUgc3dpdGNoIGFyZWFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9oaWRlQm90dG9tQXJlYTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLiRvbk9mZlR4dCkge1xuICAgICAgICAgICAgdGhpcy4kb25PZmZUeHQuaGlkZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSBhY3Rpb24gYXR0cmlidXRlIG9mIGZvcm0gZWxlbWVudCBhbmQgc2V0IGFkZGl0aW9uIHZhbHVlcyBpbiBoaWRkZW4gdHlwZSBlbGVtZW50cy5cbiAgICAgKiBAcGFyYW0ge2VsZW1lbnR9IFskdGFyZ2V0XSBTdWJtaXQgb3B0aW9ucyB0YXJnZXRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRTdWJtaXRPcHRpb246IGZ1bmN0aW9uKCR0YXJnZXQpIHtcbiAgICAgICAgdmFyIGZvcm1FbGVtZW50LCAkc2VsZWN0RmllbGQsIGFjdGlvbnMsXG4gICAgICAgICAgICBpbmRleCwgY29uZmlnLCBhY3Rpb24sIHBhcmFtc1N0cmluZztcblxuICAgICAgICB0aGlzLl9jbGVhclN1Ym1pdE9wdGlvbigpO1xuICAgICAgICBmb3JtRWxlbWVudCA9IHRoaXMub3B0aW9ucy5mb3JtRWxlbWVudDtcbiAgICAgICAgJHNlbGVjdEZpZWxkID0gJHRhcmdldCA/ICQoJHRhcmdldCkuY2xvc2VzdCgnbGknKSA6ICQodGhpcy5zZWxlY3RlZEVsZW1lbnQpO1xuICAgICAgICBhY3Rpb25zID0gdGhpcy5vcHRpb25zLmFjdGlvbnM7XG4gICAgICAgIGluZGV4ID0gJHNlbGVjdEZpZWxkLmF0dHIoJ2RhdGEtaW5kZXgnKTtcbiAgICAgICAgY29uZmlnID0gdGhpcy5vcHRpb25zLmxpc3RDb25maWdbaW5kZXhdO1xuICAgICAgICBhY3Rpb24gPSBhY3Rpb25zW2NvbmZpZy5hY3Rpb25dO1xuXG4gICAgICAgICQoZm9ybUVsZW1lbnQpLmF0dHIoJ2FjdGlvbicsIGFjdGlvbik7XG4gICAgICAgIHBhcmFtc1N0cmluZyA9ICRzZWxlY3RGaWVsZC5hdHRyKCdkYXRhLXBhcmFtcycpO1xuXG4gICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnNldFBhcmFtcyhwYXJhbXNTdHJpbmcsIGluZGV4KTtcblxuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5maXJlKCdjaGFuZ2UnLCB7XG4gICAgICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgICAgICBhY3Rpb246IGFjdGlvbixcbiAgICAgICAgICAgIHBhcmFtczogcGFyYW1zU3RyaW5nXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXNldCBmb3JtIGVsZW1lbnQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2xlYXJTdWJtaXRPcHRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZm9ybUVsZW1lbnQgPSB0aGlzLm9wdGlvbnMuZm9ybUVsZW1lbnQsXG4gICAgICAgICAgICBoaWRkZW5XcmFwID0gJChmb3JtRWxlbWVudCkuZmluZCgnLmhpZGRlbi1pbnB1dHMnKTtcblxuICAgICAgICBoaWRkZW5XcmFwLmh0bWwoJycpO1xuICAgIH0sXG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKiBFdmVudCBIYW5kbGVycyAqKioqKioqKioqKioqKioqKioqKiovXG4gICAgLyoqXG4gICAgICogUmVzdWx0IGxpc3QgbW91c2VvdmVyIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlIEV2ZW50IGluc3RhbnNlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25Nb3VzZU92ZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyICR0YXJnZXQgPSAkKGUudGFyZ2V0KSxcbiAgICAgICAgICAgICRhcnIgPSB0aGlzLiRyZXN1bHRMaXN0LmZpbmQoJ2xpJyksXG4gICAgICAgICAgICBzZWxlY3RlZEl0ZW0gPSAkdGFyZ2V0LmNsb3Nlc3QoJ2xpJyk7XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaEFycmF5KCRhcnIsIGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgJCh2YWwpLnJlbW92ZUNsYXNzKHRoaXMubW91c2VPdmVyQ2xhc3MpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICBpZiAoc2VsZWN0ZWRJdGVtICYmIHNlbGVjdGVkSXRlbS5maW5kKCcua2V5d29yZC1maWVsZCcpLmxlbmd0aCkge1xuICAgICAgICAgICAgc2VsZWN0ZWRJdGVtLmFkZENsYXNzKHRoaXMubW91c2VPdmVyQ2xhc3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZWxlY3RlZEVsZW1lbnQgPSAkdGFyZ2V0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXN1bHQgbGlzdCBjbGljayBldm5ldCBoYW5kbGVyXG4gICAgICogU3VibWl0IGZvcm0gZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlIEV2ZW50IGluc3RhbnNlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25DbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgJHRhcmdldCA9ICQoZS50YXJnZXQpLFxuICAgICAgICAgICAgZm9ybUVsZW1lbnQgPSB0aGlzLm9wdGlvbnMuZm9ybUVsZW1lbnQsXG4gICAgICAgICAgICAkc2VsZWN0RmllbGQgPSAkdGFyZ2V0LmNsb3Nlc3QoJ2xpJyksXG4gICAgICAgICAgICAka2V5d29yZEZpZWxkID0gJHNlbGVjdEZpZWxkLmZpbmQoJy5rZXl3b3JkLWZpZWxkJyksXG4gICAgICAgICAgICBzZWxlY3RlZEtleXdvcmQgPSAka2V5d29yZEZpZWxkLnRleHQoKTtcblxuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5zZXRWYWx1ZShzZWxlY3RlZEtleXdvcmQpO1xuXG4gICAgICAgIGlmIChmb3JtRWxlbWVudCAmJiBzZWxlY3RlZEtleXdvcmQpIHtcbiAgICAgICAgICAgIHRoaXMuX3NldFN1Ym1pdE9wdGlvbigkdGFyZ2V0KTtcbiAgICAgICAgICAgIGZvcm1FbGVtZW50LnN1Ym1pdCgpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVzdWx0O1xuIl19
