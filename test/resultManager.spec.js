var AutoComplete = require('../src/js/autoComplete');
var config = require('./autoConfig');
var mock = require('./mock').mock;

describe('ResultManager', function() {
  var rm1, rm2;

  beforeAll(function() {
    jasmine.getFixtures().fixturesPath = 'base/test/fixtures';
  });

  beforeEach(function() {
    var ac;
    loadFixtures('expand.html');

    ac = new AutoComplete({ config: config.defaultConfig });
    rm1 = ac.resultManager;

    ac = new AutoComplete({ config: config.planeConfig });
    rm2 = ac.resultManager;
  });

  it('should draw data with a title.', function() {
    var autocon = rm1.autoCompleteObj;
    var dm = autocon.dataManager;
    var data = dm._getCollectionData(mock);

    rm1.draw(data);
    expect(autocon.isShowResultList()).toBeTruthy();
  });

  it('should draw data without a title.', function() {
    var autocon = rm2.autoCompleteObj
    var dm = autocon.dataManager
    var data = dm._getCollectionData(mock);

    rm2.draw(data);
    expect(autocon.isShowResultList()).toBeTruthy();
  });

  it('should make template data by _getTmplData.', function() {
    var td = rm1._getTmplData(['a', 'b', 'c'], { values: ['v1', 'v2', 'v3'] });
    var td2 = rm1._getTmplData(['a', 'b', 'c'], 'v1');

    expect(td.a).toBe('v1');
    expect(td.b).toBe('v2');
    expect(td.c).toBe('v3');
    expect(td2.a).toBe('v1');
  });

  it('moveNextResult should set the selected element to the first child of resultList.', function() {
    var autocon = rm1.autoCompleteObj
    var dm = autocon.dataManager
    var data = dm._getCollectionData(mock);

    rm1.draw(data);
    rm1.moveNextResult('next');

    expect(rm1.$selectedElement[0]).not.toBe(rm1.$resultList.children().first());
  });

  it('should move to next result with the selected element.', function() {
    var autocon = rm1.autoCompleteObj;
    var dm = autocon.dataManager;
    var data = dm._getCollectionData(mock);
    var bSel, aSel;

    rm1.draw(data);
    rm1.moveNextResult('next');

    bSel = rm1.$selectedElement;
    rm1.moveNextResult('next');
    aSel = rm1.$selectedElement;

    expect(bSel.next()[0]).toBe(aSel[0]);
  });

  it('should make queries strong (bold).', function() {
    var text = 'dkfjdkfj 65 _ 2 * G+ T 9"76asdl65g65_2Gt965_2*G+t9';
    var query = '65_2*G+t9';
    var result = rm1._makeStrong(text, query);
    expect(result).toEqual(
      'dkfjdkfj <strong>65 _ 2 * G+ T 9</strong>"' +
        '76asdl65g65_2Gt9' +
        '<strong>65_2*G+t9</strong>'
    );
  });
});
