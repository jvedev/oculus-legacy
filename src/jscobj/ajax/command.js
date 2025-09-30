/* global SESSION, Mask, XDOM, BrowserDetect, PFMCON, Search, GLOBAL, Subfile, Validate, GUI, MAIN, AJAX, KeepAlive, Upload, Messages, QuickSearch, keyCode */

/**
 * Command (WS Command)
 * data-wscmd-type bepaald welk command er wordt uitgevoerd
 *
 */

Command = function () {
};

Command.handleKeyDown = function () {
    if (GLOBAL.charCode !== keyCode.enter || XDOM.GLOBAL.getBooleanAttribute('data-block-autosubmit')) {
        return;
    }
    var formId = XDOM.GLOBAL.getBooleanAttribute('data-form-id');

    if (formId && formId !== 'main') {
        return;
    }

    Command.execute();
    return true;
};

// geregistreerde knop verwijderen
Command.deleteCommand = function (fsCommand) {
    var foObj = XDOM.getObject(fsCommand);
    XDOM.setAttribute(foObj, 'data-button-enabled', 'false');
};

// controleerd of een commando conop beschikbaar is
Command.check = function (fsCommand) {
    var foCommandButton = XDOM.getObject(fsCommand);
    switch (fsCommand) {
        case 'PROMPT':
        case 'RSTFLT':
        case 'ACCEPT':
        case 'RESET':
            return true;
            break;
        default:
            return XDOM.getBooleanAttribute(foCommandButton, 'data-button-enabled');
            break;
    }

    return false;
};

Command.enter = function () {
    Command.execute('ENTER');
};

/**
 * Submit de form (de gegevens in de invoervelden) van het actieve pro
 * Er kan maar 1 submit tegelijk uitgevoerd worden.
 * De applicatie wordt geblokkeerd voor verdere acties.
 * Er wordt een aanvraag voor status controle van de job gedaan.
 * Indien mTP_MQI='*EXC' wordt het ontvangen van berichten geactiveerd
 * voorheen jsc_SUBMIT
 * @param submitFromSubfile
 */
// ***************************************************************************
// Submit de form (de gegevens in de invoervelden) van het actieve programma.
// parms: --
// return: --
// Er kan maar 1 submit tegelijk uitgevoerd worden.
// De applicatie wordt geblokkeerd voor verdere acties.
// Er wordt een aanvraag voor status controle van de job gedaan.
// Indien mTP_MQI='*EXC' wordt het ontvangen van berichten geactiveerd
// ***************************************************************************
Command.submit = function (submitFromSubfile) {
    if (SESSION.submitInProgress) {
        return;
    }
    SESSION.submitInProgress = true;
    const command = SESSION.activePage.controlerFields['WS_CMD'];
    QuickSearch.cancelDelayedOpen();
    closeAllModalObjects();
    closeHighSlide();
    protectPage();
    setPromptField();
    setResubmitFields();
    setIpmfSubmitField('false');
    showLoading(true);
    Messages.newThread(command);
    Mask.completeAllMasks();
    Upload.setFormEncType(command);
    KeepAlive.cancel(); //stopt de keep alive job om dubbele requests te voorkomen
    SESSION.stack.setFormatFields(SESSION.activePage, submitFromSubfile);
    unformatAll();
    SESSION.submitFromScope = 'MAIN';
    AJAX.postForm();
    MAIN.NAV.Session.checkStatus(SESSION.stack.currentSession.id, true, false);
    XDOM.cancelEvent();
    return false;
};

Command.ipmfSubmitOnly = function () {
    if (SESSION.submitInProgress) {
        return;
    }
    SESSION.submitInProgress = true;
    //ieSubmitHack1();
    protectPage();
    setResubmitFields();
    setIpmfSubmitField('true');
    showLoading(true);
    KeepAlive.cancel(); //stopt de keep alive job om dubbele requests te voorkomen
    unformatAll();
    AJAX.postForm();
    //ieSubmitHack2();
    MAIN.NAV.Session.checkStatus(SESSION.stack.currentSession.id, true, false);
    XDOM.cancelEvent();
    return false;
};

Command.focusCommand = function (command) {
    if (!command) {
        command = 'ENTER';
    }
    var obj = XDOM.query("[data-command-focused='true']", SESSION.activeForm);
    if (obj) {
        obj.setAttribute('data-command-focused', 'false');
    }
    obj = XDOM.getObject(command);

    if (!obj) {
        command = 'ACCEPT';
        obj = XDOM.getObject(command);
    }

    if (!obj) {
        command = 'RETURN';
        obj = XDOM.getObject(command);
    }

    if (obj) {
        obj.setAttribute('data-command-focused', 'true');
        SESSION.activePage.focusedCommand = command;
    }
};

// ***************************************************************************
// Registreer commando (WSCMD) toetsen
// parms:  fsWSCMD   = commando
//         fsDEREG   = || *DLT
//         fsWSCMDTYP= type commando
//         fsFOCUS   =  || *FCS (geef focus aan de knop)
// return: --
// ***************************************************************************

Command.prepareDom = function () {
    let pageObjects = XDOM.queryAll('[data-wscmd-type]', SESSION.activeForm);
    let obj = null;
    const buttonsForCaption = ['ENTER', 'CLOSE', 'RETURN', 'ACCEPT', 'END', 'REPEAT', 'STPBCK', 'ENDWZD'];
    for (let i = 0, l = pageObjects.length; i < l; i++) {
        obj = pageObjects[i];
        if (buttonsForCaption.indexOf(obj.id) > -1) {
            obj.value = getCapt(obj.value);
        }
        if(obj.id == 'RETURN' && SESSION.activePage.screenType == '*SCH'){
            obj.dataset.returnFromSearch = true;
        }

    }
    obj = XDOM.getObject('CLOSE');
    if (obj) {
        obj.value = getCapt(obj.value);
        obj.dataset.clickAction = 'TopView.close';
    }
};

Command.update = function () {
    var foPageObjects = XDOM.queryAll('[data-wscmd-type]', SESSION.activeForm);
    var foObj = null;
    SESSION.activePage.setRecord(null); //set
    for (var i = 0, l = foPageObjects.length; i < l; i++) {
        foObj = foPageObjects[i];
        Command.updateButton(foObj);
    }
    //	Command.focusCommand(SESSION.activePage.header['WS_FCS']); Aanpassing MVB
    Command.focusCommand(SESSION.activePage.focusedCommand);
    Command.checkReturnButton();
    showLoading(false);
};

/**
 * controleerd of de terug knop zichtbaar is
 * dit is het geval als:
 * 1) huidige scherm een zoekscherm is (SESSION.activePage.screenType == '*SCH') of
 * 2) het vorige nav object is ook een macro
 * in dat geval wordt de knop ook zichtbaar gemaakt
 */
Command.checkReturnButton = function () {
    var foObj = XDOM.getObject('RETURN');
    if (!foObj) {
        return;
    } //-->
    if (
        (SESSION.activePage.screenType === '*SCH' || SESSION.stack.getPreviousMacro()) &&
        SESSION.activePage.screenType != '*TOPVIEW'
    ) {
        foObj.style.visibility = 'visible';
        foObj.style.display = '';
    } else {
        foObj.style.visibility = 'hidden';
        foObj.style.display = 'none';
        Command.deleteCommand('RETURN');
    }
    return;
};

Command.updateButton = function (obj) {
    var fsWsCommandType = obj.getAttribute('data-wscmd-type');
    var fsTextField = obj.getAttribute('data-text-field-id');
    var fsTextCode = '';


    if (obj.id === 'ACCEPT') {
        // Bij onmousedown op Accept uitvoeren voordat dit door AUTOSBM wordt gedaan
        obj.setAttribute('data-mouseDown-action', 'Command.execute');
    }

    if (['PROMPT', 'ACCEPT', 'RESET', 'CLEAR', 'STPBCK', 'ENDWZD', 'CANCEL'].includes(obj.id)) {
        obj.setAttribute('data-button-enabled', 'true');
        obj.disabled = false;
    } else {
        if (!enableButton(obj)) {
            obj.disabled = true;
        } else {
            obj.disabled = false;
        }
    }

    switch (fsTextField) {
        case 'WS_ETX':
            fsTextCode = 'cENT' + SESSION.activePage.viewProperties.commandEnterTextCode + '_VAL';
            fsTextTitle = 'cENT' + SESSION.activePage.viewProperties.commandEnterTextCode + '_TTL';
            obj.setAttribute('data-title-origin', '*LBL');
            obj.setAttribute('data-title-variable', fsTextTitle);

            obj.value = getCaption(fsTextCode, fsTextCode + ': niet bekend');
            break;

        case 'WS_ATX':
            fsTextCode = 'cACC' + SESSION.activePage.viewProperties.commandAcceptTextCode + '_VAL';
            fsTextTitle = 'cACC' + SESSION.activePage.viewProperties.commandAcceptTextCode + '_TTL';
            obj.setAttribute('data-title-origin', '*LBL');
            obj.setAttribute('data-title-variable', fsTextTitle);
            obj.value = getCaption(fsTextCode, fsTextCode + ': niet bekend');
            break;
    }

    GUI.infoTitle.register(obj);

    switch (fsWsCommandType) {
        case '*TXT':
            //voor alle knoppen de focus weghalen
            obj.className = 'txtbtn';
            break;
        case '*CRT':
            XDOM.setAttribute(obj, 'data-wscommand-createtype', fsWsCommandType.replace('CRT', ''));
            break;
        default:
            break;
    }
    return;
};


/**
 * submits an autosum request
 */
Command.autoSum = () => {
    if (SESSION.submitInProgress) {
        return;
    }
    SESSION.submitInProgress = true;
    XDOM.createInputField('SubmitForSelect', 'true');
    XDOM.createInputField('WS_CMD', 'ENTER');
    protectPage();
    showLoading(true);
    KeepAlive.cancel(); //stopt de keep alive job om dubbele requests te voorkomen
    SESSION.submitFromScope = 'MAIN';
    setResubmitFields();
    AJAX.postPartialUpdate();
    MAIN.NAV.Session.checkStatus(SESSION.stack.currentSession.id, true, false);
    XDOM.cancelEvent();

}

// ***************************************************************************
// Zorgt ervoor dat het juiste commado uitgevoerd wordt in ILE
// voert evt. eerst controles uit op de invoervelden
// parms:  fWSCMD=commando
// return: false
// ***************************************************************************
Command.execute = function (commandIn, statefull) {
    var command = commandIn;
    if (!statefull && Stateless.Page.command(commandIn)) {
        return false;
    }
    if (!command) {
        command = SESSION.activePage.focusedCommand;
    }
    if (!Command.check(command)) {
        return false;
    }
    closeHighSlide();
    if (command === '') {
        command = 'ENTER';
    }
    XDOM.createInputField('WS_CMD', command);
    SCOPE.main.directLink.setOpenTokenFrom(window)
    if (SESSION.activePage.screenType !== '*SCH' && !SESSION.isSingleView) {
        SESSION.stack.setPreviousMacroFields();
    }

    if (!Validate.All()) {
        SESSION.activePage.autoSubmitInputObject = null;
        return false;
    }
    closeAllModalObjects();
    Stateless.deactivateAllSubViews();

    switch (command) {
        case 'ENDPAG':
        case 'PAGEDN':
        case 'PAGEUP':
        case 'BEGPAG':
        case 'RSTFLT':
            Subfile.getProgramSettings().subfilePos = 0;
            return Command.submit();
            break;
        default:
            break;
    }

    switch (SESSION.activePage.macroType) {
        case '*PMT_ML':
            Subfile.storeSubfilePos();
            break;
        case '*RGS':
        case '*UPD_ML':
            Subfile.setCursor();
            break;
        default:
            Subfile.getProgramSettings().subfilePos = 0;
            break;
    }
    return Command.submit();
};
//***************************************************************************
// Commando knop is geactiveerd
// parms:  this
// return: --
// ***************************************************************************
Command.handleOnClick = function (e) {
    // if (!GLOBAL.eventSourceElement.getAttribute('data-wscmd-type')) {
    //   return false;
    // }

    let screenType = SESSION.activePage.screenType;

    if (e.target.getAttribute('data-screen-type')) {
        screenType = e.target.getAttribute('data-screen-type');
    }

    switch (e.target.id) {
        case 'RETURN':
            switch (screenType) {
                case '*SCH':
                    Search.close();
                    break;
                case '*TOPVIEW':
                    TopView.close();
                    break;
                default:
                    PFMCON.gotoPreviousProgram();
                    break;
            }
            break;
        case 'CANCEL':
            switch (screenType) {
                case '*SCH':
                    Search.close();
                    break;
                case '*TOPVIEW':
                    TopView.close();
                    break;
                default:
                    PFMCON.closeWindow();
                    break;
            }
            break;
        default:
            Command.execute(e.target.id);
            break;
    }
    return true;
};

Command.resetEnter = function () {
    // ***************************************************************************
    // Reset enter: vanwege gewijzigde veldinhoud zo nodig terug van ACCEPT naar ENTER
    // parms:  --
    // return: --
    // ***************************************************************************

    if (SESSION.activePage.focusedCommand === 'ACCEPT' && !SESSION.activePage.retainFocusOnAccept) {
        Command.focusCommand('ENTER');
    }
};

Command.resetHeader = function (){
    Command.execute('RSTFLT')
}

function setIpmfSubmitField(setValue) {
    var ipmfInputObj = null;
    var inputValue = setValue || 'false';

    ipmfInputObj = XDOM.getObject('SubmitForIPMF');

    if (!ipmfInputObj) {
        XDOM.createInputField('SubmitForIPMF', inputValue);
    } else {
        XDOM.setObjectValue(ipmfInputObj, inputValue);
    }

    return;
}

function setResubmitFields() {
    XDOM.createInputField('SubmitFromView', 'true');
    if (SESSION.activePage.resubmitConstants) {
        for (var field in SESSION.activePage.resubmitConstants) {
            XDOM.createInputField(field, SESSION.activePage.resubmitConstants[field]);
        }
    }
    if (SESSION.activePage.resubmitVariables) {
        for (var field in SESSION.activePage.resubmitVariables) {
            XDOM.createInputField(field, SESSION.activePage.resubmitVariables[field]);
        }
    }

}

function showLoading(isLoading) {
    var commandDiv = XDOM.getObject('CMDDIV');
    if (commandDiv) {
        if (isLoading) {
            XDOM.setAttribute(commandDiv, 'data-message-status', 'loading');
        } else {
            XDOM.setAttribute(commandDiv, 'data-message-status', 'default');
        }
    }
}

function getlastSelectedInputId(obj) {
    let id = '';
    if (!obj || obj.constructor.name === "HTMLDocument") {
        return '';
    }

    if (Mask.isMask(obj)) {
        id = obj.getAttribute('data-mask-target');
    } else if (obj.hasAttribute('data-real-name')) {
        id = obj.getAttribute('data-real-name');
    } else {
        id = obj.id;
        if (isLogical(id) && id.indexOf('SFR_SLT_') > -1) {
            //dit zijn checkboxen uit een werken met scherm en die moeten niet mee gegeven worden
            id = '';
        }
    }
    return id;
    //return Logical.getFieldName(id);
}

function getCurrendFocused() {
    //determinging the next field to focus or the current one
    //because this is called from blur relatedTarget has preference (this is the field jumped to in the blur event

    const target = GLOBAL.eventObject._event.relatedTarget || GLOBAL.eventObject._event.target;
    //exclude non focusable elements and command buttons
    if (canHaveFocus(target) && target.parentNode.id !== 'CMDDIV') {
        return target;
    }
    return SESSION.activePage.lastSelectedInput;
}

function setPromptField() {
    let currentPrompt = getlastSelectedInputId(getCurrendFocused()),
        inputObj = XDOM.getObject(currentPrompt);

    if (!inputObj || isStatelessObject(inputObj)) {
        currentPrompt = '';
    }
    //console.log('last', SESSION.activePage.lastSelectedInput.id, 'current',currentPrompt)
    if (!currentPrompt) {
        SESSION.submitFromScope = 'MAIN';
    }
    XDOM.createInputField('WS_PMT', currentPrompt);
    return currentPrompt;
}

function isStatelessObject(obj) {
    if(!obj){
        return false;
    }
    if (
        obj.getAttribute('data-stateless-page-id') ||
        obj.getAttribute('data-quicksearch-selectfield') ||
        obj.getAttribute('data-prompt-field') ||
        obj.getAttribute('data-panel-id')
    ) {
        return true;
    }
    return false;
}
