var AutoComplete = require('../src/js/AutoComplete'),
    DataManager = require('../src/js/manager/data'),
    Mock = require('./mock'),
    config = require('./autoConfig');

var Default = config.Default,
    Plane = config.Plane,
    mock = Mock.mock,
    n_mock = Mock.n_mock;

jasmine.getFixtures().fixturesPath = 'base';
describe('DataManager 생성 및 테스트', function() {
    var dm1, dm2, dm3;

    beforeEach(function() {
        var ac;
        loadFixtures('test/fixture/expand.html');

        ac = new AutoComplete({config:Plane});
        dm1 = ac.dataManager;
        ac = new AutoComplete({config:Default});
        dm2 = ac.dataManager;

        dm3 = new DataManager(Default);
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
        var arr = dm1._getCollectionData(mock),
            arr2 = dm2._getCollectionData(n_mock);

        expect(arr).toBeDefined();
        expect(arr.length).toBeDefined();
        expect(arr2).toBeDefined();
        expect(arr2.length).toBe(0);
    });

    //it('request', function() {
    //    dm1.options = {};
    //    dm1.request("s");
    //
    //    dm1.options.searchApi = '../data.js';
    //    dm1.request(" ");
    //});
});
