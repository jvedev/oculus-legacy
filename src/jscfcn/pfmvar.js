var PFMBOX = window;
var MAIN = PFMMDO;
var APP = {};
var PFMVAR = {};
var SFLACN = {};
var BRWCMD = {};
var CMDBTN = {};
var DSPELM = {};
var DTATYP = {};
var FLDATR = {};
var SRVFCN = {};
var IDLARR = {};
var CNDATR = {};
var ATNLVL = {};
var CALFCN = {};
var SCHPGM = {};
var ATTRIB = {};
var QCKSCH = {};
var SUBFILE = {};
var NAV = {};
var IMG = {};
var INP = {};
var GLOBAL = {};
var DSPTTL = {};
var OCLIMG = {};
var MACRO = {};
var SETTINGS = {}; //settings veranderen in principe niet

PFMVAR['*PGM'] = {};
PFMVAR['*SCH'] = null;
PFMVAR['*PMT'] = null;

OCULUS.cancelEndApplication = false;

SETTINGS.decimalSeparator = ',';
SETTINGS.thousandSeparator = '.';
SETTINGS.maxServiceFunctionDisplayedRows = 9;
SETTINGS.minServiceWidth = 150; // minimum breedte van in DSP/CHC popup in pixels
SETTINGS.charWidth = 9;
SETTINGS.lineHeight = 20;
SETTINGS.scrollBarWidth = 16;
SETTINGS.maxLines = 33;

GLOBAL.mouseKeyDown = false;
GLOBAL.useIpmf = OCULUS.debugMode === 'IPMF';
GLOBAL.inDeveloperMode = (OCULUS.isPantheonEmployee != "NO");
GLOBAL.ideActive = GLOBAL.useIpmf;
GLOBAL.ipmfWindow = null;
GLOBAL.eventObject = null;
GLOBAL.eventSourceElement = null;
GLOBAL.keydownValue = null;
GLOBAL.keydownObject = null;
GLOBAL.eventObjectTAG = null;
GLOBAL.selection = ENUM.selection.unKnown;
GLOBAL.charCode = 0;
GLOBAL.char = null;
GLOBAL.macro = [];

SESSION.popupStack = [];
SESSION.isSingleView = false; //GLOBAL.isSingleView = false;
SESSION.appFrame = null;
SESSION.searchFrame = null;
SESSION.activeFrame = null;
SESSION.activeForm = null;
SESSION.subScope = null;
SESSION.delayedFrameSwitch = null;
SESSION.NextMacroId = null;
SESSION.submitInProgress = false;
SESSION.protected = true;
SESSION.pageStore = {};
SESSION.activePage = null;
SESSION.program = [];
