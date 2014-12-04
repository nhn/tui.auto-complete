/**
 * @fileoverview 자동완성 컴포넌트의 DataManager
 * @author kihyun.lee@nhnent.com
 */

ne = window.ne || {};
ne.component = ne.component || {};


/**
 * 자동완성 컴포넌트 중 api와 연동하여 데이터를 받아오는 클래스
 *
 * @constructor
 */
ne.component.AutoComplete.DataManager = ne.util.defineClass({
    init: function() {
        if (arguments.length != 2) {
            alert('argument length error !');
        }

        // argument로 넘어온 AutoComplete 클래스와 사용자가 지정한 옵션값을 내부 변수로 저장한다.
        this.autoCompleteObj = arguments[0];
        this.options = arguments[1];
    },

    /**
     * 검색서버에 입력값을 보내어 자동완성 검색어 리스트를 받아온다.
     *
     * @param {String} keyword 검색서버에 요청할 키워드 스트링
     */
    request: function(keyword) {
        //혹시라도 검색용 api가 설정되지 않았다면 request하지 않고 바로 종료한다.
        if (!this.options.searchApi) {
            return;
        }

        //request를 위한 변수 세팅
        var keyDatas = [],
            dataArr = [],
            self = this,
            dataCallback = function(){},
            defaultParam = {
                q: keyword,
                r_enc: 'UTF-8',
                q_enc: 'UTF-8',
                r_format: 'json',
                _callback: 'dataCallback'
            },
            requestParam = $.extend(this.options.searchApi, defaultParam);

        $.ajax({
            type: 'get',
            //url: this.options['searchApi']['url'],
            url: this.options.searchApi.url,
            data: requestParam,
            dataType: 'jsonp',
            jsonpCallback: 'dataCallback',
            success: function(dataObj) {
                try {
                    var itemLen = dataObj.items.length,
                        i,
                        j;

                    for (i = 0; i < itemLen; i++) {
                        dataArr[i] = [];

                        var slots = dataObj.items[i],
                            slotLen = slots.length;

                        if (slotLen > 0) {
                            for (j = 0; j < slots.length; j++) {
                                dataArr[i][j] = slots[j][0];
                                keyDatas.push(dataArr[i][j]);
                            }
                        }
                    }

                    //서버로부터 받은 결과를 세팅하여 화면에 그리도록 한다.
                    self.autoCompleteObj.setServerData(keyDatas);
                } catch (e) {
                    throw new Error('서버에서 정보를 받을 수 없습니다.');
                }
            }
        });
    }
});