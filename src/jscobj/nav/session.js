var NAV = {};

NAV.Session = function (option, nr, fsCurrentEnviroment) {
    this.type = 'session';
    this.id = NAV.Session.instances.length;
    this.companyName = '';
    this.language = '';
    this.path = '';
    this.jobNr = '';
    this.serverId = '';
    this.alias = '';
    this.jobStatusInterval = null;
    this.autoRenewInterval = null;
    this.retrieveJobStsOnce = false;
    this.monitorJobCGI = '';
    this.authenticationToken = '';
    this.frameObject = null;
    this.sessionScope = null;
    this.state = ENUM.sessionState.active;
    this.jobState = ENUM.jobState.run;
    this.dom = {};
    this.stack = new NAV.Stack();
    this.next = null;
    this.menu = null;
    this.macroResolution = '';
    this.procedures = [];
    this.sessionWindow = null;
    this.defaultApplication = null;
    this.defaultProcedure = null;
    this.procedureHelpUrl = '';
    this.isCleanUp = false;
    this.isDirectStart = false;
    this.debugMode = false;
    this.directStartProcedureDefinition = null;
    this.hasValidProcedures = false;
    this.invalidProcedures = [];
    this.printingEnabled = false;
    this.showInMultipleFrame = ENUM.screenPart.left;
    this.cancelBlurEvent = false;
    if (!OCULUS.extendedNav) {
        this.signOnMethode = OCULUS.signOnMethode;
        this.tokenValue = OCULUS.tokenValue; // sessie gestart vanuit 5250
        return;
    }

    this.optionNumber = nr;
    this.option = option || {};
    this.signOnMethode = option.SON;
    if (fsCurrentEnviroment) {
        this.enviroment = fsCurrentEnviroment;
    } else {
        this.enviroment = option.ENV;
    }
    this.clickPath = option.clickPath;
    this.textPath = option.textPath;
    this.program = option.PGM;
    this.description = option.DSC;
    this.application = option.APP;
    this.title = option.TTL;
    this.homePage = option.TYP === 'HOME';
    this.homeType = option.HOMETYPE || '*SBM';
    this.openFromfavourite = SCOPE.main.openingFavorite || false;
    this.parmKey = this?.openFromfavourite?.parmKey || ''
    this.theme = '';
};

NAV.Session.prototype.setProcedureValue = function (titleValues) {
    if (OCULUS.extendedNav) {
        return;
    }

    this.description = titleValues.MNUDSC;
    this.application = titleValues.DFTAPP;
    this.title = titleValues.MNUTTL;
    this.setTitle();
};

NAV.Session.prototype.toString = function () {
    var fsReturn = '<br/><b>Session:</b><br/>';
    fsReturn += 'signInMethode : ' + this.signOnMethode + '<br/>';
    fsReturn += 'enviroment : ' + this.enviroment + '<br/>';
    fsReturn += 'title : ' + this.title + '<br/>';
    fsReturn += 'language : ' + this.language + '<br/>';
    fsReturn += 'program : ' + this.program + '<br/>';
    fsReturn += 'description  :' + this.description + '<br/>';
    fsReturn += 'application : ' + this.application + '<br/>';
    fsReturn += 'title : ' + this.title + '<br/>';
    fsReturn += '<hr />';
    if (this.next) {
        fsReturn += this.next;
    }
    return fsReturn;
};

NAV.Session.prototype.getDebugInfo = function () {
    return 'Session ' + this.title + ': ' + this.description;
};

/**
 * verwijderd referenties naar andere objecten en dom objecten in verband met eventuele memory leaks
 */
NAV.Session.prototype.cleanUp = function () {
    if (this.isCleanUp) return;
    this.isCleanUp = true;
    this.menu = null;
    this.next = null;
    this.stack = null;
    this.dom.sessionTitle = null;
    this.dom.adminName = null;
    this.cleanUpOptions();
};

NAV.Session.prototype.cleanUpOptions = function () {
    var foOption = null;
    for (var i = 0, l = this.procedures.length; i < l; i++) {
        foOption = this.procedures[i];
        if (foOption && foOption.cleanUp) {
            foOption.cleanUp();
        }
        this.procedures[i] = null;
    }
    this.procedures = [];
};

/**
 * verwijderd referenties naar andere objecten en dom objecten in verband met eventuele memory leaks
 */
NAV.Session.prototype.clearHistory = function () {
    if (this.next) {
        this.next.clearHistory();
        this.next = null;
    }
};

NAV.Session.instances = [];
NAV.Session.currentInstance = null;
NAV.Session.sessionsLeftSide = [];
NAV.Session.sessionsRightSide = [];


NAV.Session.prototype.init = async function () {
    this.path = `/${this.signOnMethode}/ndpcgi/box/ndmctl/inzpfm.ndm/start?NETCALL=NEWSBM&AUTHTOKEN=${window.top.authenticationToken}`
    const debugMode = DevTools.useCache() ? "" : "debug";
    if (!OCULUS.extendedNav) {
        this.path += `&TOKEN=${this.tokenValue}`;
    } else {
        this.path +=
            '&PFMSOMTD=' +
            this.signOnMethode +
            '&mNM_SBM=' +
            this.program +
            '&PFMFILID=' +
            this.enviroment +
            '&PFMAPP=' +
            this.application +
            '&gsDEBUG=' +
            debugMode +
            '&pCACHE=' +
            OCULUS.clearCache +
            '&iTIME=' +
            new Date().getTime();
        if (this.parmKey !== '') {
            this.path += '&PARMKEY=' + this.parmKey;
        }

        const skinTone = SCOPE.main.newTheme.getTheme(this.enviroment);
        this.path += `&themeType=${skinTone}&homeOption=${this.program}&optionType=${this.homeType}`;
        this.debugMode = debugMode;

    }
    NAV.Session.instances.push(this);
};

NAV.Session.checkMaxSessions = function () {
    var fiActiveSessions = 0;
    for (var i = 0, l = NAV.Session.instances.length; i < l; i++) {
        if (NAV.Session.instances[i]) {
            fiActiveSessions++;
        }
    }
    if (fiActiveSessions >= SETTINGS.maxSessions) {
        SCOPE.main.Dialogue.alert(getCapt('gMAXSESSIONS'));
        return false;
    }

    GLOBAL.sessionCount = fiActiveSessions;
    return true;
};

NAV.Session.newSession = async function (option, nr, home = false) {
    var enviroment = null;
    if (!NAV.Session.checkMaxSessions()) {
        return;
    }
    if (option.ENV === '*VAR') {
        derivedAdministration.open(option, nr);
        return;
    }
    var foSession = new NAV.Session(option, nr, enviroment);
    foSession.home = home;
    //show new session loader
    var newSessionLoader = XDOM.getObject('newSessionLoader');
    if (newSessionLoader) {
        newSessionLoader.className = 'protectDIV';
    }

    foSession.load();
    if (minVersion('*8A')) {
        await SCOPE.main.Settings.loadNow(option.ENV);
    }

};

NAV.Session.directStart = function () {
    /*
     *opstarten token en tablet
     */
    if (NAV.Session.checkMaxSessions()) {
        const foSession = new NAV.Session();
        foSession.load();
    }
};

NAV.Session.prototype.load = function () {
    this.init();
    this.stack.add(this);
    this.createFrame();
    this.activate(true);
};

NAV.Session.prototype.updateMainBtns = function () {
    let printSessionBtn = XDOM.getObject('printSessionBtn'),
        chooseSkinBtn = XDOM.getObject('chooseSkinBtn'),
        mainMenuHelpBtn = SCOPE.mainDoc.querySelector('[data-event-class="Help"][data-click="mainMenu"]'),//XDOM.getObject('mainMenuHelpButton'),
        closeSessionBtn = XDOM.getObject('closeCurrentSession');


    if (NAV.Session.getNrOfSessions() === 0) {
        XDOM.setAttribute(closeSessionBtn, 'data-button-enabled', 'false');
        XDOM.setAttribute(printSessionBtn, 'data-button-enabled', 'false');
        XDOM.setAttribute(chooseSkinBtn, 'data-button-enabled', 'false');
        XDOM.setAttribute(mainMenuHelpBtn, 'data-button-state', 'disabled');
        return;
    }

    XDOM.setAttribute(closeSessionBtn, 'data-button-enabled', 'true');
    XDOM.setAttribute(chooseSkinBtn, 'data-button-enabled', 'true');

    if (this.printingEnabled) {
        XDOM.setAttribute(printSessionBtn, 'data-button-enabled', 'true');
    } else {
        XDOM.setAttribute(printSessionBtn, 'data-button-enabled', 'false');
    }

    if (this.helpUri) {
        XDOM.setAttribute(mainMenuHelpBtn, 'data-button-state', 'enabled');
    } else {
        XDOM.setAttribute(mainMenuHelpBtn, 'data-button-state', 'disabled');
    }
};

NAV.Session.getNrOfSessions = function () {
    return MAINDOC.querySelectorAll('.sessionTabWrapper .sessionTabContainer ')
        .length;
};
NAV.Session.prototype.setTitle = function () {
    var administrationName = XDOM.getObject('administrationName');
    var macroDescription = XDOM.getObject('macroDescription');
    let fsProcedureTitle = '',
        procedureDescription = '';

    //als er een procedure geladen is haal dan de titel op
    if (this.stack.currentProcedure) {
        fsProcedureTitle = this.stack.currentProcedure.description || '';
        if (SCOPE.main.Settings.get('SESSION_TAB_TITLE_ORIGIN') == '*PROCEDURE') {
            procedureDescription = this.stack.currentProcedure.description;
        } else {
            procedureDescription = this.stack.currentSession.description;
        }
    }

    if (this.homePage) {
        this.title = 'Home';
        procedureDescription = '';
    }
//beware template strings
    let textPath = this.textPath ?
        `
    ${this.textPath}` : '';

    let procedureTitle = `
${this.title}
${fsProcedureTitle}
${getCapt('cTX_SSN')}: ${this.jobNr} ${textPath}`;

    let nonProcedureTitle = `
${this.title}
${fsProcedureTitle}
${getCapt('cTX_SSN')}: ${this.jobNr}  ${textPath}`;

    if (OCULUS.debugMode) {
        //whatever title u use override it for the developers
        procedureTitle = nonProcedureTitle = `
          ${this.title} - ${this.program}
          ${fsProcedureTitle}
          ${getCapt('cTX_ENV')}: ${this.enviroment}
          ${getCapt('cTX_SSN')}: ${this.jobNr}${textPath} `;
    }
    SessionTab.setTitle(this.jobNr, procedureTitle, nonProcedureTitle, procedureDescription);

    if (NAV.Session.getNrOfSessions() > 0 || !OCULUS.extendedNav) {
        XDOM.replaceAllChilds(
            administrationName,
            XDOM.createTextNode(this.companyName)
        );
        if (this.stack.currentProcedure) {
            XDOM.replaceAllChilds(
                macroDescription,
                XDOM.createTextNode(this.stack.currentProcedure.title || '')
            );
        } else {
            XDOM.removeAllChilds(macroDescription);
        }
    } else {
        XDOM.removeAllChilds(macroDescription);
    }
};

NAV.Session.prototype.onLoad = function () {
    this.showFrame();
    var newSessionLoader = XDOM.getObject('newSessionLoader');
    if (newSessionLoader) {
        newSessionLoader.className = 'noprotectDIV';
    }

    if (this.sessionWindow) {
        this.sessionWindow.ProcedureMenu.focusMenu();
    }
};
/**
 * creatie van het frame waarin de sessie wordt gestart voorheen createSessionFrame
 */
NAV.Session.prototype.createFrame = function () {
    var foSessionWrapper = XDOM.getObject('sessionWrapper');
    var frameId = this.id;
    let session = this;
    this.frameObject = XDOM.createElement(
        'IFRAME',
        'FRMSES_' + frameId,
        'sessionFrame gradientClassGreyWhite sessionMultiFrame_' +
        this.showInMultipleFrame
    );
    this.frameObject.setAttribute('data-screen-size', 'mediumScreen');
    foSessionWrapper.appendChild(this.frameObject);
    this.frameObject.setAttribute('name', 'xxSFRMSES_' + frameId);
    this.frameObject.setAttribute('data-environment', this.enviroment);

    this.frameObject.setAttribute('data-hidden', 'true');

    this.frameObject.addEventListener('load', function (e) {
        const error = handleResponseErrors(e.target.contentDocument)
        if (error) {
            setTimeout(() => {
                    session.close()
                    const tab = SCOPE.mainDoc.querySelector(`.sessionTab[data-button-state="active"]`)
                    if (tab) {
                        tab.dataset.buttonState = "inactive"
                        XDOM.invokeClick(tab)
                    }
                }, 2000
            )
        }
        session.onLoad();
    });
    this.frameObject.src = this.path;
};


NAV.Session.prototype.activateSessionFrame = function (e) {
    NAV.Session.activateSessionFrame(e);
};

NAV.Session.activateSessionFrame = function (e) {
    XDOM.getEvent(e);
    var sessionToActivateId = GLOBAL.eventSourceElement.document.body.getAttribute(
        'data-session-id'
    );
    if (
        NAV.Session.instances[sessionToActivateId] === NAV.Session.currentInstance
    ) {
        return;
    }
};

NAV.Session.hideAll = function () {
    //P.setAttributesToNodeList("iframe[data-session-job-nr]","data-hidden", "true");
    P.setAttributesToNodeList('.sessionFrame', 'data-hidden', 'true');
    SessionTab.deActivateAll();
};

NAV.Session.prototype.activate = function (newSesion) {
    var currentSession = NAV.Session.currentInstance;

    if (currentSession && currentSession !== this) {
        currentSession.deactivate();
    }

    //if session exists
    if (!newSesion) {
        //if(currentSession){
        //  SCREEN.sessionFrameController(this);
        //}
        this.showFrame();
    }

    if (currentSession) {
        XDOM.classNameRemove(currentSession.frameObject, 'activeFrame');
        currentSession.cancelBlurEvent = false;
    }

    this.frameObject.className += ' activeFrame';

    //set new current instance
    NAV.Session.currentInstance = this;
    currentSession = this;

    this.clearRetrieveJobSts();

    if (newSesion) {
        //update resolution mode
        if (!OCULUS.splitSession) {
            SCREEN.handleMacroLoad(ENUM.screenSize.classic);
        }

        this.updateResolutionMode();
        currentSession.setTitle();
    }

    //if session exists
    if (!newSesion) {
        NAV.Session.checkStatus(this.id, false, true); //single job status check;

        currentSession.setTitle(); // RKR - POM-2202

        if (this.macroResolution && this.macroResolution === 'largeScreen') {
            SCREEN.handleMacroLoad(ENUM.screenSize.large);
        } else if (this.macroResolution && this.macroResolution === 'highScreen') {
            SCREEN.handleMacroLoad(ENUM.screenSize.high);
        } else {
            SCREEN.handleMacroLoad(ENUM.screenSize.classic);
        }
    }
    this.state = ENUM.sessionState.active;
    if (
        this.frameObject.contentWindow &&
        this.frameObject.contentWindow.refocus
    ) {
        this.frameObject.contentWindow.refocus();
    } else if (this.frameObject.refocus) {
        this.frameObject.refocus();
    }

    OCULUS.procedureHelpUrl = this.procedureHelpUrl;

    this.updateMainBtns();

    if (this.sessionScope) {
        if (
            this.sessionScope.activePage &&
            this.sessionScope.activePage.lastSelectedInput
        ) {
            this.sessionScope.activePage.lastSelectedInput.focus();
        }
    }
    this.updateScope();
    MainMenu.update(this.clickPath);
    // SCOPE.main.MainMenu.update(this);
};

NAV.Session.prototype.updateScope = async function () {
    SCOPE.session = this.frameObject.contentWindow;
    SCOPE.sessionDoc = this.frameObject.contentWindow.document;
    SESSIONDOC = this.frameObject.contentWindow.document;
    PAGEDOC = null;

    let appFrame = SESSIONDOC.querySelector('iframe[data-hidden="false"]');
    if (appFrame && appFrame.contentWindow) {
        PAGE = appFrame.contentWindow;
        SCOPE.page = appFrame.contentWindow;
        SCOPE.pageDoc = appFrame.contentWindow.document;

        // /** Adding events wrapper to pageDoc events */
        // Events.register(SCOPE.pageDoc);

        PAGEDOC = appFrame.contentWindow.document;
    }
};

NAV.Session.prototype.clearRetrieveJobSts = function () {
    clearInterval(this.jobStatusInterval);
    this.jobState = '';
    this.retrieveJobStsOnce = true;
    NAV.Session.removeJobStatusDiv(this);

    this.jobStatusInterval = null;
};

NAV.Session.prototype.deactivate = function () {
    // Close the open colour picker
    window.Dialogue.getModalById("colourSchemesDialog").visible = false;

    this.state = ENUM.sessionState.inactive;
    var fiSessionId = this.id;
    clearInterval(this.jobStatusInterval);
    this.jobStatusInterval = setInterval(
        'NAV.Session.checkStatus(' + fiSessionId + ', false)',
        SETTINGS.checkJobTimeout
    );
};

NAV.Session.prototype.startDefaultProcedure = function () {
    this.procedures[0].load();
};

NAV.Session.prototype.initOptions = function (procedureOptions) {
    let status = '',
        foOpt = null,
        foProc = null,
        foOptions = null,
        defaultProcedureName = '',
        enumStatus = this.sessionWindow.NAV.validationTree.status;

    if (this.directStartProcedureDefinition) {
        this.sessionWindow.NAV.validationTree.setSession(procedureOptions, this, true);
        procedureOptions = this.directStartProcedureDefinition;
    } else {
        this.sessionWindow.NAV.validationTree.setSession(procedureOptions, this, false);
    }

    this.cleanUpOptions();
    foOptions = procedureOptions.OPT;
    this.menuSubTitles = procedureOptions.SUBTTL;

    var titleValues = {
        MNUDSC: procedureOptions.MNUDSC,
        DFTAPP: procedureOptions.DFTAPP,
        MNUTTL: procedureOptions.MNUTTL
    };

    this.setProcedureValue(titleValues);

    titleValues = null;

    this.defaultApplication = procedureOptions.DFTAPP;
    this.defaultProcedure = null;
    defaultProcedureName = procedureOptions.DFTPRC;
    if (this.openFromfavourite) {
        defaultProcedureName = this.openFromfavourite.ProcedureName;
    }

    for (let i = 0, l = foOptions.length; i < l; i++) {
        if (this.menuSubTitles && this.menuSubTitles[i]) {
            this.procedures.push(this.menuSubTitles[i]);
        }
        foOpt = foOptions[i];
        const evaluateObject = this.sessionWindow.NAV.validationTree.get(foOpt.PRC);

        status = evaluateObject.status

        if (this.directStartProcedureDefinition) {
            status = enumStatus.valid;
        }
        switch (status) {
            case enumStatus.valid:
                if (this.validateOption(foOpt, this.defaultApplication)) {
                    foProc = new this.sessionWindow.NAV.Procedure(foOpt, i, this);
                    if (foProc.procedureName === defaultProcedureName) {
                        this.defaultProcedure = foProc;
                    }
                    this.hasValidProcedures = true;
                    this.procedures.push(foProc);
                }
                break;
            case enumStatus.definitionMissing:
                foProc = new this.sessionWindow.NAV.Procedure(foOpt, i, this);
                foProc.available = false;
                this.procedures.push(foProc);
                break;
            case enumStatus.unValid:
                foOpt.reason = evaluateObject.reason;
                this.invalidProcedures.push(foOpt);

            default:
                break;
        }
    }
    return;
};

NAV.Session.prototype.validateOption = function (foOption, fsAPP) {
    if (!this.isValidOption(foOption, fsAPP)) {
        return false;
    } //--->
    return this.hasValidOption(foOption);
};

NAV.Session.prototype.isValidOption = function (foOption, app) {

    var fsAPP = app;
    if (foOption.DSP && foOption.DSP === 'NO') {
        return false;
    }

    if (foOption.MOD && !this.validModules[foOption.MOD]) {
        return false;
    }

    if (foOption.APP) {
        fsAPP = foOption.APP;
    }

    return !(foOption.APP && !this.validApps[fsAPP]);

};

/**
 * @param {object} foOption macro opties
 * @return {boolean} geeft aan of deze macro minimaal 1 geldige optie heeft
 * bepaald of een macro beschikbaare optie's heeft
 */
NAV.Session.prototype.hasValidOption = function (foOption) {
    var foMacro = getEval(foOption.PRC, null, this.sessionWindow);
    if (foOption.isHome) {
        foMacro = foOption;
    }
    if (foMacro && foMacro.OPT) {
        for (var i = 0, l = foMacro.OPT.length; i < l; i++) {
            if (this.isValidOption(foMacro.OPT[i], foMacro.DFTAPP)) {
                return true;
            }
        }
    }
    return false;
};

/* ***************************************************************************
/* Controleert periodiek de status van de sessie
// parms:  fsSESNR = sessienummer dat gecontroleerd moet worden
// return: --
// In het betreffende tabblad wordt indien nodig een symbool zichtbaar
*************************************************************************** */
NAV.Session.prototype.endJob = async function () {
    var timeStamp = new Date().getTime();
    var url =
        OCULUS.monitorJobCGI +
        '/box/ndmctl/rtvjobsts.ndm/AJAX?JOBNR=' + this.jobNr +
        '&PFMFILID=' + this.enviroment +
        '&TMSTM=' + timeStamp +
        '&AUTHTOKEN=' + this.authenticationToken +
        '&requestType=requestEnd';
    const response = await fetch(url).then(response => response.text());
    return this.terminate(response)
};

NAV.Session.checkStatusAfterReload = function (id) {
    var foSession = NAV.Session.instances[id];
    if (foSession) {
        foSession.jobStatusInterval = setTimeout(
            'NAV.Session.checkStatus(' + id + ', false, false );',
            GLOBAL.timeRetrieveJobStsAfterReload
        );
    }
};
NAV.Session.checkStatus = function (fiId, fbDelayed, fbCheckOnce) {
    var foSession = NAV.Session.instances[fiId];

    if (foSession) {
        if (fbDelayed) {
            foSession.jobStatusInterval = setTimeout(
                'NAV.Session.checkStatus(' + fiId + ', false, ' + fbCheckOnce + ');',
                GLOBAL.timeRetrieveJobSts
            );
        } else {
            if (fbCheckOnce) {
                foSession.retrieveJobStsOnce = fbCheckOnce;
            }

            foSession.checkStatus();
        }
    }
};

NAV.Session.prototype.updateResolutionMode = function () {
    if (this.frameObject.contentDocument.body) {
        if (
            this.frameObject.contentDocument.body.getAttribute('data-screen-size') !==
            this.macroResolution ||
            this.frameObject.contentDocument.body.getAttribute(
                'data-oculus-resolution'
            ) !== OCULUS.sessionResolution
        ) {
            if (this.sessionScope && this.sessionScope.appFrame) {
                var activeAppFrame = this.sessionScope.appFrame.frameElement;
                var activeFlashFrame = this.sessionScope.antiFlashingFrameObj
                    .frameElement;
                activeAppFrame.contentDocument.body.setAttribute(
                    'data-screen-size',
                    this.macroResolution
                );
                activeFlashFrame.contentDocument.body.setAttribute(
                    'data-screen-size',
                    this.macroResolution
                );
            }

            this.frameObject.contentDocument.body.setAttribute(
                'data-screen-size',
                this.macroResolution
            );
            this.frameObject.contentDocument.body.setAttribute(
                'data-oculus-resolution',
                OCULUS.sessionResolution
            );
            //      this.frameObject.contentDocument.body.className =                OCULUS.sessionResolution + 'Resolution';
        }
    }
};

NAV.Session.prototype.checkStatus = function () {
    if (this.jobState == 'END') {
        return;
    }
    var fdTIME = new Date();
    var TMSTM = fdTIME.getTime();
    var fsDIRPT =
        OCULUS.monitorJobCGI +
        '/box/ndmctl/rtvjobsts.ndm/AJAX?JOBNR=' +
        this.jobNr +
        '&PFMFILID=' +
        this.enviroment +
        '&TMSTM=' +
        TMSTM +
        '&AUTHTOKEN=' +
        SESSION.AUTHTOKEN +
        '&requestType=status';

    var foTMP = {};
    foTMP.TMSTM = TMSTM;
    foTMP.session = this;

    advAJAX.get({
        url: fsDIRPT,
        tag: foTMP,
        onError: function () {
            console.log('NAV.Session.prototype.checkStatus ajax call mislukt');
        },
        onSuccess: function (obj) {
            NAV.Session.handleResponse(obj);
        },
        onRetry: function () {
            console.log(
                'NAV.Session.prototype.checkStatus ajax call opnieuw proberen'
            );
        }
    });
};


NAV.Session.handleResponse = function (foResponse) {
    var foSession = foResponse.tag.session;
    var fsAttribute = 'ok';
    var xmlDoc = XDOM.getXML(foResponse.responseText);
    const jobStatusTag = xmlDoc.getElementsByTagName('jobStatus')[0];
    let fsStatus = '';
    if (jobStatusTag) {
        fsStatus = jobStatusTag.childNodes[0].nodeValue;
    }


    if (SessionTab.getDom(this.jobNr)) {
        return;
    } //tablad is er niet meer
    switch (fsStatus) {
        case 'END':
        case 'MSGW':
            fsAttribute = 'attentionError';
            if (
                foSession.state === ENUM.sessionState.active ||
                foSession.jobState !== fsStatus
            ) {
                foSession.getStatusMsg(foSession, fsStatus);
            }
            break;
        case 'HLD':
        case 'LCKW':
            fsAttribute = 'attentionWarning';
            if (
                foSession.state === ENUM.sessionState.active ||
                foSession.jobState !== fsStatus
            ) {
                foSession.getStatusMsg(foSession, fsStatus);
            }
            break;
        case 'DLYW':
            fsAttribute = 'ok';
            if (foSession.state === ENUM.sessionState.active) {
                foSession.jobStatusInterval = setTimeout(
                    'NAV.Session.checkStatus(' + foSession.id + ', false)',
                    GLOBAL.timeRetrieveJobSts
                );
            }
            break;
        case 'RUN':
            fsAttribute = 'ok';
            if (foSession.state === ENUM.sessionState.active) {
                foSession.jobStatusInterval = setTimeout(
                    'NAV.Session.checkStatus(' + foSession.id + ', false)',
                    GLOBAL.timeRetrieveJobSts
                );
            }
            NAV.Session.removeJobStatusDiv(foSession);
            break;
        default:
            fsAttribute = 'ok';
            NAV.Session.removeJobStatusDiv(foSession);
            break;
    }
    SessionTab.setJobStatus(foSession.jobNr, fsAttribute);
    foSession.jobState = fsStatus;
};

NAV.Session.prototype.getStatusMsg = function (foSession, fsStatus) {
    if (foSession.jobState === fsStatus) {
        foSession.jobStatusInterval = setTimeout(
            'NAV.Session.checkStatus(' + foSession.id + ', false)',
            GLOBAL.timeRetrieveJobSts
        );
        return;
    }

    var fdDate = new Date();
    var ftTimeStampHash = fdDate.getTime();
    var fsDirectoryPointer =
        OCULUS.monitorJobCGI +
        '/box/ndmctl/rtvjobsts.ndm/AJAX?JOBNR=' +
        this.jobNr +
        '&PFMFILID=' +
        this.enviroment +
        '&AUTHTOKEN=' +
        SESSION.AUTHTOKEN +
        '&TMSTM=' +
        ftTimeStampHash;

    advAJAX.get({
        url: fsDirectoryPointer,
        tag: ftTimeStampHash,
        onError: function (obj) {
        },
        onSuccess: function (obj) {
            NAV.Session.renderJobStatusDiv(obj, foSession);
        },
        onRetry: function () {
            console.log('Opnieuw proberen');
        }
    });
};

NAV.Session.renderJobStatusDiv = function (foResponse, foSession) {
    var activeAppFrame = XDOM.getObject(
        'sessionContainer',
        foSession.frameObject.contentDocument
    );

    var foJobStatusBg = XDOM.getObject(
        'jobStatusBg',
        foSession.frameObject.contentDocument
    );
    var fsMsg = foResponse.responseText;

    if (!foJobStatusBg) {
        foJobStatusBg = XDOM.createElement('DIV', 'jobStatusBg', null);
        foJOBSTSDIV = XDOM.createElement('DIV', 'JOBSTSDIV', null);

        foJOBSTSDIV.innerHTML = fsMsg;

        activeAppFrame.appendChild(foJobStatusBg);
        foJobStatusBg.appendChild(foJOBSTSDIV);
    } else {
        foJOBSTSDIV.innerHTML = fsMsg;
    }

    let labels = foJOBSTSDIV.getElementsByTagName('label');
    for (let i = 0, l = labels.length; i < l; i++) {
        let label = labels[i];
        label.innerHTML = getCapt(label.id);
        ;
    }


    if (foSession.state === ENUM.sessionState.active) {
        foSession.jobStatusInterval = setTimeout(
            'NAV.Session.checkStatus(' + foSession.id + ', false)',
            GLOBAL.timeRetrieveJobSts
        );
    }
    return true;
};

NAV.Session.removeJobStatusDiv = function (foSession) {
    var foJobStatusBg = XDOM.getObject(
        'jobStatusBg',
        foSession.frameObject.contentDocument
    );
    if (foJobStatusBg) {
        XDOM.removeDOMObject(foJobStatusBg);
    }

    SessionTab.setJobStatus(foSession.jobNr, 'ok');
    if (!foSession.retrieveJobStsOnce) {
        if (foSession.state === ENUM.sessionState.active) {
            foSession.jobStatusInterval = setTimeout(
                'NAV.Session.checkStatus(' + foSession.id + ', false)',
                GLOBAL.timeRetrieveJobSts
            );
        }
    }
};

NAV.Session.prototype.terminate = async function (responseText) {
    /* ***************************************************************************
    // Beeindigt de job op de server van de gesloten sessie
    // parms:  foJOBS=object met job informatie
    // return: false
    *************************************************************************** */
    const xmlDoc = XDOM.getXML(responseText);
    const statusElement = xmlDoc.getElementsByTagName('endResume')[0];
    if (!statusElement) {
        // not the answer we are looking for
        console.error('serverside error for terminate. server response:');
        console.log(responseText);
        return;
    }
    if (statusElement.childNodes[0].nodeValue !== '*END') {
        return;
    }
    const url = this.alias +
        '/box/ndmctl/terminate.ndm/main?reason=' + this.closeReason +
        '&AUTHTOKEN=' + this.authenticationToken
    return fetch(url);


};

/**
 * inhoudt vanuit closeSession
 */
NAV.Session.prototype.close = async function (reason, isActive) {
    this.state = ENUM.sessionState.closed;
    this.closeReason = reason;

    if (NAV.Session.getNrOfSessions()) {
        this.setTitle();
    }
    this.updateMainBtns();
    if (isActive) {
        NAV.Session.currentInstance = null;
    }

    this.remove();
    this.removeFrame();
    await this.endJob();

    this.clearHistory();
    this.cleanUp();
    OCULUS.procedureHelpUrl = null;
    if (OCULUS.extendedNav) {
        return;
    }
    // not extended nav so dont go to root
    window.location.href = '/';
};

NAV.Session.prototype.zoomIn = function () {
    if (minVersion('*8A')) {
        return;
    }
    const zoomFactor = SCOPE.main.Settings.get('ZOOM_FACTOR');
    this.zoom();
    if (BrowserDetect.isFirefox) {
        this.frameObject.contentDocument.activeElement.style.zoom =
            MAIN.OCULUS.zoomFactors[zoomFactor].scaleFactor;
    } else {
        this.frameObject.contentDocument.activeElement.style.zoom =
            MAIN.OCULUS.zoomFactors[zoomFactor].zoomFactor;
    }
};

NAV.Session.prototype.zoomOut = function () {
    if (minVersion('*8A')) {
        return;
    }
    const zoomFactor = SCOPE.main.Settings.get('ZOOM_FACTOR');
    if (BrowserDetect.isFirefox) {
        this.frameObject.contentDocument.activeElement.style.zoom =
            MAIN.OCULUS.zoomFactors[zoomFactor].scaleFactor;
    } else {
        this.frameObject.contentDocument.activeElement.style.zoom =
            MAIN.OCULUS.zoomFactors[zoomFactor].zoomFactor;
    }

    this.zoom();
};

NAV.Session.prototype.zoom = function () {
    if (minVersion('*8A')) {
        return;
    }
    var appBody = null;
    var searchBody = null;
    var flashBody = null;
    var frameBody = null;

    if (!this.sessionScope) {
        return;
    }

    if (this.sessionScope.appFrame) {
        appBody = this.sessionScope.appFrame.document.getElementsByTagName(
            'BODY'
        )[0];
    }
    if (this.sessionScope.searchFrame) {
        searchBody = this.sessionScope.searchFrame.document.getElementsByTagName(
            'BODY'
        )[0];
    }
    if (this.sessionScope.antiFlashingFrameObj) {
        flashBody = this.sessionScope.antiFlashingFrameObj.document.getElementsByTagName(
            'BODY'
        )[0];
    }
    if (this.sessionScope.session.frameObject) {
        frameBody = this.sessionScope.session.frameObject.contentWindow.document.getElementsByTagName(
            'BODY'
        )[0];
    }

    if (!appBody || !searchBody || !flashBody || !frameBody) {
        return;
    }
    const zoomFactor = SCOPE.main.Settings.get('ZOOM_FACTOR');
    if (BrowserDetect.isFirefox) {
        appBody.style.zoom =
            MAIN.OCULUS.zoomFactors[zoomFactor].scaleFactor;
        searchBody.style.zoom =
            MAIN.OCULUS.zoomFactors[zoomFactor].scaleFactor;
        flashBody.style.zoom =
            MAIN.OCULUS.zoomFactors[zoomFactor].scaleFactor;
        frameBody.style.zoom =
            MAIN.OCULUS.zoomFactors[zoomFactor].scaleFactor;
    } else {
        appBody.style.zoom =
            MAIN.OCULUS.zoomFactors[zoomFactor].zoomFactor;
        searchBody.style.zoom =
            MAIN.OCULUS.zoomFactors[zoomFactor].zoomFactor;
        flashBody.style.zoom =
            MAIN.OCULUS.zoomFactors[zoomFactor].zoomFactor;
        frameBody.style.zoom =
            MAIN.OCULUS.zoomFactors[zoomFactor].zoomFactor;
    }
};


/**
 * verwijderen van een sessie
 */
NAV.Session.prototype.remove = function () {
    delete NAV.Session.instances[this.id];
};

/**
 * Sluiten en verwijderen van de sessie
 * parms:  foSESTAB=object van de sessie tab
 * return: fbOK=true/false    (gelukt/niet gelukt)
 */
NAV.Session.prototype.removeFrame = function () {
    XDOM.removeDOMObject(this.frameObject);
};


NAV.Session.prototype.showFrame = function () {
    let frame = this.frameObject || this,
        shownFrames = document.querySelectorAll(
            '.sessionFrame:not([data-hidden="true"])'
        );

    $(shownFrames).each(function (index, frame) {
        frame.setAttribute('data-hidden', 'true');
    });

    frame.setAttribute('data-hidden', 'false');
    if (OCULUS.tablet) {
        setTimeout(function () {
            frame.setAttribute('data-hidden', 'false');
        }, 1);
    }
};

/**
 * zet nog niet bekende waarde in sessie object wordt aangeroepen vanuit het session frame.
 * @param sessionScope SESSION uit SESSIONFRAME
 */
NAV.Session.prototype.setSessionAttributes = function (sessionScope) {
    if (!this.option) {
        this.option = {
            IDT: 'singleAdmin'
        };
    }
    this.jobNr = sessionScope.jobId;
    this.sessionScope = sessionScope;
    this.serverId = sessionScope.serverId;
    this.alias = sessionScope.alias;
    this.enviroment = sessionScope.enviroment;
    this.language = sessionScope.language;
    this.monitorJobCGI = OCULUS.monitorJobCGI;
    this.sessionWindow = sessionScope.window;
    this.companyName = sessionScope.companyName;
    this.frameObject.setAttribute('data-session-job-nr', this.jobNr);
    this.frameObject.setAttribute('data-admin-id', this.option.IDT);
};

NAV.Session.prototype.getDefaultPRC = function () {
    if (this.procedures.length === 1) {
        this.defaultProcedure = this.procedures[0];
    }
    if (this.defaultProcedure) {
        return this.defaultProcedure.PRC;
    }
};

NAV.Session.prototype.getProcedure = function (name) {
    let procedures = this.procedures;
    return procedures.filter(p => p.option && p.option.PRC === name)[0];
};

NAV.Session.getByJobNr = function (jobNr) {
    for (let session of NAV.Session.instances) {
        if (session && session.jobNr === jobNr) {
            return session;
        }
    }
};

NAV.Session.closeAll = async function (reason) {
    let Promisses = [];
    NAV.Session.instances.forEach(session => {
        Promisses.push(session.closeAsync(reason));
    });

    await Promise.all(Promisses);
};

/* ***************************************************************************
/* Controleert periodiek de status van de sessie
// parms:  fsSESNR = sessienummer dat gecontroleerd moet worden
// return: --
// In het betreffende tabblad wordt indien nodig een symbool zichtbaar
*************************************************************************** */
NAV.Session.prototype.closeAsync = async function (reason) {
    const TMSTM = new Date().getTime(),
        jobStatusUri = `${OCULUS.monitorJobCGI}/box/ndmctl/rtvjobsts.ndm/AJAX?JOBNR=${this.jobNr}&PFMFILID=${this.enviroment}&TMSTM=${TMSTM}&AUTHTOKEN=${SESSION.AUTHTOKEN}&requestType=requestEnd`,
        terminateUri = `${this.alias}/box/ndmctl/terminate.ndm/main?reason=${reason}&AUTHTOKEN=${SESSION.AUTHTOKEN}`;
    const response = await fetch(jobStatusUri),
        xmlText = await response.text(),
        xmlDoc = XDOM.getXML(xmlText),
        status = xmlDoc.getElementsByTagName('endResume')[0]?.childNodes[0]?.nodeValue;
    if (status === '*END') {
        return fetch(terminateUri);
    }
};
