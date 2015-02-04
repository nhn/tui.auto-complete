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

        var useTitle = this.options.useTitle,
            dataLength = dataArr.length,
            len = dataLength,
            index,
            type,
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
            }
            // 타이틀을 사용하지 않는 옵션일땐 타이틀을 붙이지 않는다.
            if (!useTitle && type === 'title') {
                continue;
            }

            var tmplValue = this._getTmplData(tmpl.attr, dataArr[i]),
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
        if (selectedItem) {
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