/**
 * @fileoverview 자동완성 컴포넌트 중에서 입력된 값으로 검색 API와 연동하여 자동완성 검색 결과를 받아오는 클래스
 * @author kihyun.lee@nhnent.com
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

        //request를 위한 변수 세팅
        var dataCallback = function(){},
            defaultParam = {
                q: keyword,
                r_enc: 'UTF-8',
                q_enc: 'UTF-8',
                r_format: 'json',
                _callback: 'dataCallback'
            },
            requestParam = ne.util.extend(this.options.searchApi, defaultParam);

        ne.util.ajax.request(this.options.searchApi.url, {
            'dataType': 'jsonp',
            'jsonpCallback': 'dataCallback',
            'data': requestParam,
            'type': 'get',
            'success': ne.util.bind(function(dataObj) {
                //try {

                    var keyDatas;

                    if (ne.util.isExisty(dataObj.collections)) {
                        keyDatas = this.getCollectionData(dataObj);
                    } else {
                        keyDatas = this.getItemData(dataObj);
                    }

                    this.autoCompleteObj.setServerData(keyDatas);

                //} catch (e) {
                //    throw new Error('[DataManager] 서버에서 정보를 받을 수 없습니다. ' , e);
                //}
            }, this)
        });
    },
    getItemData: function(dataObj) {
        var keyDatas = [],
            dataArr = [],
            itemLen = dataObj.items.length,
            i,
            j;

        //서버에서 내려주는 slot갯수를 고려하여 data를 받아 keyDatas배열에 저장한다.
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
        return keyDatas;
    },
    getCollectionData: function(dataObj) {
        var collection = dataObj.collections,
            itemDataList = [];

        ne.util.forEach(collection, function(itemSet) {

            var keys = this.getRedirectData(itemSet);
            itemDataList.push({
                type: 'title',
                values: [itemSet.title]
            });
            itemDataList = itemDataList.concat(keys);

        }, this);

        return itemDataList;
    },
    getRedirectData: function(itemSet) {
        var type = itemSet.type,
            index = itemSet.index,
            items = ne.util.map(itemSet.items, function(item, idx) {

                return {
                    values: item,
                    type: type,
                    index: index
                }

            });
        return items;
    }
});