/* global NAV, SESSION, MAIN, GUI, XDOM, TabProtect, KeepAlive, advAJAX, PFMBOX, OCULUS */

NAV.Procedure = function(definition, optionNr, session) {
  this.type = 'procedure';
  this.session = session;
  this.optionNr = optionNr;
  this.option = definition;
  this.option.optionNr = optionNr;
  this.procedureName = definition.PRC;
  this.PRC = definition.PRC;
  this.title = definition.TTL;
  this.description = definition.DSC;
  this.subProcedures = [];
  //.buttonInstances = {};
  this.defaultSubProcedure = null;
  this.defaultApplication = '';
  this.defaultSubProcedureName = '';
  this.serverParameters = [];
  this.serverParametersValues = [];
  this.definition = null;
  this.previous = null;
  this.next = null;
  this.available = true;
  // this.button = new GUI.SessionMenuBtn(this);
  this.init();
  this.multiFormatTargets = [];
  this.workFlowTargets = {};
  this.isCleanUp = false;
  this.workflowTargets = {};
  this.level = 0;
};

NAV.Procedure.instances = [];
NAV.Procedure.currentInstance = null;

NAV.Procedure.prototype.init = function() {
  this.definition = getEval(this.procedureName)|| this.session.homeProcedure;

  if (this.definition) {
    this.defaultApplication = this.definition.DFTAPP;
    this.defaultSubProcedureName = this.definition.DFTSBP;
    if (this.definition.INZPRM) {
      this.serverParameters = this.definition.INZPRM;
    }
    if (this.definition.INZVAL) {
      this.serverParametersValues = this.definition.INZVAL;
    }
  } else {
    this.available = false;
  }
  if (SESSION.session.openFromfavourite) {
    this.defaultSubProcedureName = SESSION.session.openFromfavourite.SubProcedureName;
  }

  NAV.Procedure.instances[this.optionNr] = this;
};

NAV.Procedure.prototype.load = async function(subProcedure) {
  protectPage();
  if (NAV.Procedure.currentInstance) {
    NAV.Procedure.currentInstance.close();
  }

  SESSION.stack.currentSession.stack.add(this);
  NAV.Procedure.currentInstance = this;
  MAIN.NAV.Session.checkStatus(SESSION.stack.currentSession.id, false, true); //single job status check;
  this.setTitle();
  this.initOptions();
  await this.initServerParams(subProcedure)
  this.start(subProcedure);
};

NAV.Procedure.prototype.start = function(subProcedure = this.defaultSubProcedure) {
  //this.renderButtons();
  if (subProcedure) {
    TabProtect.createBlokker();
    subProcedure.load();
  } else {
    releasePage();
    //clear current frame source
    if (XDOM.getAttribute(SESSION.activeFrame.frameElement, 'data-frame-type') == 'Application') {
      XDOM.removeDOMObject(SESSION.activeForm);
    }
  }
  this.setMainButtons();

  SESSION.stack.currentSession.updateMainBtns();

  resetAllsubfilePositions();
};

NAV.Procedure.prototype.isValid = function(option) {
  if (option.DSP == 'NO') {
    return false;
  }
  if (!NAV.validationTree.showDirect(this.procedureName, option.SBP)) {
    return false;
  }
  if (!NAV.Stack.validate(option, this.defaultApplication)) {
    return false;
  }
  return true;
};

NAV.Procedure.prototype.prepareOptions = function() {
  var option = null;

  for (var i = 0, l = this.definition.OPT.length; i < l; i++) {
    option = this.definition.OPT[i];
    if (option.TYP == NAV.Stack.formatTyp.oldType) {
      option.TYP = NAV.Stack.formatTyp.workFlow;
    }
  }
};

NAV.Procedure.prototype.initOptions = function(options) {
  if (this.subProcedures.length > 0 || !this.definition) {
    return;
  } // -->

  let option = null,
    subProcedure = null;

  this.prepareOptions();
  for (var i = 0, l = this.definition.OPT.length; i < l; i++) {
    option = this.definition.OPT[i];
    if (!this.isValid(option)) {
      continue;
    }
    subProcedure = new NAV.SubProcedure(option, i, this);
    if (subProcedure.available && !this.defaultSubProcedure && this.defaultSubProcedureName != '*NONE') {
      this.defaultSubProcedure = subProcedure;
    }
    this.subProcedures.push(subProcedure);
    if (subProcedure.subProcedureName == this.defaultSubProcedureName) {
      // alser een default procedure is gedefinieerd of als er maar 1 subProcedure is
      this.defaultSubProcedure = subProcedure;
    }
  }
  if (this.defaultSubProcedure) {
    this.defaultSubProcedure.isDefault = true;
  }
};

NAV.Procedure.prototype.renderButtons = function() {};

/**
 *
 * @param subProcedure
 * @returns {Promise<boolean>}
 */
NAV.Procedure.prototype.initServerParams = async function(subProcedure) {

  let subToStart = subProcedure;
  if ((this.serverParameters.length == 0 && this.serverParametersValues.length == 0) || SESSION.submitInProgress) {
    return Promise.resolve();
  } // -->
  var fsUrl = SESSION.alias + '/box/ndmctl/inzsbp.ndm/main?PRCNAME=' + this.procedureName;

  if (this.serverParametersValues.length > 0) {
    fsUrl += '&PRMLEN=' + this.serverParametersValues.length;

    for (var i = 0, l = this.serverParametersValues.length; i < l; i++) {
      fsUrl += '&PRM' + (i + 1) + '=' + this.serverParametersValues[i].prm;
      fsUrl += '&VAL' + (i + 1) + '=' + this.serverParametersValues[i].val;
    }
  } else {
    fsUrl += '&PRMLEN=' + this.serverParameters.length;

    for (var i = 0, l = this.serverParameters.length; i < l; i++) {
      fsUrl += '&PRM' + (i + 1) + '=' + this.serverParameters[i];
    }
  }

  fsUrl += '&PFMJOBID=' + SESSION.jobId + '&AUTHTOKEN=' + SESSION.AUTHTOKEN;
  await fetch(fsUrl);

  // advAJAX.get({
  //   url: fsUrl,
  //   onSuccess: function(obj) {
  //     NAV.Procedure.initServerParamsResponse(subToStart);
  //   },
  //   onError: function(obj) {
  //     console.log('Fout: ' + fsUrl + ' / ' + PFMBOX.bLOADED_INZFCN + ' / ' + obj.status);
  //   }
  // });
  return;
};
//
// NAV.Procedure.initServerParamsResponse = function(subProc) {
//   NAV.Procedure.currentInstance.start(subProc);
// };

NAV.Procedure.prototype.close = function() {
  closeHighSlide();
  if (NAV.SubProcedure.currentInstance) {
    NAV.SubProcedure.currentInstance = null;
  }

  if (NAV.Macro.currentInstance) {
    NAV.Macro.currentInstance = null;
  }
  SESSION.stack.currentSession.stack.clearHistory(SESSION.stack.currentSession);
};

NAV.Procedure.prototype.setTitle = function() {
  let foPrcTitle = XDOM.getObject('macroDescription');
  XDOM.replaceAllChilds(foPrcTitle, XDOM.createTextNode(this.title));
  SESSION.stack.currentSession.setTitle();
};

/**
 * verwijderd referenties naar andere objecten en dom objecten in verband met
 * eventuele memory leaks
 */
NAV.Procedure.prototype.clearHistory = function() {
  if (this.isCleanUp) return;
  this.isCleanUp = true;
  if (this.next) {
    this.next.clearHistory();
    this.next = null;
  }
};

/**
 * verwijderd referenties naar andere objecten en dom objecten in verband met
 * eventuele memory leaks
 */
NAV.Procedure.prototype.cleanUp = function() {
  // this.button.cleanUp();
  // this.button = null;
  this.session = null;
  this.previous = null;
  this.next = null;
  this.cleanUpOptions();
};

NAV.Procedure.prototype.cleanUpOptions = function() {
  var foOption = null;
  for (var i = 0, l = this.subProcedures.length; i < l; i++) {
    foOption = this.subProcedures[i];
    if (foOption) {
      foOption.cleanUp();
    }
    this.subProcedures[i] = null;
  }
  this.subProcedures = [];
};

NAV.Procedure.prototype.toString = function() {
  var fsReturn = '<br/><b>procedure:</b><br/>';
  fsReturn += 'optionNr:' + this.optionNr + '<br/>';
  fsReturn += 'procedureName:' + this.procedureName + '<br/>';
  fsReturn += 'title:' + this.title + '<br/>';
  fsReturn += 'description:' + this.description + '<br/>';
  fsReturn += 'defaultSubProcedure:' + this.defaultSubProcedureName + '<br/>';
  fsReturn += 'defaultApplication:' + this.defaultApplication + '<br/>';
  fsReturn += '<hr />';
  if (this.next) {
    fsReturn += this.next;
  }
  return fsReturn;
};

NAV.Procedure.prototype.getDebugInfo = function() {
  return 'procedure :' + this.title + ' procedureName:' + this.procedureName;
};

// /**
//  * verkrijgt subprocedure op basis van naam
//  *
//  * @param fsSubProcedure
//  * @returns subprocedure of null
//  */
// NAV.Procedure.prototype.getSubProcedure = function(fsSubProcedure) {
//   var foOption = null;
//   for ( var i = 0, l = this.subProcedures.length; i < l; i++) {
//     foOption = this.subProcedures[i];
//     if (foOption.subProcedureName == fsSubProcedure) {
//       return foOption;
//     }
//   }
//   return null;
// };

/**
 * verkrijgt subprocedure op basis van naam
 *
 * @param name
 * @returns subprocedure of null
 */
NAV.Procedure.prototype.getSubProcedure = function(name) {
  return this.subProcedures.filter(proc => proc.SBP === name)[0];
};

NAV.Procedure.prototype.getFormatMacros = function() {
  var macros = {},
    macro = null,
    subProcedure = null;

  for (var i = 0, l = this.subProcedures.length; i < l; i++) {
    subProcedure = this.subProcedures[i];
    if (subProcedure.formatType == NAV.Stack.formatTyp.workFlow) {
      for (var s = 0, ml = subProcedure.options.length; s < ml; s++) {
        macro = subProcedure.options[s];
        if (macro.formatCode && !macros[macro.formatCode]) {
          if (macro.macroName != SESSION.stack.currentMacro.macroName) {
            macros[macro.formatCode] = macro.serverID;
          }
        }
      }
    }
  }
  return macros;
};

NAV.Procedure.prototype.setMainButtons = function() {
  var foHelpBtn = null;
  var foPrintingBtn = null;
  if (SESSION.assistAvailable) {
    //MVB
    foHelpBtn = XDOM.getObject('procedureHelpIcon', MAIN.document);
    XDOM.setAttribute(foHelpBtn, 'data-button-enabled', 'true');
    OCULUS.procedureHelpUrl = SESSION.assistDir + this.procedureName + '.htm?TIMESTAMP=' + new Date().getTime();
    SESSION.stack.currentSession.procedureHelpUrl = OCULUS.procedureHelpUrl;
  }

  foPrintingBtn = XDOM.getObject('printSessionBtn', MAIN.document);

  if (foPrintingBtn && (SESSION.printAvailable !== undefined && !SESSION.printAvailable)) {
    XDOM.setAttribute(foPrintingBtn, 'data-button-enabled', 'false');
    SESSION.stack.currentSession.printingEnabled = false;
    return;
  }

  XDOM.setAttribute(foPrintingBtn, 'data-button-enabled', 'true');
  SESSION.stack.currentSession.printingEnabled = true;
};
