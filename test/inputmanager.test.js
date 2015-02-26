describe('InputManager', function() {
    var im1,
        im2;
    beforeEach(function() {

        jasmine.getFixtures().fixturesPath = 'base';
        loadFixtures('test/fixture/expand.html');

        var autocom = new ne.component.AutoComplete({config:Default});
        im1 = autocom.inputManager;
        im2 = new ne.component.AutoComplete.InputManager(Default);

    });
    it('to be defined', function() {
        expect(im1).toBeDefined();
        expect(im1.options).toBeDefined();
    });

    it('to be defined but not normally', function() {
        expect(im2).toBeDefined();
        expect(im2.options).not.toBeDisabled();
    });

    //it('getValue', function() {
    //    im1.$searchBox.val('s');
    //    expect(im1.getValue()).toBe('s');
    //});

    it('setParams with array', function() {
        var opt = ['a', 'b'],
            index = '0';

        im1.setParams(opt, index);


        var inputs = im1.hiddens.find('input');

        expect(inputs.length).toBe(2);

    });

    it('setParams with string and staticParams', function() {
        var opt = 'a,b',
            index = '2';

        im1.setParams(opt, index);


        var inputs = im1.hiddens.find('input');

        expect(inputs.length).toBe(3);

    });

    it('setParams with noting', function() {
        var opt = '',
            index = '0';

        im1.setParams(opt, index);


        expect(im1.hiddens).not.toBeDefined();


    });

    it('_setOrgQuery', function() {

        var query = 'asdf';

        im1._setOrgQuery(query);

        expect(im1.$orgQuery.val()).toBe(query);

    });

    it('검색창 클릭시 리스트 영역 동작.', function() {

        var autocon = im1.autoCompleteObj;

        spyOn(autocon, 'showResultList');
        spyOn(autocon, 'hideResultList');

        im1.setValue('asdf');
        im1.autoCompleteObj.isUse = true;

        im1._onClick();
        expect(autocon.showResultList).toHaveBeenCalled();

        autocon.resultManager.$resultList.css({
            display: 'block'
        });
        im1._onClick();
        expect(autocon.hideResultList).toHaveBeenCalled();

    });


    it('자동완성 목록 사용하지 않을 경우 동작하지 않음.', function() {

        var autocon = im1.autoCompleteObj;

        spyOn(autocon, 'showResultList');
        spyOn(autocon, 'hideResultList');

        im1.setValue('asdf');
        im1.autoCompleteObj.isUse = false;

        im1._onClick();

        expect(autocon.showResultList).not.toHaveBeenCalled();
        expect(autocon.hideResultList).not.toHaveBeenCalled();

    });

    it('_onFocus, onWatch', function(done) {

        im1.$searchBox.val('focus');

        spyOn(im1, '_onWatch');

        im1._onFocus();


        setTimeout(function() {
            expect(im1._onWatch).toHaveBeenCalled();
            im1._onBlur();
            done();
        }, 500);

    });


    it('onWatch', function() {

        spyOn(im1, '_onChange');


        im1.$searchBox.val('focus');
        im1._onWatch();

        im1.$searchBox.val('');
        im1._onWatch();


        expect(im1._onChange).toHaveBeenCalled();

    });

    it('onWatch runned with resultManger moved flag', function () {

        spyOn(im1, '_onChange');

        im1.$searchBox.val('asdf');
        im1._onWatch();

        im1.autoCompleteObj.resultManager.isMoved = false;

        im1.$searchBox.val('asdf');
        im1._onWatch();

        expect(im1._onChange).toHaveBeenCalled();

    });

    it('_onKeyUp called onChange', function() {

        spyOn(im1, '_onChange');

        im1.$searchBox.val('asdf');

        im1._onKeyUp();

        expect(im1._onChange).toHaveBeenCalled();

    });

    it('_onKeyUp same keyword not called onChange', function() {

        im1.inputValue = 'asdf';

        spyOn(im1, '_onChange');

        im1.$searchBox.val('asdf');

        im1._onKeyUp();

        expect(im1._onChange).not.toHaveBeenCalled();

    });

    it('_onKeyDown with up key', function() {

        var autocon = im1.autoCompleteObj;
        autocon.isUse = true;
        autocon.resultManager.$resultList.css({
            display: 'block'
        });

        spyOn(autocon, 'moveNextList');

        im1._onKeyDown({
            keyCode: 38
        });

        expect(autocon.moveNextList).toHaveBeenCalled();

    });

    it('_onKeyDown with down key', function() {

        var autocon = im1.autoCompleteObj;
        autocon.isUse = true;
        autocon.resultManager.$resultList.css({
            display: 'block'
        });

        spyOn(autocon, 'moveNextList');

        im1._onKeyDown({
            keyCode: 40
        });

        expect(autocon.moveNextList).toHaveBeenCalled();

    });

    it('_onKeyDown with tab key', function() {

        var autocon = im1.autoCompleteObj;
        autocon.isUse = true;
        autocon.resultManager.$resultList.css({
            display: 'block'
        });

        spyOn(autocon, 'moveNextList');

        im1._onKeyDown({
            keyCode: 9,
            preventDefault: function() {

            }
        });

        expect(autocon.moveNextList).toHaveBeenCalled();

    });

    it('_onKeyDown with other key', function() {

        var autocon = im1.autoCompleteObj;
        autocon.isUse = true;
        autocon.resultManager.$resultList.css({
            display: 'block'
        });

        spyOn(autocon, 'moveNextList');

        im1._onKeyDown({
            keyCode: 93
        });

        expect(autocon.moveNextList).not.toHaveBeenCalled();

    });


    it('_onKeyDown with down key, but not show resultList', function() {

        var autocon = im1.autoCompleteObj;
        autocon.isUse = true;
        autocon.resultManager.$resultList.css({
            display: 'none'
        });

        spyOn(autocon, 'moveNextList');

        im1._onKeyDown({
            keyCode: 40
        });

        expect(autocon.moveNextList).not.toHaveBeenCalled();

    });

});