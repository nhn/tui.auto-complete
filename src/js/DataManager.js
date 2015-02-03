/**
 * @fileoverview 자동완성 컴포넌트 중에서 입력된 값으로 검색 API와 연동하여 자동완성 검색 결과를 받아오는 클래스
 * @author FE개발팀 이기현<kihyun.lee@nhnent.com>
 *         수정 - FE개발팀 이제인<jein.yi@nhnent.com>
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
            requestParam = ne.util.extend(this.options.searchApi, defaultParam);

        ne.util.ajax.request(this.options.searchUrl, {
            'dataType': 'jsonp',
            'jsonpCallback': 'dataCallback',
            'data': requestParam,
            'type': 'get',
            'success': ne.util.bind(function(dataObj) {
                //try {

                    var keyDatas = this._getCollectionData(dataObj);
                    // 응답값으로 돌아온 입력값(한글을 영문으로 맞춰놓고 잘못 입력 했을 경우에 오는 값 포함)을 전역에서 쓸수 있게 autoComplete에 셋팅
                    this.autoCompleteObj.setQuerys(dataObj.query);
                    // 키 값으로 뽑아낸 데이터들을 resultManager에 전달하여 뿌려준다.
                    this.autoCompleteObj.setServerData(keyDatas);

                //} catch (e) {
                //    throw new Error('[DataManager] 서버에서 정보를 받을 수 없습니다. ' , e);
                //}
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
            items = ne.util.map(itemSet.items, function(item, idx) {
                if(idx > (this.options.viewCount - 1)) {
                    return;
                }
                return {
                    values: item,
                    type: type,
                    index: index,
                    dest: dest
                }

            }, this);

        items = ne.util.filter(items, function(item) {
            return item;
        });

        return items;
    }
});