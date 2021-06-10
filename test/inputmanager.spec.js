var AutoComplete = require('../src/js/autoComplete');

describe('InputManager', function() {
  var im1,
    global = tui.test.global;

  beforeEach(function() {
    var autocom;

    loadFixtures('expand.html');

    autocom = new AutoComplete({
      config: global.Default
    });
    im1 = autocom.inputManager;
  });

  it('to be defined', function() {
    expect(im1).toBeDefined();
    expect(im1.options).toBeDefined();
  });

  it('getValue', function() {
    im1.$searchBox.val('s');
    expect(im1.getValue()).toBe('s');
  });

  it('setParams with array', function() {
    var opt = ['a', 'b'],
      index = '0',
      inputs;

    im1.setParams(opt, index);
    inputs = im1.hiddens.find('input');

    expect(inputs.length).toBe(2);
  });

  it('setParams with string and staticParams', function() {
    var opt = 'a,b',
      index = '2',
      inputs;

    im1.setParams(opt, index);
    inputs = im1.hiddens.find('input');

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
    var autocon = im1.autoCompleteObj,
      eventMock = {
        stopPropagation: function() {}
      };

    jest.spyOn(autocon, 'showResultList');

    im1.setValue('asdf');
    im1.autoCompleteObj.isUse = true;

    im1._onClick(eventMock);
    expect(autocon.showResultList).toHaveBeenCalled();

    autocon.resultManager.$resultList.css({
      // Modify: (v1.1.2) Do not hide
      display: 'block'
    });
    im1._onClick(eventMock);
    expect(autocon.showResultList).toHaveBeenCalled();
  });

  it('자동완성 목록 사용하지 않을 경우 동작하지 않음.', function() {
    var autocon = im1.autoCompleteObj;

    jest.spyOn(autocon, 'showResultList');
    jest.spyOn(autocon, 'hideResultList');

    im1.setValue('asdf');
    im1.autoCompleteObj.isUse = false;

    im1._onClick();

    expect(autocon.showResultList).not.toHaveBeenCalled();
    expect(autocon.hideResultList).not.toHaveBeenCalled();
  });

  it('_onFocus, onWatch', function(done) {
    im1.$searchBox.val('focus');

    jest.spyOn(im1, '_onWatch');

    im1._onFocus();

    setTimeout(function() {
      expect(im1._onWatch).toHaveBeenCalled();
      im1._onBlur();
      done();
    }, 500);
  });

  it('onWatch', function() {
    jest.spyOn(im1, '_onChange');

    im1.$searchBox.val('focus');
    im1._onWatch();

    im1.$searchBox.val('');
    im1._onWatch();

    expect(im1._onChange).toHaveBeenCalled();
  });

  it('onWatch runned with resultManger moved flag', function() {
    jest.spyOn(im1, '_onChange');

    im1.$searchBox.val('asdf');
    im1._onWatch();

    im1.autoCompleteObj.resultManager.isMoved = false;

    im1.$searchBox.val('asdf');
    im1._onWatch();

    expect(im1._onChange).toHaveBeenCalled();
  });

  it('_onKeyDown with up key', function() {
    var autocon = im1.autoCompleteObj;

    autocon.isUse = true;
    autocon.resultManager.$resultList.css({
      display: 'block'
    });

    autocon.moveNextResult = jest.fn();

    im1._onKeyDown({
      keyCode: 38
    });
    expect(im1.isKeyMoving).toBe(true);
    expect(autocon.moveNextResult).toHaveBeenCalled();
  });

  it('_onKeyDown with down key', function() {
    var autocon = im1.autoCompleteObj;

    autocon.isUse = true;
    autocon.resultManager.$resultList.css({
      display: 'block'
    });

    autocon.moveNextResult = jest.fn();

    im1._onKeyDown({
      keyCode: 40
    });
    expect(im1.isKeyMoving).toBe(true);
    expect(autocon.moveNextResult).toHaveBeenCalled();
  });

  it('_onKeyDown with tab key', function() {
    var autocon = im1.autoCompleteObj;

    autocon.isUse = true;
    autocon.resultManager.$resultList.css({
      display: 'block'
    });

    autocon.moveNextResult = jest.fn();

    im1._onKeyDown({
      keyCode: 9,
      preventDefault: function() {}
    });
    expect(im1.isKeyMoving).toBe(true);
    expect(autocon.moveNextResult).toHaveBeenCalled();
  });

  it('_onKeyDown with other key', function() {
    var autocon = im1.autoCompleteObj;

    autocon.isUse = true;
    autocon.resultManager.$resultList.css({
      display: 'block'
    });

    autocon.moveNextResult = jest.fn();

    im1._onKeyDown({
      keyCode: 93
    });
    expect(im1.isKeyMoving).toBe(false);
    expect(autocon.moveNextResult).not.toHaveBeenCalled();
  });

  it('_onKeyDown with down key, but not show resultList', function() {
    var autocon = im1.autoCompleteObj;

    autocon.isUse = true;
    autocon.resultManager.$resultList.css({
      display: 'none'
    });

    autocon.moveNextResult = jest.fn();

    im1._onKeyDown({
      keyCode: 40
    });

    expect(im1.isKeyMoving).toBe(false);
    expect(autocon.moveNextResult).not.toHaveBeenCalled();
  });

  it('_onClickToggle when autoComplete is using, turn off autoComplete', function() {
    var eventMock = {
        stopPropagation: function() {}
      },
      autocon = im1.autoCompleteObj;

    autocon.isUse = true;
    im1._onClickToggle(eventMock);

    expect(autocon.isUse).toBe(false);
  });
});
