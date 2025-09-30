var TOP = window.top;
var MAIN = window;
var SESSION = {}; //wordt pas gezet als er een session is;
 
var SCOPE = {};
SCOPE.top = window.top;
SCOPE.main = window;
SCOPE.mainDoc = document;
MAIN.OCULUS = {};
MAIN.SETTINGS = {};
MAIN.GLOBAL = {};

var MAINDOC = document;
var PAGEDOC = null;
var SESSIONDOC = null;

SETTINGS.maxSessions = 12;
SETTINGS.checkJobTimeout = 60000; // tijd in ms dat de job gecontroleerd wordt (60 sec)
SETTINGS.maxSessionTabsWithFixedWidth = 12;
//SETTINGS.rowHeight = 20;
//SETTINGS.posWidth = 7;

GLOBAL.eventObject = null;
GLOBAL.eventSourceElement = null;
GLOBAL.eventObjectTAG = null;
GLOBAL.selectedSflRow = null;
GLOBAL.charCode = 0;
GLOBAL.pressedBlockedKey = null;
GLOBAL.char = null;
GLOBAL.timeRetrieveJobSts = 3000; // wachttijd voor uitvoer controle job status
GLOBAL.timeRetrieveJobStsAfterReload = 30000;
GLOBAL.dragObjectId = null;
GLOBAL.focusFirstSubView = false;
GLOBAL.dataset = null;

OCULUS.sessionResolution = null;
OCULUS.lastEnviromentChild = '';
//OCULUS.isSessionMenuOpen = null;
OCULUS.zoomLevel = 1;
OCULUS.zoomInstance = 0;
OCULUS.debugMode = false;
OCULUS.clearCache = false;
OCULUS.monitorJobCGI = '/moncgi';
OCULUS.cancelEndApplication = true;

MAIN.OCULUS.zoomLevel = 'default';
MAIN.OCULUS.originZoomLevel = '100';
MAIN.OCULUS.zoomFactors = new Array();

MAIN.OCULUS.zoomFactors['90'] = {
  zoomFactor: 0.9,
  scaleFactor: 0.9,
  buttonTxt: '90%',
  dspRowOffset: 0,
  zoomKey: 90
};

MAIN.OCULUS.zoomFactors['100'] = {
  zoomFactor: 1,
  scaleFactor: 1,
  buttonTxt: '100%',
  dspRowOffset: 0,
  zoomKey: 100
};

MAIN.OCULUS.zoomFactors['110'] = {
  zoomFactor: 16 / 14,
  scaleFactor: 1.1,
  buttonTxt: '110%',
  dspRowOffset: -0.15,
  zoomKey: 110
};

MAIN.OCULUS.zoomFactors['115'] = {
  zoomFactor: 16 / 13.5,
  scaleFactor: 1.15,
  buttonTxt: '115%',
  dspRowOffset: 0,
  zoomKey: 115
};

MAIN.OCULUS.zoomFactors['120'] = {
  zoomFactor: 16 / 13,
  scaleFactor: 1.2,
  buttonTxt: '120%',
  dspRowOffset: 0.18,
  zoomKey: 120
};

MAIN.OCULUS.zoomFactors['125'] = {
  zoomFactor: 16 / 12.5,
  scaleFactor: 1.25,
  buttonTxt: '125%',
  dspRowOffset: 0.44,
  zoomKey: 125
};

MAIN.OCULUS.zoomFactors['130'] = {
  zoomFactor: 16 / 12,
  scaleFactor: 1.3,
  buttonTxt: '130%',
  dspRowOffset: 0,
  zoomKey: 130
};

MAIN.OCULUS.zoomFactors['135'] = {
  zoomFactor: 16 / 11.5,
  scaleFactor: 1.3,
  buttonTxt: '135%',
  dspRowOffset: 0,
  zoomKey: 135
};

MAIN.OCULUS.zoomFactors['140'] = {
  zoomFactor: 16 / 11,
  scaleFactor: 1.4,
  buttonTxt: '140%',
  dspRowOffset: 0,
  zoomKey: 140
};

MAIN.OCULUS.zoomFactors['145'] = {
  zoomFactor: 16 / 10.5,
  scaleFactor: 1.4,
  buttonTxt: '145%',
  dspRowOffset: 0,
  zoomKey: 145
};
var PFMCON = {};
var APP = {};
var PFMBOX = {};

