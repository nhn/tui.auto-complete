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
