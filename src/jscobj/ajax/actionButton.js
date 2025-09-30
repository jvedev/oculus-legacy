/* global XDOM, GLOBAL, gPRC001, SESSION, Subfile, Command, msgNoSelection */

/**
 *  disabled of niet
 *  data-button-enabled-field-id = indicator veld met waarde 1/0 voor true/false
 *  data-button-default-enabled  = true/false -> als indicator niet gevonden is, is dit de waarde
 *
 *
 *  data-modef-field-id          = MODEF  (veld die aangeeft welke knop er actief is)
 *  data-modef-active-condition  = ADD/UPDATE/DELETE (wat voor knop is dit)
 *
 *  wordt op true gezet als de knop aanklikbaar is, dat wil zeggen actief en niet
 *  data-button-enabled
 *
 *  logica:
 *  een knop is disabled actief of enabled en niet actieve
 *  enabled en niet actieve
 **/

//<div id="GRDMLD" class="hidden btn28px floatRight none" data-title="GRDMLD_TTL" data-action-code="*HTM54" data-button-enabled-field-id="GRDMLD_AVL" data-button-default-enabled="true"></div>

function ActionCommand() {
}


/**
 * registreerd eventhandlers
 * al dan niet activeren van user action knoppen hangt af van de
 * de array SESSION.stack.currentMacro.userActionTargets. Dit is een associatieve array met als sleutels de userActions
 * als het attribute data-action-code als sleutel in deze array voorkomt moet hij getoond worden
 */

ActionCommand.updateDom = function () {
    var foPageObjects = XDOM.queryAll('[data-action-code]', SESSION.activeForm);
    var faActionTargets = SESSION.stack.currentMacro.getUserActionTargets();
    var fsTitle = '';
    var fsTitelCode = '';
    var fsActionCode = '';
    var fsContentCode = '';
    var foObj = null;

    if (foPageObjects.length == 0 || !faActionTargets) {
        return; //geen acction command knoppen
    }
    for (var i = 0, l = foPageObjects.length; i < l; i++) {
        foObj = foPageObjects[i];
        fsActionCode = XDOM.getAttribute(foObj, 'data-action-code');
        fsContentCode = XDOM.getAttribute(foObj, 'data-action-char');

        if (faActionTargets[fsActionCode]) {
            foObj.setAttribute("data-hidden", "false");
        }

        var contentField = null;
        if (fsContentCode) {
            contentField = XDOM.createElement("span", null, "actionBtnContent");
            contentField.setAttribute("data-actionBtn-char", "true");
            contentField.innerHTML = fsContentCode;
            foObj.appendChild(contentField);
        }

    }
};

/**
 * wordt uitgevoerd bij het opnieuw laden van de pagina en bepaald welke MODEF knoppen er actief, inactief en disabled worden aan de hand van de data
 */
ActionCommand.update = function () {
    var foPageObjects = XDOM.queryAll('[data-action-code]', SESSION.activeForm);
    var faActionTargets = SESSION.stack.currentMacro.getUserActionTargets();
    var foObj = null;
    var fsActionCode = '';

    if (foPageObjects.length == 0) {
        return; //geen modef knoppen
    }
    SESSION.activePage.setRecord(null); //set
    for (var i = 0, l = foPageObjects.length; i < l; i++) {
        foObj = foPageObjects[i];
        fsActionCode = XDOM.getAttribute(foObj, 'data-action-code');
        if (faActionTargets && faActionTargets[fsActionCode]) {
            foObj.setAttribute("data-hidden", "false");
        } else {
            foObj.setAttribute("data-hidden", "true");
        }
        enableButton(foObj);
    }


};

function enableButton(foObj) {
    var fsEnabledIndicatorFIeld = foObj.id + "_AVL";
    var fsEnabled = SESSION.activePage.header[fsEnabledIndicatorFIeld];

    if (fsEnabled == "0") {
        foObj.setAttribute("data-button-enabled", "false");
        return false;
    } else if (fsEnabled == "1") {
        foObj.setAttribute("data-button-enabled", "true");
        return true;
    } else if (XDOM.getBooleanAttribute(foObj, "data-button-default-enabled")) {
        foObj.setAttribute("data-button-enabled", "true");
        return true;
    } else {
        foObj.setAttribute("data-button-enabled", "false");
        return false;
    }
}

ActionCommand.isActionButton = function () {
    var actionCode = XDOM.GLOBAL.getAttribute("data-action-code");
    if (!actionCode || actionCode == "") {
        return false;
    }
    return true;
};
/**
 * controleerd in een werken met scherm of er tenminste 1 regel is geselecteerd
 * zo niet toon dan een boodschap
 * @returns {Boolean}
 */
ActionCommand.checkMinSelection = function () {
    var counterObject = XDOM.getObject("logicalCounter");
    if (!counterObject || !ActionCommand.isActionButton()) { //dit is geen werken met scherm
        return true;
    }
    if (counterObject && parseInt(XDOM.getObjectValue(counterObject)) > 0) {
        return true; //werken met scherm met een selectie
    }
    //werken met maar zonder selectie
    setMessage('M', getCapt('msgNoSelection'));
    return false;
};

ActionCommand.handleClick = function () {
    let actionBtnElement = GLOBAL.eventSourceElement;

    // no back submit from search pages
    // no close button
    if(actionBtnElement.dataset.returnFromSearch == "true" || actionBtnElement.dataset.wscmdType=="*CNL"){
        return false // no back submit from search pages
    }
    if (!XDOM.getBooleanAttribute(actionBtnElement, "data-button-enabled")) {
        if (!XDOM.getBooleanAttribute(GLOBAL.eventSourceElement, "data-actionBtn-char")) {
            return false;
        }
        actionBtnElement = GLOBAL.eventSourceElement.parentNode;
    }
    if ( ['print','close','skin','favourites','help'].includes(actionBtnElement.dataset.click) ) {
        return false;
    }

    if (actionBtnElement.getAttribute("data-button-enabled") == "false") {
        return false;
    }

    const fsActionCode = XDOM.getAttribute(actionBtnElement, "data-action-code");
    SESSION.stack.setActionTargetFields(fsActionCode, SESSION.activePage);

    if (fsActionCode != "*NEWRCD" && !ActionCommand.checkMinSelection()) {
        return true;
    }
    Subfile.storeSubfilePos();

    Command.submit(true);
    return true;
};

