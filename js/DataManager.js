/**
 * @author ne10893
 */

if (typeof ne.autoComplete == 'undefined') {
    ne.autoComplete = {};
}

/**
 * 생성자
 * @constructor
 */
ne.autoComplete.DataManager = function() {
    if (arguments.length != 2) {
        alert('argument length error !');
    }
    this.autoCompleteObj = arguments[0];
    this.options = arguments[1];
};


function dataCallback() {}

ne.autoComplete.DataManager.prototype = {
    /**
     * api서버에 ajax요청한다.
     * @param {String} keyword 입력된 자동완성 검색어
     */
    request: function(keyword) {
        if (!this.options['searchApi']) {
            return;
        }

        var keyDatas = [], self = this;
        var defaultParam = {
            q: keyword,
            _callback: 'dataCallback',
            r_enc: 'UTF-8',
            q_enc: 'UTF-8',
            r_format: 'json'
        };
        var requestParam = $.extend(this.options['searchApi'], defaultParam);

        //keyword가지고 서버에 request
        $.ajax({
            type: 'get',
            url: this.options['searchApi']['url'],
            data: requestParam,
            dataType: 'jsonp',
            jsonpCallback: 'dataCallback',
            success: function(dataObj) {
                try {
                    var dataArr = [];

                    for (var i = 0; i < dataObj.items.length; i++) {
                        dataArr[i] = [];
                        var slotArr = dataObj.items[i];
                        if (slotArr.length > 0) {
                            for (var j = 0; j < slotArr.length; j++) {
                                dataArr[i][j] = slotArr[j][0];
                                keyDatas.push(dataArr[i][j]);
                            }
                        }
                    }

                    //2.  AutoComplete에 서버로부터 받은 결과 돌려줌.
                    self.autoCompleteObj.setServerData(keyDatas);
                } catch (e) {}
            }
        });
    }
};