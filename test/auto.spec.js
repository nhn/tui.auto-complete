describe('자동완성 컴포넌트를 생성하고 기능을 테스트한다.', function() {

    var html,
        autoComplete,
        $searchBox,
        resultManager,
        inputManager;

    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base';
        loadFixtures('test/fixture/expand.html');

        $("#ac_input1").val('운동화');

        //객체 생성
        autoComplete = new ne.component.AutoComplete({'configId' : 'Default2'});
        resultManager = autoComplete.resultManager;
        inputManager = autoComplete.inputManager;

        $searchBox = $("#ac_input1");
    });

    //OK
    it('AutoComplete, Manager 객체가 생성되는지 테스트한다.', function() {
        var A = new ne.component.AutoComplete({'configId' : 'Default2'});
        expect(A).toEqual(jasmine.any(Object));

        var resultManager = A.resultManager;
        var inputManager = A.inputManager;

        //객체 생성 판단
        expect(inputManager).toBeTruthy();
        expect(resultManager).toBeTruthy();
    });


    it('키워드 하이라이팅이 제대로 되는가.', function() {
        var A = new ne.component.AutoComplete({'configId' : 'Default2'}),
            resultManager = A.resultManager;

        //검색어 입력
        A.setValue('운동화');
        A.request('운동화');

        //키워드 하이라이트 처리 테스트
        A.querys = ['나이키'];
        expect(resultManager._highlight('나이키 에어')).toBe('<strong>나이키 </strong>에어');
        A.querys = ['TEST'];
        expect(resultManager._highlight('나이키 에어')).toBe('나이키 에어');
    });


    //OK
    it('자동완성 기능을 사용안함으로 설정되는가.', function() {
        var A = new ne.component.AutoComplete({'configId' : 'Default2'});

        //자동완성 기능 사용 안함 설정
        A.setCookieValue(false);
        expect(A.isUseAutoComplete()).toBeFalsy();
        A.hideResultList();
    });


    it('(검색어 결과가 있는 경우)검색어 입력 후, 검색 결과가 있는가.', function() {
        autoComplete.setCookieValue(true);
        autoComplete.setValue('운동화');

        expect($("._resultBox")).not.toBeEmpty();
        expect($("._resultBox > li")).not.toBeEmpty();
        expect(inputManager).toBeDefined();

        autoComplete.setCookieValue(false);
        inputManager._onClickToggle();
    });

    it('자동완성 끄기/켜기 기능이 제대로 동작하는가.' , function() {
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
});
