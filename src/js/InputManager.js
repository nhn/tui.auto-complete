/**
 * @fileOverview 자동완성 컴포넌트 중에서 입력창에 대한 기능을 제공하는 클래스
 * @version 1.1.0
 * @author FE개발팀 이제인<jein.yi@nhnent.com>
 */


ne = window.ne || {};
ne.component = ne.component || {};


/**
 * 자동완성 컴포넌트의 구성 요소중 검색어 입력받는 입력창의 동작과 관련된 클래스. <br>
 * 단독으로 생성될 수 없으며 ne.component.AutoComplete클래스 내부에서 생성되어 사용된다.
 * @constructor
 */
ne.component.AutoComplete.InputManager = ne.util.defineClass(/**@lends ne.component.AutoComplete.InputManager.prototype */{

    keyCodeMap: {
        'TAB' : 9,
        'UP_ARROW' : 38,
        'DOWN_ARROW' : 40
    },

    /**
     * 초기화 함수
     * @param {Object} arguments
     */
    init: function(autoCompleteObj, options) {
        if (arguments.length != 2) {
            alert('argument length error !');
            return;
        }
        this.autoCompleteObj = autoCompleteObj;   //AutoComplete인스턴스를 저장한다.
        this.options = options;     //설정 옵션값을 저장한다.

        //Config에서 검색창 부분에서 필요한 엘리먼트 정보 가져온다.
        this.$searchBox = this.options.searchBoxElement;
        this.$toggleBtn = this.options.toggleBtnElement;
        this.$orgQuery = this.options.orgQueryElement;
        // 추가
        this.$formElement = this.options.formElement;

        //입력값 저장해두기
        this.inputValue = this.$searchBox.val();

        this._attachEvent();
    },


    /**
     * 검색창에 세팅된 키워드값을 리턴한다.
     * @return {String} 검색창에 세팅된 키워드
     */
    getValue: function() {
        return this.$searchBox.val();
    },

    /**
     * 검색창에 키워드값을 세팅한다.
     * @param {String} str 검색창에 세팅할 키워드 값
     */
    setValue: function(str) {
        this.inputValue = str;
        this.$searchBox.val(str);
    },

    /**
     * config에 설정되어 있는 param option 을 읽어 온뒤, param 을 설정하게 한다.
     * @param {array} options 배열로 받은 옵션들을 추가한다.
     * @param {number} index 키값을 설정하는 인덱스
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
     * 타입에 따른 inputElement 생성
     * @param {object} options 검색에 넘겨야 할 values 값들
     * @param {number} index 검색에서 쿼리키 값의 인덱스 값
     * @private
     */
    _createParamSetByType: function(options, index) {

        var key,
            val,
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

        if (!statics) {
            return;
        }

        // 스테이틱하게 붙은 파라미터들을 처리한다.
        statics = statics.split(',');
        ne.util.forEach(statics, function(value) {
            val = value.split("=");
            this.hiddens.append($('<input type="hidden" name="' + val[0] + '" value="' + val[1] + '" />'));

        }, this);

    },

    /**
     * hidden 요소 엘리먼트 들을 감싸는 래퍼를 생성한다.
     * @private
     */
    _createParamContainer: function() {
        this.hiddens = $('<div class="hidden-inputs"></div>');
        this.hiddens.hide();
        this.hiddens.appendTo($(this.$formElement));
    },

    /**
     * on/off 토글버튼 이미지를 변경한다.
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
     * 이벤트 바인딩 함수
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
     * 사용자가 입력했던 원본 쿼리값을 html hidden value로 세팅한다.
     * @param {String} str 사용자가 검색창에 입력한 검색어 스트링.
     * @private
     */
    _setOrgQuery: function(str) {
        this.$orgQuery.val(str);
    },

    /**************************** Event Handlers *****************************/
    /**
     * 검색창이 click 되었을 때 실행되는 이벤트 핸들러 함수
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
     * 검색창에 focus 되었을때 실행되는 이벤트 핸들러 함수
     * @private
     */
    _onFocus: function() {
        var self = this;

        //setInterval 설정해서 일정 시간 주기로 _onWatch 함수를 실행한다.
        this.intervalId = setInterval($.proxy(function() {
            self._onWatch();
        }), this, this.options.watchInterval);
    },

    /**
     * 주기적으로 호출되면서 검색창의 입력값 변경 여부를 판단한다.
     * @private
     */
    _onWatch: function() {
        //입력창에 입력된 값이 없으면 orgQueryElement 의 값도 초기화한다.
        if (this.$searchBox.val() === '') {
            this._setOrgQuery('');
            this.autoCompleteObj.setMoved(false);
        }

        //입력값에 변경이 생겼다면 ([예] 운 --> 운동 --> 운동화) 서버에 데이터 요청하도록 한다.
        if (this.inputValue !== this.$searchBox.val()) {
            this.inputValue = this.$searchBox.val();
            this._onChange();
        } else if (!this.autoCompleteObj.getMoved()) {
            this._setOrgQuery(this.$searchBox.val());
        }
    },

    /**
     * 검색창이 keyup되었을때 실행되는 이벤트 핸들러 함수
     * @private
     */
    _onKeyUp: function() {
        //입력값에 변경이 생겼다면 ( 소녀 --> 소녀시 --> 소녀시대 )
        //_onChange함수를 통해 서버에 데이터 요청하도록 한다.
        if (this.inputValue !== this.$searchBox.val()) {
            this.inputValue = this.$searchBox.val();
            this._onChange();
        }
    },

    /**
     * 검색어 입력창의 입력값에 변화가 생겼을 때 실행되는 함수
     * DataManager에 변경된 검색어를 전송하여 서버로 request하도록 한다.
     * @private
     */
    _onChange: function() {
        if (!this.autoCompleteObj.isUseAutoComplete()) {
            return;
        }
        // 자동완성 요청이 빠르게 들어갈때 응답이 순차적으로 오지 않을수 있으므로, 요청이 시작되면 응답값이 오기 전까지 다음 값을 저장시킨다.
        if (this.autoCompleteObj.isIdle) {
            this.autoCompleteObj.isIdle = false;
            this.autoCompleteObj.request(this.$searchBox.val());
        } else {
            this.autoCompleteObj.readyValue = this.$searchBox.val();
        }
    },

    /**
     * 검색창의 blur이벤트 처리하는 핸들러
     * @private
     */
    _onBlur: function() {
        //onFocus에서 설정했던 setInterval함수 해제
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    },

    /**
     * 검색창 keydown event 처리 핸들러.
     * 입력키값에 따라서 액션을 정의한다.
     * @param {Event} e keyDown 이벤트 객체
     * @private
     */
    _onKeyDown: function(e) {
        var autoCompleteObj = this.autoCompleteObj;

        if (!autoCompleteObj.isUseAutoComplete() ||
            !autoCompleteObj.isVisibleResult()) {
            return;
        }

        var code = e.keyCode,
            flow = null,
            codeMap = this.keyCodeMap,
            flowMap = autoCompleteObj.flowMap;

        //입력키값(TAB,방향키)에 따른 액션 정의
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
     * 토글버튼에 대한 click event를 처리한다.
     * @private
     */
    _onClickToggle: function() {
        if (!this.autoCompleteObj.isUseAutoComplete()) {
            //자동완성 끄기 상태일 때 : off 버튼 클릭하면 on버튼으로 바꾸고 자동완성 기능 켜기.

            //on버튼으로 바꾸기
            this.setToggleBtnImg(true);

            //자동완성 기능 켜기 (cookie설정)
            this.autoCompleteObj.setCookieValue(true);

            //텍스트를 [자동완성 끄기] 로 설정하기
            this.autoCompleteObj.changeOnOffText(false);
        } else {
            //자동완성 켜기 상태일 때 : on 버튼 클릭하면 off버튼으로 바꾸고 자동완성 기능 끄기.

            this.autoCompleteObj.hideResultList();

            this.setToggleBtnImg(false);
            this.autoCompleteObj.setCookieValue(false);
            this.autoCompleteObj.changeOnOffText(true);
        }
    }
});