{
    Default1 = {
        'resultListElement': '._resultBox',
        'searchBoxElement':  '#ac_input1',
        'orgQueryElement' : '#org_query',
        'viewCount' : 5,
        'subQuerySet': {
            'department': ['key1', 'key2', 'key3'],
            'srch_in_department': ['dep1', 'dep2', 'dep3'],
            'srch': ['ch1', 'ch2', 'ch3'],
            'defaults': ['cid']
        },
        'templateElement' :  {
            'title': '<li class="title"><strong>@subject@</strong></li>',
            'defaults': '<li><a href="#" class="keyword-field">@subject@</a></li>'
        },
        'templateAttribute': {
            'defaults': ['subject']
        },
        actions: {
            'defaults': "http://www.popshoes.co.kr/app/product/search"
        },
        'useTitle': true,
        'formElement' : '#ac_form1',
        'cookieName' : "usecookie",
        'mouseOverClass' : 'emp',
        'searchUrl' : 'http://localhost:63342/Component-AutoComplete/server/mock.js',

        //'searchUrl' : 'http://10.24.136.172:20011/ac',
        'searchApi' : {
            'st' : 111,
            'r_lt' : 111,
            'r_enc' : 'UTF-8',
            'q_enc' : 'UTF-8',
            'r_format' : 'json'
        }
    },
    Default2 = {

        'resultListElement': '._resultBox',
        'searchBoxElement':  '#ac_input1',
        'orgQueryElement' : '#org_query',
        'viewCount' : 10,
        'subQuerySet': {
            'department': ['key1', 'key2', 'key3'],
            'srch_in_department': ['dep1', 'dep2', 'dep3'],
            'srch': ['ch1', 'ch2', 'ch3'],
            'defaults': ['cid']
        },
        'templateElement' :  {
            'department':   '<li class="department">' +
                                '<span class="slot-field">Shop the</span> ' +
                                '<a href="#" class="keyword-field">@subject@</a> ' +
                                '<span class="slot-field">Store</span>' +
                            '</li>',
            'srch': '<li class="srch"><span class="keyword-field">@subject@</span></li>',
            'srch_in_department':   '<li class="inDepartment">' +
                                        '<a href="#" class="keyword-field">@subject@</a> ' +
                                        '<span class="slot-field">in </span>' +
                                        '<span class="depart-field">@department@</span>' +
                                    '</li>',
            'title': '<li class="title"><strong>@subject@</strong></li>',
            'defaults': '<li><a href="#" class="keyword-field">@subject@</a></li>'
        },
        'templateAttribute': {
            'defaults': ['subject'],
            'department': ['subject'],
            'srch_in_department': ['subject', 'department']
        },
        actions: {
            'department': "http://www.fashiongo.net/catalog.aspx",
            'defaults': "http://www.fashiongo.net/search2.aspx"
        },
        'useTitle': false,
        'formElement' : '#ac_form1',
        'cookieName' : "usecookie",
        'mouseOverClass' : 'emp',
        'searchUrl' : 'http://10.24.136.172:20011/ac',
        'searchApi' : {
            'st' : 111,
            'r_lt' : 111,
            'r_enc' : 'UTF-8',
            'q_enc' : 'UTF-8',
            'r_format' : 'json'
        }
    }
}
