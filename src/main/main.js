// Main entry point - initialize everything and make it globally available
import '../../shared/utils/string-prototypes.js';
import '../../shared/utils/date-prototypes.js';
import '../../shared/legacy-functions.js';

// Initialize NAV and GUI objects
window.NAV = window.NAV || {};
window.GUI = window.GUI || {};

// Import modular components
import XDOM from '../../shared/dom/xdom.js';
import '../../shared/navigation/stack.js';
import '../../shared/navigation/macro.js';
import '../../shared/navigation/sub-procedure.js';
import GUI from '../../shared/gui/components.js';

// Initialize main variables as globals immediately 
const TOP = window.top;
const MAIN = window;
const SESSION = {}; //wordt pas gezet als er een session is;

const SCOPE = {};
SCOPE.top = window.top;
SCOPE.main = window;
SCOPE.mainDoc = document;
MAIN.OCULUS = {};
MAIN.SETTINGS = {};
MAIN.GLOBAL = {};

const MAINDOC = document;
let PAGEDOC = null;
let SESSIONDOC = null;

// Settings
const SETTINGS = MAIN.SETTINGS;
SETTINGS.maxSessions = 12;
SETTINGS.checkJobTimeout = 60000;
SETTINGS.maxSessionTabsWithFixedWidth = 12;

// Global state
const GLOBAL = MAIN.GLOBAL;
GLOBAL.eventObject = null;
GLOBAL.eventSourceElement = null;
GLOBAL.eventObjectTAG = null;
GLOBAL.selectedSflRow = null;
GLOBAL.charCode = 0;
GLOBAL.pressedBlockedKey = null;
GLOBAL.char = null;
GLOBAL.timeRetrieveJobSts = 3000;
GLOBAL.timeRetrieveJobStsAfterReload = 30000;
GLOBAL.dragObjectId = null;
GLOBAL.focusFirstSubView = false;
GLOBAL.dataset = null;

// Oculus globals
const OCULUS = MAIN.OCULUS;
OCULUS.sessionResolution = null;
OCULUS.lastEnviromentChild = '';
OCULUS.zoomLevel = 1;
OCULUS.zoomInstance = 0;
OCULUS.debugMode = false;
OCULUS.clearCache = false;
OCULUS.monitorJobCGI = '/moncgi';
OCULUS.cancelEndApplication = true;

MAIN.OCULUS.zoomLevel = 'default';
MAIN.OCULUS.originZoomLevel = '100';
MAIN.OCULUS.zoomFactors = new Array();

// Setup zoom factors
MAIN.OCULUS.zoomFactors['90'] = { zoomFactor: 0.9, scaleFactor: 0.9, buttonTxt: '90%', dspRowOffset: 0, zoomKey: 90 };
MAIN.OCULUS.zoomFactors['100'] = { zoomFactor: 1, scaleFactor: 1, buttonTxt: '100%', dspRowOffset: 0, zoomKey: 100 };
MAIN.OCULUS.zoomFactors['110'] = { zoomFactor: 16 / 14, scaleFactor: 1.1, buttonTxt: '110%', dspRowOffset: -0.15, zoomKey: 110 };
MAIN.OCULUS.zoomFactors['115'] = { zoomFactor: 16 / 13.5, scaleFactor: 1.15, buttonTxt: '115%', dspRowOffset: 0, zoomKey: 115 };
MAIN.OCULUS.zoomFactors['120'] = { zoomFactor: 16 / 13, scaleFactor: 1.2, buttonTxt: '120%', dspRowOffset: 0.18, zoomKey: 120 };
MAIN.OCULUS.zoomFactors['125'] = { zoomFactor: 16 / 12.5, scaleFactor: 1.25, buttonTxt: '125%', dspRowOffset: 0.44, zoomKey: 125 };
MAIN.OCULUS.zoomFactors['130'] = { zoomFactor: 16 / 12, scaleFactor: 1.3, buttonTxt: '130%', dspRowOffset: 0, zoomKey: 130 };
MAIN.OCULUS.zoomFactors['135'] = { zoomFactor: 16 / 11.5, scaleFactor: 1.3, buttonTxt: '135%', dspRowOffset: 0, zoomKey: 135 };
MAIN.OCULUS.zoomFactors['140'] = { zoomFactor: 16 / 11, scaleFactor: 1.4, buttonTxt: '140%', dspRowOffset: 0, zoomKey: 140 };
MAIN.OCULUS.zoomFactors['145'] = { zoomFactor: 16 / 10.5, scaleFactor: 1.4, buttonTxt: '145%', dspRowOffset: 0, zoomKey: 145 };

const PFMCON = {};
const APP = {};
const PFMBOX = {};

// Make all variables globally available
window.TOP = TOP;
window.MAIN = MAIN;
window.SESSION = SESSION;
window.SCOPE = SCOPE;
window.MAINDOC = MAINDOC;
window.PAGEDOC = PAGEDOC;
window.SESSIONDOC = SESSIONDOC;
window.SETTINGS = SETTINGS;
window.GLOBAL = GLOBAL;
window.OCULUS = OCULUS;
window.PFMCON = PFMCON;
window.APP = APP;
window.PFMBOX = PFMBOX;

// Main specific constants and functions
const G = {}; //Global objects
const P = {}; //pantheon general functions

OCULUS.environmentTheme = {};

function main() {
    top.SCOPE = SCOPE;
    SCOPE.landingPage = top;
    SCOPE.main = window;
    SCOPE.mainDoc = document;

    if (OCULUS.extendedNav) {
        G.userMenu = new AdministrationMenu(USRMNU);
        AdminMenu.render(G.userMenu);
    } else {
        // Add tablet mode to the main document
        SCOPE.mainDoc.body.classList.add('tablet-mode');

        document.querySelector('.application-logo img').src = `/userFiles/images/productlogo_OCL.png`;
    }
    disableExtendedNav();

    window.Sidebar = createSideBar('sidebar', document.body);
    // this is because of chrome trouble
    setTimeout(function () {
        loadDirectLink();
    }, 300);
}

function disableExtendedNav() {
    if (OCULUS.extendedNav) {
        return;
    }
    AdminMenu.tabletMode();
    NAV.Session.directStart();
}

function inDevelopment(){
    return (OCULUS.devStage == '*DEV');
}

// Make main specific functions available globally
window.G = G;
window.P = P;
window.main = main;
window.disableExtendedNav = disableExtendedNav;
window.inDevelopment = inDevelopment;