/* global NAV, SESSION, XDOM, KeepAlive, advAJAX */

NAV.SubProcedure = function(option, optionNr, procedure, previous) {
  this.type = 'subProcedure';
  this.optionNr = optionNr;
  this.procedure = procedure;
  this.option = option;
  this.option.nr = optionNr;
  this.option.PRC = procedure.PRC;
  /**
   * {string} format code voor een restrictie op de te tonen macro tabs en het bepalen van de default
   */
  this.macroFormatCode = null;
  /**
   * {string} actionCode geeft aan welke macro er opgestart moet worden
   */
  this.actionCode = null;
  this.available = true;
  this.isInitialized = false;
  this.application = option.APP;
  this.description = option.DSC;
  this.title = option.TTL;
  this.subProcedureName = option.SBP;
  this.SBP = option.SBP;
  this.formatType = option.TYP;
  this.isTarget = option.isTarget;
  this.restrictToTarget = null;
  this.definition = null;
  this.serverParameters = [];
  this.serverParametersValues = [];
  this.options = [];
  this.tabInstances = {};
  this.button = null;
  this.defaultApp = '';
  this.defaultMacroName = '';
  this.CHC = '';
  this.previous = previous || procedure;
  this.next = null;
  /*
   * voor de sturing bepaald of er een history wordt opgebouwd
   */
  this.clearHistoryOnClose = true;
  this.isCleanUp = false;
  this.init();
};

NAV.SubProcedure.instances = [];
NAV.SubProcedure.currentInstance = null;

// NAV.SubProcedure.initServerParamsResponse = function() {
//   NAV.SubProcedure.currentInstance.start();
// };

/**
 * Bepaald aan de hand van previous het type van de macro
 * Subprocedures zijn *MLTFMT als de aanroepende macro
 * (dat is de macro met als target deze subprocedure heeft)
 * .TYP = *MLTFMT
 *
 * Subprocedures zijn *WRKFLW als de definitie van de macor (dus niet de inhoudt van de macro)
 * .TYP = *WRKFLW is
 * als deze direct onder een procedure valt worden de target doorgegeven aan de procedure
 * het gaat dan altijd om *WRKFLW want er is geen aanroepende macro
 *
 * @returns {undefined}
 */
NAV.SubProcedure.prototype.setType = function() {
  if (this.previous.type == 'macro' && this.previous.formatType == NAV.Stack.formatTyp.multiFormat) {
    this.formatType = NAV.Stack.formatTyp.multiFormat;
  }
};

NAV.SubProcedure.prototype.init = function() {
  this.definition = getEval(this.subProcedureName) || this.procedure.session.homeSubProcedure;
  if (this.definition) {
    if (this.definition.INZPRM) {
      this.serverParameters = this.definition.INZPRM;
    }
    if (this.definition.INZVAL) {
      this.serverParametersValues = this.definition.INZVAL;
    }
    this.defaultApp = this.definition.DFTAPP;
    this.defaultMacroName = this.definition.DFTMCR;
    this.CHC = this.definition.CHC; // todo:naam uitzoeken
  } else {
    this.available = false;
  }
  NAV.SubProcedure.instances[this.optionNr] = this;
  this.setType();
  if (this.formatType == NAV.Stack.formatTyp.multiFormat || this.formatType == NAV.Stack.formatTyp.workFlow) {
    this.initOptions();
  }
};

NAV.SubProcedure.prototype.prepareOptions = function() {
  var name = '',
    option = null,
    options = {},
    target = '';

  for (var i = 0, l = this.definition.OPT.length; i < l; i++) {
    option = this.definition.OPT[i];
    //in het oude systeem is het fromat type MFT nu is het format Type afhankelijk
    //van het type macro
    //subprocedures met een TYP MFT is workflow
    //macro's  met het TYP MFT = multiformat
    // NAV.Stack.formatTyp.oldType = MFT
    if (option.MCR && option.TYP == NAV.Stack.formatTyp.oldType) {
      option.TYP = NAV.Stack.formatTyp.multiFormat;
    }
    if (option.SBP && option.TYP == NAV.Stack.formatTyp.oldType) {
      option.TYP = NAV.Stack.formatTyp.workFlow;
    }
    //controleer de optie in de huidige contekst geldig is
    if (!NAV.Stack.validate(option, this.defaultApp)) {
      continue;
    }
    name = option.MCR || option.SBP;
    options[name] = option;
  }
  for (name in options) {
    option = options[name];
    if (!option.TGT) {
      continue;
    }

    target = options[option.TGT];
    if (!target) {
      continue;
    }
    option.target = XDOM.clone(target);
    target.isTarget = true;
    if (option.TYP == NAV.Stack.formatTyp.multiFormat) {
    }
  }
};
/**
 * bepaald welke opties geldig zijn en welke ook direct zichtbaar moeten zijn.
 *
 * @returns {Array} van multi format targets
 */

NAV.SubProcedure.prototype.initOptions = function() {
  var option = null;
  var option = null;
  if (this.isInitialized || !this.available) {
    return;
  } // -->
  this.prepareOptions();
  this.tabInstances = {};
  for (var i = 0, l = this.definition.OPT.length; i < l; i++) {
    option = this.definition.OPT[i];

    if (!NAV.Stack.validate(option, this.defaultApp)) {
      continue;
    }
    if (option.MCR) {
      this.options.push(new NAV.Macro(option, this, i));
    }
    if (option.SBP) {
      this.options.push(new NAV.SubProcedure(option, i, this.procedure));
    }
  }
  this.isInitialized = true;
};

/**
 * bepaald welke opties geldig zijn en welke ook direct zichtbaar moeten zijn.
 *
 * @returns {Array} van multi format targets
 */
NAV.SubProcedure.prototype.getActionMacros = function() {
  var foMultiFormatTargets = [];
  var foMacro = null;
  for (var i = 0, l = this.options.length; i < l; i++) {
    foMacro = this.options[i];
    if (foMacro.actionCode) {
      foMultiFormatTargets[foMacro.actionCode] = foMacro;
    }
  }
  if (this.actionCode) {
    foMultiFormatTargets[this.actionCode] = this;
  }
  return foMultiFormatTargets;
};

/**
 * zoekt actionMacro
 * @returns {macroDefinition}
 */
NAV.SubProcedure.prototype.getActionMacro = function() {
  if (!this.actionCode) {
    return null;
  }

  let foMacro = null;
  for (var i = 0, l = this.options.length; i < l; i++) {
    foMacro = this.options[i];

    if (this.actionCode == foMacro.actionCode) {
      return foMacro;
    }
  }
  return null;
};

NAV.SubProcedure.prototype.isEqual = function(obj) {
  return this.subProcedureName == obj.subProcedureName;
};

NAV.SubProcedure.prototype.getFormatMacros = function() {
  var macros = {},
    macro = null;
  for (var i = 0, l = this.options.length; i < l; i++) {
    macro = this.options[i];
    if (macro.formatCode && !macros[macro.formatCode]) {
      if (macro.macroName != SESSION.stack.currentMacro.macroName) {
        macros[macro.formatCode] = macro.serverID;
      }
    }
  }
  return macros;
};

NAV.SubProcedure.prototype.getMacro = function(fsMacroName) {
  var foMacro = null;
  for (var i = 0, l = this.options.length; i < l; i++) {
    foMacro = this.options[i];

    if (foMacro.macroName == fsMacroName) {
      return foMacro;
    }
  }
  return null;
};

/**
 * geeft alle zichtbare tabbladen terug alleen opties die
 * niet van het type target zijn (foOption.isTarget)
 * zijn geldig als er een format code is gezet dan mogen alleen de macros die die code heeft getoond worden
 *
 * @returns {Array} van NAV.Macro objecten
 */
NAV.SubProcedure.prototype.getVisibleMacros = function() {
  var faMacros = [];
  var foMacro = null;
  if (this.restrictToTarget) {
    return [this.restrictToTarget];
  }
  for (var i = 0, l = this.options.length; i < l; i++) {
    foMacro = this.options[i];
    if (foMacro.type == 'subProcedure') {
      continue;
    } //alleen maar macros

    if (foMacro.display != '*ALWAYS') {
      //Optie altijd tonen
      if (foMacro.isTarget) {
        continue;
      } //geen targets
      if (foMacro.display == '*ACNONLY') {
        continue;
      } //geen actionOnly
    }

    if (
      this.formatType == NAV.Stack.formatTyp.workFlow &&
      foMacro.display == '*FMTONLY' &&
      foMacro.formatCode != this.macroFormatCode
    ) {
      continue;
    } //als de macro een formatCode en  .DSP = "*FMTONLY"; (display)  en deze subprocedure is workFlow
    //alleen dan marco tonen anders verbergen
    if (this.formatType == NAV.Stack.formatTyp.multiFormat && !setThenEqual(foMacro.formatCode, this.macroFormatCode)) {
      continue;
    } //als er een formatCode is en deze subprocedure is multiFormat
    //              //alleen de juiste macro's met format code tonen
    faMacros.push(foMacro);
  }

  return faMacros;
};

NAV.SubProcedure.prototype.activate = function() {
  SubProcedureButton.activate(this.SBP);
};
NAV.SubProcedure.prototype.load = async function() {
  if (NAV.SubProcedure.currentInstance) {
    NAV.SubProcedure.currentInstance.close();
  }

  if (SESSION.stack.currentProcedure) {
    SESSION.stack.clearHistory(SESSION.stack.currentProcedure);
  }

  SESSION.stack.add(this);
  // SESSION.stack.currentSession.updateTitle();

  this.restrictToTarget = null;
  this.initOptions();
  resetAllsubfilePositions();
  this.setDefaultMacro();
  //subProcedureMenu.activate(this.optionNr);
  //this.button.activate();

  await this.initServerParams()
  this.start();

  NAV.SubProcedure.currentInstance = this;
  SESSION.stack.currentSubprocedure = this;
  SESSION.stack.currentSession.setTitle();
};

NAV.SubProcedure.prototype.close = function() {
  if (NAV.Macro.currentInstance) {
    NAV.Macro.currentInstance = null;
  }
  if (this.clearHistoryOnClose) {
    SESSION.stack.clearHistory(this.procedure);
  }
  // de clearhistory boolean is eenmalig en moet elke keer weer op false worden gezet als de history moet worden
  // behouden
  this.clearHistoryOnClose = false;
};

NAV.SubProcedure.prototype.start = function() {
  if (this.defaultMacro) {
    this.defaultMacro.load();
  }
};

NAV.SubProcedure.prototype.setDefaultMacro = function() {
  this.defaultMacro = this.getDefaultMacro();
};

/**
 * als er format codes worden gebruikt is de eerste optie de defaultMacro zoals hieronder bepaald mits deze de juiste
 * format code heeft. is dit niet het geval dan wordt de eerst beschikbare optie met de format code gebruikt. omdat
 * format codes als ze niet gebruikt worden null zijn zal bepalen van de default macro deze wordt aangegeven door
 * this.defaultMacroName foFirstValidFormatOption in dat geval de eerste 0 optie zijn is deze niet gedefinieerd dan
 * wordt dus macro 0 (eerste optie gebruikt)
 *
 * @returns {object} macro
 */
NAV.SubProcedure.prototype.getDefaultMacro = function() {
  let foFirstValidFormatOption = null,
    foMacro = this.getfavouriteMacro() || this.getActionMacro();

  if (this.options.length == 0) {
    return null;
  }
  if (foMacro) {
    return foMacro;
  }

  for (var i = 0, l = this.options.length; i < l; i++) {
    foMacro = this.options[i];
    if (foMacro.isTarget) {
      continue;
    }
    if (foMacro.display == '*ACNONLY') {
      continue;
    }

    if (setThenEqual(this.macroFormatCode, foMacro.formatCode) && !foFirstValidFormatOption) {
      foFirstValidFormatOption = foMacro;
    }
    if (foMacro.macroName == this.defaultMacroName && setThenEqual(this.macroFormatCode, foMacro.formatCode)) {
      return foMacro;
    }
  }
  if (this.defaultMacroName == '*NONE') {
    return null;
  } else {
    return foFirstValidFormatOption;
  }
};

/**
 * als er een openFromfavourite definitie is geinstantieerd
 * wordt de bijbehorende macro geretourneerd
 * @returns {macrodefinition}
 */
NAV.SubProcedure.prototype.getfavouriteMacro = function() {
  if (!SESSION.session.openFromfavourite) {
    return null;
  }
  const macro = this.options.filter(opt => opt.macroName == SESSION.session.openFromfavourite.MacroName)[0];
  return macro;
};

NAV.SubProcedure.prototype.setRestrictions = function(fsFormatCode, fsActionCode) {
  this.macroFormatCode = nullWhenEmpty(fsFormatCode);
  this.actionCode = nullWhenEmpty(fsActionCode);
};

NAV.SubProcedure.prototype.clearRestrictions = function() {
  this.macroFormatCode = null;
  this.actionCode = null;
};

NAV.SubProcedure.prototype.getMacrosDefs = function() {
  if (SESSION.stack.currentMacro.display == '*ACNONLY' && hasValue(SESSION.stack.currentMacro.actionCode)) {
    // alleen deze tab mag
    return [SESSION.stack.currentMacro.definition];
  }
  let macros = this.getVisibleMacros();
  return macros.map(m => m.definition);
};

NAV.SubProcedure.prototype.renderTabs = function() {
  MacroTab.render(this.getMacrosDefs());

  return;
  // var macroWidth = 6;
  // var tabDiv = XDOM.getObject('TABDIV');
  // var faMacros = this.getVisibleMacros();
  // // de breedte van de tabs worden bepaald door het aantal te tonen tabs
  // // de grootse tab heeft de laagtse waarde de minimale waarde is 6

  // tabDiv.innerHTML = '';

  // if (SESSION.stack.currentMacro.display == '*ACNONLY' && hasValue(SESSION.stack.currentMacro.actionCode)) { // alleen deze tab mag
  //   // worden gerenderd
  //   SESSION.stack.currentMacro.tab.render(macroWidth);
  //   return;
  // }

  // if (faMacros.length > 6) {
  //   macroWidth = faMacros.length;
  // }

  // for (var i = 0, l = faMacros.length; i < l; i++) {
  //   if (faMacros[i].display != '*ACNONLY') { // mag alleen getoond als het de actieve macro is zie hierboven
  //     faMacros[i].tab.render(macroWidth, i+1, l);
  //   }
  // }
};

/**
 *
 * @returns {Promise<void>}
 */
NAV.SubProcedure.prototype.initServerParams = async function() {
  if ((this.serverParameters.length == 0 && this.serverParametersValues.length == 0) || SESSION.submitInProgress) {
    return Promise.resolve();
  } // -->
  // ***************************************************************************
  // Clear van parms opgegeven in SBP object
  // parms: fSBPPRM=de te clearen parameters
  // fSBP =SBP object
  // fSBPNM =SBP naam
  // return: --
  // ***************************************************************************
  var fsUrl = '?PRCNAME=' + this.subProcedureName;

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

  fsUrl = SESSION.alias + '/box/ndmctl/inzsbp.ndm/main' + fsUrl;

  fsUrl = fsUrl.replace('#', '%23');

  await   fetch(fsUrl);

  // advAJAX.get({
  //   url: fsUrl,
  //   onSuccess: function(obj) {
  //     NAV.SubProcedure.initServerParamsResponse();
  //   },
  //   onError: function(obj) {
  //     console.log('Fout: ' + fsUrl + ' / ' + obj.status);
  //   }
  // });
};

/**
 * verwijderd referenties naar andere objecten en dom objecten in verband met eventuele memory leaks
 */
NAV.SubProcedure.prototype.clearHistory = function() {
  if (this.isCleanUp) return;
  this.isCleanUp = true;
  if (this.next) {
    this.next.clearHistory();
    this.next = null;
  }
};

NAV.SubProcedure.prototype.cleanUp = function() {
  if (this.button) {
    this.button.cleanUp();
  }
  this.button = null;
  this.procedure = null;
  this.application = null;
  this.previous = null;
  this.next = null;
  this.cleanUpOptions();
};

NAV.SubProcedure.prototype.cleanUpOptions = function() {
  var foOption = null;
  for (var i = 0, l = this.options.length; i < l; i++) {
    foOption = this.options[i];
    if (foOption) {
      foOption.cleanUp();
    }
    this.options[i] = null;
  }
  this.options = [];
};

NAV.SubProcedure.prototype.toString = function() {
  var fsReturn = '<br/><b>subProcedure:</b><br/>';
  fsReturn += 'optionNr:' + this.optionNr + '<br/>';
  fsReturn += 'title:' + this.title + '<br/>';
  fsReturn += 'application:' + this.application + '<br/>';
  fsReturn += 'description:' + this.description + '<br/>';
  fsReturn += 'defaultApp:' + this.defaultApp + '<br/>';
  fsReturn += 'defaultMacroName:' + this.defaultMacroName + '<br/>';
  fsReturn += '<hr />';
  if (this.next) {
    fsReturn += this.next;
  }
  return fsReturn;
};

NAV.SubProcedure.prototype.getDebugInfo = function() {
  return 'subProcedure : ' + this.title + '  subProcedureName: ' + this.subProcedureName + this.button;
};

NAV.SubProcedure.prototype.resetDirectTargets = function() {
  var foMacro = null;
  for (var i = 0, l = this.options.length; i < l; i++) {
    foMacro = this.options[i];
    foMacro.isDirectTarget = false;
  }
  this.restrictToTarget = null;
};

/**
 * verkrijgt subprocedure of de target Macro
 *
 * @param targetName
 * @returns subprocedure, macro of null
 */
NAV.SubProcedure.prototype.getTarget = function(targetName) {
  var foOption = null;
  var foReturn = null;
  for (var i = 0, l = this.options.length; i < l; i++) {
    foOption = this.options[i];
    if (foOption.macroName == targetName) {
      return foOption;
    }
    // target is een subprocedure
    if (foOption.subProcedureName == targetName) {
      if (foOption.type == 'subProcedure') {
        // de optie is als gedefinieerd als een subprocedure
        return foOption;
      }
      // als de subprocedure nog als target is gedefinieerd kijk of de subprocedure als optie in de procedure is
      // gedefinieerd
      foReturn = this.procedure.getSubProcedure(targetName);
      if (foReturn) {
        // de subprocedure is gevonden
        return foReturn;
      }
      // de subprocedure is niet gevonden en dus ook niet in de boom structuur opgenomen
      // er wordt een nieuwe subprocedure aangemaakt op basis van de definitie van de optie en geretourneerd
      return new NAV.SubProcedure(foOption.definition, null, this.procedure);
    }
  }
  //er is geen target gevonden in de huidige subprocedure
  //kijk of de target in de procedure is gedefinieerd

  return this.procedure.getSubProcedure(targetName);
};
