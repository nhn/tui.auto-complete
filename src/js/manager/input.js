/**
 * @fileOverview Input is kind of manager module to support input element events and all of input functions.
 * @author NHN Entertainment FE dev team <dl_javascript@nhnent.com>
 */
var snippet = require('tui-code-snippet');
var $ = require('jquery');

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
