/* global MultiSelect, Subfile, Service, Trigger, Command, GUI, Validate, GLOBAL, Mask, SESSION, XDOM, INP, QuickSearch, Search, ActionCommand, Logical, Panel, NAV, Upload, Calender, Dragger, Stateless, Table, Help, oculusImage, Modef, Messages, Prompt, SortButton, Link, OCULUS, PFMBOX, keyCode, TextArea, fp, Barcode, TopView, GFX, QueryList */

function checkModal(e) {
    if (XDOM.objectUnderModal(e.target)) {
        XDOM.cancelEvent(e);
        return true;
    }
    return false;
}

function handleKeyDown(e) {
    // ***************************************************************************
    // Keyboard afhandeling bij toets naar beneden
    // parms: gEVT=event onkeydown
    // return: --
    // ***************************************************************************
    XDOM.getEvent(e);
    OCULUS.checkKeyCode(e);
    //keyhandling managed directly
    if (Calender.currentInstance) {
        return false;
    }

    if (checkModal(e)) {
        return false;
    } //als een element onder een modal scherm zit mogen er geen key events gehonoreerd worden
    if (Events.handleKeydown(e)) {
        return false;
    }
    if (Stateless.Page.isLoading()) {
        return false;
    } //alleen bij een object uit een stateless Page die laad
    INP.handleKeyDown();
    if (QuickSearch.HandleKeyDown()) {
        return false;
    }
    if (Service.handleKeyDown()) {
        return false;
    }
    // if (Calender.handleKeyDown()) {
    //   return false;
    // }
    if (GLOBAL.eventSourceElement.id === 'MEXIT') {
        return false;
    }
    if (Subfile.handleKeyDown()) {
        return false;
    }
    if (blocked()) {
        return false;
    }
    if (handleSpecialKeys()) {
        return false;
    }
    if (Mask.handleKeyDown()) {
        return false;
    }
    Barcode.handleKeyDown();
    TextArea.handleKeyDown();
    fp.handleKeyDown();
    if (Stateless.Page.handleKeyDown()) {
        return false;
    }
    if (Stateless.panel.handleKeyDown()) {
        return false;
    }
    if (GUI.events.keyDown()) {
        return false;
    }
    return Command.handleKeyDown();
}

function registerEvents() {
    var foRegTarget = SESSION.activeFrame.document;
    //Events.register(SESSION.activeFrame.document);
    XDOM.addEventListener(SESSION.activeForm, 'dblclick', handledblClick);
    XDOM.addEventListener(SESSION.activeForm, 'submit', handleSubmit);
    XDOM.addEventListener(foRegTarget, 'keydown', handleKeyDown);
    XDOM.addEventListener(foRegTarget, 'keyup', handleKeyUp);
    XDOM.addEventListener(foRegTarget, 'keypress', handleKeyPress);

    XDOM.addEventListener(foRegTarget, 'mouseup', handleMouseUp);
    XDOM.addEventListener(foRegTarget, 'click', handleOnclick);

    XDOM.addEventListenerToNode('[data-allow-drop]', 'dragover', drag.over);
    XDOM.addEventListenerToNode('[data-allow-drop]', 'drop', drag.drop);

    XDOM.addEventListener(foRegTarget, 'mousedown', handleMouseDown);
    XDOM.addEventListenerToNode('[data-focus-action]', 'focus', handleFocus);
    XDOM.addEventListenerToNode('[data-blur-action]', 'blur', handleBlur);
    XDOM.addEventListenerToNode('[data-mouseover-action]', 'mouseover', handleMouseOver);
    XDOM.addEventListenerToNode('[data-mouseout-action]', 'mouseout', handleMouseOut);

    //new direct events
    XDOM.addEventListenerToNode('[data-service-type="*CAL"]', 'click', Calender.handleOnClick);
    XDOM.addEventListenerToNode('TH[data-service-click-id]', 'click', Service.handleHeadingClick);
    XDOM.addEventListenerToNode('[data-wscmd-type]', 'click', Command.handleOnClick);
    XDOM.addEventListenerToNode('#openlink', 'click', (e)=>SCOPE.main.directLink.handleOnClick(e));
    XDOM.addEventListenerToNode('DIV[data-search-type="quickSearch"]', 'click', QuickSearch.handleOnClick);

    Label.registerEvents();

}

/**
 * ter voorkoming van een submit bij het gebruik van enter
 * @param {type} e
 * @returns {Boolean}
 */
function handleSubmit(e) {
    XDOM.cancelEvent(e);
    return false;
}

function handleKeyUp(e) {
    // ***************************************************************************
    // Keyboard afhandeling bij toets omhoog
    // parms: gEVT=event onkeyup
    // return: --
    // ***************************************************************************
    if (Events.handleAllEvents(e)) {
        return false;
    }
    XDOM.getEvent(e);
    if (Stateless.Page.isLoading()) {
        return false;
    }
    OCULUS.removeKeyCode(e);
    // if(XDOM.GLOBAL.getAttribute('data-panel-id')){return;}
    if (blocked()) {
        return false;
    }

    if (QuickSearch.HandleKeyUp()) {
        return false;
    }
    if (Calender.handleKeyUp(e)) { //Calender.currentInstance
        return false;
    }
    if (Service.currentService) {
        return false;
    }
    if (TextArea.handleKeyUp()) {
        return true;
    }
    if (fp.handleKeyUp()) {
        return true;
    }

    if (Barcode.handleKeyUp()) {
        return true;
    }
    if (Logical.handleKeyUp()) {
        return false;
    }
    if (GUI.LogicalIn.handleKeyUp()) {
        return false;
    }
    if (HandleKeyUpAction()) {
        return false;
    }

    INP.handleKeyUp();
    return true;
}

/**
 * dit is geen event handler obj is een dom object
 * @param objIn
 */
function handleOnChange(objIn) {
    if (SESSION.submitInProgress) {
        return;
    }

    if (!Mask.isMask(objIn) && objIn.tagName.toUpperCase() !== 'SCRIPT' && objIn.value) {
        objIn.setAttribute('value', objIn.value.trim()); //anders werken css selectors op de value attribute niet pff.
    }

    var obj = objIn || GLOBAL.eventSourceElement;
    if (!Validate.test(obj)) {
        obj.setAttribute('data-validation-error', 'true');
        return false;
    }

    if (obj.hasAttribute('data-validation-error')) {
        obj.removeAttribute('data-validation-error');
    }

    if (GUI.events.change(objIn)) {
        return;
    }
    Stateless.Page.set(objIn);
    Service.retriveRelated(obj);
    addAttributes(obj);
    setOldValue(obj);

    if (!obj.dataset.statelessPageId) {
        //because of scoping problems don't allow this in stateless
        Subfile.setChanged(obj.getAttribute('data-record-number'));
    }

    Stateless.Page.set();
    if (Stateless.Page.inputOnChange(objIn)) {
        return;
    }
    Command.resetEnter();
    resetMessage();

    if (autoSubmit(obj) || Trigger.fire([obj.id])) {
        Stateless.setSubviewActive(obj);
        return;
    }

    return;
}

function autoRenew() {
    SESSION.stack.currentSession.autoRenewInterval = null;
    Command.enter();
    return;
}

function autoSubmit(objIn) {
    var obj = XDOM.getObject(objIn);
    //prevent blur action
    if (
        !isAutoSubmitField(obj) ||
        XDOM.getBooleanAttribute(obj, 'data-block-autosubmit') ||
        SESSION.session.cancelBlurEvent
    ) {
        SESSION.session.cancelBlurEvent = false;
        return false;
    }
    var panelId = XDOM.getAttribute(obj, 'data-panel-id');
    var editPanel = GUI.BasePanel.instances[panelId];
    var stagelessPageId = XDOM.getAttribute(obj, 'data-stateless-page-id');
    if (Stateless.Page.reload(stagelessPageId)) {
        return;
    }
    if (editPanel && !stagelessPageId) {
        editPanel.send('ENTER', obj.id.replace(panelId + '-', ''));
        return true;
    }

    SESSION.activePage.blockSearch = true;
    SESSION.activePage.autoSubmitInputObject = obj;
    Command.enter();
    return true;
}

function handledblClick(e) {
    XDOM.getEvent(e);
    for (var i = 0; i < GLOBAL.eventSourceElement.attributes.length; i++) {
        attr = GLOBAL.eventSourceElement.attributes[i];

        if (/^data-/.test(attr.nodeName)) {
            console.log(attr.nodeName, "'" + attr.nodeValue + "'");
        }
    }
}

//
// /**
//  * omdat de for tag niet werkt met een a
//  * (waar de checkbox nu van is) moet het
//  * for gedrag helaas worden na gebouwd
//  */
// function checkBoxForClick() {
//   let forId = GLOBAL.eventSourceElement.getAttribute('for'),
//       forObj = XDOM.getObject(forId);
//   if (!forObj ) {return false;}
//   let forType = 'unHandled';
//
//   if(forObj.classList.contains('checkbox'))  {forType = 'checkbox'}
//   if(forObj.classList.contains('topView'))   {forType = 'topView'}
//
//   switch(forType) {
//     case 'topView':
//       XDOM.invokeClick(forObj);
//       return true;
//     case 'checkbox':
//
//       XDOM.invokeClick(forObj);
//       XDOM.cancelAndRemap();
//       forObj.focus();
//       INP.handleOnFocus(forObj);
//       return true;
//     default:
//       return false;
//   }
// }

function handleOnclick(e) {
    SCOPE.main.ContextMenu.clickOutside(e);
    SCOPE.main.directLink.handleOnClick(e);
    if (Events.handleAllEvents(e)) {
        return false;
    }
    XDOM.getEvent(e);
    // if (checkBoxForClick()) {
    //   return false;
    // }
    Stateless.setSubviewActiveOnClick();
    if (INP.returnToErrorField()) {
        return false;
    }
    if (handleClickAction(e)) {
        return false;
    }
    // if (Command.handleOnClick()) {
    //   return false;
    // }
    // if (QuickSearch.sortButtonClick()) {
    //   return false;
    // }
    // if (QuickSearch.handleOnClick()) {
    //   return false;
    // }
    if (Search.handleHeadingClick()) {
        return false;
    }
    if (ActionCommand.handleClick()) {
        return false;
    }
    if (Logical.handleOnClick()) {
        return false;
    }
    if (Service.handleOnClick()) {
        return false;
    }
    if (Panel.closePanelClick()) {
        return false;
    }
    if (NAV.sessionLauncher.handleClick(e)) {
        return false;
    }
    if (Upload.handleClick()) {
        return false;
    }
    //Calender.handleOnClick();
    Subfile.handleOnClick();
}

function handleMouseDown(e) {
    if (Events.handleAllEvents(e)) {
        return false;
    }
    XDOM.getEvent(e);
    var mouseDownAction = XDOM.GLOBAL.getAttribute('data-mouseDown-action');

    switch (mouseDownAction) {
        case 'Command.execute':
            if (Mask.isMask(SESSION.activePage.lastSelectedInput)) {
                Mask.returnValues(SESSION.activePage.lastSelectedInput);
            }

            Command.execute(GLOBAL.eventSourceElement.id);
            break;
        case 'Dragger.start':
            updatePanelSort(GLOBAL.eventSourceElement);
            Dragger.start(GLOBAL.eventSourceElement);

            break;
    }
}

function HandleKeyUpAction() {
    var action = XDOM.GLOBAL.getAttribute('data-keyup-action');
    if (!action) {
        return false;
    }
    switch (action) {
        case 'GUI.LogicalIn.handleKeyUp':
            GUI.LogicalIn.handleKeyUp();
            break;
    }
    return true;
}

function handleClickAction(e) {
    var clickAction = XDOM.GLOBAL.getAttribute('data-click-action');
    if (!clickAction) {
        return false;
    }
    switch (clickAction) {
        case 'logout':
            logout();
            break;
        // case 'QuickSearch.selectFieldClick':
        //     QuickSearch.selectFieldClick();
        //     break;
        case 'popupPanel.close':
            popupPanel.close(XDOM.GLOBAL.getAttribute('data-popup-panel-id'));
            break;
        case 'closeMessageBox':
            closeMessageBox();
            break;
        case 'EditInfo.open':
            EditInfo.open();
            break;
        case 'QueryList.open':
            QueryList.open();
            break;
        case 'TopView.close':
            TopView.close();
            break;
        case 'GFX.Chart.onclick':
            GFX.Chart.onclick(e);
            break;
        case 'Stateless.panel.closeClick':
            Stateless.panel.closeClick();
            break;
        case 'MultiSelect.open':
            MultiSelect.open();
            break;
        case 'Stateless.Page.enter':
            Stateless.Page.enter();
            break;
        case 'Stateless.Page.accept':
            Stateless.Page.accept();
            break;
        case 'Stateless.Page.reset':
            Stateless.Page.reset();
            break;
        // case 'Table.rowClickHandler':
        //   Table.rowClickHandler();
        //   break;
        case 'oculusImage.expand':
            oculusImage.expand();
            break;
        case 'Modef.handleOnClick':
            Modef.handleOnClick();
            break;
        case 'Service.close':
            Service.close();
            break;
        case 'Messages.close':
            Messages.close();
            break;
        case 'closePopUp':
            closePopUp();
            break;
        case 'Calender.setToday':
            Calender.setToday();
            break;
        case 'Calender.previousYear':
            Calender.previousYear(null, 'usr');
            break;
        case 'Calender.previousMonth':
            Calender.previousMonth(null, 'usr');
            break;
        case 'Calender.nextMonth':
            Calender.nextMonth(null, 'usr');
            break;
        case 'Calender.nextYear':
            Calender.nextYear(null, 'usr');
            break;
        case 'Calender.returnDate':
            Calender.returnDate();
            break;
        case 'closeHighSlide':
            closeHighSlide();
            break;
        case 'GUI.infoTitle.hide':
            //GUI.infoTitle.hide(GLOBAL.eventObject);
            break;
        case 'GUI.BasePanel.close':
            GUI.BasePanel.close();
            break;
        case 'GUI.BasePanel.startDragging':
            GUI.BasePanel.startDragging();
            break;
        case 'GUI.InfoWindow.handlePanelClick':
            GUI.InfoWindow.handlePanelClick();
            break;
        case 'GUI.InfoWindow.handleClick':
            GUI.InfoWindow.handleClick();
            break;
        case 'GUI.EditWindow.handleClick':
            GUI.EditWindow.handleClick();
            break;
        case 'GUI.Signature.clearCanvas':
            GUI.Signature.clearCanvas();
            break;
        case 'GUI.Signature.sendCanvas':
            GUI.Signature.sendCanvas();
            break;
        case 'GUI.EditWindow.handleReset':
            GUI.EditWindow.handleReset();
            break;
        case 'GUI.EditWindow.handleSubmit':
            GUI.EditWindow.handleSubmit();
            break;
        case 'GUI.LogicalIn.handleOnClick':
            GUI.LogicalIn.handleOnClick();
            break;
        case 'GUI.DisplayService.open':
            GUI.DisplayService.open();
        case 'Search.handleOnClick':
            Search.handleOnClick();
            break;
        case 'TopView.handleOnClick':
            TopView.handleOnClick();
            break;
        case 'Service.handleOnClick':
            Service.handleOnClick();
            break;
        case 'SortButton.handleOnClick':
            SortButton.handleOnClick();
            break;
        case 'Logical.handleTdClick':
            Logical.handleTdClick();
            break;
        case 'Logical.clearSelection':
            Logical.clearSelection();
            break;
        case 'Link.handleOnClick':
            Link.handleOnClick();
            break;
        case 'popupPanel.handleHeaderClick':
            popupPanel.handleHeaderClick();
            break;
    }
    return true;
}

function handleMouseOut(e) {
    XDOM.getEvent(e);
    var action = XDOM.GLOBAL.getAttribute('data-mouseout-action');
    if (!action) {
        return false;
    }
    switch (action) {
        case 'GUI.InfoWindow.handleMouseOut':
            GUI.InfoWindow.handleMouseOut();
            break;
        case 'Service.handleMouseOut':
            Service.handleMouseOut();
            break;
    }
}

/**
 * checks if the relatedTarget is a command button and sif so will it cause a submit
 *
 * @param obj
 * @returns {boolean}
 */
function relatedTargetCausedSubmit(obj) {
    //is the object a command button
    if (!obj?.dataset?.wscmdType) return false;

    //is the button enabled
    return (obj?.dataset?.buttonEnabled == "true");
}
function handleBlur(e) {
    //test if related button is an action button
    if(relatedTargetCausedSubmit(e.relatedTarget)) {
        return;
    } //nothng to do a command button was clicked

    XDOM.getEvent(e);
    if (QuickSearch.gotFocus) {
        // MVB: Deze 'gotFocus' moet ook af en toe weer uitgezet worden ik weet nog niet waar overal
        return; // snelzoek is automatisch geopend er hoeft geen blur actie te worden uitgevoerd of een daaraan verbonde onchange
    }
    var action = XDOM.GLOBAL.getAttribute('data-blur-action');
    if (!action) {
        return false;
    }
    switch (action) {
        case 'INP.handleOnBlur':
            INP.handleOnBlur(e);
            break;
        case 'Subfile.handleRowBlur':
            Subfile.handleRowBlur();
            break;
    }
}

function handleFocus(e) {
    XDOM.getEvent(e);
    Stateless.Page.onFocus();
    var action = XDOM.GLOBAL.getAttribute('data-focus-action');
    if (!action) {
        return false;
    }
    switch (action) {
        case 'INP.handleOnFocus':
            INP.handleOnFocus();
            break;
        case 'Subfile.handleRowFocus':
            Subfile.handleRowFocus();
            break;
    }
}

function handleMouseOver(e) {
    XDOM.getEvent(e);
    var action = XDOM.GLOBAL.getAttribute('data-mouseover-action');
    if (!action) {
        return false;
    }
    switch (action) {
        case 'GUI.InfoWindow.handleMouseOver':
            GUI.InfoWindow.handleMouseOver();
            break;
        // i.o.m. roel we don't open service function on hover anymore
        // case 'Service.handleMouseOver':
        //     Service.handleMouseOver();
        //     break;
    }
}

function handleMouseUp(e) {
    XDOM.getEvent(e);
    if (
        SESSION.activePage.lastFocusedField === GLOBAL.eventSourceElement.id &&
        GLOBAL.eventSourceElement.dataset.selectAllNow !== 'true'
    ) {
        return false;
    }
    GLOBAL.eventSourceElement.dataset.selectAllNow = false;
    INP.select();
}

function handleSpecialKeys() {
    if (handleAltF1()) {
        XDOM.cancelAndRemap();
        return true;
    }
    if (handleCrtlKey()) {
        XDOM.cancelAndRemap();
        return true;
    }
    if (handleShiftKey()) {
        XDOM.cancelAndRemap();
        return true;
    }
    if (handleFunctionKey()) {
        XDOM.cancelAndRemap();
        return true;
    }
    return false;
}

function handleKeyPress(e) {
    XDOM.setSelection();
}

//function handleKeyPress(e) {
//// ***************************************************************************
//// Keyboard afhandeling bij toets ingedrukt
//// parms: gEVT=event onkeypress
//// return: --
//// ***************************************************************************
//XDOM.getEvent(e);
//
//if(XDOM.GLOBAL.getAttribute('data-panel-id')){
//  return;
//}
//if(SESSION.protected || blokedKeys()) {
//  GLOBAL.eventObject.remapKeyCode();
//  GLOBAL.eventObject.cancel();
//  return false;
//}
//if ( (GLOBAL.charCode == keyCode.enter) && (GLOBAL.eventObjectTAG == 'INPUT') ) {
//  return false;
//}
//
//return true;
//}

/**
 * handles hotkey for opening help (ALT + F1)
 * @returns {boolean} indicationg the event is handled
 */
function handleAltF1() {
    //is (ALT + F1) pressed
    if (!(GLOBAL.eventObject.altKey && GLOBAL.charCode == keyCode.F1)) {
        return false;
    }

    //get the help button
    const helpButton = SCOPE.pageDoc.querySelector('[data-event-class="SessionUserAction"][data-button-icon="help"]');

    //if found invoke the klick event
    if (helpButton) {
        helpButton.click();
    }
    return true;
}

function handleCrtlKey() {
    // ***************************************************************************
    // Keyboard afhandeling icm CTRL key
    // parms:  GLOBAL.eventObject=event
    // return: --
    // ***************************************************************************
    var fRESET = true;

    if (GLOBAL.eventObject.ctrlKey && !GLOBAL.eventObject.altKey) {
        // ***
        switch (GLOBAL.charCode) {
            case 46: // CTRL + DEL
                break;
            case 49: // CTRL + 1
            case 50: // CTRL + 2
            case 51: // CTRL + 3
            case 52: // CTRL + 4
            case 53: // CTRL + 5
            case 54: // CTRL + 6
            case 55: // CTRL + 7
            case 56: // CTRL + 8
            case 57: // CTRL + 9
                var fiNr = GLOBAL.charCode - 48;
                var foBtn = XDOM.getObject('btnPos' + fiNr);
                if (foBtn) {
                    XDOM.invokeClick(foBtn);
                }
                break;
            case 78: // CTRL + n
                break;
                // case 79: // ctrl + 0
                // case 82: // ctrl + r
                // case 115: // ctrl F4
                //   OCULUS.cancelEndApplication = true;
                //   jsc_CONFIRMEXIT();
                break;
            case 116: // ctrl F5
                GLOBAL.eventObject.remapKeyCode();
                break;
            case 118: // ctrl F7
                Command.execute('PRVPAG');
                break;
            case 119: // ctrl F8
                Command.execute('NXTPAG');
                break;
            default:
                fRESET = false;
                break;
        }
        if (fRESET) {
            GLOBAL.eventObject.remapKeyCode();
            return true;
        }
    }
    return false;
}

function handleShiftKey() {
    // ***************************************************************************
    // Keyboard afhandeling icm SHIFT key
    // parms:  GLOBAL.eventObject=event
    // return: --
    // ***************************************************************************
    var fRESET = true;

    if (GLOBAL.eventObject.shiftKey) {
        switch (GLOBAL.charCode) {
            case 118: // shift F7
                Command.execute('PAGEUP');
                break;
            case 119: // shift F8
                Command.execute('PAGEDN');
                break;
            case 120: // shift F9
                Command.execute('BEGPAG');
                break;
            case 121: // shift F10
                Command.execute('ENDPAG');
                break;
            default:
                fRESET = false;
                break;
        }
        if (fRESET) {
            GLOBAL.eventObject.remapKeyCode();
            return true;
        }
    }
    return false;
}

/**
 * f4 opent zoek, snelzoek, service functies en calenders
 *
 */
function handleF4F2(item) {
    XDOM.cancelEvent();
    let id = GLOBAL.eventSourceElement.id;


    if (Mask.isMask(GLOBAL.eventSourceElement)) {
        id = GLOBAL.eventSourceElement.getAttribute('data-mask-target');
    }
    let toIdObjects = Array.from(
        XDOM.queryAll('[data-to-id="' + id + '"]:not([data-service-type="*RTV"]):not([data-when="unavailable"]):not([data-disable="true"])')
    );
    //loop de objecten af en kijk wat je er mee kan doen



    let searchObj = toIdObjects.filter(function (obj) {
        return typeof obj.dataset.searchId !== 'undefined';
    });
    let quickSearchObj = toIdObjects.filter(function (obj) {
        return typeof obj.dataset.quicksearchId !== 'undefined';
    });
    let queryListSearch = toIdObjects.filter(function (obj) {
        return obj.dataset.clickAction == 'QueryList.open' ;
    });

    // prioritijd
    // eerst een gewone zoek
    // vervolgens een querylist die als zoek is ingericht
    // dan een snelzoek
    // vervolgens het item (0 of 1) openen afhankelijk van f2 of f4 object in de dom met de juiste to-id bij 2 en er is maar 1 object dan 0 gebruiken
    //this array contains toIds sorted by priority
    toIdObjects = [...searchObj, ...queryListSearch, ...quickSearchObj, ...toIdObjects];
    let ObjectToOpen = toIdObjects[item] || toIdObjects[0]
    if (ObjectToOpen) {
        if (ObjectToOpen.getAttribute('data-quicksearch-id')) {
            //object is een snelzoek
            QuickSearch.handleFunctionKEY();
        } else {
            XDOM.invokeClick(ObjectToOpen);
        }
    }
}

function handleFunctionKey() {
    // ***************************************************************************
    // Keyboard afhandeling FUNCTION key Fxx en andere speciale toetsen
    // parms: gEVT=event
    // return: --
    // ***************************************************************************
    switch (GLOBAL.charCode) {
        case 8: // backspace
            return false;
            if (GLOBAL.eventSourceElement.tagName.toUpperCase() !== 'INPUT') {
                return false;
            }
            break;
        case keyCode.tab: // tab
            return false;
            break;
        case keyCode.F2:
            //1 indicating second element with a toid to the object
            handleF4F2(1);
            break;
        case keyCode.F4:
            //0 indicating first element with a toid to the object
            handleF4F2(0);
            break;
        case keyCode.F6:
            Command.execute('RESET');
            break;
        case keyCode.F7:
            Command.execute('PRVRCD');
            break;
        case keyCode.F8: // F8
            Command.execute('NXTRCD');
            break;
        case keyCode.F9: // F9
            Command.execute('FSTRCD');
            break;
        case keyCode.F10: // F10
            Command.execute('LSTRCD');
            break;
        case keyCode.F11: // F11
            Command.execute('RESET');
            break;
        case keyCode.escape:
        case keyCode.F12:
            if (closeAllModalObjects()) {
                return true;
            }

            if (SESSION.activePage.screenType === '*PGM' && XDOM.getBooleanAttribute('RETURN', 'data-button-enabled')) {
                gotoPreviousProgram();
            }
            if (SESSION.activePage.screenType === '*SCH') {
                Search.close();
                break;
            }

            if (SESSION.isSingleView) {
                TopView.close();
            }

            break;

        default:
            return false;
            break;
    }

    return true;
}

function handleNumericPoint() {
    if (
        GLOBAL.eventSourceElement.getAttribute('data-datatype') !== '*DEC' ||
        GLOBAL.eventSourceElement.value.length >= GLOBAL.eventSourceElement.maxLength
    ) {
        return;
    }

    //GLOBAL.charCode==keyCode.point  bij een punt op het toetsenbord geen komma invoegen
    if (GLOBAL.charCode === keyCode.numpadPoint) {
        GLOBAL.eventObject.cancel();
        XDOM.insertAtCursor(GLOBAL.eventSourceElement, ',');
    }
}

function setEventsMessage(level, text) {
    let panel = XDOM.GLOBAL.getEditWindow(),
        page = Stateless.Page.get();

    if (page) {
        page.setMessage(level, text);
    }
    if (panel) {
        panel.footer.setMessage(level, text);
        return;
    }
    setMessage(level, text);
}

function onFocusPage(e) {
    MAIN.removeFocus();
    MAIN.deActivateMenuHover();
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}
