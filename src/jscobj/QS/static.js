/* global QuickSearch, XDOM, GLOBAL, SESSION, keyCode */

QuickSearch.instances = {};
Barcode.instances = {};

QuickSearch.activate = function () {
    var fsLength = GLOBAL.eventSourceElement.getAttribute(
        'data-quicksearch-activate-after'
    );
    var oIcon = null;
    var value = '';
    var fiLength = 0;
    var autoRequest = false;
    if (!fsLength) {
        return false;
    }
    oIcon = QuickSearch.iconByInput(GLOBAL.eventSourceElement.id);

    if (!oIcon || oIcon.dataset.disable=='true') {
        return false;
    }
    if (GLOBAL.charCode == keyCode.F12 || GLOBAL.charCode == keyCode.escape) {
        return false;
    }
    if (
        GLOBAL.eventSourceElement.maxLength ==
        GLOBAL.eventSourceElement.value.length
    ) {
        //geen vertraging veld is vol
        QuickSearch.gotFocus = true;
        autoRequest = true;

        QuickSearch.open(oIcon, false, null, autoRequest);
        return;
    }

    fiLength = parseInt(fsLength);
    if (GLOBAL.eventSourceElement.value.length >= fiLength) {
        value = GLOBAL.eventSourceElement.value;
        if (GLOBAL.keydownValue.startsWith(value)) {
            return;
        }
        if (oIcon) {
            QuickSearch.openDelayed(oIcon, true);
            XDOM.cancelEvent();
            return true;
        }
    }
    return false;
};

/**
 * sluit eventueel open quicksearch scherm en opent quickSearch voor het qSearchObj
 * @param auto indicatie of het zoekscherm via f2 of f4 is geopend of automatisch
 * @param qSearchObj (optional)
 */
QuickSearch.openByTrigger = function (triggerFieldId, qSearchObj, fromMacro) {
    var foTargetField = XDOM.getObject(qSearchObj.target);
    QuickSearch.blockRequest = true;
    foTargetField.value = '';
    foTargetField.setAttribute('data-old-value', '');
    if (fromMacro) {
        qSearchObj.saveCurrentState();
    }
    qSearchObj.openOnRequest = true;
    qSearchObj.show();
};

QuickSearch.sortButtonClick = function (e) {

    var fsQuickSearchId = e.target.getAttribute('data-quicksearch-id');
    var fsField = e.target.getAttribute('data-sort-field-name');
    if (!fsQuickSearchId || !fsField) {
        return false;
    }
    var fsId = e.target.getAttribute('data-sort-id');
    var fsSequence = e.target.getAttribute('data-sort-sequence');
    var fbCaseSensitive = e.target.getAttribute('data-sort-case-sensitve') == 'true';
    var fbActive = e.target.getAttribute('data-sort-active') == 'true';
    var foQuickSearch = QuickSearch.instances[fsQuickSearchId];
    var foAsc = XDOM.getObject(fsQuickSearchId + '-A-' + fsField);
    var foDesc = XDOM.getObject(fsQuickSearchId + '-D-' + fsField);

    foQuickSearch.resetSortButtons();

    if (fbActive) {
        foQuickSearch.sort('', '', '', '');
        return true;
    }

    if (fsSequence == 'A') {
        foAsc.setAttribute('data-sort-active', 'true');
        foAsc.className = 'srtascsel pth-icon dataSectionButton';
    } else {
        foDesc.className = 'srtdscsel pth-icon dataSectionButton';
        foDesc.setAttribute('data-sort-active', 'true');
    }
    if (fsId) {
        fsField = fsId;
    }

    foQuickSearch.sort(fsField, fsSequence, fbCaseSensitive);
    return true;
};

QuickSearch.autoOpen = function (delayedOpen) {
    if (SESSION.activePage.modalObject.panel.visible) {
        return;
    }

    if (
        !QuickSearch.checkAutoOpen(SESSION.activePage.modalObject.activateSearch)
    ) {
        return;
    }

    QuickSearch.gotFocus = true;
    QuickSearch.blockRequest = true;
    SESSION.activePage.modalObject.openOnRequest = false;
    SESSION.activePage.modalObject.show(delayedOpen);
};

/**
 * sluit eventueel open quicksearch scherm en opent quickSearch voor het obj
 * @param auto indicatie of het zoekscherm via f2 of f4 is geopend of automatisch
 * @param obj (optional)
 */
QuickSearch.open = function (obj, auto, invokee, autoFieldFull) {
    var oInstance = null;
    var qsId = obj.getAttribute('data-quicksearch-id');
    var qsAutoOpen = obj.getAttribute('data-activate-search');

    //request because toId field has maximum length
    if (!auto) {
        if (!QuickSearch.checkAutoOpen(qsAutoOpen)) {
            //return if state is *MANUAL
            return;
        }
    }

    if (SESSION.activePage.modalObject) {
        if (
            qsId === SESSION.activePage.modalObject.qsId &&
            SESSION.activePage.modalObject.panel.visible
        ) {
            //huidig zoekscherm is al open
            return;
        }
    }

    if (QuickSearch.instances[qsId]) {
        oInstance = QuickSearch.instances[qsId];
    } else {
        oInstance = new QuickSearch(obj);
    }
    oInstance.invokee = invokee;
    if (invokee) {
        invokee.setAttribute('data-no-completion', 'true');
    }

    if (autoFieldFull) {
        //automatic request if toid field is full
        if (!QuickSearch.checkAutoOpen(qsAutoOpen)) {
            //return if state is *MANUAL
            return;
        }
    }

    QuickSearch.blockRequest = true;

    if (!oInstance.inline) {
        closePopUp();
        SESSION.activePage.modalObject = oInstance;
    }
    oInstance.openOnRequest = auto;
    oInstance.show();
};

QuickSearch.handleOnClick = function (e) {
    XDOM.getEvent(e)
    if (QuickSearch.handleHeadingClick()) {
        return true;
    }

    if (
        !GLOBAL.eventSourceElement.getAttribute('data-quicksearch-id') ||
        GLOBAL.eventObjectTAG == 'INPUT'
    ) {
        return false;
    }

    XDOM.cancelEvent();
    QuickSearch.open(GLOBAL.eventSourceElement, true);
    return true;
};

QuickSearch.handleHeadingClick = function (e) {
    var thCell = null;
    var serviceId = null;
    var serviceObject = null;
    var serviceType = null;

    //check of er op een columnheading TH is geklikt
    thCell = XDOM.getParentByTagName(GLOBAL.eventSourceElement, 'TH');

    if (!thCell) {
        return false;
    }

    serviceId = thCell.getAttribute('data-search-click-id');
    if (!serviceId) {
        return false;
    }

    serviceObject = XDOM.getObject(serviceId);
    if (!serviceObject || serviceObject.dataset.hidden == 'true') {
        return false;
    }

    serviceType = serviceObject.getAttribute('data-search-type');
    if (serviceType != 'quickSearch') {
        return false;
    }

    XDOM.cancelEvent();
    QuickSearch.open(serviceObject, true);
    return true;
};
//
// /**
//  * deze mag pas na de when.update, cndatributes updat komen
//  * @returns {undefined}
//  */
// QuickSearch.updateDoubleSearch = function () {
//     // zet alle duouble search uit
//     const doubleSearchObjects = XDOM.queryAllScope('[data-double-search="true"]'),
//         availableSearchObjects = XDOM.queryAllScope(
//             '[data-search-id]:not([data-when="unavailable"])'
//         ),
//         availableQuickSearchObjects = XDOM.queryAllScope(
//             '[data-quicksearch-id]:not([data-when="unavailable"])'
//         ),
//         searchObjects = {};
//
//     XDOM.setAttributesToNodeList(
//         doubleSearchObjects,
//         'data-double-search',
//         'false'
//     );
//     XDOM.setAttributesToNodeList(
//         doubleSearchObjects,
//         'data-button-icon',
//         'search'
//     );
//     availableSearchObjects.forEach(
//         obj => (searchObjects[obj.dataset.toId] = obj)
//     );
//
//     availableQuickSearchObjects.forEach(quickSearchObject => {
//         const toId = quickSearchObject.dataset.toId,
//             searchObject = searchObjects[toId];
//         if (!searchObject) {
//             return;
//         }
//         if (
//             searchObject.offsetLeft == quickSearchObject.offsetLeft &&
//             searchObject.offsetHeight == quickSearchObject.offsetHeight
//         ) {
//             searchObject.setAttribute('data-double-search', 'true');
//             quickSearchObject.setAttribute('data-double-search', 'true');
//             quickSearchObject.setAttribute('data-button-icon', 'searchboth');
//             searchObject.setAttribute('data-button-icon', 'searchboth');
//         }
//     });
// };

// opnieuw submitten van alle quicksearch objecten
QuickSearch.updateDom = function () {
    var quickSearchObject = null;
    var promises = []
    for (qsId in QuickSearch.instances) {
        quickSearchObject = QuickSearch.instances[qsId];

        /*alleen updaten als de snelzoek ook in het scherm opgenomen is...*/
        if (SESSION.activePage.macroName === quickSearchObject.embeddedInMacro) {
            promises.push(quickSearchObject.update());
        }
    }
    return promises;
};

QuickSearch.prepareDom = function () {
    var oPageObjects = XDOM.queryAll('DIV[data-quicksearch-id]');
    var oObj = null;
    var screenMode = '';
    QuickSearch.instanceCount = 0; //will be use to make double instances unique
    for (var i = 0, l = oPageObjects.length; i < l; i++) {
        oObj = oPageObjects[i];
        screenMode = oObj.getAttribute('data-screen-mode');
        QuickSearch.prepareDomObj(oObj);

        if (
            screenMode == GUI.BasePanel.screenMode.subview ||
            oObj.getAttribute('data-trigger-fields')
        ) {
            setSubviewLoading(oObj, true);
            var quickSch = new QuickSearch(oObj);
            quickSch.initObj();
        }
    }
};

QuickSearch.prepareDomObj = function (oObj, to) {
    let oTo = null;
    let sToId = '';
    let sMinLength = oObj.getAttribute('data-quicksearch-activate-after');
    let qsId = oObj.getAttribute('data-quicksearch-id');
    //check if this queickSearchId is already in use
    if (XDOM.queryAll(`[data-quicksearch-id="${qsId}"]`).length > 1) {

        qsId +=QuickSearch.instanceCount++;
        oObj.setAttribute('data-quicksearch-id',qsId );
        oObj.id += QuickSearch.instanceCount;
    }

    if (to) {
        oTo = to;
    } else {
        sToId = oObj.getAttribute('data-to-id');
        oTo = XDOM.getObject(sToId);
        if (!oTo) {
            return;
        }
    }

    //bepalen default lengte
    if (!sMinLength || sMinLength === '*AUTO') {
        sMinLength = QuickSearch.getDefaultMinLength(oTo);
        oObj.setAttribute('data-quicksearch-activate-after', sMinLength);
    }
    oTo.setAttribute('data-quicksearch-id', oObj.id);
    oTo.setAttribute('data-quicksearch-activate-after', sMinLength);
    XDOM.classNameReplaceOrAdd(oTo, 'search', 'search');
};

/**
 * blur handler
 */
QuickSearch.onTargetBlur = function () {
    if (
        GLOBAL.eventSourceElement.getAttribute('data-quicksearch-activate-after')
    ) {
        QuickSearch.blockRequest = false;
        //reset QS  modalObj

        //cancel delay but keep modelObject RKR
        //SESSION.activePage.modalObject = null;
        QuickSearch.cancelDelayedOpen();
    }
};

/**
 * request handler
 * @param response
 * @qsId id van de quicksearch
 */
QuickSearch.handleRequest = function (qsId) {
    var foQuickSearchInstance = QuickSearch.instances[qsId];
    if (!foQuickSearchInstance) {
        return;
    } //-->
    if (XDOM.objectUnderModal(foQuickSearchInstance.target)) {
        return;
    }


    if (QuickSearch.response.basicConfig) {
        if (
            foQuickSearchInstance.requestCounter !=
            QuickSearch.response.basicConfig.requestCount
        ) {
            return;
        } //-->
    }
    if (foQuickSearchInstance.isRendered) {
        foQuickSearchInstance.resultNumberPlaceHolder.setAttribute(
            'data-hidden',
            'false'
        );
        foQuickSearchInstance.quickSearchLoader.setAttribute('data-hidden', 'true');
        setSubviewLoading(foQuickSearchInstance.quickSearchLoader, false);
        setCursorFromStateless();
    }

    foQuickSearchInstance.onResponse(QuickSearch.response);
};
/**
 * sluiten van een quick search scherm
 */
QuickSearch.close = function () {
    if (
        SESSION.activePage.modalObject &&
        !SESSION.activePage.modalObject.inline
    ) {
        SESSION.activePage.modalObject.close();
        SESSION.activePage.modalObject = null;
        QuickSearch.gotFocus = false;
        return true;
    }
    return false;
};

QuickSearch.hideTempMessage = function (qs) {
    qs.hideMessage();
};

QuickSearch.setTempMessage = function (message, level) {
    var qs = QuickSearch.get();
    qs.showMessage(message, level);
    setTimeout(function () {
        QuickSearch.hideTempMessage(qs);
    }, QuickSearch.messageDelay);
};

/**
 * Controleeerd of snelzoek open staat als dat zo is mag de enter geen submit veroorzaken
 * true zorgt er voor dat er geen verdere event handeling wordt uitgevoerd
 * handleKeyDown comnt niet meer bij Command.handleKeyDown
 * @returns {Boolean}
 */
QuickSearch.HandleKeyDown = function () {
    var isSelectField =
        (SESSION.activePage.modalObject &&
            SESSION.activePage.modalObject.panel.visible) ||
        XDOM.GLOBAL.getAttribute('data-quicksearch-selectfield');
    switch (GLOBAL.charCode) {
        case keyCode.enter:
            QuickSearch.cancelDelayedOpen();
            return isSelectField;
            break;
    }
    return false;
};

/**
 * verkrijgt het bijbehorende quicksearchId
 * @param {type} obj domobject
 * @returns {undefined}
 */
QuickSearch.getId = function (obj) {
    var id = XDOM.GLOBAL.getAttribute('data-quicksearch-id'),
        maskTarget = XDOM.GLOBAL.getAttribute('data-mask-target');

    if (maskTarget) {
        id = XDOM.getAttribute(maskTarget, 'data-quicksearch-id');
    }
    return id;
};

QuickSearch.get = function () {
    var qsId = QuickSearch.getId(GLOBAL.eventSourceElement);
    return QuickSearch.instances[qsId];
};

/**
 * set focus op subview als die aanwezig is
 */
QuickSearch.selectFieldClick = function (e) {
    Stateless.setSubviewActive(e.target);
};

/**
 * keyUp handler
 */
QuickSearch.HandleKeyUp = function () {
    var qsId = null;
    var qsinstance = null;

    qsId = QuickSearch.getId(GLOBAL.eventSourceElement);
    //key events van uit het quicksearch input veld
    if (XDOM.GLOBAL.getAttribute('data-quicksearch-selectField')) {
        qsinstance = QuickSearch.instances[qsId];
        if (qsinstance.handleKeyUp(GLOBAL.charCode, true)) {
            GLOBAL.eventObject.cancel();
        }
        //quit keyDownHandler
        return true;
    }

    //als het volledige targetveld gevuld is neemt de snelzoek de controle over en volgt er geen autosubmit
    if (qsId) {
        if (
            GLOBAL.charCode == keyCode.tab ||
            GLOBAL.charCode == keyCode.enter ||
            GLOBAL.charCode == keyCode.shift ||
            GLOBAL.charCode == keyCode.arrowUp ||
            GLOBAL.charCode == keyCode.arrowRight ||
            GLOBAL.charCode == keyCode.arrowDown ||
            GLOBAL.charCode == keyCode.arrowLeft
        ) {
            return false;
        }

        if (
            GLOBAL.eventSourceElement.maxLength ==
            GLOBAL.eventSourceElement.value.length
        ) {
            if (
                GLOBAL.charCode == keyCode.F2 ||
                GLOBAL.charCode == keyCode.F4 ||
                GLOBAL.charCode == keyCode.F12 ||
                !XDOM.fieldIsChanged(GLOBAL.eventSourceElement) ||
                GLOBAL.charCode == keyCode.escape
            ) {
                GLOBAL.eventObject.cancel();
                return true;
            }
        }
    }

    //key afhandeling voor een open modal quicksearch
    if (
        SESSION.activePage.modalObject && //     SESSION.activePage.modalObject.id == qsId &&
        SESSION.activePage.modalObject.type == 'quicksearch' &&
        SESSION.activePage.modalObject.panel.visible
    ) {
        SESSION.activePage.modalObject.handleKeyUp(GLOBAL.charCode, false);
        GLOBAL.eventObject.cancel();
        return true;
    }

    return QuickSearch.activate();
};

/**
 * cancelen van delayed open
 */
QuickSearch.cancelDelayedOpen = function () {
    clearTimeout(QuickSearch.delayedOpen);
};

QuickSearch.handleFunctionKEY = function () {
    var invokee = GLOBAL.eventSourceElement;
    var id = invokee.getAttribute('data-mask-target') || invokee.id,
        obj = QuickSearch.iconByInput(id);
    if (obj && obj.getAttribute("data-disable")!="true") {
        QuickSearch.open(obj, true, invokee);
        return true;
    }
    return false;
};

QuickSearch.iconByInput = function (id) {
    return XDOM.query(
        '[data-to-id="' +
        id +
        '"][data-quicksearch-id]:not([data-when="unavailable"])'
    );
};

QuickSearch.getDefaultMinLength = function (obj) {
    var minL = QuickSearch.DefaultMinLength[obj.maxLength];
    if (!minL) {
        minL =
            QuickSearch.DefaultMinLength[QuickSearch.DefaultMinLength.length - 1];
    }
    return minL;
};

QuickSearch.handleFocus = function (qsId) {
    QuickSearch.currentInstance = QuickSearch.instances[qsId];
};

/**
 * opend het snel zoek scherm na quickSearch.delay millie seconden
 * als deze 0 is wordt het scherm direct geopend
 * @param obj
 */
QuickSearch.openDelayed = function (obj) {
    var qsId = obj.getAttribute('data-quicksearch-id');
    if (QuickSearch.blockRequest) {
        return;
    }
    closePopUp();
    QuickSearch.cancelDelayedOpen();
    if (QuickSearch.instances[qsId]) {
        SESSION.activePage.modalObject = QuickSearch.instances[qsId];
    } else {
        SESSION.activePage.modalObject = new QuickSearch(obj);
    }
    QuickSearch.delayedOpen = setTimeout(
        'QuickSearch.autoOpen(true);',
        QuickSearch.defaultDelay
    );
};

/**
 * wordt aangeroepen op de onclick van een body regel
 * deze functie heeft een andere signatuur omdat hij statisch is (niet object gebonden)
 * @param iCursor
 */
QuickSearch.OnSelect = function (qsId, rowNr, setFocus, responseReturn) {
    var foQuickSearch = QuickSearch.instances[qsId];
    var returnFromResponse = responseReturn || false;

    if (foQuickSearch) {
        foQuickSearch.table.cursor = rowNr;
        foQuickSearch.select(setFocus, returnFromResponse);
        QuickSearch.gotFocus = false;
    }
};
