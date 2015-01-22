{
    Default = {
        'resultListElement': $("._resultBox"),
        'searchBoxElement': $("#ac_input1"),
        'orgQueryElement' : '#org_query',
        'templateAttribute': {
            'redirect': ['txt', 'url'],
            'srch_with_opt': ['txt', 'insert', 'option'],
            'srch': ['txt'],
            'defaults': ['txt']
        },
        'templateElement' :  {
            'redirect': '<li><a href="@url@" onclick=\"return false;\">@txt@</a></li>',
            'srch': '<li><a href="#" onclick=\"return false;\">@txt@</a></li>',
            'srch_with_opt': '<li><a href="#" onclick=\"return false;\">@txt@ @option@ <strong style="color:gold">@insert@</strong></a></li>',
            'defaults': '<li><a href="#" onclick=\"return false;\">@txt@</a></li>'
        },
        'toggleBtnElement' : $("#onoffBtn"),
        'viewCount' : 15,
        'formElement' : $("#ac_form1"),
        'mouseOverClass' : 'emp',
        'onoffTextElement' : $(".baseBox .bottom"),
        'searchApi' : {
            'url' : 'http://119.205.249.132/ac/mock_default.js',
            'st' : 1,
            'r_lt' : 1,
            'r_enc' : 'UTF-8',
            'q_enc' : 'UTF-8',
            'r_format' : 'json'
        },
        'toggleImg' : {
            'on' : 'img/btn_on.jpg',
            'off' : 'img/btn_off.jpg'
        }
    },
    Default2 = {
        'resultListElement': '._resultBox',
        'searchBoxElement':  '#ac_input1',
        'orgQueryElement' : '#org_query',
        'templateAttribute': {
            'redirect': ['txt', 'url'],
            'srch_with_opt': ['txt', 'insert', 'option'],
            'defaults': ['txt']
        },
        'viewCount' : 12,
        'templateElement' :  {
            'redirect': '<li><a href="@url@" onclick=\"return false;\">@txt@</a></li>',
            'srch': '<li><a href="#" onclick=\"return false;\">@txt@</a></li>',
            'srch_with_opt': '<li><a href="#" onclick=\"return false;\">@txt@ @option@ <strong style="color:gold">@insert@</strong></a></li>',
            'title': '<li><strong>@txt@</strong></li>',
            'defaults': '<li><a href="#" onclick=\"return false;\">@txt@</a></li>'
        },
        'formElement' : '#ac_form1',
        'cookieName' : "usecookie",
        'mouseOverClass' : 'emp',
        'searchApi' : {
            'url' : 'http://119.205.249.132/ac/mock.js',
            'st' : 1,
            'r_lt' : 1,
            'r_enc' : 'UTF-8',
            'q_enc' : 'UTF-8',
            'r_format' : 'json'
        }
    }
}