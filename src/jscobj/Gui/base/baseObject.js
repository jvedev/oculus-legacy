/* global GUI, ENUM */

/**
 * parent object voor Label,output objecten
 * @param obj data object die de eigenschappen van dit guiObject bevatten
 * @returns {GUI.BaseObject}
 */
GUI.BaseObject = function (obj) {

    /**
     * type object
     */
    this.type = nullWhenEmpty(obj.type);

    /**
     * id van object
     */
    this.id = nullWhenEmpty(obj.id);

    /**
     * x positie
     */
    this.x = nullOrInt(obj.xPosition);

    /**
     * y positie
     */
    this.y = nullOrInt(obj.yPosition);

    /**
     * breedte
     */
    this.width = nullOrInt(obj.xSize);

    /**
     * hoogte
     */
    if (obj.ySize) {
        this.height = nullOrInt(obj.ySize);
    }

    /**
     * hoogte
     */
    if (obj.lines) {
        this.height = nullOrInt(obj.lines);
    }

    /**
     * uitleining text
     */
    this.textAlign = nullWhenEmpty(obj.textAlign);

    /**
     * achtergrond kleur
     */
    this.backgroundColor = nullWhenEmpty(obj.backgroundColor);

    /**
     * text kleur
     */
    this.textColor = nullWhenEmpty(obj.textColor);

    this.textColorField = nullWhenEmpty(obj.textColorField);

    this.backgroundColorField = nullWhenEmpty(obj.backgroundColorField);


    /**
     * Tooltips
     */

    this.hintOrigin = nullWhenEmpty(obj.hintOrigin);
    this.hintVariable = nullWhenEmpty(obj.hintVariable);


    /**
     * indicatie veld voor het bepalen van attentionlevel
     */
    this.attentionLevel = new GUI.AttentionLevel(obj, this);


    /**
     * conditionalAttribute
     */
    this.conditionalAttributes = new GUI.ConditionalAttribute(obj, this);

    /**
     * geeft aan of element of element verborgen is
     */
    this.isHidden = nullWhenEmpty(obj.hidden);

    /**
     * geeft aan of element protected is
     */
    this.isProtected = nullWhenEmpty(obj.protected);

    /**
     * geeft aan of element getoond moet worden als label
     */
    this.showAsLabel = nullWhenEmpty(obj.showAsLabel);

    /**
     * indicatie veld voor het bepalen van fieldattribute attention
     */
    //this.attentionLevelField = nullWhenEmpty(obj.attentionLevelField);

    this.fieldAttrAttention = nullWhenEmpty(obj.fieldAttrAttention);


    /**
     * geeft aan of element onderstreept is
     */
    this.underline = nullWhenEmpty(obj.underline);

    /**
     * waarde van dit object;
     */
    this.value = nullWhenEmpty(obj.value);

    /**
     * textlevel ten behoeven van opmaak van labels
     */
    this.textLevel = nullWhenEmpty(obj.textLevel);

    /**
     * referentie naar de data voor deze pagina of dit panel;
     */
    this.currentData = null;


    /**
     * geeft aan of een negatieve numerieke waarde rood moet worden weergegeven
     */
    this.signed = obj.signed


    /**
     * geeft aan object USC2 gecodeerd wordt
     */
    this.ucs2 = obj.ucs2;

    /**
     * geeft aan object upper case wordt
     */
    this.upperCase = obj.upperCase

    /**
     * geeft aan object links aangevuld wordt met spaties
     */
    this.leftBlank = obj.leftBlank;

    /**
     * geeft aan object links aangevuld wordt met '0' characters
     */
    this.LeftZero = obj.LeftZero;

    /**
     * geeft aan object alleen getallen mag zijn
     */
    this.digitsOnly = obj.digitsOnly;

    /**
     * geeft aan object alleen alpha mag zijn
     */
    this.Alpha = obj.Alpha;

    /**
     * veld waar data vandaan komt
     */
    this.datafield = nullWhenEmpty(obj.dataField);

    /**
     * font size rangin from *S to *9XL
     */
    this.fontSize = nullWhenEmpty(obj.fontSize);

    /**
     * string die aan geeft of dit object onderdeel is van bepaald speciaal deel
     * van een scherm zoals benoemd in de enum GUI.DataSet.Part
     *
     */
    this.partOff = null;

    /**
     * regelnummer bij een multiline element
     */
    this.rowNumber = null;


    /**
     * helper voor het bepalen van css Classes
     */
    this.cssClass = new GUI.CssClass(this);

    /**
     * parentObject b.v. infowindow
     */
    this.parentObject = null;

    /**
     * verzameling dom objecten
     */
    this.dom = {};

    /**
     * buitenste dom object
     */
    this.dom.domObject = null;

    this.panelId = null;

    this.variable = nullWhenEmpty(obj.variable);

    this.fieldAttribute = nullWhenEmpty(obj.fieldAttribute);

    /**
     * alias fields
     *
     */
    this.aliasType = nullWhenEmpty(obj.aliasType);
    this.aliasField = nullWhenEmpty(obj.aliasField);
};


GUI.BaseObject.prototype.init = function () {

    if (!this.datafield) {
        this.datafield = this.id;
    }
    this.panelId = this.parentObject.panelId;
    this.id = this.panelId + '-' + this.id;
    this.setFieldAttributes();
};


GUI.BaseObject.prototype.setFieldAttributes = function () {

    if (!this.fieldAttribute) {
        return;
    }

    var attribute = null;
    for (var i = 0, l = this.fieldAttribute.length; i < l; i++) {
        attribute = this.fieldAttribute[i].trim();
        switch (attribute) {
            case "*AUTOSBM":
                this.autoSubmit = true;
                break;
            case "*UNDERLINE":
                this.underline = true;
                break;
            case "*HIDDEN":
                this.isHidden = true;
                break;
            case "*PROTECT":
                this.isProtected = true;
                break;
            case '*LBL':
                this.showAsLabel = true;
                break;
            case "*MSG":
            case "*INF":
            case "*ATN":
            case "*ALR":
            case "*ERR":
                this.fieldAttrAttention = ENUM.attentionLevelToCode[attribute];
                break;
        }
    }
};


/**
 * geeft waarde terug van dit guiObject
 * @returns waarde van dit guiObject
 */
GUI.BaseObject.prototype.getValue = function () {
    return this.value;
};

/**
 * wijst nieuwe waarde toe aan dit guiObject en voerd daarna een update uit.
 * als er geen value als argument wordt meegegeven wordt de data uit de  this.currentData gehaald
 * @param value
 */
GUI.BaseObject.prototype.setValue = function (value) {
    if (value) {
        this.value = value;
    } else {
        this.value = this.getDataValue(this.datafield);
    }

    if (this.ucs2) {
        this.value = XDOM.hexDecode(this.value);
    }

    if (!this.value) {
        this.value = '';
    }
};

/**
 * geeft waarde terug van de line of multi line data afhankelijk van of het element multiline is
 * @param field
 * @returns {string} data
 */
GUI.BaseObject.prototype.getDataValue = function (field) {
    if (!this.currentData) {
        return '';
    }
    return this.currentData[field];
};

/**
 * inititaliseerd default waarden als deze niet zijn ge definieerd
 */
GUI.BaseObject.prototype.setDefaults = function () {
    if (!this.datafield) {
        this.datafield = this.id;
    }
};

/**
 * steld de x,y en breedte in van het dom.domObject
 */
GUI.BaseObject.prototype.setPosAndDimentions = function () {
    this.parentObject.setPosAndDimentions(this);

};

/**
 * verkrijgt de CSS style CLass op basis van type en zaken geregeld in het in cssClass Objectt
 * @see GUI.CssClass (GUI/helper/CssClass.js)
 * @returns {String}
 */
GUI.BaseObject.prototype.getCssClass = function () {
    return this.type + ' ' + this.cssClass.getClass();
};


/**
 * past dit guiObject aan wat beterft uiterlijk  op basis van de op dat moment voorhande zijnde data
 */
GUI.BaseObject.prototype.updateState = function () {
    this.attentionLevel.update();
    this.conditionalAttributes.update();
    this.updateDataAttribute();
    //this.setInlineColors();
};


GUI.BaseObject.prototype.updateDataAttribute = function () {
    //when fontsize is set add it as an attribute
    if(this.fontSize){
        this.dom.domObject.setAttribute("data-font-size", this.fontSize)
    }

    if(!this.value){
        return;
    }

    if(this.leftBlank && this.maxLength){
        this.value=this.value.lftzro(this.maxLength);
    }

    if(this.LeftZero && this.maxLength){
       this.value=this.value.lftzro(this.maxLength);
    }


}

GUI.BaseObject.prototype.setAlias = function(icon){
    if(!this.aliasType) return null;
    switch(this.aliasType){
        case "*VAR":
            icon.innerHTML = this.getDataValue(this.aliasField);
            icon.classList.add("label-icon");
            break;
        case "*LBL":
            icon.innerHTML = this.parentObject.captions.get(this.aliasField);
            icon.classList.add("label-icon");
            break;
        case "*ICON":
            //get the store because this is a costly operation
            //the store wil only be created once in the main part of oculus
            const store = SCOPE.main.icons.getIconStore();
            const cssClass = store[this.aliasField.toUpperCase()] || "";
            icon.classList.add("fa","icon", cssClass);

            break;
    }
    icon.classList.remove("pth-icon","pth-infoProgram","pth-editProgram","editProgram","infoProgram");
    icon.setAttribute("data-button-icon","")

}


/**
 * past object aan op basis van de data
 * @param data
 */
GUI.BaseObject.prototype.update = function (data) {
    this.currentData = data;
    this.setValue();
    this.updateState();


    this.setInfoTitles();
};

GUI.BaseObject.prototype.afterAppend = function () {

};

GUI.BaseObject.prototype.getColor = function (field) {
    let color = this.getDataValue(field);
    return GUI.translateDefinition.color[color] || color;
}

GUI.BaseObject.prototype.setInfoTitles = function () {
    var titleString = "";
    var shortLink = null;
    if (this.dom.domObject && this.hintOrigin && this.hintVariable) {
        switch (this.hintOrigin) {
            case "*VAR":
                titleString = this.parentObject.data[this.hintVariable];
                break;
            case "*LBL":

                shortLink = this.parentObject.captions;
                if (shortLink.userCaptions && hasValue(shortLink.userCaptions[this.hintVariable])) {
                    titleString = shortLink.userCaptions[this.hintVariable];
                }

                if (shortLink.defaultCaptions && hasValue(shortLink.defaultCaptions[this.hintVariable])) {
                    titleString = shortLink.defaultCaptions[this.hintVariable];
                }
                break;
        }
        GUI.infoTitle.register(this.dom.domObject, titleString);
    }
};