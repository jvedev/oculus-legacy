NAV.Macro = function(def, subProcedure, id) {
  this.type = 'macro';
  this.id = id;
  this.subProcedure = subProcedure;
  this.targetSubProcedure = null;
  this.procedure = this.subProcedure.procedure;
  this.session = this.procedure.session;
  this.definition = def;
  this.title = def.TTL;
  this.titleText = null;
  this.description = def.DSC;
  this.macroName = nullWhenEmpty(def.MCR);
  this.MCR = this.macroName;
  this.subProcedureName = nullWhenEmpty(def.SBP);
  this.target = nullWhenEmpty(def.TGT);
  this.display = nullWhenEmpty(def.DSP);
  this.formatType = def.TYP || '';
  this.formatCode = nullWhenEmpty(def.FMT);
  this.actionCode = nullWhenEmpty(def.ACN);
  this.application = def.APP || subProcedure.defaultApp;
  this.containingDiv = 'SCRDIV';
  this.multiFormatTargets = null;
  this.userActionTargets = [];
  this.isDirectTarget = false;
  this.tab = null;
  this.url = '';
  this.previous = null;
  this.next = null;
  this.uploadCredentialsChecked = false;

  //info op server geregistreerd bij laden van pagina
  this.IDF = '';
  this.ISF = '';
  this.focusedButton = '';
  this.focusedField = '';
  this.messageLevel = '';
  this.messageQueue = '';
  this.document = null;
  this.activeForm = null;
  this.isCleanUp = false;
  this.isTarget = def.isTarget || false;
  this.serverID = subProcedure.subProcedureName + ' ' + this.application + ' ' + this.macroName;
  /*
   *voor de sturing bepaald of er een history wordt opgebouwd
   */
  this.clearHistoryOnClose = true;
  this.init();
};

NAV.Macro.instances = [];
NAV.Macro.currentInstance = null;
NAV.Macro.hovered = null;

/**
 * verwijderd referenties naar andere objecten en dom objecten in verband met eventuele memory leaks
 */
NAV.Macro.prototype.cleanUp = function() {
  //if(this.tab){
  //  this.tab.cleanUp();
  //}
  this.tab = null;
  this.subProcedure = null;
  this.procedure = null;
  this.session = null;
  this.application = null;
  this.previous = null;
  this.next = null;
};

NAV.Macro.prototype.init = function() {
  if (this.display != 'NO') {
    this.tab = new GUI.subProcedureTab(this);
  }
  if (this.definition.APP) {
    this.application = this.definition.APP;
  }

  if (!this.subProcedureName) {
    this.subProcedureName = this.subProcedure.subProcedureName;
  }
  this.initTargets();

  NAV.Macro.instances[this.id] = this;
};

NAV.Macro.prototype.getUserActionTargets = function() {
  this.userActionTargets = [];
  if (!(this.formatType == '*USRACN' || this.formatType == '*PMT_ML')) {
    return;
  }
  if (this.targetSubProcedure) {
    this.userActionTargets = this.targetSubProcedure.getActionMacros();
  } else {
    this.userActionTargets = this.subProcedure.getActionMacros();
  }
  return this.userActionTargets;
};

NAV.Macro.prototype.initTargets = function() {
  if (!isIn(this.formatType, ['*MLTFMT', '*WRKFLW', '*USRACN'])) {
    return;
  }
  var foSubOptions = this.subProcedure.definition.OPT;
  var foSubDef = null;
  for (var i = 0, l = foSubOptions.length; i < l; i++) {
    foSubDef = foSubOptions[i];
    if (foSubDef.SBP == this.target) {
      this.targetSubProcedure = new NAV.SubProcedure(foSubDef, i, this.procedure, this);

      this.multiFormatTargets = this.targetSubProcedure.initOptions();
      return;
    }
  }
};

NAV.Macro.prototype.load = function() {
  if (SESSION.stack.currentMacro) {
    SESSION.stack.currentMacro.close();
  }

  SESSION.stack.currentSession.stack.add(this);
  // SESSION.stack.currentSession.updateTitle();
  SESSION.stack.currentSession.setTitle();
  setFrames('*PGM');

  //sluit het sessieframe voordat er een marco laad
  Search.close();

  //this.tab.activate();
  MAIN.NAV.Session.checkStatus(SESSION.stack.currentSession.id, true, false); //retrieve job status met delay
  this.getUserActionTargets();

  this.start();
};
/**
 * sluiten van een macro
 */
NAV.Macro.prototype.close = function() {
  if (this.clearHistoryOnClose) {
    SESSION.stack.currentSession.stack.clearHistory(this.subProcedure);
  }
  //de clearHistory boolean is eenmalig en moet elke keer weer op false worden gezet als de history moet worden behouden
  this.clearHistoryOnClose = true;
};

NAV.Macro.prototype.start = function() {
  this.getUrl();
  NAV.Macro.currentInstance = this;

  protectPage();

  if (SESSION.submitInProgress) {
    setTimeout('NAV.Macro.currentInstance.start()', 20);
    return;
  }

  KeepAlive.cancel(); //stopt de keep alive job om dubbele requests te voorkomen
  SESSION.submitInProgress = true;
  AJAX.loadMacro(this);
  //reset global make sure favourite definition doesn't keep hanging around
  SCOPE.main.openingFavorite =  null;
};

NAV.Macro.prototype.getCurrentUrl = function() {
  var url = SESSION.alias + '/' + this.application + '/ndmctl/' + this.macroName + '.ndm/MAIN';
  return url;
};

NAV.Macro.prototype.getUrl = function() {
  var fsPreviousProgram = 'INZMNU';
  var fsPreviousMacro = '';
  if (NAV.Macro.currentInstance) {
    fsPreviousMacro = NAV.Macro.currentInstance.macroName;
    if (fsPreviousMacro && SESSION.pageStore[fsPreviousMacro]) {
      fsPreviousProgram = SESSION.pageStore[fsPreviousMacro].programName;
    }
  }
  this.url =
    SESSION.alias +
    '/' +
    this.application +
    '/ndmctl/' +
    this.macroName +
    '.ndm/MAIN?PFMJOBID=' +
    SESSION.jobId +
    '&AUTHTOKEN=' +
    SESSION.AUTHTOKEN +
    '&mIN_SBM=true' +
    '&pNM_PGM=' +
    fsPreviousProgram;
  return this.url;
};

NAV.Macro.prototype.setTitle = function(macroName) {
  var fsMacroName = this.macroName;
  var fTX_TTL = '';
  let altTitle = '';
  if (TopView.currentInstance) {
      altTitle = TopView.currentInstance.titleFromTarget || '';
  }
  this.macroTitle = XDOM.getObject('MACROTITLE');

  if (SESSION.activePage.screenType == '*SCH' || SESSION.isSingleView) {
    fsMacroName = SESSION.activePage.macroName;
    fTX_TTL = getCaption('TX_TTL', altTitle);

    if (fTX_TTL) {
      XDOM.replaceAllChilds(this.macroTitle, XDOM.createTextNode(fTX_TTL));
    }
  } else {
    if (SESSION.activePage.screenType == '*PGM') {
      if (SESSION.stack.currentProcedure) {
        XDOM.replaceAllChilds(this.macroTitle, XDOM.createTextNode(SESSION.stack.currentSubprocedure.title));
      }
    }
  }

  this.titleText =
    getCapt('cTX_USR') +
    ': ' +
    PFMBOX.PFMRMTUS +
    ' \x0A' +
    getCapt('cTX_ENV') +
    ': ' +
    PFMBOX.gCD_ENV +
    ' \x0A' +
    getCapt('cTX_ADM') +
    ': ' +
    PFMBOX.mEnvDB +
    ' \x0A' +
    getCapt('cTX_PGM') +
    ': ' +
    fsMacroName +
    ' \x0A' +
    getCapt('cTX_SSN') +
    ': ' +
    SESSION.jobId +
    ' \x0A' +
    getCapt('cTX_LNG') +
    ': ' +
    SESSION.language;

  this.printingTitleText =
    '<label>' +
    getCapt('cTX_USR') +
    ':</label> <output>' +
    PFMBOX.PFMRMTUS +
    '</output>' +
    '<label>' +
    getCapt('cTX_ENV') +
    ':</label> <output>' +
    PFMBOX.gCD_ENV +
    '</output> ' +
    '<label>' +
    getCapt('cTX_ADM') +
    ':</label> <output>' +
    PFMBOX.mEnvDB +
    '</output> ' +
    '<label>' +
    getCapt('cTX_PGM') +
    ':</label> <output>' +
    fsMacroName +
    '</output> ' +
    '<label>' +
    getCapt('cTX_SSN') +
    ':</label> <output>' +
    SESSION.jobId +
    '</output> ' +
    '<label>' +
    getCapt('cTX_LNG') +
    ':</label> <output>' +
    SESSION.language +
    '</output>' +
    '<label>' +
    getCapt('cTX_BRW') +
    ':</label> <output>' +
    BrowserDetect.browserUsed +
    '(v' +
    BrowserDetect.version +
    ')</output>';

  BrowserDetect.browserUsed + GUI.infoTitle.register(this.macroTitle, this.titleText);
};

/**
 * verwijderd referenties naar andere objecten en dom objecten in verband met eventuele memory leaks
 */
NAV.Macro.prototype.clearHistory = function() {
  if (this.isCleanUp) return;
  this.isCleanUp = true;
  if (this.next) {
    this.next.clearHistory();
    this.next = null;
  }
};

NAV.Macro.prototype.toString = function() {
  var fsReturn = '<br/><b>macro:</b><br/>';
  fsReturn += 'id:' + this.id + '<br/>';
  fsReturn += 'title:' + this.title + '<br/>';
  fsReturn += 'description:' + this.description + '<br/>';
  fsReturn += 'macroName:' + this.macroName + '<br/>';
  fsReturn += 'target:' + this.target + '<br/>';
  fsReturn += 'type:' + this.type + '<br/>';
  fsReturn += 'formatCode:' + this.formatCode + '<br/>';
  fsReturn += 'application:' + this.application + '<br/>';

  fsReturn += '<hr />';
  if (this.next) {
    fsReturn += this.next;
  }
  return fsReturn;
};

NAV.Macro.prototype.getDebugInfo = function() {
  return (
    'Macro: ' +
    this.title +
    ': ' +
    this.macroName +
    ' this.formatType: ' +
    this.formatType +
    '  userActionTargets:' +
    this.userActionTargets.join()
  );
};

/**
 * Verkrijgt macro behorende bij het target
 * de target kan een macro bionnen de zelfde subProcedure zijn of verwijzen naar een andere subProcedure
 * 1. als de target verwijst naar een macro dan deze openen
 * 2. als de target verwijst naar een subProcedure dan gelden de folgende regels:
 *   - is er spraken van een format code: open de default macro met die die formatCode of anders de eerste optie
 *   - is er spraken van een actie code: open de eerste optie met die actie code
 *   - is er geen format of actie code open dan de default macro
 *   - is er ook geen spraken van de default macro open dan de eerste macro
 *
 *   als er geen geldige macro te vinden is dan wordt er null geretourneerd
 *   voor alle gevallen geld dat er een historie wordt opgebouwd en het dus mogelijk is terug te gaan
 *   @param {string} fsFormatCode format code
 *   @param {string} fsActionCode actie code
 *   @returns {Object} of null;
 */
NAV.Macro.prototype.getTarget = function(fsFormatCode, fsActionCode) {
  var foTarget = null;
  var foMacro = null;
  //geen target gedefinieerd
  if (!this.target) {
    return null;
  }

  if (this.formatType == NAV.Stack.formatTyp.multiFormat) {
    foTarget = this.targetSubProcedure;
  } else {
    foTarget = this.subProcedure.getTarget(this.target);
  }

  if (!foTarget) {
    return null;
  } //geen target beschikbaar

  //we hebben een target het is een macro
  if (foTarget.type == 'macro') {
    foMacro = foTarget;
    foMacro.isDirectTarget = true;
  } else {
    //de target is een subprocedure
    foTarget.setRestrictions(fsFormatCode, fsActionCode);
    if (this.formatType == NAV.Stack.formatTyp.multiFormat) {
      foTarget.formatType == NAV.Stack.formatTyp.multiFormat;
    }
    foTarget.initOptions();
    foMacro = foTarget.getDefaultMacro();
    if (foMacro) {
      foMacro.isDirectTarget = false;
    }

  }
  return foMacro;
};

NAV.Macro.prototype.getFormatMacros = function() {
  if (this.subProcedure) {
    return this.subProcedure.getFormatMacros();
  } else {
    return {};
  }
};
