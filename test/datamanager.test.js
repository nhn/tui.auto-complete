'use strict';
var AutoComplete = require('../src/js/autoComplete'),
    DataManager = require('../src/js/manager/data');

describe('DataManager 생성 및 테스트', function() {
    var dm1, dm2, dm3,
        global = tui.test.global;

    beforeEach(function() {
        var ac;
        loadFixtures('expand.html');
        ac = new AutoComplete({
            config: global.Plane
        });
        dm1 = ac.dataManager;

        ac = new AutoComplete({
            config: global.Default
        });
        dm2 = ac.dataManager;

        dm3 = new DataManager(global.Default);
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
        var arr = dm1._getCollectionData(global.mock),
            arr2 = dm2._getCollectionData(global.n_mock);

        expect(arr).toBeDefined();
        expect(arr.length).toBeDefined();
        expect(arr2).toBeDefined();
        expect(arr2.length).toBe(0);
    });
});
