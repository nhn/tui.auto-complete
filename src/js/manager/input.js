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
