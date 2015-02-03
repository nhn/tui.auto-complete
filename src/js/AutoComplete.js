/**
 * @fileoverview 자동완성 컴포넌트의 모든 구성요소들을 총괄하는 최상위 클래스
 * @version 1.1.0
 * @author FE개발팀 이제인<jein.yi@nhnent.com>
*/

ne = window.ne || {};
ne.component = ne.component || {};

/**
 @constructor
 @param {Object} htOptions
 @example
    var autoCompleteObj = new ne.component.AutoComplete({
       "configId" : "Default"    // autoConfig.js에서 사용할 DataSet의 키값
    });
    /**
    작성되어야 하는 autoConfig.js 의 형식
    {
        Default = {
            // 자동완성 결과를 보여주는 엘리먼트
            'resultListElement': '._resultBox',

            // 검색어를 입력하는 input 엘리먼트
            'searchBoxElement':  '#ac_input1',

            // 입력한 검색어를 넘기기 위한 hidden element
            'orgQueryElement' : '#org_query',

            // on,off 버튼 엘리먼트
            'toggleBtnElement' : $("#onoffBtn"),

            // on,off 상태를 알리는 엘리먼트
            'onoffTextElement' : $(".baseBox .bottom"),

            // on, off상태일때 변경 이미지 경로
            'toggleImg' : {
                'on' : 'img/btn_on.jpg',
                'off' : 'img/btn_off.jpg'
            }

            // 컬렉션아이템별 보여질 리스트 겟수
            'viewCount' : 5,

            // 서브쿼리로 넘어갈 키 값들의 배열(컬렉션 명 별로 지정 할 수 있다, 따로 지정하지 않으면 defaults가 적용된다.)
            'subQuerySet': {
                'department': ['key1', 'key2', 'key3'],
                'srch_in_department': ['dep1', 'dep2', 'dep3'],
                'srch': ['ch1', 'ch2', 'ch3'],
                'defaults': ['cid']
            },

            // 컬렉션 타입 별로 표시될 마크업, 데이터가 들어갈 부분은 @key@ 형식으로 사용한다.(지정하지 않으면, defaults가 적용된다.)
            // 형식은 수정 가능하지만, keyword-field는 키워드가 들어가는 부분에 필수로 들어가야함. 단 title에는 들어가면 안됨.
            'templateElement' :  {
                'department':   '<li class="department">' +
                                    '<span class="slot-field">Shop the</span> ' +
                                    '<a href="#" class="keyword-field">@subject@</a> ' +
                                    '<span class="slot-field">Store</span>' +
                                '</li>',
                'srch': '<li class="srch"><span class="keyword-field">@subject@</span></li>',
                'srch_in_department':   '<li class="inDepartment">' +
                                             '<a href="#" class="keyword-field">@subject@</a> ' +
                                             '<span class="slot-field">in </span>' +
                                             '<span class="depart-field">@department@</span>' +
                                         '</li>',
                'title': '<li class="title"><strong>@subject@</strong></li>',
                'defaults': '<li><a href="#" class="keyword-field">@subject@</a></li>'
            },

            // 컬렉션 별 템플릿에서 사용하고 있는 변수들을 나열한다. (지정하지 않으면defaults가 적용된다)
            'templateAttribute': {
                'defaults': ['subject'],
                'department': ['subject'],
                'srch_in_department': ['subject', 'department']
            },

            // 컬렉션 타입별 form action 을 지정한다. (지정하지 않으면 defaults가 적용된다)
            actions: {
                'department': "http://www.fashiongo.net/catalog.aspx",
                'defaults': "http://www.fashiongo.net/search2.aspx"
            },

            // 타이틀을 보일지 여부
            'useTitle': false,

            // 검색창을 감싸고 있는 form앨리먼트
            'formElement' : '#ac_form1',

            // 자동완성을 끄고 켤때 사용되는 쿠키명
            'cookieName' : "usecookie",

            // 선택된 엘리먼트에 추가되는 클래스명
            'mouseOverClass' : 'emp',

            // 자동완성API url
            'searchUrl' : 'http://10.24.136.172:20011/ac',

            // 자동완성API request 설정
            'searchApi' : {
                'st' : 111,
                'r_lt' : 111,
                'r_enc' : 'UTF-8',
                'q_enc' : 'UTF-8',
                'r_format' : 'json'
            }
        }
    }

*/
ne.component.AutoComplete = ne.util.defineClass(/**@lends ne.component.AutoComplete.prototype */{

    flowMap: {
        'NEXT': 'next',
        'PREV': 'prev',
        'FIRST': 'first',
        'LAST': 'last'
    },

    /**
     * 초기화 함수
     * @param {Object} htOptions 함수의 argument. autoConfig의 키값 정보가 들어온다.
     */
    init: function(htOptions) {
        this.options = {};

        var cookieValue,
            autoComplete = ne.component.AutoComplete,
            defaultCookieName = '_atcp_use_cookie';

        if (!this._checkValidation(htOptions)) {
            return;
        }

        if (!this.options.toggleImg || !this.options.onoffTextElement) {
            // toggleImg 나 onoffTextElement 가 정의되지 않은 경우.(항상 자동완성 사용)
             this.isUse = true;

            //자동완성 끄기,켜기 $onOffTxt의미없으므로 옵션값 삭제
            delete this.options.onoffTextElement;
        } else {
            //자동완성을 끄기, 켜기 기능을 이용하는 경우 설정된 쿠키값을 읽어온다
            cookieValue = $.cookie(this.options.cookieName);

            //명시적으로 쿠키값이 true로 설정되어 있거나 컴포넌트 최초 로딩시 쿠키값이 없을 경우에는
            //isUse값을 true로 설정하여 자동완성 컴포넌트의 기능을 이용 가능하도록 한다.
            this.isUse = !!(cookieValue === 'use' || !cookieValue);
        }

        //cookieName 체크하여 설정하지 않았다면 defaultName으로 설정
        if (!this.options.cookieName) {
            this.options.cookieName = defaultCookieName;
        }

        //AutoComplete 내부에서 사용할 InputManager, ViewManager, ResultManager 객체 변수 설정
        this.dataManager = new autoComplete.DataManager(this, this.options);
        this.inputManager = new autoComplete.InputManager(this, this.options);
        this.resultManager = new autoComplete.ResultManager(this, this.options);

        /**
         * 사용자가 입력한 쿼리 데이터와, 한글값으로 매칭되는 값이 있을경우 함께 넘어오는 배열을 저장함.
         * @type {null}
         */
        this.querys = null;

        this.setToggleBtnImg(this.isUse);
        this.setCookieValue(this.isUse);
    },

    /**
     * 자동완성 컴포넌트 사용을 위해 설정하는 설정 파일 내용을 검증 및 필수 항목을 체크한다.
     * @param {Object} htOptions config의 설정 내용
     * @return {Boolean} 설정 파일의 유효성 여부
     * @private
     */
    _checkValidation: function(htOptions) {
        var config,
            configArr;

        //유효한 config인지 체크
        config = htOptions.config;

        if (!ne.util.isExisty(config)) {
            alert('유효한 config가 아닙니다 : ' + config);
            return false;
        }

        configArr = ne.util.keys(config);

        var configLen = configArr.length,
            i,
            requiredFields = [
                'resultListElement',//config요소 중에 필수 입력 항목 필드들
                'searchBoxElement' ,
                'orgQueryElement',
                'subQuerySet',
                'templateAttribute',
                'templateElement',
                'actions',
                'formElement',
                'searchUrl',
                'searchApi'
            ],
            checkedFields = [];                     //필수체크 항목 저장하는 임시 배열

        for (i = 0; i < configLen; i++) {
            if (ne.util.inArray(configArr[i], requiredFields, 0) >= 0) {
                checkedFields.push(configArr[i]);
            }
        }

        //필수항목 입력했는지 체크
        ne.util.forEach(requiredFields, function(el) {
            if (ne.util.inArray(el, checkedFields, 0) === -1) {
                alert('설정값이 없습니다 : ' + el);
                return false;
            }

            // Url이 별도로 빠짐
            //searchApi의 경우 필수 파라미터(url, st, r_lt)를 한번 더 체크.
            if (el === 'searchApi' && config['searchApi']) {
                if (!config.searchUrl ||
                    !config.searchApi.st ||
                    !config.searchApi.r_lt) {
                    alert('searchApi항목의 필수값이 없습니다.');
                    return false;
                }
            }
        });

        //설정값 읽어와서 options변수에 저장
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
     * DataManager에 keyword와 함께 서버로 데이터 요청을 하도록 한다.
     * @param {String} keyword 자동완성 서버api로 전송할 키워드
     */
    request: function(keyword) {
        this.dataManager.request(keyword);
    },

    /**
     * 검색창에 현재 입력된 키워드 스트링을 반환한다.
     * @return {String} 검색창에 입력된 값
     */
    getValue: function() {
        return this.inputManager.getValue();
    },

    /**
     * 파라미터로 전달된 자동완성 키워드를 inputManager에 전달하여 검색창에 노출되도록 한다.
     * @param {String} keyword 검색창에 노출할 키워드
     */
    setValue: function(keyword) {
        this.inputManager.setValue(keyword);
    },

    /**
     * 추가 파라미터로 전달 될 자동완성 파라미터들을 생성하도록 inputManger에 요청
     * @param {string} paramStr 함께 넘어갈 파라미터 배열의 문자열 형태(&로 연결되어 있음)
     */
    setParams: function(paramStr, type) {
        this.inputManager.setParams(paramStr, type);
    },

    /**
     * ajax통신하여 서버로부터 내려온 데이터를 화면에 결과를 그리도록 요청한다.
     * @param {Array} dataArr ajax통신 후 서버로부터 받은 검색 결과 배열
     */
    setServerData: function(dataArr) {
        this.resultManager.draw(dataArr);
    },

    /**
     * 자동완성 사용여부에 대한 쿠키값을 세팅하고 토글버튼을 변경한다.
     * @param {Boolean} isUse 자동완성 사용여부
     */
    setCookieValue: function(isUse) {
        $.cookie(this.options.cookieName, isUse ? 'use' : 'notUse');
        this.isUse = isUse;
        this.setToggleBtnImg(isUse);
    },

    /**
     * 사용자가 입력한 값과, 매칭되는 한글값을 저장한다.
     * @param {array} querys 응답받은 쿼리값들
     */
    setQuerys: function(querys) {
        this.querys = [].concat(querys);
    },

    /**
     *  자동완성을 사용하고 있는지 여부 리턴
     *  @return {Boolean} 자동완성 사용여부
     */
    isUseAutoComplete: function() {
        return this.isUse;
    },

    /**
     * 결과 리스트 영역이 show상태인지 hide상태인지 여부를 리턴한다.
     * @return {Boolean} 결과 리스트 영역이 보이는 상태인지에 대한 여부
     */
    isShowResultList: function() {
        return this.resultManager.isShowResultList();
    },

    /**
     * 검색창의 토글버튼 이미지를 변경하도록 요청한다.
     * @param {Boolean} isUse 자동완성 사용 유무
     */
    setToggleBtnImg: function(isUse) {
        this.inputManager.setToggleBtnImg(isUse);
    },

    /**
     * 검색결과 영역 리스트가 숨겨지도록 요청한다.
     */
    hideResultList: function() {
        if (this.isUseAutoComplete()) {
            this.resultManager.hideResultList();
        }
    },

    /**
     * 검색결과 영역 리스트가 보여지도록 요청한다.
     */
    showResultList: function() {
        if (this.isUseAutoComplete()) {
            this.resultManager.showResultList();
        }
    },

    /**
     * resultManager의 moveNextList함수를 호출하여 자동완성 검색어 리스트중에서 이전 or 다음 항목으로 이동한다.
     * @param {string} flow 이동한 방향을 정한다.
     */
    moveNextList: function(flow) {
        this.resultManager.moveNextList(flow);
    },

    /**
     * '자동완성 끄기 | 자동완성 켜기' 텍스트를 설정하도록 resultManager에 요청한다.
     * @param {Boolean} isUse true로 설정되면 '자동완성 끄기' 로 하단에 노출된다.
     */
    changeOnOffText: function(isUse) {
        this.resultManager.changeOnOffText(isUse);
    },

    /**
     * 자동완성 검색어 리스트의 display상태를 리턴한다.
     * @return {Boolean} 자동완성 검색어 리스트의 display상태
     */
    isVisibleResult: function() {
        return this.resultManager.isShowResultList();
    },

    /**
     * resultManager의 isMoved변수값을 리턴한다.
     * @return {Boolean} resultManager의 isMoved값
     */
    getMoved: function() {
        return this.resultManager.isMoved;
    },

    /**
     * resultManager의 isMoved변수값을 세팅한다.
     * @param {Boolean} isMoved변수값
     */
    setMoved: function(moved) {
        this.resultManager.isMoved = moved;
    }
});