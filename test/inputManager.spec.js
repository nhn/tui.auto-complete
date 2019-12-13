var AutoComplete = require('../src/js/autoComplete');
var defaultConfig = require('./autoConfig').defaultConfig;

describe('InputManager', function() {
  var im1;

  beforeAll(function() {
    jasmine.getFixtures().fixturesPath = 'base/test/fixtures';
  });

  beforeEach(function() {
    var autocom;
    loadFixtures('expand.html');

    autocom = new AutoComplete({ config: defaultConfig });
    im1 = autocom.inputManager;
  });

  it('should get a value.', function() {
    im1.$searchBox.val('s');
    expect(im1.getValue()).toBe('s');
  });

  it('should set parameters with an array.', function() {
    var opt = ['a', 'b'];
    var index = '0';
    var inputs;

    im1.setParams(opt, index);
    inputs = im1.hiddens.find('input');

    expect(inputs.length).toBe(2);
  });

  it('should set parameters with string and staticParams', function() {
    var opt = 'a,b';
    var index = '2';
    var inputs;

    im1.setParams(opt, index);
    inputs = im1.hiddens.find('input');

    expect(inputs.length).toBe(3);
  });

  it('should set parameters with empty string.', function() {
    var opt = '';
    var index = '0';

    im1.setParams(opt, index);

    expect(im1.hiddens).not.toBeDefined();
  });

  it('should save user queries by _setOrgQuery.', function() {
    var query = 'asdf';

    im1._setOrgQuery(query);

    expect(im1.$orgQuery.val()).toBe(query);
  });

  it('should show the result list when click the search bar.', function() {
    var autocon = im1.autoCompleteObj;
    var eventMock = {
      stopPropagation: function() {}
    };

    spyOn(autocon, 'showResultList');

    im1.setValue('asdf');
    im1.autoCompleteObj.isUse = true;

    im1._onClick(eventMock);
    expect(autocon.showResultList).toHaveBeenCalled();

    autocon.resultManager.$resultList.css({
      display: 'block'
    });
    im1._onClick(eventMock);
    expect(autocon.showResultList).toHaveBeenCalled();
  });

  it('should not show and hide the result list when turn off the auto-complete.', function() {
    var autocon = im1.autoCompleteObj;

    spyOn(autocon, 'showResultList');
    spyOn(autocon, 'hideResultList');

    im1.setValue('asdf');
    im1.autoCompleteObj.isUse = false;

    im1._onClick();

    expect(autocon.showResultList).not.toHaveBeenCalled();
    expect(autocon.hideResultList).not.toHaveBeenCalled();
  });

  it('should watch the input element when it is focused.', function(done) {
    im1.$searchBox.val('focus');

    spyOn(im1, '_onWatch');

    im1._onFocus();

    setTimeout(function() {
      expect(im1._onWatch).toHaveBeenCalled();
      im1._onBlur();
      done();
    }, 500);
  });

  it('should watch to check update the input element.', function() {
    spyOn(im1, '_onChange');

    im1.$searchBox.val('focus');
    im1._onWatch();

    im1.$searchBox.val('');
    im1._onWatch();

    expect(im1._onChange).toHaveBeenCalled();
  });

  it('should watch if resultManager\'s isMoved is true.', function() {
    spyOn(im1, '_onChange');

    im1.$searchBox.val('asdf');
    im1._onWatch();

    im1.autoCompleteObj.resultManager.isMoved = false;

    im1.$searchBox.val('asdf');
    im1._onWatch();

    expect(im1._onChange).toHaveBeenCalled();
  });

  it('should move to next result when press the up arrow key.', function() {
    var autocon = im1.autoCompleteObj;

    autocon.isUse = true;
    autocon.resultManager.$resultList.css({
      display: 'block'
    });

    spyOn(autocon, 'moveNextResult');

    im1._onKeyDown({
      keyCode: 38
    });
    expect(im1.isKeyMoving).toBe(true);
    expect(autocon.moveNextResult).toHaveBeenCalled();
  });

  it('should move to next result when press the down arrow key.', function() {
    var autocon = im1.autoCompleteObj;

    autocon.isUse = true;
    autocon.resultManager.$resultList.css({
      display: 'block'
    });

    spyOn(autocon, 'moveNextResult');

    im1._onKeyDown({
      keyCode: 40
    });
    expect(im1.isKeyMoving).toBe(true);
    expect(autocon.moveNextResult).toHaveBeenCalled();
  });

  it('should move to next result when press the tab key.', function() {
    var autocon = im1.autoCompleteObj;

    autocon.isUse = true;
    autocon.resultManager.$resultList.css({
      display: 'block'
    });

    spyOn(autocon, 'moveNextResult');

    im1._onKeyDown({
      keyCode: 9,
      preventDefault: function() {}
    });
    expect(im1.isKeyMoving).toBe(true);
    expect(autocon.moveNextResult).toHaveBeenCalled();
  });

  it('should not move to next result when press others.', function() {
    var autocon = im1.autoCompleteObj;

    autocon.isUse = true;
    autocon.resultManager.$resultList.css({
      display: 'block'
    });

    spyOn(autocon, 'moveNextResult');

    im1._onKeyDown({
      keyCode: 93
    });
    expect(im1.isKeyMoving).toBe(false);
    expect(autocon.moveNextResult).not.toHaveBeenCalled();
  });

  it('should not move in the result list when the result list is hidden.', function() {
    var autocon = im1.autoCompleteObj;

    autocon.isUse = true;
    autocon.resultManager.$resultList.css({
      display: 'none'
    });

    spyOn(autocon, 'moveNextResult');

    im1._onKeyDown({
      keyCode: 40
    });

    expect(im1.isKeyMoving).toBe(false);
    expect(autocon.moveNextResult).not.toHaveBeenCalled();
  });

  it('should toggle the button to turn on and off the auto-complete.', function() {
    var eventMock = {
      stopPropagation: function() {}
    };
    var autocon = im1.autoCompleteObj;

    autocon.isUse = true;
    im1._onClickToggle(eventMock);

    expect(autocon.isUse).toBe(false);
  });
});
