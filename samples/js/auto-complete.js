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
     * @api
     * @example
     *  autoComplete.isUseAutoComplete(); => true|false
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9BdXRvQ29tcGxldGUuanMiLCJzcmMvanMvbWFuYWdlci9kYXRhLmpzIiwic3JjL2pzL21hbmFnZXIvaW5wdXQuanMiLCJzcmMvanMvbWFuYWdlci9yZXN1bHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ0dWkudXRpbC5kZWZpbmVOYW1lc3BhY2UoJ3R1aS5jb21wb25lbnQuQXV0b0NvbXBsZXRlJywgcmVxdWlyZSgnLi9zcmMvanMvQXV0b0NvbXBsZXRlJykpO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEF1dG8gY29tcGxldGUncyBDb3JlIGVsZW1lbnQuIEFsbCBvZiBhdXRvIGNvbXBsZXRlIG9iamVjdHMgYmVsb25nIHdpdGggdGhpcyBvYmplY3QuXG4gKiBAdmVyc2lvbiAxLjEuMFxuICogQGF1dGhvciBOSE4gRW50ZXJ0YWlubWVudCBGRSBEZXYgVGVhbS4gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiovXG5cbnZhciBEYXRhTWFuYWdlciA9IHJlcXVpcmUoJy4vbWFuYWdlci9kYXRhJyk7XG52YXIgSW5wdXRNYW5hZ2VyID0gcmVxdWlyZSgnLi9tYW5hZ2VyL2lucHV0Jyk7XG52YXIgUmVzdWx0TWFuYWdlciA9IHJlcXVpcmUoJy4vbWFuYWdlci9yZXN1bHQnKTtcblxuLyoqXG4gQGNvbnN0cnVjdG9yXG4gQHBhcmFtIHtPYmplY3R9IGh0T3B0aW9uc1xuIEBleGFtcGxlXG4gICAgdmFyIGF1dG9Db21wbGV0ZU9iaiA9IG5ldyBuZS5jb21wb25lbnQuQXV0b0NvbXBsZXRlKHtcbiAgICAgICBcImNvbmZpZ0lkXCIgOiBcIkRlZmF1bHRcIiAgICAvLyBEYXRhc2V0IGluIGF1dG9Db25maWcuanNcbiAgICB9KTtcbiAgICAvKipcbiAgICBUaGUgZm9ybSBvZiBjb25maWcgZmlsZSBcImF1dG9Db25maWcuanNcIlxuICAgIHtcbiAgICAgICAgRGVmYXVsdCA9IHtcbiAgICAgICAgLy8gUmVzdWx0IGVsZW1lbnRcbiAgICAgICAgJ3Jlc3VsdExpc3RFbGVtZW50JzogJy5fcmVzdWx0Qm94JyxcblxuICAgICAgICAvLyBJbnB1dCBlbGVtZW50XG4gICAgICAgICdzZWFyY2hCb3hFbGVtZW50JzogICcjYWNfaW5wdXQxJyxcblxuICAgICAgICAvLyBIaWRkZW4gZWxlbWVudCB0aGF0IGlzIGZvciB0aHJvd2luZyBxdWVyeSB0aGF0IHVzZXIgdHlwZS5cbiAgICAgICAgJ29yZ1F1ZXJ5RWxlbWVudCcgOiAnI29yZ19xdWVyeScsXG5cbiAgICAgICAgLy8gb24sb2ZmIEJ1dHRvbiBlbGVtZW50XG4gICAgICAgICd0b2dnbGVCdG5FbGVtZW50JyA6ICQoXCIjb25vZmZCdG5cIiksXG5cbiAgICAgICAgLy8gb24sb2ZmIFN0YXRlIGVsZW1lbnRcbiAgICAgICAgJ29ub2ZmVGV4dEVsZW1lbnQnIDogJChcIi5iYXNlQm94IC5ib3R0b21cIiksXG5cbiAgICAgICAgLy8gb24sIG9mZiBTdGF0ZSBpbWFnZSBzb3VyY2VcbiAgICAgICAgJ3RvZ2dsZUltZycgOiB7XG4gICAgICAgICAgICAnb24nIDogJy4uL2ltZy9idG5fb24uanBnJyxcbiAgICAgICAgICAgICdvZmYnIDogJy4uL2ltZy9idG5fb2ZmLmpwZydcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBDb2xsZWN0aW9uIGl0ZW1zIGVhY2ggY291bnQuXG4gICAgICAgICd2aWV3Q291bnQnIDogMyxcblxuICAgICAgICAvLyBLZXkgYXJyYXlzIChzdWIgcXVlcnkga2V5cycgYXJyYXkpXG4gICAgICAgICdzdWJRdWVyeVNldCc6IFtcbiAgICAgICAgICAgIFsna2V5MScsICdrZXkyJywgJ2tleTMnXSxcbiAgICAgICAgICAgIFsnZGVwMScsICdkZXAyJywgJ2RlcDMnXSxcbiAgICAgICAgICAgIFsnY2gxJywgJ2NoMicsICdjaDMnXSxcbiAgICAgICAgICAgIFsnY2lkJ11cbiAgICAgICAgXSxcblxuICAgICAgICAvLyBDb25maWcgZm9yIGF1dG8gY29tcGxldGUgbGlzdCBieSBpbmRleCBvZiBjb2xsZWN0aW9uXG4gICAgICAgICdsaXN0Q29uZmlnJzoge1xuICAgICAgICAgICAgJzAnOiB7XG4gICAgICAgICAgICAgICAgJ3RlbXBsYXRlJzogJ2RlcGFydG1lbnQnLFxuICAgICAgICAgICAgICAgICdzdWJRdWVyeVNldCcgOiAwLFxuICAgICAgICAgICAgICAgICdhY3Rpb24nOiAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJzEnOiB7XG4gICAgICAgICAgICAgICAgJ3RlbXBsYXRlJzogJ3NyY2hfaW5fZGVwYXJ0bWVudCcsXG4gICAgICAgICAgICAgICAgJ3N1YlF1ZXJ5U2V0JyA6IDEsXG4gICAgICAgICAgICAgICAgJ2FjdGlvbic6IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnMic6IHtcbiAgICAgICAgICAgICAgICAndGVtcGxhdGUnOiAnc3JjaF9pbl9kZXBhcnRtZW50JyxcbiAgICAgICAgICAgICAgICAnc3ViUXVlcnlTZXQnIDogMixcbiAgICAgICAgICAgICAgICAnYWN0aW9uJzogMSxcbiAgICAgICAgICAgICAgICAnc3RhdGljUGFyYW1zJzogMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICczJzoge1xuICAgICAgICAgICAgICAgICd0ZW1wbGF0ZSc6ICdkZXBhcnRtZW50JyxcbiAgICAgICAgICAgICAgICAnc3ViUXVlcnlTZXQnIDogMCxcbiAgICAgICAgICAgICAgICAnYWN0aW9uJzogMSxcbiAgICAgICAgICAgICAgICAnc3RhdGljUGFyYW1zJzogMVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgICAvLyBNYXJrIHVwIGZvciBlYWNoIGNvbGxlY3Rpb24uIChEZWZhdWx0IG1hcmt1cCBpcyBkZWZhdWx0cy4pXG4gICAgICAgICAvLyBUaGlzIG1hcmt1cCBoYXMgdG8gaGF2ZSBcImtleXdvbGQtZmllbGRcIiBidXQgdGl0bGUuXG4gICAgICAgICAndGVtcGxhdGUnIDogIHtcbiAgICAgICAgICAgICAgICBkZXBhcnRtZW50OiAgICB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6ICc8bGkgY2xhc3M9XCJkZXBhcnRtZW50XCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cInNsb3QtZmllbGRcIj5TaG9wIHRoZTwvc3Bhbj4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8YSBocmVmPVwiI1wiIGNsYXNzPVwia2V5d29yZC1maWVsZFwiPkBzdWJqZWN0QDwvYT4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cInNsb3QtZmllbGRcIj5TdG9yZTwvc3Bhbj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwvbGk+JyxcbiAgICAgICAgICAgICAgICAgICAgIGF0dHI6IFsnc3ViamVjdCddXG4gICAgICAgICB9LFxuICAgICAgICAgc3JjaCA6IHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogJzxsaSBjbGFzcz1cInNyY2hcIj48c3BhbiBjbGFzcz1cImtleXdvcmQtZmllbGRcIj5Ac3ViamVjdEA8L3NwYW4+PC9saT4nLFxuICAgICAgICAgICAgICAgICAgICBhdHRyOiBbJ3N1YmplY3QnXVxuICAgICAgICAgfSxcbiAgICAgICAgIHNyY2hfaW5fZGVwYXJ0bWVudCA6ICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogJzxsaSBjbGFzcz1cImluRGVwYXJ0bWVudFwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGEgaHJlZj1cIiNcIiBjbGFzcz1cImtleXdvcmQtZmllbGRcIj5Ac3ViamVjdEA8L2E+ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwic2xvdC1maWVsZFwiPmluIDwvc3Bhbj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImRlcGFydC1maWVsZFwiPkBkZXBhcnRtZW50QDwvc3Bhbj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwvbGk+JyxcbiAgICAgICAgICAgICAgICAgICAgIGF0dHI6IFsnc3ViamVjdCcsICdkZXBhcnRtZW50J11cbiAgICAgICAgIH0sXG4gICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiAnPGxpIGNsYXNzPVwidGl0bGVcIj48c3Bhbj5AdGl0bGVAPC9zcGFuPjwvbGk+JyxcbiAgICAgICAgICAgICAgICAgICAgYXR0cjogWyd0aXRsZSddXG4gICAgICAgICB9LFxuICAgICAgICAgZGVmYXVsdHM6IHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogJzxsaSBjbGFzcz1cInNyY2hcIj48c3BhbiBjbGFzcz1cImtleXdvcmQtZmllbGRcIj5Ac3ViamVjdEA8L3NwYW4+PC9saT4nLFxuICAgICAgICAgICAgICAgICAgICBhdHRyOiBbJ3N1YmplY3QnXVxuICAgICAgICAgfVxuICAgICAgICAgfSxcblxuICAgICAgICAgLy8gQWN0aW9uIGF0dHJpYnV0ZSBmb3IgZWFjaCBjb2xsZWN0aW9uXG4gICAgICAgICAnYWN0aW9ucyc6IFtcbiAgICAgICAgICAgICBcImh0dHA6Ly93d3cuZmFzaGlvbmdvLm5ldC9jYXRhbG9nLmFzcHhcIixcbiAgICAgICAgICAgICBcImh0dHA6Ly93d3cuZmFzaGlvbmdvLm5ldC9zZWFyY2gyLmFzcHhcIlxuICAgICAgICAgXSxcblxuICAgICAgICAgLy8gU2V0IHN0YXRpYyBvcHRpb25zIGZvciBlYWNoIGNvbGxlY3Rpb24uXG4gICAgICAgICAnc3RhdGljUGFyYW1zJzpbXG4gICAgICAgICAgICAgXCJxdD1Qcm9kdWN0TmFtZVwiLFxuICAgICAgICAgICAgIFwiYXQ9VEVTVCxidD1BQ1RcIlxuICAgICAgICAgXSxcblxuICAgICAgICAgLy8gV2hldGhlciB1c2UgdGl0bGUgb3Igbm90LlxuICAgICAgICAgJ3VzZVRpdGxlJzogdHJ1ZSxcblxuICAgICAgICAgLy8gRm9ybSBlbGVtZW50IHRoYXQgaW5jbHVkZSBzZWFyY2ggZWxlbWVudFxuICAgICAgICAgJ2Zvcm1FbGVtZW50JyA6ICcjYWNfZm9ybTEnLFxuXG4gICAgICAgICAvLyBDb29raWUgbmFtZSBmb3Igc2F2ZSBzdGF0ZVxuICAgICAgICAgJ2Nvb2tpZU5hbWUnIDogXCJ1c2Vjb29raWVcIixcblxuICAgICAgICAgLy8gQ2xhc3MgbmFtZSBmb3Igc2VsZWN0ZWQgZWxlbWVudFxuICAgICAgICAgJ21vdXNlT3ZlckNsYXNzJyA6ICdlbXAnLFxuXG4gICAgICAgICAvLyBBdXRvIGNvbXBsZXRlIEFQSVxuICAgICAgICAgJ3NlYXJjaFVybCcgOiAnaHR0cDovLzEwLjI0LjEzNi4xNzI6MjAwMTEvYWMnLFxuXG4gICAgICAgICAvLyBBdXRvIGNvbXBsZXRlIEFQSSByZXF1ZXN0IGNvbmZpZ1xuICAgICAgICAgJ3NlYXJjaEFwaScgOiB7XG4gICAgICAgICAgICAgICAgJ3N0JyA6IDExMTEsXG4gICAgICAgICAgICAgICAgJ3JfbHQnIDogMTExMSxcbiAgICAgICAgICAgICAgICAncl9lbmMnIDogJ1VURi04JyxcbiAgICAgICAgICAgICAgICAncV9lbmMnIDogJ1VURi04JyxcbiAgICAgICAgICAgICAgICAncl9mb3JtYXQnIDogJ2pzb24nXG4gICAgICAgICAgICB9XG4gICAgICAgfVxuICAgIH1cblxuKi9cbnZhciBBdXRvQ29tcGxldGUgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKipAbGVuZHMgQXV0b0NvbXBsZXRlLnByb3RvdHlwZSAqL3tcblxuICAgIC8qKlxuICAgICAqIERpcmVjdGlvbiB2YWx1ZSBmb3Iga2V5XG4gICAgICovXG4gICAgZmxvd01hcDoge1xuICAgICAgICAnTkVYVCc6ICduZXh0JyxcbiAgICAgICAgJ1BSRVYnOiAncHJldicsXG4gICAgICAgICdGSVJTVCc6ICdmaXJzdCcsXG4gICAgICAgICdMQVNUJzogJ2xhc3QnXG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBJbnRlcnZhbCBmb3IgY2hlY2sgdXBkYXRlIGlucHV0XG4gICAgICovXG4gICAgd2F0Y2hJbnRlcnZhbDogMjAwLFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBodE9wdGlvbnMgYXV0b2NvbmZpZyB2YWx1ZXNcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihodE9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0ge307XG5cbiAgICAgICAgaWYgKCF0aGlzLl9jaGVja1ZhbGlkYXRpb24oaHRPcHRpb25zKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvb2tpZVZhbHVlLFxuICAgICAgICAgICAgZGVmYXVsdENvb2tpZU5hbWUgPSAnX2F0Y3BfdXNlX2Nvb2tpZSc7XG5cbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMudG9nZ2xlSW1nIHx8ICF0aGlzLm9wdGlvbnMub25vZmZUZXh0RWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5pc1VzZSA9IHRydWU7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5vcHRpb25zLm9ub2ZmVGV4dEVsZW1lbnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb29raWVWYWx1ZSA9ICQuY29va2llKHRoaXMub3B0aW9ucy5jb29raWVOYW1lKTtcbiAgICAgICAgICAgIHRoaXMuaXNVc2UgPSAhIShjb29raWVWYWx1ZSA9PT0gJ3VzZScgfHwgIWNvb2tpZVZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLmNvb2tpZU5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5jb29raWVOYW1lID0gZGVmYXVsdENvb2tpZU5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm9wdGlvbnMud2F0Y2hJbnRlcnZhbCA9IHR1aS51dGlsLmlzRXhpc3R5KHRoaXMub3B0aW9ucy53YXRjaEludGVydmFsKSA/IHRoaXMub3B0aW9ucy53YXRjaEludGVydmFsIDogdGhpcy53YXRjaEludGVydmFsO1xuXG4gICAgICAgIHRoaXMuZGF0YU1hbmFnZXIgPSBuZXcgRGF0YU1hbmFnZXIodGhpcywgdGhpcy5vcHRpb25zKTtcbiAgICAgICAgdGhpcy5pbnB1dE1hbmFnZXIgPSBuZXcgSW5wdXRNYW5hZ2VyKHRoaXMsIHRoaXMub3B0aW9ucyk7XG4gICAgICAgIHRoaXMucmVzdWx0TWFuYWdlciA9IG5ldyBSZXN1bHRNYW5hZ2VyKHRoaXMsIHRoaXMub3B0aW9ucyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNhdmUgbWF0Y2hlZCBpbnB1dCBlbmdsaXNoIHN0cmluZyB3aXRoIEtvcmVhbi5cbiAgICAgICAgICogQHR5cGUge251bGx9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnF1ZXJ5cyA9IG51bGw7XG4gICAgICAgIHRoaXMuaXNJZGxlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLnNldFRvZ2dsZUJ0bkltZyh0aGlzLmlzVXNlKTtcbiAgICAgICAgdGhpcy5zZXRDb29raWVWYWx1ZSh0aGlzLmlzVXNlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgcmVxdWlyZWQgZmllbGRzIGFuZCB2YWxpZGF0ZSBmaWVsZHMuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGh0T3B0aW9ucyBjb21wb25lbnQgY29uZmlndXJhdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NoZWNrVmFsaWRhdGlvbjogZnVuY3Rpb24oaHRPcHRpb25zKSB7XG4gICAgICAgIHZhciBjb25maWcsXG4gICAgICAgICAgICBjb25maWdBcnI7XG5cbiAgICAgICAgY29uZmlnID0gaHRPcHRpb25zLmNvbmZpZztcblxuICAgICAgICBpZiAoIXR1aS51dGlsLmlzRXhpc3R5KGNvbmZpZykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ29uZmlnIGZpbGUgaXMgbm90IGF2YWxpYWJsZS4gIycgKyBjb25maWcpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uZmlnQXJyID0gdHVpLnV0aWwua2V5cyhjb25maWcpO1xuXG4gICAgICAgIHZhciBjb25maWdMZW4gPSBjb25maWdBcnIubGVuZ3RoLFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIHJlcXVpcmVkRmllbGRzID0gW1xuICAgICAgICAgICAgICAgICdyZXN1bHRMaXN0RWxlbWVudCcsXG4gICAgICAgICAgICAgICAgJ3NlYXJjaEJveEVsZW1lbnQnICxcbiAgICAgICAgICAgICAgICAnb3JnUXVlcnlFbGVtZW50JyxcbiAgICAgICAgICAgICAgICAnc3ViUXVlcnlTZXQnLFxuICAgICAgICAgICAgICAgICd0ZW1wbGF0ZScsXG4gICAgICAgICAgICAgICAgJ2xpc3RDb25maWcnLFxuICAgICAgICAgICAgICAgICdhY3Rpb25zJyxcbiAgICAgICAgICAgICAgICAnZm9ybUVsZW1lbnQnLFxuICAgICAgICAgICAgICAgICdzZWFyY2hVcmwnLFxuICAgICAgICAgICAgICAgICdzZWFyY2hBcGknXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgY2hlY2tlZEZpZWxkcyA9IFtdO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb25maWdMZW47IGkrKykge1xuICAgICAgICAgICAgaWYgKHR1aS51dGlsLmluQXJyYXkoY29uZmlnQXJyW2ldLCByZXF1aXJlZEZpZWxkcywgMCkgPj0gMCkge1xuICAgICAgICAgICAgICAgIGNoZWNrZWRGaWVsZHMucHVzaChjb25maWdBcnJbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChyZXF1aXJlZEZpZWxkcywgZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgIGlmICh0dWkudXRpbC5pbkFycmF5KGVsLCBjaGVja2VkRmllbGRzLCAwKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZWwgKyAnZG9lcyBub3Qgbm90IGV4aXN0LicpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvbmZpZ0xlbjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY29uZmlnTmFtZSA9IGNvbmZpZ0FycltpXSxcbiAgICAgICAgICAgICAgICBjb25maWdWYWx1ZSA9IGNvbmZpZ1tjb25maWdOYW1lXTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjb25maWdWYWx1ZSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgICAgIChjb25maWdWYWx1ZS5jaGFyQXQoMCkgPT09ICcuJyB8fCBjb25maWdWYWx1ZS5jaGFyQXQoMCkgPT09ICcjJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNbY29uZmlnTmFtZV0gPSAkKGNvbmZpZ1ZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zW2NvbmZpZ05hbWVdID0gY29uZmlnW2NvbmZpZ05hbWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlcXVlc3QgZGF0YSBhdCBhcGkgc2VydmVyIHdpdGgga2V5d29yZFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBrZXl3b3JkIFRoZSBrZXkgd29yZCB0byBzZW5kIHRvIEF1dG8gY29tcGxldGUgQVBJXG4gICAgICovXG4gICAgcmVxdWVzdDogZnVuY3Rpb24oa2V5d29yZCkge1xuICAgICAgICB0aGlzLmRhdGFNYW5hZ2VyLnJlcXVlc3Qoa2V5d29yZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBzdHJpbmcgaW4gaW5wdXQgZWxlbWVudC5cbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgZ2V0VmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dE1hbmFnZXIuZ2V0VmFsdWUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGlucHV0TWFuYWdlcidzIHZhbHVlIHRvIHNob3cgYXQgc2VhcmNoIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5d29yZCBUaGUgc3RyaW5nIHRvIHNob3cgdXAgYXQgc2VhcmNoIGVsZW1lbnRcbiAgICAgKi9cbiAgICBzZXRWYWx1ZTogZnVuY3Rpb24oa2V5d29yZCkge1xuICAgICAgICB0aGlzLmlucHV0TWFuYWdlci5zZXRWYWx1ZShrZXl3b3JkKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdCB0byBjcmVhdGUgYWRkaXRpb24gcGFyYW1ldGVycyBhdCBpbnB1dE1hbmFnZXIuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtU3RyIFN0cmluZyB0byBiZSBhZGRpdGlvbiBwYXJhbWV0ZXJzLihzYXBlcmF0b3IgJyYnKVxuICAgICAqL1xuICAgIHNldFBhcmFtczogZnVuY3Rpb24ocGFyYW1TdHIsIHR5cGUpIHtcbiAgICAgICAgdGhpcy5pbnB1dE1hbmFnZXIuc2V0UGFyYW1zKHBhcmFtU3RyLCB0eXBlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdCB0byBkcmF3IHJlc3VsdCBhdCByZXN1bHRNYW5hZ2VyIHdpdGggZGF0YSBmcm9tIGFwaSBzZXJ2ZXIuXG4gICAgICogQHBhcmFtIHtBcnJheX0gZGF0YUFyciBEYXRhIGFycmF5IGZyb20gYXBpIHNlcnZlclxuICAgICAqL1xuICAgIHNldFNlcnZlckRhdGE6IGZ1bmN0aW9uKGRhdGFBcnIpIHtcbiAgICAgICAgdGhpcy5yZXN1bHRNYW5hZ2VyLmRyYXcoZGF0YUFycik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBDb29raWUgdmFsdWUgd2l0aCB3aGV0aGVyIHVzZSBhdXRvIGNvbXBsZXRlIG9yIG5vdFxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNVc2UgV2hldGhlciB1c2UgYXV0byBjb21wbGV0ZSBvciBub3RcbiAgICAgKi9cbiAgICBzZXRDb29raWVWYWx1ZTogZnVuY3Rpb24oaXNVc2UpIHtcbiAgICAgICAgJC5jb29raWUodGhpcy5vcHRpb25zLmNvb2tpZU5hbWUsIGlzVXNlID8gJ3VzZScgOiAnbm90VXNlJyk7XG4gICAgICAgIHRoaXMuaXNVc2UgPSBpc1VzZTtcbiAgICAgICAgdGhpcy5zZXRUb2dnbGVCdG5JbWcoaXNVc2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTYXZlIEtvcmVhbiB0aGF0IGlzIG1hdGNoZWQgcmVhbCBxdWVyeS5cbiAgICAgKiBAcGFyYW0ge2FycmF5fSBxdWVyeXMgUmVzdWx0IHF1cmV5c1xuICAgICAqL1xuICAgIHNldFF1ZXJ5czogZnVuY3Rpb24ocXVlcnlzKSB7XG4gICAgICAgIHRoaXMucXVlcnlzID0gW10uY29uY2F0KHF1ZXJ5cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3aGV0aGVyIHVzZSBhdXRvIGNvbXBsZXRlIG9yIG5vdFxuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqICBhdXRvQ29tcGxldGUuaXNVc2VBdXRvQ29tcGxldGUoKTsgPT4gdHJ1ZXxmYWxzZVxuICAgICAqICBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzVXNlQXV0b0NvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNVc2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3aGV0aGVyIHJlc3VsdCBsaXN0IGFyZWEgc2hvdyBvciBub3RcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzU2hvd1Jlc3VsdExpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHRNYW5hZ2VyLmlzU2hvd1Jlc3VsdExpc3QoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hhbmdlIHRvZ2dsZSBidXR0b24gaW1hZ2UgYnkgYXV0byBjb21wbGV0ZSBzdGF0ZVxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNVc2Ugd2hldGhlciB1c2UgYXV0byBjb21wbGV0ZSBvciBub3RcbiAgICAgKi9cbiAgICBzZXRUb2dnbGVCdG5JbWc6IGZ1bmN0aW9uKGlzVXNlKSB7XG4gICAgICAgIHRoaXMuaW5wdXRNYW5hZ2VyLnNldFRvZ2dsZUJ0bkltZyhpc1VzZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgc2VhcmNoIHJlc3VsdCBsaXN0IGFyZWFcbiAgICAgKi9cbiAgICBoaWRlUmVzdWx0TGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmlzVXNlQXV0b0NvbXBsZXRlKCkpIHtcbiAgICAgICAgICAgIHRoaXMucmVzdWx0TWFuYWdlci5oaWRlUmVzdWx0TGlzdCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgc2VhcmNoIHJlc3VsdCBsaXN0IGFyZWFcbiAgICAgKi9cbiAgICBzaG93UmVzdWx0TGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmlzVXNlQXV0b0NvbXBsZXRlKCkpIHtcbiAgICAgICAgICAgIHRoaXMucmVzdWx0TWFuYWdlci5zaG93UmVzdWx0TGlzdCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1vdmUgdG8gbmV4dCBpdGVtIGluIHJlc3VsdCBsaXN0LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmbG93IERpcmVjdGlvbiB0byBtb3ZlLlxuICAgICAqL1xuICAgIG1vdmVOZXh0TGlzdDogZnVuY3Rpb24oZmxvdykge1xuICAgICAgICB0aGlzLnJlc3VsdE1hbmFnZXIubW92ZU5leHRMaXN0KGZsb3cpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGV4dCB0byBhdXRvIGNvbXBsZXRlIHN3aXRjaFxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNVc2UgV2hldGhlciB1c2UgYXV0byBjb21wbGV0ZSBvciBub3RcbiAgICAgKi9cbiAgICBjaGFuZ2VPbk9mZlRleHQ6IGZ1bmN0aW9uKGlzVXNlKSB7XG4gICAgICAgIHRoaXMucmVzdWx0TWFuYWdlci5jaGFuZ2VPbk9mZlRleHQoaXNVc2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gcmVzdWx0TWFuYWdlciB3aGV0aGVyIGxvY2tlZCBvciBub3RcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSByZXN1bHRNYW5hZ2Vy7J2YIGlzTW92ZWTqsJJcbiAgICAgKi9cbiAgICBnZXRNb3ZlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdE1hbmFnZXIuaXNNb3ZlZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHJlc3VsdE1hbmFnZXIncyBpc01vdmVkIGZpZWxkXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpc01vdmVkIFdoZXRoZXIgbG9ja2VkIG9yIG5vdC5cbiAgICAgKi9cbiAgICBzZXRNb3ZlZDogZnVuY3Rpb24obW92ZWQpIHtcbiAgICAgICAgdGhpcy5yZXN1bHRNYW5hZ2VyLmlzTW92ZWQgPSBtb3ZlZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVzZXQgc2VyYWNoQXBpXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgc2VhcmNoQXBp7Ji17IWYIOyEpOyglVxuICAgICAqIEBleGFtcGxlXG4gICAgICogIGF1dG9Db21wbGV0ZS5zZXRTZWFyY2hBcGkoe1xuICAgICAqICAgICAgJ3N0JyA6IDExMSxcbiAgICAgKiAgICAgICdyX2x0JyA6IDExMSxcbiAgICAgKiAgICAgICdyX2VuYycgOiAnVVRGLTgnLFxuICAgICAqICAgICAgJ3FfZW5jJyA6ICdVVEYtOCcsXG4gICAgICogICAgICAncl9mb3JtYXQnIDogJ2pzb24nXG4gICAgICogIH0pO1xuICAgICAqL1xuICAgIHNldFNlYXJjaEFwaTogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB0dWkudXRpbC5leHRlbmQodGhpcy5vcHRpb25zLnNlYXJjaEFwaSwgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNsZWFyIHJlYWR5IHZhbHVlIGFuZCBzZXQgaWRsZSBzdGF0ZVxuICAgICAqL1xuICAgIGNsZWFyUmVhZHlWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0dWkudXRpbC5pc0V4aXN0eSh0aGlzLnJlYWR5VmFsdWUpKSB7XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3QodGhpcy5yZWFkeVZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaXNJZGxlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlYWR5VmFsdWUgPSBudWxsO1xuICAgIH1cbn0pO1xudHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKEF1dG9Db21wbGV0ZSk7XG5tb2R1bGUuZXhwb3J0cyA9IEF1dG9Db21wbGV0ZTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBEYXRhIGlzIGtpbmQgb2YgbWFuYWdlciBtb2R1bGUgdG8gcmVxdWVzdCBkYXRhIGF0IEFQSSB3aXRoIGlucHV0IHF1ZXJ5cy5cbiAqIEB2ZXJzaW9uIDEuMS4wXG4gKiBAYXV0aG9yIE5ITiBFbnRlcnRhaW5tZW50IEZFIGRldiB0ZWFtLiA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbi8qKlxuICogVW5pdCBvZiBhdXRvIGNvbXBsZXRlIGNvbm5lY3Rpbmcgc2VydmVyLlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbnZhciBEYXRhID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqQGxlbmRzIERhdGEucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKGF1dG9Db21wbGV0ZU9iaiwgb3B0aW9ucykge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCAhPSAyKSB7XG4gICAgICAgICAgICBhbGVydCgnYXJndW1lbnQgbGVuZ3RoIGVycm9yICEnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqID0gYXV0b0NvbXBsZXRlT2JqO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0IGRhdGEgYXQgYXBpIHNlcnZlciB1c2UganNvbnBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5d29yZCBTdHJpbmcgdG8gcmVxdWVzdCBhdCBzZXJ2ZXJcbiAgICAgKi9cbiAgICByZXF1ZXN0OiBmdW5jdGlvbihrZXl3b3JkKSB7XG5cbiAgICAgICAgdmFyIHJzS2V5V3JvZCA9IGtleXdvcmQucmVwbGFjZSgvXFxzL2csICcnKTtcblxuICAgICAgICBpZiAoIWtleXdvcmQgfHwgIXJzS2V5V3JvZCkge1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouaGlkZVJlc3VsdExpc3QoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkYXRhQ2FsbGJhY2sgPSBmdW5jdGlvbigpe30sXG4gICAgICAgICAgICBkZWZhdWx0UGFyYW0gPSB7XG4gICAgICAgICAgICAgICAgcToga2V5d29yZCxcbiAgICAgICAgICAgICAgICByX2VuYzogJ1VURi04JyxcbiAgICAgICAgICAgICAgICBxX2VuYzogJ1VURi04JyxcbiAgICAgICAgICAgICAgICByX2Zvcm1hdDogJ2pzb24nLFxuICAgICAgICAgICAgICAgIF9jYWxsYmFjazogJ2RhdGFDYWxsYmFjaydcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXF1ZXN0UGFyYW0gPSB0dWkudXRpbC5leHRlbmQodGhpcy5vcHRpb25zLnNlYXJjaEFwaSwgZGVmYXVsdFBhcmFtKSxcbiAgICAgICAgICAgIGtleURhdGFzO1xuXG4gICAgICAgICQuYWpheCh0aGlzLm9wdGlvbnMuc2VhcmNoVXJsLCB7XG4gICAgICAgICAgICAnZGF0YVR5cGUnOiAnanNvbnAnLFxuICAgICAgICAgICAgJ2pzb25wQ2FsbGJhY2snOiAnZGF0YUNhbGxiYWNrJyxcbiAgICAgICAgICAgICdkYXRhJzogcmVxdWVzdFBhcmFtLFxuICAgICAgICAgICAgJ3R5cGUnOiAnZ2V0JyxcbiAgICAgICAgICAgICdzdWNjZXNzJzogdHVpLnV0aWwuYmluZChmdW5jdGlvbihkYXRhT2JqKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAga2V5RGF0YXMgPSB0aGlzLl9nZXRDb2xsZWN0aW9uRGF0YShkYXRhT2JqKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouc2V0UXVlcnlzKGRhdGFPYmoucXVlcnkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5zZXRTZXJ2ZXJEYXRhKGtleURhdGFzKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouY2xlYXJSZWFkeVZhbHVlKCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1tEYXRhTWFuYWdlcl0gUmVxdWVzdCBmYWlsZC4nICwgZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcylcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBNYWtlIGNvbGxlY3Rpb24gZGF0YSB0byBkaXNwbGF5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGFPYmogQ29sbGVjdGlvbiBkYXRhXG4gICAgICogQHJldHVybnMge0FycmF5fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENvbGxlY3Rpb25EYXRhOiBmdW5jdGlvbihkYXRhT2JqKSB7XG4gICAgICAgIHZhciBjb2xsZWN0aW9uID0gZGF0YU9iai5jb2xsZWN0aW9ucyxcbiAgICAgICAgICAgIGl0ZW1EYXRhTGlzdCA9IFtdO1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goY29sbGVjdGlvbiwgZnVuY3Rpb24oaXRlbVNldCkge1xuXG4gICAgICAgICAgICBpZih0dWkudXRpbC5pc0VtcHR5KGl0ZW1TZXQuaXRlbXMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gY3JlYXRlIGNvbGxlY3Rpb24gaXRlbXMuXG4gICAgICAgICAgICB2YXIga2V5cyA9IHRoaXMuX2dldFJlZGlyZWN0RGF0YShpdGVtU2V0KTtcblxuICAgICAgICAgICAgaXRlbURhdGFMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6ICd0aXRsZScsXG4gICAgICAgICAgICAgICAgdmFsdWVzOiBbaXRlbVNldC50aXRsZV1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXRlbURhdGFMaXN0ID0gaXRlbURhdGFMaXN0LmNvbmNhdChrZXlzKTtcblxuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gaXRlbURhdGFMaXN0O1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogTWFrZSBpdGVtIG9mIGNvbGxlY3Rpb24gdG8gZGlzcGxheVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtU2V0IEl0ZW0gb2YgY29sbGVjdGlvbiBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9XG4gICAgICovXG4gICAgX2dldFJlZGlyZWN0RGF0YTogZnVuY3Rpb24oaXRlbVNldCkge1xuICAgICAgICB2YXIgdHlwZSA9IGl0ZW1TZXQudHlwZSxcbiAgICAgICAgICAgIGluZGV4ID0gaXRlbVNldC5pbmRleCxcbiAgICAgICAgICAgIGRlc3QgPSBpdGVtU2V0LmRlc3RpbmF0aW9uLFxuICAgICAgICAgICAgaXRlbXMgPSBbXTtcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoaXRlbVNldC5pdGVtcywgZnVuY3Rpb24oaXRlbSwgaWR4KSB7XG5cbiAgICAgICAgICAgIGlmIChpZHggPD0gKHRoaXMub3B0aW9ucy52aWV3Q291bnQgLSAxKSkge1xuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgICAgICAgICAgICAgZGVzdDogZGVzdFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBpdGVtcztcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBEYXRhO1xuIiwiLyoqXG4gKiBAZmlsZU92ZXJ2aWV3IElucHV0IGlzIGtpbmQgb2YgbWFuYWdlciBtb2R1bGUgdG8gc3VwcG9ydCBpbnB1dCBlbGVtZW50IGV2ZW50cyBhbmQgYWxsIG9mIGlucHV0IGZ1bmN0aW9ucy5cbiAqIEB2ZXJzaW9uIDEuMS4wXG4gKiBAYXV0aG9yIE5ITiBFbnRlcnRhaW5tZW50IEZFIGRldiB0ZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuLyoqXG4gKiBVbml0IG9mIGF1dG8gY29tcGxldGUgY29tcG9uZW50IHRoYXQgYmVsb25nIHdpdGggaW5wdXQgZWxlbWVudC5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgSW5wdXQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKipAbGVuZHMgSW5wdXQucHJvdG90eXBlICove1xuXG4gICAgLyoqXG4gICAgICoga2V5Ym9hcmQgSW5wdXQgS2V5Q29kZSBlbnVtXG4gICAgICovXG4gICAga2V5Q29kZU1hcDoge1xuICAgICAgICAnVEFCJyA6IDksXG4gICAgICAgICdVUF9BUlJPVycgOiAzOCxcbiAgICAgICAgJ0RPV05fQVJST1cnIDogNDBcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdXRvQ29tcGxldGVPYmogQXV0b0NvbXBsZXRlIGluc3RhbmNlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgYXV0byBjb21wbGV0ZSBvcHRpb25zXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24oYXV0b0NvbXBsZXRlT2JqLCBvcHRpb25zKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoICE9IDIpIHtcbiAgICAgICAgICAgIGFsZXJ0KCdhcmd1bWVudCBsZW5ndGggZXJyb3IgIScpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqID0gYXV0b0NvbXBsZXRlT2JqO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgICAgIC8vIFNhdmUgZWxlbWVudHMgZnJvbSBjb25maWd1cmF0aW9uLlxuICAgICAgICB0aGlzLiRzZWFyY2hCb3ggPSB0aGlzLm9wdGlvbnMuc2VhcmNoQm94RWxlbWVudDtcbiAgICAgICAgdGhpcy4kdG9nZ2xlQnRuID0gdGhpcy5vcHRpb25zLnRvZ2dsZUJ0bkVsZW1lbnQ7XG4gICAgICAgIHRoaXMuJG9yZ1F1ZXJ5ID0gdGhpcy5vcHRpb25zLm9yZ1F1ZXJ5RWxlbWVudDtcbiAgICAgICAgdGhpcy4kZm9ybUVsZW1lbnQgPSB0aGlzLm9wdGlvbnMuZm9ybUVsZW1lbnQ7XG5cbiAgICAgICAgdGhpcy5pbnB1dFZhbHVlID0gdGhpcy4kc2VhcmNoQm94LnZhbCgpO1xuXG4gICAgICAgIHRoaXMuX2F0dGFjaEV2ZW50KCk7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGlucHV0IGVsZW1lbnQgdmFsdWVcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgZ2V0VmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kc2VhcmNoQm94LnZhbCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQga2V5d29yZCB0byBpbnB1dCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUga2V5d29yZCB0byBzZXQgdmFsdWUuXG4gICAgICovXG4gICAgc2V0VmFsdWU6IGZ1bmN0aW9uKHN0cikge1xuICAgICAgICB0aGlzLmlucHV0VmFsdWUgPSBzdHI7XG4gICAgICAgIHRoaXMuJHNlYXJjaEJveC52YWwoc3RyKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVhZCBjb25maWcgZmlsZXMgcGFyYW1ldGVyIG9wdGlvbiBhbmQgc2V0IHBhcmFtZXRlci5cbiAgICAgKiBAcGFyYW0ge2FycmF5fSBvcHRpb25zIFRoZSBwYXJhbWV0ZXJzIGZyb20gY29uZmlnXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IFRoZSBpbmRleCBmb3Igc2V0dGluZyBrZXkgdmFsdWVcbiAgICAgKi9cbiAgICBzZXRQYXJhbXM6IGZ1bmN0aW9uKG9wdGlvbnMsIGluZGV4KSB7XG5cbiAgICAgICAgdmFyIG9wdCA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICAgIGxpc3RDb25maWcgPSBvcHQubGlzdENvbmZpZ1tpbmRleF0sXG4gICAgICAgICAgICBzdGF0aWNzID0gb3B0LnN0YXRpY1BhcmFtc1tsaXN0Q29uZmlnLnN0YXRpY1BhcmFtc107XG5cbiAgICAgICAgaWYgKG9wdGlvbnMgJiYgdHVpLnV0aWwuaXNTdHJpbmcob3B0aW9ucykpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBvcHRpb25zLnNwbGl0KCcsJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKCFvcHRpb25zIHx8IHR1aS51dGlsLmlzRW1wdHkob3B0aW9ucykpICYmICF0dWkudXRpbC5pc0V4aXN0eShzdGF0aWNzKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fY3JlYXRlUGFyYW1TZXRCeVR5cGUob3B0aW9ucywgaW5kZXgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgaW5wdXRFbGVtZW50IGJ5IHR5cGVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBUaGUgdmFsdWVzIHRvIHNlbmQgc2VhcmNoIGFwaVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBUaGUgaW5kZXggb2YgcXVlcnkga2V5IGFycmF5XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY3JlYXRlUGFyYW1TZXRCeVR5cGU6IGZ1bmN0aW9uKG9wdGlvbnMsIGluZGV4KSB7XG5cbiAgICAgICAgdmFyIGtleSxcbiAgICAgICAgICAgIG9wdCA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICAgIGxpc3RDb25maWcgPSBvcHQubGlzdENvbmZpZ1tpbmRleF0sXG4gICAgICAgICAgICBjb25maWcgPSBvcHQuc3ViUXVlcnlTZXRbbGlzdENvbmZpZy5zdWJRdWVyeVNldF0sXG4gICAgICAgICAgICBzdGF0aWNzID0gb3B0LnN0YXRpY1BhcmFtc1tsaXN0Q29uZmlnLnN0YXRpY1BhcmFtc107XG5cbiAgICAgICAgaWYgKCF0aGlzLmhpZGRlbnMpIHtcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZVBhcmFtQ29udGFpbmVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKG9wdGlvbnMsIGZ1bmN0aW9uKHZhbHVlLCBpZHgpIHtcblxuICAgICAgICAgICAga2V5ID0gY29uZmlnW2lkeF07XG4gICAgICAgICAgICB0aGlzLmhpZGRlbnMuYXBwZW5kKCQoJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cIicgKyBrZXkgKyAnXCIgdmFsdWU9XCInICsgdmFsdWUgKyAnXCIgLz4nKSk7XG5cbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgaWYgKHN0YXRpY3MpIHtcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZVN0YXRpY1BhcmFtcyhzdGF0aWNzKTtcbiAgICAgICAgfVxuXG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgc3RhdGljIHBhcmFtZXRlcnNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGljcyBTdGF0aWMgdmFsdWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY3JlYXRlU3RhdGljUGFyYW1zOiBmdW5jdGlvbihzdGF0aWNzKSB7XG4gICAgICAgIHN0YXRpY3MgPSBzdGF0aWNzLnNwbGl0KCcsJyk7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goc3RhdGljcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHZhbCA9IHZhbHVlLnNwbGl0KFwiPVwiKTtcbiAgICAgICAgICAgIHRoaXMuaGlkZGVucy5hcHBlbmQoJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiJyArIHZhbFswXSArICdcIiB2YWx1ZT1cIicgKyB2YWxbMV0gKyAnXCIgLz4nKSk7XG5cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSB3cmFwcGVyIHRoYXQgYmVjb21lIGNvbnRhaW5lciBvZiBoaWRkZW4gZWxlbWVudHMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY3JlYXRlUGFyYW1Db250YWluZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmhpZGRlbnMgPSAkKCc8ZGl2IGNsYXNzPVwiaGlkZGVuLWlucHV0c1wiPjwvZGl2PicpO1xuICAgICAgICB0aGlzLmhpZGRlbnMuaGlkZSgpO1xuICAgICAgICB0aGlzLmhpZGRlbnMuYXBwZW5kVG8oJCh0aGlzLiRmb3JtRWxlbWVudCkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgdG9nZ2xlIGJ1dHRvbiBpbWFnZS5cbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzVXNlIOyekOuPmeyZhOyEsSDsgqzsmqkg7Jes67aAXG4gICAgICovXG4gICAgc2V0VG9nZ2xlQnRuSW1nOiBmdW5jdGlvbihpc1VzZSkge1xuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy50b2dnbGVJbWcgfHwgISh0aGlzLiR0b2dnbGVCdG4pKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNVc2UpIHtcbiAgICAgICAgICAgIHRoaXMuJHRvZ2dsZUJ0bi5hdHRyKCdzcmMnLCB0aGlzLm9wdGlvbnMudG9nZ2xlSW1nLm9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJHRvZ2dsZUJ0bi5hdHRyKCdzcmMnLCB0aGlzLm9wdGlvbnMudG9nZ2xlSW1nLm9mZik7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKiogUHJpdmF0ZSBGdW5jdGlvbnMgKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gICAgLyoqXG4gICAgICogRXZlbnQgYmluZGluZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy/qsoDsg4nssL3sl5AgZm9jdXMsIGtleXVwLCBrZXlkb3duLCBjbGljayDsnbTrsqTtirgg67CU7J2465SpLlxuICAgICAgICB0aGlzLiRzZWFyY2hCb3guYmluZCgnZm9jdXMga2V5dXAga2V5ZG93biBibHVyIGNsaWNrJywgJC5wcm94eShmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGUudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2ZvY3VzJyA6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uRm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnYmx1cicgOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbkJsdXIoZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2tleXVwJyA6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uS2V5VXAoZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2tleWRvd24nIDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25LZXlEb3duKGUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdjbGljaycgOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbkNsaWNrKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQgOlxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcykpO1xuXG4gICAgICAgIGlmICh0aGlzLiR0b2dnbGVCdG4pIHtcbiAgICAgICAgICAgIHRoaXMuJHRvZ2dsZUJ0bi5iaW5kKCdjbGljaycsICQucHJveHkoZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX29uQ2xpY2tUb2dnbGUoKTtcbiAgICAgICAgICAgIH0sIHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTYXZlIHVzZXIgcXVlcnkgaW50byBoaWRkZW4gZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgdHlwZWQgYnkgdXNlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldE9yZ1F1ZXJ5OiBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgdGhpcy4kb3JnUXVlcnkudmFsKHN0cik7XG4gICAgfSxcblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqIEV2ZW50IEhhbmRsZXJzICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAgIC8qKlxuICAgICAqIElucHV0IGVsZW1lbnQgb25jbGljayBldmVudCBoYW5kbGVyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25DbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8v7J6F66Cl65CcIO2CpOybjOuTnOqwgCDsl4bqsbDrgpgg7J6Q64+Z7JmE7ISxIOq4sOuKpSDsgqzsmqntlZjsp4Ag7JWK7Jy866m0IO2OvOy5oCDtlYTsmpQg7JeG7Jy866+A66GcIOq3uOuDpSDrpqzthLTtlZjqs6Ag64GdLlxuICAgICAgICBpZiAoIXRoaXMuYXV0b0NvbXBsZXRlT2JqLmdldFZhbHVlKCkgfHxcbiAgICAgICAgICAgICF0aGlzLmF1dG9Db21wbGV0ZU9iai5pc1VzZUF1dG9Db21wbGV0ZSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5hdXRvQ29tcGxldGVPYmouaXNTaG93UmVzdWx0TGlzdCgpKSB7XG4gICAgICAgICAgICAvL+qysOqzvCDrpqzsiqTtirgg7JiB7Jet7J20IHNob3cg7IOB7YOc7J2066m0KGlzUmVzdWx0U2hvd2luZz09dHJ1ZSkg6rKw6rO8IOumrOyKpO2KuCBoaWRlIOyalOyyrVxuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouaGlkZVJlc3VsdExpc3QoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8v6rKw6rO8IOumrOyKpO2KuCDsmIHsl63snbQgaGlkZSDsg4Htg5zsnbTrqbQoaXNSZXN1bHRTaG93aW5nPT1mYWxzZSkg6rKw6rO8IOumrOyKpO2KuCBzaG93IOyalOyyrVxuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouc2hvd1Jlc3VsdExpc3QoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnB1dCBlbGVtZW50IGZvY3VzIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkZvY3VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy9zZXRJbnRlcnZhbCDshKTsoJXtlbTshJwg7J287KCVIOyLnOqwhCDso7zquLDroZwgX29uV2F0Y2gg7ZWo7IiY66W8IOyLpO2Wie2VnOuLpC5cbiAgICAgICAgdGhpcy5pbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoJC5wcm94eShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuX29uV2F0Y2goKTtcbiAgICAgICAgfSwgdGhpcyksIHRoaXMub3B0aW9ucy53YXRjaEludGVydmFsKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUm9vcCBmb3IgY2hlY2sgdXBkYXRlIGlucHV0IGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbldhdGNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuJHNlYXJjaEJveC52YWwoKSA9PT0gJycpIHtcbiAgICAgICAgICAgIHRoaXMuX3NldE9yZ1F1ZXJ5KCcnKTtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnNldE1vdmVkKGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmlucHV0VmFsdWUgIT09IHRoaXMuJHNlYXJjaEJveC52YWwoKSkge1xuICAgICAgICAgICAgdGhpcy5pbnB1dFZhbHVlID0gdGhpcy4kc2VhcmNoQm94LnZhbCgpO1xuICAgICAgICAgICAgdGhpcy5fb25DaGFuZ2UoKTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5hdXRvQ29tcGxldGVPYmouZ2V0TW92ZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5fc2V0T3JnUXVlcnkodGhpcy4kc2VhcmNoQm94LnZhbCgpKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnB1dCBlbGVtZW50IGtleXVwIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbktleVVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5wdXRWYWx1ZSAhPT0gdGhpcy4kc2VhcmNoQm94LnZhbCgpKSB7XG4gICAgICAgICAgICB0aGlzLmlucHV0VmFsdWUgPSB0aGlzLiRzZWFyY2hCb3gudmFsKCk7XG4gICAgICAgICAgICB0aGlzLl9vbkNoYW5nZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIElucHV0IGVsZW1lbnQgb25jaGFuZ2UgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmF1dG9Db21wbGV0ZU9iai5pc1VzZUF1dG9Db21wbGV0ZSgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5hdXRvQ29tcGxldGVPYmouaXNJZGxlKSB7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5pc0lkbGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnJlcXVlc3QodGhpcy4kc2VhcmNoQm94LnZhbCgpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnJlYWR5VmFsdWUgPSB0aGlzLiRzZWFyY2hCb3gudmFsKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5wdXQgZWxlbWVudCBibHVyIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkJsdXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5pbnRlcnZhbElkKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWxJZCk7XG4gICAgICAgICAgICB0aGlzLmludGVydmFsSWQgPSBudWxsO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIElucHV0IGVsZW1lbnQga2V5ZG93biBldmVudCBoYW5kbGVyXG4gICAgICogU2V0IGFjdGlubyBieSBpbnB1dCB2YWx1ZVxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGUga2V5RG93biBFdmVudCBpbnN0YW5jZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uS2V5RG93bjogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgYXV0b0NvbXBsZXRlT2JqID0gdGhpcy5hdXRvQ29tcGxldGVPYmo7XG5cbiAgICAgICAgaWYgKCFhdXRvQ29tcGxldGVPYmouaXNVc2VBdXRvQ29tcGxldGUoKSB8fFxuICAgICAgICAgICAgIWF1dG9Db21wbGV0ZU9iai5pc1Nob3dSZXN1bHRMaXN0KCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjb2RlID0gZS5rZXlDb2RlLFxuICAgICAgICAgICAgZmxvdyA9IG51bGwsXG4gICAgICAgICAgICBjb2RlTWFwID0gdGhpcy5rZXlDb2RlTWFwLFxuICAgICAgICAgICAgZmxvd01hcCA9IGF1dG9Db21wbGV0ZU9iai5mbG93TWFwO1xuXG4gICAgICAgIGlmIChjb2RlID09PSBjb2RlTWFwLlRBQikge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZmxvdyA9IGUuc2hpZnRLZXkgPyBmbG93TWFwLk5FWFQgOiBmbG93TWFwLlBSRVY7XG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gY29kZU1hcC5ET1dOX0FSUk9XKSB7XG4gICAgICAgICAgICBmbG93ID0gZmxvd01hcC5ORVhUO1xuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IGNvZGVNYXAuVVBfQVJST1cpIHtcbiAgICAgICAgICAgIGZsb3cgPSBmbG93TWFwLlBSRVY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBhdXRvQ29tcGxldGVPYmoubW92ZU5leHRMaXN0KGZsb3cpO1xuXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBidXR0b24gY2xpY2sgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ2xpY2tUb2dnbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuYXV0b0NvbXBsZXRlT2JqLmlzVXNlQXV0b0NvbXBsZXRlKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0VG9nZ2xlQnRuSW1nKHRydWUpO1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouc2V0Q29va2llVmFsdWUodHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5jaGFuZ2VPbk9mZlRleHQoZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouaGlkZVJlc3VsdExpc3QoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0VG9nZ2xlQnRuSW1nKGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnNldENvb2tpZVZhbHVlKGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLmNoYW5nZU9uT2ZmVGV4dCh0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IElucHV0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJlc3VsdCBpcyBraW5kIG9mIG1hbmFnaW5nIG1vZHVsZSB0byBkcmF3IGF1dG8gY29tcGxldGUgcmVzdWx0IGxpc3QgZnJvbSBzZXJ2ZXIgYW5kIGFwcGx5IHRlbXBsYXRlLlxuICogQHZlcnNpb24gMS4xLjBcbiAqIEBhdXRob3IgIE5ITiBlbnRlcnRhaW5tZW50IEZFIGRldiB0ZWFtPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4vKipcbiAqIFVuaXQgb2YgYXV0byBjb21wbGV0ZSB0aGF0IGJlbG9uZyB3aXRoIHNlYXJjaCByZXN1bHQgbGlzdC5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgUmVzdWx0ID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBSZXN1bHQucHJvdG90eXBlICove1xuICAgIC8qKlxuICAgICAqIEluaXRhaWxpemVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihhdXRvQ29tcGxldGVPYmosIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmogPSBhdXRvQ29tcGxldGVPYmo7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICAgICAgdGhpcy4kcmVzdWx0TGlzdCA9IHRoaXMub3B0aW9ucy5yZXN1bHRMaXN0RWxlbWVudDtcbiAgICAgICAgdGhpcy5yZXN1bHRTZWxlY3RvciA9IHRoaXMub3B0aW9ucy5yZXN1bHRMaXN0RWxlbWVudDtcbiAgICAgICAgdGhpcy52aWV3Q291bnQgPSB0aGlzLm9wdGlvbnMudmlld0NvdW50IHx8IDEwO1xuICAgICAgICB0aGlzLiRvbk9mZlR4dCA9IHRoaXMub3B0aW9ucy5vbm9mZlRleHRFbGVtZW50O1xuICAgICAgICB0aGlzLm1vdXNlT3ZlckNsYXNzID0gdGhpcy5vcHRpb25zLm1vdXNlT3ZlckNsYXNzO1xuICAgICAgICB0aGlzLmZsb3dNYXAgPSB0aGlzLmF1dG9Db21wbGV0ZU9iai5mbG93TWFwO1xuXG4gICAgICAgIHRoaXMuX2F0dGFjaEV2ZW50KCk7XG5cbiAgICAgICAgdGhpcy5zZWxlY3RlZEVsZW1lbnQgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuaXNNb3ZlZCA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEZWxldGUgbGFzdCByZXN1bHQgbGlzdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2RlbGV0ZUJlZm9yZUVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLiRyZXN1bHRMaXN0Lmh0bWwoJycpO1xuICAgICAgICB0aGlzLiRyZXN1bHRMaXN0LmhpZGUoKTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZEVsZW1lbnQgPSBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEcmF3IHJlc3VsdCBmb3JtIGFwaSBzZXJ2ZXJcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBkYXRhQXJyIFJlc3VsdCBkYXRhXG4gICAgICovXG4gICAgZHJhdzogZnVuY3Rpb24oZGF0YUFycikge1xuXG4gICAgICAgIHRoaXMuX2RlbGV0ZUJlZm9yZUVsZW1lbnQoKTtcblxuICAgICAgICB2YXIgbGVuID0gZGF0YUFyci5sZW5ndGg7XG5cbiAgICAgICAgaWYgKGxlbiA8IDEpIHtcbiAgICAgICAgICAgIHRoaXMuX2hpZGVCb3R0b21BcmVhKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9tYWtlUmVzdWx0TGlzdChkYXRhQXJyLCBsZW4pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy4kcmVzdWx0TGlzdC5zaG93KCk7XG4gICAgICAgIC8vIHNob3cgYXV0byBjb21wbGV0ZSBzd2l0Y2hcbiAgICAgICAgdGhpcy5fc2hvd0JvdHRvbUFyZWEoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWFrZSBzZWFyY2ggcmVzdWx0IGxpc3QgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VSZXN1bHRMaXN0OiBmdW5jdGlvbihkYXRhQXJyLCBsZW4pIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gdGhpcy5vcHRpb25zLnRlbXBsYXRlLFxuICAgICAgICAgICAgY29uZmlnID0gdGhpcy5vcHRpb25zLmxpc3RDb25maWcsXG4gICAgICAgICAgICB0bXBsLFxuICAgICAgICAgICAgdXNlVGl0bGUgPSAodGhpcy5vcHRpb25zLnVzZVRpdGxlICYmICEhdGVtcGxhdGUudGl0bGUpLFxuICAgICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgdG1wbFZhbHVlLFxuICAgICAgICAgICAgJGVsLFxuICAgICAgICAgICAgaTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIHR5cGUgPSBkYXRhQXJyW2ldLnR5cGU7XG4gICAgICAgICAgICBpbmRleCA9IGRhdGFBcnJbaV0uaW5kZXg7XG4gICAgICAgICAgICB0bXBsID0gY29uZmlnW2luZGV4XSA/IHRlbXBsYXRlW2NvbmZpZ1tpbmRleF0udGVtcGxhdGVdIDogdGVtcGxhdGUuZGVmYXVsdHM7XG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ3RpdGxlJykge1xuICAgICAgICAgICAgICAgIHRtcGwgPSB0ZW1wbGF0ZS50aXRsZTtcbiAgICAgICAgICAgICAgICBpZiAoIXVzZVRpdGxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRtcGxWYWx1ZSA9IHRoaXMuX2dldFRtcGxEYXRhKHRtcGwuYXR0ciwgZGF0YUFycltpXSk7XG4gICAgICAgICAgICAkZWwgPSAkKHRoaXMuX2FwcGx5VGVtcGxhdGUodG1wbC5lbGVtZW50LCB0bXBsVmFsdWUpKTtcbiAgICAgICAgICAgICRlbC5hdHRyKCdkYXRhLXBhcmFtcycsIHRtcGxWYWx1ZS5wYXJhbXMpO1xuICAgICAgICAgICAgJGVsLmF0dHIoJ2RhdGEtaW5kZXgnLCBpbmRleCk7XG4gICAgICAgICAgICB0aGlzLiRyZXN1bHRMaXN0LmFwcGVuZCgkZWwpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1ha2UgdGVtcGxhdGUgZGF0YVxuICAgICAqIEBwYXJhbSB7YXJyYXl9IGF0dHJzIFRlbXBsYXRlIGF0dHJpYnV0ZXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xPYmplY3R9IGRhdGEgVGhlIGRhdGEgdG8gbWFrZSB0ZW1wbGF0ZVxuICAgICAqIEByZXR1cm4ge29iamVjdH1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRUbXBsRGF0YTogZnVuY3Rpb24oYXR0cnMsIGRhdGEpIHtcbiAgICAgICAgdmFyIHRtcGxWYWx1ZSA9IHt9LFxuICAgICAgICAgICAgdmFsdWVzID0gZGF0YS52YWx1ZXMgfHwgbnVsbDtcblxuICAgICAgICBpZiAodHVpLnV0aWwuaXNTdHJpbmcoZGF0YSkpIHtcbiAgICAgICAgICAgIHRtcGxWYWx1ZVthdHRyc1swXV0gPSBkYXRhO1xuICAgICAgICAgICAgcmV0dXJuIHRtcGxWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKGF0dHJzLCBmdW5jdGlvbihhdHRyLCBpZHgpIHtcblxuICAgICAgICAgICAgdG1wbFZhbHVlW2F0dHJdID0gdmFsdWVzW2lkeF07XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYoYXR0cnMubGVuZ3RoIDwgdmFsdWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgdG1wbFZhbHVlLnBhcmFtcyA9IHZhbHVlcy5zbGljZShhdHRycy5sZW5ndGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRtcGxWYWx1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHdoZXRoZXIgcmVzdWx0IGxpc3Qgc2hvdyBvciBub3RcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzU2hvd1Jlc3VsdExpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuJHJlc3VsdExpc3QuY3NzKCdkaXNwbGF5JykgPT09ICdibG9jaycpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIHJlc3VsdCBsaXN0IGFyZWFcbiAgICAgKi9cbiAgICBoaWRlUmVzdWx0TGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJHJlc3VsdExpc3QuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICAgICAgdGhpcy5faGlkZUJvdHRvbUFyZWEoKTtcbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouaXNJZGxlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouZmlyZSgnY2xvc2UnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyByZXN1bHQgbGlzdCBhcmVhXG4gICAgICovXG4gICAgc2hvd1Jlc3VsdExpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLiRyZXN1bHRMaXN0LmNzcygnZGlzcGxheScsICdibG9jaycpO1xuICAgICAgICB9LCAwKTtcblxuICAgICAgICB0aGlzLl9zaG93Qm90dG9tQXJlYSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlIGZvY3VzIHRvIG5leHQgaXRlbSwgY2hhbmdlIGlucHV0IGVsZW1lbnQgdmFsdWUgYXMgZm9jdXMgdmFsdWUuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZsb3cgRGlyZWN0aW9uIGJ5IGtleSBjb2RlXG4gICAgICovXG4gICAgbW92ZU5leHRMaXN0OiBmdW5jdGlvbihmbG93KSB7XG4gICAgICAgIHZhciBmbG93TWFwID0gdGhpcy5mbG93TWFwLFxuICAgICAgICAgICAgc2VsZWN0RWwgPSB0aGlzLnNlbGVjdGVkRWxlbWVudCxcbiAgICAgICAgICAgIGdldE5leHQgPSAoZmxvdyA9PT0gZmxvd01hcC5ORVhUKSA/IHRoaXMuX2dldE5leHQgOiB0aGlzLl9nZXRQcmV2LFxuICAgICAgICAgICAgZ2V0Qm91bmQgPSAoZmxvdyA9PT0gZmxvd01hcC5ORVhUKSA/IHRoaXMuX2dldEZpcnN0IDogdGhpcy5fZ2V0TGFzdCxcbiAgICAgICAgICAgIGtleXdvcmQ7XG4gICAgICAgIHRoaXMuaXNNb3ZlZCA9IHRydWU7XG5cbiAgICAgICAgaWYgKHNlbGVjdEVsKSB7XG4gICAgICAgICAgICBzZWxlY3RFbC5yZW1vdmVDbGFzcyh0aGlzLm1vdXNlT3ZlckNsYXNzKTtcbiAgICAgICAgICAgIHNlbGVjdEVsID0gdGhpcy5zZWxlY3RlZEVsZW1lbnQgPSBnZXROZXh0LmNhbGwodGhpcywgc2VsZWN0RWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZWN0RWwgPSB0aGlzLnNlbGVjdGVkRWxlbWVudCA9IGdldEJvdW5kLmNhbGwodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBrZXl3b3JkID0gc2VsZWN0RWwuZmluZCgnLmtleXdvcmQtZmllbGQnKS50ZXh0KCk7XG5cbiAgICAgICAgaWYgKHNlbGVjdEVsICYmIGtleXdvcmQpIHtcbiAgICAgICAgICAgIHNlbGVjdEVsLmFkZENsYXNzKHRoaXMubW91c2VPdmVyQ2xhc3MpO1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouc2V0VmFsdWUoa2V5d29yZCk7XG4gICAgICAgICAgICB0aGlzLl9zZXRTdWJtaXRPcHRpb24oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmKHNlbGVjdEVsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlTmV4dExpc3QoZmxvdyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hhZ2UgdGV4dCBieSB3aGV0aGVyIGF1dG8gY29tcGxldGUgdXNlIG9yIG5vdFxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNVc2Ugb24vb2ZmIOyXrOu2gFxuICAgICAqL1xuICAgIGNoYW5nZU9uT2ZmVGV4dDogZnVuY3Rpb24oaXNVc2UpIHtcbiAgICAgICAgaWYgKGlzVXNlKSB7XG4gICAgICAgICAgICB0aGlzLiRvbk9mZlR4dC50ZXh0KCfsnpDrj5nsmYTshLEg7Lyc6riwJyk7XG4gICAgICAgICAgICB0aGlzLmhpZGVSZXN1bHRMaXN0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiRvbk9mZlR4dC50ZXh0KCfsnpDrj5nsmYTshLEg64GE6riwJyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggYXV0byBjb21wbGV0ZSBldmVudCBiZWxvbmdzIHdpdGggcmVzdWx0IGxpc3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hdHRhY2hFdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJHJlc3VsdExpc3QuYmluZCgnbW91c2VvdmVyIGNsaWNrJywgJC5wcm94eShmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBpZiAoZS50eXBlID09PSAnbW91c2VvdmVyJykge1xuICAgICAgICAgICAgICAgIHRoaXMuX29uTW91c2VPdmVyKGUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlLnR5cGUgPT09ICdjbGljaycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vbkNsaWNrKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKSk7XG5cbiAgICAgICAgaWYgKHRoaXMuJG9uT2ZmVHh0KSB7XG4gICAgICAgICAgICB0aGlzLiRvbk9mZlR4dC5iaW5kKCdjbGljaycsICQucHJveHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdXNlQXV0b0NvbXBsZXRlKCk7XG4gICAgICAgICAgICB9LCB0aGlzKSk7XG4gICAgICAgIH1cblxuICAgICAgICAkKGRvY3VtZW50KS5iaW5kKCdjbGljaycsICQucHJveHkoZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgaWYgKGUudGFyZ2V0LnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPT0gJ2h0bWwnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5oaWRlUmVzdWx0TGlzdCgpO1xuICAgICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogSGlnaGxpZ2h0IGtleSB3b3JkXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRtcGxTdHIgVGVtcGxhdGUgc3RyaW5nXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGFPYmogUmVwbGFjZSBzdHJpbmcgbWFwXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FwcGx5VGVtcGxhdGU6IGZ1bmN0aW9uKHRtcGxTdHIsIGRhdGFPYmopIHtcbiAgICAgICAgdmFyIHRlbXAgPSB7fSxcbiAgICAgICAgICAgIGtleVN0cjtcblxuICAgICAgICBmb3IgKGtleVN0ciBpbiBkYXRhT2JqKSB7XG4gICAgICAgICAgICB0ZW1wW2tleVN0cl0gPSBkYXRhT2JqW2tleVN0cl07XG4gICAgICAgICAgICBpZiAoa2V5U3RyID09PSAnc3ViamVjdCcpIHtcbiAgICAgICAgICAgICAgICB0ZW1wLnN1YmplY3QgPSB0aGlzLl9oaWdobGlnaHQoZGF0YU9iai5zdWJqZWN0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFkYXRhT2JqLnByb3BlcnR5SXNFbnVtZXJhYmxlKGtleVN0cikpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdG1wbFN0ciA9IHRtcGxTdHIucmVwbGFjZShuZXcgUmVnRXhwKFwiQFwiICsga2V5U3RyICsgXCJAXCIsIFwiZ1wiKSwgdGVtcFtrZXlTdHJdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdG1wbFN0cjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGFwcGxpZWQgaGlnaGxpZ2h0IGVmZmVjdCBrZXkgd29yZFxuICAgICAqICh0ZXh0OiBOaWtlIGFpciAgLyAgcXVlcnkgOiBbTmlrZV0gLyBSZXN1bHQgOiA8c3Ryb25nPk5pa2UgPC9zdHJvbmc+YWlyXG4gICAgICogdGV4dCA6ICdyaGRpZGRs7JmAIOqzoOyWkeydtCcgLyBxdWVyeSA6ICBbcmhkaWRkbCwg6rOg7JaR7J20XSAvIOumrO2EtOqysOqzvCA8c3Ryb25nPnJoZGlkZGw8L3N0cm9uZz7smYAgPHN0cm9uZz7qs6DslpHsnbQ8L3N0cm9uZz5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdGV4dCBJbnB1dCBzdHJpbmdcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaGlnaGxpZ2h0OiBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgIHZhciBxdWVyeXMgPSB0aGlzLmF1dG9Db21wbGV0ZU9iai5xdWVyeXMsXG4gICAgICAgICAgICByZXR1cm5TdHI7XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChxdWVyeXMsIGZ1bmN0aW9uKHF1ZXJ5KSB7XG5cbiAgICAgICAgICAgIGlmICghcmV0dXJuU3RyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuU3RyID0gdGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVyblN0ciA9IHRoaXMuX21ha2VTdHJvbmcocmV0dXJuU3RyLCBxdWVyeSk7XG5cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIHJldHVybiAocmV0dXJuU3RyIHx8IHRleHQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb250YWluIHRleHQgYnkgc3Ryb25nIHRhZ1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0IFJlY29tbWVuZCBzZWFyY2ggZGF0YSAg7LaU7LKc6rKA7IOJ7Ja0IOuNsOydtO2EsFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBxdWVyeSBJbnB1dCBrZXl3b3JkXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTdHJvbmc6IGZ1bmN0aW9uKHRleHQsIHF1ZXJ5KSB7XG4gICAgICAgIGlmICghcXVlcnkgfHwgcXVlcnkubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGVzY1JlZ0V4cCA9IG5ldyBSZWdFeHAoXCJbLiorP3woKVxcXFxbXFxcXF17fVxcXFxcXFxcXVwiLCBcImdcIiksXG4gICAgICAgICAgICB0bXBTdHIgPSBxdWVyeS5yZXBsYWNlKC8oKS9nLCBcIiBcIikucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgXCJcIiksXG4gICAgICAgICAgICB0bXBDaGFyYWN0ZXJzID0gdG1wU3RyLm1hdGNoKC9cXFMvZyksXG4gICAgICAgICAgICB0bXBDaGFyTGVuID0gdG1wQ2hhcmFjdGVycy5sZW5ndGgsXG4gICAgICAgICAgICB0bXBBcnIgPSBbXSxcbiAgICAgICAgICAgIHJldHVyblN0ciA9ICcnLFxuICAgICAgICAgICAgcmVnUXVlcnksXG4gICAgICAgICAgICBjbnQsXG4gICAgICAgICAgICBpO1xuXG4gICAgICAgIGZvciAoaSA9IDAsIGNudCA9IHRtcENoYXJMZW47IGkgPCBjbnQ7IGkrKykge1xuICAgICAgICAgICAgdG1wQXJyLnB1c2godG1wQ2hhcmFjdGVyc1tpXS5yZXBsYWNlKC9bXFxTXSsvZywgXCJbXCIgKyB0bXBDaGFyYWN0ZXJzW2ldLnRvTG93ZXJDYXNlKCkucmVwbGFjZShlc2NSZWdFeHAsIFwiXFxcXCQmXCIpICsgXCJ8XCIgKyB0bXBDaGFyYWN0ZXJzW2ldLnRvVXBwZXJDYXNlKCkucmVwbGFjZShlc2NSZWdFeHAsIFwiXFxcXCQmXCIpICsgXCJdIFwiKS5yZXBsYWNlKC9bXFxzXSsvZywgXCJbXFxcXHNdKlwiKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0bXBTdHIgPSBcIihcIiArIHRtcEFyci5qb2luKFwiXCIpICsgXCIpXCI7XG4gICAgICAgIHJlZ1F1ZXJ5ID0gbmV3IFJlZ0V4cCh0bXBTdHIpO1xuXG4gICAgICAgIGlmIChyZWdRdWVyeS50ZXN0KHRleHQpKSB7XG4gICAgICAgICAgICByZXR1cm5TdHIgPSB0ZXh0LnJlcGxhY2UocmVnUXVlcnksICc8c3Ryb25nPicgKyBSZWdFeHAuJDEgKyAnPC9zdHJvbmc+Jyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmV0dXJuU3RyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIGZpcnN0IHJlc3VsdCBpdGVtXG4gICAgICogQHJldHVybiB7RWxlbWVudH1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRGaXJzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcmRlclN0YWdlKHRoaXMuZmxvd01hcC5GSVJTVCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgbGFzdCByZXN1bHQgaXRlbVxuICAgICAqIEByZXR1cm4ge0VsZW1lbnR9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0TGFzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcmRlclN0YWdlKHRoaXMuZmxvd01hcC5MQVNUKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHdoZXRoZXIgZmlyc3Qgb3IgbGFzdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIEZpcnN0L2VuZCBlbGVtZW50IHR5cGVcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vcmRlclN0YWdlOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHR5cGUgPSAodHlwZSA9PT0gdGhpcy5mbG93TWFwLkZJUlNUKSA/ICdmaXJzdCcgOiAnbGFzdCc7XG5cbiAgICAgICAgaWYgKHRoaXMuJHJlc3VsdExpc3QgJiZcbiAgICAgICAgICAgIHRoaXMuJHJlc3VsdExpc3QuY2hpbGRyZW4oKSAmJlxuICAgICAgICAgICAgdGhpcy4kcmVzdWx0TGlzdC5jaGlsZHJlbigpLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJHJlc3VsdExpc3QuY2hpbGRyZW4oKVt0eXBlXSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gbmV4dCBlbGVtZW50IGZyb20gc2VsZWN0ZWQgZWxlbWVudFxuICAgICAqIElmIG5leHQgZWxlbWVudCBpcyBub3QgZXhpc3QsIHJldHVybiBmaXJzdCBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudCBmb2N1c2VkIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtFbGVtZW50fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldE5leHQ6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29yZGVyRWxlbWVudCh0aGlzLmZsb3dNYXAuTkVYVCwgZWxlbWVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBwcmV2aW91cyBlbGVtZW50IGZyb20gc2VsZWN0ZWQgZWxlbWVudFxuICAgICAqIElmIHByZXZpb3VzIGVsZW1lbnQgaXMgbm90IGV4aXN0LCByZXR1cm4gdGhlIGxhc3QgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnQgZm9jdXNlZCBlbGVtZW50XG4gICAgICogQHJldHVybiB7RWxlbWVudH1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRQcmV2OiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcmRlckVsZW1lbnQodGhpcy5mbG93TWFwLlBSRVYsIGVsZW1lbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gcHJldmlvdXMgb3IgbmV4dCBlbGVtZW50IGJ5IGRpcmVjdGlvbi5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBUaGUgZGlyZWN0aW9uIHR5cGUgZm9yIGZpbmRpbmcgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudCBmb2N1c2VkIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vcmRlckVsZW1lbnQ6IGZ1bmN0aW9uKHR5cGUsIGVsZW1lbnQpIHtcbiAgICAgICAgaWYgKCF0dWkudXRpbC5pc0V4aXN0eShlbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgJGN1cnJlbnQgPSAkKGVsZW1lbnQpLFxuICAgICAgICAgICAgaXNOZXh0ID0gKHR5cGUgPT09IHRoaXMuZmxvd01hcC5ORVhUKSxcbiAgICAgICAgICAgIG9yZGVyO1xuXG4gICAgICAgIGlmICgkY3VycmVudC5jbG9zZXN0KHRoaXMucmVzdWx0U2VsZWN0b3IpKSB7XG4gICAgICAgICAgICBvcmRlciA9IGlzTmV4dCA/IGVsZW1lbnQubmV4dCgpIDogZWxlbWVudC5wcmV2KCk7XG4gICAgICAgICAgICBpZiAob3JkZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yZGVyO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNOZXh0ID8gdGhpcy5fZ2V0Rmlyc3QoKSA6IHRoaXMuX2dldExhc3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgd2hldGhlciBhdXRvIGNvbXBsZXRlIHVzZSBvciBub3QgYW5kIGNoYW5nZSBzd2l0Y2gncyBzdGF0ZS5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF91c2VBdXRvQ29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaXNVc2UgPSB0aGlzLmF1dG9Db21wbGV0ZU9iai5pc1VzZUF1dG9Db21wbGV0ZSgpO1xuICAgICAgICB0aGlzLmNoYW5nZU9uT2ZmVGV4dChpc1VzZSk7XG4gICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnNldENvb2tpZVZhbHVlKCFpc1VzZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgYXV0byBjb21wbGV0ZSBzd2l0Y2ggYXJlYVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3Nob3dCb3R0b21BcmVhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuJG9uT2ZmVHh0KSB7XG4gICAgICAgICAgICB0aGlzLiRvbk9mZlR4dC5zaG93KCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSBhdXRvIGNvbXBsZXRlIHN3aXRjaCBhcmVhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaGlkZUJvdHRvbUFyZWE6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy4kb25PZmZUeHQpIHtcbiAgICAgICAgICAgIHRoaXMuJG9uT2ZmVHh0LmhpZGUoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgYWN0aW9uIGF0dHJpYnV0ZSBvZiBmb3JtIGVsZW1lbnQgYW5kIHNldCBhZGRpdGlvbiB2YWx1ZXMgaW4gaGlkZGVuIHR5cGUgZWxlbWVudHMuXG4gICAgICogQHBhcmFtIHtlbGVtZW50fSBbJHRhcmdldF0gU3VibWl0IG9wdGlvbnMgdGFyZ2V0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0U3VibWl0T3B0aW9uOiBmdW5jdGlvbigkdGFyZ2V0KSB7XG4gICAgICAgIHRoaXMuX2NsZWFyU3VibWl0T3B0aW9uKCk7XG5cbiAgICAgICAgdmFyIGZvcm1FbGVtZW50ID0gdGhpcy5vcHRpb25zLmZvcm1FbGVtZW50LFxuICAgICAgICAgICAgJHNlbGVjdEZpZWxkID0gJHRhcmdldCA/ICQoJHRhcmdldCkuY2xvc2VzdCgnbGknKSA6ICQodGhpcy5zZWxlY3RlZEVsZW1lbnQpLFxuICAgICAgICAgICAgYWN0aW9ucyA9IHRoaXMub3B0aW9ucy5hY3Rpb25zLFxuICAgICAgICAgICAgaW5kZXggPSAkc2VsZWN0RmllbGQuYXR0cignZGF0YS1pbmRleCcpLFxuICAgICAgICAgICAgY29uZmlnID0gdGhpcy5vcHRpb25zLmxpc3RDb25maWdbaW5kZXhdLFxuICAgICAgICAgICAgYWN0aW9uID0gYWN0aW9uc1tjb25maWcuYWN0aW9uXSxcbiAgICAgICAgICAgIHBhcmFtc1N0cmluZztcblxuICAgICAgICAkKGZvcm1FbGVtZW50KS5hdHRyKCdhY3Rpb24nLCBhY3Rpb24pO1xuICAgICAgICBwYXJhbXNTdHJpbmcgPSAkc2VsZWN0RmllbGQuYXR0cignZGF0YS1wYXJhbXMnKTtcblxuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5zZXRQYXJhbXMocGFyYW1zU3RyaW5nLCBpbmRleCk7XG5cbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouZmlyZSgnY2hhbmdlJywge1xuICAgICAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICAgICAgYWN0aW9uOiBhY3Rpb24sXG4gICAgICAgICAgICBwYXJhbXM6IHBhcmFtc1N0cmluZ1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVzZXQgZm9ybSBlbGVtZW50LlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NsZWFyU3VibWl0T3B0aW9uOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBmb3JtRWxlbWVudCA9IHRoaXMub3B0aW9ucy5mb3JtRWxlbWVudCxcbiAgICAgICAgICAgIGhpZGRlbldyYXAgPSAkKGZvcm1FbGVtZW50KS5maW5kKCcuaGlkZGVuLWlucHV0cycpO1xuXG4gICAgICAgIGhpZGRlbldyYXAuaHRtbCgnJyk7XG4gICAgfSxcblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqIEV2ZW50IEhhbmRsZXJzICoqKioqKioqKioqKioqKioqKioqKi9cbiAgICAvKipcbiAgICAgKiBSZXN1bHQgbGlzdCBtb3VzZW92ZXIgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGUgRXZlbnQgaW5zdGFuc2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbk1vdXNlT3ZlcjogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgJHRhcmdldCA9ICQoZS50YXJnZXQpLFxuICAgICAgICAgICAgJGFyciA9IHRoaXMuJHJlc3VsdExpc3QuZmluZCgnbGknKSxcbiAgICAgICAgICAgIHNlbGVjdGVkSXRlbSA9ICR0YXJnZXQuY2xvc2VzdCgnbGknKTtcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkoJGFyciwgZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAkKHZhbCkucmVtb3ZlQ2xhc3ModGhpcy5tb3VzZU92ZXJDbGFzcyk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIGlmIChzZWxlY3RlZEl0ZW0gJiYgc2VsZWN0ZWRJdGVtLmZpbmQoJy5rZXl3b3JkLWZpZWxkJykubGVuZ3RoKSB7XG4gICAgICAgICAgICBzZWxlY3RlZEl0ZW0uYWRkQ2xhc3ModGhpcy5tb3VzZU92ZXJDbGFzcyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNlbGVjdGVkRWxlbWVudCA9ICR0YXJnZXQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlc3VsdCBsaXN0IGNsaWNrIGV2bmV0IGhhbmRsZXJcbiAgICAgKiBTdWJtaXQgZm9ybSBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGUgRXZlbnQgaW5zdGFuc2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkNsaWNrOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciAkdGFyZ2V0ID0gJChlLnRhcmdldCksXG4gICAgICAgICAgICBmb3JtRWxlbWVudCA9IHRoaXMub3B0aW9ucy5mb3JtRWxlbWVudCxcbiAgICAgICAgICAgICRzZWxlY3RGaWVsZCA9ICR0YXJnZXQuY2xvc2VzdCgnbGknKSxcbiAgICAgICAgICAgICRrZXl3b3JkRmllbGQgPSAkc2VsZWN0RmllbGQuZmluZCgnLmtleXdvcmQtZmllbGQnKSxcbiAgICAgICAgICAgIHNlbGVjdGVkS2V5d29yZCA9ICRrZXl3b3JkRmllbGQudGV4dCgpO1xuXG4gICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnNldFZhbHVlKHNlbGVjdGVkS2V5d29yZCk7XG5cbiAgICAgICAgaWYgKGZvcm1FbGVtZW50ICYmIHNlbGVjdGVkS2V5d29yZCkge1xuICAgICAgICAgICAgdGhpcy5fc2V0U3VibWl0T3B0aW9uKCR0YXJnZXQpO1xuICAgICAgICAgICAgZm9ybUVsZW1lbnQuc3VibWl0KCk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZXN1bHQ7XG4iXX0=
