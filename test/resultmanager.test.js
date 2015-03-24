describe('ResultManager', function() {
    var rm1,
        rm2;
    beforeEach(function() {

        jasmine.getFixtures().fixturesPath = 'base';
        loadFixtures('test/fixture/expand.html');

        var autocom = new ne.component.AutoComplete({config:Default});
        rm1 = autocom.resultManager;
        var autocom1 = new ne.component.AutoComplete({config:Plane});
        rm2 = autocom1.resultManager;

    });

    it('to be defined', function() {
        expect(rm1).toBeDefined();
        expect(rm2).toBeDefined();
    });


    it('draw data with Title', function() {

        var autocon = rm1.autoCompleteObj,
            dm = autocon.dataManager,
            data = dm._getCollectionData(mock);

        rm1.draw(data);

        expect(autocon.isVisibleResult()).toBeTruthy();

    });

    it('draw data with no Title', function() {
        var autocon = rm2.autoCompleteObj,
            dm = autocon.dataManager,
            data = dm._getCollectionData(mock);

        rm2.draw(data);

        expect(autocon.isVisibleResult()).toBeTruthy();
    });

    it('_getTmplData', function() {
        var td = rm1._getTmplData(['a', 'b', 'c'], {values: ['v1', 'v2', 'v3']}),
            td2 = rm1._getTmplData(['a', 'b', 'c'], 'v1');

        expect(td.a).toBe('v1');
        expect(td.b).toBe('v2');
        expect(td.c).toBe('v3');
        expect(td2.a).toBe('v1');

    });


    it('moveNextList without selectedElement', function() {
        var autocon = rm1.autoCompleteObj,
            dm = autocon.dataManager,
            data = dm._getCollectionData(mock),g
            bMove = rm1.isMoved;

        rm1.draw(data);
        rm1.moveNextList('next');

        expect(bMove).not.toBe(rm1.isMoved);

    });

    it('moveNextList with selectedElement', function() {
        var autocon = rm1.autoCompleteObj,
            dm = autocon.dataManager,
            data = dm._getCollectionData(mock),
            bSel, aSel;

        rm1.draw(data);
        rm1.moveNextList('next');

        bSel = rm1.selectedElement;
        rm1.moveNextList('next');
        aSel = rm1.selectedElement;

        expect(bSel).not.toBe(aSel);
    });


});