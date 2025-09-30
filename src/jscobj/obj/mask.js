/* global XDOM, SESSION */

/**
 * data-mask-message bericht voor een ongeldig mask element data-mask-validation verwijsing naar de regular expression
 * voor validatie van dit masker element
 */

var Mask = function () {
};
/**
 * definities voor maskers
 *
 * @type Array
 */



Mask.definitions = [];

Mask.setDefinitions = ()=> {
// DD-DD-DD
    Mask.definitions['*DMY'] = [
        {
            'type': 'D',
            'start': 0,
            'end': 2,
            'maxLength': 2,
            'css': 'dec mskCalDay',
            'delimiter': '-',
            'delimiterCss': 'minusDelim',
            'message': getCapt('gCAL006'),
            'validate': '*DIG',
            'custom': false
        },
        {
            'type': 'D',
            'start': 2,
            'end': 4,
            'maxLength': 2,
            'css': 'dec mskMonth',
            'delimiter': '-',
            'delimiterCss': 'minusDelim',
            'message': getCapt('gCAL009'),
            'validate': '*DIG',
            'custom': false
        },
        {
            'type': 'D',
            'start': 4,
            'end': 6,
            'maxLength': 2,
            'css': 'dec mskYear',
            'delimiter': null,
            'delimiterCss': null,
            'message': getCapt('gCAL011'),
            'validate': '*DIG',
            'custom': false
        }];
//

    Mask.definitions['*DMYY'] = [
        {
            'type': 'D',
            'start': 0,
            'end': 2,
            'maxLength': 2,
            'css': 'dec mskCalDay',
            'delimiter': '-',
            'delimiterCss': 'minusDelim',
            'message': getCapt('gCAL006'),
            'validate': '*DIG',
            'custom': false
        },
        {
            'type': 'D',
            'start': 2,
            'end': 4,
            'maxLength': 2,
            'css': 'dec mskMonth',
            'delimiter': '-',
            'delimiterCss': 'minusDelim',
            'message': getCapt('gCAL009'),
            'validate': '*DIG',
            'custom': false
        },
        {
            'type': 'D',
            'start': 4,
            'end': 8,
            'maxLength': 4,
            'css': 'dec mskCentury',
            'delimiter': null,
            'delimiterCss': null,
            'message': getCapt('gCAL011'),
            'validate': '*DIG',
            'custom': false
        }];
// DD/DD
    Mask.definitions['*YRP'] = [
        {
            'type': 'D',
            'start': 0,
            'end': 2,
            'maxLength': 2,
            'css': 'dec mskYear',
            'delimiter': '/',
            'delimiterCss': 'slashDelim',
            'message': getCapt('gCAL011'),
            'validate': '*DIG',
            'custom': false
        },
        {
            'type': 'D',
            'start': 2,
            'end': 4,
            'maxLength': 2,
            'css': 'dec mskPeriod2',
            'delimiter': null,
            'delimiterCss': null,
            'message': getCapt('gCAL021'),
            'validate': '*DIG',
            'custom': false
        }];
// DD/DD/D
    Mask.definitions['*YWD'] = [
        {
            'type': 'D',
            'start': 0,
            'end': 2,
            'maxLength': 2,
            'css': 'dec mskYear',
            'delimiter': '/',
            'delimiterCss': 'slashDelim',
            'message': getCapt('gCAL011'),
            'validate': '*DIG',
            'custom': false
        },
        {
            'type': 'D',
            'start': 2,
            'end': 4,
            'maxLength': 2,
            'css': 'dec mskWeek',
            'delimiter': '/',
            'delimiterCss': 'slashDelim',
            'message': getCapt('gCAL020'),
            'validate': '*DIG',
            'custom': false
        },
        {
            'type': 'D',
            'start': 4,
            'end': 5,
            'maxLength': 1,
            'css': 'dec mskWeekDay',
            'delimiter': null,
            'delimiterCss': null,
            'message': getCapt('gCAL007'),
            'validate': '*DIG',
            'custom': false
        }];
// DDDD/DD/D
    Mask.definitions['*CYWD'] = [
        {
            'type': 'D',
            'start': 0,
            'end': 4,
            'maxLength': 4,
            'css': 'dec mskCentury',
            'delimiter': '/',
            'delimiterCss': 'slashDelim',
            'message': getCapt('gCAL011'),
            'validate': '*DIG',
            'custom': false
        },
        {
            'type': 'D',
            'start': 4,
            'end': 6,
            'maxLength': 2,
            'css': 'dec mskWeek',
            'delimiter': '/',
            'delimiterCss': 'slashDelim',
            'message': getCapt('gCAL020'),
            'validate': '*DIG',
            'custom': false
        },
        {
            'type': 'D',
            'start': 6,
            'end': 7,
            'maxLength': 1,
            'css': 'dec mskWeekDay',
            'delimiter': null,
            'delimiterCss': null,
            'message': getCapt('gCAL007'),
            'validate': '*DIG',
            'custom': false
        }];
// DD/DD
    Mask.definitions['*YWK'] = [
        {
            'type': 'D',
            'start': 0,
            'end': 2,
            'maxLength': 2,
            'css': 'dec mskYear',
            'delimiter': '/',
            'delimiterCss': 'slashDelim',
            'message': getCapt('gCAL011'),
            'validate': '*DIG',
            'custom': false
        },
        {
            'type': 'D',
            'start': 2,
            'end': 4,
            'maxLength': 2,
            'css': 'dec mskWeek',
            'delimiter': null,
            'delimiterCss': null,
            'message': getCapt('gCAL020'),
            'validate': '*DIG',
            'custom': false
        }];
// DDDD/DD
    Mask.definitions['*CYW'] = [
        {
            'type': 'D',
            'start': 0,
            'end': 4,
            'maxLength': 4,
            'css': 'dec mskCentury',
            'delimiter': '/',
            'delimiterCss': 'slashDelim',
            'message': getCapt('gCAL011'),
            'validate': '*DIG',
            'custom': false
        },
        {
            'type': 'D',
            'start': 4,
            'end': 6,
            'maxLength': 2,
            'css': 'dec mskWeek',
            'delimiter': null,
            'delimiterCss': null,
            'message': getCapt('gCAL020'),
            'validate': '*DIG',
            'custom': false
        }];
// DDDD/DD
    Mask.definitions['*CYP'] = [
        {
            'type': 'D',
            'start': 0,
            'end': 4,
            'maxLength': 4,
            'css': 'dec mskCentury',
            'delimiter': '/',
            'delimiterCss': 'slashDelim',
            'message': getCapt('gCAL011'),
            'validate': '*DIG',
            'custom': false
        },
        {
            'type': 'D',
            'start': 4,
            'end': 6,
            'maxLength': 2,
            'css': 'dec mskPeriod2',
            'delimiter': null,
            'delimiterCss': null,
            'message': getCapt('gCAL021'),
            'validate': '*DIG',
            'custom': false
        }];
// DDDD/D
    Mask.definitions['*CYQ'] = [
        {
            'type': 'D',
            'start': 0,
            'end': 4,
            'maxLength': 4,
            'css': 'dec mskCentury',
            'delimiter': '/',
            'delimiterCss': 'slashDelim',
            'message': getCapt('gCAL011'),
            'validate': '*DIG',
            'custom': false
        },
        {
            'type': 'D',
            'start': 4,
            'end': 5,
            'maxLength': 1,
            'css': 'dec mskQuarter',
            'delimiter': null,
            'delimiterCss': null,
            'message': getCapt('gCAL024'),
            'validate': '*DIG',
            'custom': false
        }];
// DD/D
    Mask.definitions['*YRQ'] = [
        {
            'type': 'D',
            'start': 0,
            'end': 2,
            'maxLength': 2,
            'css': 'dec mskYear',
            'delimiter': '/',
            'delimiterCss': 'slashDelim',
            'message': getCapt('gCAL011'),
            'validate': '*DIG',
            'custom': false
        },
        {
            'type': 'D',
            'start': 2,
            'end': 3,
            'maxLength': 1,
            'css': 'dec mskQuarter',
            'delimiter': null,
            'delimiterCss': null,
            'message': getCapt('gCAL024'),
            'validate': '*DIG',
            'custom': false
        }];
// //DD:DD:DD
    Mask.definitions['*HMS'] = [
        {
            'type': 'D',
            'start': 0,
            'end': 2,
            'maxLength': 2,
            'css': 'dec mskHour',
            'delimiter': ':',
            'delimiterCss': 'colonDelim',
            'message': getCapt('gCAL007'),
            'validate': '*DIG',
            'custom': false
        },
        {
            'type': 'D',
            'start': 2,
            'end': 4,
            'maxLength': 2,
            'css': 'dec mskMinute',
            'delimiter': ':',
            'delimiterCss': 'colonDelim',
            'message': getCapt('gCAL007'),
            'validate': '*DIG',
            'custom': false
        },
        {
            'type': 'D',
            'start': 4,
            'end': 6,
            'maxLength': 2,
            'css': 'dec mskSeconds',
            'delimiter': null,
            'delimiterCss': null,
            'message': getCapt('gCAL007'),
            'validate': '*DIG',
            'custom': false
        }];
// DD:DD
    Mask.definitions['*HMN'] = [
        {
            'type': 'D',
            'start': 0,
            'end': 2,
            'maxLength': 2,
            'css': 'dec mskHour',
            'delimiter': ':',
            'delimiterCss': 'colonDelim',
            'message': getCapt('gCAL007'),
            'validate': '*DIG',
            'custom': false
        },
        {
            'type': 'D',
            'start': 2,
            'end': 4,
            'maxLength': 2,
            'css': 'dec mskMinute',
            'delimiter': null,
            'delimiterCss': null,
            'message': getCapt('gCAL007'),
            'validate': '*DIG',
            'custom': false
        }];
}

Mask.isMask = function (obj) {
    var fsMask = null;
    if (obj && obj.getAttribute) {
        fsMask = obj.getAttribute("data-mask");
        if (fsMask) {
            return true;
        }
    }
    return false;
};

/**
 *
 * @param obj
 *          onderdeel van en mask of naam van origineel object van masker
 * @returns eerste invoer element van een masker terug
 */
Mask.getFirstPart = function (obj) {
    var foObj = XDOM.getObject(obj);
    var fsTarget = foObj.getAttribute("data-mask-target");
    if (fsTarget) { // foObj == masker onderdeel
        return foObj.parentNode.querySelectorAll('[data-mask-first=true]')[0];
    }// foObj == orgineel veld heeft geen data-mask-target attribute
    fsTarget = foObj.getAttribute("data-mask-first-part");
    return XDOM.getObject(fsTarget);
};

Mask.getAllParts = function (obj) {
    var foObj = XDOM.getObject(obj);
    var fsTarget = foObj.getAttribute("data-mask-target") ||
        foObj.getAttribute("data-mask-container-for") ||
        foObj.id;
    return foObj.parentNode.querySelectorAll('[data-mask-target="' + fsTarget + '"]');

};

/**
 * verkrijgt de waarde van het masker uit de zichtbare element
 * zonder deze aan te vullen
 * dit t.b.v. een snelzoek op een cutom masker
 * @param {type} id
 * @returns {undefined}
 */
Mask.getRawValue = function (id) {
    var obj = XDOM.getObject(id),
        parts = null,
        value = '';

    if (!Mask.isMask(obj)) {
        return '';
    }

    parts = Mask.getAllParts(obj);

    for (var i = 0, l = parts.length; i < l; i++) {
        value += parts[i].value;
    }
    return value;
};


/**
 *
 * @param obj
 *          onderdeel van en mask of naam van origineel object van masker
 * @returns laatste invoer element van een masker terug
 */
Mask.getLastPart = function (obj) {
    var fsObjId = obj.getAttribute("data-mask-last-part");
    return XDOM.getObject(fsObjId);
};

Mask.isLastPart = function (obj) {
    return XDOM.getBooleanAttribute(obj, "data-mask-last");
};


/**
 * set de focus op het eerste deel van het masker en selecteerd de text
 *
 * @param obj
 *          onderdeel van en mask of naam van origineel object van masker
 */
Mask.focus = function (obj) {
    var foObject = Mask.getFirstPart(obj);
    if (foObject) {
        foObject.focus();
        foObject.select();
    }
};

Mask.getContainer = function (obj) {
    var foContainer = obj;
    if (foContainer.tagName == "INPUT") {
        foContainer = XDOM.getObject(obj.id + "_container");
    }
    return foContainer;
};

Mask.setValue = function (obj, value) {
    var fbInput = obj.tagName == "INPUT";
    var foElements = null;
    var foContainer = obj;
    var foField = null;

    var faValues = Mask.spliceValue(obj, value);

    if (fbInput) {
        //set value to parent element (target)
        obj.value = value;
        foContainer = XDOM.getObject(obj.id + "_container");
        if (foContainer) {
            foElements = foContainer.querySelectorAll("[data-mask-target]");
            // foElements = foContainer.getElementsByTagName('input');
        } else {
            foElements = Mask.getAllParts(obj);
        }
    } else {
        foElements = obj.getElementsByTagName('output');
        if (value == '') {
            obj.style.display = 'none';
        } else {
            obj.style.display = '';
        }
    }

    for (var i = 0, l = foElements.length; i < l; i++) {
        foField = foElements[i];
        if (fbInput) {
            foField.value = faValues[i];
            foField.setAttribute("value", faValues[i].trim()); //voor css selectors
            setOldValue(foField);
        } else {
            if (faValues[i]) {
                foField.textContent = faValues[i];
            } else {
                foField.textContent = " ";
            }
        }
    }
};

Mask.spliceValue = function (obj, value) {
    var foDefinition = Mask.getDefinition(obj);

    var fsValue = '';
    var faReturn = [];

    for (var i = 0, l = foDefinition.length; i < l; i++) {
        fsValue = value.substring(foDefinition[i].start, foDefinition[i].end);
        if (!fsValue) {
            fsValue = '';
        }
        faReturn.push(fsValue);
    }
    return faReturn;
};


Mask.prepareDom = function () {
    Mask.setDefinitions();
    var faMasks = XDOM.queryAll('[data-mask]');
    for (var i = 0, l = faMasks.length; i < l; i++) {
        Mask.prepare(faMasks[i]);
    }
};


Mask.prepare = function (obj) {
    //var fsValue = '';
    if (obj.tagName == "INPUT") {
        // fsValue = obj.value;
        Mask.renderInput(obj);
    } else {
        Mask.renderOutput(obj);
    }
};

Mask.getDefinition = function (obj) {

    var fsMaskDef = obj.getAttribute("data-mask");
    var foDefinitions = Mask.definitions[fsMaskDef];
    var scope = "";
    if (foDefinitions) {
        return foDefinitions;
    }
    scope = obj.getAttribute("data-custom-mask-scope")
    if (scope == "*PROGRAM") {
        var recordNr = getClientRecordNr(obj);
        if (recordNr || recordNr == 0) {  // MVB aangepast
            fsMaskDef = SESSION.activeData.subfileAttributes[recordNr][fsMaskDef]
        } else {
            fsMaskDef = SESSION.activeData.headerData[fsMaskDef];
        }
    } else if (scope == "*SESSION") {
        fsMaskDef = gaMasks['*' + fsMaskDef]
    }

    foDefinitions = CustomMask.get(fsMaskDef);
    return foDefinitions;
};


/**
 * method Mask.analyzeMask
 * zet de string Mask om naar een array elements met MaskElement objecten en in een array  delimiters met string object
 * @author JVE
 * @since 01-07-2011
 * @version 1.0
 * @see Mask
 * @see MaskElement
 */

Mask.renderInput = function (obj, protect) {
    var foDefinitions = Mask.getDefinition(obj);
    var fiXpos = parseInt(obj.getAttribute("data-xpos"));
    var fiTabindex = obj.tabIndex;
    var foContainer = XDOM.createElement("DIV", obj.id + "_container", obj.className + " mask");
    var foDelimiter = null;
    var fbProtected = typeof protect !== 'undefined' ? protect : false;
    foContainer.setAttribute("data-mask-container-for", obj.id);
    var foNewPart = null;
    var foPart = obj.cloneNode();
    var foDefinition = null;
    foPart.setAttribute("data-mask-target", obj.id);

    XDOM.removeAttribute(obj, "data-line");
    XDOM.removeAttribute(obj, "data-xpos");

    //RKR DATA TYPE NIET AANPASSEN MAAR BLIJFT DATA
    //obj.setAttribute("data-datatype","*HIDDEN");

    obj.className = 'hidden';
    obj.readOnly = 'readOnly';
    obj.type = 'hidden';
    obj.maxLength = null;  // MVB maxLength

    for (var i = 0, l = foDefinitions.length; i < l; i++) {
        foDefinition = foDefinitions[i];
        foNewPart = foPart.cloneNode();
        foNewPart.value = '';
        foNewPart.id += "-" + i;
        foNewPart.name += "-" + i;
        foNewPart.tabindex = fiTabindex + i;
        foNewPart.setAttribute("data-xpos", fiXpos + i);
        foNewPart.setAttribute("data-datatype", "*MASK");
        foNewPart.setAttribute("data-focus-action", "INP.handleOnFocus");
        foNewPart.setAttribute("data-blur-action", "INP.handleOnBlur");

        XDOM.removeAttribute(foNewPart, "data-mask-element-type");


        if (fbProtected) {
            foNewPart.readOnly = 'readonly';
            foNewPart.setAttribute("data-protected", "true");
        }

        if (i == 0) {
            foNewPart.setAttribute("data-mask-first", "true");
            obj.setAttribute("data-mask-first-part", foNewPart.id);
        }
        if (i == l - 1) {
            obj.setAttribute("data-mask-last-part", foNewPart.id);
            foNewPart.setAttribute("data-mask-last", "true");
        } else {
            foNewPart.setAttribute("data-nextMask-part", obj.id + "-" + (i + 1));
        }
        if (foDefinition.custom) {
            foNewPart.className = foDefinition.inputClass;
        } else {
            foNewPart.className = foDefinition.css;
        }
        foNewPart.maxLength = foDefinition.maxLength;  // MVB maxLength
        //  foNewPart.setAttribute("maxLength",foDefinition.maxLength);       // MVB maxLength
        foNewPart.setAttribute("data-mask-type", foDefinition.type);
        foNewPart.setAttribute("data-precision", foDefinition.maxLength);    // MVB maxLength
        foNewPart.setAttribute("data-mask-message", foDefinition.message);
        foNewPart.setAttribute("data-mask-validation", foDefinition.validate);
        foNewPart.setAttribute("data-mask-custom", foDefinition.custom);
        foNewPart.setAttribute("data-mask-container", foContainer.id);
        foContainer.appendChild(foNewPart);

        if (foDefinition.delimiter) {
            foDelimiter = XDOM.createElement("DIV", null, "maskpart delimiter " + foDefinition.delimiterCss);
            foDelimiter.textContent = foDefinition.delimiter;
            foContainer.appendChild(foDelimiter);
        }
    }
    if (obj.getAttribute("data-hidden") == "true") {
        foContainer.setAttribute("data-hidden", "true");
    }

    if (obj.getAttribute("data-condition-field-id")) {
        foContainer.setAttribute("data-condition-field-id", obj.getAttribute("data-condition-field-id"));
        foContainer.setAttribute("data-condition-attribute", obj.getAttribute("data-condition-attribute"));
    }

    if (obj.parentNode) {
        obj.parentNode.insertBefore(foContainer, obj);
    }
    return foContainer;
};

Mask.renderOutput = function (obj) {
    var foDefinitions = Mask.getDefinition(obj);
    var foDefinition = null;
    //var foContainer = XDOM.createElement("DIV", null, "outputMask");
    var foNewPart = null;
    var cssClass = '';
    var foContainer = obj;
    var foDelimiter = null;
    foContainer.className += " outputMask";

    for (var i = 0, l = foDefinitions.length; i < l; i++) {
        foDefinition = foDefinitions[i];
        if (foDefinition.custom) {
            cssClass = foDefinition.outputClass;
        } else {
            cssClass = foDefinition.css;
        }
        foNewPart = XDOM.createElement("output", obj.id + "-" + i, "maskpart  " + cssClass);
        foContainer.appendChild(foNewPart);
        if (foDefinition.delimiter) {
            foDelimiter = XDOM.createElement("DIV", null, "maskpart delimiter " + foDefinition.delimiterCss);
            foDelimiter.textContent = foDefinition.delimiter;
            foContainer.appendChild(foDelimiter);
        }
    }


    //obj.appendChild(foContainer);

    return foContainer;
};


/**
 * data-mask-message bericht voor een ongeldig mask element data-mask-validation verwijzing naar de regular expression
 * voor validatie van dit masker element
 *
 * @param obj
 */
Mask.validateAllParts = function (obj) {

    var foElements = Mask.getAllParts(obj);
    var isValid = true;

    for (var i = 0, l = foElements.length; i < l; i++) {
        if (!Mask.validatePart(foElements[i])) {
            isValid = false;
        }
    }
    return isValid;
};


/**
 * data-mask-message bericht voor een ongeldig mask element data-mask-validation verwijsing naar de regular expression
 * voor validatie van dit masker element
 *
 * @param obj
 */
Mask.validatePart = function (obj) {
    var message = '';
    if (Mask.isValidPart(obj)) {
        resetMessage();
        return true;
    }
    message = Mask.getErrorMessage(obj);
    setEventsMessage('F', message);
    XDOM.focus(obj);
    return false;
};


Mask.getErrorMessage = function (obj) {
    var fsValue = obj.value;
    var fsRegExName = obj.getAttribute("data-mask-validation");
    var fsMessage = obj.getAttribute("data-mask-message");
    var fsRegExpr = gaREGEXP[fsRegExName];
    var type = obj.getAttribute("data-mask-type");
    var pos = null, char = null;
    if (fsMessage) {
        fsMessage += fsValue;
    } else {
        if (type == 'D' || type == 'I') {
            fsMessage = getCapt('gVLD007');
        } else {
            pos = fsValue.search(fsRegExpr);
            char = fsValue.substring(pos, pos + 1);
            fsMessage = getCapt('gVLD003') + char + getCapt('gVLD004');
        }
    }
    return fsMessage;
};

Mask.isValidPart = function (obj) {
    var fsValue = obj.value;
    var fsRegExName = obj.getAttribute("data-mask-validation");
    var fsRegExpr = gaREGEXP[fsRegExName];
    if (!fsRegExName || fsValue == '' || !fsRegExpr.test(fsValue)) {
        return true;
    }
    return false;
};


Mask.hasValue = function (obj) {
    var faParts = Mask.getAllParts(obj);
    var foPart = null;
    var fsValue = '';
    for (var i = 0, l = faParts.length; i < l; i++) {
        foPart = faParts[i];
        fsValue += foPart.value;
    }
    if (fsValue.trim()) {
        return true;
    }
    return false;
};

Mask.completeAllMasks = function () {

    var maskObjs = XDOM.queryAll('[data-mask-element-type="*INPUT"]');
    for (var i = 0, l = maskObjs.length; i < l; i++) {
        Mask.completeAllParts(maskObjs[i]);
    }
}

Mask.completeAllParts = function (obj) {

    obj = XDOM.getObject(obj);

    if (!Mask.hasValue(obj)) {
        obj.value = '';
        return;
    }
    var faParts = Mask.getAllParts(obj);
    var foPart = null;
    var completeAllParts = true;

    var fsValue = '';
    for (var i = 0, l = faParts.length; i < l; i++) {
        foPart = faParts[i];
        Mask.completePart(foPart, completeAllParts);
        fsValue += foPart.value;
    }

    obj.value = fsValue;
};


/**
 * bepaald of een masker in zijn totalitijd is veranderd
 * @param obj element van een masker
 * @returns {boolean}
 */
Mask.isChanged = function (id) {
    return fieldIsChanged(XDOM.getObject(id));
};


Mask.completePart = function (obj, completeAllParts) {
    if (obj.getAttribute("data-no-completion") === "true") {
        return;
    }
    var value = obj.value.trim();
    var type = obj.getAttribute("data-mask-type");
    if (value) {
        switch (type) {
            case 'A':
            case 'C':
                value = value.rgtblk(obj.maxLength);
                break;
            case 'I':
                value = value.lftzro(obj.maxLength);
                break;
            case 'N':
                value = value.lftblk(obj.maxLength);
                break;
            case 'Z':
                value = value.rgtzro(obj.maxLength);
                break;
            case 'D':
                value = value.lftzro(obj.maxLength);
                break;
        }
    } else {
        if (obj.getAttribute("data-validate-mask") == "false" && Mask.hasValue(obj)) {
            if (type == 'I') {
                value = value.lftzro(obj.maxLength);
            } else if (completeAllParts) {
                value = ' '.times(obj.maxLength);
            }
        }
    }
    obj.value = value;
};

Mask.getTarget = function (foObj) {
    var fsTarget = foObj.getAttribute("data-mask-target");
    return XDOM.getObject(fsTarget);
};

Mask.returnValues = function (obj) {
    var part = null;
    var target = obj.getAttribute("data-mask-target");
    var targetObj = Mask.getTarget(obj);
    if (!targetObj) {
        return;
    }
    var parts = obj.parentNode.querySelectorAll('[data-mask-target=' + target + ']');
    targetObj.value = '';
    for (var i = 0, l = parts.length; i < l; i++) {
        part = parts[i];
        //Mask.completePart(part);
        targetObj.value += part.value;
    }
};


/**
 * Bij een masker moet er als er op enter wordt gedrukt eerst het masker aangevuld en de waarde terug
 * geschreven worden in het oorspronkelijke invoer veld
 * @returns {boolean}
 */
Mask.handleKeyDown = function () {
    if (GLOBAL.charCode != keyCode.enter || !Mask.isMask(GLOBAL.eventSourceElement)) {
        return false;
    }

    if (Mask.validatePart(GLOBAL.eventSourceElement)) {
        //masker is gevalideerd en aangevuld geef false terug zodat de enter uiteindelijk resulteerd in een submit
        Mask.completeAllParts(GLOBAL.eventSourceElement.getAttribute("data-mask-target"));
        //Mask.completePart(GLOBAL.eventSourceElement);
        //Mask.returnValues(GLOBAL.eventSourceElement);
        return false;
    } else {
        //masker is niet gevalideerd voorkom een submit
        return true;
    }
}


/**
 * bij het verlaten van een deel van een masker
 * wordt er afgeweken van andere input elementen omdat
 * het om een samengesteld veld gaat
 * @param obj
 */
Mask.handleOnBlur = function (obj, isChanged) {
    if (!Mask.isMask(obj)) {
        return false;
    }
    if (!isChanged || Mask.validatePart(obj)) {
        Mask.completePart(obj);
        Mask.returnValues(obj);
        Mask.submitField(obj);
    }
    // SESSION.activePage.lastChangedMaskId = obj.getAttribute("data-mask-target");
    return true;
};

Mask.submitField = function (foObj) {
    var fbIsAutosubmit = isAutoSubmitField(foObj);
    var fsTarget = foObj.getAttribute("data-mask-target");
    if (Mask.isLastPart(foObj) && (fbIsAutosubmit)) {
        if (Mask.isChanged(fsTarget)) {
            INP.handelTriggersAndAutoSubmits(foObj, true, true);
        }
    }
};


/**
 * Bij een submit moet de LastChanged weer leeg gemaakt worden.
 * @param obj
 */
Mask.clearLastChanged = function () {
    SESSION.activePage.lastChangedMaskId = '';
    return;
};


/**
 * controleerd of het vorige object een mask element was en of het huidige object daar nog bij hoort
 * @param obj
 */
Mask.handleFocus = function (obj) {
    var orgMask = null;
    var maskContainer = null;
    if (SESSION.activePage.lastChangedMaskId && SESSION.activePage.lastChangedMaskId !== "") {
        if (SESSION.activePage.lastChangedMaskId !== obj.getAttribute("data-mask-target")) {
            //het masker is verlaten
            orgMask = XDOM.getObject(SESSION.activePage.lastChangedMaskId);
            Mask.handleOnChange(orgMask);
        }
    }

    if (Mask.isMask(obj)) {
        maskContainer = Mask.getContainer(obj.getAttribute("data-mask-target"));
        if (maskContainer) {
            XDOM.getObject(maskContainer).setAttribute("data-last-selected-part", obj.id);
        }
    }
};

/**
 * eventhandler voor change op masks
 * omdat we hier niet weten of het masker helmaal of slechts een masker gedeeltelijk is verlaten
 * registreren we het veranderde masker deel om dan bij het volgende onFocus of onclick event te kijken of het masker ook werkelijk verlaten is
 * is dat zo dan kan er als nog een auto submit plaatsvinden
 **/
Mask.handleOnChange = function (obj) {
    SESSION.activePage.lastChangedMaskId = '';
    Mask.completeAllParts(obj);
    handleOnChange(obj);
};

/**
 * omdat een submit bij een autosubmit niet mogelijk is op een onChange event
 * simuleren we dit
 * obj kan null zijn! in dat geval is het masker zeker verlaten
 **/
Mask.CheckChanged = function (obj) {
    if (!SESSION.activePage.lastChangedMaskId) {
        return false;
    }
    if (!obj || SESSION.activePage.lastChangedMaskId != obj.getAttribute("data-mask-target")) {

        //het masker is veranderd en heeft een autosubmit veld
        Mask.handleOnChange(XDOM.getObject(SESSION.activePage.lastChangedMaskId));
        return true;
    }

    return false;
};

/**
 * geeft aan of object een maskpart is
 * @param obj
 * @returns {Boolean}
 */
Mask.isPart = function (obj) {
    if (obj.getAttribute("data-mask-target")) {
        return true;
    }
    return false;
};

/**
 * geeft aan of object een maskpart is
 * @param obj
 * @returns {Boolean}
 */
Mask.selectNextPart = function (obj) {

    var nextMaskField = null;
    var nextMaskObject = null;
    var maskSelector = null

    maskSelector = obj.getAttribute("data-mask-target");
    if (!maskSelector) {
        return false;
    }

    if (Mask.isMask(obj) && !Mask.isLastPart(obj)) {

        nextMaskField = obj.getAttribute("data-nextMask-part");
        if (nextMaskField !== null) {
            nextMaskObject = XDOM.getObject(nextMaskField);
            if (nextMaskObject !== null) {
                return XDOM.focus(nextMaskObject);
            }
        }
    }

    return false;
};