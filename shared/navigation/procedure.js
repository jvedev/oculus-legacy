/* procedure */
/* Load Timestamp 13:59:55.671 */
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
            var fsPrm = this.serverParameters[i];
            var fsVal = XDOM.getObjectValue(fsPrm);
            fsUrl += '&PRM' + (i + 1) + '=' + fsPrm;
            fsUrl += '&VAL' + (i + 1) + '=' + fsVal;
        }
    }
    /*add timestamp for unique data - IE11 problem*/
    fsUrl += '&TIMESTAMP=' + new Date().getTime();

    let response = await fetch(fsUrl);
    let responseText = await response.text();

    if (responseText.includes('MNT_ERR') || responseText.includes('MNT_NFD') || responseText.includes('MNT_SQL')) {
        let doc = new DOMParser().parseFromString(responseText, 'text/html');
        let titleElement = doc.querySelector('[name="PAGETITLE"]');
        let errorTitle = titleElement ? titleElement.value : 'Fout';
        let contentElement = doc.querySelector('#DTADIV');
        let errorContent = contentElement ? contentElement.innerHTML : responseText;

        AlertDialog.setTitle(errorTitle);
        AlertDialog.show(errorContent, [
            new DialogOption('OK', () => AlertDialog.hide())
        ]);
        
        releasePage();
        return Promise.reject();
    }

    return Promise.resolve();
};

NAV.Procedure.prototype.close = function() {
    //hier wordt de booom afgevoerd
    if (this.clearHistoryOnClose) {
        SESSION.stack.currentSession.stack.clearHistory(this);
    }
    this.clearHistoryOnClose = true;
};

/**
 * verwijderd referenties naar andere objecten en dom objecten in verband met eventuele memory leaks
 */
NAV.Procedure.prototype.clearHistory = function() {
    if (this.isCleanUp) return;
    this.isCleanUp = true;
    if (this.next) {
        this.next.clearHistory();
        this.next = null;
    }
    this.cleanUpSubProcedures();
};

NAV.Procedure.prototype.setMainButtons = function() {
    let foPrintingBtn = XDOM.getObject('printingBtn');
    if (!foPrintingBtn) {
        return;
    }
    XDOM.setAttribute(foPrintingBtn, 'data-button-enabled', 'true');
    SESSION.stack.currentSession.printingEnabled = true;
};