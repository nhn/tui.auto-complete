/**
 * @fileoverview 자동완성 컴포넌트의 ResultManager
 * @author kihyun.lee@nhnent.com
 */

ne = window.ne || {};
ne.component = ne.component || {};

/**
 *
 * @constructor
 */
ne.component.AutoComplete.ResultManager = ne.util.defineClass(/** @lends ne.component.AutoComplete.ResultManager.prototype */{

    init: function() {
        this.autoCompleteObj = arguments[0];
        this.options = arguments[1];

        //Config.js 에 설정된 element 정보 가져와서 내부 변수로 세팅.
        this.$resultList = this.options.resultListElement;
        this.resultSelector = this.options.resultListElement;
        this.viewCount = this.options.viewCount || 10;
        this.$onOffTxt = this.options.onoffTextElement;
        this.mouseOverClass = this.options.mouseOverClass;

        this._attachEvent();

        //현재 선택된 li 엘리먼트
        this.selectedElement = null;

        //검색어 리스트에서 키보드 이용해서 위,아래로 움직였는지 나타내는 플래그
        this.isMoved = false;
    },

    /**
     * 서버로부터 전달받은 자동완성 데이터를 화면에 그린다. AutoComplete의 setServerData함수에 의해 호출.
     * @param {Array} dataArr 서버로부터 받은 자동완성 데이터 배열
     */
    draw: function(dataArr) {
        //이전 결과 지운다.
        this.$resultList.html('');
        this.$resultList.hide();
        this.selectedElement = null;

        var wordList = [],
            tmplStr = this.options.templateElement,
            dataLength = dataArr.length,
            len = (this.viewCount < dataLength) ? this.viewCount : dataLength,
            i;

        if (dataLength < 1) {
            this._hideBottomArea();
        }

        for (i = 0; i < len; i++) {
            var tmplVal = {
                txt: dataArr[i]
            };
            wordList.push(this._applyTemplate(tmplStr, tmplVal));
        }
        this.$resultList.html(wordList.join(''));


        //결과 영역을 노출한다.
        this.$resultList.show();

        //자동완성 켜기 영역을 보여준다.
        this._showBottomArea();
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
     * 검색어 리스트에서 키보드 이용해서 아래로 움직일때 실행되는 함수
     */
    moveNextKeyword: function() {
        this.isMoved = true;

        if (this.selectedElement) {
            this.selectedElement.removeClass(this.mouseOverClass);
            this.selectedElement = this._getNext(this.selectedElement);
        } else {
            this.selectedElement = this._getFirst();
        }

        //addClass 및 검색창에 검색어 세팅
        if (this.selectedElement && this.selectedElement.text()) {
            this.selectedElement.addClass(this.mouseOverClass);
            this.autoCompleteObj.setValue(this.selectedElement.text());
        }
    },

    /**
     * 검색어 리스트에서 키보드 이용해서 위로 움직일때 실행되는 함수
     */
    movePrevKeyword: function() {
        this.isMoved = true;

        if (this.selectedElement) {
            this.selectedElement.removeClass(this.mouseOverClass);
            this.selectedElement = this._getPrev(this.selectedElement);
        }

        if (this.selectedElement) {
            this.selectedElement.addClass(this.mouseOverClass);
            this.autoCompleteObj.setValue(this.selectedElement.text());
        }
    },

    /**
     * 자동완성 사용여부에 따라 결과 리스트 하단에 [자동완성 끄기 | 자동완성 켜기] 텍스트를 설정한다.
     * @param {boolean} isUse on/off 여부
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
     * 자동완성켜기, 검색결과 리스트에 이벤트 바인딩
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
     * @returns {String} htmlString 템플릿이 적용된 검색어 결과 부분의 전체 html 스트링
     * @private
     */
    _applyTemplate: function(tmplStr, dataObj) {
        var temp = {},
            keyStr;

        for (keyStr in dataObj) {
            temp[keyStr] = dataObj[keyStr];
            if (keyStr == 'txt') {
                temp.txt = this._highlight(dataObj.txt, this.autoCompleteObj.getValue());
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
     * (text: 나이키 에어  /  query : 나이키 / 리턴 결과 : <strong>나이키 </strong>에어
     * @param {String} text 입력값 스트링
     * @param {String} query 하이라이팅 처리할 스트링
     * @returns {String} 하이라이팅 처리된 전체 스트링
     * @private
     */
    _highlight: function(text, query) {
        console.log('### text :' , text);
        console.log('### query :' , query);

        var returnStr = this._makeStrong(text, query);
        if ('' !== returnStr) {
            return returnStr;
        }
        console.log('### return : ' , text);
        return text;
    },

    /**
     * 텍스트에서 쿼리 부분을 strong 태그로 감싼다.
     * @param {String} text  추천검색어 데이터
     * @param {String} query 입력 키워드값
     * @returns {String} <strong>태그 처리된 스트링
     * @private
     */
    _makeStrong: function (text, query) {
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
            i;

        for (i = 0, cnt = tmpCharLen; i < cnt; i++) {
            tmpArr.push(tmpCharacters[i].replace(/[\S]+/g, "[" + tmpCharacters[i].toLowerCase().replace(escRegExp, "\\$&") + "|" + tmpCharacters[i].toUpperCase().replace(escRegExp, "\\$&") + "] ").replace(/[\s]+/g, "[\\s]*"));
        }

        tmpStr = "(" + tmpArr.join("") + ")"; // 괄호로 감싸주기

        regQuery = new RegExp(tmpStr); // 정규식 생성
        if (regQuery.test(text)) { //정규식에 적합한 문자셋이 있으면 , 치환 처리
            returnStr = text.replace(regQuery, '<strong>' + RegExp.$1 + '</strong>');
        }
        return returnStr;
    },

    /**
     * 자동완성 검색 결과중에 가장 처음의 항목을 리턴한다.
     * @returns {Element} 키워드 엘리먼트
     * @private
     */
    _getFirst: function() {
        if (this.$resultList &&
            this.$resultList.children() &&
            this.$resultList.children().length) {
            return this.$resultList.children().first();
        }
        return null;
    },

    /**
     * 자동완성 검색 결과중에 가장 마지막의 항목을 리턴한다.
     * @returns {Element} 키워드 엘리먼트
     * @private
     */
    _getLast: function() {
        if (this.$resultList &&
            this.$resultList.children() &&
            this.$resultList.children().length) {
            return this.$resultList.children().last();
        }
        return null;
    },

    /**
     * 자동완성 검색 결과중에 현재 포커스된 엘리먼트를 기준으로 다음 엘리먼트를 찾아 리턴한다.
     * @param {Element} element 현재의 엘리먼트
     * @returns {Element} 현재 포커스된 엘리먼트의 다음 엘리먼트
     * @private
     */
    _getNext: function(element) {
        if (!ne.util.isExisty(element)) {
            return null;
        }

        var $current = $(element),
            next;

        if ($current.closest(this.resultSelector)) {
            next = $current.next();
            if (next.length) {
                return next;
            } else {
                return this._getFirst();
            }
        }

        return null;
    },

    /**
     * 자동완성 검색 결과중에 현재 포커스된 엘리먼트를 기준으로 이전 엘리먼트를 찾아 리턴한다.
     * @param {Element} element
     * @returns {Element} 현재 포커스된 엘리먼트의 이전 엘리먼트
     * @private
     */
    _getPrev: function(element) {
        if (!ne.util.isExisty(element)) {
            return null;
        }

        var $current = $(element),
            prev;

        if ($current.closest(this.resultSelector)) {
            prev = element.prev();
            if (prev.length) {
                return prev;
            } else {
                return this._getLast();
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


    /************************* Event Handlers *********************/
    /**
     * 검색결과 리스트에 mouseover되었을 때 실행되는 이벤트 핸들러
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

        //li 항목에 addClass.
        if (selectedItem) {
            selectedItem.addClass(this.mouseOverClass);
        }

        this.selectedElement = $target;
    },

    /**
     * 검색결과 리스트가 click되었을 때 실행되는 이벤트 핸들러
     * 키워드를 클릭하여 검색 결과 페이지로 보낸다.
     *
     * @param {Event} e 클릭 이벤트 객체
     * @private
     */
    _onClick: function(e) {
        var $target = $(e.target),
            formElement = this.options.formElement,
            selectedKeyword = $target.closest('li').text();

        this.autoCompleteObj.setValue(selectedKeyword);

        if (formElement && selectedKeyword) {
            formElement.submit();
        }
    }
});