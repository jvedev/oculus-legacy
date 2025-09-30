/* global XDOM */

// function jsc_OPNDOCWDW() {
//     // ***************************************************************************
//     // Opent een minimale venster obv een URL
//     // parms:  fDOCPD=URL
//     //         fbRSZABL=true (resizeable) || false (fixed)
//     // return: --
//     // ***************************************************************************
//     // open window voor externe documenten
//     var fDOCPD = arguments[0];
//     var fbRSZABL = arguments[1];
//
//     var fsRSZABL = fbRSZABL ? 1 : 0;
//     var fOPNWDW = null;
//     var feOPNWDW =
//         '' +
//         'title=0,' +
//         'titlebar=0,' +
//         'toolbar=0,' +
//         'menubar=0,' +
//         'location=0,' +
//         'directories=0,' +
//         'status=0,' +
//         'resizable=' +
//         fsRSZABL +
//         ',' +
//         'scrollbars=1,' +
//         'alwaysRaised=yes,' +
//         'dependent=yes';
//
//     fOPNWDW = window.open(fDOCPD, 'DOCWDW', feOPNWDW);
//     try {
//         if (!fOPNWDW.opener) {
//             fOPNWDW.opener = self;
//             fOPNWDW.focus();
//         }
//     } catch (e) {
//     }
//     XDOM.cancelEvent();
//     return false;
// }

//***************************************************************************
// Creert een INPUT element
// parms:  fNAME=naam van het nieuwe INPUT element
//         fVALUE=waarde van het nieuwe INPUT element
// return: --
// ***************************************************************************

// ***************************************************************************
// Geeft aan of het opgegeven object hidden is
// parms:  fFIELD=te testen object
// return: true (hidden) || false (visible)
// ***************************************************************************
function isHidden(fsField) {
    var foObj = XDOM.getObject(fsField);

    if (!foObj) {
        return true;
    }

    if (foObj.type == 'hidden') {
        return true;
    }

    if (foObj.className.search('hidden') > -1) {
        return true;
    }

    if (
        foObj.hasAttribute('data-hidden') &&
        XDOM.getBooleanAttribute(foObj, 'data-hidden')
    ) {
        return true;
    }
    if (
        foObj.hasAttribute('data-hidden-line') &&
        XDOM.getBooleanAttribute(foObj, 'data-hidden-line')
    ) {
        return true;
    }
    return false;
}

// ***************************************************************************
// Veranderd de class eigenschap van het opgegeven object
// parms:  foFLD=object waarop de verandering moet plaats vinden
//         fOLDCLS=oude classe wat veranderd moet worden
//         fNEWCLS= nieuwe classe wat toegepast moet worden
//         fbCHGCLS=true (wel veranderen )|| false (niet veranderen)
// return: --
// !! Als NEWCLS='*OLD' class vervangen door een evt bewaarde class
//    als OLDCLS='*ALL' alle classes vervangen door NEWCLS
//    als OLDCLS=''     dan wordt NEWCLASS toegevoegd aan de huidige class
//    als OLDCLS!='' en NEWCLS='' dan wordt OLDCLS verwijderd
// ****************************************************************************

function blocked() {
    //OCULUS.checkKeyCode moet nog worden ingebouwd!

    if (SESSION.protected) {
        GLOBAL.eventObject.remapKeyCode();
        GLOBAL.eventObject.cancel();
        if (
            GLOBAL.charCode == keyCode.tab &&
            GLOBAL.eventObject.srcElement.tagName == 'INPUT'
        ) {
            //zorgen dat tab ook niet meer werkt
            GLOBAL.eventObject.srcElement.focus();
        }
        return true;
    }
    return false;
}

var ScreenBlokker = {};
ScreenBlokker.onclick = null;
ScreenBlokker.domObject = null;
ScreenBlokker.screenDiv = null;
ScreenBlokker.guiObject = null;

ScreenBlokker.show = function (z) {
    Dragger.screenDiv = XDOM.getObject('DTADIV');
    Dragger.domObject = XDOM.createElement(
        'DIV',
        'screenBlokker',
        'screenBlokker'
    );
    Dragger.screenDiv.appendChild(this.domObject);
    Dragger.domObject.onclick = Dragger.onclick;
    if (z) {
        Dragger.domObject.style.zIndex = z;
    }
};

ScreenBlokker.hide = function () {
    if (Dragger.domObject) {
        Dragger.screenDiv.removeChild(Dragger.domObject);
    }
    Dragger.domObject = null;
};

/**
 * sluit alle openstaande popups
 * @returns boolean
 */
function closePopUp() {
    XDOM.cancelAndRemap();
    return (
        popupPanel.close() |
        Service.close() |
        Calender.close() |
        QuickSearch.close() |
        closeHighSlide()
    );
}

function closeAllModalObjects() {
    closeNativeDialogs();
    return (
        closePopUp() ||
        Messages.closeWindow() | closeHighSlide() | Stateless.panel.close()
    );
}

function closeHighSlide() {
    var overlayObj = XDOM.getObject('whiteOverlay');
    var imgObj = XDOM.getObject('imgViewer');
    if (overlayObj) {
        XDOM.removeDOMObject(overlayObj);
        XDOM.removeDOMObject(imgObj);
        return true;
    }
    return false;
}

function setfavourites() {
    const favButton = XDOM.query('[data-button-icon="favourites"]'),
        show = SESSION.isSingleView == false && minVersion('*8A');
    if (favButton) {
        if(show){
            favButton.setAttribute('data-hidden', false);
            favButton.parentNode.style.display = '';
            return;
        }
        favButton.setAttribute('data-hidden', true);
        favButton.parentNode.style.display = 'none';

    }
}

function hideColourPicker() {
    if(!minVersion('*8A')){
        return;
    }
    const icon = XDOM.query('.session-user-button [data-click="skin"]');

    XDOM.removeDOMObject(icon?.parentNode);
    XDOM.removeDOMObject(SCOPE.pageDoc.querySelector('[data-button-icon="skin"]')?.parentNode);

}

/**
 * shows or hide the print button based on user settings
 * note: in firefox these buttons wil never be shown at all
 */
function setPrintButton() {
    const printBtn = SCOPE.pageDoc.querySelector('[data-button-icon="print"]');
    const hide = BrowserDetect.isFirefox || !SCOPE.main.Settings.get('SHOW_PRINT_BUTTON')?'true':'false'
    printBtn.setAttribute('data-hidden', hide);
    printBtn.parentNode.setAttribute('data-hidden', hide);
}

function setTitle() {
    if (NAV.Macro.currentInstance) {
        NAV.Macro.currentInstance.setTitle();
    }
}

function getPanelThemeColor(domObj) {
    //   let subviewContainer = XDOM.getParentByTagName(domObj,"FIELDSET"),
    //       subviewBackgroundColor = "";
    //   if(!subviewContainer){
    //    return;
    //   }
    //   subviewBackgroundColor = XDOM.getAttribute("data-fieldset-background-color");
}

//***************************************************************************
//Toepassen labels uit javascript teksten bestand op de objecten
//parms:  --
//return: --
//***************************************************************************
function setLabels(parent) {
    var faLables = null;
    if (parent) {
        faLables = parent.getElementsByTagName('label');
    } else {
        faLables = SESSION.activeFrame.document.getElementsByTagName('label');
    }

    for (var i = 0, l = faLables.length; i < l; i++) {
        faLables[i].innerHTML = getCaption(faLables[i].id, '');
    }
    let titles = PAGEDOC.querySelectorAll('[data-set-title]');
    for (var i = 0, l = titles.length; i < l; i++) {
        titles[i].title = getCapt(titles[i].dataset.setTitle);
    }

    return;
}

//***************************************************************************
//Toepassen helpText uit javascript teksten bestand op de objecten
//parms:  --
//return: --
//***************************************************************************
function setHelpText() {
    var pageObjects = XDOM.queryAll('[data-selection-help]');
    var helpTextValue = '';

    for (var i = 0, l = pageObjects.length; i < l; i++) {
        helpTextValue = getTitleText(pageObjects[i].dataset.selectionHelp);
        if (hasValue(helpTextValue)) {
            GUI.infoTitle.register(pageObjects[i], helpTextValue);
        }
    }
    return;
}

function getTitleText(text) {
    var fsHelpText = text;
    switch (text) {
        case '*LOWER':
            fsHelpText = getCapt('cWS_SLT_GTE');
            break;
        case '*UPPER':
            fsHelpText = getCapt('cWS_SLT_LTE');
            break;
        case '*NEWER':
            fsHelpText = getCapt('cWS_SLT_NEW');
            break;
        case '*OLDER':
            fsHelpText = getCapt('cWS_SLT_OLD');
            break;
        case '*EQUAL':
            fsHelpText = getCapt('cWS_SLT_EQL');
            break;
        case '*LEFTEQ':
            fsHelpText = getCapt('cWS_SLT_LEQ');
            break;
        case '*SCAN':
            fsHelpText = getCapt('cWS_SLT_SCN');
            break;
        case '*UNEQUAL':
            fsHelpText = getCapt('cWS_SLT_NEQ');
            break;
    }
    return fsHelpText;
}

function setSubviewNoMargin(subfiewContainer, screenMode) {
    var foObj = null,
        foFS = null;
    if (screenMode == GUI.BasePanel.screenMode.subview) {
        foObj = XDOM.getObject(subfiewContainer);
        foFS = XDOM.getParentByTagName(foObj, 'FIELDSET');
        foFS.className += ' subviewNoMargin';
        foFS.setAttribute('data-dashboard', 'gadget');
    }
}

/**
 *
 * @param i
 * return {peas}
 */
function int2css(i, nr) {
    return i.toString().lftzro(nr);
}

function backOnDisabled() {
    if (!isEnabled(GLOBAL.eventSourceElement)) {
        SESSION.activePage.previousField.focus();
        return true;
    }
    return false;
}

function protectPage() {
    SESSION.protected = true;
    TabProtect.protect();
    var protectDiv = XDOM.getObject('PROTECT');
    var sessionLoader = XDOM.getObject('sessionLoader');
    let enableLoader = SCOPE.main.Settings.get('ENABLE_LOADER');
    protectDiv.className = 'protectDIV';

    if (typeof enableLoader !== 'undefined') {
        if (enableLoader) {
            sessionLoader.className = 'protectDIV';
        }
    } else {
        sessionLoader.className = 'protectDIV';
    }
}

function releasePage() {
    SESSION.protected = false;
    TabProtect.free();
    var protectDiv = XDOM.getObject('PROTECT');
    var sessionLoader = XDOM.getObject('sessionLoader');
    protectDiv.className = 'noprotectDIV';
    sessionLoader.className = 'noprotectDIV';
}

function showFrame(type) {
    var frameToHide = null,
        frameToShow = null;
    if (type === '*SCH') {
        SESSION.seachFrameObj.setAttribute('data-hidden', false);

        //zoek is geopend vanuit eescreenTypen topView
        //if(SESSION.isSingleView){
        //  SESSION.topViewFrameObj.setAttribute("data-hidden", false);
        //}
        //SESSION.seachFrameObj.style.display 			= "block";
        //SESSION.topViewFrameObj.setAttribute("data-hidden", true);
        //SESSION.topViewFrameObj.style.display 		= "none";
        Search.searchBlocker(true);
    } else {
        if (SESSION.isSingleView) {
            SESSION.seachFrameObj.setAttribute('data-hidden', true);
            SESSION.topViewFrameObj.setAttribute('data-hidden', false);
            TopView.topViewBlocker(true);
        } else {
            SESSION.seachFrameObj.setAttribute('data-hidden', true);
            SESSION.topViewFrameObj.setAttribute('data-hidden', true);
            SESSION.appFrameObj.setAttribute('data-hidden', false);
        }
    }
}

function getFontPrefix(group) {
    let fontGroup = group,
        returnFontClass = '';

    switch (fontGroup) {
        case ENUM.fontIconGroup.fontAwesome:
            returnFontClass = 'fa fa-';
            break;
        case ENUM.fontIconGroup.pthFont:
            returnFontClass = 'pth-';
            break;
        case ENUM.fontIconGroup.customFont:
            returnFontClass = 'custom-';
            break;
    }
    return returnFontClass;
}

function updatePanelSort(sortDomObj = getHighestPanel()) {
    let panelWrapper = null,
        highestIndex = 100,
        topObject = XDOM.query('[data-show-on-top]', SESSION.activeForm);

    if (!sortDomObj) {
        return;
    }

    if (topObject) {
        highestIndex = parseInt(topObject.dataset.showOnTop) + 1;
        topObject.removeAttribute('data-show-on-top');
    }

    panelWrapper = XDOM.getParentByAttribute(sortDomObj, 'data-update-dom-depth');
    if (panelWrapper) {
        XDOM.setAttribute(panelWrapper, 'data-show-on-top', highestIndex);
        panelWrapper.style.zIndex = highestIndex;
    }
}

function getHighestPanel() {
    let panelObj = null,
        panelObjects = XDOM.queryAll(
            "[data-update-dom-depth='true']:not([data-hidden='true'])"
        ),
        z = 0,
        HighestZ = 0;
    HighestObject = null;

    if (panelObjects.length <= 0) {
        //no panels found
        return null;
    }

    for (panelObj of panelObjects) {
        // geen subview schermen meerekenen
        if (
            XDOM.getParentAttribute(panelObj, 'data-screen-mode') ==
            GUI.BasePanel.screenMode.subview
        ) {
            continue;
        }
        z = parseInt(panelObj.style.zIndex);
        if (z > HighestZ) {
            HighestZ = z;
            HighestObject = panelObj;
        }
    }
    return HighestObject;
}

/**
 * checks if extention is an image
 * @param {String} extention
 * @returns {boolean} true if extention is an image
 */
const isImage = extention =>
    ['BMP', 'JPG', 'JPEG', 'PNG', 'GIF'].indexOf(extention) > -1;

/**
 * finds of file from filename or url
 * @param {String} fileName
 * @returns {String}  extention
 */
const getExtention = fileName =>
    fileName
        .substr(fileName.lastIndexOf('.') + 1)
        .toUpperCase()
        .split('?')[0];

/**
 * gets fileName including extention from url
 * @param {String} url
 * @returns {String} filename
 */
const getFilenameFromUrl = url =>
    url.substring(url.lastIndexOf('/') + 1).split('?')[0];

// function userOrDevTitle() {
//   if (true || OCULUS.debugMode) {
//     let ret = arguments[0] || ''; //let op arguments is geen array dus geen map of join gebruiken
//     for (let i = 1, l = arguments.length; i < l; i++) {
//       ret += ' - ' + arguments[i];
//     }
//     return ret;

//     return arguments.join('-');
//   }
//   return arguments[0] || '';
// }


const cancelEvent = e => {
    if (!e) {
        return;
    }
    e.stopPropagation();
    e.preventDefault();
}

const inWizard = ()=>{
    return !!SCOPE.session.wizardDefinition;
}