/**
 * @fileoverview Result is kind of managing module to draw auto complete result list from server and apply template.
 * @version 1.1.0
 * @author  NHN entertainment FE dev team<dl_javascript@nhnent.com>
 */

/**
 * Unit of auto complete that belong with search result list.
 * @constructor
 */
var Result = tui.util.defineClass(/** @lends Result.prototype */{
    /**
     * Initailize
     */
    init: function(autoCompleteObj, options) {
        this.autoCompleteObj = autoCompleteObj;
        this.options = options;

        this.$resultList = this.options.resultListElement;
        this.resultSelector = this.options.resultListElement;
        this.viewCount = this.options.viewCount || 10;
        this.$onOffTxt = this.options.onoffTextElement;
        this.mouseOverClass = this.options.mouseOverClass;
        this.flowMap = this.autoCompleteObj.flowMap;

        this._attachEvent();

        this.selectedElement = null;

        this.isMoved = false;
    },

    /**
     * Delete last result list
     * @private
     */
    _deleteBeforeElement: function() {
        this.$resultList.html('');
        this.$resultList.hide();
        this.selectedElement = null;
    },

    /**
     * Draw result form api server
     * @param {Array} dataArr Result data
     */
    draw: function(dataArr) {

        this._deleteBeforeElement();

        var len = dataArr.length;

        if (len < 1) {
            this._hideBottomArea();
        } else {
            this._makeResultList(dataArr, len);
        }

        this.$resultList.show();
        // show auto complete switch
        this._showBottomArea();
    },

    /**
     * Make search result list element
     * @private
     */
    _makeResultList: function(dataArr, len) {
        var template = this.options.template,
            config = this.options.listConfig,
            tmpl,
            useTitle = (this.options.useTitle && !!template.title),
            index,
            type,
            tmplValue,
            $el,
            i;

        for (i = 0; i < len; i++) {
            type = dataArr[i].type;
            index = dataArr[i].index;
            tmpl = config[index] ? template[config[index].template] : template.defaults;
            if (type === 'title') {
                tmpl = template.title;
                if (!useTitle) {
                    continue;
                }
            }
            tmplValue = this._getTmplData(tmpl.attr, dataArr[i]);
            $el = $(this._applyTemplate(tmpl.element, tmplValue));
            $el.attr('data-params', tmplValue.params);
            $el.attr('data-index', index);
            this.$resultList.append($el);
        }
    },

    /**
     * Make template data
     * @param {array} attrs Template attributes
     * @param {string|Object} data The data to make template
     * @return {object}
     * @private
     */
    _getTmplData: function(attrs, data) {
        var tmplValue = {},
            values = data.values || null;

        if (tui.util.isString(data)) {
            tmplValue[attrs[0]] = data;
            return tmplValue;
        }
        tui.util.forEach(attrs, function(attr, idx) {

            tmplValue[attr] = values[idx];

        });

        if(attrs.length < values.length) {
            tmplValue.params = values.slice(attrs.length);
        }

        return tmplValue;
    },

    /**
     * Return whether result list show or not
     * @return {Boolean}
     */
    isShowResultList: function() {
        return (this.$resultList.css('display') === 'block');
    },

    /**
     * Hide result list area
     */
    hideResultList: function() {
        this.$resultList.css('display', 'none');
        this._hideBottomArea();
        this.autoCompleteObj.isIdle = true;
        this.autoCompleteObj.fire('close');
    },

    /**
     * Show result list area
     */
    showResultList: function() {
        var self = this;
        setTimeout(function() {
            self.$resultList.css('display', 'block');
        }, 0);

        this._showBottomArea();
    },

    /**
     * Move focus to next item, change input element value as focus value.
     * @param {string} flow Direction by key code
     */
    moveNextList: function(flow) {
        var flowMap = this.flowMap,
            selectEl = this.selectedElement,
            getNext = (flow === flowMap.NEXT) ? this._getNext : this._getPrev,
            getBound = (flow === flowMap.NEXT) ? this._getFirst : this._getLast,
            keyword;
        this.isMoved = true;

        if (selectEl) {
            selectEl.removeClass(this.mouseOverClass);
            selectEl = this.selectedElement = getNext.call(this, selectEl);
        } else {
            selectEl = this.selectedElement = getBound.call(this);
        }

        keyword = selectEl.find('.keyword-field').text();

        if (selectEl && keyword) {
            selectEl.addClass(this.mouseOverClass);
            this.autoCompleteObj.setValue(keyword);
            this._setSubmitOption();
        } else {
            if(selectEl) {
                this.moveNextList(flow);
            }
        }
    },

    /**
     * Chage text by whether auto complete use or not
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
     * Attach auto complete event belongs with result list
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

        if (this.$onOffTxt) {
            this.$onOffTxt.bind('click', $.proxy(function() {
                this._useAutoComplete();
            }, this));
        }

        $(document).bind('click', $.proxy(function(e) {
            if (e.target.tagName.toLowerCase() !== 'html') {
                return;
            }
            this.hideResultList();
        }, this));
    },


    /**
     * Highlight key word
     * @param {String} tmplStr Template string
     * @param {Object} dataObj Replace string map
     * @return {String}
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
     * Return applied highlight effect key word
     * (text: Nike air  /  query : [Nike] / Result : <strong>Nike </strong>air
     * text : 'rhdiddl와 고양이' / query :  [rhdiddl, 고양이] / 리턴결과 <strong>rhdiddl</strong>와 <strong>고양이</strong>
     * @param {String} text Input string
     * @return {String}
     * @private
     */
    _highlight: function(text) {
        var querys = this.autoCompleteObj.querys,
            returnStr;

        tui.util.forEach(querys, function(query) {

            if (!returnStr) {
                returnStr = text;
            }
            returnStr = this._makeStrong(returnStr, query);

        }, this);
        return (returnStr || text);
    },

    /**
     * Contain text by strong tag
     * @param {String} text Recommend search data  추천검색어 데이터
     * @param {String} query Input keyword
     * @return {String}
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

        tmpStr = "(" + tmpArr.join("") + ")";
        regQuery = new RegExp(tmpStr);

        if (regQuery.test(text)) {
            returnStr = text.replace(regQuery, '<strong>' + RegExp.$1 + '</strong>');
        }

        return returnStr;
    },

    /**
     * Return the first result item
     * @return {Element}
     * @private
     */
    _getFirst: function() {
        return this._orderStage(this.flowMap.FIRST);
    },

    /**
     * Return the last result item
     * @return {Element}
     * @private
     */
    _getLast: function() {
        return this._orderStage(this.flowMap.LAST);
    },

    /**
     * Return whether first or last
     * @param {string} type First/end element type
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
     * Return next element from selected element
     * If next element is not exist, return first element.
     * @param {Element} element focused element
     * @return {Element}
     * @private
     */
    _getNext: function(element) {
        return this._orderElement(this.flowMap.NEXT, element);
    },

    /**
     * Return previous element from selected element
     * If previous element is not exist, return the last element.
     * @param {Element} element focused element
     * @return {Element}
     * @private
     */
    _getPrev: function(element) {
        return this._orderElement(this.flowMap.PREV, element);
    },

    /**
     * Return previous or next element by direction.
     * @param {string} type The direction type for finding element
     * @param {Element} element focused element
     * @returns {*}
     * @private
     */
    _orderElement: function(type, element) {
        if (!tui.util.isExisty(element)) {
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
     * Set whether auto complete use or not and change switch's state.
     * @private
     */
    _useAutoComplete: function() {
        var isUse = this.autoCompleteObj.isUseAutoComplete();
        this.changeOnOffText(isUse);
        this.autoCompleteObj.setCookieValue(!isUse);
    },

    /**
     * Show auto complete switch area
     * @private
     */
    _showBottomArea: function() {
        if (this.$onOffTxt) {
            this.$onOffTxt.show();
        }
    },

    /**
     * Hide auto complete switch area
     * @private
     */
    _hideBottomArea: function() {
        if (this.$onOffTxt) {
            this.$onOffTxt.hide();
        }
    },

    /**
     * Change action attribute of form element and set addition values in hidden type elements.
     * @param {element} [$target] Submit options target
     * @private
     */
    _setSubmitOption: function($target) {
        this._clearSubmitOption();

        var formElement = this.options.formElement,
            $selectField = $target ? $($target).closest('li') : $(this.selectedElement),
            actions = this.options.actions,
            index = $selectField.attr('data-index'),
            config = this.options.listConfig[index],
            action = actions[config.action],
            paramsString;

        $(formElement).attr('action', action);
        paramsString = $selectField.attr('data-params');

        this.autoCompleteObj.setParams(paramsString, index);

        this.autoCompleteObj.fire('change', {
            index: index,
            action: action,
            params: paramsString
        });
    },

    /**
     * Reset form element.
     * @private
     */
    _clearSubmitOption: function(e) {
        var formElement = this.options.formElement,
            hiddenWrap = $(formElement).find('.hidden-inputs');

        hiddenWrap.html('');
    },

    /************************* Event Handlers *********************/
    /**
     * Result list mouseover event handler
     * @param {Event} e Event instanse
     * @private
     */
    _onMouseOver: function(e) {
        var $target = $(e.target),
            $arr = this.$resultList.find('li'),
            selectedItem = $target.closest('li');

        tui.util.forEachArray($arr, function(val) {
            $(val).removeClass(this.mouseOverClass);
        }, this);

        if (selectedItem && selectedItem.find('.keyword-field').length) {
            selectedItem.addClass(this.mouseOverClass);
        }

        this.selectedElement = $target;
    },

    /**
     * Result list click evnet handler
     * Submit form element.
     * @param {Event} e Event instanse
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

module.exports = Result;
