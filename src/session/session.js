// Session entry point
import '../../shared/utils/string-prototypes.js';
import '../../shared/session-language.js';
import '../../shared/session-scripts.js';

// Session specific globals
var PFMBOX = navigator;
var PFMCON = parent;
var PAGE = {};

var SCOPE = parent.SCOPE;
SCOPE.session = window;
SCOPE.sessionDoc = document;

var gESS_LOADED = false;
var SESSIONFRAME = window;
var SESSIONDOC = document;
var PAGEDOC = null;

SESSIONFRAME.MACRO = {};
SESSIONFRAME.SESSION = {};

var OCULUS = parent.OCULUS;
OCULUS.standAlone = true;
var MAIN = parent;
var MAINDOC = parent.document;
var PFMCON = MAIN;
var PFMMDO = MAIN;

function initSessionGlobals(){
    if(window.top != window.self){  // de app. draait in de PFM MDO
        PFMCON = window.self;
        OCULUS.standAlone = false; //voorheen gPFM_STANDALON
    }

    parent.SESSIONDOC = SESSIONDOC;
}

initSessionGlobals();

// Make session variables available globally
window.PFMBOX = PFMBOX;
window.PFMCON = PFMCON;
window.PAGE = PAGE;
window.SCOPE = SCOPE;
window.gESS_LOADED = gESS_LOADED;
window.SESSIONFRAME = SESSIONFRAME;
window.SESSIONDOC = SESSIONDOC;
window.PAGEDOC = PAGEDOC;
window.OCULUS = OCULUS;
window.MAIN = MAIN;
window.MAINDOC = MAINDOC;
window.PFMMDO = PFMMDO;
window.initSessionGlobals = initSessionGlobals;