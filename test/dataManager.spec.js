var AutoComplete = require('../src/js/autoComplete');
var config = require('./autoConfig');
var mock = require('./mock');

describe('DataManager', function() {
  var dm1, dm2;

  beforeAll(function() {
    jasmine.getFixtures().fixturesPath = 'base/test/fixtures';
  });

  beforeEach(function() {
    var ac;
    loadFixtures('expand.html');

    ac = new AutoComplete({ config: config.planeConfig });
    dm1 = ac.dataManager;

    ac = new AutoComplete({ config: config.defaultConfig });
    dm2 = ac.dataManager;
  });

  it('getCollectionData should return an array of collection data', function() {
    var arr = dm1._getCollectionData(mock.mock);
    var arr2 = dm2._getCollectionData(mock.n_mock);

    expect(arr).toBeDefined();
    expect(arr.length).toBeDefined();
    expect(arr2).toBeDefined();
    expect(arr2.length).toBe(0);
  });
});
