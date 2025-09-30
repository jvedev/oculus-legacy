function FieldAttribute() {
};

/**
 * tijdelijke update actie later als ajaxi is geimplementeerd wordt dit rechtstreeks bij het zetten van de waarde in het object aangeroepen
 */
FieldAttribute.prepareDom = function () {

    var foPageObjects = XDOM.queryAll('[data-protected]');

    for (var i = 0, l = foPageObjects.length; i < l; i++) {
        FieldAttribute.protect(foPageObjects[i]);
    }
};


FieldAttribute.unHide = function (obj) {
    if (Mask.isPart(obj) && obj.parentElement.tagName == "DIV") {
        obj.parentElement.setAttribute("data-hidden", null)
    }
    if (isLogical(obj)) {
        Logical.unHide(obj);
    }
    obj.setAttribute("data-hidden", null)
};

FieldAttribute.hide = function (obj) {
    if (Mask.isPart(obj) && obj.parentElement.tagName == "DIV") {
        obj.parentElement.setAttribute("data-hidden", "true")
    }
    if (isLogical(obj)) {
        Logical.hide(obj);
    }
    obj.setAttribute("data-hidden", "true")
};

FieldAttribute.disable = function (obj) {
    obj.setAttribute("data-disable", "true")
};
FieldAttribute.enable = function (obj) {
    obj.setAttribute("data-disable", "false")
};

FieldAttribute.unProtect = function (foObj) {
//protected is set on a fieldset so buble through al lembeded items
    foObj.setAttribute("data-protected", null);
    if (foObj.tagName == 'FIELDSET') {
        FieldAttribute.unProtectFieldset(foObj)
        return;
    }
    var oParent = foObj.parentElement;
    foObj.readOnly = '';

    if (Mask.isPart(foObj) && oParent.tagName == "DIV") {
        oParent.setAttribute("data-protected", null);
    }
    if (isLogical(foObj)) {
        Logical.unProtect(foObj)
    }

    return;
};
FieldAttribute.unProtectFieldset = function (obj) {
    obj.querySelector(".fieldset-protection-div")?.remove();
}

FieldAttribute.protectFieldset = function (obj) {
    const protectionDiv = document.createElement("div");
    protectionDiv.className = "fieldset-protection-div";
    obj.append(protectionDiv);
}


FieldAttribute.protect = function (foObj) {
    // ***************************************************************************
    // Apply protection
    // parms:  this
    // return: --
    // ***************************************************************************
    var oParent = foObj.parentElement;
    //protected is set on a fieldset so buble through al lembeded items
    foObj.setAttribute("data-protected", "true");
    if (foObj.tagName == 'FIELDSET') {
        FieldAttribute.protectFieldset(foObj);
        return;
    }
    foObj.readOnly = 'readonly';


    //protect aan style toevoegen this onderdeel van een mask mask is
    if (Mask.isPart(foObj) && oParent.tagName == "DIV") {
        oParent.setAttribute("data-protected", "true");
    }

    if (isLogical(foObj)) {
        Logical.protect(foObj);
    }

    return;
};

FieldAttribute.setAttentionLevel = function (foObj) {

    if (foObj.fieldAttrAttention) {
        foObj.dom.domObject.setAttribute("data-attention-level", foObj.fieldAttrAttention);
    }

    return;
};