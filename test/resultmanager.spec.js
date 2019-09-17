var AutoComplete = require('../src/js/autoComplete');

describe('ResultManager', function() {
  var rm1,
    rm2,
    global = tui.test.global;

  beforeEach(function() {
    var ac;

    loadFixtures('expand.html');
    ac = new AutoComplete({
      config: global.Default
    });
    rm1 = ac.resultManager;

    ac = new AutoComplete({
      config: global.Plane
    });
    rm2 = ac.resultManager;
  });

  it('to be defined', function() {
    expect(rm1).toBeDefined();
    expect(rm2).toBeDefined();
  });

  it('draw data with Title', function() {
    var autocon = rm1.autoCompleteObj,
      dm = autocon.dataManager,
      data = dm._getCollectionData(global.mock);

    rm1.draw(data);
    expect(autocon.isShowResultList()).toBeTruthy();
  });

  it('draw data with no Title', function() {
    var autocon = rm2.autoCompleteObj,
      dm = autocon.dataManager,
      data = dm._getCollectionData(global.mock);

    rm2.draw(data);
    expect(autocon.isShowResultList()).toBeTruthy();
  });

  it('_getTmplData', function() {
    var td = rm1._getTmplData(['a', 'b', 'c'], { values: ['v1', 'v2', 'v3'] }),
      td2 = rm1._getTmplData(['a', 'b', 'c'], 'v1');

    expect(td.a).toBe('v1');
    expect(td.b).toBe('v2');
    expect(td.c).toBe('v3');
    expect(td2.a).toBe('v1');
  });

  // Modify - v1.1.2: remove "isMoved" flag
  it('moveNextResult will set the selectedElement to first-child of resultList', function() {
    var autocon = rm1.autoCompleteObj,
      dm = autocon.dataManager,
      data = dm._getCollectionData(global.mock);

    rm1.draw(data);
    rm1.moveNextResult('next');

    expect(rm1.$selectedElement[0]).not.toBe(rm1.$resultList.children().first());
  });

  it('moveNextResult with selectedElement', function() {
    var autocon = rm1.autoCompleteObj,
      dm = autocon.dataManager,
      data = dm._getCollectionData(global.mock),
      bSel,
      aSel;

    rm1.draw(data);
    rm1.moveNextResult('next');

    bSel = rm1.$selectedElement;
    rm1.moveNextResult('next');
    aSel = rm1.$selectedElement;

    expect(bSel.next()[0]).toBe(aSel[0]);
  });

  it('makeStrong', function() {
    var text = 'dkfjdkfj 65 _ 2 * G+ T 9"76asdl65g65_2Gt965_2*G+t9',
      query = '65_2*G+t9',
      result;

    result = rm1._makeStrong(text, query);
    expect(result).toEqual(
      'dkfjdkfj <strong>65 _ 2 * G+ T 9</strong>"' +
        '76asdl65g65_2Gt9' +
        '<strong>65_2*G+t9</strong>'
    );
  });
});
