GUI.Input = function (obj) {
    GUI.Input.baseConstructor.call(this, obj);
    this.dataType = nullWhenEmpty(obj.dataType);
    this.blankWhenZero = nullWhenEmpty(obj.blankWhenZero);
    this.thousandSeparator = nullWhenEmpty(obj.thousandSeparator);
    this.decimalSeparator = ',';
    this.maxScaleSystemLimit = nullWhenEmpty(obj.maxScaleSystemLimit);
    this.maxScaleField = nullWhenEmpty(obj.maxScaleField);
    this.maxLength = nullOrInt(obj.maxLength);
    this.precision = nullOrInt(obj.precision);
    this.scale = nullOrInt(obj.scale);
    this.forFieldProgression = true;
};

XDOM.extendObject(GUI.Input, GUI.BaseInputObject);

/**
 * @override GuiBaseObject
 */
GUI.Input.prototype.init = function () {
    this.setDefaults();
    this.base(GUI.Input, 'init');
    //this.parentObject.fieldProgression.add(this);
    if (!this.blankWhenZero) {
        this.blankWhenZero = ENUM.blankWhenZero.blank;
    }

    if (!this.thousandSeparator) {
        this.thousandSeparator = ENUM.thousandSeparator.none;
    }
    if (this.thousandSeparator === ENUM.thousandSeparator.period) {
        this.decimalSeparator = ',';
    }
    if (this.thousandSeparator === ENUM.thousandSeparator.comma) {
        this.decimalSeparator = '.';
    }
    this.setValue();
};

/**
 * haalt de waarde op uit de dataset
 */
GUI.Input.prototype.setValue = function () {
    this.base(GUI.Input, 'setValue');
    if (this.dataType === ENUM.dataType.decimal) {
        if (this.blankWhenZero === ENUM.blankWhenZero.blank && isZero(this.value)) {
            this.value = '';
        }
    }
};

/**
 * voegd voor een numerieke waarde duizend tekens toe
 */
GUI.Input.prototype.formatNumber = function () {
    if (this.dataType !== ENUM.dataType.decimal) {
        return;
    }
    this.formatThousandSeparator();
    this.formatMaxScale();

};

GUI.Input.prototype.formatMaxScale = function () {
    if (!this.maxScaleField) {
        return;
    }
    var maxScale = this.getDataValue(this.maxScaleField);
    var foScale = formatMaxScale(this.value, this.maxScaleSystemLimit, maxScale, this.decimalSeparator);
    this.value = foScale.value;
    this.scaleCss = foScale.cssClass;

};


GUI.Input.prototype.formatThousandSeparator = function () {
    var fsSeparator = '';

    var fsDecimal = '';
    var fsInteger = '';
    var faNumber = null;
    var rgx = /(\d+)(\d{3})/;

    switch (this.thousandSeparator) {
        case    ENUM.thousandSeparator.period:
            fsSeparator = ".";
            break;
        case    ENUM.thousandSeparator.comma:
            fsSeparator = ",";
            break;
        case    ENUM.thousandSeparator.none:
            return;
    }


    faNumber = this.value.split(this.decimalSeparator);
    fsInteger = faNumber[0];
    fsDecimal = faNumber.length > 1 ? this.decimalSeparator + faNumber[1] : '';

    while (rgx.test(fsInteger)) {
        fsInteger = fsInteger.replace(rgx, '$1' + fsSeparator + '$2');
    }
    this.value = fsInteger + fsDecimal;
};

/**
 * @override GuiBaseObject
 * @returns HTMLDomObject
 */
GUI.Input.prototype.render = function () {
    this.dom.domObject = XDOM.createElement("INPUT", this.id, this.getCssClass());
    this.dom.domObject.name = this.id;
    this.dom.domObject.type = "text";
    this.dom.domObject.maxLength = this.maxLength;
    this.dom.domObject.setAttribute("data-panel-id", this.panelId);
    this.dom.domObject.setAttribute("data-prompt-field", false);
    this.dom.domObject.setAttribute("autocomplete", "off");
    this.dom.domObject.setAttribute("data-datatype", GUI.translateDefinition.dataTypeReverse[this.dataType]);
    this.dom.domObject.setAttribute("data-real-name", this.realName);
    this.dom.domObject.setAttribute("data-line", this.y);
    this.dom.domObject.setAttribute("data-xpos", this.x);
    this.dom.domObject.setAttribute("data-focus-action", "INP.handleOnFocus");
    this.dom.domObject.setAttribute("data-blur-action", "INP.handleOnBlur");

    this.dom.domObject.readOnly = !!this.isProtected;

    if(this.signed){
        this.dom.domObject.setAttribute("data-signed", "true");
    }



    GUI.events.register(this.dom.domObject);

    if (this.autoSubmit) {
        XDOM.setAttribute(this.dom.domObject, "data-autosubmit", "true");
    }

    if (this.isRequired) {
        var requiredSymbolObj = XDOM.createElement("span");
        requiredSymbolObj.setAttribute("data-line", this.y);
        requiredSymbolObj.setAttribute("data-xpos", this.x);
        requiredSymbolObj.setAttribute("data-required", "true");
        this.dom.domObject.appendChild(requiredSymbolObj);
    }


        XDOM.setAttribute(this.dom.domObject, "data-unicode", !!this.ucs2);
        XDOM.setAttribute(this.dom.domObject, "data-left-blank", !!this.leftBlank);
        XDOM.setAttribute(this.dom.domObject, "data-left-zero", !!this.LeftZero);
        XDOM.setAttribute(this.dom.domObject, "data-digits", !!this.digitsOnly);
        XDOM.setAttribute(this.dom.domObject, "data-alpha", !!this.Alpha);
        this.dom.domObject.setAttribute("data-to-upper", !!this.upperCase);

    FieldAttribute.setAttentionLevel(this);

    this.setDecimalPropertys();
    this.setPosAndDimentions();
    this.updateState();

    return this.dom.domObject;
};

/**
 * het zetten van eigeneschappen die speciaal voor *DEC datat types zijn
 */
GUI.Input.prototype.setDecimalPropertys = function () {
    if (this.dataType !== ENUM.dataType.decimal) {
        return;
    }

    this.dom.domObject.setAttribute("data-precision", this.precision);
    this.dom.domObject.setAttribute("maxlength", this.maxLength);
    this.dom.domObject.setAttribute("data-scale", this.scale);
    if (this.thousandSeparator) {
        this.dom.domObject.setAttribute("data-thousand-separator", "on");
    }
};

/**
 * @override GuiBaseObject
 */
GUI.Input.prototype.updateState = function () {
    let value = this.value
    this.base(GUI.Input, 'updateState');
    if (!this.dom.domObject) {
        this.dom.domObject = XDOM.getObject(this.id);
    }
    this.dom.domObject.className = this.getCssClass();

    if (this.dom.domObject.getAttribute("data-thousand-separator") === "on") {
        value = formatThousand(this.value);
    }




    this.dom.domObject.value = value;
    this.dom.domObject.setAttribute("value", value); //adding value as an attribute because of css

};


GUI.Input.prototype.updateByUser = function () {
    this.value = this.dom.domObject.value;
    this.base(GUI.Input, 'updateState');
    if (!this.dom.domObject) {
        this.dom.domObject = XDOM.getObject(this.id);
    }
    this.dom.domObject.className = this.getCssClass();
 };


/**
 * @override GuiBaseObject
 * @returns cssClasses
 */
GUI.Input.prototype.getCssClass = function () {
    fsCss = this.base(GUI.Input, 'getCssClass');
    fsCss += ' ' + this.dataType;
    return fsCss;
};


/**
 *
 * keyup handling
 * afhandelen speciale toetsen:
 * esc en f12 voor sluiten scherm
 * fieldprogression (pijltjes gebruik)
 * enter voor submit
 **/
GUI.Input.handleKeyUp = function (e) {
    XDOM.getEventObject(e);
};

/**
 *
 * onchange afhandeling
 * validatie
 * triggers?
 **/
GUI.Input.handleOnChange = function (e) {
    XDOM.getEventObject(e);
};

