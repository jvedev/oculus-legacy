/* XDOM - DOM Manipulation Library */
/* Extracted from session/functions.js for modularization */

// Import BrowserDetect dependency
import './browser-detect.js';

/**
 * XDOM - Cross-browser DOM manipulation library
 * Provides unified interface for DOM operations across different browsers
 */
var XDOM = function() {};
XDOM.GLOBAL = function() {};

XDOM.hexEncode = function(encodeString) {
    if (!encodeString) {
        return '';
    }
    var hexString, i, l;
    var hexResult = '';
    for (i = 0, l = encodeString.length; i < l; i++) {
        hexString = encodeString.charCodeAt(i).toString(16);
        hexResult += ('000' + hexString).slice(-4);
    }
    return hexResult;
};

XDOM.hexDecode = function(decodeString) {
    if (!decodeString) {
        return '';
    }
    var i, l;
    var hexString = decodeString.match(/.{1,4}/g) || [];
    var responseText = '';

    for (i = 0, l = hexString.length; i < l; i++) {
        responseText += String.fromCharCode(parseInt(hexString[i], 16));
    }

    return responseText.trim();
};

XDOM.rightTrim = function(stringObj) {
    if (BrowserDetect.isIE) {
        return stringObj;
    }
    if (typeof stringObj === 'string' || stringObj instanceof String) {
        return stringObj.trimRight();
    }

    return stringObj;
};
XDOM.removeInput = name => {
    delete SESSION.activePage.controlerFields[name];
}
XDOM.createInputField = function(name, value) {
    // ***************************************************************************
    // Creert een INPUT element
    // parms:  fNAME=naam van het nieuwe INPUT element
    //         fVALUE=waarde van het nieuwe INPUT element
    // return: --
    // ***************************************************************************
    SESSION.activePage.controlerFields[name] = value;
    return;
    var foInp = XDOM.getObject(name);

    if (foInp) {
        foInp.value = value;
        return;
    }
    foInp = XDOM.createElement('input', name);
    foInp.setAttribute('name', name);
    foInp.setAttribute('type', 'hidden');
    foInp.setAttribute('value', value);
    SESSION.activeForm.appendChild(foInp);
    return;
};

XDOM.objSerializeToAttribute = (atribute, json) => {
    let serialised = Object.entries(json)
        .map(p => `&quot;${p[0]}&quot;:&quot;${p[1]}&quot;`)
        .join(',');
    return ` data-${atribute}="{${serialised}}" `;
};
/**
 *
 * @param {type} xmlString
 * @returns {unresolved}
 */
XDOM.getXML = function(xmlString='') {
    var parser = new DOMParser();
    return parser.parseFromString(xmlString.trim() , 'application/xml');
};

XDOM.query = function(query, parentObject) {
    if (parentObject) {
        return parentObject.querySelector(query);
    }

    if (SESSION.subScope) {
        return SESSION.subScope.querySelector(query);
    }
    if (SESSION.activeForm) {
        return SESSION.activeForm.querySelector(query);
    }
    return document.querySelector(query);
};

XDOM.queryAllAppend = function(query, collection, parentObject) {
    var returnObj = collection || [];
    var nodeList = XDOM.queryAll(query, parentObject);
    return returnObj.concat(Array.prototype.slice.call(nodeList));
};

XDOM.queryAll = function(query, parentObject) {
    if (parentObject) {
        return parentObject.querySelectorAll(query);
    }
    if (SESSION.subScope) {
        return SESSION.subScope.querySelectorAll(query);
    }

    if (SESSION.activeForm) {
        return SESSION.activeForm.querySelectorAll(query);
    }

    return document.querySelectorAll(query);
};

function getCaller() {
    let stack = new Error().stack.split('\n')[3],
        f = stack
            .split('(')[0]
            .replace('at Object.', '')
            .replace('at Function.', '')
            .trim();

    return f;
}

XDOM.queryScope = function(query, parentObject) {
    if (SESSION.subScope) {
        return XDOM.query(query, parentObject);
    }
    let ret = XDOM.query(query + ':not([data-stateless-page-id])');
    return ret;
};

XDOM.queryAllScope = function(query, parentObject) {
    let ret = null;
    if (parentObject) {
        ret = parentObject.querySelectorAll(query);
        if (ret) {
            return ret;
        }
    }
    if (SESSION.subScope && SESSION.subScope.id != 'SCRDIV') {
        return XDOM.queryAll(query, parentObject);
    }

    ret = XDOM.queryAll(query + ':not([data-stateless-page-id])');
    return ret;
};

/**
 * opvragen van een attribute waarde
 * @param obj
 * @param name
 * @returns
 */
XDOM.getAttribute = function(obj, name) {
    var foObj = XDOM.getObject(obj);
    if (!(foObj && name)) {
        return null;
    } //--->
    if (foObj.getAttribute) {
        return foObj.getAttribute(name);
    }
    return null;
};

XDOM.GLOBAL.setAttribute = function(name, value) {
    XDOM.setAttribute(GLOBAL.eventSourceElement, name, value);
};

XDOM.GLOBAL.fieldIsChanged = function() {
    return XDOM.fieldIsChanged(GLOBAL.eventSourceElement);
};

XDOM.fieldIsChanged = function(obj) {
    var foObj = XDOM.getObject(obj) || GLOBAL.eventSourceElement;
    var fsOldValue = null;

    //we will not deal with we will not do an onchange on a button
    if(foObj.type=="button") return false;

    if (!('value' in foObj)) {
        return false;
    }
    fsOldValue = XDOM.getAttribute(foObj, 'data-old-value');

    if (!fsOldValue) {
        fsOldValue = '';
    }
    return foObj.value !== fsOldValue;
};

/**
 * setten van een array van attributes
 * @param obj
 * @param faAttributes van attributes
 */
XDOM.setAttributes = function(obj, faAttributes) {
    var foObject = XDOM.getObject(obj);
    if (!faAttributes) {
        return;
    } //--->
    for (var attribute in faAttributes) {
        foObject.setAttribute(attribute, faAttributes[attribute]);
    }
};

XDOM.radioAttributeToggle = function(
    allItems,
    item,
    attribute,
    valueOn,
    valueOff
) {
    XDOM.setAttributesToNodeList(allItems, attribute, valueOff);
    item.setAttribute(attribute, valueOn);
};

XDOM.setAttributesToNodeList = function(nodeList, attribute, value) {
    var objects = nodeList;
    if (typeof nodeList === 'string') {
        objects = XDOM.queryAll(nodeList);
    }

    for (var i = 0, l = objects.length; i < l; i++) {
        objects[i].setAttribute(attribute, value);
    }
};

/**
 * setten van een attribute
 * @param obj
 * @param name
 * @param value
 */
XDOM.setAttribute = function(obj, name, value) {
    var foObject = XDOM.getObject(obj);
    if (!(foObject && name && hasValue(value))) {
        return;
    } //--->
    foObject.setAttribute(name, value);
};

XDOM.removeAttribute = function(obj, name) {
    var foObject = XDOM.getObject(obj);
    if (!(foObject && name)) {
        return;
    } //--->
    if (foObject.setAttribute) {
        foObject.setAttribute(name, null);
    }
};

/**
 * toevoegen van event handlers  aan alle elementen van een node gebaseerd op de query
 * @param query
 * @param type
 * @param handler
 */
XDOM.addEventListenerToNode = function(query, type, handler, parentObject) {
    var objects = null;

    if (parentObject) {
        objects = parentObject.querySelectorAll(query);
    } else {
        objects = XDOM.queryAll(query);
    }

    var obj = null;
    for (var i = 0, l = objects.length; i < l; i++) {
        obj = objects[i];
        XDOM.addEventListener(obj, type, handler);
    }
};

/**
 * toevoegen van een event handler
 * @param obj
 * @param type
 * @param handler
 */
XDOM.addEventListener = function(obj, type, handler) {
    if (!(obj && type && handler)) {
        return;
    } //--->

    if (obj.attachEvent) {
        obj.attachEvent('on' + type, handler);
    } else if (obj.addEventListener) {
        obj.addEventListener(type, handler, false);
    }
};

/**
 * verwijderen van een event handler
 * @param obj
 * @param type
 * @param handler
 */
XDOM.removeEventListener = function(obj, type, handler) {
    if (!(obj && type && handler)) {
        return;
    } //--->
    if (obj.removeEventListener) {
        obj.removeEventListener(type, handler, false);
    } else if (obj.detachEvent) {
        obj.detachEvent('on' + type, handler);
    } else {
        obj.setAttribute('on' + type, null);
    }
};

/**
 * het ophalen van een HTML dom Object
 * @param fsId id
 * @returns {HTMLElement} object
 */
XDOM.getObject = function(fsId, parentObject= undefined) {
    var retObj = null;
    if (typeof fsId == 'object') {
        return fsId;
    }
    if (!fsId) {
        return null;
    }

    if (parentObject) {
        return XDOM.getHTMLObject(fsId, parentObject);
    }

    if (!retObj && SESSION.subScope) {
        retObj = XDOM.getHTMLObject(fsId, SESSION.subScope);
    }

    if (!retObj && SESSION.activeForm) {
        retObj = XDOM.getHTMLObject(fsId, SESSION.activeForm.document);
    }

    if (!retObj && SESSION.activeFrame) {
        retObj = XDOM.getHTMLObject(fsId, SESSION.activeFrame.document);
    }

    if (!retObj && SESSION.activePage && SESSION.activePage.dom) {
        retObj = XDOM.getHTMLObject(fsId, SESSION.activePage.dom);
    }

    if (!retObj) {
        retObj = XDOM.getHTMLObject(fsId, document);
    }

    if (!retObj && parent) {
        retObj = XDOM.getHTMLObject(fsId, parent.document);
    }

    return retObj;
};

XDOM.getHTMLObject = function(id, doc) {
    var ret = null;
    if (!doc) {
        return null;
    }
    if (doc && doc.getElementById) {
        ret = doc.getElementById(id);
    } else if (document.all) {
        ret = doc.all[id];
    } else if (document.layers) {
        ret = doc.layers[id];
    } else if (doc) {
        ret = doc[id];
    }
    //voor stateless
    if (!ret && doc.querySelector) {
        ret = doc.querySelector("[id='" + id + "']");
    }
    return ret;
};

XDOM.getEvent = function(e, ieWindow) {
    if (SESSION.activeFrame) var win = null;
    var foEvent = e;
    if (!foEvent) {
        if (ieWindow) {
            win = ieWindow;
        } else if (PFMBOX && SESSION.activeFrame) {
            win = SESSION.activeFrame;
        } else {
            win = window;
        }
        if (win) {
            foEvent = win.event;
        }
        if (!foEvent && !BrowserDetect.isFirefox) {
            foEvent = event;
        }
    }

    if (!foEvent) {
        return;
    } //-->
    var srcElement = foEvent.srcElement || foEvent.target;
    if (srcElement.readyState) {
        return;
        //als een event gelijk valt met een ajax call event kan dat problemen geven
        //zelfde moment dat er een response event gebeurd in dat geval is het eventSourceElement niet meer burikbaar voor de focus maar ook niet meer relevant
    }

    if (GLOBAL.eventObject) {
        GLOBAL.eventObject.cleanUp();
        GLOBAL.eventObject = null;
    }
    GLOBAL.eventObject = new XDOM.crossBrowserEvent(foEvent);

    //globals
    GLOBAL.eventSourceElement = GLOBAL.eventObject.srcElement;
    if (GLOBAL.eventSourceElement && GLOBAL.eventSourceElement.tagName) {
        GLOBAL.eventObjectTAG = GLOBAL.eventSourceElement.tagName.toUpperCase();
    } else {
        GLOBAL.eventObjectTAG = '';
    }
    GLOBAL.dataset = GLOBAL.eventSourceElement.dataset;
    SESSION.activePanel = XDOM.GLOBAL.getEditWindow();
    GLOBAL.charCode = GLOBAL.eventObject.keyCode;
    GLOBAL.char = GLOBAL.eventObject.char;
    XDOM.setScopeFromEvent();
    return GLOBAL.eventObject;
};

XDOM.getInnerText = function(obj) {
    if (obj.textContent || obj.textContent == '') {
        return obj.textContent;
    }
    return obj.innerText;
};

XDOM.setInnerText = function(id, value) {
    var foObj = XDOM.getObject(id);

    if (foObj) {
        if (BrowserDetect.isFirefox) {
            foObj.textContent = value;
        } else {
            foObj.innerText = value;
        }
    }
};

/**
 *
 * @param type
 * @param id
 * @param cssClassName
 * @returns HTMLElement
 */
XDOM.createElement = function(type, id, cssClassName) {
    var foElement = document.createElement(type);
    if (id) {
        foElement.id = id;
    }
    if (cssClassName) {
        foElement.className = cssClassName;
    }
    return foElement;
};

/**
 *
 * @param sText
 * @returns {text}
 */
XDOM.createTextNode = function(text) {
    return document.createTextNode(text);
};

XDOM.replaceAllChilds = function(node, newNode) {
    if (!node) {
        return;
    }
    if (node.hasChildNodes()) {
        while (node.childNodes.length >= 1) {
            node.removeChild(node.firstChild);
        }
    }
    node.appendChild(newNode);
};

XDOM.removeAllChilds = function(node) {
    if (!node) {
        return;
    }
    if (node.hasChildNodes()) {
        while (node.childNodes.length >= 1) {
            node.removeChild(node.firstChild);
        }
    }
};

XDOM.removeDOMObject = function(fObject) {
    var foObject = null;
    if (typeof fObject == 'string') {
        foObject = XDOM.getObject(fObject);
    } else {
        foObject = fObject;
    }
    if (foObject && foObject.parentNode) {
        foObject.parentNode.removeChild(foObject);
    }
};

XDOM.crossBrowserEvent = function(e) {
    this._event = e;
    this.clientX = e.clientX || e.pageX;
    this.clientY = e.clientY || e.pageY;
    this.srcElement = e.target || e.srcElement;
    this.currentTarget = e.currentTarget || e.srcElement;
    this.keyCode = e.charCode || e.keyCode || e.which;
    this.char = String.fromCharCode(this.keyCode);
    this.type = e.type;
    this.offsetX = e.offsetX;
    this.offsetY = e.offsetY;

    if (e.modifiers) {
        this.altKey = e.modifiers & Event.ALT_MASK;
        this.ctrlKey = e.modifiers & Event.CONTROL_MASK;
        this.shiftKey = e.modifiers & Event.SHIFT_MASK;
    } else {
        this.altKey = e.altKey;
        this.ctrlKey = e.ctrlKey;
        this.shiftKey = e.shiftKey;
    }
};

XDOM.crossBrowserEvent.prototype.cleanUp = function() {
    this._event = null;
    this.clientX = null;
    this.clientY = null;
    this.srcElement = null;
    this.currentTarget = null;
    this.keyCode = null;
    this.char = null;
    this.type = null;
    this.offsetX = null;
    this.offsetY = null;
    this.altKey = null;
    this.ctrlKey = null;
    this.shiftKey = null;
};

XDOM.crossBrowserEvent.prototype.cancel = function() {
    if (!this._event) {
        return false;
    }
    try {
        if (this._event.stopPropagation) {
            this._event.stopPropagation();
            this._event.preventDefault();
        } else {
            this._event.cancelBubble = true;
        }
        this._event.returnValue = false;
        return false;
    } catch (e) {
        return false;
    }

    return false;
};

XDOM.crossBrowserEvent.prototype.remapKeyCode = function() {
    GLOBAL.charCode = 505;
    this.keyCode = 505;
    this.char = '';
    if (BrowserDetect.isIE) {
        var foEvent = XDOM.getEvent();
        if (foEvent) {
            foEvent.keyCode = 505;
            foEvent.returnValue = false; //in verband met access denied in ie op event object
            //this._event.keyCode=505;
            //this._event.returnValue=false;
        }
    }
};

XDOM.cancelEvent = function(e) {
    if (e) {
        XDOM.getEvent(e);
    }

    if (GLOBAL.eventObject) {
        GLOBAL.eventObject.cancel();
    }
};

/**
 * geeft de huidige selectie terug
 * @returns {String}
 */
XDOM.getSelection = function(obj) {
    var txtObj = XDOM.getObject(obj);
    var selectedText = '';

    if (document.selection != undefined) {
        txtObj.focus();
        selectedText = document.selection.createRange().text;
    }

    if (selectedText == '' && hasValue(txtObj.selectionStart)) {
        selectedText = txtObj.value.substring(
            txtObj.selectionStart,
            txtObj.selectionEnd
        );
    }
    return selectedText;
};

XDOM.getStyle = function(fsID, styleProp) {
    var fsResult = '';
    var foObj = XDOM.getObject(fsID);
    if (foObj.currentStyle) {
        fsResult = foObj.currentStyle[styleProp];
    } else if (window.getComputedStyle) {
        fsResult = document.defaultView
            .getComputedStyle(foObj, null)
            .getPropertyValue(styleProp);
    }
    return fsResult;
};

XDOM.extendObject = function(subClass, baseClass) {
    function inheritance() {}

    inheritance.prototype = baseClass.prototype;
    subClass.prototype = new inheritance();
    subClass.prototype.constructor = subClass;
    subClass.baseConstructor = baseClass;
    subClass.superClass = baseClass.prototype;
    subClass.prototype._super = baseClass;
    baseClass.prototype.base = function(innerBaseClass, functionName) {
        var args = Array.prototype.slice.call(arguments, 2);
        return innerBaseClass.prototype._super.prototype[functionName].apply(
            this,
            args
        );
    };
};

XDOM.getObjectValue = function(obj) {
    var foField = XDOM.getObject(obj);
    var id = null;
    var value = '';

    if (!foField) {
        return null;
    } //-->}
    if (Mask.isMask(foField)) {
        id = foField.getAttribute('data-mask-target');
        if (id) {
            foField = XDOM.getObject(id);
        }

        if (foField.tagName == 'OUTPUT') {
            return foField.getAttribute('data-output-value').replace('&nbsp;', '');
        } else {
            return foField.value;
        }
    }

    if (foField.tagName == 'INPUT' || foField.tagName == 'TEXTAREA') {
        return foField.value;
    }

    if (foField.tagName == 'OUTPUT') {
        if (hasValue(foField.getAttribute('data-output-value'))) {
            value = foField.getAttribute('data-output-value').replace('&nbsp;', '');
        } else {
            value = foField.innerText;

            if (!value) {
                value = foField.textContent;
            }

            if (!value || (value && value.trim().length == 0)) {
                value = '';
            }
        }
        if (value && value.trim().length == 0) {
            return '';
        }
        return value;
    }

    if (isLogical(foField)) {
        return Logical.getObjValue(foField);
    }
    return foField.textContent;
};
/**
 * clears fields and set old-value
 * @param {string[]}fields
 */
XDOM.clearFields = function(fields=[]){
    fields.forEach(field=>XDOM.setObjectValue(field, ''));
}

XDOM.setObjectValue = function(obj, value, data) {
    var field = XDOM.getObject(obj);
    if (!field || !hasValue(value)) {
        return null;
    } //-->}
    value = value.toString();

    value = MaxScale.formatScaleOnly(field, value);

    if (field.tagName === 'OUTPUT') {
        if(field.getAttribute('data-thousand-separator')=='on'){
            value = formatThousand(value);
        }
        field.setAttribute('data-output-value', value.trim()); //voor css selectors
    } else {
        field.setAttribute('value', value.trim()); //voor css selectors
    }

    if (Mask.isMask(field)) {
        return Mask.setValue(field, value);
    }

    if (XDOM.getBooleanAttribute(field, 'data-unicode')) {
        value = XDOM.hexDecode(value); //transmit data as HEX
    }

    if (Logical.setObjValue(field, value)) {
        return;
    }

    switch (field.getAttribute('data-datatype')) {
        case '*MEMO':
            field.innerText = value;
            field.value = value;
            return;
            break;
        case '*LNK':
            return Link.setObjValue(field, value, data);
            break;
        case '*IMG':
            return oculusImage.setObjValue(field, value);
            break;
    }

    if (field.getAttribute('data-upload-base-id')) {
        return; //bij een upload kan geen waarde worden gezet
    }
    if (field.getAttribute('data-signature-name')) {
        return; //bij een signature kan geen waarde worden gezet
    }
    if (field.tagName == 'INPUT') {
        field.value = value;
        field.setAttribute('value', value.trim()); //voor css selectors
        return;
    }


    if (value == '' && field.tagName == 'OUTPUT') {
        field.innerHTML = '&nbsp;';
        return;
    }

    XDOM.setInnerText(field, value);
};

XDOM.getAxis = function(axis, recordNr) {
    var foRecord = XDOM.getObject('SFL_RCD' + recordNr);
    var foAxis = null;
    if (!foRecord) {
        return null;
    }
    foAxis = foRecord.querySelectorAll("[data-axis='" + axis + "']")[0];
    if (!foAxis) {
        foAxis = foRecord.querySelectorAll("[data-cell-axis='" + axis + "']")[0];
    }
    return foAxis;
};

XDOM.returnResolutionMode = function() {
    var resolution = MAIN.window
        .getComputedStyle(MAIN.document.body, ':after')
        .getPropertyValue('content');
    switch (resolution) {
        case 'fullHD':
        case "'fullHD'":
        case '"fullHD"':
            resolution = 'fullHD';
            break;
        case 'highDef':
        case "'highDef'":
        case '"highDef"':
            resolution = 'highDef';
            break;
        case 'high':
        case "'high'":
        case '"high"':
            resolution = 'high';
            break;
        case 'medium':
        case "'medium'":
        case '"medium"':
            resolution = 'medium';
            break;
        default:
            resolution = 'low';
            break;
    }
    return resolution;
};

XDOM.getAxisValue = function(axis, recordNr) {
    var foObj = XDOM.getAxis(axis, recordNr);
    return XDOM.getObjectValue(foObj);
};

XDOM.setAxisValue = function(axis, recordNr, value) {
    var foObj = XDOM.getAxis(axis, recordNr);
    XDOM.setObjectValue(foObj, value);
};

XDOM.getParentAttribute = function(obj, attribute) {
    var out = obj;
    var ret = '';

    if (!out) {
        return ret;
    }

    ret = obj.getAttribute(attribute) || '';

    while (out && out.parentNode && !ret) {
        out = out.parentNode;
        if (out.getAttribute) {
            ret = out.getAttribute(attribute);
        }
        if (ret) {
            return ret;
        }
    }
    return ret;
};

/**
 * @returns {HTMLElement} object that contains the css class
 * @param {HTMLElement} childe element
 * @param {String} classname
 */
XDOM.getParentByClass = function(obj, className) {
    var out = obj;
    while (out && out.parentNode) {
        out = out.parentNode;
        if (out.classList.contains(className)) {
            return out;
        }
    }
    return null;
};

XDOM.getParentByAttribute = function(obj, attribute) {
    var out = obj;
    while (out && out.parentNode && !out.getAttribute(attribute)) {
        out = out.parentNode;
    }
    if (out.getAttribute && out.getAttribute(attribute)) {
        return out;
    }
    return null;
};

XDOM.getParentByTagName = function(obj, tag) {
    let out = obj,
        tagName = tag.toUpperCase();

    if (!out) {
        return null;
    }
    while (out && out.parentNode && out.tagName) {
        if (out.tagName.toUpperCase() === tagName) {
            return out;
        }
        out = out.parentNode;
    }

    return null;
};

XDOM.getBrowserWindowSize = function() {
    var browserWidth = 0;
    var browserHeight = 0;

    if (typeof window.innerWidth == 'number') {
        browserWidth = window.innerWidth;
        browserHeight = window.innerHeight;
    } else if (
        document.documentElement &&
        (document.documentElement.clientWidth ||
            document.documentElement.clientHeight)
    ) {
        browserWidth = document.documentElement.clientWidth;
        browserHeight = document.documentElement.clientHeight;
    }

    return { width: browserWidth, height: browserHeight };
};

XDOM.cancelAndRemap = function(e) {
    if (e) {
        XDOM.getEvent(e);
    }
    if (GLOBAL.eventObject) {
        GLOBAL.eventObject.cancel();
        GLOBAL.eventObject.remapKeyCode();
    }
};

XDOM.clearSelection = function(e) {
    var objSelection = null;
    if ((objSelection = document.selection) && objSelection.empty) {
        objSelection.empty();
    } else {
        if (window.getSelection) {
            document.getSelection().removeAllRanges();
            document.getSelection().addRange(document.createRange());
        }
    }
};

/**
 * verkrijgt een attribute vanuit de GLOBAL.eventSourceElement
 */
XDOM.GLOBAL.getAttribute = function(name) {
    return XDOM.getAttribute(GLOBAL.eventSourceElement, name);
};
XDOM.GLOBAL.getBooleanAttribute = function(name) {
    return XDOM.getBooleanAttribute(GLOBAL.eventSourceElement, name);
};
/**
 * Sets the caret (cursor) position of the specified text field.
 * Valid positions are 0-obj.length.
 * @param obj
 * @param pos
 */
XDOM.setCursor = function(obj, pos) {
    if (!obj) {
        return;
    } //-->
    if (obj.createTextRange) {
        var textRange = obj.createTextRange();
        textRange.collapse(true);
        textRange.moveEnd('character', pos);
        textRange.moveStart('character', pos);
        textRange.select();
    } else if (obj.setSelectionRange) {
        obj.setSelectionRange(pos, pos);
    }
    return;
};

XDOM.getBooleanAttribute = function(obj, name) {
    var foObj = XDOM.getObject(obj);
    if (!foObj || !foObj.getAttribute) {
        return false;
    }

    var fsValue = foObj.getAttribute(name);

    if (fsValue == 'true') {
        return true;
    }
    if (fsValue == 'false' || fsValue == 'null') {
        return false;
    }
    if (fsValue) {
        return fsValue;
    }
    return false;
};

XDOM.classNameReplaceOrAdd = function(obj, classNameOld, classNameNew) {
    if (!obj) {
        return;
    }
    var fsNewClassName = null;
    if (obj.className.indexOf(classNameOld) > -1) {
        if (classNameOld != classNameNew) {
            fsNewClassName = obj.className.replace(classNameOld, classNameNew);
        } else {
            fsNewClassName = obj.className;
        }
    } else {
        fsNewClassName = obj.className + ' ' + classNameNew;
    }
    obj.className = fsNewClassName;
};

XDOM.classNameRemove = function(obj, classNameRemove) {
    var fsNewClassName = null;

    if (obj) {
        if (obj.className.indexOf(classNameRemove) > -1) {
            fsNewClassName = obj.className.replace(classNameRemove, '');
        }

        if (fsNewClassName) {
            obj.className = fsNewClassName.trim();
        }
    }
};

XDOM.insertAtCursor = function(foObj, fsValue) {
    if (document.selection) {
        foObj.focus();
        sel = document.selection.createRange();
        sel.text = fsValue;
    } else if (foObj.selectionStart || foObj.selectionStart == '0') {
        var startPos = foObj.selectionStart;
        var endPos = foObj.selectionEnd;
        foObj.value =
            foObj.value.substring(0, startPos) +
            fsValue +
            foObj.value.substring(endPos, foObj.value.length);
    } else {
        foObj.value += fsValue;
    }
};

XDOM.getEditWindow = function(id) {
    var foPanel = null;
    if (typeof id == 'string') {
        fsId = id;
    } else {
        fsId = XDOM.getAttribute(id, 'data-panel-id');
        if (!fsId) {
            fsId = XDOM.GLOBAL.getAttribute('data-for-panel');
        }
    }
    if (fsId && GUI.BasePanel) {
        foPanel = GUI.BasePanel.instances[fsId];
    }
    return foPanel;
};

XDOM.GLOBAL.getEditWindow = function() {
    return XDOM.getEditWindow(GLOBAL.eventSourceElement);
};

/**
 * Sets the caret (cursor) position of the specified text field.
 * Valid positions are 0-obj.length.
 * @param obj
 * @param pos

 XDOM.setCursor = function (obj,pos){
 if(!obj){return;} //-->
 if(obj.createTextRange){
 var textRange = obj.createTextRange();
 textRange.collapse(true);
 textRange.moveEnd('character',pos);
 textRange.moveStart('character',pos);
 textRange.select();
 }else if(obj.setSelectionRange){
 obj.setSelectionRange(pos,pos);
 }
 return;
 };
 */

/**
 * zet de focus op een veld nadat er gewisseld is van sessie
 * wordt aangeroepen vanuit het sessie object
 */

XDOM.focus = function(object, canselBlur) {
    XDOM.getEvent();
    var obj = XDOM.getObject(object);
    if (!obj) {
        return false;
    }

    if (
        obj.tagName !== 'INPUT' &&
        obj.tagName !== 'TEXTAREA' &&
        obj.tagName !== 'A' &&
        obj.constructor.name !== "Window"
    ) {
        return false;
    }

    if (obj.style.display == 'none' || obj.style.visibility == 'hidden') {
        return false;
    }
    //foObj.dataset.dontRegister = true;

    obj.focus();
    INP.select(obj);
    XDOM.setAttribute(obj, 'data-old-value', obj.value);
    SESSION.activePage.selectedObjectId = obj.id;

    return true;
};

XDOM.setSelection = function() {
    GLOBAL.selection = ENUM.selection.unKnown;
    var fiCarretPos = null;
    if (
        equals(GLOBAL.eventSourceElement.type, 'text') ||
        equals(GLOBAL.eventSourceElement.type, 'password')
    ) {
        if (hasValue(GLOBAL.eventSourceElement.selectionStart)) {
            if (
                XDOM.getSelection(GLOBAL.eventSourceElement) ==
                GLOBAL.eventSourceElement.value
            ) {
                GLOBAL.selection = ENUM.selection.all;
                return GLOBAL.selection;
            }
            fiCarretPos = getCaretPosition(GLOBAL.eventSourceElement);
            if (fiCarretPos == 0) {
                GLOBAL.selection = ENUM.selection.start;
                return GLOBAL.selection;
            }
            if (fiCarretPos == GLOBAL.eventSourceElement.value.length) {
                GLOBAL.selection = ENUM.selection.end;
                return GLOBAL.selection;
            }
            GLOBAL.selection = ENUM.selection.none;
            return GLOBAL.selection;
        }
    }
    return GLOBAL.selection;
};

XDOM.invokeClick = function(objIn) {
    let obj = XDOM.getObject(objIn);
    if (!obj) {
        return;
    }

    if (BrowserDetect.isSafari) {
        let event = document.createEvent('HTMLEvents');
        event.initEvent('click', true, true);
        obj.dispatchEvent(event);
        return;
    }

    obj.click();
    return;
};

XDOM.setOldvalue = function(id) {
    if (Array.isArray(id)) {
        for (let i = 0, l = id.length; i < l; i++) {
            XDOM.setOldvalue(id[i]);
        }
        return;
    }

    let obj = XDOM.getObject(id);
    if (!obj) {
        return;
    }
    obj.setAttribute('data-old-value', obj.value);
};

XDOM.forEach = function(selection, handler) {
    var collection = selection;
    if (typeof collection === 'string') {
        collection = XDOM.queryAll(selection);
    }

    for (var i = 0, l = collection.length; i < l; i++) {
        handler(collection[i], i);
    }
};

/**
 *
 * @param {array} arr
 * @returns {array} with only unique values
 */
XDOM.unique = function(arr) {
    return arr.filter(function(value, index, self) {
        return self.indexOf(value) === index;
    });
};

/**
 * parsed string naar json als deze niet goed gevormd is
 * zoals b.v. bij condHiddenLines of paramObject of snelzoek in edit/info windows
 * @param {type} stringToParse
 * @returns {JSON@call;parse.out}
 */
XDOM.parse = function(stringToParse) {
    if (typeof stringToParse !== 'string') {
        return stringToParse;
    }

    if (stringToParse == '') {
        return null;
    }

    var obj = JSON.parse('{"out":' + stringToParse.replaceAll("'", '"') + '}');
    if (obj) {
        return obj.out;
    }
    return null;
};

XDOM.clone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
};

XDOM.getFilledArray = function(value, nr) {
    var ret = [];
    for (var i = 0; i < nr; i++) {
        ret.push(value);
    }
    return ret;
};
XDOM.log = function(obj) {
    if (typeof obj === 'string') {
        console.log(obj);
        return;
    }
    console.log(JSON.stringify(obj));
};

XDOM.objectIsEqual = function(a, b) {
    if (!a || !b) {
        return false;
    }
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length !== bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
};

XDOM.setScopeFromEvent = function() {
    if (!window.Stateless) {
        return; //we zitten in het buitenste frame Stateless is hier niet bekend vandaar deze actie afbreken
    }
    var pageId = XDOM.getParentAttribute(
            GLOBAL.eventSourceElement,
            'data-stateless-page-id'
        ),
        page = Stateless.Page.get(pageId);
    Stateless.Page.setScope(page);
};

XDOM.Def2Attributes = function(definition) {
    let attributes = `  `;
    for (let key in definition) {
        if (typeof definition[key] != 'string') {
            continue;
        }
        attributes += ` data-option-${key}="${definition[key]}" `;
    }
    return attributes;
};

XDOM.Attributes2Def = function(obj) {
    if (!obj) {
        return {};
    }
    let definition = {},
        ds = obj.dataset || obj;
    for (let key in ds) {
        if (key.indexOf('option') == 0) {
            definition[key.replace('option', '').toUpperCase()] = ds[key];
        }
    }
    return definition;
};

XDOM.objectUnderModal = function(obj) {
    //zoek, en topview hebben geen tabdiv en staan dus nooit under modal
    if (obj.ownerDocument.getElementById('searchBody')) {
        //console.log('tabdiv is er niet');
        return false;
    }

    //onderstaande kijkt in een iframe boven die van het huidige object of er blockers aan staan
    let blockers = obj.ownerDocument.defaultView.parent.document.querySelectorAll(
        '[data-blocker="on"]'
    );
    //console.log(obj.dataset);
    if (blockers.length > 0) {
        // er staan blockers aan
        //  console.log('blockers');
        return true;
    }
    return false;
};

// Export XDOM globally for backward compatibility
if (typeof window !== 'undefined') {
    window.XDOM = XDOM;
}

export default XDOM;

