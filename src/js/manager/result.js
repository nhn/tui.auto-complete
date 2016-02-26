/**
 * @fileoverview Result is kind of managing module to draw auto complete result list from server and apply template.
 * @version 1.1.0
 * @author  NHN entertainment FE dev team<dl_javascript@nhnent.com>
 */
'use strict';
var DEFAULT_VIEW_COUNT = 10,
    isEmpty = tui.util.isEmpty,
    map = tui.util.map,
    SPECIAL_CHARACTERS_RE = /[\\^$.*+?()[\]{}|]/,
    WHITE_SPACES_RE_G = '/\s+/g',
    WHITE_SPACES = '[\\s]*';

/**
 * Unit of auto complete that belong with search result list.
 * @constructor
 */
var Result = tui.util.defineClass(/** @lends Result.prototype */{
    init: function(autoCompleteObj, options) {
        this.autoCompleteObj = autoCompleteObj;
        this.options = options;

        this.$resultList = options.resultListElement;
        this.viewCount = options.viewCount || DEFAULT_VIEW_COUNT;
        this.$onOffTxt = options.onoffTextElement;
        this.mouseOverClass = options.mouseOverClass;
        this.flowMap = autoCompleteObj.flowMap;

        this._attachEvent();

        this.$selectedElement = null;

        this.isMoved = false;
    },

    /**
     * Delete last result list
     * @private
     */
    _deleteBeforeElement: function() {
        this.$resultList
            .hide()
            .html('');
        this.$selectedElement = null;
    },

    /**
     * Draw result form api server
     * @param {Array} dataArr Result data
     */
    draw: function(dataArr) {
        var len = dataArr.length;

        this._deleteBeforeElement();
        if (len < 1) {
            this._hideBottomArea();
        } else {
            this._makeResultList(dataArr, len);
        }
        this.showResultList();
    },

    /**
     * Make search result list element
     * @param {Array} dataArr - Data array
     * @param {number} len - Length of dataArray
     * @private
     */
    _makeResultList: function(dataArr, len) {
        var template = this.options.template,
            listConfig = this.options.listConfig,
            useTitle = (this.options.useTitle && !!template.title),
            tmpl, index, tmplValue, i, data;

        for (i = 0; i < len; i += 1) {
            data = dataArr[i];
            index = data.index;
            tmpl = listConfig[index] ? template[listConfig[index].template] : template.defaults;

            if (data.type === 'title') {
                tmpl = template.title;
                if (!useTitle) {
                    continue;
                }
            }
            tmplValue = this._getTmplData(tmpl.attr, data);
            $(this._applyTemplate(tmpl.element, tmplValue))
                .data({
                    'params': tmplValue.params,
                    'index': index
                })
                .appendTo(this.$resultList);
        }
    },

    /**
     * Make template data
     * @param {Array} attrs Template attributes
     * @param {string|Object} data The data to make template
     * @returns {Object} Template data
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

        if (attrs.length < values.length) {
            tmplValue.params = values.slice(attrs.length);
        }

        return tmplValue;
    },

    /**
     * Return whether result list show or not
     * @returns {Boolean}
     */
    isShowResultList: function() {
        return this.$resultList.css('display') === 'block';
    },

    /**
     * Hide result list area
     */
    hideResultList: function() {
        this.$resultList.hide();
        this._hideBottomArea();
        this.autoCompleteObj.isIdle = true;

        /**
         * Fired when hide the result list
         * @api
         * @event AutoComplete#close
         */
        this.autoCompleteObj.fire('close');
    },

    /**
     * Show result list area
     */
    showResultList: function() {
        this.$resultList.show();
        this._showBottomArea();
    },

    /**
     * Move focus to next item, change input element value as focus value.
     * @param {string} flow Direction by key code
     */
    moveNextList: function(flow) {
        var flowMap = this.flowMap,
            $selectEl = this.$selectedElement,
            getNext = (flow === flowMap.NEXT) ? this._getNext : this._getPrev,
            getBound = (flow === flowMap.NEXT) ? this._getFirst : this._getLast,
            keyword;

        this.isMoved = true;
        if (isEmpty($selectEl)) {
            $selectEl = this.$selectedElement = getBound.call(this);
        } else {
            $selectEl.removeClass(this.mouseOverClass);
            $selectEl = this.$selectedElement = getNext.call(this, $selectEl);
        }

        keyword = $selectEl.find('.keyword-field').text();
        if (keyword) {
            $selectEl.addClass(this.mouseOverClass);
            this.autoCompleteObj.setValue(keyword);
            this._setSubmitOption();
        } else {
            this.moveNextList(flow);
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
        this.$resultList.on({
            mouseover: $.proxy(this._onMouseOver, this),
            click: $.proxy(this._onClick, this)
        });

        if (this.$onOffTxt) {
            this.$onOffTxt.on('click', $.proxy(function() {
                this._useAutoComplete();
            }, this));
        }

        $(document).on('click', $.proxy(function() {
            this.hideResultList();
        }, this));
    },

    /**
     * Highlight key word
     * @param {string} tmplStr Template string
     * @param {Object} dataObj Replace string map
     * @returns {string}
     * @private
     */
    _applyTemplate: function(tmplStr, dataObj) {
        tui.util.forEach(dataObj, function(value, key) {
            if (key === 'subject') {
                value = this._highlight(value);
            }
            tmplStr = tmplStr.replace(new RegExp('@' + key + '@', 'g'), value);
        }, this);

        return tmplStr;
    },

    /**
     * Return applied highlight effect key word
     * (text: Nike air  /  query : [Nike] / Result : <strong>Nike </strong>air
     * text : 'rhdiddl와 고양이' / query :  [rhdiddl, 고양이] / 리턴결과 <strong>rhdiddl</strong>와 <strong>고양이</strong>
     * @param {String} text Input string
     * @returns {String}
     * @private
     */
    _highlight: function(text) {
        var queries = this.autoCompleteObj.queries,
            returnStr;

        tui.util.forEach(queries, function(query) {
            if (!returnStr) {
                returnStr = text;
            }
            returnStr = this._makeStrong(returnStr, query);
        }, this);
        return returnStr || text;
    },

    /**
     * Contain text by strong tag
     * @param {String} text Recommend search data  추천검색어 데이터
     * @param {String} query Input keyword
     * @returns {String}
     * @private
     */
    _makeStrong: function(text, query) {
        var tmpArr, regQuery;

        if (!query || query.length < 1) {
            return text;
        }
        
        tmpArr = query.replace(WHITE_SPACES_RE_G, '').split('');
        tmpArr = map(tmpArr, function(char) {
            if (SPECIAL_CHARACTERS_RE.test(char)) {
                return '\\' + char;
            }
            return char;
        });
        regQuery = new RegExp(tmpArr.join(WHITE_SPACES), 'gi');

        return text.replace(regQuery, function(match) {
            return '<strong>' + match + '</strong>';
        });
    },

    /**
     * Return the first result item
     * @returns {jQuery}
     * @private
     */
    _getFirst: function() {
        return this._orderStage(this.flowMap.FIRST);
    },

    /**
     * Return the last result item
     * @returns {jQuery}
     * @private
     */
    _getLast: function() {
        return this._orderStage(this.flowMap.LAST);
    },

    /**
     * Return whether first or last
     * @param {string} type First/end element type
     * @returns {jQuery|null}
     * @private
     */
    _orderStage: function(type) {
        var $children = this.$resultList.children();

        type = (type === this.flowMap.FIRST) ? 'first' : 'last';
        return $children[type]();
    },

    /**
     * Return next element from selected element
     * If next element is not exist, return first element.
     * @param {jQuery} $el focused element
     * @returns {jQuery}
     * @private
     */
    _getNext: function($el) {
        return this._orderElement(this.flowMap.NEXT, $el);
    },

    /**
     * Return previous element from selected element
     * If previous element is not exist, return the last element.
     * @param {jQuery} $el focused element
     * @returns {jQuery}
     * @private
     */
    _getPrev: function($el) {
        return this._orderElement(this.flowMap.PREV, $el);
    },

    /**
     * Return previous or next element by direction.
     * @param {string} type The direction type for finding element
     * @param {jQuery} $el focused element
     * @returns {jQuery}
     * @private
     */
    _orderElement: function(type, $el) {
        var $order;

        if (type === this.flowMap.NEXT) {
            $order = $el.next();
            return $order.length ? $order : this._getFirst();
        }
        $order = $el.prev();
        return $order.length ? $order : this._getLast();
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
     * (Called when click the <li>)
     * @param {element} [$target] Submit options target
     * @private
     *
     */
    _setSubmitOption: function($target) {
        var $selectField = $target ? $($target).closest('li') : this.$selectedElement,
            paramsString = $selectField.data('params'),
            index = $selectField.data('index'),
            config = this.options.listConfig[index],
            action = this.options.actions[config.action],
            $formElement = this.options.formElement;

        $formElement.attr('action', action);
        this._clearSubmitOption();
        this.autoCompleteObj.setParams(paramsString, index);

        /**
         * Fired when the user's selected element in result list is changed
         * @api
         * @event AutoComplete#change
         * @param {Object} data - Data for submit
         *  @param {string} data.index - Index of collection
         *  @param {string} data.action - Form action
         *  @param {string} data.params - Parameters
         */
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
    _clearSubmitOption: function() {
        var $formElement = this.options.formElement;

        $formElement.find('.hidden-inputs').html('');
    },

    /**
     * Result list mouseover event handler
     * @param {Event} event Event instanse
     * @private
     */
    _onMouseOver: function(event) {
        var $target = $(event.target),
            $arr = this.$resultList.find('li'),
            $selectedItem = $target.closest('li');

        $arr.removeClass(this.mouseOverClass);
        if ($selectedItem.find('.keyword-field').length) {
            $selectedItem.addClass(this.mouseOverClass);
        }
        this.$selectedElement = $target;
    },

    /**
     * Result list click evnet handler
     * Submit form element.
     * @param {Event} event Event instanse
     * @private
     */
    _onClick: function(event) {
        var $target = $(event.target),
            $formElement = this.options.formElement,
            $selectField = $target.closest('li'),
            $keywordField = $selectField.find('.keyword-field'),
            selectedKeyword = $keywordField.text();

        this.autoCompleteObj.setValue(selectedKeyword);
        if (selectedKeyword) {
            this._setSubmitOption($target);
            $formElement.submit();
        }
    }
});

module.exports = Result;
