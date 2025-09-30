/* sessionLauncher */
/* Load Timestamp 13:59:55.672 */
/**
 * voor het starten van een nieuwe sessie via een token
 **/
NAV.sessionLauncher = {};

/**
 * loopt de sessie start objectenin de pagina door en controleerd of deze mogen worden getoond
 * eventueel anders maken zodat er met 1 ajax call alle validatie informatie kan owrden verzameld of eventueel met 1 ajax call per omgeving
 **/
/**
 * registratie van titels
 */
NAV.sessionLauncher.prepareDom = function() {
    var foObj = null;
    var fsTitle = '';
    var faPageObjects = XDOM.queryAllScope('[data-new-session-title]');
    for (var i = 0, l = faPageObjects.length; i < l; i++) {
        foObj = faPageObjects[i];
        fsTitle = foObj.getAttribute('data-new-session-title');
        fsTitle = getCaption(fsTitle, '');
        foObj.title = fsTitle;
    }
};

/**
 *
 * laat een nieuwe sessie
 * @param e event
 */

NAV.sessionLauncher.handleClick = function(e) {
    if (!XDOM.GLOBAL.getAttribute('data-new-session-location')) {
        return false;
    }
    var foSessionDef = {};
    var foSession = null;
    var fsDescriptionVarName = XDOM.GLOBAL.getAttribute('data-new-session-description');
    var fsDescription = getCaption(fsDescriptionVarName, fsDescriptionVarName);
    var fsTitle = GLOBAL.eventSourceElement.title;

    if(isStatelessObject(GLOBAL.eventSourceElement)){
        fsDescription = Stateless.Page.getCaption(fsDescriptionVarName) || fsDescription;
    }


    if (!MAIN.NAV.Session.checkMaxSessions()) {
        return true;
    }
    //data-new-session-id :voor de validatie
    //data-new-session-location-type voor de actie na het laden van de sessie


    foSessionDef.TYP = 'PGM'; //default
    foSessionDef.SON = 'usr'; //Default
    foSessionDef.DSC = fsDescription || fsTitle || XDOM.GLOBAL.getAttribute('data-new-session-location');
    foSessionDef.TTL = fsTitle;
    foSessionDef.PGM = XDOM.GLOBAL.getAttribute('data-new-session-location');
    foSessionDef.ENV = XDOM.GLOBAL.getAttribute('data-new-session-environment');
    foSessionDef.APP = XDOM.GLOBAL.getAttribute('data-new-session-source-location');

    foSession = new MAIN.NAV.Session(foSessionDef);
    foSession.isDirectStart = true;

    if (XDOM.GLOBAL.getAttribute('data-new-session-location-type') == '*PROCEDURE') {
        foProc = {};
        foProc.DFTAPP = foSessionDef.APP;
        foProc.MNUTTL = foSessionDef.TTL;
        foProc.MNUDSC = foSessionDef.DSC;
        foProc.SUBTTL = [];
        foProc.OPT = [];
        foProc.OPT[0] = {};
        foProc.OPT[0].PRC = foSessionDef.PGM;
        foProc.OPT[0].DSC = foSessionDef.DSC;
        foProc.OPT[0].TTL = foSessionDef.TTL;
        foSession.directStartProcedureDefinition = foProc;
    }

    foSession.parmKey = NAV.sessionLauncher.passParams();

    foSession.load();
    return true;
};

NAV.sessionLauncher.passParams = function() {
    var fsFormFields = XDOM.GLOBAL.getAttribute('data-new-session-form-fields');
    var fsParams = XDOM.GLOBAL.getAttribute('data-new-session-params');
    var fsEnvironment = XDOM.GLOBAL.getAttribute('data-new-session-environment');
    var recordNr = XDOM.GLOBAL.getAttribute('data-record-number');
    var record = null;
    var faFormFields = fsFormFields.split(' ');
    var faParams = fsParams.split(' ');
    var foFormData = new FormData();
    var foRequest = new XMLHttpRequest();
    var fsFieldName = '',
        fsValue = '',
        fsParam = '';

    var fsUrl =
        '/ndscgi/box/ndmctl/NewSession.ndm/ParmKey' +
        '?PFMFILID=' +
        fsEnvironment +
        '&PFMGRPID=' +
        PFMBOX.PFMGRPID +
        '&USRID=' +
        PFMBOX.PFMRMTUS +
        '&AUTHTOKEN=' +
        SESSION.AUTHTOKEN +
        '&PFMSOMTD=' +
        PFMBOX.PFMSOMTD;
    if (recordNr) {
        const index = serverToScript(recordNr)
        const data  = SESSION.activePage?.subfileData || SESSION.activeData?.subfileData || [];
        record = data[index]
    }

    for (var i = 0, l = faParams.length; i < l; i++) {
        fsParam = faParams[i];
        fsFieldName = faFormFields[i];
        if (recordNr) {
            fsValue = record[fsFieldName] || XDOM.getObjectValue(fsFieldName);
        } else {
            fsValue = XDOM.getObjectValue(fsFieldName);
        }

        fsUrl += '&PRM' + (i + 1) + '=' + fsParam + '&VAL' + (i + 1) + '=' + fsValue; // NewSession rekent op parms vanaf PRM1 en VAL1
    }

    /*add timestamp for unique data - IE11 problem*/
    fsUrl += '&TIMESTAMP=' + new Date().getTime();

    foRequest.open('GET', fsUrl, false); //asynchrone
    foRequest.send(foFormData);
    var fsParmKey = foRequest.responseText;
    return fsParmKey;
};

NAV.sessionLauncher.update = function() {
    const launchers = XDOM.queryAllScope('[data-new-session-environment-field-id]:not([data-record-number])');
    for (let i = 0, l = launchers.length; i < l; i++) {
        let launcher = launchers[i];
        launcher.dataset.newSessionEnvironment =
            SESSION.activePage.headerData[launcher.dataset.newSessionEnvironmentFieldId];
        NAV.sessionLauncher.authorize(launcher);
    }
};
NAV.sessionLauncher.authorize = function(obj) {
    if (!obj.dataset.newSessionEnvironmentFieldId) {
        return;
    }
    const authorizedFor = (obj.dataset.newSessionAuthorizedFor || '').split(','),
        envivronment = obj.dataset.newSessionEnvironment,
        isAuthorized = authorizedFor.indexOf(envivronment) > -1;

    obj.parentNode.dataset.hidden = !isAuthorized;
};