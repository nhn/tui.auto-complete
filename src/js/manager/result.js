/**
 * @fileoverview Result is kind of managing module to draw auto complete result list from server and apply template.
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */

var forEachArray = require('tui-code-snippet/collection/forEachArray');
var forEachOwnProperties = require('tui-code-snippet/collection/forEachOwnProperties');
var defineClass = require('tui-code-snippet/defineClass/defineClass');
var isEmpty = require('tui-code-snippet/type/isEmpty');
var isString = require('tui-code-snippet/type/isString');
var map = require('../util').map;

var $ = require('jquery');
var DEFAULT_VIEW_COUNT = 10,
  WHITE_SPACES = '[\\s]*';

var rIsSpeicalCharacters = /[\\^$.*+?()[\]{}|]/,
  rWhiteSpace = '/s+/g';

/**
 * Unit of auto complete that belong with search result list.
 * Handle the submit data from resultList.
 * See {@link Result.prototype._orderElement} which set the request data from arrow-key input
 * @ignore
 * @constructor
 */
var Result = defineClass(
  /** @lends Result.prototype */ {
    init: function(autoCompleteObj, options) {
      this.autoCompleteObj = autoCompleteObj;
      this.options = options;

      this.$resultList = options.resultListElement;
      this.viewCount = options.viewCount || DEFAULT_VIEW_COUNT;
      this.$onOffTxt = options.onoffTextElement;
      this.mouseOverClass = options.mouseOverClass;
      this.flowMap = autoCompleteObj.flowMap;

      this._attachEvent();
      this.$selectedElement = $();
    },

    /**
     * Delete last result list
     * @private
     */
    _deleteBeforeElement: function() {
      this.$selectedElement = $();
      this.$resultList.hide().html('');
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
        useTitle = this.options.useTitle && !!template.title,
        tmpl,
        index,
        tmplValue,
        i,
        data;

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
            params: tmplValue.params,
            index: index
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

      if (isString(data)) {
        tmplValue[attrs[0]] = data;

        return tmplValue;
      }

      forEachArray(attrs, function(attr, idx) {
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
    moveNextResult: function(flow) {
      var $selectEl = this.$selectedElement,
        keyword;

      if (!isEmpty($selectEl)) {
        $selectEl.removeClass(this.mouseOverClass);
      }
      $selectEl = this.$selectedElement = this._orderElement(flow);

      keyword = $selectEl.find('.keyword-field').text();
      if (keyword) {
        $selectEl.addClass(this.mouseOverClass);
        this.autoCompleteObj.setValue(keyword);
        this._setSubmitOption();
      } else {
        this.moveNextResult(flow);
      }
    },

    /**
     * Chage text by whether auto complete use or not
     * @param {Boolean} isUse on/off 여부
     */
    changeOnOffText: function(isUse) {
      if (isUse) {
        this.$onOffTxt.text('자동완성 끄기');
      } else {
        this.$onOffTxt.text('자동완성 켜기');
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
        this.$onOffTxt.on(
          'click',
          $.proxy(function() {
            this._useAutoComplete();
          }, this)
        );
      }

      $(document).on(
        'click',
        $.proxy(function() {
          this.hideResultList();
        }, this)
      );
    },

    /**
     * Highlight key word
     * @param {string} tmplStr Template string
     * @param {Object} dataObj Replace string map
     * @returns {string}
     * @private
     */
    _applyTemplate: function(tmplStr, dataObj) {
      forEachOwnProperties(
        dataObj,
        function(value, key) {
          if (key === 'subject') {
            value = this._highlight(value);
          }
          tmplStr = tmplStr.replace(new RegExp('@' + key + '@', 'g'), value);
        },
        this
      );

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
      var queries = this.autoCompleteObj.queries || [];
      var returnStr;

      forEachArray(
        queries,
        function(query) {
          if (!returnStr) {
            returnStr = text;
          }
          returnStr = this._makeStrong(returnStr, query);
        },
        this
      );

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

      tmpArr = query.replace(rWhiteSpace, '').split('');
      tmpArr = map(tmpArr, function(char) {
        if (rIsSpeicalCharacters.test(char)) {
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
     * @returns {jQuery}
     * @private
     */
    _orderStage: function(type) {
      var flowMap = this.flowMap;
      var $children = this.$resultList.children();
      var reuslt = null;

      if (type === flowMap.FIRST) {
        reuslt = $children.first();
      } else if (type === flowMap.LAST) {
        reuslt = $children.last();
      }

      return reuslt;
    },

    /**
     * Return previous or next element from resultList by direction
     * @param {string} type The direction type for finding element
     * @returns {jQuery}
     * @private
     */
    _orderElement: function(type) {
      var $selectedElement = this.$selectedElement,
        $order;

      if (type === this.flowMap.NEXT) {
        $order = $selectedElement.next();

        return $order.length ? $order : this._getFirst();
      }
      $order = $selectedElement.prev();

      return $order.length ? $order : this._getLast();
    },

    /**
     * Set whether auto complete use or not and change switch's state.
     * @private
     */
    _useAutoComplete: function() {
      var isUse = this.autoCompleteObj.isUseAutoComplete();

      this.changeOnOffText(isUse);
      this.autoCompleteObj.setCookieValue(isUse);
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
  }
);

module.exports = Result;
