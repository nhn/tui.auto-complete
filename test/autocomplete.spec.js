var AutoComplete = require('../src/js/autoComplete');

describe('자동완성 컴포넌트를 생성하고 기능을 테스트한다.', function() {
    var autoComplete,
        resultManager,
        inputManager,
        global = tui.test.global;

    beforeEach(function() {
        loadFixtures('expand.html');
        $('#ac_input1').val('운동화');

        // 객체 생성
        autoComplete = new AutoComplete({'config': global.Default});
        resultManager = autoComplete.resultManager;
        inputManager = autoComplete.inputManager;
    });

    // OK
    it('AutoComplete, Manager 객체가 생성되는지 테스트한다.', function() {
        var A = new AutoComplete({
            config: global.Default
        });

        expect(A).toEqual(jasmine.any(Object));

        // 객체 생성 판단
        resultManager = A.resultManager;
        inputManager = A.inputManager;

        expect(inputManager).toBeTruthy();
        expect(resultManager).toBeTruthy();
    });

    it('키워드 하이라이팅이 제대로 되는가.', function() {
        resultManager = autoComplete.resultManager;

        // 검색어 입력
        autoComplete.setValue('운동화');
        autoComplete.request('운동화');

        // 키워드 하이라이트 처리 테스트
        autoComplete.queries = ['나이키'];
        expect(resultManager._highlight('나이키 에어')).toBe('<strong>나이키</strong> 에어');
        autoComplete.queries = ['TEST'];
        expect(resultManager._highlight('나이키 에어')).toBe('나이키 에어');
    });

    // OK
    it('자동완성 기능을 사용안함으로 설정되는가.', function() {
        // 자동완성 기능 사용 안함 설정
        autoComplete.setCookieValue(false);
        expect(autoComplete.isUseAutoComplete()).toBeFalsy();
        autoComplete.hideResultList();
    });

    it('(검색어 결과가 있는 경우)검색어 입력 후, 검색 결과가 있는가.', function() {
        var eventMock = {
            stopPropagation: function() {}
        };

        autoComplete.setCookieValue(true);
        autoComplete.setValue('운동화');

        expect($('._resultBox')).not.toBeEmpty();
        expect($('._resultBox > li')).not.toBeEmpty();
        expect(inputManager).toBeDefined();

        autoComplete.setCookieValue(false);
        inputManager._onClickToggle(eventMock);
    });

    it('자동완성 끄기/켜기 기능이 제대로 동작하는가.', function() {
        var $onOffTxt = $('.baseBox .bottom');

        resultManager.changeOnOffText(true);
        expect($('#onofftext').text()).toEqual('자동완성 끄기');

        resultManager.changeOnOffText(false);
        expect($onOffTxt.css('display')).toEqual('none');

        resultManager._useAutoComplete();
        expect(resultManager.isShowResultList()).toBeFalsy();
    });
});
