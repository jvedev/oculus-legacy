async function initSession() {
    setSessionVariables();

    // Settings is  loaded set in session.js session constructor
    // we need to make sure the settings are loaded before we go on
    // before loading the iframe that wil trigger this function in the onload event
    // this way the sources for the iframe and the settings will be loaded simultaniously
    await SCOPE.main.Settings.onLoad(SESSION.session.enviroment);


    initSessionOptions()

    SCOPE.main.AdminMenu.tabletMode(SESSION.session.enviroment);
    ProcedureMenu.render(SESSION.session.procedures || SESSION.session.homeProcedure);
    MAIN.SessionTab.newTab(SESSION);
    SESSION.session.setTitle();
    SESSION.session.helpUri = SESSION.menuDefinitionVarName;

    //needs to be scoped because of the loaded settings
    SCOPE.main.newTheme.initialiseJob(document, SESSION.session.enviroment);

    SESSION.session.authenticationToken = SESSION.AUTHTOKEN
    MAIN.SessionTab.activate(SESSION.jobId, SESSION.session);

    setResolutionMode();
    setEventHandlers();
    setCaptions();

    if (!SCOPE.main.User.check()) {
        return;
    }
    SESSION.session.zoom();

    startDefaultProcedure();
    KeepAlive.start();
}

function startDefaultProcedure() {
    let prc = SESSION.session.getDefaultPRC(),
        button = null;

    if (!prc && SCOPE.main.Settings.get('AUTO_LOAD_PROCEDURE')) {
        let procedures = SESSION.session.procedures.filter(o => typeof o !== 'string');
        prc = procedures[0] ? procedures[0].PRC : '';

    }
    button = SESSIONDOC.querySelector(`.procedureBtn[data-option-prc="${prc}"]`);

    if (button) {
        XDOM.invokeClick(button);
        return;
    }

    MAIN.focusMenu(SESSIONDOC.querySelector('.procedureMenu .row .procedureBtnContainer a'));
    return;
}

function setCaptions() {
    XDOM.setInnerText('chooseTitle', getCapt('gCHOOSETITLE'));

    //only if usersetting isActive
    if (typeof top.oculusSessionBackgroundTitle !== 'undefined') {
        if (top.oculusSessionBackgroundTitle) {
            XDOM.setInnerText('oculusSessionBackgroundTitle', top.oculusSessionBackgroundTitle);
        }
    } else {
        XDOM.setInnerText('oculusSessionBackgroundTitle', 'Oculus');
    }

    if (typeof top.oculusSessionBackgroundSubtitle !== 'undefined') {
        if (top.oculusSessionBackgroundSubtitle) {
            XDOM.setInnerText('oculusSessionBackgroundSubtitle', top.oculusSessionBackgroundSubtitle);
        }
    } else {
        XDOM.setInnerText('oculusSessionBackgroundTitle', 'iOpener');
    }
}

function setResolutionMode() {
    var foBodyTag = XDOM.getObject('INZ');
    if (foBodyTag) {
        foBodyTag.setAttribute('data-screen-size', this.macroResolution);

        foBodyTag.className = OCULUS.sessionResolution + 'Resolution';
    }
}


function setSessionVariables() {
    SESSIONDOC = SESSIONFRAME.frameElement.contentDocument;
    SESSION.appFrameObj = SESSIONFRAME.frameElement.contentDocument.querySelector("[data-frame-type='Application']");
    SESSION.antiFlashingFrameObj = SESSIONFRAME.frameElement.contentDocument.querySelector(
        "[data-frame-type='antiFlashing']"
    );
    SESSION.seachFrameObj = SESSIONFRAME.frameElement.contentDocument.querySelector("[data-frame-type='Search']");
    SESSION.topViewFrameObj = SESSIONFRAME.frameElement.contentDocument.querySelector("[data-frame-type='topView']");

    SESSION.appFrame = SESSION.appFrameObj.contentWindow;
    SESSION.antiFlashingFrameObj = SESSION.antiFlashingFrameObj.contentWindow;
    SESSION.searchFrame = SESSION.seachFrameObj.contentWindow;
    SESSION.topViewFrame = SESSION.topViewFrameObj.contentWindow;
    SESSION.activeFrame = SESSION.appFrame;

    SESSION.id = SESSIONFRAME.frameElement.id.split('_')[1]; //bepalen van id voor session op basis van id frameElement
    SESSION.session = MAIN.NAV.Session.instances[SESSION.id];
    SCOPE.session.enviroment = SESSION.session.enviroment;

    SESSIONFRAME.frameElement.contentDocument.body.setAttribute('data-session-id', SESSION.id);
    SESSIONFRAME.frameElement.contentDocument.body.setAttribute('data-browser-used', BrowserDetect.browserUsed);

    setBodyAttributes(SESSION.appFrame)
    setBodyAttributes(SESSION.antiFlashingFrameObj)
    setBodyAttributes(SESSION.searchFrame)
    setBodyAttributes(SESSION.topViewFrame)


    // session globals
    SESSION.session.defaultTheme = !SESSION.environmentTheme;
    SESSION.stack = SESSION.session.stack;
    SESSION.window = SESSIONFRAME;
    SESSION.session.validApps = OCULUS.validApps;
    SESSION.session.validModules = OCULUS.validModules;
    SESSION.session.setSessionAttributes(SESSION);
}

function setBodyAttributes(contentwindow){
    const body = contentwindow.frameElement.contentDocument.body
    // get the browser name
    const browser = BrowserDetect.browserUsed.toLowerCase()

    //determine if this is an enterprise version
    const isEnterprise = browser == "firefox" && BrowserDetect.version >= 128

    body.setAttribute('data-browser-used', browser);
    body.setAttribute('data-browser-is-enterprise', isEnterprise);
}

function initSessionOptions() {
    setHomeDummys(SESSION.session);
    var options = getEval('PFMBOX.' + SESSION.menuDefinitionVarName) || SESSION.session.homeMenu;

    if (!options) {
        SCOPE.main.Dialogue.alert(`menu definition  ${SESSION.menuDefinitionVarName} is not defined `, `Menu not defined`);
        return false;
    }
    SESSION.session.initOptions(options);
    setZoomFactor();
}

function setZoomFactor() {
    SESSION.session.zoomIn();
}

function setEventHandlers() {
    Events.register();
    XDOM.addEventListener(window, 'keydown', OCULUS.checkKeyCode);
    XDOM.addEventListener(window, 'keyup', OCULUS.removeKeyCode);
    XDOM.addEventListener(window, 'click', handleSessionClick);
}

function handleSessionClick(e) {
    XDOM.getEvent(e);
    switch (XDOM.GLOBAL.getAttribute('data-click-action')) {
        case 'Messages.close':
            Messages.close();
    }
}

function setDummyHomeMenuItem(procedure, session) {
    const menuItem = {
        PRC: 'DUMMY_HOME_PRC',
        DSC: 'Home',
        TTL: 'Home',
        OPT: [procedure],
        isHome: true
    };
    // SCOPE.session['DUMMY_HOME_MENU_ITEM'] = menuItem;
    session.homeMenu = menuItem;
    //set startMenu
    SESSION.menuDefinitionVarName = 'DUMMY_HOME_MENU_ITEM';
}

function setHomeForSubprocedure(session) {
    //define dummy items
    const startItem = session.option.PGM;
    let subProcedure = SCOPE.session[startItem] || session.homeSubProcedure;
    if (!subProcedure) {
        SCOPE.main.Dialogue.alert(`Home page definition ${startItem} not defined `);
        subProcedure = {};
    }
    subProcedure.SBP = startItem;
    subProcedure.TTL = 'Home';

    const procedure = {
        DFTAPP: subProcedure.DFTAPP,
        DFTSBP: startItem,
        PRC: 'DUMMY_HOME_PRC',
        APP: subProcedure.DFTAPP,
        OPT: [subProcedure],
        isHome: true
    };
    //set dumy home procedure definition on session scope
    // SCOPE.session['DUMMY_HOME_PRC'] = procedure;
    session.homeProcedure = procedure;
    setDummyHomeMenuItem(procedure, session);
}

function setHomeForMacro(session) {
    const {PGM, APP} = session.option;
    //set dummy subprocedure
    const subProcedure = {
        OPT: [
            {
                MCR: PGM,
                DSC: 'Home',
                TTL: 'Home',
                isHome: true
            }
        ],
        DFTAPP: APP,
        DFTMCR: PGM,
        isHome: true
    };
    session.homeSubProcedure = subProcedure;
    // SCOPE.session['DUMMY_HOME_SBP'] = subProcedure;

    session.option.PGM = 'DUMMY_HOME_SBP';
    //buble up to supProcedure
    setHomeForSubprocedure(session);
}

function setHomeDummys(session) {
    switch (session.option.HOMETYPE) {
        case '*MCR':
            setHomeForMacro(session);
            break;
        case '*SBP':
            setHomeForSubprocedure(session);
            break;
        case '*PRC':
            setHomeProcedure(session);
            break;
        default:
            break;
    }
}

function setHomeProcedure(session) {
    //define dummy items
    const startItem = session.option.PGM;
    let procedure = SCOPE.session[startItem];
    if (!procedure) {
        SCOPE.main.Dialogue.alert(`HomeProcedure ${startItem} not defined`);
        procedure = {};

    }
    procedure.PRC = startItem;
    procedure.TTL = 'Home';
    setDummyHomeMenuItem(procedure, session);
}
