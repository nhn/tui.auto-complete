describe('DataManager 생성 및 테스트', function() {

    var dm1,
        dm2,
        dm3;

    beforeEach(function() {

        jasmine.getFixtures().fixturesPath = 'base';
        loadFixtures('test/fixture/expand.html');

        var autocom = new ne.component.AutoComplete({config:Plane});
        var autocom2 = new ne.component.AutoComplete({config:Default});
        dm1 = autocom.dataManager;
        dm2 = autocom2.dataManager;
        dm3 = new ne.component.AutoComplete.DataManager(Default);

    });

    it('to be defined', function() {
        expect(dm1).toBeDefined();
        expect(dm2).toBeDefined();
        expect(dm1.options).toBeDefined();
        expect(dm2.options).toBeDefined();
    });

    it('to be defined but not normally', function() {
        expect(dm3).toBeDefined();
        expect(dm3.options).not.toBeDisabled();
    });

    it('getCollectionData return array of collection data', function() {
        var arr = dm1._getCollectionData(mock);
        var arr2 = dm2._getCollectionData(n_mock);
        expect(arr).toBeDefined();
        expect(arr.length).toBeDefined();
        expect(arr2).toBeDefined();
        expect(arr2.length).toBe(0);

    });

    it('request', function() {

        dm1.options = {};
        dm1.request("s");

        dm1.options.searchApi = '../data.js';
        dm1.request(" ");

    });

});