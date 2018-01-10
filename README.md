# Auto Complete
Search keyword auto complete component.<br>
Display recommend word list, when you type search character in input element.

## Feature
* Show recommend result list layer from api.
* Auto complete on/off
* Move focus use tab, up, down keys
* Submit by click result element or type enter key

## Documentation
* **API** : [https://nhnent.github.io/tui.auto-complete/latest](https://nhnent.github.io/tui.auto-complete/latest)
* **Tutorial** : [https://github.com/nhnent/tui.auto-complete/wiki](https://github.com/nhnent/tui.auto-complete/wiki)
* **Example** - [https://nhnent.github.io/tui.auto-complete/latest/tutorial-example01-basic.html](https://nhnent.github.io/tui.auto-complete/latest/tutorial-example01-basic.html)

## Dependency
* [jquery](https://github.com/jquery/jquery) >=1.11.0
* [js-cookie](https://github.com/js-cookie/js-cookie) >=1.2.0
* [tui-code-snippet](https://github.com/nhnent/tui-code-snippet) >=1.2.5

## Test environment
### PC
* IE 8~11
* Edge
* Chrome
* Firefox
* Safari

## Usage
### Use `npm`

Install the latest version using `npm` command:

```
$ npm install tui-auto-complete --save
```

or want to install the each version:

```
$ npm install tui-auto-complete@<version> --save
```

To access as module format in your code:

```javascript
var AutoComplete = require('tui-auto-complete');
var instance = new AutoComplete(...);
```

### Use `bower`
Install the latest version using `bower` command:

```
$ bower install tui-auto-complete
```

or want to install the each version:

```
$ bower install tui-auto-complete#<tag>
```

To access as namespace format in your code:

```javascript
var instance = new tui.AutoComplete(...);
```

### Download
* [Download bundle files from `dist` folder](https://github.com/nhnent/tui.auto-complete/tree/production/dist)
* [Download all sources for each version](https://github.com/nhnent/tui.auto-complete/releases)

## License
[MIT LICENSE](https://github.com/nhnent/tui.auto-complete/blob/master/LICENSE)
