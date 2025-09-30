/**
 * voegt attribute toe aan object
 * @param {object}{string} fOBJ:  object of id van object
 * @param {string}         fsATR: lijst van attributen
 * @return{string}         fsVAL: waarde
 */
ATTRIB.SETVAL = function () {
    var fOBJ = arguments[0];
    var fsATR = arguments[1];
    var fsVAL = arguments[2];
    var foOBJ = XDOM.getObject(fOBJ);
    if (foOBJ.setAttribute) {
        foOBJ.setAttribute(fsATR, fsVAL);
    } else {
        foOBJ[fsATR] = fsVAL;
    }
    return;
};

/**
 * vraagt attribute op van object
 * @param {object}{string} fOBJ:  object of id van object
 * @param {string}         fsATR: lijst van attributen
 * @return{string}         fsVAL: waarde
 */
ATTRIB.GETVAL = function () {
    var fOBJ = arguments[0];
    var fsATR = arguments[1];
    var foOBJ = XDOM.getObject(fOBJ);
    if (foOBJ.getAttribute) {
        return foOBJ.getAttribute(fsATR);
    }
    return foOBJ[fsATR];
};

/**
 * copieerd attribute op van object fFRMOBJ naar object fTOOBJ
 * @param {object}{string} fFRMOBJ:  object of id van object waar vandaan moet worden gekopieerd
 * @param {object}{string} fTOOBJ:   object of id van object waar naartoe moet worden gekopieerd
 * @param {string}         fsATR: lijst van attributen
 * @return{string}         fsVAL: waarde
 */
ATTRIB.CPYATR = function () {
    var fFRMOBJ = arguments[0];
    var fTOOBJ = arguments[1];
    var fsATR = arguments[2];
    var foFRMOBJ = XDOM.getObject(fFRMOBJ);
    var foTOOBJ = XDOM.getObject(fTOOBJ);
    var foVal = ATTRIB.GETVAL(foFRMOBJ, fsATR);
    ATTRIB.SETVAL(foTOOBJ, fsATR, foVal);
    return;
};

/****************************************************************************************/
/*        Section: DOM interpretation functions                                         */

/****************************************************************************************/
/**
 * retourneerd of het html Dom object beschikbaar is dus niet hidden,disabled of protected
 * @param foFLD htmlDomObject;
 * @returns {Boolean}
 */
function isEnabled(foFLD) {
    return (
        !XDOM.getBooleanAttribute(foFLD, 'data-protected') &&
        !XDOM.getBooleanAttribute(foFLD, 'data-hidden') &&
        !foFLD.disabled &&
        !foFLD.readOnly
    );
}

function setCursorIeBugFix(oCursorField) {
    if (!BrowserDetect.isIE) {
        return oCursorField;
    }
    if (BrowserDetect.version == '11') {
        XDOM.clearSelection();
    }
    if (
        oCursorField &&
        (oCursorField.tagName == 'OUTPUT' || oCursorField.tagName == 'DIV' || oCursorField.type == 'file')
    ) {
        return null;
    }
}

function setCursorFFBugFix() {
    //omdat we op geen enkele manier een goede keyhandling kunnen realiseren binnen fire fox als er geen input element aanwezig is deze uiterst vreselijke oplossing onze nederige excusses
    if (!BrowserDetect.isFirefox) {
        return false;
    }
    var foFocusInput = XDOM.getObject('focusInput');
    if (!foFocusInput) {
        foFocusInput = XDOM.createElement('input', 'focusInput');
        var foDTADIV = XDOM.getObject('DTADIV');
        foDTADIV.appendChild(foFocusInput);
    }
    foFocusInput.type = 'text';
    foFocusInput.style.marginLeft = '-5000px';
    foFocusInput.focus();
    return true;
}

function getStatelessPart(obj) {
    return (
        obj.dataset.quicksearchSelectfield || // snelzoek
        obj.dataset.statelessPageId || // edit/stateless window
        obj.dataset.panelId
    ); // mask in edit window
}

function setSubviewLoading(domObj, loading) {
    if (!domObj) {
        return;
    }
    const subviewContainer = XDOM.getParentByTagName(domObj, 'FIELDSET');
    if (subviewContainer) {
        subviewContainer.dataset.isLoading = loading;
    }
}

function allSubviewsLoaded() {
    const dtaDiv = XDOM.getObject('DTADIV');
    const loading = dtaDiv.querySelectorAll('[data-is-loading="true"]');
    return loading.length === 0;
}

function setCursorFromStateless() {
    if (!allSubviewsLoaded()) {
        return;
    }
    if (GLOBAL.focusFirstSubView) {
        obj = getFirstField();
        XDOM.focus(obj);
        GLOBAL.focusFirstSubView = false;
        return;
    }
}

/**
 * haalt eerste te focusen element op van de pagina op basis van de volgorde in de dom
 * noormaal gesproken is dit het element dat links boven aan staat
 * geordend van links naar rechts
 */
function getFirstField() {
    const dtaDiv = XDOM.getObject('DTADIV'),
        query =
            "input:not([type='hidden']):not([data-hidden='true']):not([data-protected='true']), " +
            "textarea:not([type='hidden']):not([data-hidden='true']):not([data-protected='true']):not([data-hidden-line='true'])";
    return dtaDiv.querySelector(query);
}

/**
 * Position cursor or give focus obv SESSION.activePage.lastSelectedInput
 * @return void
 */
function setCursor(useScope = SESSION.submitFromScope) {
    if (
        !SESSION.activePage ||
        SESSION.session.state == 'inactive' ||
        OCULUS.tablet ||
        BrowserDetect.isiPad ||
        !OCULUS.extendedNav
    ) {
        return;
    }

    let obj = XDOM.getObject(SESSION.activePage.cursorFocus) ;
    //when object is a mask object is hidden so first get the visable object
    if (Mask.isMask(obj)) {
        obj = Mask.getFirstPart(obj); //bij een masker het eerste element gebruiken
    }
    if(!obj ||  isHidden(obj)){
        obj = getFirstField();
        //object might be a mask so in that case get first field
        if (Mask.isMask(obj)) {
            obj = Mask.getFirstPart(obj); //bij een masker het eerste element gebruiken
        }
    }
    obj = Logical.getDisplayObj(obj);

    if (!obj) {
        //er is geen input veld gevonden probeer de focus te zetten in een subview als deze worden geladen
        //voor nu zet de focus op een knop of het frame
        Stateless.setTryFirstSubview();
        if (setCursorFFBugFix()) {
            return;
        }
        obj = XDOM.query("[data-command-focused='true']", SESSION.activeForm) ||
            XDOM.getObject('CLOSE', SESSION.activeForm) ||
            XDOM.getObject('ENTER', SESSION.activeForm) ||

            SESSION.activeFrame;
    }
//obj.constructor.name === "Window"
    if (!Stateless.canHaveFocus(obj)){
        return;
    }
    let scope = '';
    //feature check  if not hen the object is window witch is fine
    if(obj.getAttribute){
        scope =
            obj.getAttribute('data-panel-id') ||
            obj.getAttribute('data-quicksearch-selectfield') ||
            obj.getAttribute('data-prompt-field') ||
            obj.getAttribute('data-stateless-page-id') ||
            'MAIN';
    }


    if (scope == useScope) {
        SESSION.submitFromScope = '';
        XDOM.focus(obj);
    }
}

function autoOpen(obj) {
    if (Service.autoObject) {
        return;
    }

    var foCurrentObj = definitions.currentObject.calender;
    if (!foCurrentObj) {
        foCurrentObj = definitions.currentObject.choiceService;
    }
    if (!foCurrentObj) {
        foCurrentObj = definitions.currentObject.quickSearch;
    }

    if (!foCurrentObj) {
        return;
    } // -->
    if (!foCurrentObj.action) {
        return;
    } // -->

    switch (foCurrentObj.action) {
        case ENUM.serviceAction.userAction:
            return;
            break;
        case ENUM.serviceAction.cursorAndBlank:
            if (obj.value.length > 0 && SESSION.activePage.messageLevel != 'F') {
                return;
            }
            break;
        case ENUM.serviceAction.cursorAndError:
            if (SESSION.activePage.messageLevel != 'F') {
                return;
            }
            break;
        default:
            return;
    }
    if (foCurrentObj.quickSearch) {
        foCurrentObj.quickSearch.open(false);
        return;
    } else {
        //openService(foCurrentObj, false);
        //todo: ajax
    }
    return;
}

/**
 * zet de tekst in de balk onderin met bijbehorende stijl balk.
 * @param status status van de boodschap
 * @param message de boodschap zelf
 * @param longMessage mouse over title text
 */
function setMessage(status, message, longMessage) {
    var slongMessage = longMessage;
    var oMSG = XDOM.getObject('MSGTXT');
    if (!oMSG) {
        return;
    }
    var commandDiv = XDOM.getObject('CMDDIV');
    var longMessageIcon = XDOM.getObject('LONGMESSAGEICON');
    switch (status) {
        case 'G':
        case 'A':
            commandDiv.className = 'STS_A';
            break;
        case 'V':
            commandDiv.className = 'STS_B';
            break;
        case 'S':
            commandDiv.className = 'STS_C';
            break;
        case 'W':
            commandDiv.className = 'STS_D';
            break;
        case 'F':
            commandDiv.className = 'STS_E';
            break;
        case 'M':
            commandDiv.className = 'STS_M';
            break;
        default:
            commandDiv.className = '';
            //XDOM.setAttribute(commandDiv, "data-message-status='default'")
            break;
    }
    if (document.all) {
        oMSG.innerText = message;
    } else {
        oMSG.textContent = message;
    }

    //als er een lange MSG is dan kan deze in een TITLE attribute getoond worden
    if (slongMessage) {
        longMessageIcon.setAttribute('data-hidden', 'false');
        GUI.infoTitle.register(commandDiv, slongMessage);
    } else {
        longMessageIcon.setAttribute('data-hidden', 'true');
        GUI.infoTitle.register(commandDiv, '');
    }
}

/**
 * haalt de tekst in de balk onderin weg en zet de stijl terug naar geen bericht.
 */
function resetMessage() {
    if (SESSION.submitInProgress) {
        return;
    }
    setEventsMessage('', '');
    return;
}

function logoutIe() {
    document.execCommand('ClearAuthenticationCache', 'false');
    top.location.reload();
}

function logout() {
    if (BrowserDetect.isEdge || BrowserDetect.isIE) {
        logoutIe();
    }
    if (BrowserDetect.isChrome) {
        logoutChrome();
    }
    //jammer nog geen mooie oplossing voor firefox
    top.location.href = top.location.href.replace('http://', 'http://logout@');
}

function logoutChrome() {
    const xmlHttpRequest = new XMLHttpRequest(),
        thisUri = location.href.replace('http://', 'http://logout@');

    xmlHttpRequest.onreadystatechange = function () {
        if (xmlHttpRequest.readyState == 4) {
            top.location.reload();
        }
    };

    xmlHttpRequest.open('GET', thisUri, true);
    xmlHttpRequest.setRequestHeader('Authorization', 'Basic logout');
    xmlHttpRequest.send();
    return false;
}

const readerAsDataURL = inputFile => {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onerror = () => {
            reader.abort();
            reject(new DOMException('Problem parsing input file.'));
        };

        reader.onload = () => {
            resolve(reader);
        };
        reader.readAsDataURL(inputFile);
    });
};
