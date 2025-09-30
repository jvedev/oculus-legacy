/* global SESSION, NAV, MAIN, XDOM, GUI */

function updateNav() {
  var stackCode = SESSION.activePage.macroSwitch.macroStackCode;
  var isSessionOverlay = false;

  if(SESSION.activePage.viewProperties.dataAvailable == 'true'){
    if(SESSION.activePage.viewProperties.recursiveCall=="1"){
       SESSION.stack.setRecurrent();
    }
  }

  if(SESSION.activePage.screenType == "*SCH" || SESSION.isSingleView) {
    isSessionOverlay = true;
  }

  MAIN.SCREEN.initScreenSize(SESSION.activePage.screenSize, SESSION.stack.currentSession, isSessionOverlay);

  if(!isSessionOverlay) {
    SESSION.stack.serverSwitch(SESSION.activePage.macroName, SESSION.activePage.macroSwitch.loadedSubprocedure, stackCode);
    SESSION.stack.setCurrent(NAV, SESSION.activePage);
   // SESSION.stack.currentSubprocedure.renderTabs();
    MacroTab.render(SESSION.stack.currentSubprocedure.getMacrosDefs());
  }
  SESSIONFRAME.SessionMenus.updateFromMain();
  
  // SESSION.stack.currentMacro.tab.activate();

  SESSION.stack.currentSession.zoom();
}

var TabProtect = {};

TabProtect.blokker = null;

TabProtect.createBlokker = function() {
  var foParent = XDOM.getObject('INZ');
  var foBlokker = XDOM.getObject('tabBlokker');
  // controleren of blokker al bestaat
  if (foBlokker) {
    TabProtect.blokker = foBlokker;
  } else {
    TabProtect.blokker = XDOM.createElement("DIV", "tabBlokker", "protect");
    foParent.appendChild(TabProtect.blokker);
  }
};

TabProtect.protect = function() {
  if(TabProtect.blokker){
    TabProtect.blokker.className='protectDIV';
  }
};

TabProtect.free = function() {
  if(TabProtect.blokker){
    TabProtect.blokker.className='noprotectDIV';
  }
};



function setFrames(type) {
  if (type == '*PGM') {

  	if(SESSION.isSingleView){
    	SESSION.activeFrame = SESSION.topViewFrame;
  	}else{
    	SESSION.activeFrame = SESSION.appFrame;
    }
  } else {
    SESSION.activeFrame = SESSION.searchFrame;
  }
  if (SESSION.activeFrame) {
    SESSION.activeForm = SESSION.activeFrame.document.forms[0];
    PAGE = SESSION.activeFrame;
    PAGEDOC = SESSION.activeFrame.document;

    SCOPE.pageDoc = PAGEDOC;
    SCOPE.page = PAGE;
    SESSION.PAGEDOC = PAGEDOC;
    SESSION.PAGE = PAGE;
    MAIN.PAGEDOC = PAGEDOC;
    MAIN.PAGE = PAGE;
  }
}


/**
 * als er op een macro tab wordt geklikt en er is al een
 * submit aan de gang bijvoorbeeld door een autosubmit veld
 * (SESSION.submitInProgress == true) dan wiordt de SESSION.NextMacroId gevuld
 * nadat de pagina is herladen en de initialisatie klaar is wordt deze dan
 * uitgevoerd dit is gedaan om dubbele submits in ff chrome en safari te
 * voorkomen
 */
//function executeNextAction() {
//  if(hasValue(SESSION.NextMacroId)){
//	  // er is om een andere macro gevraagd terwijl er al een (auto) submit aan de gang was
//	 GUI.subProcedureTab.handleClick(SESSION.NextMacroId);
//	 // er hoeft verder niets meer te worden gedaan
//	 return;
//  }
//
//  return;
//}

function sortIntArray(arrayin){
 return arrayin.sort(function (a,b) {return parseInt(a) - parseInt(b);});
}