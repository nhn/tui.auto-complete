/**
 * @author ne10893
 */

if (typeof ne.autoComplete == 'undefined') {
    ne.autoComplete = {};
}

var $resultList,
    $onOffTxt,
    viewCount,
    formId,
    resultSelector,
    mouseOverClass;

/**
 *
 * @constructor
 */
ne.autoComplete.ResultManager = function() {
    this.autoCompleteObj = arguments[0];
    this.options = arguments[1];

    //1. Config.js 에 설정된 element 정보 가져와서 내부 변수로 세팅.
    $resultList = this.options['resultListElement'];
    viewCount = this.options['viewCount'] || 10;
    formId = this.options['formElement'];
    resultSelector = this.options['resultListElement'];
    mouseOverClass = this.options['mouseOverClass'];
    $onOffTxt = this.options['onoffTextElement'];

    //2. event binding
    this._attachEvent();

    //현재 선택된 li 엘리먼트
    this.selectedElement = null;

    //검색어 리스트에서 키보드 이용해서 위,아래로 움직였는지 나타내는 플래그
    this.isMoved = false;
};

ne.autoComplete.ResultManager.prototype = {
    /**
     * 서버로부터 전달받은 자동완성 데이터를 화면에 그린다. AutoComplete의 setServerData함수에 의해 호출.
     * @param dataArr {Array} 서버로부터 받은 자동완성 데이터 배열
     */
    draw: function(dataArr) {
        //이전 결과 지우기
        $resultList.html('');
        $resultList.hide();
        this.selectedElement = null;

        var wordList = [];
        var tmplStr = this.options['templateElement'];
        var dataLength = dataArr.length;
        var len = (viewCount < dataLength) ? viewCount : dataLength;

        if(dataLength <1) {
            this._hideBottomArea();
        }

        for (var i = 0; i < len; i++) {
            var tmplVal = {
               txt: dataArr[i]
            };

            var s = this._applyTemplate(tmplStr, tmplVal);
            wordList.push(s);
        }
        $resultList.html(wordList.join(''));


        //결과 영역을 노출한다.
        $resultList.show();

        //자동완성 켜기 영역 보여준다.
        this._showBottomArea();
    },


    /**
     * 자동완성 검색 결과 영역이 펼쳐진 상태인지 반환한다.
     * @return {Boolean} 검색 결과 영역 펼쳐진 상태 여부
     */
    isShowResultList: function() {
        if ($resultList.css('display') == 'block') {
            return true;
        }
        return false;
    },

    /**
     * 결과 영역 숨김 처리
     */
    hideResultList: function(where) {
        $resultList.css('display', 'none');
        this._hideBottomArea();
    },

    /**
     * 결과 영역 펼침
     */
    showResultList: function() {
        setTimeout(function(){
            $resultList.css('display', 'block');
        }, 0);

        this._showBottomArea();
    },

    /**
     * 검색어 리스트에서 키보드 이용해서 아래로 움직일때 실행되는 함수
     * @param {Event} e
     */
    moveNextKeyword: function() {
        this.isMoved = true;

        if (this.selectedElement) {
            this.selectedElement.removeClass(mouseOverClass);
            this.selectedElement = this._getNext(this.selectedElement);
        } else {
            this.selectedElement = this._getFirst();
        }

        //addClass 및 검색창에 검색어 세팅
        if (this.selectedElement && this.selectedElement.text()) {
            this.selectedElement.addClass(mouseOverClass);
            this.autoCompleteObj.setValue(this.selectedElement.text());
        }
    },

    /**
     * 검색어 리스트에서 키보드 이용해서 위로 움직일때 실행되는 함수
     * @param {Event} e
     */
    movePrevKeyword: function() {
        this.isMoved = true;

        if (this.selectedElement) {
            this.selectedElement.removeClass(mouseOverClass);
            this.selectedElement = this._getPrev(this.selectedElement);
        }

        if (this.selectedElement) {
            this.selectedElement.addClass(mouseOverClass);
            this.autoCompleteObj.setValue(this.selectedElement.text());
        }
    },

    /**
     * 자동완성 사용여부에 따라 결과 리스트 하단에 [자동완성 끄기 | 자동완성 켜기] 텍스트를 설정한다.
     * @param {boolean} isShow  true/false 로 on/off 여부
     */
    changeOnOffText: function(isUse) {
        if (isUse) {
            $onOffTxt.text("자동완성 켜기");
            this.hideResultList();
        } else {
            $onOffTxt.text("자동완성 끄기");
        }
    },


    /************************************ Private Functions *******************************/
    /**
     * 자동완성켜기, 검색결과 리스트에 이벤트 바인딩
     * @private
     */
    _attachEvent: function() {
        $resultList.bind('mouseover click', $.proxy(function(e) {
            if (e.type == 'mouseover') {
                this._onMouseOver(e);
            } else if (e.type == 'click') {
                this._onClick(e);
            }
        }, this));

        //[자동완성 끄기 | 자동완성 켜기] 글자에 clickEvent binding.
        if ($onOffTxt) {
            $onOffTxt.bind('click', $.proxy(function(e) {
                this._useAutoComplete();
            }, this));
        }


        //document부분을 클릭하면 검색결과 리스트를 숨김처리함.
        $(document).bind('click' , $.proxy(function(e) {
            if (e.target.tagName.toLowerCase() != 'html') return;
            this.hideResultList();
        }, this));
    },


    /**
     *
     * @param sTemplate
     * @param htData
     * @returns {String} htmlString
     * @private
     */
    _applyTemplate: function(sTemplate, htData) {
        var htTemp = {};
        for (var sKey in htData) {
            htTemp[sKey] = htData[sKey];
            if (sKey == 'txt') {
                htTemp['txt'] = this._highlight(htData['txt'], this.autoCompleteObj.getValue());
            }

            if (!htData.propertyIsEnumerable(sKey)) {
                continue;
            }

            sTemplate = sTemplate.replace(new RegExp("@" + sKey + "@", "g"), htTemp[sKey]);
        }
        return sTemplate;
    },

    /**
     * draw가 실행될 때 호출되며 키워드 하이라이팅 처리를 한다.
     * text : 나이키 에어
     * query(입력값) : 나이키
     * 리턴 결과 : <strong>나이키 </strong>에어
     * @private
     */
    _highlight : function(text, query) {
        var returnStr = this._makeStrong(text, query);
        if ('' != returnStr) {
            return returnStr;
        }
        return text;
    },


    /**
     * @description 텍스트에서 쿼리 부분을 strong 태그로 감싼다.
     * @param text {String} 추천검색어 데이터
     * @param query {String} 입력 키워드값
     * @returns {String}
     * @private
     */
    _makeStrong : function(text, query) {
        var escRegExp = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g");   //정규표현식에 사용될 문자열들 escape 처리용 정규식
        /*
         * 질의어 사이사이에 공백 삽입, 앞뒤 공백 제거, 정규표현식 문자열 escape 처리, 여러개의 공백을 [\\s]* 으로 변경
         * 예를들어 질의어에 " [aa aa a " 가 유입시, "\[[\\s]*a[\\s]*a[\\s]*a[\\s]*a[\\s]*a" 로 변경
         */
        var tmpStr = query.replace(/()/g," ").replace(/^\s+|\s+$/g, "");

        /*
         * aa일때 Aa이 부분도 하이라이팅 되어야 한다 그러므로 [a|A]형식으로 변경한다.
         * 결과는 [a|A][\s]* 와 같이 출력된다.
         */
        var tmpCharacters = tmpStr.match(/\S/g);
        var tmpArr = [];
        for (var i=0,cnt=tmpCharacters.length;i<cnt;i++) {
            tmpArr.push(tmpCharacters[i].replace(/[\S]+/g,"[" + tmpCharacters[i].toLowerCase().replace(escRegExp,"\\$&") + "|" + tmpCharacters[i].toUpperCase().replace(escRegExp,"\\$&") + "] ").replace(/[\s]+/g,"[\\s]*"));
        }

        tmpStr = "(" + tmpArr.join("") + ")"; // 괄호로 감싸주기

        var returnStr = '' ;
        var regQuery = new RegExp(tmpStr); // 정규식 생성
        if (regQuery.test(text)) { //정규식에 적합한 문자셋이 있으면 , 치환 처리
            returnStr = text.replace(regQuery, '<strong>' + RegExp.$1 + '</strong>');
        }
        return returnStr;
    },

    /**
     * 자동완성 검색 결과중에 가장 처음의 항목을 리턴한다.
     * @returns {Element}
     * @private
     */
    _getFirst: function() {
        if ($resultList && $resultList.children() && $resultList.children().length) {
            return $resultList.children().first();
        }
        return null;
    },

    /**
     * 자동완성 검색 결과중에 가장 마지막의 항목을 리턴한다.
     * @returns {Element}
     * @private
     */
    _getLast: function() {
        if ($resultList && $resultList.children() && $resultList.children().length) {
            return $resultList.children().last();
        }
        return null;
    },

    /**
     * 자동완성 검색 결과중에 현재 포커스된 엘리먼트를 기준으로 다음 엘리먼트를 찾아 리턴한다.
     * @param {Element} welCurrent 현재 엘리먼트
     * @returns {Element}
     * @private
     */
    _getNext: function(welCurrent) {
        var $current = $(welCurrent);
        if ($current) {
            if ($current.closest(resultSelector)) {
                var welNext = $current.next();
                if (welNext.length) {
                    return welNext;
                } else {
                    return this._getFirst();
                }
            }
        }

        return null;
    },

    /**
     * 자동완성 검색 결과중에 현재 포커스된 엘리먼트를 기준으로 이전 엘리먼트를 찾아 리턴한다.
     * @param {Element} welCurrent
     * @returns {Element}
     * @private
     */
    _getPrev: function(welCurrent) {
        var $current = $(welCurrent);
        if ($current) {
            if ($current.closest(resultSelector)) {
                var welPrev = welCurrent.prev();
                if (welPrev.length) {
                    return welPrev;
                } else {
                    return this._getLast();
                }
            }
        }
    },


    /**
     * 자동완성을 사용 여부를 설정하고 켜키,끄기 텍스트를 토글 방식으로 변경한다.
     * @private
     */
    _useAutoComplete: function () {
        //1. AutoComplete에서 자동완성 사용여부에 대한 쿠키값을 가져온다.
        var isUse = this.autoCompleteObj.isUseAutoComplete();

        //2. 1에서 가져온 쿠키값을 바탕으로 결과 리스트 하단의 자동완성끄기/켜기 텍스트 변경한다.
        this.changeOnOffText(isUse);

        //3. 변경된 자동완성 사용여부 값을 다시 쿠키에 세팅한다.
        this.autoCompleteObj.setCookieValue(!isUse);
    },

    /**
     * 자동완성 끄기/켜기 영역을 노출한다.
     * @private
     */
    _showBottomArea: function() {
        if ($onOffTxt) {
            $onOffTxt.show();
        }
    },

    /**
     * 자동완성 끄기/켜기 영역을 숨김 처리한다.
     * @private
     */
    _hideBottomArea: function() {
        if ($onOffTxt) {
            $onOffTxt.hide();
        }
    },


    /********************************** Event Handlers ***********************************/
    /**
     * 검색결과 리스트에 mouseover되었을 때 실행되는 이벤트 핸들러
     * @private
     */
    _onMouseOver: function(e) {
        var $target = $(e.target);
        var $arr = $resultList.find('li');

        $.map($arr, function(val){
            $(val).removeClass(mouseOverClass);
        });

        //li 항목에 addClass.
        var selectedItem = $target.closest('li');
        if (selectedItem) {
            selectedItem.addClass(mouseOverClass);
        }

        this.selectedElement = $target;
    },

    /**
     * 검색결과 리스트가 click되었을 때 실행되는 이벤트 핸들러
     * 키워드를 클릭하여 검색 결과 페이지로 보낸다. (검색 실행)
     * @private
     */
    _onClick: function(e) {
        var $target = $(e.target);
        var selectedKeyword = $target.closest('li').text();
        this.autoCompleteObj.setValue(selectedKeyword);

        var formElement = formId;
        if (formElement && selectedKeyword) {
            formElement.submit();
        }
    }
}