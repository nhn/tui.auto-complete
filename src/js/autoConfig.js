{
    Default = {
        'resultListElement': $("._resultBox"),
        'searchBoxElement': $("#ac_input1"),
        'orgQueryElement' : '#org_query',
        'templateAttribute': {
            'defaults': ['txt']
        },
        'templateElement' :  {
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
            'defaults': ['txt'],
            'department': ['txt', 'params'],
            'srch_in_department': ['txt', 'department', 'params']
        },
        'useTitle': false,
        'viewCount' : 12,
        'templateElement' :  {
            'department':   '<li class="department">' +
                                '<span class="slot-field">Shop the</span>\n' +
                                '<span class="keyword-field" data-params="@params@">@txt@</span>\n ' +
                                '<span class="slot-field">Store</span>' +
                            '</li>',
            'srch': '<li class="srch"><span class="keyword-field">@txt@</span></li>',
            'srch_in_department':   '<li class="inDepartment">' +
                                        '<span class="keyword-field" data-params="@params@">@txt@</span>\n' +
                                        '<span class="slot-field">in</span>\n' +
                                        '<span class="depart-field">@department@</span>' +
                                    '</li>',
            'title': '<li class="title"><strong>@txt@</strong></li>',
            'defaults': '<li><span class="keyword-field">@txt@</span></li>'
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