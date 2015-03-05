(function() {
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
        // 설정용가능한 항목을 모두 설정한 config
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
            'on' : '../img/btn_on.jpg',
            'off' : '../img/btn_off.jpg'
        },

        // 컬렉션아이템별 보여질 리스트 겟수
        'viewCount' : 3,

        // 서브쿼리로 넘어갈 키 값들의 배열(컬렉션 명 별로 지정 할 수 있다, 따로 지정하지 않으면 defaults가 적용된다.)
        'subQuerySet': [
            ['key1', 'key2', 'key3'],
            ['dep1', 'dep2', 'dep3'],
            ['ch1', 'ch2', 'ch3'],
            ['cid']
        ],

        // 컬렉션 인덱스별 자동완성 리스트의 config를 설정한다.
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

        // 컬렉션 타입 별로 표시될 마크업, 데이터가 들어갈 부분은 @key@ 형식으로 사용한다.(지정하지 않으면, defaults가 적용된다.)
         // 형식은 수정 가능하지만, keyword-field는 키워드가 들어가는 부분에 필수로 들어가야함. 단 title에는 들어가면 안됨.
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

         // 컬렉션 타입별 form action 을 지정한다. (지정하지 않으면 defaults가 적용된다)
         'actions': [
             "http://www.fashiongo.net/catalog.aspx",
             "http://www.fashiongo.net/search2.aspx"
         ],

         // 컬렉션 타입별 추가 스테틱한 옵션들을 설정
         'staticParams':[
             "qt=ProductName",
             "at=TEST,bt=ACT"
         ],

         // 타이틀을 보일지 여부
         'useTitle': true,

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
                'template',
                'listConfig',
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
ne.util.CustomEvents.mixin(ne.component.AutoComplete);
/**
 * @fileoverview 자동완성 컴포넌트 중에서 입력된 값으로 검색 API와 연동하여 자동완성 검색 결과를 받아오는 클래스
 * @version 1.1.0
 * @author FE개발팀 이제인<jein.yi@nhnent.com>
 */

ne = window.ne || {};
ne.component = ne.component || {};


/**
 * 자동완성 컴포넌트 구성 요소중 검색api와 연동하여 데이터를 받아오는 클래스
 * 단독으로 생성될 수 없으며 ne.component.AutoComplete클래스 내부에서 생성되어 사용된다.
 * @constructor
 */
ne.component.AutoComplete.DataManager = ne.util.defineClass(/**@lends ne.component.AutoComplete.DataManager.prototype */{
    init: function(autoCompleteObj, options) {
        if (arguments.length != 2) {
            alert('argument length error !');
            return;
        }

        // argument로 넘어온 AutoComplete 클래스와 사용자가 지정한 옵션값을 내부 변수로 저장한다.
        this.autoCompleteObj = autoCompleteObj;
        this.options = options;
    },

    /**
     * 검색서버에 입력값을 보내어 ajax통신으로 자동완성 검색어 리스트를 받아온다.
     * @param {String} keyword 검색서버에 요청할 키워드 스트링
     */
    request: function(keyword) {
        //혹시라도 검색용 api가 설정되지 않았다면 request하지 않고 바로 종료한다.
        if (!this.options.searchApi) {
            return;
        }

        // 공백을 제거한 키워드
        var rsKeyWrod = keyword.replace(/\s/g, '');

        if (!keyword || !rsKeyWrod) {
            this.autoCompleteObj.hideResultList();
            return;
        }

        //request를 위한 변수 세팅
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

        ne.util.ajax.request(this.options.searchUrl, {
            'dataType': 'jsonp',
            'jsonpCallback': 'dataCallback',
            'data': requestParam,
            'type': 'get',
            'success': ne.util.bind(function(dataObj) {
                try {
                    keyDatas = this._getCollectionData(dataObj);
                    // 응답값으로 돌아온 입력값(한글을 영문으로 맞춰놓고 잘못 입력 했을 경우에 오는 값 포함)을 전역에서 쓸수 있게 autoComplete에 셋팅
                    this.autoCompleteObj.setQuerys(dataObj.query);
                    // 키 값으로 뽑아낸 데이터들을 resultManager에 전달하여 뿌려준다.
                    this.autoCompleteObj.setServerData(keyDatas);
                } catch (e) {
                    throw new Error('[DataManager] 서버에서 정보를 받을 수 없습니다. ' , e);
                }
            }, this)
        });
    },
    /**
     * 화면에 뿌려질 컬렉션 데이터를 생성한다.
     * @param dataObj
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
            // 컬렉션 아이템 생성
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
     * 화면에 뿌려질 컬렉션의 아이템 데이터를 생성한다.
     * @param itemSet
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
        }), this, 200);
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
        this.autoCompleteObj.request(this.$searchBox.val());
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
/**
 * @fileoverview 자동완성 컴포넌트 중에서 검색 결과 영역에 대한 기능을 제공하는 클래스
 * @version 1.1.0
 * @author FE개발팀 이제인<jein.yi@nhnent.com>
 */

ne = window.ne || {};
ne.component = ne.component || {};

/**
 * 자동완성 컴포넌트의 구성 요소중 검색어 검색 결과영역에 관련된 클래스. <br>
 * 단독으로 생성될 수 없으며 ne.component.AutoComplete클래스 내부에서 생성되어 사용된다...
 * @constructor
 */
ne.component.AutoComplete.ResultManager = ne.util.defineClass(/** @lends ne.component.AutoComplete.ResultManager.prototype */{
    /**
     * 초기화 함수
     */
    init: function(autoCompleteObj, options) {
        this.autoCompleteObj = autoCompleteObj;
        this.options = options;

        //Config.js 에 설정된 element 정보 가져와서 내부 변수로 세팅.
        this.$resultList = this.options.resultListElement;
        this.resultSelector = this.options.resultListElement;
        this.viewCount = this.options.viewCount || 10;
        this.$onOffTxt = this.options.onoffTextElement;
        this.mouseOverClass = this.options.mouseOverClass;
        this.flowMap = this.autoCompleteObj.flowMap;

        this._attachEvent();

        //현재 선택된 li 엘리먼트
        this.selectedElement = null;

        //검색어 리스트에서 키보드 이용해서 위,아래로 움직였는지 나타내는 플래그
        this.isMoved = false;
    },

    /**
     * AutoComplete의 setServerData함수에 의해 호출되어 서버로부터 전달받은 자동완성 데이터를 화면에 그린다.
     * @param {Array} dataArr 서버로부터 받은 자동완성 데이터 배열
     */
    draw: function(dataArr) {
        //이전 결과 지운다.
        this.$resultList.html('');
        this.$resultList.hide();
        this.selectedElement = null;

        var template = this.options.template;
        var config = this.options.listConfig;
        var tmpl, tmplStr, tmplAttr;

        //tmplStr = this.options.templateElement,
        //    tmplAttr = this.options.templateAttribute,

        var useTitle = (this.options.useTitle && !!template.title),
            dataLength = dataArr.length,
            len = dataLength,
            index,
            type,
            tmplValue,
            $el,
            i;

        if (dataLength < 1) {
            this._hideBottomArea();
        }

        for (i = 0; i < len; i++) {
            type = dataArr[i].type;
            index = dataArr[i].index;

            tmpl = config[index] ? template[config[index].template] : template.defaults;

            // 타이틀일 경우는 타이틀로 치환한다.
            if (type === 'title') {
                tmpl = template.title;
                if ($el) {
                    $el.addClass('lastitem');
                }
            }
            // 타이틀을 사용하지 않는 옵션일땐 타이틀을 붙이지 않는다.
            if (!useTitle && type === 'title') {
                continue;
            }

            tmplValue = this._getTmplData(tmpl.attr, dataArr[i]);
            $el = $(this._applyTemplate(tmpl.element, tmplValue));
            // 파라미터를 넘기기위한 값들
            $el.attr('data-params', tmplValue.params);
            $el.attr('data-index', index);
            this.$resultList.append($el);
        }

        //결과 영역을 노출한다.
        this.$resultList.show();

        //자동완성 켜기 영역을 보여준다.
        this._showBottomArea();
    },

    /**
     * 자동완성 데이터를 템플릿화 한다.
     * @param {array} attrs 템플릿 요소들
     * @param {string|Object} data 텔플릿팅 할 데이터
     * @return {object} template화 된 데이터
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
     * 자동완성 검색 결과 영역이 펼쳐진 상태인지 반환한다.
     * @return {Boolean} 검색 결과 영역 펼쳐진 상태 여부
     */
    isShowResultList: function() {
        return (this.$resultList.css('display') === 'block');
    },

    /**
     * 결과 영역을 숨김 처리한다.
     */
    hideResultList: function() {
        this.$resultList.css('display', 'none');
        this._hideBottomArea();
        this.autoCompleteObj.fire('close');
    },

    /**
     * 결과 영역을 펼친다.
     */
    showResultList: function() {
        var self = this;
        setTimeout(function() {
            self.$resultList.css('display', 'block');
        }, 0);

        this._showBottomArea();
    },

    /**
     * 검색어 리스트에서 키보드 이용해서 아래로 움직일때 실행되며, 키보드로 움직여 포커스된 검색어를 검색창에 세팅한다.
     * 자동완성 결과에 따른 옵션값이 있을 경우, 맞게 세팅한다.
     * @param {string} flow 키보드에 따른 이동 방향(이전, 다음)
     */
    moveNextList: function(flow) {
        var flowMap = this.flowMap,
            selectEl = this.selectedElement,
            getNext = (flow === flowMap.NEXT) ? this._getNext : this._getPrev,
            getBound = (flow === flowMap.NEXT) ? this._getFirst : this._getLast;
        this.isMoved = true;

        // 현재 선택요소가 있는지에 따른, 다음 선택 요소를 설정한다.
        if (selectEl) {
            selectEl.removeClass(this.mouseOverClass);
            selectEl = this.selectedElement = getNext.call(this, selectEl);
        } else {
            selectEl = this.selectedElement = getBound.call(this);
        }

        //addClass 및 검색창에 검색어 세팅
        var keyword = selectEl.find('.keyword-field').text();

        if (selectEl && keyword) {
            selectEl.addClass(this.mouseOverClass);
            this.autoCompleteObj.setValue(keyword);
            this._setSubmitOption();
        } else {
            // 타이틀 부분을 걸러내기 위한 조건문.
            if(selectEl) {
                this.moveNextList(flow);
            }
        }
    },

    /**
     * 자동완성 사용여부에 따라 결과 리스트 하단에 [자동완성 끄기 | 자동완성 켜기] 텍스트를 설정한다.
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
     * 자동완성켜기, 검색결과 리스트에 이벤트 바인딩한다.
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

        //하단의 [자동완성 끄기 | 자동완성 켜기] 글자에 clickEvent binding.
        if (this.$onOffTxt) {
            this.$onOffTxt.bind('click', $.proxy(function() {
                this._useAutoComplete();
            }, this));
        }

        //document영역을 클릭하면 검색결과 리스트를 숨김처리.
        $(document).bind('click', $.proxy(function(e) {
            if (e.target.tagName.toLowerCase() !== 'html') {
                return;
            }
            this.hideResultList();
        }, this));
    },


    /**
     * 검색어 결과에 색상 및 볼드 처리를 위하여 템플릿을 적용한다.
     * @param {String} tmplStr
     * @param {Object} dataObj
     * @return {String} htmlString 템플릿이 적용된 검색어 결과 부분의 전체 html 스트링
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
     * draw가 실행될 때 호출되며 키워드 하이라이팅 처리를 한다.
     * (text: 나이키 에어  /  query : [나이키] / 리턴 결과 : <strong>나이키 </strong>에어
     * (0.3 추가) text : 'rhdiddl와 고양이' / query :  [rhdiddl, 고양이] / 리턴결과 <strong>rhdiddl</strong>와 <strong>고양이</strong>
     * @param {String} text 입력값 스트링
     * @return {String} 하이라이팅 처리된 전체 스트링
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
     * 텍스트에서 쿼리 부분을 strong 태그로 감싼다.
     * @param {String} text  추천검색어 데이터
     * @param {String} query 입력 키워드값
     * @return {String} <strong>태그 처리된 스트링
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

        tmpStr = "(" + tmpArr.join("") + ")"; // 괄호로 감싸주기
        regQuery = new RegExp(tmpStr);

        if (regQuery.test(text)) { //정규식에 적합한 문자셋이 있으면 , 치환 처리
            returnStr = text.replace(regQuery, '<strong>' + RegExp.$1 + '</strong>');
        }

        return returnStr;
    },

    /**
     * 자동완성 검색 결과중에 가장 처음의 항목을 리턴한다.
     * @return {Element} 키워드 엘리먼트
     * @private
     */
    _getFirst: function() {
        return this._orderStage(this.flowMap.FIRST);
    },

    /**
     * 자동완성 검색 결과중에 가장 마지막의 항목을 리턴한다.
     * @return {Element} 키워드 엘리먼트
     * @private
     */
    _getLast: function() {
        return this._orderStage(this.flowMap.LAST);
    },

    /**
     * 처음과 끝의 여부를 받아서 돌려준다.(중복 코드 방지를 위한 기능분리)
     * @param {string} type 처음/끝 요소 타입
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
     * 자동완성 검색 결과중에 현재 포커스된 엘리먼트를 기준으로 다음 엘리먼트를 찾아 리턴한다.
     * 찾고자 하는 다음 엘리먼트가 없으면 맨 처음 엘리먼트를 리턴한다.
     * @param {Element} element 현재의 엘리먼트
     * @return {Element} 현재 포커스된 엘리먼트의 다음 엘리먼트
     * @private
     */
    _getNext: function(element) {
        return this._orderElement(this.flowMap.NEXT, element);
    },

    /**
     * 자동완성 검색 결과중에 현재 포커스된 엘리먼트를 기준으로 이전 엘리먼트를 찾아 리턴한다.
     * 찾고자 하는 이전 엘리먼트가 없으면 맨 마지막 엘리먼트를 리턴한다.
     * @param {Element} element 현재의 엘리먼트
     * @return {Element} 현재 포커스된 엘리먼트의 이전 엘리먼트
     * @private
     */
    _getPrev: function(element) {
        return this._orderElement(this.flowMap.PREV, element);
    },

    /**
     * 이전/다음 값 정보를 받아 엘리먼트를 돌려준다.
     * 이전 다음을 이동시 중복 코드 방지를 위한 orderElement 분리
     * @param {string} type 받아올 타입 정보
     * @param {Element} element 현재 포커스된 엘리먼트의 이전/다음 엘리먼트
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
     * 자동완성을 사용 여부를 설정하고 켜키,끄기 텍스트를 토글 방식으로 변경한다.
     * @private
     */
    _useAutoComplete: function() {
        //AutoComplete에서 자동완성 사용여부에 대한 쿠키값을 가져온다.
        var isUse = this.autoCompleteObj.isUseAutoComplete();

        //위에서 가져온 쿠키값을 바탕으로 결과 리스트 하단의 자동완성끄기/켜기 텍스트 변경한다.
        this.changeOnOffText(isUse);

        //변경된 자동완성 사용여부 값을 다시 쿠키에 세팅한다.
        this.autoCompleteObj.setCookieValue(!isUse);
    },

    /**
     * 자동완성 끄기/켜기 영역을 노출한다.
     * @private
     */
    _showBottomArea: function() {
        if (this.$onOffTxt) {
            this.$onOffTxt.show();
        }
    },

    /**
     * 자동완성 끄기/켜기 영역을 숨김 처리한다.
     * @private
     */
    _hideBottomArea: function() {
        if (this.$onOffTxt) {
            this.$onOffTxt.hide();
        }
    },

    /**
     * 폼요소의 action을 변경하고, 선택한 값의 추가값인 input=hidden을 추가하여 넘길 값들을 세팅한다.
     * 이부분은 자동완성 컴포넌트 요소들을 선택할때, (키다운 이벤트 동작 혹은 마우스 클릭) 호출된다.
     * @param {element} [$target] 서브밋 옵션을 설정할 타겟
     * @private
     */
    _setSubmitOption: function($target) {
        this._clearSubmitOption();

        var formElement = this.options.formElement,
            $selectField = $target ? $($target).closest('li') : $(this.selectedElement),
            actions = this.options.actions,
            index = $selectField.attr('data-index'),
            config = this.options.listConfig[index],
            action = this.options.actions[config.action],
            paramsString;

        $(formElement).attr('action', action);
        paramsString = $selectField.attr('data-params');

        this.autoCompleteObj.setParams(paramsString, index);

        // 설정된 submit option을 돌려준다.
        this.autoCompleteObj.fire('change', {
            index: index,
            action: action,
            params: paramsString
        });
    },

    /**
     * 폼요소의 변경된 action및 추가값을 리셋시킨다.
     * 이부분은 자동완선 컴포넌트가 새로 불려올때와, 새로운 submitOption이 설정될때 호출된다.
     * @private
     */
    _clearSubmitOption: function(e) {
        var formElement = this.options.formElement,
            hiddenWrap = $(formElement).find('.hidden-inputs');

        hiddenWrap.html('');
    },

    /************************* Event Handlers *********************/
    /**
     * 검색결과 리스트가 mouseover되었을 때 실행되는 이벤트 핸들러
     * @param {Event} e 마우스오버 이벤트 객체
     * @private
     */
    _onMouseOver: function(e) {
        var $target = $(e.target),
            $arr = this.$resultList.find('li'),
            selectedItem = $target.closest('li');

        ne.util.forEachArray($arr, function(val) {
            $(val).removeClass(this.mouseOverClass);
        }, this);

        //마우스오버된 li 항목에 addClass
        if (selectedItem && selectedItem.find('.keyword-field').length) {
            selectedItem.addClass(this.mouseOverClass);
        }

        this.selectedElement = $target;
    },

    /**
     * 검색결과 리스트가 click되었을 때 실행되는 이벤트 핸들러.
     * 키워드를 클릭하여 검색 결과 페이지로 보낸다.
     * @param {Event} e 클릭 이벤트 객체
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
})();