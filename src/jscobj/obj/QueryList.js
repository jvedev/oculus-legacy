/* global Stateless, SESSION, GLOBAL, ENUM, Logical, XDOM, state, GUI */
/*
 * SESSION.activeData.headerAttributes (data.header)
 *
 */
var QueryList = {pageType: 'QueryList'};

/**
 * aanpassingen aan de html als deze nog een platte text is
 * dit zijn fixes die later nog op de server moeten worden gedaan
 * @param {type} htmlIn
 * @returns {QueryList.prepareHTML.html}
 */

/**
 * wordt aangeroepen bij het openen van de onderliggende macro page.updateDom
 * @returns {void}
 */
QueryList.close = function () {
    XDOM.focus(this.toId);
};

/**
 * @release
 *
 * @returns {Boolean} abbort
 */

/**
 * gets an array of field-ids and if the pagePrefix is set add it to the id's
 * @param fields string []
 * @param pagePrefix
 * @returns {string []}
 */
QueryList.fieldNames2DomIds = function (fields, pagePrefix) {
    //we need no changes if we don't have a pagePrefix.
    if (!pagePrefix)
        return fields;
    const getValidDomID = (id) => {
        //see if we can find this id in the dom
        let domElement = XDOM.getObject(id);
        if(domElement) {
            //if we have a dom element we can use it
            return id;
        }
        let prefixedId = pagePrefix + id;
        //check if this field exists with a prefix
        domElement = XDOM.getObject(prefixedId);
        if(domElement) {
            //if we have a dom element we can use it
            return prefixedId;
        }
        //now for some reason we als have a prefic including the p- prefix
        prefixedId = "p-" + prefixedId;
        domElement = XDOM.getObject(prefixedId);
        if(domElement) {
            //if we have a dom element we can use it
            return prefixedId;
        }
        //we can't find it so return an empty string istead
        return '';

    }



    //add the prefix to all fields
    return fields.map(getValidDomID)

}

QueryList.getToObject = function (prefix, toId) {
    if(XDOM.getObject( prefix + toId)) return prefix + toId;
    return toId;
}
QueryList.handleOnClick = function (body) {
    let currentPage = Stateless.Page.get(),
        icon = XDOM.getObject(currentPage.id),
        pageId = icon.dataset.statelessPageId || '',
        jobParmAction = icon.dataset.jobParmAction,
        pagePrefix = pageId ? pageId + '-' : '',
        page = null;
    let returnFieldsArray = (icon.dataset.returnFields || icon.dataset.panelId || '').split(' '),
        returnFields = QueryList.fieldNames2DomIds(returnFieldsArray,pagePrefix),
        clearFields = (icon.dataset.clearFields || '').split(' '),
        isEditWindow = false;


    const pageToId = QueryList.getToObject(pagePrefix , currentPage.toId)

    //icon out of edit window
    if (icon.dataset.parmPrefix) {
        //pagePrefix = icon.dataset.parmPrefix;
        isEditWindow = true;
    }

    // if we don't have return fields or clearFields close the panel
    if (!icon.dataset.returnFields && (!this.clearFields || this.clearFields.length === 0)) {
        Stateless.panel.close(currentPage.id);
        return;
    }

    if (pageId) {
        page = Stateless.Page.get(pageId);
    }

    const returnValues = currentPage.subfile.getReturnValues(body);

    for (let i = 0, l = returnFields.length; i < l; i++) {
        let fieldId = returnFields[i];
        let value = decodeURIComponent(returnValues[i]);
        XDOM.setObjectValue(fieldId, value);
    }

    Stateless.panel.close(currentPage.id);

    if (jobParmAction === ENUM.triggerAction.update) {
        Command.ipmfSubmitOnly();
    } else {
        if (isAutoSubmitField(pageToId) || hasAutoSubmitFields(returnFields)) {
            if (page) {
                page.submit('ENTER');
                return;
            }

            if (isEditWindow) {
                GUI.events.autoSubmit(XDOM.getObject(pageToId));
                return;
            }
            Command.execute('ENTER', true);
            return;
        }
    }
    XDOM.clearFields(clearFields);
    Trigger.fire(returnFields.concat(clearFields));
    XDOM.setOldvalue(returnFields.concat(clearFields));
    resetMessage();
};

QueryList.setReturnValues = function (body) {

}


QueryList.onReturnOk = function () {
    Stateless.panel.close(this.id);
    return true;
};

/**
 * wordt aangeroepen door de klick op een icoon
 * @param {type} obj obj kan leeg zijn of het dom object van het icoontje zijn
 * @returns {Promise<void>}
 */
QueryList.open = function (obj) {
    var callerObject = obj || GLOBAL.eventSourceElement;
    var id = callerObject.id,
        page = Stateless.Page.get(id),
        panel = Stateless.panel.get(id);

    if (panel) {
        // al eerder aangeroepen geweest

        if (callerObject.dataset.screenMode !== '*SUBVIEW' && !XDOM.getBooleanAttribute(panel, 'data-hidden')) {
            //paneel is nog zichtbaar dus niets doen
            return Promise.resolve();
        }
        return Stateless.request.get({callerObject: callerObject, onResponse: QueryList.onResponse, page: page});
    }
    return Stateless.request.get({
        callerObject: callerObject,
        onResponse: QueryList.onResponse,
        type: ENUM.requestType.all
    });
};

QueryList.Focus = function (id) {
    var panel = Stateless.panel.get(id),
        obj = panel.querySelector('[data-record-number="1"][type="button"]');
    if (obj) {
        //eerste regel
        XDOM.focus(obj);
        return;
    }
    //nog geen regels
    //focus op het panel
    Stateless.panel.focus(id);
};

QueryList.onReturn = function () {
};

QueryList.onResponse = function (response) {
    Stateless.panel.open(response, QueryList);
};

/**
 * deze functie wordt als referentie aan een page object gehangen
 * darom verweist this naar een instantie van het stateles page object
 */
QueryList.accept = function () {
    if (this.inputIsChanged || XDOM.GLOBAL.fieldIsChanged()) {
        this.submit('ENTER'); //submit pagina want creteria zijn veranderd
        return;
    } else {
        //er zijn geen creteria veranderd
        //zet de selectie terug en sluit het scherm
        this.submit('ACCEPT');
    }
};

/**
 * deze functie wordt als referentie aan een page object gehangen
 * daarom verweist this naar een instantie van het stateles page object
 */
QueryList.reset = function () {
    this.submit('RESET');
};
/**
 * deze functie wordt als referentie aan een page object gehangen
 * darom verweist this naar een instantie van het stateles page object
 */
QueryList.submit = function () {
    new Stateless.request({
        callerObject: XDOM.getObject(this.id),
        type: ENUM.requestType.data,
        onResponse: QueryList.onResponse
    });
};

QueryList.updateDom = function () {
    const promises = []
    var subviewParts = XDOM.queryAll('[data-stateless-type="*QUERYLIST"][data-screen-mode="*SUBVIEW"]'),
        part = null;
    for (var i = 0, l = subviewParts.length; i < l; i++) {
        part = subviewParts[i];
        promises.push(QueryList.open(part));
    }
    return promises;
};
