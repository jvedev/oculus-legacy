/* sessionGlobals */
/* Load Timestamp 13:59:55.631 */
var PFMBOX = navigator;
var PFMCON = parent;
var PAGE = {};


var SCOPE = parent.SCOPE;
SCOPE.session = window;
SCOPE.sessionDoc = document;

var gESS_LOADED   = false;
var SESSIONFRAME = window;
var SESSIONDOC = document;
var PAGEDOC = null;


SESSIONFRAME.MACRO ={};
SESSIONFRAME.SESSION={};


var OCULUS = parent.OCULUS;
OCULUS.standAlone = true;
var MAIN =  parent;
var MAINDOC = parent.document;
var PFMCON = MAIN;
var PFMMDO = MAIN;



function initSessionGlobals(){
    if(window.top!=window.self){  // de app. draait in de PFM MDO
        PFMCON = window.self;
        OCULUS.standAlone = false; //voorheen gPFM_STANDALON
    }

    parent.SESSIONDOC = SESSIONDOC;

}

initSessionGlobals();



