(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
tui.util.defineNamespace('tui.component.AutoComplete', require('./src/js/AutoComplete'));

},{"./src/js/AutoComplete":2}],2:[function(require,module,exports){
/**
 * @fileoverview Auto complete's Core element. All of auto complete objects belong with this object.
 * @version 1.1.0
 * @author NHN Entertainment FE Dev Team. <dl_javascript@nhnent.com>
*/

var DataManager = require('./manager/data');
var InputManager = require('./manager/input');
var ResultManager = require('./manager/result');

/**
 @constructor
 @param {Object} htOptions
 @example
    var autoCompleteObj = new ne.component.AutoComplete({
       "configId" : "Default"    // Dataset in autoConfig.js
    });
    /**
    The form of config file "autoConfig.js"
    {
        Default = {
        // Result element
        'resultListElement': '._resultBox',

        // Input element
        'searchBoxElement':  '#ac_input1',

        // Hidden element that is for throwing query that user type.
        'orgQueryElement' : '#org_query',

        // on,off Button element
        'toggleBtnElement' : $("#onoffBtn"),

        // on,off State element
        'onoffTextElement' : $(".baseBox .bottom"),

        // on, off State image source
        'toggleImg' : {
            'on' : '../img/btn_on.jpg',
            'off' : '../img/btn_off.jpg'
        },

        // Collection items each count.
        'viewCount' : 3,

        // Key arrays (sub query keys' array)
        'subQuerySet': [
            ['key1', 'key2', 'key3'],
            ['dep1', 'dep2', 'dep3'],
            ['ch1', 'ch2', 'ch3'],
            ['cid']
        ],

        // Config for auto complete list by index of collection
        'listConfig': {
            '0': {
                'template': 'department',
                'subQuerySet' : 0,
                'action': 0
            },
            '1': {
                'template': 'srch_in_department',
                'subQuerySet' : 1,
                'action': 0
            },
            '2': {
                'template': 'srch_in_department',
                'subQuerySet' : 2,
                'action': 1,
                'staticParams': 0
            },
            '3': {
                'template': 'department',
                'subQuerySet' : 0,
                'action': 1,
                'staticParams': 1
            }
        },

         // Mark up for each collection. (Default markup is defaults.)
         // This markup has to have "keywold-field" but title.
         'template' :  {
                department:    {
                    element: '<li class="department">' +
                                '<span class="slot-field">Shop the</span> ' +
                                '<a href="#" class="keyword-field">@subject@</a> ' +
                                '<span class="slot-field">Store</span>' +
                             '</li>',
                     attr: ['subject']
         },
         srch : {
                    element: '<li class="srch"><span class="keyword-field">@subject@</span></li>',
                    attr: ['subject']
         },
         srch_in_department :    {
                    element: '<li class="inDepartment">' +
                                '<a href="#" class="keyword-field">@subject@</a> ' +
                                 '<span class="slot-field">in </span>' +
                                 '<span class="depart-field">@department@</span>' +
                             '</li>',
                     attr: ['subject', 'department']
         },
         title: {
                    element: '<li class="title"><span>@title@</span></li>',
                    attr: ['title']
         },
         defaults: {
                    element: '<li class="srch"><span class="keyword-field">@subject@</span></li>',
                    attr: ['subject']
         }
         },

         // Action attribute for each collection
         'actions': [
             "http://www.fashiongo.net/catalog.aspx",
             "http://www.fashiongo.net/search2.aspx"
         ],

         // Set static options for each collection.
         'staticParams':[
             "qt=ProductName",
             "at=TEST,bt=ACT"
         ],

         // Whether use title or not.
         'useTitle': true,

         // Form element that include search element
         'formElement' : '#ac_form1',

         // Cookie name for save state
         'cookieName' : "usecookie",

         // Class name for selected element
         'mouseOverClass' : 'emp',

         // Auto complete API
         'searchUrl' : 'http://10.24.136.172:20011/ac',

         // Auto complete API request config
         'searchApi' : {
                'st' : 1111,
                'r_lt' : 1111,
                'r_enc' : 'UTF-8',
                'q_enc' : 'UTF-8',
                'r_format' : 'json'
            }
       }
    }

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
        this.options = {};

        if (!this._checkValidation(htOptions)) {
            return;
        }

        var cookieValue,
            defaultCookieName = '_atcp_use_cookie';

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

        this.options.watchInterval = tui.util.isExisty(this.options.watchInterval) ? this.options.watchInterval : this.watchInterval;

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
     * @return {Boolean}
     * @private
     */
    _checkValidation: function(htOptions) {
        var config,
            configArr;

        config = htOptions.config;

        if (!tui.util.isExisty(config)) {
            throw new Error('Config file is not avaliable. #' + config);
            return false;
        }

        configArr = tui.util.keys(config);

        var configLen = configArr.length,
            i,
            requiredFields = [
                'resultListElement',
                'searchBoxElement' ,
                'orgQueryElement',
                'subQuerySet',
                'template',
                'listConfig',
                'actions',
                'formElement',
                'searchUrl',
                'searchApi'
            ],
            checkedFields = [];

        for (i = 0; i < configLen; i++) {
            if (tui.util.inArray(configArr[i], requiredFields, 0) >= 0) {
                checkedFields.push(configArr[i]);
            }
        }

        tui.util.forEach(requiredFields, function(el) {
            if (tui.util.inArray(el, checkedFields, 0) === -1) {
                throw new Error(el + 'does not not exist.');
                return false;
            }

            if (el === 'searchApi' && config['searchApi']) {
                if (!config.searchUrl ||
                    !config.searchApi.st ||
                    !config.searchApi.r_lt) {
                    alert('searchApi required value does not exist.');
                    return false;
                }
            }
        });

        for (i = 0; i < configLen; i++) {
            var configName = configArr[i],
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
     * @return {String}
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
     * Request to create addition parameters at inputManager.
     * @param {string} paramStr String to be addition parameters.(saperator '&')
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
     *  @return {Boolean}
     */
    isUseAutoComplete: function() {
        return this.isUse;
    },

    /**
     * Get whether result list area show or not
     * @return {Boolean}
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
     * @return {Boolean} resultManager의 isMoved값
     */
    getMoved: function() {
        return this.resultManager.isMoved;
    },

    /**
     * Set resultManager's isMoved field
     * @param {Boolean} isMoved Whether locked or not.
     */
    setMoved: function(moved) {
        this.resultManager.isMoved = moved;
    },

    /**
     * Reset serachApi
     * @param {Object} options searchApi옵션 설정
     * @example
     *  autoComplete.setSearchApi({
     *      'st' : 9351,
     *      'r_lt' : 7187,
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

/**
 * Unit of auto complete connecting server.
 * @constructor
 */
var Data = tui.util.defineClass(/**@lends Data.prototype */{
    init: function(autoCompleteObj, options) {
        if (arguments.length != 2) {
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

        var rsKeyWrod = keyword.replace(/\s/g, '');

        if (!keyword || !rsKeyWrod) {
            this.autoCompleteObj.hideResultList();
            return;
        }

        var dataCallback = function(){},
            defaultParam = {
                q: keyword,
                r_enc: 'UTF-8',
                q_enc: 'UTF-8',
                r_format: 'json',
                _callback: 'dataCallback'
            },
            requestParam = tui.util.extend(this.options.searchApi, defaultParam),
            keyDatas;

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
                    throw new Error('[DataManager] Request faild.' , e);
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

            if(tui.util.isEmpty(itemSet.items)) {
                return;
            }
            // create collection items.
            var keys = this._getRedirectData(itemSet);

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

/**
 * Unit of auto complete component that belong with input element.
 * @constructor
 */
var Input = tui.util.defineClass(/**@lends Input.prototype */{

    /**
     * keyboard Input KeyCode enum
     */
    keyCodeMap: {
        'TAB' : 9,
        'UP_ARROW' : 38,
        'DOWN_ARROW' : 40
    },

    /**
     * Initialize
     * @param {Object} autoCompleteObj AutoComplete instance
     * @param {object} options auto complete options
     */
    init: function(autoCompleteObj, options) {
        if (arguments.length != 2) {
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
     * @return {String}
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

        var key,
            opt = this.options,
            listConfig = opt.listConfig[index],
            config = opt.subQuerySet[listConfig.subQuerySet],
            statics = opt.staticParams[listConfig.staticParams];

        if (!this.hiddens) {
            this._createParamContainer();
        }

        tui.util.forEach(options, function(value, idx) {

            key = config[idx];
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
            val = value.split("=");
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
            this.$toggleBtn.bind('click', $.proxy(function(e) {
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
        var autoCompleteObj = this.autoCompleteObj;

        if (!autoCompleteObj.isUseAutoComplete() ||
            !autoCompleteObj.isShowResultList()) {
            return;
        }

        var code = e.keyCode,
            flow = null,
            codeMap = this.keyCodeMap,
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

/**
 * Unit of auto complete that belong with search result list.
 * @constructor
 */
var Result = tui.util.defineClass(/** @lends Result.prototype */{
    /**
     * Initailize
     */
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

        this._deleteBeforeElement();

        var len = dataArr.length;

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

        for (i = 0; i < len; i++) {
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
     * @param {array} attrs Template attributes
     * @param {string|Object} data The data to make template
     * @return {object}
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

        if(attrs.length < values.length) {
            tmplValue.params = values.slice(attrs.length);
        }

        return tmplValue;
    },

    /**
     * Return whether result list show or not
     * @return {Boolean}
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
        } else {
            if(selectEl) {
                this.moveNextList(flow);
            }
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
     * @param {String} tmplStr Template string
     * @param {Object} dataObj Replace string map
     * @return {String}
     * @private
     */
    _applyTemplate: function(tmplStr, dataObj) {
        var temp = {},
            keyStr;

        for (keyStr in dataObj) {
            temp[keyStr] = dataObj[keyStr];
            if (keyStr === 'subject') {
                temp.subject = this._highlight(dataObj.subject);
            }

            if (!dataObj.propertyIsEnumerable(keyStr)) {
                continue;
            }

            tmplStr = tmplStr.replace(new RegExp("@" + keyStr + "@", "g"), temp[keyStr]);
        }
        return tmplStr;
    },

    /**
     * Return applied highlight effect key word
     * (text: Nike air  /  query : [Nike] / Result : <strong>Nike </strong>air
     * text : 'rhdiddl와 고양이' / query :  [rhdiddl, 고양이] / 리턴결과 <strong>rhdiddl</strong>와 <strong>고양이</strong>
     * @param {String} text Input string
     * @return {String}
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
        return (returnStr || text);
    },

    /**
     * Contain text by strong tag
     * @param {String} text Recommend search data  추천검색어 데이터
     * @param {String} query Input keyword
     * @return {String}
     * @private
     */
    _makeStrong: function(text, query) {
        if (!query || query.length < 1) {
            return text;
        }
        var escRegExp = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g"),
            tmpStr = query.replace(/()/g, " ").replace(/^\s+|\s+$/g, ""),
            tmpCharacters = tmpStr.match(/\S/g),
            tmpCharLen = tmpCharacters.length,
            tmpArr = [],
            returnStr = '',
            regQuery,
            cnt,
            i;

        for (i = 0, cnt = tmpCharLen; i < cnt; i++) {
            tmpArr.push(tmpCharacters[i].replace(/[\S]+/g, "[" + tmpCharacters[i].toLowerCase().replace(escRegExp, "\\$&") + "|" + tmpCharacters[i].toUpperCase().replace(escRegExp, "\\$&") + "] ").replace(/[\s]+/g, "[\\s]*"));
        }

        tmpStr = "(" + tmpArr.join("") + ")";
        regQuery = new RegExp(tmpStr);

        if (regQuery.test(text)) {
            returnStr = text.replace(regQuery, '<strong>' + RegExp.$1 + '</strong>');
        }

        return returnStr;
    },

    /**
     * Return the first result item
     * @return {Element}
     * @private
     */
    _getFirst: function() {
        return this._orderStage(this.flowMap.FIRST);
    },

    /**
     * Return the last result item
     * @return {Element}
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
     * @return {Element}
     * @private
     */
    _getNext: function(element) {
        return this._orderElement(this.flowMap.NEXT, element);
    },

    /**
     * Return previous element from selected element
     * If previous element is not exist, return the last element.
     * @param {Element} element focused element
     * @return {Element}
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
        if (!tui.util.isExisty(element)) {
            return null;
        }

        var $current = $(element),
            isNext = (type === this.flowMap.NEXT),
            order;

        if ($current.closest(this.resultSelector)) {
            order = isNext ? element.next() : element.prev();
            if (order.length) {
                return order;
            } else {
                return isNext ? this._getFirst() : this._getLast();
            }
        }
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
        this._clearSubmitOption();

        var formElement = this.options.formElement,
            $selectField = $target ? $($target).closest('li') : $(this.selectedElement),
            actions = this.options.actions,
            index = $selectField.attr('data-index'),
            config = this.options.listConfig[index],
            action = actions[config.action],
            paramsString;

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
    _clearSubmitOption: function(e) {
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9BdXRvQ29tcGxldGUuanMiLCJzcmMvanMvbWFuYWdlci9kYXRhLmpzIiwic3JjL2pzL21hbmFnZXIvaW5wdXQuanMiLCJzcmMvanMvbWFuYWdlci9yZXN1bHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzViQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ0dWkudXRpbC5kZWZpbmVOYW1lc3BhY2UoJ3R1aS5jb21wb25lbnQuQXV0b0NvbXBsZXRlJywgcmVxdWlyZSgnLi9zcmMvanMvQXV0b0NvbXBsZXRlJykpO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEF1dG8gY29tcGxldGUncyBDb3JlIGVsZW1lbnQuIEFsbCBvZiBhdXRvIGNvbXBsZXRlIG9iamVjdHMgYmVsb25nIHdpdGggdGhpcyBvYmplY3QuXG4gKiBAdmVyc2lvbiAxLjEuMFxuICogQGF1dGhvciBOSE4gRW50ZXJ0YWlubWVudCBGRSBEZXYgVGVhbS4gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiovXG5cbnZhciBEYXRhTWFuYWdlciA9IHJlcXVpcmUoJy4vbWFuYWdlci9kYXRhJyk7XG52YXIgSW5wdXRNYW5hZ2VyID0gcmVxdWlyZSgnLi9tYW5hZ2VyL2lucHV0Jyk7XG52YXIgUmVzdWx0TWFuYWdlciA9IHJlcXVpcmUoJy4vbWFuYWdlci9yZXN1bHQnKTtcblxuLyoqXG4gQGNvbnN0cnVjdG9yXG4gQHBhcmFtIHtPYmplY3R9IGh0T3B0aW9uc1xuIEBleGFtcGxlXG4gICAgdmFyIGF1dG9Db21wbGV0ZU9iaiA9IG5ldyBuZS5jb21wb25lbnQuQXV0b0NvbXBsZXRlKHtcbiAgICAgICBcImNvbmZpZ0lkXCIgOiBcIkRlZmF1bHRcIiAgICAvLyBEYXRhc2V0IGluIGF1dG9Db25maWcuanNcbiAgICB9KTtcbiAgICAvKipcbiAgICBUaGUgZm9ybSBvZiBjb25maWcgZmlsZSBcImF1dG9Db25maWcuanNcIlxuICAgIHtcbiAgICAgICAgRGVmYXVsdCA9IHtcbiAgICAgICAgLy8gUmVzdWx0IGVsZW1lbnRcbiAgICAgICAgJ3Jlc3VsdExpc3RFbGVtZW50JzogJy5fcmVzdWx0Qm94JyxcblxuICAgICAgICAvLyBJbnB1dCBlbGVtZW50XG4gICAgICAgICdzZWFyY2hCb3hFbGVtZW50JzogICcjYWNfaW5wdXQxJyxcblxuICAgICAgICAvLyBIaWRkZW4gZWxlbWVudCB0aGF0IGlzIGZvciB0aHJvd2luZyBxdWVyeSB0aGF0IHVzZXIgdHlwZS5cbiAgICAgICAgJ29yZ1F1ZXJ5RWxlbWVudCcgOiAnI29yZ19xdWVyeScsXG5cbiAgICAgICAgLy8gb24sb2ZmIEJ1dHRvbiBlbGVtZW50XG4gICAgICAgICd0b2dnbGVCdG5FbGVtZW50JyA6ICQoXCIjb25vZmZCdG5cIiksXG5cbiAgICAgICAgLy8gb24sb2ZmIFN0YXRlIGVsZW1lbnRcbiAgICAgICAgJ29ub2ZmVGV4dEVsZW1lbnQnIDogJChcIi5iYXNlQm94IC5ib3R0b21cIiksXG5cbiAgICAgICAgLy8gb24sIG9mZiBTdGF0ZSBpbWFnZSBzb3VyY2VcbiAgICAgICAgJ3RvZ2dsZUltZycgOiB7XG4gICAgICAgICAgICAnb24nIDogJy4uL2ltZy9idG5fb24uanBnJyxcbiAgICAgICAgICAgICdvZmYnIDogJy4uL2ltZy9idG5fb2ZmLmpwZydcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBDb2xsZWN0aW9uIGl0ZW1zIGVhY2ggY291bnQuXG4gICAgICAgICd2aWV3Q291bnQnIDogMyxcblxuICAgICAgICAvLyBLZXkgYXJyYXlzIChzdWIgcXVlcnkga2V5cycgYXJyYXkpXG4gICAgICAgICdzdWJRdWVyeVNldCc6IFtcbiAgICAgICAgICAgIFsna2V5MScsICdrZXkyJywgJ2tleTMnXSxcbiAgICAgICAgICAgIFsnZGVwMScsICdkZXAyJywgJ2RlcDMnXSxcbiAgICAgICAgICAgIFsnY2gxJywgJ2NoMicsICdjaDMnXSxcbiAgICAgICAgICAgIFsnY2lkJ11cbiAgICAgICAgXSxcblxuICAgICAgICAvLyBDb25maWcgZm9yIGF1dG8gY29tcGxldGUgbGlzdCBieSBpbmRleCBvZiBjb2xsZWN0aW9uXG4gICAgICAgICdsaXN0Q29uZmlnJzoge1xuICAgICAgICAgICAgJzAnOiB7XG4gICAgICAgICAgICAgICAgJ3RlbXBsYXRlJzogJ2RlcGFydG1lbnQnLFxuICAgICAgICAgICAgICAgICdzdWJRdWVyeVNldCcgOiAwLFxuICAgICAgICAgICAgICAgICdhY3Rpb24nOiAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJzEnOiB7XG4gICAgICAgICAgICAgICAgJ3RlbXBsYXRlJzogJ3NyY2hfaW5fZGVwYXJ0bWVudCcsXG4gICAgICAgICAgICAgICAgJ3N1YlF1ZXJ5U2V0JyA6IDEsXG4gICAgICAgICAgICAgICAgJ2FjdGlvbic6IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnMic6IHtcbiAgICAgICAgICAgICAgICAndGVtcGxhdGUnOiAnc3JjaF9pbl9kZXBhcnRtZW50JyxcbiAgICAgICAgICAgICAgICAnc3ViUXVlcnlTZXQnIDogMixcbiAgICAgICAgICAgICAgICAnYWN0aW9uJzogMSxcbiAgICAgICAgICAgICAgICAnc3RhdGljUGFyYW1zJzogMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICczJzoge1xuICAgICAgICAgICAgICAgICd0ZW1wbGF0ZSc6ICdkZXBhcnRtZW50JyxcbiAgICAgICAgICAgICAgICAnc3ViUXVlcnlTZXQnIDogMCxcbiAgICAgICAgICAgICAgICAnYWN0aW9uJzogMSxcbiAgICAgICAgICAgICAgICAnc3RhdGljUGFyYW1zJzogMVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgICAvLyBNYXJrIHVwIGZvciBlYWNoIGNvbGxlY3Rpb24uIChEZWZhdWx0IG1hcmt1cCBpcyBkZWZhdWx0cy4pXG4gICAgICAgICAvLyBUaGlzIG1hcmt1cCBoYXMgdG8gaGF2ZSBcImtleXdvbGQtZmllbGRcIiBidXQgdGl0bGUuXG4gICAgICAgICAndGVtcGxhdGUnIDogIHtcbiAgICAgICAgICAgICAgICBkZXBhcnRtZW50OiAgICB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6ICc8bGkgY2xhc3M9XCJkZXBhcnRtZW50XCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cInNsb3QtZmllbGRcIj5TaG9wIHRoZTwvc3Bhbj4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8YSBocmVmPVwiI1wiIGNsYXNzPVwia2V5d29yZC1maWVsZFwiPkBzdWJqZWN0QDwvYT4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cInNsb3QtZmllbGRcIj5TdG9yZTwvc3Bhbj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwvbGk+JyxcbiAgICAgICAgICAgICAgICAgICAgIGF0dHI6IFsnc3ViamVjdCddXG4gICAgICAgICB9LFxuICAgICAgICAgc3JjaCA6IHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogJzxsaSBjbGFzcz1cInNyY2hcIj48c3BhbiBjbGFzcz1cImtleXdvcmQtZmllbGRcIj5Ac3ViamVjdEA8L3NwYW4+PC9saT4nLFxuICAgICAgICAgICAgICAgICAgICBhdHRyOiBbJ3N1YmplY3QnXVxuICAgICAgICAgfSxcbiAgICAgICAgIHNyY2hfaW5fZGVwYXJ0bWVudCA6ICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogJzxsaSBjbGFzcz1cImluRGVwYXJ0bWVudFwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGEgaHJlZj1cIiNcIiBjbGFzcz1cImtleXdvcmQtZmllbGRcIj5Ac3ViamVjdEA8L2E+ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwic2xvdC1maWVsZFwiPmluIDwvc3Bhbj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImRlcGFydC1maWVsZFwiPkBkZXBhcnRtZW50QDwvc3Bhbj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwvbGk+JyxcbiAgICAgICAgICAgICAgICAgICAgIGF0dHI6IFsnc3ViamVjdCcsICdkZXBhcnRtZW50J11cbiAgICAgICAgIH0sXG4gICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiAnPGxpIGNsYXNzPVwidGl0bGVcIj48c3Bhbj5AdGl0bGVAPC9zcGFuPjwvbGk+JyxcbiAgICAgICAgICAgICAgICAgICAgYXR0cjogWyd0aXRsZSddXG4gICAgICAgICB9LFxuICAgICAgICAgZGVmYXVsdHM6IHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogJzxsaSBjbGFzcz1cInNyY2hcIj48c3BhbiBjbGFzcz1cImtleXdvcmQtZmllbGRcIj5Ac3ViamVjdEA8L3NwYW4+PC9saT4nLFxuICAgICAgICAgICAgICAgICAgICBhdHRyOiBbJ3N1YmplY3QnXVxuICAgICAgICAgfVxuICAgICAgICAgfSxcblxuICAgICAgICAgLy8gQWN0aW9uIGF0dHJpYnV0ZSBmb3IgZWFjaCBjb2xsZWN0aW9uXG4gICAgICAgICAnYWN0aW9ucyc6IFtcbiAgICAgICAgICAgICBcImh0dHA6Ly93d3cuZmFzaGlvbmdvLm5ldC9jYXRhbG9nLmFzcHhcIixcbiAgICAgICAgICAgICBcImh0dHA6Ly93d3cuZmFzaGlvbmdvLm5ldC9zZWFyY2gyLmFzcHhcIlxuICAgICAgICAgXSxcblxuICAgICAgICAgLy8gU2V0IHN0YXRpYyBvcHRpb25zIGZvciBlYWNoIGNvbGxlY3Rpb24uXG4gICAgICAgICAnc3RhdGljUGFyYW1zJzpbXG4gICAgICAgICAgICAgXCJxdD1Qcm9kdWN0TmFtZVwiLFxuICAgICAgICAgICAgIFwiYXQ9VEVTVCxidD1BQ1RcIlxuICAgICAgICAgXSxcblxuICAgICAgICAgLy8gV2hldGhlciB1c2UgdGl0bGUgb3Igbm90LlxuICAgICAgICAgJ3VzZVRpdGxlJzogdHJ1ZSxcblxuICAgICAgICAgLy8gRm9ybSBlbGVtZW50IHRoYXQgaW5jbHVkZSBzZWFyY2ggZWxlbWVudFxuICAgICAgICAgJ2Zvcm1FbGVtZW50JyA6ICcjYWNfZm9ybTEnLFxuXG4gICAgICAgICAvLyBDb29raWUgbmFtZSBmb3Igc2F2ZSBzdGF0ZVxuICAgICAgICAgJ2Nvb2tpZU5hbWUnIDogXCJ1c2Vjb29raWVcIixcblxuICAgICAgICAgLy8gQ2xhc3MgbmFtZSBmb3Igc2VsZWN0ZWQgZWxlbWVudFxuICAgICAgICAgJ21vdXNlT3ZlckNsYXNzJyA6ICdlbXAnLFxuXG4gICAgICAgICAvLyBBdXRvIGNvbXBsZXRlIEFQSVxuICAgICAgICAgJ3NlYXJjaFVybCcgOiAnaHR0cDovLzEwLjI0LjEzNi4xNzI6MjAwMTEvYWMnLFxuXG4gICAgICAgICAvLyBBdXRvIGNvbXBsZXRlIEFQSSByZXF1ZXN0IGNvbmZpZ1xuICAgICAgICAgJ3NlYXJjaEFwaScgOiB7XG4gICAgICAgICAgICAgICAgJ3N0JyA6IDExMTEsXG4gICAgICAgICAgICAgICAgJ3JfbHQnIDogMTExMSxcbiAgICAgICAgICAgICAgICAncl9lbmMnIDogJ1VURi04JyxcbiAgICAgICAgICAgICAgICAncV9lbmMnIDogJ1VURi04JyxcbiAgICAgICAgICAgICAgICAncl9mb3JtYXQnIDogJ2pzb24nXG4gICAgICAgICAgICB9XG4gICAgICAgfVxuICAgIH1cblxuKi9cbnZhciBBdXRvQ29tcGxldGUgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKipAbGVuZHMgQXV0b0NvbXBsZXRlLnByb3RvdHlwZSAqL3tcblxuICAgIC8qKlxuICAgICAqIERpcmVjdGlvbiB2YWx1ZSBmb3Iga2V5XG4gICAgICovXG4gICAgZmxvd01hcDoge1xuICAgICAgICAnTkVYVCc6ICduZXh0JyxcbiAgICAgICAgJ1BSRVYnOiAncHJldicsXG4gICAgICAgICdGSVJTVCc6ICdmaXJzdCcsXG4gICAgICAgICdMQVNUJzogJ2xhc3QnXG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBJbnRlcnZhbCBmb3IgY2hlY2sgdXBkYXRlIGlucHV0XG4gICAgICovXG4gICAgd2F0Y2hJbnRlcnZhbDogMjAwLFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBodE9wdGlvbnMgYXV0b2NvbmZpZyB2YWx1ZXNcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihodE9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0ge307XG5cbiAgICAgICAgaWYgKCF0aGlzLl9jaGVja1ZhbGlkYXRpb24oaHRPcHRpb25zKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvb2tpZVZhbHVlLFxuICAgICAgICAgICAgZGVmYXVsdENvb2tpZU5hbWUgPSAnX2F0Y3BfdXNlX2Nvb2tpZSc7XG5cbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMudG9nZ2xlSW1nIHx8ICF0aGlzLm9wdGlvbnMub25vZmZUZXh0RWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5pc1VzZSA9IHRydWU7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5vcHRpb25zLm9ub2ZmVGV4dEVsZW1lbnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb29raWVWYWx1ZSA9ICQuY29va2llKHRoaXMub3B0aW9ucy5jb29raWVOYW1lKTtcbiAgICAgICAgICAgIHRoaXMuaXNVc2UgPSAhIShjb29raWVWYWx1ZSA9PT0gJ3VzZScgfHwgIWNvb2tpZVZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLmNvb2tpZU5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5jb29raWVOYW1lID0gZGVmYXVsdENvb2tpZU5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm9wdGlvbnMud2F0Y2hJbnRlcnZhbCA9IHR1aS51dGlsLmlzRXhpc3R5KHRoaXMub3B0aW9ucy53YXRjaEludGVydmFsKSA/IHRoaXMub3B0aW9ucy53YXRjaEludGVydmFsIDogdGhpcy53YXRjaEludGVydmFsO1xuXG4gICAgICAgIHRoaXMuZGF0YU1hbmFnZXIgPSBuZXcgRGF0YU1hbmFnZXIodGhpcywgdGhpcy5vcHRpb25zKTtcbiAgICAgICAgdGhpcy5pbnB1dE1hbmFnZXIgPSBuZXcgSW5wdXRNYW5hZ2VyKHRoaXMsIHRoaXMub3B0aW9ucyk7XG4gICAgICAgIHRoaXMucmVzdWx0TWFuYWdlciA9IG5ldyBSZXN1bHRNYW5hZ2VyKHRoaXMsIHRoaXMub3B0aW9ucyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNhdmUgbWF0Y2hlZCBpbnB1dCBlbmdsaXNoIHN0cmluZyB3aXRoIEtvcmVhbi5cbiAgICAgICAgICogQHR5cGUge251bGx9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnF1ZXJ5cyA9IG51bGw7XG4gICAgICAgIHRoaXMuaXNJZGxlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLnNldFRvZ2dsZUJ0bkltZyh0aGlzLmlzVXNlKTtcbiAgICAgICAgdGhpcy5zZXRDb29raWVWYWx1ZSh0aGlzLmlzVXNlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgcmVxdWlyZWQgZmllbGRzIGFuZCB2YWxpZGF0ZSBmaWVsZHMuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGh0T3B0aW9ucyBjb21wb25lbnQgY29uZmlndXJhdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NoZWNrVmFsaWRhdGlvbjogZnVuY3Rpb24oaHRPcHRpb25zKSB7XG4gICAgICAgIHZhciBjb25maWcsXG4gICAgICAgICAgICBjb25maWdBcnI7XG5cbiAgICAgICAgY29uZmlnID0gaHRPcHRpb25zLmNvbmZpZztcblxuICAgICAgICBpZiAoIXR1aS51dGlsLmlzRXhpc3R5KGNvbmZpZykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ29uZmlnIGZpbGUgaXMgbm90IGF2YWxpYWJsZS4gIycgKyBjb25maWcpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uZmlnQXJyID0gdHVpLnV0aWwua2V5cyhjb25maWcpO1xuXG4gICAgICAgIHZhciBjb25maWdMZW4gPSBjb25maWdBcnIubGVuZ3RoLFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIHJlcXVpcmVkRmllbGRzID0gW1xuICAgICAgICAgICAgICAgICdyZXN1bHRMaXN0RWxlbWVudCcsXG4gICAgICAgICAgICAgICAgJ3NlYXJjaEJveEVsZW1lbnQnICxcbiAgICAgICAgICAgICAgICAnb3JnUXVlcnlFbGVtZW50JyxcbiAgICAgICAgICAgICAgICAnc3ViUXVlcnlTZXQnLFxuICAgICAgICAgICAgICAgICd0ZW1wbGF0ZScsXG4gICAgICAgICAgICAgICAgJ2xpc3RDb25maWcnLFxuICAgICAgICAgICAgICAgICdhY3Rpb25zJyxcbiAgICAgICAgICAgICAgICAnZm9ybUVsZW1lbnQnLFxuICAgICAgICAgICAgICAgICdzZWFyY2hVcmwnLFxuICAgICAgICAgICAgICAgICdzZWFyY2hBcGknXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgY2hlY2tlZEZpZWxkcyA9IFtdO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb25maWdMZW47IGkrKykge1xuICAgICAgICAgICAgaWYgKHR1aS51dGlsLmluQXJyYXkoY29uZmlnQXJyW2ldLCByZXF1aXJlZEZpZWxkcywgMCkgPj0gMCkge1xuICAgICAgICAgICAgICAgIGNoZWNrZWRGaWVsZHMucHVzaChjb25maWdBcnJbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChyZXF1aXJlZEZpZWxkcywgZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgIGlmICh0dWkudXRpbC5pbkFycmF5KGVsLCBjaGVja2VkRmllbGRzLCAwKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZWwgKyAnZG9lcyBub3Qgbm90IGV4aXN0LicpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGVsID09PSAnc2VhcmNoQXBpJyAmJiBjb25maWdbJ3NlYXJjaEFwaSddKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb25maWcuc2VhcmNoVXJsIHx8XG4gICAgICAgICAgICAgICAgICAgICFjb25maWcuc2VhcmNoQXBpLnN0IHx8XG4gICAgICAgICAgICAgICAgICAgICFjb25maWcuc2VhcmNoQXBpLnJfbHQpIHtcbiAgICAgICAgICAgICAgICAgICAgYWxlcnQoJ3NlYXJjaEFwaSByZXF1aXJlZCB2YWx1ZSBkb2VzIG5vdCBleGlzdC4nKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvbmZpZ0xlbjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY29uZmlnTmFtZSA9IGNvbmZpZ0FycltpXSxcbiAgICAgICAgICAgICAgICBjb25maWdWYWx1ZSA9IGNvbmZpZ1tjb25maWdOYW1lXTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjb25maWdWYWx1ZSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgICAgIChjb25maWdWYWx1ZS5jaGFyQXQoMCkgPT09ICcuJyB8fCBjb25maWdWYWx1ZS5jaGFyQXQoMCkgPT09ICcjJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNbY29uZmlnTmFtZV0gPSAkKGNvbmZpZ1ZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zW2NvbmZpZ05hbWVdID0gY29uZmlnW2NvbmZpZ05hbWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlcXVlc3QgZGF0YSBhdCBhcGkgc2VydmVyIHdpdGgga2V5d29yZFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBrZXl3b3JkIFRoZSBrZXkgd29yZCB0byBzZW5kIHRvIEF1dG8gY29tcGxldGUgQVBJXG4gICAgICovXG4gICAgcmVxdWVzdDogZnVuY3Rpb24oa2V5d29yZCkge1xuICAgICAgICB0aGlzLmRhdGFNYW5hZ2VyLnJlcXVlc3Qoa2V5d29yZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBzdHJpbmcgaW4gaW5wdXQgZWxlbWVudC5cbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgZ2V0VmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dE1hbmFnZXIuZ2V0VmFsdWUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGlucHV0TWFuYWdlcidzIHZhbHVlIHRvIHNob3cgYXQgc2VhcmNoIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5d29yZCBUaGUgc3RyaW5nIHRvIHNob3cgdXAgYXQgc2VhcmNoIGVsZW1lbnRcbiAgICAgKi9cbiAgICBzZXRWYWx1ZTogZnVuY3Rpb24oa2V5d29yZCkge1xuICAgICAgICB0aGlzLmlucHV0TWFuYWdlci5zZXRWYWx1ZShrZXl3b3JkKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdCB0byBjcmVhdGUgYWRkaXRpb24gcGFyYW1ldGVycyBhdCBpbnB1dE1hbmFnZXIuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtU3RyIFN0cmluZyB0byBiZSBhZGRpdGlvbiBwYXJhbWV0ZXJzLihzYXBlcmF0b3IgJyYnKVxuICAgICAqL1xuICAgIHNldFBhcmFtczogZnVuY3Rpb24ocGFyYW1TdHIsIHR5cGUpIHtcbiAgICAgICAgdGhpcy5pbnB1dE1hbmFnZXIuc2V0UGFyYW1zKHBhcmFtU3RyLCB0eXBlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdCB0byBkcmF3IHJlc3VsdCBhdCByZXN1bHRNYW5hZ2VyIHdpdGggZGF0YSBmcm9tIGFwaSBzZXJ2ZXIuXG4gICAgICogQHBhcmFtIHtBcnJheX0gZGF0YUFyciBEYXRhIGFycmF5IGZyb20gYXBpIHNlcnZlclxuICAgICAqL1xuICAgIHNldFNlcnZlckRhdGE6IGZ1bmN0aW9uKGRhdGFBcnIpIHtcbiAgICAgICAgdGhpcy5yZXN1bHRNYW5hZ2VyLmRyYXcoZGF0YUFycik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBDb29raWUgdmFsdWUgd2l0aCB3aGV0aGVyIHVzZSBhdXRvIGNvbXBsZXRlIG9yIG5vdFxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNVc2UgV2hldGhlciB1c2UgYXV0byBjb21wbGV0ZSBvciBub3RcbiAgICAgKi9cbiAgICBzZXRDb29raWVWYWx1ZTogZnVuY3Rpb24oaXNVc2UpIHtcbiAgICAgICAgJC5jb29raWUodGhpcy5vcHRpb25zLmNvb2tpZU5hbWUsIGlzVXNlID8gJ3VzZScgOiAnbm90VXNlJyk7XG4gICAgICAgIHRoaXMuaXNVc2UgPSBpc1VzZTtcbiAgICAgICAgdGhpcy5zZXRUb2dnbGVCdG5JbWcoaXNVc2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTYXZlIEtvcmVhbiB0aGF0IGlzIG1hdGNoZWQgcmVhbCBxdWVyeS5cbiAgICAgKiBAcGFyYW0ge2FycmF5fSBxdWVyeXMgUmVzdWx0IHF1cmV5c1xuICAgICAqL1xuICAgIHNldFF1ZXJ5czogZnVuY3Rpb24ocXVlcnlzKSB7XG4gICAgICAgIHRoaXMucXVlcnlzID0gW10uY29uY2F0KHF1ZXJ5cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3aGV0aGVyIHVzZSBhdXRvIGNvbXBsZXRlIG9yIG5vdFxuICAgICAqICBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzVXNlQXV0b0NvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNVc2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3aGV0aGVyIHJlc3VsdCBsaXN0IGFyZWEgc2hvdyBvciBub3RcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzU2hvd1Jlc3VsdExpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHRNYW5hZ2VyLmlzU2hvd1Jlc3VsdExpc3QoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hhbmdlIHRvZ2dsZSBidXR0b24gaW1hZ2UgYnkgYXV0byBjb21wbGV0ZSBzdGF0ZVxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNVc2Ugd2hldGhlciB1c2UgYXV0byBjb21wbGV0ZSBvciBub3RcbiAgICAgKi9cbiAgICBzZXRUb2dnbGVCdG5JbWc6IGZ1bmN0aW9uKGlzVXNlKSB7XG4gICAgICAgIHRoaXMuaW5wdXRNYW5hZ2VyLnNldFRvZ2dsZUJ0bkltZyhpc1VzZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgc2VhcmNoIHJlc3VsdCBsaXN0IGFyZWFcbiAgICAgKi9cbiAgICBoaWRlUmVzdWx0TGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmlzVXNlQXV0b0NvbXBsZXRlKCkpIHtcbiAgICAgICAgICAgIHRoaXMucmVzdWx0TWFuYWdlci5oaWRlUmVzdWx0TGlzdCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgc2VhcmNoIHJlc3VsdCBsaXN0IGFyZWFcbiAgICAgKi9cbiAgICBzaG93UmVzdWx0TGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmlzVXNlQXV0b0NvbXBsZXRlKCkpIHtcbiAgICAgICAgICAgIHRoaXMucmVzdWx0TWFuYWdlci5zaG93UmVzdWx0TGlzdCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1vdmUgdG8gbmV4dCBpdGVtIGluIHJlc3VsdCBsaXN0LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmbG93IERpcmVjdGlvbiB0byBtb3ZlLlxuICAgICAqL1xuICAgIG1vdmVOZXh0TGlzdDogZnVuY3Rpb24oZmxvdykge1xuICAgICAgICB0aGlzLnJlc3VsdE1hbmFnZXIubW92ZU5leHRMaXN0KGZsb3cpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGV4dCB0byBhdXRvIGNvbXBsZXRlIHN3aXRjaFxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNVc2UgV2hldGhlciB1c2UgYXV0byBjb21wbGV0ZSBvciBub3RcbiAgICAgKi9cbiAgICBjaGFuZ2VPbk9mZlRleHQ6IGZ1bmN0aW9uKGlzVXNlKSB7XG4gICAgICAgIHRoaXMucmVzdWx0TWFuYWdlci5jaGFuZ2VPbk9mZlRleHQoaXNVc2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gcmVzdWx0TWFuYWdlciB3aGV0aGVyIGxvY2tlZCBvciBub3RcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSByZXN1bHRNYW5hZ2Vy7J2YIGlzTW92ZWTqsJJcbiAgICAgKi9cbiAgICBnZXRNb3ZlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdE1hbmFnZXIuaXNNb3ZlZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHJlc3VsdE1hbmFnZXIncyBpc01vdmVkIGZpZWxkXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpc01vdmVkIFdoZXRoZXIgbG9ja2VkIG9yIG5vdC5cbiAgICAgKi9cbiAgICBzZXRNb3ZlZDogZnVuY3Rpb24obW92ZWQpIHtcbiAgICAgICAgdGhpcy5yZXN1bHRNYW5hZ2VyLmlzTW92ZWQgPSBtb3ZlZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVzZXQgc2VyYWNoQXBpXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgc2VhcmNoQXBp7Ji17IWYIOyEpOyglVxuICAgICAqIEBleGFtcGxlXG4gICAgICogIGF1dG9Db21wbGV0ZS5zZXRTZWFyY2hBcGkoe1xuICAgICAqICAgICAgJ3N0JyA6IDkzNTEsXG4gICAgICogICAgICAncl9sdCcgOiA3MTg3LFxuICAgICAqICAgICAgJ3JfZW5jJyA6ICdVVEYtOCcsXG4gICAgICogICAgICAncV9lbmMnIDogJ1VURi04JyxcbiAgICAgKiAgICAgICdyX2Zvcm1hdCcgOiAnanNvbidcbiAgICAgKiAgfSk7XG4gICAgICovXG4gICAgc2V0U2VhcmNoQXBpOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHR1aS51dGlsLmV4dGVuZCh0aGlzLm9wdGlvbnMuc2VhcmNoQXBpLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY2xlYXIgcmVhZHkgdmFsdWUgYW5kIHNldCBpZGxlIHN0YXRlXG4gICAgICovXG4gICAgY2xlYXJSZWFkeVZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHR1aS51dGlsLmlzRXhpc3R5KHRoaXMucmVhZHlWYWx1ZSkpIHtcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdCh0aGlzLnJlYWR5VmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pc0lkbGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVhZHlWYWx1ZSA9IG51bGw7XG4gICAgfVxufSk7XG50dWkudXRpbC5DdXN0b21FdmVudHMubWl4aW4oQXV0b0NvbXBsZXRlKTtcbm1vZHVsZS5leHBvcnRzID0gQXV0b0NvbXBsZXRlO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IERhdGEgaXMga2luZCBvZiBtYW5hZ2VyIG1vZHVsZSB0byByZXF1ZXN0IGRhdGEgYXQgQVBJIHdpdGggaW5wdXQgcXVlcnlzLlxuICogQHZlcnNpb24gMS4xLjBcbiAqIEBhdXRob3IgTkhOIEVudGVydGFpbm1lbnQgRkUgZGV2IHRlYW0uIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuLyoqXG4gKiBVbml0IG9mIGF1dG8gY29tcGxldGUgY29ubmVjdGluZyBzZXJ2ZXIuXG4gKiBAY29uc3RydWN0b3JcbiAqL1xudmFyIERhdGEgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKipAbGVuZHMgRGF0YS5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24oYXV0b0NvbXBsZXRlT2JqLCBvcHRpb25zKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoICE9IDIpIHtcbiAgICAgICAgICAgIGFsZXJ0KCdhcmd1bWVudCBsZW5ndGggZXJyb3IgIScpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmogPSBhdXRvQ29tcGxldGVPYmo7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlcXVlc3QgZGF0YSBhdCBhcGkgc2VydmVyIHVzZSBqc29ucFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBrZXl3b3JkIFN0cmluZyB0byByZXF1ZXN0IGF0IHNlcnZlclxuICAgICAqL1xuICAgIHJlcXVlc3Q6IGZ1bmN0aW9uKGtleXdvcmQpIHtcblxuICAgICAgICB2YXIgcnNLZXlXcm9kID0ga2V5d29yZC5yZXBsYWNlKC9cXHMvZywgJycpO1xuXG4gICAgICAgIGlmICgha2V5d29yZCB8fCAhcnNLZXlXcm9kKSB7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5oaWRlUmVzdWx0TGlzdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRhdGFDYWxsYmFjayA9IGZ1bmN0aW9uKCl7fSxcbiAgICAgICAgICAgIGRlZmF1bHRQYXJhbSA9IHtcbiAgICAgICAgICAgICAgICBxOiBrZXl3b3JkLFxuICAgICAgICAgICAgICAgIHJfZW5jOiAnVVRGLTgnLFxuICAgICAgICAgICAgICAgIHFfZW5jOiAnVVRGLTgnLFxuICAgICAgICAgICAgICAgIHJfZm9ybWF0OiAnanNvbicsXG4gICAgICAgICAgICAgICAgX2NhbGxiYWNrOiAnZGF0YUNhbGxiYWNrJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlcXVlc3RQYXJhbSA9IHR1aS51dGlsLmV4dGVuZCh0aGlzLm9wdGlvbnMuc2VhcmNoQXBpLCBkZWZhdWx0UGFyYW0pLFxuICAgICAgICAgICAga2V5RGF0YXM7XG5cbiAgICAgICAgJC5hamF4KHRoaXMub3B0aW9ucy5zZWFyY2hVcmwsIHtcbiAgICAgICAgICAgICdkYXRhVHlwZSc6ICdqc29ucCcsXG4gICAgICAgICAgICAnanNvbnBDYWxsYmFjayc6ICdkYXRhQ2FsbGJhY2snLFxuICAgICAgICAgICAgJ2RhdGEnOiByZXF1ZXN0UGFyYW0sXG4gICAgICAgICAgICAndHlwZSc6ICdnZXQnLFxuICAgICAgICAgICAgJ3N1Y2Nlc3MnOiB0dWkudXRpbC5iaW5kKGZ1bmN0aW9uKGRhdGFPYmopIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBrZXlEYXRhcyA9IHRoaXMuX2dldENvbGxlY3Rpb25EYXRhKGRhdGFPYmopO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5zZXRRdWVyeXMoZGF0YU9iai5xdWVyeSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnNldFNlcnZlckRhdGEoa2V5RGF0YXMpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5jbGVhclJlYWR5VmFsdWUoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignW0RhdGFNYW5hZ2VyXSBSZXF1ZXN0IGZhaWxkLicgLCBlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzKVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIE1ha2UgY29sbGVjdGlvbiBkYXRhIHRvIGRpc3BsYXlcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YU9iaiBDb2xsZWN0aW9uIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q29sbGVjdGlvbkRhdGE6IGZ1bmN0aW9uKGRhdGFPYmopIHtcbiAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBkYXRhT2JqLmNvbGxlY3Rpb25zLFxuICAgICAgICAgICAgaXRlbURhdGFMaXN0ID0gW107XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChjb2xsZWN0aW9uLCBmdW5jdGlvbihpdGVtU2V0KSB7XG5cbiAgICAgICAgICAgIGlmKHR1aS51dGlsLmlzRW1wdHkoaXRlbVNldC5pdGVtcykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBjcmVhdGUgY29sbGVjdGlvbiBpdGVtcy5cbiAgICAgICAgICAgIHZhciBrZXlzID0gdGhpcy5fZ2V0UmVkaXJlY3REYXRhKGl0ZW1TZXQpO1xuXG4gICAgICAgICAgICBpdGVtRGF0YUxpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3RpdGxlJyxcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IFtpdGVtU2V0LnRpdGxlXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdGVtRGF0YUxpc3QgPSBpdGVtRGF0YUxpc3QuY29uY2F0KGtleXMpO1xuXG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBpdGVtRGF0YUxpc3Q7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBNYWtlIGl0ZW0gb2YgY29sbGVjdGlvbiB0byBkaXNwbGF5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGl0ZW1TZXQgSXRlbSBvZiBjb2xsZWN0aW9uIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEByZXR1cm5zIHtBcnJheX1cbiAgICAgKi9cbiAgICBfZ2V0UmVkaXJlY3REYXRhOiBmdW5jdGlvbihpdGVtU2V0KSB7XG4gICAgICAgIHZhciB0eXBlID0gaXRlbVNldC50eXBlLFxuICAgICAgICAgICAgaW5kZXggPSBpdGVtU2V0LmluZGV4LFxuICAgICAgICAgICAgZGVzdCA9IGl0ZW1TZXQuZGVzdGluYXRpb24sXG4gICAgICAgICAgICBpdGVtcyA9IFtdO1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheShpdGVtU2V0Lml0ZW1zLCBmdW5jdGlvbihpdGVtLCBpZHgpIHtcblxuICAgICAgICAgICAgaWYgKGlkeCA8PSAodGhpcy5vcHRpb25zLnZpZXdDb3VudCAtIDEpKSB7XG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlczogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICAgICAgICAgICAgICBkZXN0OiBkZXN0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGE7XG4iLCIvKipcbiAqIEBmaWxlT3ZlcnZpZXcgSW5wdXQgaXMga2luZCBvZiBtYW5hZ2VyIG1vZHVsZSB0byBzdXBwb3J0IGlucHV0IGVsZW1lbnQgZXZlbnRzIGFuZCBhbGwgb2YgaW5wdXQgZnVuY3Rpb25zLlxuICogQHZlcnNpb24gMS4xLjBcbiAqIEBhdXRob3IgTkhOIEVudGVydGFpbm1lbnQgRkUgZGV2IHRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4vKipcbiAqIFVuaXQgb2YgYXV0byBjb21wbGV0ZSBjb21wb25lbnQgdGhhdCBiZWxvbmcgd2l0aCBpbnB1dCBlbGVtZW50LlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbnZhciBJbnB1dCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKkBsZW5kcyBJbnB1dC5wcm90b3R5cGUgKi97XG5cbiAgICAvKipcbiAgICAgKiBrZXlib2FyZCBJbnB1dCBLZXlDb2RlIGVudW1cbiAgICAgKi9cbiAgICBrZXlDb2RlTWFwOiB7XG4gICAgICAgICdUQUInIDogOSxcbiAgICAgICAgJ1VQX0FSUk9XJyA6IDM4LFxuICAgICAgICAnRE9XTl9BUlJPVycgOiA0MFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF1dG9Db21wbGV0ZU9iaiBBdXRvQ29tcGxldGUgaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBhdXRvIGNvbXBsZXRlIG9wdGlvbnNcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihhdXRvQ29tcGxldGVPYmosIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggIT0gMikge1xuICAgICAgICAgICAgYWxlcnQoJ2FyZ3VtZW50IGxlbmd0aCBlcnJvciAhJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmogPSBhdXRvQ29tcGxldGVPYmo7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICAgICAgLy8gU2F2ZSBlbGVtZW50cyBmcm9tIGNvbmZpZ3VyYXRpb24uXG4gICAgICAgIHRoaXMuJHNlYXJjaEJveCA9IHRoaXMub3B0aW9ucy5zZWFyY2hCb3hFbGVtZW50O1xuICAgICAgICB0aGlzLiR0b2dnbGVCdG4gPSB0aGlzLm9wdGlvbnMudG9nZ2xlQnRuRWxlbWVudDtcbiAgICAgICAgdGhpcy4kb3JnUXVlcnkgPSB0aGlzLm9wdGlvbnMub3JnUXVlcnlFbGVtZW50O1xuICAgICAgICB0aGlzLiRmb3JtRWxlbWVudCA9IHRoaXMub3B0aW9ucy5mb3JtRWxlbWVudDtcblxuICAgICAgICB0aGlzLmlucHV0VmFsdWUgPSB0aGlzLiRzZWFyY2hCb3gudmFsKCk7XG5cbiAgICAgICAgdGhpcy5fYXR0YWNoRXZlbnQoKTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gaW5wdXQgZWxlbWVudCB2YWx1ZVxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRzZWFyY2hCb3gudmFsKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBrZXl3b3JkIHRvIGlucHV0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBrZXl3b3JkIHRvIHNldCB2YWx1ZS5cbiAgICAgKi9cbiAgICBzZXRWYWx1ZTogZnVuY3Rpb24oc3RyKSB7XG4gICAgICAgIHRoaXMuaW5wdXRWYWx1ZSA9IHN0cjtcbiAgICAgICAgdGhpcy4kc2VhcmNoQm94LnZhbChzdHIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGNvbmZpZyBmaWxlcyBwYXJhbWV0ZXIgb3B0aW9uIGFuZCBzZXQgcGFyYW1ldGVyLlxuICAgICAqIEBwYXJhbSB7YXJyYXl9IG9wdGlvbnMgVGhlIHBhcmFtZXRlcnMgZnJvbSBjb25maWdcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggVGhlIGluZGV4IGZvciBzZXR0aW5nIGtleSB2YWx1ZVxuICAgICAqL1xuICAgIHNldFBhcmFtczogZnVuY3Rpb24ob3B0aW9ucywgaW5kZXgpIHtcblxuICAgICAgICB2YXIgb3B0ID0gdGhpcy5vcHRpb25zLFxuICAgICAgICAgICAgbGlzdENvbmZpZyA9IG9wdC5saXN0Q29uZmlnW2luZGV4XSxcbiAgICAgICAgICAgIHN0YXRpY3MgPSBvcHQuc3RhdGljUGFyYW1zW2xpc3RDb25maWcuc3RhdGljUGFyYW1zXTtcblxuICAgICAgICBpZiAob3B0aW9ucyAmJiB0dWkudXRpbC5pc1N0cmluZyhvcHRpb25zKSkge1xuICAgICAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMuc3BsaXQoJywnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgoIW9wdGlvbnMgfHwgdHVpLnV0aWwuaXNFbXB0eShvcHRpb25zKSkgJiYgIXR1aS51dGlsLmlzRXhpc3R5KHN0YXRpY3MpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jcmVhdGVQYXJhbVNldEJ5VHlwZShvcHRpb25zLCBpbmRleCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBpbnB1dEVsZW1lbnQgYnkgdHlwZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIFRoZSB2YWx1ZXMgdG8gc2VuZCBzZWFyY2ggYXBpXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IFRoZSBpbmRleCBvZiBxdWVyeSBrZXkgYXJyYXlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jcmVhdGVQYXJhbVNldEJ5VHlwZTogZnVuY3Rpb24ob3B0aW9ucywgaW5kZXgpIHtcblxuICAgICAgICB2YXIga2V5LFxuICAgICAgICAgICAgb3B0ID0gdGhpcy5vcHRpb25zLFxuICAgICAgICAgICAgbGlzdENvbmZpZyA9IG9wdC5saXN0Q29uZmlnW2luZGV4XSxcbiAgICAgICAgICAgIGNvbmZpZyA9IG9wdC5zdWJRdWVyeVNldFtsaXN0Q29uZmlnLnN1YlF1ZXJ5U2V0XSxcbiAgICAgICAgICAgIHN0YXRpY3MgPSBvcHQuc3RhdGljUGFyYW1zW2xpc3RDb25maWcuc3RhdGljUGFyYW1zXTtcblxuICAgICAgICBpZiAoIXRoaXMuaGlkZGVucykge1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlUGFyYW1Db250YWluZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2gob3B0aW9ucywgZnVuY3Rpb24odmFsdWUsIGlkeCkge1xuXG4gICAgICAgICAgICBrZXkgPSBjb25maWdbaWR4XTtcbiAgICAgICAgICAgIHRoaXMuaGlkZGVucy5hcHBlbmQoJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiJyArIGtleSArICdcIiB2YWx1ZT1cIicgKyB2YWx1ZSArICdcIiAvPicpKTtcblxuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICBpZiAoc3RhdGljcykge1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlU3RhdGljUGFyYW1zKHN0YXRpY3MpO1xuICAgICAgICB9XG5cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBzdGF0aWMgcGFyYW1ldGVyc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0aWNzIFN0YXRpYyB2YWx1ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jcmVhdGVTdGF0aWNQYXJhbXM6IGZ1bmN0aW9uKHN0YXRpY3MpIHtcbiAgICAgICAgc3RhdGljcyA9IHN0YXRpY3Muc3BsaXQoJywnKTtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChzdGF0aWNzLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgdmFsID0gdmFsdWUuc3BsaXQoXCI9XCIpO1xuICAgICAgICAgICAgdGhpcy5oaWRkZW5zLmFwcGVuZCgkKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCInICsgdmFsWzBdICsgJ1wiIHZhbHVlPVwiJyArIHZhbFsxXSArICdcIiAvPicpKTtcblxuICAgICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHdyYXBwZXIgdGhhdCBiZWNvbWUgY29udGFpbmVyIG9mIGhpZGRlbiBlbGVtZW50cy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jcmVhdGVQYXJhbUNvbnRhaW5lcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuaGlkZGVucyA9ICQoJzxkaXYgY2xhc3M9XCJoaWRkZW4taW5wdXRzXCI+PC9kaXY+Jyk7XG4gICAgICAgIHRoaXMuaGlkZGVucy5oaWRlKCk7XG4gICAgICAgIHRoaXMuaGlkZGVucy5hcHBlbmRUbygkKHRoaXMuJGZvcm1FbGVtZW50KSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSB0b2dnbGUgYnV0dG9uIGltYWdlLlxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNVc2Ug7J6Q64+Z7JmE7ISxIOyCrOyaqSDsl6zrtoBcbiAgICAgKi9cbiAgICBzZXRUb2dnbGVCdG5JbWc6IGZ1bmN0aW9uKGlzVXNlKSB7XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnRvZ2dsZUltZyB8fCAhKHRoaXMuJHRvZ2dsZUJ0bikpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc1VzZSkge1xuICAgICAgICAgICAgdGhpcy4kdG9nZ2xlQnRuLmF0dHIoJ3NyYycsIHRoaXMub3B0aW9ucy50b2dnbGVJbWcub24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy4kdG9nZ2xlQnRuLmF0dHIoJ3NyYycsIHRoaXMub3B0aW9ucy50b2dnbGVJbWcub2ZmKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBQcml2YXRlIEZ1bmN0aW9ucyAqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgICAvKipcbiAgICAgKiBFdmVudCBiaW5kaW5nXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXR0YWNoRXZlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvL+qygOyDieywveyXkCBmb2N1cywga2V5dXAsIGtleWRvd24sIGNsaWNrIOydtOuypO2KuCDrsJTsnbjrlKkuXG4gICAgICAgIHRoaXMuJHNlYXJjaEJveC5iaW5kKCdmb2N1cyBrZXl1cCBrZXlkb3duIGJsdXIgY2xpY2snLCAkLnByb3h5KGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoZS50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZm9jdXMnIDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25Gb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdibHVyJyA6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uQmx1cihlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAna2V5dXAnIDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25LZXlVcChlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAna2V5ZG93bicgOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbktleURvd24oZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2NsaWNrJyA6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uQ2xpY2soKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdCA6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKSk7XG5cbiAgICAgICAgaWYgKHRoaXMuJHRvZ2dsZUJ0bikge1xuICAgICAgICAgICAgdGhpcy4kdG9nZ2xlQnRuLmJpbmQoJ2NsaWNrJywgJC5wcm94eShmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fb25DbGlja1RvZ2dsZSgpO1xuICAgICAgICAgICAgfSwgdGhpcykpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNhdmUgdXNlciBxdWVyeSBpbnRvIGhpZGRlbiBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyB0eXBlZCBieSB1c2VyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0T3JnUXVlcnk6IGZ1bmN0aW9uKHN0cikge1xuICAgICAgICB0aGlzLiRvcmdRdWVyeS52YWwoc3RyKTtcbiAgICB9LFxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKiogRXZlbnQgSGFuZGxlcnMgKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gICAgLyoqXG4gICAgICogSW5wdXQgZWxlbWVudCBvbmNsaWNrIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy/snoXroKXrkJwg7YKk7JuM65Oc6rCAIOyXhuqxsOuCmCDsnpDrj5nsmYTshLEg6riw64qlIOyCrOyaqe2VmOyngCDslYrsnLzrqbQg7Y687LmgIO2VhOyalCDsl4bsnLzrr4DroZwg6re464OlIOumrO2EtO2VmOqzoCDrgZ0uXG4gICAgICAgIGlmICghdGhpcy5hdXRvQ29tcGxldGVPYmouZ2V0VmFsdWUoKSB8fFxuICAgICAgICAgICAgIXRoaXMuYXV0b0NvbXBsZXRlT2JqLmlzVXNlQXV0b0NvbXBsZXRlKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmF1dG9Db21wbGV0ZU9iai5pc1Nob3dSZXN1bHRMaXN0KCkpIHtcbiAgICAgICAgICAgIC8v6rKw6rO8IOumrOyKpO2KuCDsmIHsl63snbQgc2hvdyDsg4Htg5zsnbTrqbQoaXNSZXN1bHRTaG93aW5nPT10cnVlKSDqsrDqs7wg66as7Iqk7Yq4IGhpZGUg7JqU7LKtXG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5oaWRlUmVzdWx0TGlzdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy/qsrDqs7wg66as7Iqk7Yq4IOyYgeyXreydtCBoaWRlIOyDge2DnOydtOuptChpc1Jlc3VsdFNob3dpbmc9PWZhbHNlKSDqsrDqs7wg66as7Iqk7Yq4IHNob3cg7JqU7LKtXG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5zaG93UmVzdWx0TGlzdCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIElucHV0IGVsZW1lbnQgZm9jdXMgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uRm9jdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvL3NldEludGVydmFsIOyEpOygle2VtOyEnCDsnbzsoJUg7Iuc6rCEIOyjvOq4sOuhnCBfb25XYXRjaCDtlajsiJjrpbwg7Iuk7ZaJ7ZWc64ukLlxuICAgICAgICB0aGlzLmludGVydmFsSWQgPSBzZXRJbnRlcnZhbCgkLnByb3h5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5fb25XYXRjaCgpO1xuICAgICAgICB9LCB0aGlzKSwgdGhpcy5vcHRpb25zLndhdGNoSW50ZXJ2YWwpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSb29wIGZvciBjaGVjayB1cGRhdGUgaW5wdXQgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uV2F0Y2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy4kc2VhcmNoQm94LnZhbCgpID09PSAnJykge1xuICAgICAgICAgICAgdGhpcy5fc2V0T3JnUXVlcnkoJycpO1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouc2V0TW92ZWQoZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaW5wdXRWYWx1ZSAhPT0gdGhpcy4kc2VhcmNoQm94LnZhbCgpKSB7XG4gICAgICAgICAgICB0aGlzLmlucHV0VmFsdWUgPSB0aGlzLiRzZWFyY2hCb3gudmFsKCk7XG4gICAgICAgICAgICB0aGlzLl9vbkNoYW5nZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmF1dG9Db21wbGV0ZU9iai5nZXRNb3ZlZCgpKSB7XG4gICAgICAgICAgICB0aGlzLl9zZXRPcmdRdWVyeSh0aGlzLiRzZWFyY2hCb3gudmFsKCkpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIElucHV0IGVsZW1lbnQga2V5dXAgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uS2V5VXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5pbnB1dFZhbHVlICE9PSB0aGlzLiRzZWFyY2hCb3gudmFsKCkpIHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRWYWx1ZSA9IHRoaXMuJHNlYXJjaEJveC52YWwoKTtcbiAgICAgICAgICAgIHRoaXMuX29uQ2hhbmdlKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5wdXQgZWxlbWVudCBvbmNoYW5nZSBldmVudCBoYW5kbGVyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25DaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuYXV0b0NvbXBsZXRlT2JqLmlzVXNlQXV0b0NvbXBsZXRlKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmF1dG9Db21wbGV0ZU9iai5pc0lkbGUpIHtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLmlzSWRsZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmoucmVxdWVzdCh0aGlzLiRzZWFyY2hCb3gudmFsKCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmoucmVhZHlWYWx1ZSA9IHRoaXMuJHNlYXJjaEJveC52YWwoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnB1dCBlbGVtZW50IGJsdXIgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQmx1cjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmludGVydmFsSWQpIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElkKTtcbiAgICAgICAgICAgIHRoaXMuaW50ZXJ2YWxJZCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5wdXQgZWxlbWVudCBrZXlkb3duIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBTZXQgYWN0aW5vIGJ5IGlucHV0IHZhbHVlXG4gICAgICogQHBhcmFtIHtFdmVudH0gZSBrZXlEb3duIEV2ZW50IGluc3RhbmNlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25LZXlEb3duOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBhdXRvQ29tcGxldGVPYmogPSB0aGlzLmF1dG9Db21wbGV0ZU9iajtcblxuICAgICAgICBpZiAoIWF1dG9Db21wbGV0ZU9iai5pc1VzZUF1dG9Db21wbGV0ZSgpIHx8XG4gICAgICAgICAgICAhYXV0b0NvbXBsZXRlT2JqLmlzU2hvd1Jlc3VsdExpc3QoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvZGUgPSBlLmtleUNvZGUsXG4gICAgICAgICAgICBmbG93ID0gbnVsbCxcbiAgICAgICAgICAgIGNvZGVNYXAgPSB0aGlzLmtleUNvZGVNYXAsXG4gICAgICAgICAgICBmbG93TWFwID0gYXV0b0NvbXBsZXRlT2JqLmZsb3dNYXA7XG5cbiAgICAgICAgaWYgKGNvZGUgPT09IGNvZGVNYXAuVEFCKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBmbG93ID0gZS5zaGlmdEtleSA/IGZsb3dNYXAuTkVYVCA6IGZsb3dNYXAuUFJFVjtcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSBjb2RlTWFwLkRPV05fQVJST1cpIHtcbiAgICAgICAgICAgIGZsb3cgPSBmbG93TWFwLk5FWFQ7XG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gY29kZU1hcC5VUF9BUlJPVykge1xuICAgICAgICAgICAgZmxvdyA9IGZsb3dNYXAuUFJFVjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGF1dG9Db21wbGV0ZU9iai5tb3ZlTmV4dExpc3QoZmxvdyk7XG5cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlIGJ1dHRvbiBjbGljayBldmVudCBoYW5kbGVyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25DbGlja1RvZ2dsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5hdXRvQ29tcGxldGVPYmouaXNVc2VBdXRvQ29tcGxldGUoKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRUb2dnbGVCdG5JbWcodHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5zZXRDb29raWVWYWx1ZSh0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLmNoYW5nZU9uT2ZmVGV4dChmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5oaWRlUmVzdWx0TGlzdCgpO1xuICAgICAgICAgICAgdGhpcy5zZXRUb2dnbGVCdG5JbWcoZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouc2V0Q29va2llVmFsdWUoZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouY2hhbmdlT25PZmZUZXh0KHRydWUpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW5wdXQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUmVzdWx0IGlzIGtpbmQgb2YgbWFuYWdpbmcgbW9kdWxlIHRvIGRyYXcgYXV0byBjb21wbGV0ZSByZXN1bHQgbGlzdCBmcm9tIHNlcnZlciBhbmQgYXBwbHkgdGVtcGxhdGUuXG4gKiBAdmVyc2lvbiAxLjEuMFxuICogQGF1dGhvciAgTkhOIGVudGVydGFpbm1lbnQgRkUgZGV2IHRlYW08ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbi8qKlxuICogVW5pdCBvZiBhdXRvIGNvbXBsZXRlIHRoYXQgYmVsb25nIHdpdGggc2VhcmNoIHJlc3VsdCBsaXN0LlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbnZhciBSZXN1bHQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFJlc3VsdC5wcm90b3R5cGUgKi97XG4gICAgLyoqXG4gICAgICogSW5pdGFpbGl6ZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKGF1dG9Db21wbGV0ZU9iaiwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iaiA9IGF1dG9Db21wbGV0ZU9iajtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcblxuICAgICAgICB0aGlzLiRyZXN1bHRMaXN0ID0gdGhpcy5vcHRpb25zLnJlc3VsdExpc3RFbGVtZW50O1xuICAgICAgICB0aGlzLnJlc3VsdFNlbGVjdG9yID0gdGhpcy5vcHRpb25zLnJlc3VsdExpc3RFbGVtZW50O1xuICAgICAgICB0aGlzLnZpZXdDb3VudCA9IHRoaXMub3B0aW9ucy52aWV3Q291bnQgfHwgMTA7XG4gICAgICAgIHRoaXMuJG9uT2ZmVHh0ID0gdGhpcy5vcHRpb25zLm9ub2ZmVGV4dEVsZW1lbnQ7XG4gICAgICAgIHRoaXMubW91c2VPdmVyQ2xhc3MgPSB0aGlzLm9wdGlvbnMubW91c2VPdmVyQ2xhc3M7XG4gICAgICAgIHRoaXMuZmxvd01hcCA9IHRoaXMuYXV0b0NvbXBsZXRlT2JqLmZsb3dNYXA7XG5cbiAgICAgICAgdGhpcy5fYXR0YWNoRXZlbnQoKTtcblxuICAgICAgICB0aGlzLnNlbGVjdGVkRWxlbWVudCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5pc01vdmVkID0gZmFsc2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERlbGV0ZSBsYXN0IHJlc3VsdCBsaXN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZGVsZXRlQmVmb3JlRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJHJlc3VsdExpc3QuaHRtbCgnJyk7XG4gICAgICAgIHRoaXMuJHJlc3VsdExpc3QuaGlkZSgpO1xuICAgICAgICB0aGlzLnNlbGVjdGVkRWxlbWVudCA9IG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERyYXcgcmVzdWx0IGZvcm0gYXBpIHNlcnZlclxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGRhdGFBcnIgUmVzdWx0IGRhdGFcbiAgICAgKi9cbiAgICBkcmF3OiBmdW5jdGlvbihkYXRhQXJyKSB7XG5cbiAgICAgICAgdGhpcy5fZGVsZXRlQmVmb3JlRWxlbWVudCgpO1xuXG4gICAgICAgIHZhciBsZW4gPSBkYXRhQXJyLmxlbmd0aDtcblxuICAgICAgICBpZiAobGVuIDwgMSkge1xuICAgICAgICAgICAgdGhpcy5faGlkZUJvdHRvbUFyZWEoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX21ha2VSZXN1bHRMaXN0KGRhdGFBcnIsIGxlbik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLiRyZXN1bHRMaXN0LnNob3coKTtcbiAgICAgICAgLy8gc2hvdyBhdXRvIGNvbXBsZXRlIHN3aXRjaFxuICAgICAgICB0aGlzLl9zaG93Qm90dG9tQXJlYSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNYWtlIHNlYXJjaCByZXN1bHQgbGlzdCBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVJlc3VsdExpc3Q6IGZ1bmN0aW9uKGRhdGFBcnIsIGxlbikge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSB0aGlzLm9wdGlvbnMudGVtcGxhdGUsXG4gICAgICAgICAgICBjb25maWcgPSB0aGlzLm9wdGlvbnMubGlzdENvbmZpZyxcbiAgICAgICAgICAgIHRtcGwsXG4gICAgICAgICAgICB1c2VUaXRsZSA9ICh0aGlzLm9wdGlvbnMudXNlVGl0bGUgJiYgISF0ZW1wbGF0ZS50aXRsZSksXG4gICAgICAgICAgICBpbmRleCxcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICB0bXBsVmFsdWUsXG4gICAgICAgICAgICAkZWwsXG4gICAgICAgICAgICBpO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgdHlwZSA9IGRhdGFBcnJbaV0udHlwZTtcbiAgICAgICAgICAgIGluZGV4ID0gZGF0YUFycltpXS5pbmRleDtcbiAgICAgICAgICAgIHRtcGwgPSBjb25maWdbaW5kZXhdID8gdGVtcGxhdGVbY29uZmlnW2luZGV4XS50ZW1wbGF0ZV0gOiB0ZW1wbGF0ZS5kZWZhdWx0cztcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAndGl0bGUnKSB7XG4gICAgICAgICAgICAgICAgdG1wbCA9IHRlbXBsYXRlLnRpdGxlO1xuICAgICAgICAgICAgICAgIGlmICghdXNlVGl0bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG1wbFZhbHVlID0gdGhpcy5fZ2V0VG1wbERhdGEodG1wbC5hdHRyLCBkYXRhQXJyW2ldKTtcbiAgICAgICAgICAgICRlbCA9ICQodGhpcy5fYXBwbHlUZW1wbGF0ZSh0bXBsLmVsZW1lbnQsIHRtcGxWYWx1ZSkpO1xuICAgICAgICAgICAgJGVsLmF0dHIoJ2RhdGEtcGFyYW1zJywgdG1wbFZhbHVlLnBhcmFtcyk7XG4gICAgICAgICAgICAkZWwuYXR0cignZGF0YS1pbmRleCcsIGluZGV4KTtcbiAgICAgICAgICAgIHRoaXMuJHJlc3VsdExpc3QuYXBwZW5kKCRlbCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWFrZSB0ZW1wbGF0ZSBkYXRhXG4gICAgICogQHBhcmFtIHthcnJheX0gYXR0cnMgVGVtcGxhdGUgYXR0cmlidXRlc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfE9iamVjdH0gZGF0YSBUaGUgZGF0YSB0byBtYWtlIHRlbXBsYXRlXG4gICAgICogQHJldHVybiB7b2JqZWN0fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFRtcGxEYXRhOiBmdW5jdGlvbihhdHRycywgZGF0YSkge1xuICAgICAgICB2YXIgdG1wbFZhbHVlID0ge30sXG4gICAgICAgICAgICB2YWx1ZXMgPSBkYXRhLnZhbHVlcyB8fCBudWxsO1xuXG4gICAgICAgIGlmICh0dWkudXRpbC5pc1N0cmluZyhkYXRhKSkge1xuICAgICAgICAgICAgdG1wbFZhbHVlW2F0dHJzWzBdXSA9IGRhdGE7XG4gICAgICAgICAgICByZXR1cm4gdG1wbFZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goYXR0cnMsIGZ1bmN0aW9uKGF0dHIsIGlkeCkge1xuXG4gICAgICAgICAgICB0bXBsVmFsdWVbYXR0cl0gPSB2YWx1ZXNbaWR4XTtcblxuICAgICAgICB9KTtcblxuICAgICAgICBpZihhdHRycy5sZW5ndGggPCB2YWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0bXBsVmFsdWUucGFyYW1zID0gdmFsdWVzLnNsaWNlKGF0dHJzLmxlbmd0aCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdG1wbFZhbHVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gd2hldGhlciByZXN1bHQgbGlzdCBzaG93IG9yIG5vdFxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgaXNTaG93UmVzdWx0TGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAodGhpcy4kcmVzdWx0TGlzdC5jc3MoJ2Rpc3BsYXknKSA9PT0gJ2Jsb2NrJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgcmVzdWx0IGxpc3QgYXJlYVxuICAgICAqL1xuICAgIGhpZGVSZXN1bHRMaXN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kcmVzdWx0TGlzdC5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICAgICAgICB0aGlzLl9oaWRlQm90dG9tQXJlYSgpO1xuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5pc0lkbGUgPSB0cnVlO1xuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5maXJlKCdjbG9zZScpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IHJlc3VsdCBsaXN0IGFyZWFcbiAgICAgKi9cbiAgICBzaG93UmVzdWx0TGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuJHJlc3VsdExpc3QuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gICAgICAgIH0sIDApO1xuXG4gICAgICAgIHRoaXMuX3Nob3dCb3R0b21BcmVhKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1vdmUgZm9jdXMgdG8gbmV4dCBpdGVtLCBjaGFuZ2UgaW5wdXQgZWxlbWVudCB2YWx1ZSBhcyBmb2N1cyB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmxvdyBEaXJlY3Rpb24gYnkga2V5IGNvZGVcbiAgICAgKi9cbiAgICBtb3ZlTmV4dExpc3Q6IGZ1bmN0aW9uKGZsb3cpIHtcbiAgICAgICAgdmFyIGZsb3dNYXAgPSB0aGlzLmZsb3dNYXAsXG4gICAgICAgICAgICBzZWxlY3RFbCA9IHRoaXMuc2VsZWN0ZWRFbGVtZW50LFxuICAgICAgICAgICAgZ2V0TmV4dCA9IChmbG93ID09PSBmbG93TWFwLk5FWFQpID8gdGhpcy5fZ2V0TmV4dCA6IHRoaXMuX2dldFByZXYsXG4gICAgICAgICAgICBnZXRCb3VuZCA9IChmbG93ID09PSBmbG93TWFwLk5FWFQpID8gdGhpcy5fZ2V0Rmlyc3QgOiB0aGlzLl9nZXRMYXN0LFxuICAgICAgICAgICAga2V5d29yZDtcbiAgICAgICAgdGhpcy5pc01vdmVkID0gdHJ1ZTtcblxuICAgICAgICBpZiAoc2VsZWN0RWwpIHtcbiAgICAgICAgICAgIHNlbGVjdEVsLnJlbW92ZUNsYXNzKHRoaXMubW91c2VPdmVyQ2xhc3MpO1xuICAgICAgICAgICAgc2VsZWN0RWwgPSB0aGlzLnNlbGVjdGVkRWxlbWVudCA9IGdldE5leHQuY2FsbCh0aGlzLCBzZWxlY3RFbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxlY3RFbCA9IHRoaXMuc2VsZWN0ZWRFbGVtZW50ID0gZ2V0Qm91bmQuY2FsbCh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGtleXdvcmQgPSBzZWxlY3RFbC5maW5kKCcua2V5d29yZC1maWVsZCcpLnRleHQoKTtcblxuICAgICAgICBpZiAoc2VsZWN0RWwgJiYga2V5d29yZCkge1xuICAgICAgICAgICAgc2VsZWN0RWwuYWRkQ2xhc3ModGhpcy5tb3VzZU92ZXJDbGFzcyk7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5zZXRWYWx1ZShrZXl3b3JkKTtcbiAgICAgICAgICAgIHRoaXMuX3NldFN1Ym1pdE9wdGlvbigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYoc2VsZWN0RWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVOZXh0TGlzdChmbG93KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFnZSB0ZXh0IGJ5IHdoZXRoZXIgYXV0byBjb21wbGV0ZSB1c2Ugb3Igbm90XG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpc1VzZSBvbi9vZmYg7Jes67aAXG4gICAgICovXG4gICAgY2hhbmdlT25PZmZUZXh0OiBmdW5jdGlvbihpc1VzZSkge1xuICAgICAgICBpZiAoaXNVc2UpIHtcbiAgICAgICAgICAgIHRoaXMuJG9uT2ZmVHh0LnRleHQoJ+yekOuPmeyZhOyEsSDsvJzquLAnKTtcbiAgICAgICAgICAgIHRoaXMuaGlkZVJlc3VsdExpc3QoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJG9uT2ZmVHh0LnRleHQoJ+yekOuPmeyZhOyEsSDrgYTquLAnKTtcbiAgICAgICAgfVxuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBhdXRvIGNvbXBsZXRlIGV2ZW50IGJlbG9uZ3Mgd2l0aCByZXN1bHQgbGlzdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kcmVzdWx0TGlzdC5iaW5kKCdtb3VzZW92ZXIgY2xpY2snLCAkLnByb3h5KGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGlmIChlLnR5cGUgPT09ICdtb3VzZW92ZXInKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fb25Nb3VzZU92ZXIoZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGUudHlwZSA9PT0gJ2NsaWNrJykge1xuICAgICAgICAgICAgICAgIHRoaXMuX29uQ2xpY2soZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpKTtcblxuICAgICAgICBpZiAodGhpcy4kb25PZmZUeHQpIHtcbiAgICAgICAgICAgIHRoaXMuJG9uT2ZmVHh0LmJpbmQoJ2NsaWNrJywgJC5wcm94eShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl91c2VBdXRvQ29tcGxldGUoKTtcbiAgICAgICAgICAgIH0sIHRoaXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQoZG9jdW1lbnQpLmJpbmQoJ2NsaWNrJywgJC5wcm94eShmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBpZiAoZS50YXJnZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSAnaHRtbCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmhpZGVSZXN1bHRMaXN0KCk7XG4gICAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBIaWdobGlnaHQga2V5IHdvcmRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdG1wbFN0ciBUZW1wbGF0ZSBzdHJpbmdcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YU9iaiBSZXBsYWNlIHN0cmluZyBtYXBcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXBwbHlUZW1wbGF0ZTogZnVuY3Rpb24odG1wbFN0ciwgZGF0YU9iaikge1xuICAgICAgICB2YXIgdGVtcCA9IHt9LFxuICAgICAgICAgICAga2V5U3RyO1xuXG4gICAgICAgIGZvciAoa2V5U3RyIGluIGRhdGFPYmopIHtcbiAgICAgICAgICAgIHRlbXBba2V5U3RyXSA9IGRhdGFPYmpba2V5U3RyXTtcbiAgICAgICAgICAgIGlmIChrZXlTdHIgPT09ICdzdWJqZWN0Jykge1xuICAgICAgICAgICAgICAgIHRlbXAuc3ViamVjdCA9IHRoaXMuX2hpZ2hsaWdodChkYXRhT2JqLnN1YmplY3QpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWRhdGFPYmoucHJvcGVydHlJc0VudW1lcmFibGUoa2V5U3RyKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0bXBsU3RyID0gdG1wbFN0ci5yZXBsYWNlKG5ldyBSZWdFeHAoXCJAXCIgKyBrZXlTdHIgKyBcIkBcIiwgXCJnXCIpLCB0ZW1wW2tleVN0cl0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0bXBsU3RyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gYXBwbGllZCBoaWdobGlnaHQgZWZmZWN0IGtleSB3b3JkXG4gICAgICogKHRleHQ6IE5pa2UgYWlyICAvICBxdWVyeSA6IFtOaWtlXSAvIFJlc3VsdCA6IDxzdHJvbmc+TmlrZSA8L3N0cm9uZz5haXJcbiAgICAgKiB0ZXh0IDogJ3JoZGlkZGzsmYAg6rOg7JaR7J20JyAvIHF1ZXJ5IDogIFtyaGRpZGRsLCDqs6DslpHsnbRdIC8g66as7YS06rKw6rO8IDxzdHJvbmc+cmhkaWRkbDwvc3Ryb25nPuyZgCA8c3Ryb25nPuqzoOyWkeydtDwvc3Ryb25nPlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0IElucHV0IHN0cmluZ1xuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9oaWdobGlnaHQ6IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgdmFyIHF1ZXJ5cyA9IHRoaXMuYXV0b0NvbXBsZXRlT2JqLnF1ZXJ5cyxcbiAgICAgICAgICAgIHJldHVyblN0cjtcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHF1ZXJ5cywgZnVuY3Rpb24ocXVlcnkpIHtcblxuICAgICAgICAgICAgaWYgKCFyZXR1cm5TdHIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm5TdHIgPSB0ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuU3RyID0gdGhpcy5fbWFrZVN0cm9uZyhyZXR1cm5TdHIsIHF1ZXJ5KTtcblxuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIChyZXR1cm5TdHIgfHwgdGV4dCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbnRhaW4gdGV4dCBieSBzdHJvbmcgdGFnXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRleHQgUmVjb21tZW5kIHNlYXJjaCBkYXRhICDstpTsspzqsoDsg4nslrQg642w7J207YSwXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHF1ZXJ5IElucHV0IGtleXdvcmRcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVN0cm9uZzogZnVuY3Rpb24odGV4dCwgcXVlcnkpIHtcbiAgICAgICAgaWYgKCFxdWVyeSB8fCBxdWVyeS5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZXNjUmVnRXhwID0gbmV3IFJlZ0V4cChcIlsuKis/fCgpXFxcXFtcXFxcXXt9XFxcXFxcXFxdXCIsIFwiZ1wiKSxcbiAgICAgICAgICAgIHRtcFN0ciA9IHF1ZXJ5LnJlcGxhY2UoLygpL2csIFwiIFwiKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCBcIlwiKSxcbiAgICAgICAgICAgIHRtcENoYXJhY3RlcnMgPSB0bXBTdHIubWF0Y2goL1xcUy9nKSxcbiAgICAgICAgICAgIHRtcENoYXJMZW4gPSB0bXBDaGFyYWN0ZXJzLmxlbmd0aCxcbiAgICAgICAgICAgIHRtcEFyciA9IFtdLFxuICAgICAgICAgICAgcmV0dXJuU3RyID0gJycsXG4gICAgICAgICAgICByZWdRdWVyeSxcbiAgICAgICAgICAgIGNudCxcbiAgICAgICAgICAgIGk7XG5cbiAgICAgICAgZm9yIChpID0gMCwgY250ID0gdG1wQ2hhckxlbjsgaSA8IGNudDsgaSsrKSB7XG4gICAgICAgICAgICB0bXBBcnIucHVzaCh0bXBDaGFyYWN0ZXJzW2ldLnJlcGxhY2UoL1tcXFNdKy9nLCBcIltcIiArIHRtcENoYXJhY3RlcnNbaV0udG9Mb3dlckNhc2UoKS5yZXBsYWNlKGVzY1JlZ0V4cCwgXCJcXFxcJCZcIikgKyBcInxcIiArIHRtcENoYXJhY3RlcnNbaV0udG9VcHBlckNhc2UoKS5yZXBsYWNlKGVzY1JlZ0V4cCwgXCJcXFxcJCZcIikgKyBcIl0gXCIpLnJlcGxhY2UoL1tcXHNdKy9nLCBcIltcXFxcc10qXCIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRtcFN0ciA9IFwiKFwiICsgdG1wQXJyLmpvaW4oXCJcIikgKyBcIilcIjtcbiAgICAgICAgcmVnUXVlcnkgPSBuZXcgUmVnRXhwKHRtcFN0cik7XG5cbiAgICAgICAgaWYgKHJlZ1F1ZXJ5LnRlc3QodGV4dCkpIHtcbiAgICAgICAgICAgIHJldHVyblN0ciA9IHRleHQucmVwbGFjZShyZWdRdWVyeSwgJzxzdHJvbmc+JyArIFJlZ0V4cC4kMSArICc8L3N0cm9uZz4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXR1cm5TdHI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgZmlyc3QgcmVzdWx0IGl0ZW1cbiAgICAgKiBAcmV0dXJuIHtFbGVtZW50fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEZpcnN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29yZGVyU3RhZ2UodGhpcy5mbG93TWFwLkZJUlNUKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBsYXN0IHJlc3VsdCBpdGVtXG4gICAgICogQHJldHVybiB7RWxlbWVudH1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRMYXN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29yZGVyU3RhZ2UodGhpcy5mbG93TWFwLkxBU1QpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gd2hldGhlciBmaXJzdCBvciBsYXN0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgRmlyc3QvZW5kIGVsZW1lbnQgdHlwZVxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29yZGVyU3RhZ2U6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgdHlwZSA9ICh0eXBlID09PSB0aGlzLmZsb3dNYXAuRklSU1QpID8gJ2ZpcnN0JyA6ICdsYXN0JztcblxuICAgICAgICBpZiAodGhpcy4kcmVzdWx0TGlzdCAmJlxuICAgICAgICAgICAgdGhpcy4kcmVzdWx0TGlzdC5jaGlsZHJlbigpICYmXG4gICAgICAgICAgICB0aGlzLiRyZXN1bHRMaXN0LmNoaWxkcmVuKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kcmVzdWx0TGlzdC5jaGlsZHJlbigpW3R5cGVdKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBuZXh0IGVsZW1lbnQgZnJvbSBzZWxlY3RlZCBlbGVtZW50XG4gICAgICogSWYgbmV4dCBlbGVtZW50IGlzIG5vdCBleGlzdCwgcmV0dXJuIGZpcnN0IGVsZW1lbnQuXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IGZvY3VzZWQgZWxlbWVudFxuICAgICAqIEByZXR1cm4ge0VsZW1lbnR9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0TmV4dDogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3JkZXJFbGVtZW50KHRoaXMuZmxvd01hcC5ORVhULCBlbGVtZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHByZXZpb3VzIGVsZW1lbnQgZnJvbSBzZWxlY3RlZCBlbGVtZW50XG4gICAgICogSWYgcHJldmlvdXMgZWxlbWVudCBpcyBub3QgZXhpc3QsIHJldHVybiB0aGUgbGFzdCBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudCBmb2N1c2VkIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtFbGVtZW50fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFByZXY6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29yZGVyRWxlbWVudCh0aGlzLmZsb3dNYXAuUFJFViwgZWxlbWVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBwcmV2aW91cyBvciBuZXh0IGVsZW1lbnQgYnkgZGlyZWN0aW9uLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIFRoZSBkaXJlY3Rpb24gdHlwZSBmb3IgZmluZGluZyBlbGVtZW50XG4gICAgICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IGZvY3VzZWQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29yZGVyRWxlbWVudDogZnVuY3Rpb24odHlwZSwgZWxlbWVudCkge1xuICAgICAgICBpZiAoIXR1aS51dGlsLmlzRXhpc3R5KGVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciAkY3VycmVudCA9ICQoZWxlbWVudCksXG4gICAgICAgICAgICBpc05leHQgPSAodHlwZSA9PT0gdGhpcy5mbG93TWFwLk5FWFQpLFxuICAgICAgICAgICAgb3JkZXI7XG5cbiAgICAgICAgaWYgKCRjdXJyZW50LmNsb3Nlc3QodGhpcy5yZXN1bHRTZWxlY3RvcikpIHtcbiAgICAgICAgICAgIG9yZGVyID0gaXNOZXh0ID8gZWxlbWVudC5uZXh0KCkgOiBlbGVtZW50LnByZXYoKTtcbiAgICAgICAgICAgIGlmIChvcmRlci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3JkZXI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBpc05leHQgPyB0aGlzLl9nZXRGaXJzdCgpIDogdGhpcy5fZ2V0TGFzdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCB3aGV0aGVyIGF1dG8gY29tcGxldGUgdXNlIG9yIG5vdCBhbmQgY2hhbmdlIHN3aXRjaCdzIHN0YXRlLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3VzZUF1dG9Db21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpc1VzZSA9IHRoaXMuYXV0b0NvbXBsZXRlT2JqLmlzVXNlQXV0b0NvbXBsZXRlKCk7XG4gICAgICAgIHRoaXMuY2hhbmdlT25PZmZUZXh0KGlzVXNlKTtcbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouc2V0Q29va2llVmFsdWUoIWlzVXNlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyBhdXRvIGNvbXBsZXRlIHN3aXRjaCBhcmVhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2hvd0JvdHRvbUFyZWE6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy4kb25PZmZUeHQpIHtcbiAgICAgICAgICAgIHRoaXMuJG9uT2ZmVHh0LnNob3coKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIGF1dG8gY29tcGxldGUgc3dpdGNoIGFyZWFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9oaWRlQm90dG9tQXJlYTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLiRvbk9mZlR4dCkge1xuICAgICAgICAgICAgdGhpcy4kb25PZmZUeHQuaGlkZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSBhY3Rpb24gYXR0cmlidXRlIG9mIGZvcm0gZWxlbWVudCBhbmQgc2V0IGFkZGl0aW9uIHZhbHVlcyBpbiBoaWRkZW4gdHlwZSBlbGVtZW50cy5cbiAgICAgKiBAcGFyYW0ge2VsZW1lbnR9IFskdGFyZ2V0XSBTdWJtaXQgb3B0aW9ucyB0YXJnZXRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRTdWJtaXRPcHRpb246IGZ1bmN0aW9uKCR0YXJnZXQpIHtcbiAgICAgICAgdGhpcy5fY2xlYXJTdWJtaXRPcHRpb24oKTtcblxuICAgICAgICB2YXIgZm9ybUVsZW1lbnQgPSB0aGlzLm9wdGlvbnMuZm9ybUVsZW1lbnQsXG4gICAgICAgICAgICAkc2VsZWN0RmllbGQgPSAkdGFyZ2V0ID8gJCgkdGFyZ2V0KS5jbG9zZXN0KCdsaScpIDogJCh0aGlzLnNlbGVjdGVkRWxlbWVudCksXG4gICAgICAgICAgICBhY3Rpb25zID0gdGhpcy5vcHRpb25zLmFjdGlvbnMsXG4gICAgICAgICAgICBpbmRleCA9ICRzZWxlY3RGaWVsZC5hdHRyKCdkYXRhLWluZGV4JyksXG4gICAgICAgICAgICBjb25maWcgPSB0aGlzLm9wdGlvbnMubGlzdENvbmZpZ1tpbmRleF0sXG4gICAgICAgICAgICBhY3Rpb24gPSBhY3Rpb25zW2NvbmZpZy5hY3Rpb25dLFxuICAgICAgICAgICAgcGFyYW1zU3RyaW5nO1xuXG4gICAgICAgICQoZm9ybUVsZW1lbnQpLmF0dHIoJ2FjdGlvbicsIGFjdGlvbik7XG4gICAgICAgIHBhcmFtc1N0cmluZyA9ICRzZWxlY3RGaWVsZC5hdHRyKCdkYXRhLXBhcmFtcycpO1xuXG4gICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnNldFBhcmFtcyhwYXJhbXNTdHJpbmcsIGluZGV4KTtcblxuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5maXJlKCdjaGFuZ2UnLCB7XG4gICAgICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgICAgICBhY3Rpb246IGFjdGlvbixcbiAgICAgICAgICAgIHBhcmFtczogcGFyYW1zU3RyaW5nXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXNldCBmb3JtIGVsZW1lbnQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2xlYXJTdWJtaXRPcHRpb246IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIGZvcm1FbGVtZW50ID0gdGhpcy5vcHRpb25zLmZvcm1FbGVtZW50LFxuICAgICAgICAgICAgaGlkZGVuV3JhcCA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJy5oaWRkZW4taW5wdXRzJyk7XG5cbiAgICAgICAgaGlkZGVuV3JhcC5odG1sKCcnKTtcbiAgICB9LFxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKiogRXZlbnQgSGFuZGxlcnMgKioqKioqKioqKioqKioqKioqKioqL1xuICAgIC8qKlxuICAgICAqIFJlc3VsdCBsaXN0IG1vdXNlb3ZlciBldmVudCBoYW5kbGVyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZSBFdmVudCBpbnN0YW5zZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uTW91c2VPdmVyOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciAkdGFyZ2V0ID0gJChlLnRhcmdldCksXG4gICAgICAgICAgICAkYXJyID0gdGhpcy4kcmVzdWx0TGlzdC5maW5kKCdsaScpLFxuICAgICAgICAgICAgc2VsZWN0ZWRJdGVtID0gJHRhcmdldC5jbG9zZXN0KCdsaScpO1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2hBcnJheSgkYXJyLCBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICQodmFsKS5yZW1vdmVDbGFzcyh0aGlzLm1vdXNlT3ZlckNsYXNzKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgaWYgKHNlbGVjdGVkSXRlbSAmJiBzZWxlY3RlZEl0ZW0uZmluZCgnLmtleXdvcmQtZmllbGQnKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHNlbGVjdGVkSXRlbS5hZGRDbGFzcyh0aGlzLm1vdXNlT3ZlckNsYXNzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRFbGVtZW50ID0gJHRhcmdldDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVzdWx0IGxpc3QgY2xpY2sgZXZuZXQgaGFuZGxlclxuICAgICAqIFN1Ym1pdCBmb3JtIGVsZW1lbnQuXG4gICAgICogQHBhcmFtIHtFdmVudH0gZSBFdmVudCBpbnN0YW5zZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyICR0YXJnZXQgPSAkKGUudGFyZ2V0KSxcbiAgICAgICAgICAgIGZvcm1FbGVtZW50ID0gdGhpcy5vcHRpb25zLmZvcm1FbGVtZW50LFxuICAgICAgICAgICAgJHNlbGVjdEZpZWxkID0gJHRhcmdldC5jbG9zZXN0KCdsaScpLFxuICAgICAgICAgICAgJGtleXdvcmRGaWVsZCA9ICRzZWxlY3RGaWVsZC5maW5kKCcua2V5d29yZC1maWVsZCcpLFxuICAgICAgICAgICAgc2VsZWN0ZWRLZXl3b3JkID0gJGtleXdvcmRGaWVsZC50ZXh0KCk7XG5cbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouc2V0VmFsdWUoc2VsZWN0ZWRLZXl3b3JkKTtcblxuICAgICAgICBpZiAoZm9ybUVsZW1lbnQgJiYgc2VsZWN0ZWRLZXl3b3JkKSB7XG4gICAgICAgICAgICB0aGlzLl9zZXRTdWJtaXRPcHRpb24oJHRhcmdldCk7XG4gICAgICAgICAgICBmb3JtRWxlbWVudC5zdWJtaXQoKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlc3VsdDtcbiJdfQ==
