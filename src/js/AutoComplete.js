/**
 * @fileoverview Core element. All of auto complete objects belong with this object.
 * @version 1.1.0
 * @author NHN Entertainment FE Dev Team. Jein Yi<jein.yi@nhnent.com>
*/

ne.util.defineNamespace('ne.component');

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

         // Cookie name for toggle cookie
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
            autoComplete = ne.component.AutoComplete,
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

        this.dataManager = new autoComplete.DataManager(this, this.options);
        this.inputManager = new autoComplete.InputManager(this, this.options);
        this.resultManager = new autoComplete.ResultManager(this, this.options);

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
ne.util.CustomEvents.mixin(ne.component.AutoComplete);