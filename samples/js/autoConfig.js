var Default = { // 설정용가능한 항목을 모두 설정한 config
    // 자동완성 결과를 보여주는 엘리먼트
    'resultListElement': '._resultBox',

    // 검색어를 입력하는 input 엘리먼트
    'searchBoxElement':  '#ac_input1',

    // 입력한 검색어를 넘기기 위한 hidden element
    'orgQueryElement' : '#org_query',

    // on,off 버튼 엘리먼트
    'toggleBtnElement' : $("#onoffBtn"),

    // on,off 상태를 알리는 엘리먼트
    'onoffTextElement' : $(".baseBox .bottom"),

    // on, off상태일때 변경 이미지 경로
    'toggleImg' : {
        'on' : 'img/btn_on.jpg',
        'off' : 'img/btn_off.jpg'
    },

    // 컬렉션아이템별 보여질 리스트 겟수
    'viewCount' : 5,

    // 서브쿼리로 넘어갈 키 값들의 배열(컬렉션 명 별로 지정 할 수 있다, 따로 지정하지 않으면 defaults가 적용된다.)
    'subQuerySet': {
        'department': ['key1', 'key2', 'key3'],
        'srch_in_department': ['dep1', 'dep2', 'dep3'],
        'srch': ['ch1', 'ch2', 'ch3'],
        'defaults': ['cid']
    },

    // 컬렉션 타입 별로 표시될 마크업, 데이터가 들어갈 부분은 @key@ 형식으로 사용한다.(지정하지 않으면, defaults가 적용된다.)
    // 형식은 수정 가능하지만, keyword-field는 키워드가 들어가는 부분에 필수로 들어가야함. 단 title에는 들어가면 안됨.
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

    // 컬렉션 별 템플릿에서 사용하고 있는 변수들을 나열한다. (지정하지 않으면defaults가 적용된다)
    'templateAttribute': {
        'defaults': ['subject'],
        'department': ['subject'],
        'srch_in_department': ['subject', 'department']
    },

    // 컬렉션 타입별 form action 을 지정한다. (지정하지 않으면 defaults가 적용된다)
    actions: {
        'department': "http://www.fashiongo.net/catalog.aspx",
        'defaults': "http://www.fashiongo.net/search2.aspx"
    },

    // 타이틀을 보일지 여부
    'useTitle': false,

    // 검색창을 감싸고 있는 form앨리먼트
    'formElement' : '#ac_form1',

    // 자동완성을 끄고 켤때 사용되는 쿠키명
    'cookieName' : "usecookie",

    // 선택된 엘리먼트에 추가되는 클래스명
    'mouseOverClass' : 'emp',

    // 자동완성API url
    'searchUrl' : 'http://10.24.136.172:20011/ac',

    // 자동완성API request 설정
    'searchApi' : {
        'st' : 111,
        'r_lt' : 111,
        'r_enc' : 'UTF-8',
        'q_enc' : 'UTF-8',
        'r_format' : 'json'
    }
}, Plane = { // 필수 항목만 나열한 config
    // 자동완성 결과를 보여주는 엘리먼트
    'resultListElement': '._resultBox',

    // 검색어를 입력하는 input 엘리먼트
    'searchBoxElement':  '#ac_input1',

    // 입력한 검색어를 넘기기 위한 hidden element
    'orgQueryElement' : '#org_query',

    // 컬렉션아이템별 보여질 리스트 겟수
    'viewCount' : 5,

    // 서브쿼리로 넘어갈 키 값들의 배열(컬렉션 명 별로 지정 할 수 있다, 따로 지정하지 않으면 defaults가 적용된다.)
    'subQuerySet': {
        'defaults': ['cid']
    },

    // 컬렉션 타입 별로 표시될 마크업, 데이터가 들어갈 부분은 @key@ 형식으로 사용한다.(지정하지 않으면, defaults가 적용된다.)
    // 형식은 수정 가능하지만, keyword-field는 키워드가 들어가는 부분에 필수로 들어가야함. 단 title에는 들어가면 안됨.
    'templateElement' :  {
        'defaults': '<li><a href="#" class="keyword-field">@subject@</a></li>'
    },

    // 컬렉션 별 템플릿에서 사용하고 있는 변수들을 나열한다. (지정하지 않으면defaults가 적용된다)
    'templateAttribute': {
        'defaults': ['subject'],
    },

    // 컬렉션 타입별 form action 을 지정한다. (지정하지 않으면 defaults가 적용된다)
    actions: {
        'defaults': "http://www.fashiongo.net/search2.aspx"
    },

    // 검색창을 감싸고 있는 form앨리먼트
    'formElement' : '#ac_form1',

    // 자동완성API url
    'searchUrl' : 'http://10.24.136.172:20011/ac',

    // 자동완성API request 설정
    'searchApi' : {
        'st' : 111,
        'r_lt' : 111,
        'r_enc' : 'UTF-8',
        'q_enc' : 'UTF-8',
        'r_format' : 'json'
    }
};