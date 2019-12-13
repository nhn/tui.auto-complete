var AutoComplete = require('../src/js/autoComplete');
var util = require('../src/js/util');
var defaultConfig = require('./autoConfig').defaultConfig;

describe('AutoComplete', function() {
  var autoComplete, resultManager, inputManager;

  beforeAll(function() {
    jasmine.getFixtures().fixturesPath = 'base/test/fixtures';
  });

  describe('', function() {
    beforeEach(function() {
      loadFixtures('expand.html');
      $('#ac_input1').val('shoes');

      autoComplete = new AutoComplete({ config: defaultConfig });
      resultManager = autoComplete.resultManager;
      inputManager = autoComplete.inputManager;
    });

    it('should create AutoComplete and Manager instances.', function() {
      expect(autoComplete).toEqual(jasmine.any(Object));
      expect(inputManager).toBeTruthy();
      expect(resultManager).toBeTruthy();
    });

    it('should highlight keywords.', function() {
      resultManager = autoComplete.resultManager;

      autoComplete.setValue('shoes');
      autoComplete.request('shoes');

      autoComplete.queries = ['Nike'];
      expect(resultManager._highlight('Nike Air')).toBe('<strong>Nike</strong> Air');
      autoComplete.queries = ['TEST'];
      expect(resultManager._highlight('Nike Air')).toBe('Nike Air');
    });

    it('can turn off the auto-complete.', function() {
      autoComplete.setCookieValue(false);
      expect(autoComplete.isUseAutoComplete()).toBeFalsy();
      autoComplete.hideResultList();
    });

    it('should return the proper results after enter keywords.', function() {
      var eventMock = {
        stopPropagation: function() {}
      };

      autoComplete.setCookieValue(true);
      autoComplete.setValue('shoes');

      expect($('._resultBox')).not.toBeEmpty();
      expect($('._resultBox > li')).not.toBeEmpty();
      expect(inputManager).toBeDefined();

      autoComplete.setCookieValue(false);
      inputManager._onClickToggle(eventMock);
    });

    it('should turn on and off the auto-complete.', function() {
      var $onOffTxt = $('.baseBox .bottom');

      resultManager.changeOnOffText(true);
      expect($('#onofftext').text()).toEqual('자동완성 끄기');

      resultManager.changeOnOffText(false);
      expect($onOffTxt.css('display')).toEqual('none');

      resultManager._useAutoComplete();
      expect(resultManager.isShowResultList()).toBeFalsy();
    });
  });

  describe('usageStatistics', function() {
    beforeEach(function() {
      spyOn(util, 'sendHostName');
    });

    it('should send hostname by default', function() {
      autoComplete = new AutoComplete({ config: defaultConfig });

      expect(util.sendHostName).toHaveBeenCalled();
    });

    it('should not send hostname on usageStatistics option false', function() {
      autoComplete = new AutoComplete({
        config: defaultConfig,
        usageStatistics: false
      });

      expect(util.sendHostName).not.toHaveBeenCalled();
    });
  });
});
