(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
ne.util.defineNamespace('ne.component.AutoComplete', require('./src/js/AutoComplete'));

},{"./src/js/AutoComplete":2}],2:[function(require,module,exports){
/**
 * @fileoverview Core element. All of auto complete objects belong with this object.
 * @version 1.1.0
 * @author NHN Entertainment FE Dev Team. Jein Yi<jein.yi@nhnent.com>
*/

var DataManager = require('./DataManager');
var InputManager = require('./InputManager');
var ResultManager = require('./ResultManager');

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
ne.component.AutoComplete = ne.util.defineClass(/**@lends ne.component.AutoComplete.prototype */{

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

        this.options.watchInterval = ne.util.isExisty(this.options.watchInterval) ? this.options.watchInterval : this.watchInterval;

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

        if (!ne.util.isExisty(config)) {
            throw new Error('Config file is not avaliable. #' + config);
            return false;
        }

        configArr = ne.util.keys(config);

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
            if (ne.util.inArray(configArr[i], requiredFields, 0) >= 0) {
                checkedFields.push(configArr[i]);
            }
        }

        ne.util.forEach(requiredFields, function(el) {
            if (ne.util.inArray(el, checkedFields, 0) === -1) {
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
        ne.util.extend(this.options.searchApi, options);
    },

    /**
     * clear ready value and set idle state
     */
    clearReadyValue: function() {
        if (ne.util.isExisty(this.readyValue)) {
            this.request(this.readyValue);
        } else {
            this.isIdle = true;
        }
        this.readyValue = null;
    }
});
ne.util.CustomEvents.mixin(AutoComplete);

},{"./DataManager":3,"./InputManager":4,"./ResultManager":5}],3:[function(require,module,exports){
/**
 * @fileoverview DataManager that request data at api with input query
 * @version 1.1.0
 * @author NHN Entertainment FE dev team. Jein Yi<jein.yi@nhnent.com>
 */

/**
 * Unit of auto complete connecting server.
 * @constructor
 */
var DataManager = ne.util.defineClass(/**@lends DataManager.prototype */{
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
            requestParam = ne.util.extend(this.options.searchApi, defaultParam),
            keyDatas;

        $.ajax(this.options.searchUrl, {
            'dataType': 'jsonp',
            'jsonpCallback': 'dataCallback',
            'data': requestParam,
            'type': 'get',
            'success': ne.util.bind(function(dataObj) {
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

        ne.util.forEach(collection, function(itemSet) {

            if(ne.util.isEmpty(itemSet.items)) {
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

        ne.util.forEachArray(itemSet.items, function(item, idx) {

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

module.exports = DataManager;

},{}],4:[function(require,module,exports){
/**
 * @fileOverview InputManager support input element events and all of input function
 * @version 1.1.0
 * @author NHN Entertainment FE dev team. Jein Yi<jein.yi@nhnent.com>
 */

/**
 * Unit of auto complete component that belong with input element.
 * @constructor
 */
var InputManager = ne.util.defineClass(/**@lends InputManager.prototype */{

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

        if (options && ne.util.isString(options)) {
            options = options.split(',');
        }

        if ((!options || ne.util.isEmpty(options)) && !ne.util.isExisty(statics)) {
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

        ne.util.forEach(options, function(value, idx) {

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
        ne.util.forEach(statics, function(value) {
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

module.exports = InputManager;

},{}],5:[function(require,module,exports){
/**
 * @fileoverview ResultManager draw result list and apply template.
 * @version 1.1.0
 * @author  NHN entertainment FE dev team Jein Yi<jein.yi@nhnent.com>
 */

/**
 * Unit of auto complete that belong with search result list.
 * @constructor
 */
var ResultManager = ne.util.defineClass(/** @lends ResultManager.prototype */{
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

        if (ne.util.isString(data)) {
            tmplValue[attrs[0]] = data;
            return tmplValue;
        }
        ne.util.forEach(attrs, function(attr, idx) {

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

        ne.util.forEach(querys, function(query) {

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
        if (!ne.util.isExisty(element)) {
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

        ne.util.forEachArray($arr, function(val) {
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

module.exports = ResultManager;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9BdXRvQ29tcGxldGUuanMiLCJzcmMvanMvRGF0YU1hbmFnZXIuanMiLCJzcmMvanMvSW5wdXRNYW5hZ2VyLmpzIiwic3JjL2pzL1Jlc3VsdE1hbmFnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibmUudXRpbC5kZWZpbmVOYW1lc3BhY2UoJ25lLmNvbXBvbmVudC5BdXRvQ29tcGxldGUnLCByZXF1aXJlKCcuL3NyYy9qcy9BdXRvQ29tcGxldGUnKSk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQ29yZSBlbGVtZW50LiBBbGwgb2YgYXV0byBjb21wbGV0ZSBvYmplY3RzIGJlbG9uZyB3aXRoIHRoaXMgb2JqZWN0LlxuICogQHZlcnNpb24gMS4xLjBcbiAqIEBhdXRob3IgTkhOIEVudGVydGFpbm1lbnQgRkUgRGV2IFRlYW0uIEplaW4gWWk8amVpbi55aUBuaG5lbnQuY29tPlxuKi9cblxudmFyIERhdGFNYW5hZ2VyID0gcmVxdWlyZSgnLi9EYXRhTWFuYWdlcicpO1xudmFyIElucHV0TWFuYWdlciA9IHJlcXVpcmUoJy4vSW5wdXRNYW5hZ2VyJyk7XG52YXIgUmVzdWx0TWFuYWdlciA9IHJlcXVpcmUoJy4vUmVzdWx0TWFuYWdlcicpO1xuXG4vKipcbiBAY29uc3RydWN0b3JcbiBAcGFyYW0ge09iamVjdH0gaHRPcHRpb25zXG4gQGV4YW1wbGVcbiAgICB2YXIgYXV0b0NvbXBsZXRlT2JqID0gbmV3IG5lLmNvbXBvbmVudC5BdXRvQ29tcGxldGUoe1xuICAgICAgIFwiY29uZmlnSWRcIiA6IFwiRGVmYXVsdFwiICAgIC8vIERhdGFzZXQgaW4gYXV0b0NvbmZpZy5qc1xuICAgIH0pO1xuICAgIC8qKlxuICAgIFRoZSBmb3JtIG9mIGNvbmZpZyBmaWxlIFwiYXV0b0NvbmZpZy5qc1wiXG4gICAge1xuICAgICAgICBEZWZhdWx0ID0ge1xuICAgICAgICAvLyBSZXN1bHQgZWxlbWVudFxuICAgICAgICAncmVzdWx0TGlzdEVsZW1lbnQnOiAnLl9yZXN1bHRCb3gnLFxuXG4gICAgICAgIC8vIElucHV0IGVsZW1lbnRcbiAgICAgICAgJ3NlYXJjaEJveEVsZW1lbnQnOiAgJyNhY19pbnB1dDEnLFxuXG4gICAgICAgIC8vIEhpZGRlbiBlbGVtZW50IHRoYXQgaXMgZm9yIHRocm93aW5nIHF1ZXJ5IHRoYXQgdXNlciB0eXBlLlxuICAgICAgICAnb3JnUXVlcnlFbGVtZW50JyA6ICcjb3JnX3F1ZXJ5JyxcblxuICAgICAgICAvLyBvbixvZmYgQnV0dG9uIGVsZW1lbnRcbiAgICAgICAgJ3RvZ2dsZUJ0bkVsZW1lbnQnIDogJChcIiNvbm9mZkJ0blwiKSxcblxuICAgICAgICAvLyBvbixvZmYgU3RhdGUgZWxlbWVudFxuICAgICAgICAnb25vZmZUZXh0RWxlbWVudCcgOiAkKFwiLmJhc2VCb3ggLmJvdHRvbVwiKSxcblxuICAgICAgICAvLyBvbiwgb2ZmIFN0YXRlIGltYWdlIHNvdXJjZVxuICAgICAgICAndG9nZ2xlSW1nJyA6IHtcbiAgICAgICAgICAgICdvbicgOiAnLi4vaW1nL2J0bl9vbi5qcGcnLFxuICAgICAgICAgICAgJ29mZicgOiAnLi4vaW1nL2J0bl9vZmYuanBnJ1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIENvbGxlY3Rpb24gaXRlbXMgZWFjaCBjb3VudC5cbiAgICAgICAgJ3ZpZXdDb3VudCcgOiAzLFxuXG4gICAgICAgIC8vIEtleSBhcnJheXMgKHN1YiBxdWVyeSBrZXlzJyBhcnJheSlcbiAgICAgICAgJ3N1YlF1ZXJ5U2V0JzogW1xuICAgICAgICAgICAgWydrZXkxJywgJ2tleTInLCAna2V5MyddLFxuICAgICAgICAgICAgWydkZXAxJywgJ2RlcDInLCAnZGVwMyddLFxuICAgICAgICAgICAgWydjaDEnLCAnY2gyJywgJ2NoMyddLFxuICAgICAgICAgICAgWydjaWQnXVxuICAgICAgICBdLFxuXG4gICAgICAgIC8vIENvbmZpZyBmb3IgYXV0byBjb21wbGV0ZSBsaXN0IGJ5IGluZGV4IG9mIGNvbGxlY3Rpb25cbiAgICAgICAgJ2xpc3RDb25maWcnOiB7XG4gICAgICAgICAgICAnMCc6IHtcbiAgICAgICAgICAgICAgICAndGVtcGxhdGUnOiAnZGVwYXJ0bWVudCcsXG4gICAgICAgICAgICAgICAgJ3N1YlF1ZXJ5U2V0JyA6IDAsXG4gICAgICAgICAgICAgICAgJ2FjdGlvbic6IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnMSc6IHtcbiAgICAgICAgICAgICAgICAndGVtcGxhdGUnOiAnc3JjaF9pbl9kZXBhcnRtZW50JyxcbiAgICAgICAgICAgICAgICAnc3ViUXVlcnlTZXQnIDogMSxcbiAgICAgICAgICAgICAgICAnYWN0aW9uJzogMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICcyJzoge1xuICAgICAgICAgICAgICAgICd0ZW1wbGF0ZSc6ICdzcmNoX2luX2RlcGFydG1lbnQnLFxuICAgICAgICAgICAgICAgICdzdWJRdWVyeVNldCcgOiAyLFxuICAgICAgICAgICAgICAgICdhY3Rpb24nOiAxLFxuICAgICAgICAgICAgICAgICdzdGF0aWNQYXJhbXMnOiAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJzMnOiB7XG4gICAgICAgICAgICAgICAgJ3RlbXBsYXRlJzogJ2RlcGFydG1lbnQnLFxuICAgICAgICAgICAgICAgICdzdWJRdWVyeVNldCcgOiAwLFxuICAgICAgICAgICAgICAgICdhY3Rpb24nOiAxLFxuICAgICAgICAgICAgICAgICdzdGF0aWNQYXJhbXMnOiAxXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgIC8vIE1hcmsgdXAgZm9yIGVhY2ggY29sbGVjdGlvbi4gKERlZmF1bHQgbWFya3VwIGlzIGRlZmF1bHRzLilcbiAgICAgICAgIC8vIFRoaXMgbWFya3VwIGhhcyB0byBoYXZlIFwia2V5d29sZC1maWVsZFwiIGJ1dCB0aXRsZS5cbiAgICAgICAgICd0ZW1wbGF0ZScgOiAge1xuICAgICAgICAgICAgICAgIGRlcGFydG1lbnQ6ICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogJzxsaSBjbGFzcz1cImRlcGFydG1lbnRcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwic2xvdC1maWVsZFwiPlNob3AgdGhlPC9zcGFuPiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxhIGhyZWY9XCIjXCIgY2xhc3M9XCJrZXl3b3JkLWZpZWxkXCI+QHN1YmplY3RAPC9hPiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwic2xvdC1maWVsZFwiPlN0b3JlPC9zcGFuPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPC9saT4nLFxuICAgICAgICAgICAgICAgICAgICAgYXR0cjogWydzdWJqZWN0J11cbiAgICAgICAgIH0sXG4gICAgICAgICBzcmNoIDoge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiAnPGxpIGNsYXNzPVwic3JjaFwiPjxzcGFuIGNsYXNzPVwia2V5d29yZC1maWVsZFwiPkBzdWJqZWN0QDwvc3Bhbj48L2xpPicsXG4gICAgICAgICAgICAgICAgICAgIGF0dHI6IFsnc3ViamVjdCddXG4gICAgICAgICB9LFxuICAgICAgICAgc3JjaF9pbl9kZXBhcnRtZW50IDogICAge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiAnPGxpIGNsYXNzPVwiaW5EZXBhcnRtZW50XCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8YSBocmVmPVwiI1wiIGNsYXNzPVwia2V5d29yZC1maWVsZFwiPkBzdWJqZWN0QDwvYT4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJzbG90LWZpZWxkXCI+aW4gPC9zcGFuPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiZGVwYXJ0LWZpZWxkXCI+QGRlcGFydG1lbnRAPC9zcGFuPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPC9saT4nLFxuICAgICAgICAgICAgICAgICAgICAgYXR0cjogWydzdWJqZWN0JywgJ2RlcGFydG1lbnQnXVxuICAgICAgICAgfSxcbiAgICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6ICc8bGkgY2xhc3M9XCJ0aXRsZVwiPjxzcGFuPkB0aXRsZUA8L3NwYW4+PC9saT4nLFxuICAgICAgICAgICAgICAgICAgICBhdHRyOiBbJ3RpdGxlJ11cbiAgICAgICAgIH0sXG4gICAgICAgICBkZWZhdWx0czoge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiAnPGxpIGNsYXNzPVwic3JjaFwiPjxzcGFuIGNsYXNzPVwia2V5d29yZC1maWVsZFwiPkBzdWJqZWN0QDwvc3Bhbj48L2xpPicsXG4gICAgICAgICAgICAgICAgICAgIGF0dHI6IFsnc3ViamVjdCddXG4gICAgICAgICB9XG4gICAgICAgICB9LFxuXG4gICAgICAgICAvLyBBY3Rpb24gYXR0cmlidXRlIGZvciBlYWNoIGNvbGxlY3Rpb25cbiAgICAgICAgICdhY3Rpb25zJzogW1xuICAgICAgICAgICAgIFwiaHR0cDovL3d3dy5mYXNoaW9uZ28ubmV0L2NhdGFsb2cuYXNweFwiLFxuICAgICAgICAgICAgIFwiaHR0cDovL3d3dy5mYXNoaW9uZ28ubmV0L3NlYXJjaDIuYXNweFwiXG4gICAgICAgICBdLFxuXG4gICAgICAgICAvLyBTZXQgc3RhdGljIG9wdGlvbnMgZm9yIGVhY2ggY29sbGVjdGlvbi5cbiAgICAgICAgICdzdGF0aWNQYXJhbXMnOltcbiAgICAgICAgICAgICBcInF0PVByb2R1Y3ROYW1lXCIsXG4gICAgICAgICAgICAgXCJhdD1URVNULGJ0PUFDVFwiXG4gICAgICAgICBdLFxuXG4gICAgICAgICAvLyBXaGV0aGVyIHVzZSB0aXRsZSBvciBub3QuXG4gICAgICAgICAndXNlVGl0bGUnOiB0cnVlLFxuXG4gICAgICAgICAvLyBGb3JtIGVsZW1lbnQgdGhhdCBpbmNsdWRlIHNlYXJjaCBlbGVtZW50XG4gICAgICAgICAnZm9ybUVsZW1lbnQnIDogJyNhY19mb3JtMScsXG5cbiAgICAgICAgIC8vIENvb2tpZSBuYW1lIGZvciBzYXZlIHN0YXRlXG4gICAgICAgICAnY29va2llTmFtZScgOiBcInVzZWNvb2tpZVwiLFxuXG4gICAgICAgICAvLyBDbGFzcyBuYW1lIGZvciBzZWxlY3RlZCBlbGVtZW50XG4gICAgICAgICAnbW91c2VPdmVyQ2xhc3MnIDogJ2VtcCcsXG5cbiAgICAgICAgIC8vIEF1dG8gY29tcGxldGUgQVBJXG4gICAgICAgICAnc2VhcmNoVXJsJyA6ICdodHRwOi8vMTAuMjQuMTM2LjE3MjoyMDAxMS9hYycsXG5cbiAgICAgICAgIC8vIEF1dG8gY29tcGxldGUgQVBJIHJlcXVlc3QgY29uZmlnXG4gICAgICAgICAnc2VhcmNoQXBpJyA6IHtcbiAgICAgICAgICAgICAgICAnc3QnIDogMTExMSxcbiAgICAgICAgICAgICAgICAncl9sdCcgOiAxMTExLFxuICAgICAgICAgICAgICAgICdyX2VuYycgOiAnVVRGLTgnLFxuICAgICAgICAgICAgICAgICdxX2VuYycgOiAnVVRGLTgnLFxuICAgICAgICAgICAgICAgICdyX2Zvcm1hdCcgOiAnanNvbidcbiAgICAgICAgICAgIH1cbiAgICAgICB9XG4gICAgfVxuXG4qL1xubmUuY29tcG9uZW50LkF1dG9Db21wbGV0ZSA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqQGxlbmRzIG5lLmNvbXBvbmVudC5BdXRvQ29tcGxldGUucHJvdG90eXBlICove1xuXG4gICAgLyoqXG4gICAgICogRGlyZWN0aW9uIHZhbHVlIGZvciBrZXlcbiAgICAgKi9cbiAgICBmbG93TWFwOiB7XG4gICAgICAgICdORVhUJzogJ25leHQnLFxuICAgICAgICAnUFJFVic6ICdwcmV2JyxcbiAgICAgICAgJ0ZJUlNUJzogJ2ZpcnN0JyxcbiAgICAgICAgJ0xBU1QnOiAnbGFzdCdcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEludGVydmFsIGZvciBjaGVjayB1cGRhdGUgaW5wdXRcbiAgICAgKi9cbiAgICB3YXRjaEludGVydmFsOiAyMDAsXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGh0T3B0aW9ucyBhdXRvY29uZmlnIHZhbHVlc1xuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKGh0T3B0aW9ucykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB7fTtcblxuICAgICAgICBpZiAoIXRoaXMuX2NoZWNrVmFsaWRhdGlvbihodE9wdGlvbnMpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY29va2llVmFsdWUsXG4gICAgICAgICAgICBkZWZhdWx0Q29va2llTmFtZSA9ICdfYXRjcF91c2VfY29va2llJztcblxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy50b2dnbGVJbWcgfHwgIXRoaXMub3B0aW9ucy5vbm9mZlRleHRFbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLmlzVXNlID0gdHJ1ZTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLm9wdGlvbnMub25vZmZUZXh0RWxlbWVudDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvb2tpZVZhbHVlID0gJC5jb29raWUodGhpcy5vcHRpb25zLmNvb2tpZU5hbWUpO1xuICAgICAgICAgICAgdGhpcy5pc1VzZSA9ICEhKGNvb2tpZVZhbHVlID09PSAndXNlJyB8fCAhY29va2llVmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuY29va2llTmFtZSkge1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmNvb2tpZU5hbWUgPSBkZWZhdWx0Q29va2llTmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMub3B0aW9ucy53YXRjaEludGVydmFsID0gbmUudXRpbC5pc0V4aXN0eSh0aGlzLm9wdGlvbnMud2F0Y2hJbnRlcnZhbCkgPyB0aGlzLm9wdGlvbnMud2F0Y2hJbnRlcnZhbCA6IHRoaXMud2F0Y2hJbnRlcnZhbDtcblxuICAgICAgICB0aGlzLmRhdGFNYW5hZ2VyID0gbmV3IERhdGFNYW5hZ2VyKHRoaXMsIHRoaXMub3B0aW9ucyk7XG4gICAgICAgIHRoaXMuaW5wdXRNYW5hZ2VyID0gbmV3IElucHV0TWFuYWdlcih0aGlzLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICB0aGlzLnJlc3VsdE1hbmFnZXIgPSBuZXcgUmVzdWx0TWFuYWdlcih0aGlzLCB0aGlzLm9wdGlvbnMpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTYXZlIG1hdGNoZWQgaW5wdXQgZW5nbGlzaCBzdHJpbmcgd2l0aCBLb3JlYW4uXG4gICAgICAgICAqIEB0eXBlIHtudWxsfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5xdWVyeXMgPSBudWxsO1xuICAgICAgICB0aGlzLmlzSWRsZSA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5zZXRUb2dnbGVCdG5JbWcodGhpcy5pc1VzZSk7XG4gICAgICAgIHRoaXMuc2V0Q29va2llVmFsdWUodGhpcy5pc1VzZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIHJlcXVpcmVkIGZpZWxkcyBhbmQgdmFsaWRhdGUgZmllbGRzLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBodE9wdGlvbnMgY29tcG9uZW50IGNvbmZpZ3VyYXRpb25zXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jaGVja1ZhbGlkYXRpb246IGZ1bmN0aW9uKGh0T3B0aW9ucykge1xuICAgICAgICB2YXIgY29uZmlnLFxuICAgICAgICAgICAgY29uZmlnQXJyO1xuXG4gICAgICAgIGNvbmZpZyA9IGh0T3B0aW9ucy5jb25maWc7XG5cbiAgICAgICAgaWYgKCFuZS51dGlsLmlzRXhpc3R5KGNvbmZpZykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ29uZmlnIGZpbGUgaXMgbm90IGF2YWxpYWJsZS4gIycgKyBjb25maWcpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uZmlnQXJyID0gbmUudXRpbC5rZXlzKGNvbmZpZyk7XG5cbiAgICAgICAgdmFyIGNvbmZpZ0xlbiA9IGNvbmZpZ0Fyci5sZW5ndGgsXG4gICAgICAgICAgICBpLFxuICAgICAgICAgICAgcmVxdWlyZWRGaWVsZHMgPSBbXG4gICAgICAgICAgICAgICAgJ3Jlc3VsdExpc3RFbGVtZW50JyxcbiAgICAgICAgICAgICAgICAnc2VhcmNoQm94RWxlbWVudCcgLFxuICAgICAgICAgICAgICAgICdvcmdRdWVyeUVsZW1lbnQnLFxuICAgICAgICAgICAgICAgICdzdWJRdWVyeVNldCcsXG4gICAgICAgICAgICAgICAgJ3RlbXBsYXRlJyxcbiAgICAgICAgICAgICAgICAnbGlzdENvbmZpZycsXG4gICAgICAgICAgICAgICAgJ2FjdGlvbnMnLFxuICAgICAgICAgICAgICAgICdmb3JtRWxlbWVudCcsXG4gICAgICAgICAgICAgICAgJ3NlYXJjaFVybCcsXG4gICAgICAgICAgICAgICAgJ3NlYXJjaEFwaSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBjaGVja2VkRmllbGRzID0gW107XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvbmZpZ0xlbjsgaSsrKSB7XG4gICAgICAgICAgICBpZiAobmUudXRpbC5pbkFycmF5KGNvbmZpZ0FycltpXSwgcmVxdWlyZWRGaWVsZHMsIDApID49IDApIHtcbiAgICAgICAgICAgICAgICBjaGVja2VkRmllbGRzLnB1c2goY29uZmlnQXJyW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaChyZXF1aXJlZEZpZWxkcywgZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgIGlmIChuZS51dGlsLmluQXJyYXkoZWwsIGNoZWNrZWRGaWVsZHMsIDApID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlbCArICdkb2VzIG5vdCBub3QgZXhpc3QuJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWwgPT09ICdzZWFyY2hBcGknICYmIGNvbmZpZ1snc2VhcmNoQXBpJ10pIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbmZpZy5zZWFyY2hVcmwgfHxcbiAgICAgICAgICAgICAgICAgICAgIWNvbmZpZy5zZWFyY2hBcGkuc3QgfHxcbiAgICAgICAgICAgICAgICAgICAgIWNvbmZpZy5zZWFyY2hBcGkucl9sdCkge1xuICAgICAgICAgICAgICAgICAgICBhbGVydCgnc2VhcmNoQXBpIHJlcXVpcmVkIHZhbHVlIGRvZXMgbm90IGV4aXN0LicpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY29uZmlnTGVuOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjb25maWdOYW1lID0gY29uZmlnQXJyW2ldLFxuICAgICAgICAgICAgICAgIGNvbmZpZ1ZhbHVlID0gY29uZmlnW2NvbmZpZ05hbWVdO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGNvbmZpZ1ZhbHVlID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgICAgKGNvbmZpZ1ZhbHVlLmNoYXJBdCgwKSA9PT0gJy4nIHx8IGNvbmZpZ1ZhbHVlLmNoYXJBdCgwKSA9PT0gJyMnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1tjb25maWdOYW1lXSA9ICQoY29uZmlnVmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNbY29uZmlnTmFtZV0gPSBjb25maWdbY29uZmlnTmFtZV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdCBkYXRhIGF0IGFwaSBzZXJ2ZXIgd2l0aCBrZXl3b3JkXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGtleXdvcmQgVGhlIGtleSB3b3JkIHRvIHNlbmQgdG8gQXV0byBjb21wbGV0ZSBBUElcbiAgICAgKi9cbiAgICByZXF1ZXN0OiBmdW5jdGlvbihrZXl3b3JkKSB7XG4gICAgICAgIHRoaXMuZGF0YU1hbmFnZXIucmVxdWVzdChrZXl3b3JkKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHN0cmluZyBpbiBpbnB1dCBlbGVtZW50LlxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlucHV0TWFuYWdlci5nZXRWYWx1ZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgaW5wdXRNYW5hZ2VyJ3MgdmFsdWUgdG8gc2hvdyBhdCBzZWFyY2ggZWxlbWVudFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBrZXl3b3JkIFRoZSBzdHJpbmcgdG8gc2hvdyB1cCBhdCBzZWFyY2ggZWxlbWVudFxuICAgICAqL1xuICAgIHNldFZhbHVlOiBmdW5jdGlvbihrZXl3b3JkKSB7XG4gICAgICAgIHRoaXMuaW5wdXRNYW5hZ2VyLnNldFZhbHVlKGtleXdvcmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0IHRvIGNyZWF0ZSBhZGRpdGlvbiBwYXJhbWV0ZXJzIGF0IGlucHV0TWFuYWdlci5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyYW1TdHIgU3RyaW5nIHRvIGJlIGFkZGl0aW9uIHBhcmFtZXRlcnMuKHNhcGVyYXRvciAnJicpXG4gICAgICovXG4gICAgc2V0UGFyYW1zOiBmdW5jdGlvbihwYXJhbVN0ciwgdHlwZSkge1xuICAgICAgICB0aGlzLmlucHV0TWFuYWdlci5zZXRQYXJhbXMocGFyYW1TdHIsIHR5cGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0IHRvIGRyYXcgcmVzdWx0IGF0IHJlc3VsdE1hbmFnZXIgd2l0aCBkYXRhIGZyb20gYXBpIHNlcnZlci5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBkYXRhQXJyIERhdGEgYXJyYXkgZnJvbSBhcGkgc2VydmVyXG4gICAgICovXG4gICAgc2V0U2VydmVyRGF0YTogZnVuY3Rpb24oZGF0YUFycikge1xuICAgICAgICB0aGlzLnJlc3VsdE1hbmFnZXIuZHJhdyhkYXRhQXJyKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IENvb2tpZSB2YWx1ZSB3aXRoIHdoZXRoZXIgdXNlIGF1dG8gY29tcGxldGUgb3Igbm90XG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpc1VzZSBXaGV0aGVyIHVzZSBhdXRvIGNvbXBsZXRlIG9yIG5vdFxuICAgICAqL1xuICAgIHNldENvb2tpZVZhbHVlOiBmdW5jdGlvbihpc1VzZSkge1xuICAgICAgICAkLmNvb2tpZSh0aGlzLm9wdGlvbnMuY29va2llTmFtZSwgaXNVc2UgPyAndXNlJyA6ICdub3RVc2UnKTtcbiAgICAgICAgdGhpcy5pc1VzZSA9IGlzVXNlO1xuICAgICAgICB0aGlzLnNldFRvZ2dsZUJ0bkltZyhpc1VzZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNhdmUgS29yZWFuIHRoYXQgaXMgbWF0Y2hlZCByZWFsIHF1ZXJ5LlxuICAgICAqIEBwYXJhbSB7YXJyYXl9IHF1ZXJ5cyBSZXN1bHQgcXVyZXlzXG4gICAgICovXG4gICAgc2V0UXVlcnlzOiBmdW5jdGlvbihxdWVyeXMpIHtcbiAgICAgICAgdGhpcy5xdWVyeXMgPSBbXS5jb25jYXQocXVlcnlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdoZXRoZXIgdXNlIGF1dG8gY29tcGxldGUgb3Igbm90XG4gICAgICogIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgaXNVc2VBdXRvQ29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc1VzZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdoZXRoZXIgcmVzdWx0IGxpc3QgYXJlYSBzaG93IG9yIG5vdFxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgaXNTaG93UmVzdWx0TGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdE1hbmFnZXIuaXNTaG93UmVzdWx0TGlzdCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgdG9nZ2xlIGJ1dHRvbiBpbWFnZSBieSBhdXRvIGNvbXBsZXRlIHN0YXRlXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpc1VzZSB3aGV0aGVyIHVzZSBhdXRvIGNvbXBsZXRlIG9yIG5vdFxuICAgICAqL1xuICAgIHNldFRvZ2dsZUJ0bkltZzogZnVuY3Rpb24oaXNVc2UpIHtcbiAgICAgICAgdGhpcy5pbnB1dE1hbmFnZXIuc2V0VG9nZ2xlQnRuSW1nKGlzVXNlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSBzZWFyY2ggcmVzdWx0IGxpc3QgYXJlYVxuICAgICAqL1xuICAgIGhpZGVSZXN1bHRMaXN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNVc2VBdXRvQ29tcGxldGUoKSkge1xuICAgICAgICAgICAgdGhpcy5yZXN1bHRNYW5hZ2VyLmhpZGVSZXN1bHRMaXN0KCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyBzZWFyY2ggcmVzdWx0IGxpc3QgYXJlYVxuICAgICAqL1xuICAgIHNob3dSZXN1bHRMaXN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNVc2VBdXRvQ29tcGxldGUoKSkge1xuICAgICAgICAgICAgdGhpcy5yZXN1bHRNYW5hZ2VyLnNob3dSZXN1bHRMaXN0KCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTW92ZSB0byBuZXh0IGl0ZW0gaW4gcmVzdWx0IGxpc3QuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZsb3cgRGlyZWN0aW9uIHRvIG1vdmUuXG4gICAgICovXG4gICAgbW92ZU5leHRMaXN0OiBmdW5jdGlvbihmbG93KSB7XG4gICAgICAgIHRoaXMucmVzdWx0TWFuYWdlci5tb3ZlTmV4dExpc3QoZmxvdyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCB0ZXh0IHRvIGF1dG8gY29tcGxldGUgc3dpdGNoXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpc1VzZSBXaGV0aGVyIHVzZSBhdXRvIGNvbXBsZXRlIG9yIG5vdFxuICAgICAqL1xuICAgIGNoYW5nZU9uT2ZmVGV4dDogZnVuY3Rpb24oaXNVc2UpIHtcbiAgICAgICAgdGhpcy5yZXN1bHRNYW5hZ2VyLmNoYW5nZU9uT2ZmVGV4dChpc1VzZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiByZXN1bHRNYW5hZ2VyIHdoZXRoZXIgbG9ja2VkIG9yIG5vdFxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IHJlc3VsdE1hbmFnZXLsnZggaXNNb3ZlZOqwklxuICAgICAqL1xuICAgIGdldE1vdmVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0TWFuYWdlci5pc01vdmVkO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgcmVzdWx0TWFuYWdlcidzIGlzTW92ZWQgZmllbGRcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzTW92ZWQgV2hldGhlciBsb2NrZWQgb3Igbm90LlxuICAgICAqL1xuICAgIHNldE1vdmVkOiBmdW5jdGlvbihtb3ZlZCkge1xuICAgICAgICB0aGlzLnJlc3VsdE1hbmFnZXIuaXNNb3ZlZCA9IG1vdmVkO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXNldCBzZXJhY2hBcGlcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBzZWFyY2hBcGnsmLXshZgg7ISk7KCVXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAgYXV0b0NvbXBsZXRlLnNldFNlYXJjaEFwaSh7XG4gICAgICogICAgICAnc3QnIDogOTM1MSxcbiAgICAgKiAgICAgICdyX2x0JyA6IDcxODcsXG4gICAgICogICAgICAncl9lbmMnIDogJ1VURi04JyxcbiAgICAgKiAgICAgICdxX2VuYycgOiAnVVRGLTgnLFxuICAgICAqICAgICAgJ3JfZm9ybWF0JyA6ICdqc29uJ1xuICAgICAqICB9KTtcbiAgICAgKi9cbiAgICBzZXRTZWFyY2hBcGk6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgbmUudXRpbC5leHRlbmQodGhpcy5vcHRpb25zLnNlYXJjaEFwaSwgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNsZWFyIHJlYWR5IHZhbHVlIGFuZCBzZXQgaWRsZSBzdGF0ZVxuICAgICAqL1xuICAgIGNsZWFyUmVhZHlWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChuZS51dGlsLmlzRXhpc3R5KHRoaXMucmVhZHlWYWx1ZSkpIHtcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdCh0aGlzLnJlYWR5VmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pc0lkbGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVhZHlWYWx1ZSA9IG51bGw7XG4gICAgfVxufSk7XG5uZS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihBdXRvQ29tcGxldGUpO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IERhdGFNYW5hZ2VyIHRoYXQgcmVxdWVzdCBkYXRhIGF0IGFwaSB3aXRoIGlucHV0IHF1ZXJ5XG4gKiBAdmVyc2lvbiAxLjEuMFxuICogQGF1dGhvciBOSE4gRW50ZXJ0YWlubWVudCBGRSBkZXYgdGVhbS4gSmVpbiBZaTxqZWluLnlpQG5obmVudC5jb20+XG4gKi9cblxuLyoqXG4gKiBVbml0IG9mIGF1dG8gY29tcGxldGUgY29ubmVjdGluZyBzZXJ2ZXIuXG4gKiBAY29uc3RydWN0b3JcbiAqL1xudmFyIERhdGFNYW5hZ2VyID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKipAbGVuZHMgRGF0YU1hbmFnZXIucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKGF1dG9Db21wbGV0ZU9iaiwgb3B0aW9ucykge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCAhPSAyKSB7XG4gICAgICAgICAgICBhbGVydCgnYXJndW1lbnQgbGVuZ3RoIGVycm9yICEnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqID0gYXV0b0NvbXBsZXRlT2JqO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0IGRhdGEgYXQgYXBpIHNlcnZlciB1c2UganNvbnBcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5d29yZCBTdHJpbmcgdG8gcmVxdWVzdCBhdCBzZXJ2ZXJcbiAgICAgKi9cbiAgICByZXF1ZXN0OiBmdW5jdGlvbihrZXl3b3JkKSB7XG5cbiAgICAgICAgdmFyIHJzS2V5V3JvZCA9IGtleXdvcmQucmVwbGFjZSgvXFxzL2csICcnKTtcblxuICAgICAgICBpZiAoIWtleXdvcmQgfHwgIXJzS2V5V3JvZCkge1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouaGlkZVJlc3VsdExpc3QoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkYXRhQ2FsbGJhY2sgPSBmdW5jdGlvbigpe30sXG4gICAgICAgICAgICBkZWZhdWx0UGFyYW0gPSB7XG4gICAgICAgICAgICAgICAgcToga2V5d29yZCxcbiAgICAgICAgICAgICAgICByX2VuYzogJ1VURi04JyxcbiAgICAgICAgICAgICAgICBxX2VuYzogJ1VURi04JyxcbiAgICAgICAgICAgICAgICByX2Zvcm1hdDogJ2pzb24nLFxuICAgICAgICAgICAgICAgIF9jYWxsYmFjazogJ2RhdGFDYWxsYmFjaydcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXF1ZXN0UGFyYW0gPSBuZS51dGlsLmV4dGVuZCh0aGlzLm9wdGlvbnMuc2VhcmNoQXBpLCBkZWZhdWx0UGFyYW0pLFxuICAgICAgICAgICAga2V5RGF0YXM7XG5cbiAgICAgICAgJC5hamF4KHRoaXMub3B0aW9ucy5zZWFyY2hVcmwsIHtcbiAgICAgICAgICAgICdkYXRhVHlwZSc6ICdqc29ucCcsXG4gICAgICAgICAgICAnanNvbnBDYWxsYmFjayc6ICdkYXRhQ2FsbGJhY2snLFxuICAgICAgICAgICAgJ2RhdGEnOiByZXF1ZXN0UGFyYW0sXG4gICAgICAgICAgICAndHlwZSc6ICdnZXQnLFxuICAgICAgICAgICAgJ3N1Y2Nlc3MnOiBuZS51dGlsLmJpbmQoZnVuY3Rpb24oZGF0YU9iaikge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGtleURhdGFzID0gdGhpcy5fZ2V0Q29sbGVjdGlvbkRhdGEoZGF0YU9iaik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnNldFF1ZXJ5cyhkYXRhT2JqLnF1ZXJ5KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouc2V0U2VydmVyRGF0YShrZXlEYXRhcyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLmNsZWFyUmVhZHlWYWx1ZSgpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdbRGF0YU1hbmFnZXJdIFJlcXVlc3QgZmFpbGQuJyAsIGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMpXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogTWFrZSBjb2xsZWN0aW9uIGRhdGEgdG8gZGlzcGxheVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhT2JqIENvbGxlY3Rpb24gZGF0YVxuICAgICAqIEByZXR1cm5zIHtBcnJheX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDb2xsZWN0aW9uRGF0YTogZnVuY3Rpb24oZGF0YU9iaikge1xuICAgICAgICB2YXIgY29sbGVjdGlvbiA9IGRhdGFPYmouY29sbGVjdGlvbnMsXG4gICAgICAgICAgICBpdGVtRGF0YUxpc3QgPSBbXTtcblxuICAgICAgICBuZS51dGlsLmZvckVhY2goY29sbGVjdGlvbiwgZnVuY3Rpb24oaXRlbVNldCkge1xuXG4gICAgICAgICAgICBpZihuZS51dGlsLmlzRW1wdHkoaXRlbVNldC5pdGVtcykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBjcmVhdGUgY29sbGVjdGlvbiBpdGVtcy5cbiAgICAgICAgICAgIHZhciBrZXlzID0gdGhpcy5fZ2V0UmVkaXJlY3REYXRhKGl0ZW1TZXQpO1xuXG4gICAgICAgICAgICBpdGVtRGF0YUxpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3RpdGxlJyxcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IFtpdGVtU2V0LnRpdGxlXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdGVtRGF0YUxpc3QgPSBpdGVtRGF0YUxpc3QuY29uY2F0KGtleXMpO1xuXG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBpdGVtRGF0YUxpc3Q7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBNYWtlIGl0ZW0gb2YgY29sbGVjdGlvbiB0byBkaXNwbGF5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGl0ZW1TZXQgSXRlbSBvZiBjb2xsZWN0aW9uIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEByZXR1cm5zIHtBcnJheX1cbiAgICAgKi9cbiAgICBfZ2V0UmVkaXJlY3REYXRhOiBmdW5jdGlvbihpdGVtU2V0KSB7XG4gICAgICAgIHZhciB0eXBlID0gaXRlbVNldC50eXBlLFxuICAgICAgICAgICAgaW5kZXggPSBpdGVtU2V0LmluZGV4LFxuICAgICAgICAgICAgZGVzdCA9IGl0ZW1TZXQuZGVzdGluYXRpb24sXG4gICAgICAgICAgICBpdGVtcyA9IFtdO1xuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KGl0ZW1TZXQuaXRlbXMsIGZ1bmN0aW9uKGl0ZW0sIGlkeCkge1xuXG4gICAgICAgICAgICBpZiAoaWR4IDw9ICh0aGlzLm9wdGlvbnMudmlld0NvdW50IC0gMSkpIHtcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiBpdGVtLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIGRlc3Q6IGRlc3RcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gaXRlbXM7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRGF0YU1hbmFnZXI7XG4iLCIvKipcbiAqIEBmaWxlT3ZlcnZpZXcgSW5wdXRNYW5hZ2VyIHN1cHBvcnQgaW5wdXQgZWxlbWVudCBldmVudHMgYW5kIGFsbCBvZiBpbnB1dCBmdW5jdGlvblxuICogQHZlcnNpb24gMS4xLjBcbiAqIEBhdXRob3IgTkhOIEVudGVydGFpbm1lbnQgRkUgZGV2IHRlYW0uIEplaW4gWWk8amVpbi55aUBuaG5lbnQuY29tPlxuICovXG5cbi8qKlxuICogVW5pdCBvZiBhdXRvIGNvbXBsZXRlIGNvbXBvbmVudCB0aGF0IGJlbG9uZyB3aXRoIGlucHV0IGVsZW1lbnQuXG4gKiBAY29uc3RydWN0b3JcbiAqL1xudmFyIElucHV0TWFuYWdlciA9IG5lLnV0aWwuZGVmaW5lQ2xhc3MoLyoqQGxlbmRzIElucHV0TWFuYWdlci5wcm90b3R5cGUgKi97XG5cbiAgICAvKipcbiAgICAgKiBrZXlib2FyZCBJbnB1dCBLZXlDb2RlIGVudW1cbiAgICAgKi9cbiAgICBrZXlDb2RlTWFwOiB7XG4gICAgICAgICdUQUInIDogOSxcbiAgICAgICAgJ1VQX0FSUk9XJyA6IDM4LFxuICAgICAgICAnRE9XTl9BUlJPVycgOiA0MFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF1dG9Db21wbGV0ZU9iaiBBdXRvQ29tcGxldGUgaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBhdXRvIGNvbXBsZXRlIG9wdGlvbnNcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihhdXRvQ29tcGxldGVPYmosIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggIT0gMikge1xuICAgICAgICAgICAgYWxlcnQoJ2FyZ3VtZW50IGxlbmd0aCBlcnJvciAhJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmogPSBhdXRvQ29tcGxldGVPYmo7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICAgICAgLy8gU2F2ZSBlbGVtZW50cyBmcm9tIGNvbmZpZ3VyYXRpb24uXG4gICAgICAgIHRoaXMuJHNlYXJjaEJveCA9IHRoaXMub3B0aW9ucy5zZWFyY2hCb3hFbGVtZW50O1xuICAgICAgICB0aGlzLiR0b2dnbGVCdG4gPSB0aGlzLm9wdGlvbnMudG9nZ2xlQnRuRWxlbWVudDtcbiAgICAgICAgdGhpcy4kb3JnUXVlcnkgPSB0aGlzLm9wdGlvbnMub3JnUXVlcnlFbGVtZW50O1xuICAgICAgICB0aGlzLiRmb3JtRWxlbWVudCA9IHRoaXMub3B0aW9ucy5mb3JtRWxlbWVudDtcblxuICAgICAgICB0aGlzLmlucHV0VmFsdWUgPSB0aGlzLiRzZWFyY2hCb3gudmFsKCk7XG5cbiAgICAgICAgdGhpcy5fYXR0YWNoRXZlbnQoKTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gaW5wdXQgZWxlbWVudCB2YWx1ZVxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRzZWFyY2hCb3gudmFsKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBrZXl3b3JkIHRvIGlucHV0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBrZXl3b3JkIHRvIHNldCB2YWx1ZS5cbiAgICAgKi9cbiAgICBzZXRWYWx1ZTogZnVuY3Rpb24oc3RyKSB7XG4gICAgICAgIHRoaXMuaW5wdXRWYWx1ZSA9IHN0cjtcbiAgICAgICAgdGhpcy4kc2VhcmNoQm94LnZhbChzdHIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZWFkIGNvbmZpZyBmaWxlcyBwYXJhbWV0ZXIgb3B0aW9uIGFuZCBzZXQgcGFyYW1ldGVyLlxuICAgICAqIEBwYXJhbSB7YXJyYXl9IG9wdGlvbnMgVGhlIHBhcmFtZXRlcnMgZnJvbSBjb25maWdcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggVGhlIGluZGV4IGZvciBzZXR0aW5nIGtleSB2YWx1ZVxuICAgICAqL1xuICAgIHNldFBhcmFtczogZnVuY3Rpb24ob3B0aW9ucywgaW5kZXgpIHtcblxuICAgICAgICB2YXIgb3B0ID0gdGhpcy5vcHRpb25zLFxuICAgICAgICAgICAgbGlzdENvbmZpZyA9IG9wdC5saXN0Q29uZmlnW2luZGV4XSxcbiAgICAgICAgICAgIHN0YXRpY3MgPSBvcHQuc3RhdGljUGFyYW1zW2xpc3RDb25maWcuc3RhdGljUGFyYW1zXTtcblxuICAgICAgICBpZiAob3B0aW9ucyAmJiBuZS51dGlsLmlzU3RyaW5nKG9wdGlvbnMpKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gb3B0aW9ucy5zcGxpdCgnLCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCghb3B0aW9ucyB8fCBuZS51dGlsLmlzRW1wdHkob3B0aW9ucykpICYmICFuZS51dGlsLmlzRXhpc3R5KHN0YXRpY3MpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jcmVhdGVQYXJhbVNldEJ5VHlwZShvcHRpb25zLCBpbmRleCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBpbnB1dEVsZW1lbnQgYnkgdHlwZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIFRoZSB2YWx1ZXMgdG8gc2VuZCBzZWFyY2ggYXBpXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IFRoZSBpbmRleCBvZiBxdWVyeSBrZXkgYXJyYXlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jcmVhdGVQYXJhbVNldEJ5VHlwZTogZnVuY3Rpb24ob3B0aW9ucywgaW5kZXgpIHtcblxuICAgICAgICB2YXIga2V5LFxuICAgICAgICAgICAgb3B0ID0gdGhpcy5vcHRpb25zLFxuICAgICAgICAgICAgbGlzdENvbmZpZyA9IG9wdC5saXN0Q29uZmlnW2luZGV4XSxcbiAgICAgICAgICAgIGNvbmZpZyA9IG9wdC5zdWJRdWVyeVNldFtsaXN0Q29uZmlnLnN1YlF1ZXJ5U2V0XSxcbiAgICAgICAgICAgIHN0YXRpY3MgPSBvcHQuc3RhdGljUGFyYW1zW2xpc3RDb25maWcuc3RhdGljUGFyYW1zXTtcblxuICAgICAgICBpZiAoIXRoaXMuaGlkZGVucykge1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlUGFyYW1Db250YWluZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaChvcHRpb25zLCBmdW5jdGlvbih2YWx1ZSwgaWR4KSB7XG5cbiAgICAgICAgICAgIGtleSA9IGNvbmZpZ1tpZHhdO1xuICAgICAgICAgICAgdGhpcy5oaWRkZW5zLmFwcGVuZCgkKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCInICsga2V5ICsgJ1wiIHZhbHVlPVwiJyArIHZhbHVlICsgJ1wiIC8+JykpO1xuXG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIGlmIChzdGF0aWNzKSB7XG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVTdGF0aWNQYXJhbXMoc3RhdGljcyk7XG4gICAgICAgIH1cblxuICAgIH0sXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHN0YXRpYyBwYXJhbWV0ZXJzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRpY3MgU3RhdGljIHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NyZWF0ZVN0YXRpY1BhcmFtczogZnVuY3Rpb24oc3RhdGljcykge1xuICAgICAgICBzdGF0aWNzID0gc3RhdGljcy5zcGxpdCgnLCcpO1xuICAgICAgICBuZS51dGlsLmZvckVhY2goc3RhdGljcywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHZhbCA9IHZhbHVlLnNwbGl0KFwiPVwiKTtcbiAgICAgICAgICAgIHRoaXMuaGlkZGVucy5hcHBlbmQoJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiJyArIHZhbFswXSArICdcIiB2YWx1ZT1cIicgKyB2YWxbMV0gKyAnXCIgLz4nKSk7XG5cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSB3cmFwcGVyIHRoYXQgYmVjb21lIGNvbnRhaW5lciBvZiBoaWRkZW4gZWxlbWVudHMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY3JlYXRlUGFyYW1Db250YWluZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmhpZGRlbnMgPSAkKCc8ZGl2IGNsYXNzPVwiaGlkZGVuLWlucHV0c1wiPjwvZGl2PicpO1xuICAgICAgICB0aGlzLmhpZGRlbnMuaGlkZSgpO1xuICAgICAgICB0aGlzLmhpZGRlbnMuYXBwZW5kVG8oJCh0aGlzLiRmb3JtRWxlbWVudCkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgdG9nZ2xlIGJ1dHRvbiBpbWFnZS5cbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzVXNlIOyekOuPmeyZhOyEsSDsgqzsmqkg7Jes67aAXG4gICAgICovXG4gICAgc2V0VG9nZ2xlQnRuSW1nOiBmdW5jdGlvbihpc1VzZSkge1xuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy50b2dnbGVJbWcgfHwgISh0aGlzLiR0b2dnbGVCdG4pKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNVc2UpIHtcbiAgICAgICAgICAgIHRoaXMuJHRvZ2dsZUJ0bi5hdHRyKCdzcmMnLCB0aGlzLm9wdGlvbnMudG9nZ2xlSW1nLm9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJHRvZ2dsZUJ0bi5hdHRyKCdzcmMnLCB0aGlzLm9wdGlvbnMudG9nZ2xlSW1nLm9mZik7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKiogUHJpdmF0ZSBGdW5jdGlvbnMgKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gICAgLyoqXG4gICAgICogRXZlbnQgYmluZGluZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy/qsoDsg4nssL3sl5AgZm9jdXMsIGtleXVwLCBrZXlkb3duLCBjbGljayDsnbTrsqTtirgg67CU7J2465SpLlxuICAgICAgICB0aGlzLiRzZWFyY2hCb3guYmluZCgnZm9jdXMga2V5dXAga2V5ZG93biBibHVyIGNsaWNrJywgJC5wcm94eShmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGUudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2ZvY3VzJyA6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uRm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnYmx1cicgOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbkJsdXIoZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2tleXVwJyA6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uS2V5VXAoZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2tleWRvd24nIDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25LZXlEb3duKGUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdjbGljaycgOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbkNsaWNrKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQgOlxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcykpO1xuXG4gICAgICAgIGlmICh0aGlzLiR0b2dnbGVCdG4pIHtcbiAgICAgICAgICAgIHRoaXMuJHRvZ2dsZUJ0bi5iaW5kKCdjbGljaycsICQucHJveHkoZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX29uQ2xpY2tUb2dnbGUoKTtcbiAgICAgICAgICAgIH0sIHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTYXZlIHVzZXIgcXVlcnkgaW50byBoaWRkZW4gZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgdHlwZWQgYnkgdXNlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldE9yZ1F1ZXJ5OiBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgdGhpcy4kb3JnUXVlcnkudmFsKHN0cik7XG4gICAgfSxcblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqIEV2ZW50IEhhbmRsZXJzICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAgIC8qKlxuICAgICAqIElucHV0IGVsZW1lbnQgb25jbGljayBldmVudCBoYW5kbGVyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25DbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8v7J6F66Cl65CcIO2CpOybjOuTnOqwgCDsl4bqsbDrgpgg7J6Q64+Z7JmE7ISxIOq4sOuKpSDsgqzsmqntlZjsp4Ag7JWK7Jy866m0IO2OvOy5oCDtlYTsmpQg7JeG7Jy866+A66GcIOq3uOuDpSDrpqzthLTtlZjqs6Ag64GdLlxuICAgICAgICBpZiAoIXRoaXMuYXV0b0NvbXBsZXRlT2JqLmdldFZhbHVlKCkgfHxcbiAgICAgICAgICAgICF0aGlzLmF1dG9Db21wbGV0ZU9iai5pc1VzZUF1dG9Db21wbGV0ZSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5hdXRvQ29tcGxldGVPYmouaXNTaG93UmVzdWx0TGlzdCgpKSB7XG4gICAgICAgICAgICAvL+qysOqzvCDrpqzsiqTtirgg7JiB7Jet7J20IHNob3cg7IOB7YOc7J2066m0KGlzUmVzdWx0U2hvd2luZz09dHJ1ZSkg6rKw6rO8IOumrOyKpO2KuCBoaWRlIOyalOyyrVxuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouaGlkZVJlc3VsdExpc3QoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8v6rKw6rO8IOumrOyKpO2KuCDsmIHsl63snbQgaGlkZSDsg4Htg5zsnbTrqbQoaXNSZXN1bHRTaG93aW5nPT1mYWxzZSkg6rKw6rO8IOumrOyKpO2KuCBzaG93IOyalOyyrVxuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouc2hvd1Jlc3VsdExpc3QoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnB1dCBlbGVtZW50IGZvY3VzIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkZvY3VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy9zZXRJbnRlcnZhbCDshKTsoJXtlbTshJwg7J287KCVIOyLnOqwhCDso7zquLDroZwgX29uV2F0Y2gg7ZWo7IiY66W8IOyLpO2Wie2VnOuLpC5cbiAgICAgICAgdGhpcy5pbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoJC5wcm94eShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuX29uV2F0Y2goKTtcbiAgICAgICAgfSwgdGhpcyksIHRoaXMub3B0aW9ucy53YXRjaEludGVydmFsKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUm9vcCBmb3IgY2hlY2sgdXBkYXRlIGlucHV0IGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbldhdGNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuJHNlYXJjaEJveC52YWwoKSA9PT0gJycpIHtcbiAgICAgICAgICAgIHRoaXMuX3NldE9yZ1F1ZXJ5KCcnKTtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnNldE1vdmVkKGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmlucHV0VmFsdWUgIT09IHRoaXMuJHNlYXJjaEJveC52YWwoKSkge1xuICAgICAgICAgICAgdGhpcy5pbnB1dFZhbHVlID0gdGhpcy4kc2VhcmNoQm94LnZhbCgpO1xuICAgICAgICAgICAgdGhpcy5fb25DaGFuZ2UoKTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5hdXRvQ29tcGxldGVPYmouZ2V0TW92ZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5fc2V0T3JnUXVlcnkodGhpcy4kc2VhcmNoQm94LnZhbCgpKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnB1dCBlbGVtZW50IGtleXVwIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbktleVVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5wdXRWYWx1ZSAhPT0gdGhpcy4kc2VhcmNoQm94LnZhbCgpKSB7XG4gICAgICAgICAgICB0aGlzLmlucHV0VmFsdWUgPSB0aGlzLiRzZWFyY2hCb3gudmFsKCk7XG4gICAgICAgICAgICB0aGlzLl9vbkNoYW5nZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIElucHV0IGVsZW1lbnQgb25jaGFuZ2UgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmF1dG9Db21wbGV0ZU9iai5pc1VzZUF1dG9Db21wbGV0ZSgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5hdXRvQ29tcGxldGVPYmouaXNJZGxlKSB7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5pc0lkbGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnJlcXVlc3QodGhpcy4kc2VhcmNoQm94LnZhbCgpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnJlYWR5VmFsdWUgPSB0aGlzLiRzZWFyY2hCb3gudmFsKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5wdXQgZWxlbWVudCBibHVyIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkJsdXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5pbnRlcnZhbElkKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWxJZCk7XG4gICAgICAgICAgICB0aGlzLmludGVydmFsSWQgPSBudWxsO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIElucHV0IGVsZW1lbnQga2V5ZG93biBldmVudCBoYW5kbGVyXG4gICAgICogU2V0IGFjdGlubyBieSBpbnB1dCB2YWx1ZVxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGUga2V5RG93biBFdmVudCBpbnN0YW5jZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uS2V5RG93bjogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgYXV0b0NvbXBsZXRlT2JqID0gdGhpcy5hdXRvQ29tcGxldGVPYmo7XG5cbiAgICAgICAgaWYgKCFhdXRvQ29tcGxldGVPYmouaXNVc2VBdXRvQ29tcGxldGUoKSB8fFxuICAgICAgICAgICAgIWF1dG9Db21wbGV0ZU9iai5pc1Nob3dSZXN1bHRMaXN0KCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjb2RlID0gZS5rZXlDb2RlLFxuICAgICAgICAgICAgZmxvdyA9IG51bGwsXG4gICAgICAgICAgICBjb2RlTWFwID0gdGhpcy5rZXlDb2RlTWFwLFxuICAgICAgICAgICAgZmxvd01hcCA9IGF1dG9Db21wbGV0ZU9iai5mbG93TWFwO1xuXG4gICAgICAgIGlmIChjb2RlID09PSBjb2RlTWFwLlRBQikge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZmxvdyA9IGUuc2hpZnRLZXkgPyBmbG93TWFwLk5FWFQgOiBmbG93TWFwLlBSRVY7XG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gY29kZU1hcC5ET1dOX0FSUk9XKSB7XG4gICAgICAgICAgICBmbG93ID0gZmxvd01hcC5ORVhUO1xuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IGNvZGVNYXAuVVBfQVJST1cpIHtcbiAgICAgICAgICAgIGZsb3cgPSBmbG93TWFwLlBSRVY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBhdXRvQ29tcGxldGVPYmoubW92ZU5leHRMaXN0KGZsb3cpO1xuXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBidXR0b24gY2xpY2sgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ2xpY2tUb2dnbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuYXV0b0NvbXBsZXRlT2JqLmlzVXNlQXV0b0NvbXBsZXRlKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0VG9nZ2xlQnRuSW1nKHRydWUpO1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouc2V0Q29va2llVmFsdWUodHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5jaGFuZ2VPbk9mZlRleHQoZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouaGlkZVJlc3VsdExpc3QoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0VG9nZ2xlQnRuSW1nKGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnNldENvb2tpZVZhbHVlKGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLmNoYW5nZU9uT2ZmVGV4dCh0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IElucHV0TWFuYWdlcjtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBSZXN1bHRNYW5hZ2VyIGRyYXcgcmVzdWx0IGxpc3QgYW5kIGFwcGx5IHRlbXBsYXRlLlxuICogQHZlcnNpb24gMS4xLjBcbiAqIEBhdXRob3IgIE5ITiBlbnRlcnRhaW5tZW50IEZFIGRldiB0ZWFtIEplaW4gWWk8amVpbi55aUBuaG5lbnQuY29tPlxuICovXG5cbi8qKlxuICogVW5pdCBvZiBhdXRvIGNvbXBsZXRlIHRoYXQgYmVsb25nIHdpdGggc2VhcmNoIHJlc3VsdCBsaXN0LlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbnZhciBSZXN1bHRNYW5hZ2VyID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFJlc3VsdE1hbmFnZXIucHJvdG90eXBlICove1xuICAgIC8qKlxuICAgICAqIEluaXRhaWxpemVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihhdXRvQ29tcGxldGVPYmosIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmogPSBhdXRvQ29tcGxldGVPYmo7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICAgICAgdGhpcy4kcmVzdWx0TGlzdCA9IHRoaXMub3B0aW9ucy5yZXN1bHRMaXN0RWxlbWVudDtcbiAgICAgICAgdGhpcy5yZXN1bHRTZWxlY3RvciA9IHRoaXMub3B0aW9ucy5yZXN1bHRMaXN0RWxlbWVudDtcbiAgICAgICAgdGhpcy52aWV3Q291bnQgPSB0aGlzLm9wdGlvbnMudmlld0NvdW50IHx8IDEwO1xuICAgICAgICB0aGlzLiRvbk9mZlR4dCA9IHRoaXMub3B0aW9ucy5vbm9mZlRleHRFbGVtZW50O1xuICAgICAgICB0aGlzLm1vdXNlT3ZlckNsYXNzID0gdGhpcy5vcHRpb25zLm1vdXNlT3ZlckNsYXNzO1xuICAgICAgICB0aGlzLmZsb3dNYXAgPSB0aGlzLmF1dG9Db21wbGV0ZU9iai5mbG93TWFwO1xuXG4gICAgICAgIHRoaXMuX2F0dGFjaEV2ZW50KCk7XG5cbiAgICAgICAgdGhpcy5zZWxlY3RlZEVsZW1lbnQgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuaXNNb3ZlZCA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEZWxldGUgbGFzdCByZXN1bHQgbGlzdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2RlbGV0ZUJlZm9yZUVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLiRyZXN1bHRMaXN0Lmh0bWwoJycpO1xuICAgICAgICB0aGlzLiRyZXN1bHRMaXN0LmhpZGUoKTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZEVsZW1lbnQgPSBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEcmF3IHJlc3VsdCBmb3JtIGFwaSBzZXJ2ZXJcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBkYXRhQXJyIFJlc3VsdCBkYXRhXG4gICAgICovXG4gICAgZHJhdzogZnVuY3Rpb24oZGF0YUFycikge1xuXG4gICAgICAgIHRoaXMuX2RlbGV0ZUJlZm9yZUVsZW1lbnQoKTtcblxuICAgICAgICB2YXIgbGVuID0gZGF0YUFyci5sZW5ndGg7XG5cbiAgICAgICAgaWYgKGxlbiA8IDEpIHtcbiAgICAgICAgICAgIHRoaXMuX2hpZGVCb3R0b21BcmVhKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9tYWtlUmVzdWx0TGlzdChkYXRhQXJyLCBsZW4pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy4kcmVzdWx0TGlzdC5zaG93KCk7XG4gICAgICAgIC8vIHNob3cgYXV0byBjb21wbGV0ZSBzd2l0Y2hcbiAgICAgICAgdGhpcy5fc2hvd0JvdHRvbUFyZWEoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWFrZSBzZWFyY2ggcmVzdWx0IGxpc3QgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VSZXN1bHRMaXN0OiBmdW5jdGlvbihkYXRhQXJyLCBsZW4pIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gdGhpcy5vcHRpb25zLnRlbXBsYXRlLFxuICAgICAgICAgICAgY29uZmlnID0gdGhpcy5vcHRpb25zLmxpc3RDb25maWcsXG4gICAgICAgICAgICB0bXBsLFxuICAgICAgICAgICAgdXNlVGl0bGUgPSAodGhpcy5vcHRpb25zLnVzZVRpdGxlICYmICEhdGVtcGxhdGUudGl0bGUpLFxuICAgICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgdG1wbFZhbHVlLFxuICAgICAgICAgICAgJGVsLFxuICAgICAgICAgICAgaTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIHR5cGUgPSBkYXRhQXJyW2ldLnR5cGU7XG4gICAgICAgICAgICBpbmRleCA9IGRhdGFBcnJbaV0uaW5kZXg7XG4gICAgICAgICAgICB0bXBsID0gY29uZmlnW2luZGV4XSA/IHRlbXBsYXRlW2NvbmZpZ1tpbmRleF0udGVtcGxhdGVdIDogdGVtcGxhdGUuZGVmYXVsdHM7XG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ3RpdGxlJykge1xuICAgICAgICAgICAgICAgIHRtcGwgPSB0ZW1wbGF0ZS50aXRsZTtcbiAgICAgICAgICAgICAgICBpZiAoIXVzZVRpdGxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRtcGxWYWx1ZSA9IHRoaXMuX2dldFRtcGxEYXRhKHRtcGwuYXR0ciwgZGF0YUFycltpXSk7XG4gICAgICAgICAgICAkZWwgPSAkKHRoaXMuX2FwcGx5VGVtcGxhdGUodG1wbC5lbGVtZW50LCB0bXBsVmFsdWUpKTtcbiAgICAgICAgICAgICRlbC5hdHRyKCdkYXRhLXBhcmFtcycsIHRtcGxWYWx1ZS5wYXJhbXMpO1xuICAgICAgICAgICAgJGVsLmF0dHIoJ2RhdGEtaW5kZXgnLCBpbmRleCk7XG4gICAgICAgICAgICB0aGlzLiRyZXN1bHRMaXN0LmFwcGVuZCgkZWwpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1ha2UgdGVtcGxhdGUgZGF0YVxuICAgICAqIEBwYXJhbSB7YXJyYXl9IGF0dHJzIFRlbXBsYXRlIGF0dHJpYnV0ZXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xPYmplY3R9IGRhdGEgVGhlIGRhdGEgdG8gbWFrZSB0ZW1wbGF0ZVxuICAgICAqIEByZXR1cm4ge29iamVjdH1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRUbXBsRGF0YTogZnVuY3Rpb24oYXR0cnMsIGRhdGEpIHtcbiAgICAgICAgdmFyIHRtcGxWYWx1ZSA9IHt9LFxuICAgICAgICAgICAgdmFsdWVzID0gZGF0YS52YWx1ZXMgfHwgbnVsbDtcblxuICAgICAgICBpZiAobmUudXRpbC5pc1N0cmluZyhkYXRhKSkge1xuICAgICAgICAgICAgdG1wbFZhbHVlW2F0dHJzWzBdXSA9IGRhdGE7XG4gICAgICAgICAgICByZXR1cm4gdG1wbFZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaChhdHRycywgZnVuY3Rpb24oYXR0ciwgaWR4KSB7XG5cbiAgICAgICAgICAgIHRtcGxWYWx1ZVthdHRyXSA9IHZhbHVlc1tpZHhdO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmKGF0dHJzLmxlbmd0aCA8IHZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRtcGxWYWx1ZS5wYXJhbXMgPSB2YWx1ZXMuc2xpY2UoYXR0cnMubGVuZ3RoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0bXBsVmFsdWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB3aGV0aGVyIHJlc3VsdCBsaXN0IHNob3cgb3Igbm90XG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1Nob3dSZXN1bHRMaXN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLiRyZXN1bHRMaXN0LmNzcygnZGlzcGxheScpID09PSAnYmxvY2snKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSByZXN1bHQgbGlzdCBhcmVhXG4gICAgICovXG4gICAgaGlkZVJlc3VsdExpc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLiRyZXN1bHRMaXN0LmNzcygnZGlzcGxheScsICdub25lJyk7XG4gICAgICAgIHRoaXMuX2hpZGVCb3R0b21BcmVhKCk7XG4gICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLmlzSWRsZSA9IHRydWU7XG4gICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLmZpcmUoJ2Nsb3NlJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgcmVzdWx0IGxpc3QgYXJlYVxuICAgICAqL1xuICAgIHNob3dSZXN1bHRMaXN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi4kcmVzdWx0TGlzdC5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcbiAgICAgICAgfSwgMCk7XG5cbiAgICAgICAgdGhpcy5fc2hvd0JvdHRvbUFyZWEoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTW92ZSBmb2N1cyB0byBuZXh0IGl0ZW0sIGNoYW5nZSBpbnB1dCBlbGVtZW50IHZhbHVlIGFzIGZvY3VzIHZhbHVlLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmbG93IERpcmVjdGlvbiBieSBrZXkgY29kZVxuICAgICAqL1xuICAgIG1vdmVOZXh0TGlzdDogZnVuY3Rpb24oZmxvdykge1xuICAgICAgICB2YXIgZmxvd01hcCA9IHRoaXMuZmxvd01hcCxcbiAgICAgICAgICAgIHNlbGVjdEVsID0gdGhpcy5zZWxlY3RlZEVsZW1lbnQsXG4gICAgICAgICAgICBnZXROZXh0ID0gKGZsb3cgPT09IGZsb3dNYXAuTkVYVCkgPyB0aGlzLl9nZXROZXh0IDogdGhpcy5fZ2V0UHJldixcbiAgICAgICAgICAgIGdldEJvdW5kID0gKGZsb3cgPT09IGZsb3dNYXAuTkVYVCkgPyB0aGlzLl9nZXRGaXJzdCA6IHRoaXMuX2dldExhc3QsXG4gICAgICAgICAgICBrZXl3b3JkO1xuICAgICAgICB0aGlzLmlzTW92ZWQgPSB0cnVlO1xuXG4gICAgICAgIGlmIChzZWxlY3RFbCkge1xuICAgICAgICAgICAgc2VsZWN0RWwucmVtb3ZlQ2xhc3ModGhpcy5tb3VzZU92ZXJDbGFzcyk7XG4gICAgICAgICAgICBzZWxlY3RFbCA9IHRoaXMuc2VsZWN0ZWRFbGVtZW50ID0gZ2V0TmV4dC5jYWxsKHRoaXMsIHNlbGVjdEVsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGVjdEVsID0gdGhpcy5zZWxlY3RlZEVsZW1lbnQgPSBnZXRCb3VuZC5jYWxsKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAga2V5d29yZCA9IHNlbGVjdEVsLmZpbmQoJy5rZXl3b3JkLWZpZWxkJykudGV4dCgpO1xuXG4gICAgICAgIGlmIChzZWxlY3RFbCAmJiBrZXl3b3JkKSB7XG4gICAgICAgICAgICBzZWxlY3RFbC5hZGRDbGFzcyh0aGlzLm1vdXNlT3ZlckNsYXNzKTtcbiAgICAgICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnNldFZhbHVlKGtleXdvcmQpO1xuICAgICAgICAgICAgdGhpcy5fc2V0U3VibWl0T3B0aW9uKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZihzZWxlY3RFbCkge1xuICAgICAgICAgICAgICAgIHRoaXMubW92ZU5leHRMaXN0KGZsb3cpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYWdlIHRleHQgYnkgd2hldGhlciBhdXRvIGNvbXBsZXRlIHVzZSBvciBub3RcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzVXNlIG9uL29mZiDsl6zrtoBcbiAgICAgKi9cbiAgICBjaGFuZ2VPbk9mZlRleHQ6IGZ1bmN0aW9uKGlzVXNlKSB7XG4gICAgICAgIGlmIChpc1VzZSkge1xuICAgICAgICAgICAgdGhpcy4kb25PZmZUeHQudGV4dCgn7J6Q64+Z7JmE7ISxIOy8nOq4sCcpO1xuICAgICAgICAgICAgdGhpcy5oaWRlUmVzdWx0TGlzdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy4kb25PZmZUeHQudGV4dCgn7J6Q64+Z7JmE7ISxIOuBhOq4sCcpO1xuICAgICAgICB9XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGF1dG8gY29tcGxldGUgZXZlbnQgYmVsb25ncyB3aXRoIHJlc3VsdCBsaXN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXR0YWNoRXZlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLiRyZXN1bHRMaXN0LmJpbmQoJ21vdXNlb3ZlciBjbGljaycsICQucHJveHkoZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgaWYgKGUudHlwZSA9PT0gJ21vdXNlb3ZlcicpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vbk1vdXNlT3ZlcihlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZS50eXBlID09PSAnY2xpY2snKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fb25DbGljayhlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcykpO1xuXG4gICAgICAgIGlmICh0aGlzLiRvbk9mZlR4dCkge1xuICAgICAgICAgICAgdGhpcy4kb25PZmZUeHQuYmluZCgnY2xpY2snLCAkLnByb3h5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3VzZUF1dG9Db21wbGV0ZSgpO1xuICAgICAgICAgICAgfSwgdGhpcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgJChkb2N1bWVudCkuYmluZCgnY2xpY2snLCAkLnByb3h5KGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGlmIChlLnRhcmdldC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09ICdodG1sJykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaGlkZVJlc3VsdExpc3QoKTtcbiAgICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIEhpZ2hsaWdodCBrZXkgd29yZFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0bXBsU3RyIFRlbXBsYXRlIHN0cmluZ1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhT2JqIFJlcGxhY2Ugc3RyaW5nIG1hcFxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hcHBseVRlbXBsYXRlOiBmdW5jdGlvbih0bXBsU3RyLCBkYXRhT2JqKSB7XG4gICAgICAgIHZhciB0ZW1wID0ge30sXG4gICAgICAgICAgICBrZXlTdHI7XG5cbiAgICAgICAgZm9yIChrZXlTdHIgaW4gZGF0YU9iaikge1xuICAgICAgICAgICAgdGVtcFtrZXlTdHJdID0gZGF0YU9ialtrZXlTdHJdO1xuICAgICAgICAgICAgaWYgKGtleVN0ciA9PT0gJ3N1YmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdGVtcC5zdWJqZWN0ID0gdGhpcy5faGlnaGxpZ2h0KGRhdGFPYmouc3ViamVjdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghZGF0YU9iai5wcm9wZXJ0eUlzRW51bWVyYWJsZShrZXlTdHIpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRtcGxTdHIgPSB0bXBsU3RyLnJlcGxhY2UobmV3IFJlZ0V4cChcIkBcIiArIGtleVN0ciArIFwiQFwiLCBcImdcIiksIHRlbXBba2V5U3RyXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRtcGxTdHI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBhcHBsaWVkIGhpZ2hsaWdodCBlZmZlY3Qga2V5IHdvcmRcbiAgICAgKiAodGV4dDogTmlrZSBhaXIgIC8gIHF1ZXJ5IDogW05pa2VdIC8gUmVzdWx0IDogPHN0cm9uZz5OaWtlIDwvc3Ryb25nPmFpclxuICAgICAqIHRleHQgOiAncmhkaWRkbOyZgCDqs6DslpHsnbQnIC8gcXVlcnkgOiAgW3JoZGlkZGwsIOqzoOyWkeydtF0gLyDrpqzthLTqsrDqs7wgPHN0cm9uZz5yaGRpZGRsPC9zdHJvbmc+7JmAIDxzdHJvbmc+6rOg7JaR7J20PC9zdHJvbmc+XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRleHQgSW5wdXQgc3RyaW5nXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2hpZ2hsaWdodDogZnVuY3Rpb24odGV4dCkge1xuICAgICAgICB2YXIgcXVlcnlzID0gdGhpcy5hdXRvQ29tcGxldGVPYmoucXVlcnlzLFxuICAgICAgICAgICAgcmV0dXJuU3RyO1xuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaChxdWVyeXMsIGZ1bmN0aW9uKHF1ZXJ5KSB7XG5cbiAgICAgICAgICAgIGlmICghcmV0dXJuU3RyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuU3RyID0gdGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVyblN0ciA9IHRoaXMuX21ha2VTdHJvbmcocmV0dXJuU3RyLCBxdWVyeSk7XG5cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIHJldHVybiAocmV0dXJuU3RyIHx8IHRleHQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb250YWluIHRleHQgYnkgc3Ryb25nIHRhZ1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0IFJlY29tbWVuZCBzZWFyY2ggZGF0YSAg7LaU7LKc6rKA7IOJ7Ja0IOuNsOydtO2EsFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBxdWVyeSBJbnB1dCBrZXl3b3JkXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTdHJvbmc6IGZ1bmN0aW9uKHRleHQsIHF1ZXJ5KSB7XG4gICAgICAgIGlmICghcXVlcnkgfHwgcXVlcnkubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGVzY1JlZ0V4cCA9IG5ldyBSZWdFeHAoXCJbLiorP3woKVxcXFxbXFxcXF17fVxcXFxcXFxcXVwiLCBcImdcIiksXG4gICAgICAgICAgICB0bXBTdHIgPSBxdWVyeS5yZXBsYWNlKC8oKS9nLCBcIiBcIikucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgXCJcIiksXG4gICAgICAgICAgICB0bXBDaGFyYWN0ZXJzID0gdG1wU3RyLm1hdGNoKC9cXFMvZyksXG4gICAgICAgICAgICB0bXBDaGFyTGVuID0gdG1wQ2hhcmFjdGVycy5sZW5ndGgsXG4gICAgICAgICAgICB0bXBBcnIgPSBbXSxcbiAgICAgICAgICAgIHJldHVyblN0ciA9ICcnLFxuICAgICAgICAgICAgcmVnUXVlcnksXG4gICAgICAgICAgICBjbnQsXG4gICAgICAgICAgICBpO1xuXG4gICAgICAgIGZvciAoaSA9IDAsIGNudCA9IHRtcENoYXJMZW47IGkgPCBjbnQ7IGkrKykge1xuICAgICAgICAgICAgdG1wQXJyLnB1c2godG1wQ2hhcmFjdGVyc1tpXS5yZXBsYWNlKC9bXFxTXSsvZywgXCJbXCIgKyB0bXBDaGFyYWN0ZXJzW2ldLnRvTG93ZXJDYXNlKCkucmVwbGFjZShlc2NSZWdFeHAsIFwiXFxcXCQmXCIpICsgXCJ8XCIgKyB0bXBDaGFyYWN0ZXJzW2ldLnRvVXBwZXJDYXNlKCkucmVwbGFjZShlc2NSZWdFeHAsIFwiXFxcXCQmXCIpICsgXCJdIFwiKS5yZXBsYWNlKC9bXFxzXSsvZywgXCJbXFxcXHNdKlwiKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0bXBTdHIgPSBcIihcIiArIHRtcEFyci5qb2luKFwiXCIpICsgXCIpXCI7XG4gICAgICAgIHJlZ1F1ZXJ5ID0gbmV3IFJlZ0V4cCh0bXBTdHIpO1xuXG4gICAgICAgIGlmIChyZWdRdWVyeS50ZXN0KHRleHQpKSB7XG4gICAgICAgICAgICByZXR1cm5TdHIgPSB0ZXh0LnJlcGxhY2UocmVnUXVlcnksICc8c3Ryb25nPicgKyBSZWdFeHAuJDEgKyAnPC9zdHJvbmc+Jyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmV0dXJuU3RyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIGZpcnN0IHJlc3VsdCBpdGVtXG4gICAgICogQHJldHVybiB7RWxlbWVudH1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRGaXJzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcmRlclN0YWdlKHRoaXMuZmxvd01hcC5GSVJTVCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgbGFzdCByZXN1bHQgaXRlbVxuICAgICAqIEByZXR1cm4ge0VsZW1lbnR9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0TGFzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcmRlclN0YWdlKHRoaXMuZmxvd01hcC5MQVNUKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHdoZXRoZXIgZmlyc3Qgb3IgbGFzdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIEZpcnN0L2VuZCBlbGVtZW50IHR5cGVcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vcmRlclN0YWdlOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHR5cGUgPSAodHlwZSA9PT0gdGhpcy5mbG93TWFwLkZJUlNUKSA/ICdmaXJzdCcgOiAnbGFzdCc7XG5cbiAgICAgICAgaWYgKHRoaXMuJHJlc3VsdExpc3QgJiZcbiAgICAgICAgICAgIHRoaXMuJHJlc3VsdExpc3QuY2hpbGRyZW4oKSAmJlxuICAgICAgICAgICAgdGhpcy4kcmVzdWx0TGlzdC5jaGlsZHJlbigpLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJHJlc3VsdExpc3QuY2hpbGRyZW4oKVt0eXBlXSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gbmV4dCBlbGVtZW50IGZyb20gc2VsZWN0ZWQgZWxlbWVudFxuICAgICAqIElmIG5leHQgZWxlbWVudCBpcyBub3QgZXhpc3QsIHJldHVybiBmaXJzdCBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudCBmb2N1c2VkIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtFbGVtZW50fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldE5leHQ6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29yZGVyRWxlbWVudCh0aGlzLmZsb3dNYXAuTkVYVCwgZWxlbWVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBwcmV2aW91cyBlbGVtZW50IGZyb20gc2VsZWN0ZWQgZWxlbWVudFxuICAgICAqIElmIHByZXZpb3VzIGVsZW1lbnQgaXMgbm90IGV4aXN0LCByZXR1cm4gdGhlIGxhc3QgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnQgZm9jdXNlZCBlbGVtZW50XG4gICAgICogQHJldHVybiB7RWxlbWVudH1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRQcmV2OiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcmRlckVsZW1lbnQodGhpcy5mbG93TWFwLlBSRVYsIGVsZW1lbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gcHJldmlvdXMgb3IgbmV4dCBlbGVtZW50IGJ5IGRpcmVjdGlvbi5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBUaGUgZGlyZWN0aW9uIHR5cGUgZm9yIGZpbmRpbmcgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudCBmb2N1c2VkIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vcmRlckVsZW1lbnQ6IGZ1bmN0aW9uKHR5cGUsIGVsZW1lbnQpIHtcbiAgICAgICAgaWYgKCFuZS51dGlsLmlzRXhpc3R5KGVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciAkY3VycmVudCA9ICQoZWxlbWVudCksXG4gICAgICAgICAgICBpc05leHQgPSAodHlwZSA9PT0gdGhpcy5mbG93TWFwLk5FWFQpLFxuICAgICAgICAgICAgb3JkZXI7XG5cbiAgICAgICAgaWYgKCRjdXJyZW50LmNsb3Nlc3QodGhpcy5yZXN1bHRTZWxlY3RvcikpIHtcbiAgICAgICAgICAgIG9yZGVyID0gaXNOZXh0ID8gZWxlbWVudC5uZXh0KCkgOiBlbGVtZW50LnByZXYoKTtcbiAgICAgICAgICAgIGlmIChvcmRlci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3JkZXI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBpc05leHQgPyB0aGlzLl9nZXRGaXJzdCgpIDogdGhpcy5fZ2V0TGFzdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCB3aGV0aGVyIGF1dG8gY29tcGxldGUgdXNlIG9yIG5vdCBhbmQgY2hhbmdlIHN3aXRjaCdzIHN0YXRlLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3VzZUF1dG9Db21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpc1VzZSA9IHRoaXMuYXV0b0NvbXBsZXRlT2JqLmlzVXNlQXV0b0NvbXBsZXRlKCk7XG4gICAgICAgIHRoaXMuY2hhbmdlT25PZmZUZXh0KGlzVXNlKTtcbiAgICAgICAgdGhpcy5hdXRvQ29tcGxldGVPYmouc2V0Q29va2llVmFsdWUoIWlzVXNlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyBhdXRvIGNvbXBsZXRlIHN3aXRjaCBhcmVhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2hvd0JvdHRvbUFyZWE6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy4kb25PZmZUeHQpIHtcbiAgICAgICAgICAgIHRoaXMuJG9uT2ZmVHh0LnNob3coKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIGF1dG8gY29tcGxldGUgc3dpdGNoIGFyZWFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9oaWRlQm90dG9tQXJlYTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLiRvbk9mZlR4dCkge1xuICAgICAgICAgICAgdGhpcy4kb25PZmZUeHQuaGlkZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSBhY3Rpb24gYXR0cmlidXRlIG9mIGZvcm0gZWxlbWVudCBhbmQgc2V0IGFkZGl0aW9uIHZhbHVlcyBpbiBoaWRkZW4gdHlwZSBlbGVtZW50cy5cbiAgICAgKiBAcGFyYW0ge2VsZW1lbnR9IFskdGFyZ2V0XSBTdWJtaXQgb3B0aW9ucyB0YXJnZXRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRTdWJtaXRPcHRpb246IGZ1bmN0aW9uKCR0YXJnZXQpIHtcbiAgICAgICAgdGhpcy5fY2xlYXJTdWJtaXRPcHRpb24oKTtcblxuICAgICAgICB2YXIgZm9ybUVsZW1lbnQgPSB0aGlzLm9wdGlvbnMuZm9ybUVsZW1lbnQsXG4gICAgICAgICAgICAkc2VsZWN0RmllbGQgPSAkdGFyZ2V0ID8gJCgkdGFyZ2V0KS5jbG9zZXN0KCdsaScpIDogJCh0aGlzLnNlbGVjdGVkRWxlbWVudCksXG4gICAgICAgICAgICBhY3Rpb25zID0gdGhpcy5vcHRpb25zLmFjdGlvbnMsXG4gICAgICAgICAgICBpbmRleCA9ICRzZWxlY3RGaWVsZC5hdHRyKCdkYXRhLWluZGV4JyksXG4gICAgICAgICAgICBjb25maWcgPSB0aGlzLm9wdGlvbnMubGlzdENvbmZpZ1tpbmRleF0sXG4gICAgICAgICAgICBhY3Rpb24gPSBhY3Rpb25zW2NvbmZpZy5hY3Rpb25dLFxuICAgICAgICAgICAgcGFyYW1zU3RyaW5nO1xuXG4gICAgICAgICQoZm9ybUVsZW1lbnQpLmF0dHIoJ2FjdGlvbicsIGFjdGlvbik7XG4gICAgICAgIHBhcmFtc1N0cmluZyA9ICRzZWxlY3RGaWVsZC5hdHRyKCdkYXRhLXBhcmFtcycpO1xuXG4gICAgICAgIHRoaXMuYXV0b0NvbXBsZXRlT2JqLnNldFBhcmFtcyhwYXJhbXNTdHJpbmcsIGluZGV4KTtcblxuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5maXJlKCdjaGFuZ2UnLCB7XG4gICAgICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgICAgICBhY3Rpb246IGFjdGlvbixcbiAgICAgICAgICAgIHBhcmFtczogcGFyYW1zU3RyaW5nXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXNldCBmb3JtIGVsZW1lbnQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2xlYXJTdWJtaXRPcHRpb246IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIGZvcm1FbGVtZW50ID0gdGhpcy5vcHRpb25zLmZvcm1FbGVtZW50LFxuICAgICAgICAgICAgaGlkZGVuV3JhcCA9ICQoZm9ybUVsZW1lbnQpLmZpbmQoJy5oaWRkZW4taW5wdXRzJyk7XG5cbiAgICAgICAgaGlkZGVuV3JhcC5odG1sKCcnKTtcbiAgICB9LFxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKiogRXZlbnQgSGFuZGxlcnMgKioqKioqKioqKioqKioqKioqKioqL1xuICAgIC8qKlxuICAgICAqIFJlc3VsdCBsaXN0IG1vdXNlb3ZlciBldmVudCBoYW5kbGVyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZSBFdmVudCBpbnN0YW5zZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uTW91c2VPdmVyOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciAkdGFyZ2V0ID0gJChlLnRhcmdldCksXG4gICAgICAgICAgICAkYXJyID0gdGhpcy4kcmVzdWx0TGlzdC5maW5kKCdsaScpLFxuICAgICAgICAgICAgc2VsZWN0ZWRJdGVtID0gJHRhcmdldC5jbG9zZXN0KCdsaScpO1xuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KCRhcnIsIGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgJCh2YWwpLnJlbW92ZUNsYXNzKHRoaXMubW91c2VPdmVyQ2xhc3MpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICBpZiAoc2VsZWN0ZWRJdGVtICYmIHNlbGVjdGVkSXRlbS5maW5kKCcua2V5d29yZC1maWVsZCcpLmxlbmd0aCkge1xuICAgICAgICAgICAgc2VsZWN0ZWRJdGVtLmFkZENsYXNzKHRoaXMubW91c2VPdmVyQ2xhc3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZWxlY3RlZEVsZW1lbnQgPSAkdGFyZ2V0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXN1bHQgbGlzdCBjbGljayBldm5ldCBoYW5kbGVyXG4gICAgICogU3VibWl0IGZvcm0gZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlIEV2ZW50IGluc3RhbnNlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25DbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgJHRhcmdldCA9ICQoZS50YXJnZXQpLFxuICAgICAgICAgICAgZm9ybUVsZW1lbnQgPSB0aGlzLm9wdGlvbnMuZm9ybUVsZW1lbnQsXG4gICAgICAgICAgICAkc2VsZWN0RmllbGQgPSAkdGFyZ2V0LmNsb3Nlc3QoJ2xpJyksXG4gICAgICAgICAgICAka2V5d29yZEZpZWxkID0gJHNlbGVjdEZpZWxkLmZpbmQoJy5rZXl3b3JkLWZpZWxkJyksXG4gICAgICAgICAgICBzZWxlY3RlZEtleXdvcmQgPSAka2V5d29yZEZpZWxkLnRleHQoKTtcblxuICAgICAgICB0aGlzLmF1dG9Db21wbGV0ZU9iai5zZXRWYWx1ZShzZWxlY3RlZEtleXdvcmQpO1xuXG4gICAgICAgIGlmIChmb3JtRWxlbWVudCAmJiBzZWxlY3RlZEtleXdvcmQpIHtcbiAgICAgICAgICAgIHRoaXMuX3NldFN1Ym1pdE9wdGlvbigkdGFyZ2V0KTtcbiAgICAgICAgICAgIGZvcm1FbGVtZW50LnN1Ym1pdCgpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVzdWx0TWFuYWdlcjtcbiJdfQ==
