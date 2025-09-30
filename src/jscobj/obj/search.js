/* global SESSION */

/**
 * object voor het vastleggen van zoekscherm instellingen
 * @param {HTMLElement} obj
 * @returns {Search}
 */
function Search(obj) {
    this.programName = obj.getAttribute("data-macro-name");
    this.programLocation = obj.getAttribute("data-macro-location");
    this.field = obj.getAttribute("data-to-id");
    //this.focusField = SESSION.activePage.lastFocusedField;
    this.recordNumber = obj.getAttribute("data-record-number");
    this.additionalParams = obj.getAttribute("data-input-fields");
    this.returnTargetFields = obj.getAttribute("data-return-fields");
    this.clearFields = (obj.dataset.clearFields || '').split(' ');
    this.axis = obj.getAttribute("data-axis");
    this.targetField = this.field;
    this.inSubfile = false;
    this.environmentConditions = obj.dataset.environmentConditions;
    this.paramObjectString = obj.getAttribute('data-parm-object') || ''

    this.dom = {};
    this.targetAxis = null;

    if (this.returnTargetFields) {
        this.returnTargetFields = this.returnTargetFields.split(' ');
    }
    if (this.additionalParams) {
        this.additionalParams = this.additionalParams.split(' ');
    }
    if (this.recordNumber) {
        this.inSubfile = true;
    }
}

Search.currentInstance = null;
Search.services = [];


Search.prototype.init = function () {
};

Search.prototype.close = function (values) {
    AJAX.Page.returnToCaller();
    Service.close(); //indien er nog een service window open is.
    Search.closeSearchFrame();
    Search.currentInstance = null;
    var fieldObj = null;
    var focusObj = null;

    if (values) {
        if (this.setReturnValues(values)) {
            if (isAutoSubmitField(this.field)) {
                Command.enter();
                return;
            }
        }
    }
    Trigger.fire(this.returnTargetFields.concat(this.clearFields));
    XDOM.setOldvalue(this.clearFields);
    fieldObj = XDOM.getObject(this.field);

    if (Mask.isMask(fieldObj)) {
        focusObj = fieldObj.getAttribute("data-last-selected-part");
        if (focusObj) {
            XDOM.focus(focusObj);
        }
    } else {
        XDOM.focus(this.field);
    }
};


Search.prototype.setReturnValues = function (values) {
    var fsReturnField = '';
    var fsRetValue = '';
    var foReturnObject = null;

    if (this.recordNumber) {
        this.adaptreturnTargetFields();
    }
    //clear values if any
    XDOM.clearFields(this.clearFields);
    if (!values) {
        return false;
    } // -->
    for (var i = 0, l = this.returnTargetFields.length; i < l; i++) {
        fsReturnField = this.returnTargetFields[i];
        fsRetValue = unescape(values[i]);
        foReturnObject = XDOM.getObject(fsReturnField);

        Subfile.setChanged(this.recordNumber);
        XDOM.setObjectValue(foReturnObject, fsRetValue);
    }
    resetMessage();
    return true;
};

Search.prototype.adaptreturnTargetFields = function () {
    var fsRetParam = '';
    var faRetArray = [];
    for (var i = 0, l = this.returnTargetFields.length; i < l; i++) {
        fsRetParam = this.returnTargetFields[i];
        fsRetParam += '_' + this.recordNumber;
        faRetArray[i] = fsRetParam;
    }
    this.returnTargetFields = faRetArray;
};

Search.prototype.registerSFLEvents = function () {
};

// ***************************************************************************
// Bouwt een parameterstring op obv de opgegeven velden
// parms: fPARMS=array van reeks van velden
// return: opgebouwde parm string
// ***************************************************************************
Search.prototype.buildSflParameterString = function (fPRMAR, fUSEID) {
    var fsAxis = '';
    var fsValue = '';
    var fsRequestUri = '';
    var foField = null;
    for (var i = 0, l = this.additionalParams.length; i < l; i++) {
        fsAxis = this.additionalParams[i];
        fiParam = i + 1;
        foField = XDOM.getAxis(fsAxis, this.recordNumber);
        if (!foField) {
            foField = XDOM.getObject(fsAxis);
        }
        if (!Validate.test(foField)) {
            return 'invalid';
        }
        fsValue = XDOM.getObjectValue(foField);

        fsRequestUri += '\'' + encodeURIComponent(fsValue.toUpperCase()) + '\'';
        if (i < l - 1) {
            fsRequestUri += ' ';
        }
    }
    return fsRequestUri;
};

/**
 * Opent het zoek venster
 *
 * @returns
 */

Search.openDelayed = function () {
    var foSearch = Search.currentInstance;
    Search.currentInstance = null; // in verband met onterecht blokeren van open
    foSearch.open();
};


Search.prototype.open = function () {
    var params = '', url = '';
    //if(Mask.isMask(GLOBAL.keydownObject)) {
    if (Mask.isMask(GLOBAL.eventSourceElement)) {
        Mask.returnValues(GLOBAL.keydownObject);
    }

    if (SESSION.submitInProgress) {
        return;
    }

    //SESSION.submitInProgress = true;

    if (Search.currentInstance) {
        return;
    }
    Search.currentInstance = this;

    if (SESSION.submitInProgress) {
        setTimeout(Search.openDelayed, 20);
        XDOM.cancelEvent();
        return true;
    }

    KeepAlive.cancel(); // stopt de keep alive job om dubbele requests te voorkomen
    QuickSearch.cancelDelayedOpen();

    if (this.inSubfile) {
        params = this.buildSflParameterString();
    } else {
        params = buildParamterString(this.additionalParams);
    }

    let paramsFromRequestObject = this.ParametersFromRequestObject();


    if (params == 'invalid' && paramsFromRequestObject == 'invalid') {
        Search.currentInstance = null;
        return;
    }

    if(params == 'invalid'){
        params = '';
    }
    if(paramsFromRequestObject !== 'invalid'){
        params += paramsFromRequestObject;
    }


    SESSION.submitInProgress = true;

    SESSION.activePage.serviceIsActive = true; // Service Function activated

    closeAllModalObjects();


    if (!PFMVAR['*SCH']) {
        PFMVAR['*SCH'] = {};
    }
    Search.searchBlocker(true);
    protectPage();
    url = SESSION.alias + '/' + this.programLocation
        + '/ndmctl/' + this.programName
        + '.ndm/main?PFMJOBID=' + SESSION.jobId
        + '&mProgramParms=' + params
        + "&AUTHTOKEN=" + SESSION.AUTHTOKEN
        + "&RequirePageDef=" +!SESSION.session.debugMode;


    if (this.environmentConditions) {
        url += '&EnvConditions=' + encodeURIComponent(this.environmentConditions);
    }


    SESSION.submitFromScope = 'MAIN';
    MAIN.NAV.Session.currentInstance.checkStatus();
    AJAX.Page.setCallerCaller(SESSION.activePage.macroProperties.cacheKey);
    AJAX.get(url, AJAX.handleResponse);
    return false;
};

Search.prototype.getURL = function () {
    return SESSION.alias + '/' + this.programLocation
        + '/ndmctl/' + this.programName
        + '.ndm/main?PFMJOBID=' + SESSION.jobId;
};

Search.closeSearchFrame = function () {
    SESSION.activePage.serviceIsActive = false; // Service Function deactivated
    if (PFMVAR['*SCH']) {
        PFMVAR['*SCH'] = null;
    }

    //AJAX.Page.returnToCaller();
    //showScreen();
    showFrame(SESSION.activePage.screenType);
    setFrames('*PGM');
    Search.searchBlocker(false);
    //XDOM.getObject('mRT_SCH').value = 'true';
    setTitle();
};

/**
 * Sluit het zoek venster Als op het ontvangende veld een AUTOSBM is gedefinieerd dan wordt deze uitgevoerd.
 *
 * @param values
 *          waarde van een eventueel gekozen sleutel
 * @param returnFields
 *          veld waarin de waarde terecht moet komen
 * @param toId
 *          veld waarop de focus terecht moet komen
 * @returns {void}
 */
Search.close = function (values, returnFields, toId) {
    if (Search.currentInstance) {
        Search.currentInstance.close(values);
    }

    return;
};


function buildParamterString() {
    // ***************************************************************************
    // Bouwt een parameterstring op obv de opgegeven velden
    // parms: fPARMS=array van reeks van velden
    // return: opgebouwde parm string
    // ***************************************************************************
    var parmArray = arguments[0];

    if (!parmArray) {
        return;
    }
    var arrayLength = parmArray.length;
    var parmString = '';

    for (var a = 0; a < arrayLength; a++) {
        var parmName = parmArray[a];
        var parmNumber = a + 1;
        if (parmName.indexOf('\'') == -1) {
            var parmObject = XDOM.getObject(parmName.trim());
            if (!parmObject) {
                // SCOPE.main.Dialogue.alert(gSCH001 + parmName + gSCH002);
                return 'invalid';
                break;
            }
            if (!Validate.test(parmObject)) {
                return 'invalid';
            }

            var parmValue = XDOM.getObjectValue(parmObject).trim();

            parmString += '\'' + encodeURIComponent(parmValue.toUpperCase()) + '\'';
        } else {
            parmString += parmName;
        }
        if (a < arrayLength - 1) {
            parmString += ' ';
        }
    }
    return parmString;
}

Search.handleOnClick = function () {
    var oSearch = new Search(GLOBAL.eventSourceElement);
    oSearch.open();
    return true;
};

Search.handleHeadingClick = function () {
    var thCell = null;
    var serviceId = null;
    var serviceObject = null;

    //check of er op een columnheading TH is geklikt
    thCell = XDOM.getParentByTagName(GLOBAL.eventSourceElement, "TH");

    if (!thCell) {
        return false;
    }

    serviceId = thCell.getAttribute("data-search-click-id");
    if (!serviceId) {
        return false;
    }

    serviceObject = XDOM.getObject(serviceId);
    if (!serviceObject) {
        return false;
    }

    if (serviceObject.getAttribute("data-when") === "unavailable") {
        return false;
    }

    if (serviceObject.getAttribute("data-quicksearch-id")) {
        //it's a quicksearch so invoke click on this one
        serviceObject.click();
        return false;
    }

    XDOM.cancelEvent();
    var oSearch = new Search(serviceObject);
    oSearch.open();
    return true;
};


Search.searchBlocker = function (fbBlock) {
    var foBlocker = XDOM.getObject('searchBlocker');

    if (foBlocker) {
        if (fbBlock) {
            foBlocker.setAttribute("data-blocker", "on");

            //XDOM.classNameReplaceOrAdd(foBlocker,"inactive", "active");
        } else {
            foBlocker.setAttribute("data-blocker", "off");
            //XDOM.classNameReplaceOrAdd(foBlocker,"active", "inactive");
        }
    }
};


/**
 * @returns {string} url|"invalid"
 */
Search.prototype.ParametersFromRequestObject = function () {
  if(!this.paramObjectString){return;}
  let requestFields;
  let recordNumber = parseInt(this.recordNumber);
  let sflIndex = recordNumber - 1; //array base 0 en record number base 1,
  let requestPrefix = '';

  try {
    let paramObjectString = this.paramObjectString.replace(/'/g, '"');
    requestFields = JSON.parse(paramObjectString);
  } catch (e) {
    alert(`malformed : ${paramObjectString})} object for search ${this.programName}`);
    return '';
  }



    if (requestFields.length === 0) {
        return '';
    }
    let url = '&PRMLEN=' + requestFields.length + '&';
    let valid = true;

    url += requestFields.map((param, index) => {
        let {field, location} = param;
        let urlPart = `PRM${index + 1}=`;
        let obj = XDOM.getObject(requestPrefix + field) ||
                  XDOM.getObject('trigger_' + requestPrefix + field) || //trigger field
                  XDOM.getObject(field + '_' + recordNumber) //subfile field

        //input or trigger generated fields
        if (obj && obj.tagName === 'INPUT') {
            if (!Validate.test(obj)) {
                valid = false
            }
            return urlPart + encodeURIComponent(obj.value);
        }
        switch (location) {
            case 'headerData':
                return urlPart + encodeURIComponent(
                    SESSION.activePage.headerData[field]
                );
            case 'subfileData':

                if (recordNumber <= 0) {
                    return ''
                }
                ;
                obj = XDOM.getObject(field + '_' + recordNumber);
                if (obj && obj.tagName !== 'INPUT') {
                    if (!Validate.test(obj)) {
                        valid = false
                    }
                    return urlPart + encodeURIComponent(obj.value);
                }

                return urlPart + encodeURIComponent(SESSION.activePage.subfileData[sflIndex][field]);
            default:
                if (obj && obj.dataset.constValue) {
                    return urlPart + obj.dataset.constValue;
                }
        }
    }).join('&');
    if (!valid) {
        return 'invalid';
    }
    return url
}