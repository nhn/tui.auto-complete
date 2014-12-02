describe('AutoComplete 모듈 테스트', function() {

    it('AutoComplete 객체를 생성한다.', function() {
        var obj = new ne.autoComplete.AutoComplete({"configId" : "Default"});
        expect(obj).toEqual(jasmine.any(Object));
    });

    it('AutoComplete 기능 테스트', function() {
        //객체 생성
        var A = new ne.autoComplete.AutoComplete({'configId' : 'Default'});

        //검색어 입력
        A.setValue('운동화');
        A.request('운동화');



        var resultManager = A.resultManager;
        var inputManager = A.inputManager;

        //객체 생성 판단
        expect(inputManager).toBeTruthy();
        expect(resultManager).toBeTruthy();

        //키워드 하이라이트 처리 테스트
        expect(resultManager._highlight('나이키 에어', '나이키')).toBe('<strong>나이키 </strong>에어');
        expect(resultManager._highlight('나이키 에어', 'TEST')).toBe('나이키 에어');

        //자동완성 기능 사용 안함 설정
        A.setCookieValue(false);
        expect(A.isUseAutoComplete()).toBeFalsy();
        A.hideResultList();
    });


    var html, autoComplete;
    var $searchBox;
    var resultManager;
    var inputManager;

    beforeEach(function() {
        html = [


            '<form id="ac_form1" method="get" action="http://www.popshoes.co.kr/app/product/search" onsubmit="">',
                '<div class="inputBox">',
                    '<input class="inputBorder" id="ac_input1" type="text" name="query">',
                        '<img class="onoff" id="onoffBtn" src="img/on.jpg">',
                        '</div>',
                        '<div class="suggestBox" id="ac_view1" style="width:365px; background-color:#ffffff;">',
                            '<div class="baseBox">',
                                '<ul class="_resultBox" style="display:none; background-color:#ffffff;">',
                                    '<li style="background-color:#efefef;"><a href="#" onclick="return false;" title="">@txt@</a></li>',
                                '</ul>',
                                '<p id="onofftext" class="bottom" style="display:none;">자동완성 끄기</p>',
                            '</div>',
                        '</div>',
                    '</form>'
        ];

        jasmine.getFixtures().set(html.join(''));
        $("#ac_input1").val('운동화');

        //객체 생성
        autoComplete = new ne.autoComplete.AutoComplete({'configId' : 'Default'});
        $searchBox = $("#ac_input1");

        resultManager = autoComplete.resultManager;
        inputManager = autoComplete.inputManager;
    });

    it('검색어 입력 후, 검색 결과가 있는지 확인한다.', function() {
        autoComplete.setCookieValue(true);
        autoComplete.setValue('운동화');

        expect($("._resultBox")).not.toBeEmpty();
        expect($("._resultBox > li")).not.toBeEmpty();
        expect(inputManager).toBeDefined();

        autoComplete.setCookieValue(false);
        inputManager._onClickToggle();
    });

    it('ResultManager 기능 테스트' , function() {
        resultManager.showResultList();
        resultManager.changeOnOffText(true);
        expect($("#onofftext").text()).toEqual("자동완성 끄기");
        resultManager.changeOnOffText(false);

        var $onOffTxt = $(".baseBox .bottom");
        resultManager._hideBottomArea();
        expect($onOffTxt.css('display')).toEqual('none');

        resultManager._useAutoComplete();
        expect(resultManager.isShowResultList()).toBeFalsy();
    });

    it('API검색결과가 나오지 않는 검색어 입력시 결과 영역이 보이지 않는다.', function() {
        autoComplete.setValue('소녀시대');
        autoComplete.request('소녀시대');

        var $onOffTxt = $(".baseBox .bottom");
        expect($onOffTxt.css('display')).toEqual('none');
    });
});
