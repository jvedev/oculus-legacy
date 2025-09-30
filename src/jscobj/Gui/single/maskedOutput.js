GUI.MaskedOutput = function (obj) {
    GUI.MaskedOutput.baseConstructor.call(this, obj);
    this.type = 'maskedOutput';
    this.mask = obj.editMask;
};

XDOM.extendObject(GUI.MaskedOutput, GUI.BaseObject);


GUI.MaskedOutput.isOutputMask = function (foField, foData) {
    if (foData && foData.editMask) {
        foField.isMask = true;
        foField.editMask = foData.editMask;
        foField.validateMask = foData.validateMask;
    }

    return;
};

/**
 * @override GuiBaseObject
 */
GUI.MaskedOutput.prototype.init = function () {
    this.setDefaults();
    this.setValue();
};

/**
 * haalt de waarde op uit de dataset
 */
GUI.MaskedOutput.prototype.setValue = function () {
    this.base(GUI.Output, 'setValue');
};

/**
 * @override GuiBaseObject
 * @returns HTMLDomObject
 */

GUI.MaskedOutput.prototype.render = function (showInSubfile) {
    this.dom.domObject = XDOM.createElement("output", this.id);
    this.dom.domObject.setAttribute("data-mask", this.mask);

    if (this.parentObject) {
        this.setPosAndDimentions();
    }


    Mask.renderOutput(this.dom.domObject);
    this.updateState();


    if (showInSubfile) {
        [...this.dom.domObject.querySelectorAll("*")].forEach(obj => obj.addEventListener('click', Table.rowClickHandler));
        this.dom.domObject.addEventListener('click', Table.rowClickHandler)
        XDOM.classNameReplaceOrAdd(this.dom.domObject, 'maskInSubfile', 'maskInSubfile');
    }


    return this.dom.domObject;
};


/**
 * @override GuiBaseObject
 */
GUI.MaskedOutput.prototype.updateState = function () {
    this.base(GUI.Output, 'updateState');
    if (!this.dom.domObject) {
        this.dom.domObject = XDOM.getObject(this.id);
    }
    this.dom.domObject.className = this.getCssClass();
    Mask.setValue(this.dom.domObject, this.value);
};

GUI.MaskedOutput.prototype.getCssClass = function () {
    var fsCss = 'outputMask ' + this.base(GUI.MaskedOutput, 'getCssClass');
    return fsCss;
};




