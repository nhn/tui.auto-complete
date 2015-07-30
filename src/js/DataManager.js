/**
 * @fileoverview DataManager that request data at api with input query
 * @version 1.1.0
 * @author NHN Entertainment FE dev team. Jein Yi<jein.yi@nhnent.com>
 */

/**
 * Unit of auto complete connecting server.
 * @constructor
 */
ne.component.AutoComplete.DataManager = ne.util.defineClass(/**@lends ne.component.AutoComplete.DataManager.prototype */{
    init: function(autoCompleteObj, options) {
        if (arguments.length != 2) {
            alert('argument length error !');
            return;
        }

        this.autoCompleteObj = autoCompleteObj;
        this.options = options;
    },

    /**
     * Request data at api server use jsonp
     * @param {String} keyword String to request at server
     */
    request: function(keyword) {

        var rsKeyWrod = keyword.replace(/\s/g, '');

        if (!keyword || !rsKeyWrod) {
            this.autoCompleteObj.hideResultList();
            return;
        }

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

        $.ajax.request(this.options.searchUrl, {
            'dataType': 'jsonp',
            'jsonpCallback': 'dataCallback',
            'data': requestParam,
            'type': 'get',
            'success': ne.util.bind(function(dataObj) {
                try {
                    keyDatas = this._getCollectionData(dataObj);
                    this.autoCompleteObj.setQuerys(dataObj.query);
                    this.autoCompleteObj.setServerData(keyDatas);
                    this.autoCompleteObj.clearReadyValue();
                } catch (e) {
                    throw new Error('[DataManager] Request faild.' , e);
                }
            }, this)
        });
    },
    /**
     * Make collection data to display
     * @param {object} dataObj Collection data
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
            // create collection items.
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
     * Make item of collection to display
     * @param {object} itemSet Item of collection data
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