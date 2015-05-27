Auto Complete
===============
검색어 자동완성 컴포넌트<br>검색어 입력시 실시간으로 자동완성된 추천 검색어 목록을 보여주는 컴포넌트입니다.

## Feature
* 입력창에 검색어를 입력하면 자동완성 검색어 api에 검색어를 질의하여 자동완성 결과를 결과 레이어 출력
* 자동완성 기능 on/off 가능
* TAB키, 방향키(up, down)로 검색 결과 레이어에서 키워드들을 순회 가능
* 결과 레이어 영역에서 mouse move로 자동완성 목록을 탐색 가능
* 결과 레이어 영역에서 mouse click으로 키워드 검색을 수행

## Documentation
* **API** : https://github.nhnent.com/pages/fe/component-auto-complete/1.1.0
* **Tutorial** : https://github.nhnent.com/fe/component-auto-complete/wiki/자동완성-컴포넌트-적용방법
* **Sample** - https://github.nhnent.com/pages/fe/component-auto-complete/1.1.0/tutorial-sample1
* **CI** : http://fe.nhnent.com:8080/jenkins/job/component-auto-complete/

## Sample Image
* 샘플이미지<br>
![alt tag](https://nhnent.github.io/fe.component-auto-complete/sampleimg.png)

## Dependency
* jquery: ~1.8.3
* json2: *
* code-snippet: ~1.0.2

## Test environment
* PC
	* IE7~11
	* Chrome
	* Firefox


## Download/Install
* Bower:
   * 최신버전 : `bower install "git+http://70327b4564c7a80eb61724056876b960290946dd:x-oauth-basic@github.nhnent.com/fe/component-auto-complete.git#master"`
   * 특정버전 : `bower install "git+http://70327b4564c7a80eb61724056876b960290946dd:x-oauth-basic@github.nhnent.com/fe/component-auto-complete.git[#tag]"`
* Download: https://github.nhnent.com/fe/component-auto-complete

## History
| Version | Description | Date | Developer |
| ---- | ---- | ---- | ---- |
| 1.1.1 | 요청 방식 병렬->순차로 변경 | 2015.05 | FE개발팀 이제인<jein.yi@nhnent.com> |
| <a href="https://github.nhnent.com/pages/fe/component-auto-complete/1.1.0">1.1.0</a> | searchApi 추가 | 2015.03 | FE개발팀 이제인<jein.yi@nhnent.com> |
| <a href="https://github.nhnent.com/pages/fe/component-auto-complete/1.1.0">1.0.0</a> | 배포 | 2015.03 | FE개발팀 이제인<jein.yi@nhnent.com> |
| 0.1.1 | 템플릿 기능 추가 | 2015.01 | FE개발팀 이제인<jein.yi@nhnent.com> |
| 0.1.0 | 최초개발 | 2014.09 | FE개발팀 이기현 <kihyun.lee@nhnent.com> |
