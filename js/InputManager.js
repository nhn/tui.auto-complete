/**
 * @fileOverview  InputManager
 * @author ne10893
 * @version 0.1
 * @since 2014.07.21
 */


if (typeof ne.autoComplete == 'undefined') {
    ne.autoComplete = {};
}

var $searchBox, $toggleBtn, $orgQuery;

/**
 *
 * @constructor
 */
ne.autoComplete.InputManager = function() {
    if (arguments.length != 2) {
        alert('argument length error !');
    }
    this.autoCompleteObj = arguments[0];
    this.options = arguments[1];

    this.init();
};

ne.autoComplete.InputManager.prototype = {
    //keyCode 상수 정의
    keyCodMap: {
        'TAB' : 9,
        'UP_ARROW' : 38,
        'DOWN_ARROW' : 40
    },

    init: function() {
        //1. Config에서 검색창에 해당하는 엘리먼트 정보 가져옴.
        $searchBox = this.options['searchBoxElement'];
        $toggleBtn = this.options['toggleBtnElement'];
        $orgQuery = this.options['orgQueryElement'];

        //2. 입력값 최초 저장
        this.inputValue = $searchBox.val();

        //3. 이벤트 바인딩
        this._attachEvent();
    },


    /**
     * 검색창에 세팅된 키워드값을 리턴
     * @return {String} 검색창에 세팅된 키워드
     */
    getValue: function() {
        return $searchBox.val();
    },

    /**
     * 검색창에 키워드값 세팅
     * @param str {String} 검색창에 세팅할 키워드 값
     */
    setValue: function(str) {
        this.inputValue = str;
        $searchBox.val(str);
    },

    /**
     * on/off 토글버튼 이미지를 변경한다.
     * @param isUse {Boolean} 자동완성 사용 여부
     */
    setToggleBtnImg: function(isUse) {
        if (!this.options['toggleImg'] || !($toggleBtn)) return;

        isUse ? $toggleBtn.attr('src', this.options['toggleImg']['on']) : $toggleBtn.attr('src', this.options['toggleImg']['off']);
    },

    /************************************ Private Functions *******************************/
    /**
     * 이벤트 바인딩
     * @private
     */
    _attachEvent: function() {
        //검색창에 focus, keyup, keydown, click 이벤트 바인딩.
        $searchBox.bind('focus keyup keydown blur click', $.proxy(function(e) {
            if (e.type == 'focus') {
                this._onFocus(e);
            } else if (e.type == 'blur') {
                this._onBlur(e);
            } else if (e.type == 'keyup') {
                this._onKeyUp(e);
            } else if (e.type == 'keydown') {
                this._onKeyDown(e);
            } else if (e.type == 'click') {
                this._onClick();
            }
        }, this));

        //토글버튼에 click
        if ($toggleBtn) {
            $toggleBtn.bind("click", $.proxy(function(e) {
                this._onClickToggle();
            }, this));
        }
    },

    /**
     * 사용자가 입력했던 원본 입력값을 html hidden value로 세팅한다.
     * @param str {String} 사용자가 검색창에 입력한 검색어 스트링.
     */
    _setOrgQuery: function(str) {
        $orgQuery.val(str);
    },

    /********************************** Event Handlers ***********************************/
    /**
     * 검색창이 click되었을 때 실행되는 이벤트 핸들러 함수
     * @private
     */
    _onClick: function() {
        //입력된 키워드가 없거나 자동완성 기능 사용하지 않으면 펼칠 필요 없으므로 무효. 그냥 리턴하고 끝.
        if (!this.autoCompleteObj.getValue() || !this.autoCompleteObj.isUseAutoComplete()) {
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
    _onFocus: function(e) {
        //setInterval 설정해서 일정 시간 주기로 _onWatch 함수 실행
        var self = this;
        this.intervalId = setInterval($.proxy(function() {
            self._onWatch();
        }), this, 200);
    },

    /**
     * 검색창의 입력값 변경 여부를 판단.
     * @private
     */
    _onWatch: function() {
        //입력창에 입력된 값이 없으면 orgQueryElement 의 값도 초기화한다.
        if ($searchBox.val() == '') {
            this._setOrgQuery('');
            this.autoCompleteObj.setMoved(false);
        }

        //입력값에 변경이 생겼다면 ( 소녀 --> 소녀시 --> 소녀시대 ) AutoComplete.request() 이용해서 서버에 데이터 요청하도록 함
        if (this.inputValue != $searchBox.val()) {
            this.inputValue = $searchBox.val();
            this._onChange();
        } else {
            if (!this.autoCompleteObj.getMoved()) {
                this._setOrgQuery($searchBox.val());
            }
        }
    },

    /**
     * 검색창이 keyup되었을때 실행되는 이벤트 핸들러 함수
     * @private
     */
    _onKeyUp: function() {
        //입력값에 변경이 생겼다면 ( 소녀 --> 소녀시 --> 소녀시대 ) AutoComplete.request() 이용해서 서버에 데이터 요청하도록 함
        if (this.inputValue != $searchBox.val()) {
            this.inputValue = $searchBox.val();
            this._onChange();
        }
    },


    /**
     * 검색어 입력창의 입력값에 변화가 생겼을 때 실행되는 함수로, DataManager에 변경된 검색어를 전송하여 서버로 request하도록 한다.
     * @private
     */
    _onChange: function() {
        if (!this.autoCompleteObj.isUseAutoComplete()) {
            return;
        }

        this.autoCompleteObj.request($searchBox.val());
    },


    /**
     * 검색창의 blur이벤트 처리
     * @private
     */
    _onBlur: function(e) {
        //onFocus에서 설정했던 setInterval함수 해제
        this._stopInterval();
    },

    _stopInterval: function() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    },

    /**
     * 검색창 keydown event 처리
     * @private
     */
    _onKeyDown: function(e) {
        if (!this.autoCompleteObj.isUseAutoComplete() || !this.autoCompleteObj.isVisibleResult()) {
            return;
        }

        if (e.keyCode == this.keyCodMap['TAB']) {
            e.preventDefault();

            if (e.shiftKey) {
                this.autoCompleteObj.movePrevKeyword(e);
            } else {
                this.autoCompleteObj.moveNextKeyword(e);
            }
        } else if (e.keyCode == this.keyCodMap['DOWN_ARROW']) {
            this.autoCompleteObj.moveNextKeyword(e);
        } else if (e.keyCode == this.keyCodMap['UP_ARROW']) {
            this.autoCompleteObj.movePrevKeyword(e);
        }
    },


    /**
     * 토글버튼 click event 처리
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
}