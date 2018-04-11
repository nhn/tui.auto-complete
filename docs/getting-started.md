## Dependencies
* [tui-code-snippet](https://github.com/nhnent/tui.code-snippet) >=1.3.0
* [js-cookie](https://github.com/js-cookie/js-cookie) >=1.2.0 (If use 1.3.0 or more, You need to include the [JSON-js polyfill](https://github.com/douglascrockford/JSON-js))
* [jquery](https://github.com/jquery/jquery) >=1.11.0

## Load

### HTML

```html
<!-- Form -->
<form id="ac_form1" method="get" action="http://www.popshoes.co.kr/app/product/search" onsubmit="">
    <!-- Searchbox -->
    <div class="inputBox">
        <input class="inputBorder" id="ac_input1" type="text" name="q" autocomplete="off">
        <input type="hidden" id="org_query" name="org_query">
    </div>

    <!-- Result area -->
    <div class="suggestBox" id="ac_view1" style="width:269px;">
        <div class="baseBox">
            <ul class="_resultBox" style="display:none;">
                <li><a href="#" onclick="return false;" title="">@txt@</a></li>
            </ul>
            <p id="onofftext" class="bottom" style="display:none;">Off Autocopmlate</p>
        </div>
    </div>
</form>
```

### Scripts
```js
<script type="text/javascript" src="jquery.min.js"></script>
<script type="text/javascript" src="jquery.cookie.js"></script>
<script type="text/javascript" src="tui-code-snippet.js"></script>
<script type="text/javascript" src="tui-auto-complete.js"></script>
<script type="text/javascript">
    var configruation = {
      //... Write your configuration
    };
    var instance = new tui.AutoComplete({
      config: configruation
    });
</script>
```

<br>

## Configuration

### Required Options

* `resultListElement`: Element for displaying the search result
* `searchBoxElement`: Input element for searching
* `orgQueryElement`: Hidden input element for request (use jquery selector)
* `subQuerySet`: Set of keys of subqueries<br>
  ```js
  /* Example */
  subQuerySet: [
      ['key1', 'key2', 'key3'],
      ['dep1', 'dep2', 'dep3'],
      ['ch1', 'ch2', 'ch3'],
      ['cid']
  ]
  ```
* `template` : Markup templates for each collection, the expression is `@key@`<br>
  ```js
  /* Example */
  template: {
      department: {
          element: '<li class="department">' +
                        '<span class="slot-field">Shop the</span> ' +
                        '<a href="#" class="keyword-field">@subject@</a> ' +
                        '<span class="slot-field">Store</span>' +
                    '</li>',
          attr: ['subject']
      },
      srch: {
          element: '<li class="srch"><span class="keyword-field">@subject@</span></li>',
          attr: ['subject']
      },
      srch_in_department: {
          element: '<li class="inDepartment">' +
                       '<a href="#" class="keyword-field">@subject@</a> ' +
                       '<span class="slot-field">in </span>' +
                       '<span class="depart-field">@department@</span>' +
                   '</li>',
          attr: ['subject', 'department']
      },
      title: {
          element: '<li class="title"><span>@title@</span></li>',
          attr: ['title']
      },
      defaults: {
          element: '<li class="srch"><span class="keyword-field">@subject@</span></li>',
          attr: ['subject']
      }
  },
  ```
* `listConfig` : Configurations for each collection.
  ```js
  /* Example */
  listConfig: {
      '0': {
          'template': 'department',
          'subQuerySet' : 0,
          'action': 0
      },
      '1': {
          'template': 'srch_in_department',
          'subQuerySet' : 1,
          'action': 0
      },
      '2': {
          'template': 'srch_in_department',
          'subQuerySet' : 2,
          'action': 1,
          'staticParams': 0
      },
      '3': {
          'template': 'department',
          'subQuerySet' : 0,
          'action': 1,
          'staticParams': 1
      }
  },
  ```
* `actions` : Form actions for each colection
  ```js
  /* Example */
  actions: [
      "http://0.0.0.0:3000/searc1.aspx",
      "http://0.0.0.0:3000/search2.aspx"
  ],
  ```
* `formElement`: From element wrapping searchbox
* `searchUrl`: Search URL

## Caution
* This component uses JSONP
