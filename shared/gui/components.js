/* GUI Components - Graphical User Interface Components */
/* Extracted from session/functions.js for modularization */

/**
 * GUI - Modular GUI components for forms, panels, and interface elements
 * Provides factory methods and base classes for UI components
 */

GUI.factory = {};
GUI.factory.get = function(obj,parentObject ){
    var foObj = null;
    GUI.translateDefinition(obj);
    if(!(obj && obj.type)){
        return;
    }

    switch(obj.type){
        case 'output':
            if(obj.dataType == ENUM.dataType.logical){
                foObj =  new GUI.LogicalOut(obj);
                break;
            }
            if(obj.dataType == ENUM.dataType.link){
                foObj =   new GUI.Link(obj);
                break;
            }
            if(obj.dataType == ENUM.dataType.memo){
                foObj =   new GUI.MemoOut(obj);
                break;
            }
            if(nullWhenEmpty(obj.editMask)!=null){
                foObj =   new GUI.MaskedOutput(obj);
                break;
            }
            foObj =   new GUI.Output(obj);
            break;
        case 'input':

            if(nullWhenEmpty(obj.editMask)!=null){
                foObj =   new GUI.MaskedInput(obj);
                break;
            }

            if(obj.dataType == ENUM.dataType.memo){
                foObj =   new GUI.MemoIn(obj);
                break;
            }


            if(obj.dataType == ENUM.dataType.logical){
                foObj =   new GUI.LogicalIn(obj);
                break;
            }

            if(obj.fieldAttribute=="*HIDDEN"){
                foObj =   new GUI.Hidden(obj);
                break;
            }

            foObj =   new GUI.Input(obj);
            break;
        case 'hiddenInput':
            foObj =   new GUI.Hidden(obj);
            break;
        case 'chart':
            foObj =   new GUI.Chart(obj);
            break;
        case 'label':
            foObj =   new GUI.Label(obj);
            break;
        case 'image':
            foObj =   new GUI.Image(obj);
            break;
        case 'constant':
            foObj =   new GUI.Constant(obj);
            break;
        case 'dataset':
            foObj =   new GUI.DataSet(obj);
            break;
        case 'serviceChoice':
            foObj =   new GUI.ChoiceService(obj);
            break;
        case 'serviceDisplay':
            foObj =   new GUI.DisplayService(obj);
            break;
        case 'serviceRetrieve':
            foObj =   new GUI.Retrieve(obj);
            break;
        case 'CalendarChoice':
            foObj =   new GUI.Calendar(obj);
            break;
        case 'sessionLauncher':
            foObj =   new GUI.SessionLauncher(obj);
            break;
        case 'quickSearch':
            foObj =   new GUI.QuickSearch(obj);
            break;
        case 'queryList':
            foObj =   new GUI.QueryList(obj);
            break;
        case 'infoProgram':
            foObj =   new GUI.InfoWindowIcon(obj);
            break;
        case 'editProgram':
            foObj =   new GUI.EditWindowIcon(obj);
            break;
        case 'unauthorized':
        case 'notAuthorized':
        case 'CommandButton':
            return null;
            break;
        default:
            console.log('onbekend gui object:');
            console.log(obj);
            return null;
    }

    foObj.parentObject = parentObject;
    return foObj;
};

/* baseObject */
/* Load Timestamp 13:59:55.649 */
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
/* baseInputObject */
/* Load Timestamp 13:59:55.650 */
/**
 * parent object voor input objecten
 * @param obj data object die de eigenschappen van dit guiObject bevatten
 * @returns {GUI.BaseObject}
 */
GUI.BaseInputObject = function(obj){
    GUI.BaseInputObject.baseConstructor.call(this,obj);
    this.dataType = nullWhenEmpty(obj.dataType);
    this.name = null;
    this.realName = obj.id;
    this.parentId = null;
    this.autoSubmit = false;
    this.forFieldProgression = false;
};

XDOM.extendObject(GUI.BaseInputObject, GUI.BaseObject);

GUI.BaseInputObject.prototype.init = function(){
    this.base(GUI.BaseInputObject, 'init');
    this.name = this.id;
    this.macroName = this.parentObject.macroName;
};
GUI.BaseInputObject.setOldValue = function(){
    XDOM.GLOBAL.setAttribute("data-old-value", GLOBAL.eventSourceElement.value);
};








/* basePanel */
/* Load Timestamp 13:59:55.650 */
GUI.BasePanel = function () {
    this.id = null;
    this.dom = {};
    this.dom.domObject = null;
    this.definition = null;
    this.guiObjects = [];
    this.currentData = null;
    this.captions = null;
    this.services = {};
    this.data = null;
    this.subfileData = null;
    this.header = null;
    this.cssClass = 'popup-panel';
    this.cssPosition = '';
    this.setSize = true;
    this.dataSet = null;
    this.sizes = {};
    this.macroName = null;
    this.panelId = null;
    /**
     * y locatie van paneel
     */
    this.sizes.yPos = 0;
    /**
     * x locatie van panel
     */
    this.sizes.xPos = 0;

    /**
     * hoogte van parent element per regel
     */
    this.sizes.parentRowHeight = 100 / 24;
    /**
     * hoogte van header in regels
     */
    this.sizes.HeaderRowHeight = 1.1;
    /**
     * hoogte van header + footer RKR
     */
    this.sizes.fixedHeaderHeight = 0;
    this.sizes.fixedFooterHeight = 30;

    /**
     * hoogte van panel in procenten
     */
    this.sizes.panelHeight = 0;
    /**
     * breedte van panel in procenten
     */
    this.sizes.panelWidth = 0;
    /**
     * hoogte van body in procenten van de panel div
     */
    this.sizes.bodyHeight = 0;

    /**
     * hoogte van 1 regel in pixels binnen de panel body in procenten
     */
    this.sizes.lineHeightPx = 20;

    /**
     * breedte van 1 colomn binnen de panel body in pixels
     */
    this.sizes.colWidthPx = 9;

    /**
     * breedte van 1 colomn binnen de panel body in procenten
     */
    this.sizes.colWidth = 0;

    /**
     * aantal regels in de body
     */
    this.sizes.panelRows = 0;
    /**
     * aantal colommen in de body
     */
    this.sizes.panelCols = 0;

    /**
     * top padding in de body in pixels
     */
    this.sizes.panelBodyTopPadding = 10;

    /**
     * bottom padding in de body in pixels
     */
    this.sizes.panelBodyBottomPadding = 10;

    this.sizes.footerHeight = 30;


    this.rowHeight = 0;

    this.isInitialised = false;

    this.isVisible = false;


    /**
     * kind of panel modal|subview
     */
    this.screenMode = null;

    /**
     * info of update
     */

    this.windowType = "info";

    this.placeHolder = null;
    this.footer = null;

    this.useCache = SESSION.session.debugMode;

};

GUI.BasePanel.prototype.calculateDimentions = function () {
    var panelWidth = "";
    panelWidth = this.sizes.panelCols.toString();
    this.sizes.panelWidth = panelWidth.lftzro(3);
    this.sizes.colWidth = 100 / this.sizes.panelCols;
    this.sizes.perc = {};
    this.sizes.panelBodyRows = this.sizes.panelRows - .5;

    if (this.header) {
        this.sizes.headerHeight = this.sizes.lineHeightPx * this.sizes.HeaderRowHeight;
        this.sizes.panelHeight = this.sizes.headerHeight;
    }
    this.sizes.bodyHeight = this.sizes.panelBodyRows * this.sizes.lineHeightPx;
    this.sizes.bodyHeight += this.sizes.panelBodyBottomPadding;
    this.sizes.bodyHeight += this.sizes.panelBodyTopPadding;
    this.sizes.panelHeight += this.sizes.bodyHeight;
    if (this.windowType == "edit") {
        this.sizes.panelHeight += this.sizes.footerHeight;
    }
    this.sizes.bodyHeight += 'px';
    this.sizes.panelHeight += 'px';
    this.sizes.headerHeight += 'px';
    this.sizes.perc.BodylineHeight = 100 / this.sizes.panelBodyRows;
};

/**
 * voor subview schermen met een data set geld de volgende regel: - alle regels onder de dataset worden tegen de
 * onderkant gepositioneerd - de subfile krijgt alle ruimte tussen de boven kant van de subFile en de laatste regel
 */
GUI.BasePanel.prototype.repositionElements = function () {
    var fiMaxLineNumber = this.dataSet.y + this.dataSet.height;
    var fiStopRow = null;
    var foObject = null;
    var fiOffSet = null;
    var fiPlaceHolderRows = floor(this.placeHolder.offsetHeight / this.sizes.lineHeightPx, 0);
    fiPlaceHolderRows -= 2;

    // bepaal de maximale regel op basis van .y en .height
    for (var id in this.guiObjects) {
        foObject = this.guiObjects[id];
        if (foObject == this.dataSet) {
            continue;
        } // sluit de dataset zelf uit
        fiStopRow = foObject.y;
        if (foObject.height) {
            fiStopRow += foObject.height;
        }
        if (fiMaxLineNumber < fiStopRow) {
            fiMaxLineNumber = fiStopRow;
        }
    }
    fiOffSet = fiPlaceHolderRows - fiMaxLineNumber;
    this.dataSet.resetHeight(fiOffSet);

    if (fiMaxLineNumber <= this.dataSet.y) {
        // geen elementen onder de data set
        return;
    }

    // fiOffSet berkenen op basis van het maximaal aantal regels - fiMaxLineNumber in de fieldset
    // alle element die een y hoger dan dataset hebben worden geherpositioneerd op basis van de offset
    for (var id in this.guiObjects) {
        foObject = this.guiObjects[id];
        if (foObject.y > this.dataSet.y) {
            foObject.y += fiOffSet;
        }
    }

};

GUI.BasePanel.prototype.authHidden = function(obj) {
    const authorization = this.authorizationFields?this.authorizationFields[obj.toId]:null;

    if(!authorization) {
        return false;
    }

    if(authorization.authorizationLevel == ENUM.authorizationLevel.hidden){
        return true;
    }
    //always hide when an authorisation is set for these types
    return ["CalendarChoice", "serviceChoice", "serviceDisplay", "serviceRetrieve"].includes(obj.type)
}

GUI.BasePanel.prototype.init = function (response) {
    if (this.isInitialised) {
        return;

    } // initialisatie heeft al plaats gevonden
    this.sizes.panelRows = parseInt(this.definition.ySize);
    this.sizes.panelCols = parseInt(this.definition.xSize);
    if (this.definition.title) {
        this.header = new GUI.PanelHeader(this.definition, this);
    }
    var faElements = this.definition.elements;
    var faUnauthorizedObject = this.authorizationFields;

    var foObjDev = null;
    var foGuiObject = null;
    var fsObjToId = null;
    var authorizationObj = null;
    this.calculateDimentions();

    for (var i = 0, l = faElements.length; i < l; i++) {
        foObjDev = faElements[i];

        if(this.authHidden(foObjDev)){
            continue;
        }


        foGuiObject = GUI.factory.get(foObjDev, this);
        if (!foGuiObject) {
            continue;
        }
        if (foGuiObject.type == "dataset") {
            foGuiObject.subfileData = this.subfileData;
            foGuiObject.currentData = this.data;
            this.dataSet = foGuiObject;
        } else {
            foGuiObject.currentData = this.data;
        }
        foGuiObject.init();
        this.guiObjects[foGuiObject.id] = foGuiObject;
    }

    if (this.windowType == "edit") {
        this.footer = new GUI.EditWindowFooter(this);
        this.footer.init();
        // this.guiObjects["footer"]=this.footer;
    }

    this.isInitialised = true;
};

/**
 * huidige active instantie
 */
GUI.BasePanel.currentInstance = null;

/**
 * response data
 */
GUI.BasePanel.response = null;

/**
 * vertaald positie nummer naar pixels
 *
 * @param nr
 * @returns {String}
 */
GUI.BasePanel.prototype.getXPosPerc = function (nr) {
    return this.getXPos(nr) + "%";
};
/**
 * vertaald positie nummer naar pixels
 *
 * @param nr
 * @returns {String}
 */
GUI.BasePanel.prototype.getYPosPerc = function (nr) {
    // return this.getYPos(nr-1) + "%";
    return floor((nr - 0.75) * this.sizes.perc.BodylineHeight, 2) + "%";
};

GUI.BasePanel.prototype.getYPosPX = function (nr) {
    return this.getYPos(nr - 1) + "PX";
};

/**
 *
 * vertaald positie nummer naar pixels
 *
 * @param nr
 * @returns {String}
 */
GUI.BasePanel.prototype.getWidthPerc = function (nr) {
    return this.getWidth(nr) + "%";
};

/**
 * vertaald positie nummer naar pixels
 *
 * @param nr
 * @returns {String}
 */
GUI.BasePanel.prototype.getHeightPerc = function (nr) {
    return floor(nr * this.sizes.perc.BodylineHeight, 2) + "%";
};

/**
 * vertaald positie nummer naar percentage
 *
 * @param nr
 * @returns {Number}
 */
GUI.BasePanel.prototype.getHeight = function (nr) {
    return floor(nr * this.sizes.lineHeight, 2);
};
/**
 * vertaald positie nummer percentage
 *
 * @param nr
 * @returns {Number}
 */
GUI.BasePanel.prototype.getWidth = function (nr) {
    return floor(nr * this.sizes.colWidth, 2);
};
/**
 * vertaald positie nummer naar pixels
 *
 * @param nr
 * @returns {Number}
 */
GUI.BasePanel.prototype.getXPos = function (nr) {
    return floor(nr * this.sizes.colWidth, 2);
};
/**
 * vertaald positie nummer naar pixels
 *
 * @param nr
 * @returns {Number}
 */
GUI.BasePanel.prototype.getYPos = function (nr) {
    return floor((nr * this.sizes.lineHeight) + this.sizes.panelBodyTopPadding, 2);
};
/**
 * vertaald positie nummer naar pixels
 *
 * @param nr
 * @returns {Number}
 */
GUI.BasePanel.prototype.getWidthPx = function (nr) {
    //var fiTotalWidth = this.dom.body.offsetWidth;
    //var fiColWidth = fiTotalWidth / this.sizes.panelCols;
    return (nr * this.sizes.colWidthPx) + 'px';
};

/**
 * vertaald positie nummer naar pixels
 *
 * @param nr
 * @returns {String}
 */
GUI.BasePanel.prototype.getHeightPx = function (nr) {
    return (nr * this.sizes.lineHeightPx) + this.sizes.panelBodyTopPadding + 'px';
};

/**
 * steld de x,y en breedte in van het dom.domObject
 *
 * @param obj
 */
GUI.BasePanel.prototype.setPosAndDimentionsPerc = function (obj) {
    obj.dom.domObject.style.left = this.getXPosPerc(obj.x);
    obj.dom.domObject.style.top = this.getYPosPerc(parseInt(obj.y));
    if (this.setSize) {
        if (obj.width) {
            obj.dom.domObject.style.width = this.getWidthPerc(obj.width);
        }
        //if (obj.height) {
        //obj.dom.domObject.style.height = this.getHeightPerc(obj.height);
        //}
    }
};

/**
 * steld de x,y en breedte in van het dom.domObject
 *
 * @param obj
 */
GUI.BasePanel.prototype.setPosAndDimentions = function (obj) {

    //obj.dom.domObject.style.left = this.sizes.colWidthPx * obj.x + 'px';
    //obj.dom.domObject.style.top = this.sizes.lineHeightPx * (obj.y - 0.5) + 'px';
    obj.dom.domObject.setAttribute("data-stateless-page-id", this.id);
    if (this.setSize) {
        if (obj.sizesInPixels) {
            if (obj.width) {
                obj.dom.domObject.style.width = this.sizes.colWidthPx * obj.width + 'px';
            }
            //if (obj.height) {
            //  obj.dom.domObject.style.height = this.sizes.lineHeightPx * obj.height + 'px';
            //}
        }
    }

    if (obj == this.dataSet && this.screenMode == GUI.BasePanel.screenMode.subview) {
        if (obj.widthPx) {
            obj.dom.domObject.style.width = obj.widthPx;
        }
        // obj.dom.domObject.style.width = this.dom.body.offsetWidth - (3 * this.sizes.colWidthPx) + "px";

    }
};

GUI.BasePanel.prototype.render = function () {
    if (this.isVisible && this.useCache) {
        return;
    }

    this.isVisible = true;
    this.dom.domObject = XDOM.createElement('DIV', this.panelId, this.cssClass + ' ' + this.cssPosition);
    fp.setIndex(this.dom.domObject);

    var callerObj = null;
    if (this.dom.icon) {
        callerObj = this.dom.icon;
        this.dom.domObject.setAttribute("data-stateless-panel-modi", XDOM.getAttribute(callerObj, "data-open-options"));
    }

    if (this.setSize) {
        if (this.screenMode != GUI.BasePanel.screenMode.subview) {
            //this.dom.domObject.style.height = this.sizes.panelHeight;
            this.dom.domObject.className += "xSizePanel" + this.sizes.panelWidth;
        } else {
            // aanpassen breedte van window:
            if (this.placeHolder.offsetWidth < this.sizes.panelCols * this.sizes.colWidthPx) {
                // de maat zoals die gedefinieerd is in de window is niet groot er wordt een scrollbar worden getoond de grote
                // wordt nu bepaald op basis van de definitie
                this.dom.domObject.style.width = (this.sizes.panelCols * this.sizes.colWidthPx) + 'px';
                this.placeHolder.style.overflowX = 'auto';
                if (this.dataSet) {
                    this.dataSet.width = this.sizes.panelCols - 3;
                }
            } else {
                if (this.dataSet) {
                    // de fieldset is groter of gelijk de dataset wordt uitgerekt over de hele beschikbare breedte
                    this.dataSet.widthPx = (this.placeHolder.offsetWidth - (3 * this.sizes.colWidthPx)) + "px";
                }
            }
            if (this.placeHolder.offsetHeight < this.sizes.panelRows * this.sizes.lineHeightPx) {
                //this.dom.domObject.style.height = (this.sizes.panelRows * this.sizes.lineHeightPx) + 'px';
                this.placeHolder.style.overflowy = 'auto';
            } else {
                //this.dom.domObject.style.height = '100%';
            }
        }
    }

    this.renderHeader();
    this.renderBody();
    this.renderFooter();

    return;
};

GUI.BasePanel.prototype.renderHeader = function () {
    if (this.header) {
        this.header.render();
    }
};
/*
 * TOEGEVOEGD DOOR RKR
 */
GUI.BasePanel.prototype.renderFooter = function () {
    if (this.footer) {
        this.dom.domObject.appendChild(this.footer.render());
        this.updateMessage();
    }
};
/*
 * ------------------------------------------------------------
 */
GUI.BasePanel.prototype.renderBody = function () {
    this.dom.body = XDOM.createElement('DIV', "panel-body-" + this.id, "panelBody");
    this.dom.bodyMargin = XDOM.createElement('DIV', null, 'panelMargin');

    // Loop to create and run after-append
    for (let id in this.guiObjects) {
        this.dom.bodyMargin.appendChild(this.guiObjects[id].render());
        this.guiObjects[id].afterAppend();
    }

    if (this.setSize && this.screenMode != GUI.BasePanel.screenMode.subview) {
        this.dom.body.style.height = this.sizes.bodyHeight;
    }

    this.dom.body.appendChild(this.dom.bodyMargin);
    this.dom.domObject.appendChild(this.dom.body);

    if (this.screenMode == GUI.BasePanel.screenMode.subview) {
        //var minusHeight = null;
        this.dom.body.setAttribute("data-panel-footer", "false");
        if (this.footer) {
            //minusHeight = this.sizes.fixedHeaderHeight + this.sizes.fixedFooterHeight;
            this.dom.body.setAttribute("data-panel-footer", "true");
        } //else {
        // minusHeight = this.sizes.fixedHeaderHeight;
        //}


        //this.dom.body.style.height = (this.placeHolder.offsetHeight - minusHeight) + "px";
    }
};

GUI.BasePanel.prototype.update = function () {
    for (var id in this.guiObjects) {
        if (this.guiObjects[id].type == 'dataset') {
            this.guiObjects[id].update(this.subfileData);
        } else {
            this.guiObjects[id].update(this.data);
        }
    }
    this.header.update();
};

GUI.BasePanel.instances = [];


GUI.BasePanel.focus = function (id) {
    if (Panel.instances[id].onFocus) {
        Panel.instances[id].onFocus();
    }
};

GUI.BasePanel.prototype.show = function () {
    if (this.isVisible) {
        return;
    }
    this.dom.domObject.setAttribute('data-forced', 'false');
    this.dom.domObject.setAttribute('data-hidden', 'false');
    this.alignPanel();
    this.isVisible = true;
};

GUI.BasePanel.prototype.alignPanel = function (response) {

    if (this.screenMode !== GUI.BasePanel.screenMode.subview) {
        let icon = XDOM.getObject(this.dom.icon.id);
        position = alignTo(this.dom.domObject, icon);
        this.dom.domObject.style.top = position.top + 'px';
        this.dom.domObject.style.left = position.left + 'px';
    }
}
GUI.BasePanel.prototype.close = function (delayed) {

    if (this.screenMode == GUI.BasePanel.screenMode.subview) {
        return;
    }
    let icon = XDOM.getObject(this.iconId);
    if (icon) {
        delete icon.dataset.openByClick;
    }

    if (this.dom.domObject) {
        this.dom.domObject.setAttribute('data-forced', delayed || "true");
    }


    if (!this.isVisible) {
        return;
    }
    if (this.dom.domObject) {
        this.dom.domObject.setAttribute('data-hidden', 'true');
    }
    this.isVisible = false;
};

GUI.BasePanel.close = function () {
    var id = XDOM.GLOBAL.getAttribute("data-eventarg-id");
    GUI.BasePanel.instances[id].close();
};

GUI.BasePanel.startDragging = function (e, id) {
    if (BrowserDetect.isIE || BrowserDetect.isSafari) {
        return;
    }

    var foEvent = XDOM.getEvent(e);
    var id = XDOM.GLOBAL.getAttribute("data-eventarg-id");
    if (foEvent.srcElement.id == "MEXIT") {
        return;
    }
    var foInstance = GUI.BasePanel.instances[id];
    Dragger.guiObject = foInstance;
    Dragger.domObject = foInstance.dom.domObject;
    GLOBAL.mouseKeyDown = true;
    Dragger.start(e);
};

GUI.BasePanel.prototype.getGuiObject = function (idIn) {
    var id = idIn.id || idIn;
    return this.guiObjects[id];
};
GUI.BasePanel.screenMode = {'modal': '*MODAL', 'subview': '*SUBVIEW'};


/* PanelHeader */
/* Load Timestamp 13:59:55.650 */
/**
 * GUI.Header ten behoeven van GUI.Panel
 */
GUI.PanelHeader = function(definition,panel){
    this.panel = panel;
    this.titleVariable = null;

    if(definition.titleOrigin=="*VAR"){
        //set titleVariable to indicate this is a variable title and where to find the text
        this.titleVariable = definition.titleVariable;
        this.title = panel.data[definition.titleVariable]
    } else{
        this.title = this.panel.captions.get(definition.title)
    }
};
/**
 * update caption for the panel header
 */
GUI.PanelHeader.prototype.update = function(){
    if(this.titleVariable){ //only when titleVariable is set other cases the header is inmutable
        //this.panel.dom.headerTitle.innerHTML = this.panel.data[this.titleVariable];
        this.panel.dom.headerTitle.childNodes[0].nodeValue = this.panel.data[this.titleVariable];
    }
}

/**
 * opbouwen vean header voor GUI.Panel
 */
GUI.PanelHeader.prototype.render = function(){
    var dom = this.panel.dom;
    var fsId = this.panel.panelId;

//opbouw elementen
    var fsDraggClass = ' dragable';
    var fsIconClass = '';
    if(BrowserDetect.isIE || BrowserDetect.isSafari || this.panel.screenMode == GUI.BasePanel.screenMode.subview){
        fsDraggClass = ''; // wordt niet ondersteund door ie
    }
    dom.header  = XDOM.createElement('DIV', fsId + "-header", "panelHeader theme-background-color" + fsDraggClass);
    dom.headerTitle = XDOM.createElement('DIV',null,"panelTitle");
    dom.headerTitleText = XDOM.createTextNode(this.title);

//opbouw dom boom
    dom.headerTitle.appendChild(dom.headerTitleText);

    if(this.panel.screenMode == GUI.BasePanel.screenMode.subview){
        if(this.panel.panelIconClass && this.panel.panelIconClass != ""){
            dom.headerTitleIcon = XDOM.createElement('i',null,'panelHeaderIcon '+ getFontPrefix(this.panel.panelIconGroup)+this.panel.panelIconClass);
            dom.header.appendChild(dom.headerTitleIcon);
        }
    }

    dom.header.appendChild(dom.headerTitle);

    if(this.panel.screenMode != GUI.BasePanel.screenMode.subview){
        //dom.exitIcon = XDOM.createElement('DIV','MEXIT','popup-close');
        dom.exitIcon = XDOM.createElement('i','MEXIT','popup-close pth-icon');

        dom.headerTitle.appendChild(dom.exitIcon);
        dom.exitIcon.setAttribute("data-click-action","GUI.BasePanel.close");
        dom.exitIcon.setAttribute("aria-hidden","true");
        dom.exitIcon.setAttribute("data-eventarg-id",this.panel.panelId);

        //adding drag event handlers
        dom.header.setAttribute("data-eventarg-id",this.panel.panelId);
        dom.header.setAttribute("data-mouseDown-action", "Dragger.start");
        dom.header.setAttribute("data-dragger-objId", this.panel.dom.domObject.id);
        dom.headerTitle.setAttribute("data-eventarg-id",this.panel.panelId);
        dom.headerTitle.setAttribute("data-mouseDown-action", "Dragger.start");
        dom.headerTitle.setAttribute("data-dragger-objId", this.panel.dom.domObject.id);


    }

    dom.domObject.appendChild(this.panel.dom.header);

//registreren van events

};

GUI.PanelHeader.prototype.setInfoTitle = function(){


};
/* InfoWindow */
/* Load Timestamp 13:59:55.651 */
GUI.InfoWindow = function(obj) {
    GUI.InfoWindow.baseConstructor.call(this);
    this.id = obj.getAttribute('data-info-id');
    this.iconId = obj.id;
    this.recordNumber = obj.getAttribute('data-record-number');
    this.screenMode = obj.getAttribute('data-screen-mode');
    this.triggerFields = obj.getAttribute('data-trigger-fields') + ' ' + obj.getAttribute('data-trigger-macros');
    this.environmentConditions  = obj.dataset.environmentConditions;
    this.requestFieldsArray = eval(obj.getAttribute('data-parm-object'));
    this.requestPrefix = obj.getAttribute('data-parm-prefix') || '';
    this.sourceLocation = obj.getAttribute('data-macro-location');
    this.macroName = obj.getAttribute('data-macro-name');
    this.fieldProgressionPartId = null;
    this.cssClass = 'info-panel popup-panel';
    this.openDelay = 300; // miliseconde waarna een infowindow opent door een hover op een input;
    this.closeDelay = 500; // miliseconde waarna een infowindow opent door een hover op een input;
    this.applyToRow = '*ALL';
    this.baseRequest = '';
    this.objectCount = '';
    this.dataOnly = false;
    this.eventsRegistered = false;
    this.timer = null;
    this.closeTimer = null;
    this.hovering = false;
    //this.openByHover = false;
    //this.requiredReturnFields = null;
    this.requiredOutputFields = '';
    this.requiredOutputBooleans = '';
    this.inSubfile = false;
    this.cellAxis = null;
    this.indicatorAxis = null;
    this.authorizationFields = null;
    this.condHiddenLines = [];

    this.panelBackgroundColor = '';
    this.panelIconGroup = 'fontAwesome';
    this.panelIconClass = '';

    this.panelId = 'p-' + this.iconId;

    //dubbele aanpassing waardoor infowindows niet meer worden gesloten.
    //if(this.recordNumber){
    //this.panelId += '-' + this.recordNumber;
    //}

    // if(GUI.BasePanel.instances[this.panelId]){
    // 	this.panelId = this.panelId+'_'+Object.keys(GUI.BasePanel.instances).length.toString();
    // }

    // obj.setAttribute('data-panel-id', this.panelId);
    //obj.setAttribute('data-panel-id-in-use', this.panelId);

    this.cacheKey = this.macroName + '-' + this.sourceLocation; // alle info windows met de zelfde macroName en sourceLocation
    // hebben de zelfde layout en hoeven daarom maar 1 keer gerenderd
    // worden
    if (this.triggerFields) {
        this.triggerFields = this.triggerFields.split(' ');
    } else {
        this.triggerFields = [];
    }
    GUI.BasePanel.instances[this.panelId] = this;
};

XDOM.extendObject(GUI.InfoWindow, GUI.BasePanel);
GUI.InfoWindow.renderCache = {};
GUI.InfoWindow.configCache = {};

GUI.InfoWindow.getWindow = function(obj) {
    var infoWindow = XDOM.getEditWindow('p-' + obj.id);
    if (infoWindow) {
        return infoWindow;
    }
    return new GUI.InfoWindow(obj);
};

GUI.InfoWindow.prototype.init = function() {
    let promise
    this.renderIcon();
    this.registerTrigger();
    if (this.screenMode === GUI.BasePanel.screenMode.subview) {
        promise = this.iniEmbed();
    } else {
        if (this.inSubfile) {
            this.registerSFLEvents();
        } else {
            this.registerEvents();
        }
    }
    GUI.BasePanel.instances[this.panelId] = this;
    return promise;
};

GUI.InfoWindow.prototype.registerTrigger = function() {
    var foThis = this;
    for (var i = 0, l = this.triggerFields.length; i < l; i++) {
        var invoker = this.triggerFields[i]; //var binnen scope in verband met doorgeven by value niet byref(pointer)
        const desc =   `edit or info window: ${this.macroName} is triggered by field change`;
        Trigger.register(invoker, 'panel' + this.id, 'GUI.InfoWindow.openByTrigger' + this.id, function() {
            GUI.InfoWindow.openByTrigger(foThis);
        }, desc);
    }
};

/**
 * sluit eventueel open quicksearch scherm en opent quickSearch
 * @param {type} FoInfoWindow
 * @returns {undefined}
 */
GUI.InfoWindow.openByTrigger = function(FoInfoWindow) {
    FoInfoWindow.request();
};
GUI.InfoWindow.prototype.checkRendered = function(){
    const body  = XDOM.getObject(this.iconId).parentNode.querySelector('.panelBody');
    if(body) { //excluding the meta div
        return;
    }
    if(this.dom.domObject){
        this.dom.domObject.remove();
        this.dom.domObject = null;
    }
    this.isInitialised = false;

}

GUI.InfoWindow.prototype.iniEmbed = function() {
    this.checkRendered();
    if (this.isInitialised) {
        this.dataOnly = true;
        return this.request();

    }

    this.clearCache();
    this.isVisible = false;
    if (!this.dom.icon) {
        this.cssClass = 'info-panel';
    }

    return this.request();
};

GUI.InfoWindow.prototype.clearCache = function() {
    GUI.InfoWindow.configCache[this.cacheKey] = null;
    GUI.InfoWindow.renderCache[this.cacheKey] = null;
    this.isInitialised = false;
    this.dataOnly = false;
};

GUI.InfoWindow.prototype.renderIcon = function(recordNumber) {
    var foObj = null,
        foIcon = null;
    var foTd = XDOM.getAxis(this.cellAxis, recordNumber);
    if (
        !foTd ||
        !(this.applyToRow === '*ALL' || isIn(recordNumber, this.applyToRow)) ||
        this.screenMode === GUI.BasePanel.screenMode.subview
    ) {
        return;
    }

    foIcon = XDOM.createElement('DIV', null, 'infoProgram');
    foTd.appendChild(foIcon);

    foIcon.setAttribute('data-panel-id', this.panelId);
    foIcon.setAttribute('data-record-number', recordNumber);
    foIcon.setAttribute('data-click-action', 'GUI.InfoWindow.handleClick');
    foIcon.setAttribute('data-mouseover-action', 'GUI.InfoWindow.handleMouseOver');
    foIcon.setAttribute('data-mouseout-action', 'GUI.InfoWindow.handleMouseOut');

    for (var a in foTd.childNodes) {
        foObj = foTd.childNodes[a];
        if (foObj.id) {
            XDOM.setAttribute(foObj, 'data-panel-id', this.panelId);
            XDOM.setAttribute(foObj, 'data-record-number', recordNumber);
            foObj.setAttribute('data-mouseover-action', 'GUI.InfoWindow.handleMouseOver');
            foObj.setAttribute('data-mouseout-action', 'GUI.InfoWindow.handleMouseOut');
        }
    }
};

GUI.InfoWindow.handleClick = function(e) {
    XDOM.cancelEvent(e);
    var recordNr = XDOM.GLOBAL.getAttribute('data-record-number');
    var foPanel = GUI.InfoWindow.getWindow(GLOBAL.eventSourceElement);
    GLOBAL.eventSourceElement.dataset.openByClick = true;
    // 3 times the king!
    if (foPanel?.dom?.domObject?.getAttribute('data-hidden')!='true') {
        return;
    }

    foPanel.close();
    foPanel.recordNumber = recordNr;
    foPanel.dom.icon = GLOBAL.eventSourceElement;

    foPanel.open();
    return false;
};

GUI.InfoWindow.handleMouseOver = function(e) {
    XDOM.getEvent(e);
    var foPanel = GUI.InfoWindow.getWindow(GLOBAL.eventSourceElement);
    foPanel.close();
    foPanel.dom.icon = GLOBAL.eventSourceElement;
    foPanel.handleMouseOver();
};

GUI.InfoWindow.handleMouseOut = function(e) {
    XDOM.getEvent(e);

    let foPanel = GUI.BasePanel.instances['p-' + GLOBAL.eventSourceElement.id];
    //var foPanel = GUI.InfoWindow.getWindow(GLOBAL.eventSourceElement);
    if (foPanel) {
        foPanel.handleMouseOut();
    }
};

GUI.InfoWindow.handlePanelClick = function() {
    let id = XDOM.GLOBAL.getAttribute('data-eventarg-id');
    let icon = XDOM.getObject(GUI.BasePanel.instances[id].iconId);
    icon.dataset.openByClick = true;

    //GUI.BasePanel.instances[id].openByHover = false;
};

GUI.InfoWindow.prototype.handleMouseOut = function() {
    this.hovering = false;
    let icon = XDOM.getObject(this.iconId);
    if (icon.dataset.openByClick == 'true') {
        return;
    }
    var fsCommand = "GUI.InfoWindow.closeDelayed('" + this.panelId + "')";
    this.closeTimer = setTimeout(fsCommand, this.closeDelay);
    this.cancelDelayedOpen();
};

GUI.InfoWindow.prototype.handleMouseOver = function() {
    var fsCommand = "GUI.InfoWindow.openDelayed('" + this.panelId + "')";
    this.hovering = true;
    GUI.BasePanel.instances[this.panelId] = this;
    this.timer = setTimeout(fsCommand, this.openDelay);
};

GUI.InfoWindow.closeDelayed = function(id) {
    let instance = GUI.BasePanel.instances[id];
    let icon = XDOM.getObject(instance.iconId);
    if (icon.dataset.openByClick != 'true') {
        instance.close('false');
    }
};

GUI.InfoWindow.openDelayed = function(id) {
    if (this.isVisible) {
        return;
    } // -->
    var instance = GUI.BasePanel.instances[id];
    if (instance.hovering) {
        //instance.openByHover = true;
        instance.request();
    }
};

GUI.InfoWindow.prototype.cancelDelayedOpen = function() {
    clearTimeout(this.timer);
    this.timer = null;
};



GUI.InfoWindow.prototype.open = function() {
    //this.openByHover = false;
    let icon = XDOM.getObject(this.iconId);
    icon.dataset.openByClick = 'true';

    if (this.isVisible) {
        return;
    } // -->
    this.cancelDelayedOpen();
    this.request();
};


/**
 * verkrijgt data
 * voor stateless pannels en statefull pannels is dit SESSION.activeData
 * maar voor aanroepen vanuit edit en info window gaat dit via de panel.data Gui
 */
GUI.InfoWindow.prototype.getPanelData = function() {
    let panelId = XDOM.getAttribute(this.iconId, 'data-panel-id'),
        panel = XDOM.getEditWindow(panelId);

    if (panel && panel.data) {
        return { headerData: panel.data };
    }
    return SESSION.activeData;
};

GUI.InfoWindow.prototype.buildParameterString = function() {
    var foField = null;
    var fsValue = '';
    var fsLocation = null;
    var constValue = null;
    var fsRequestUri = '&PRMLEN=' + this.requestFieldsArray.length;
    var fiRecordNr = null;
    var fieldObjName = '';
    var data = this.getPanelData();

    this.hasParams = false;

    for (var i = 0; i < this.requestFieldsArray.length; i++) {
        fieldObjName = this.requestPrefix + this.requestFieldsArray[i].field;
        fsRequestUri += '&PRM' + (i + 1) + '=';
        fsLocation = this.requestFieldsArray[i].location;
        foField = XDOM.getObject(fieldObjName);
        fiRecordNr = null;
        fsValue = '';

        if (!foField || (foField && foField.tagName !== 'INPUT')) {
            switch (fsLocation) {
                case 'headerData':
                    fsValue = encodeURIComponent(data.headerData[this.requestFieldsArray[i].field]);
                    break;
                case 'subfileData':
                    fiRecordNr = parseInt(this.recordNumber) - 1; //array begint bij 0 en recordnummer bij 1
                    if (fiRecordNr >= 0) {
                        foField = XDOM.getObject(fieldObjName + '_' + this.recordNumber);
                        if (!foField || (foField && foField.tagName !== 'INPUT')) {
                            fsValue = encodeURIComponent(data.subfileData[fiRecordNr][this.requestFieldsArray[i].field]);
                        }
                    }
                    break;
                case 'directValue':
                    fsValue = encodeURIComponent(this.requestFieldsArray[i].value);
                    break;
                default:
                    if(foField){
                        constValue = foField.getAttribute('data-const-value');
                        if (constValue) {
                            fsValue = constValue;
                        }
                    }
                    break;
            }
        }

        if (!foField) {
            foField = XDOM.getObject('trigger_' + fieldObjName);
        }

        if (foField) {
            if (foField === this.target) {
                fsValue = encodeURIComponent(this.selectionRequest);
            } else {
                if (!Validate.test(foField)) {
                    return 'invalid';
                }
                fsValue = encodeURIComponent(XDOM.getObjectValue(foField));
            }
        }

        if (fsValue) {
            this.hasParams = true;
        } else {
            fsValue = '';
        }
        fsRequestUri += fsValue;
    }
    return fsRequestUri;
};

GUI.InfoWindow.prototype.request = function() {
    GUI.InfoWindow.closeByMacroId(this.panelId);
    if (!this.useCache) {
        this.clearCache();
    }
    var fbAskLayout = !this.isInitialised;
    var fsrequestParams = this.buildParameterString();
    var fsrequiredString = '';
    var fsRequestUri =
        '/ndscgi/' +
        this.sourceLocation +
        '/ndmctl/' +
        this.macroName +
        '.ndm/JSON?PFMSOMTD=' +
        PFMBOX.PFMSOMTD +
        '&PFMFILID=' +
        PFMBOX.sPFMFILID +
        '&USRID=' +
        PFMBOX.PFMRMTUS +
        '&AUTHTOKEN=' +
        SESSION.AUTHTOKEN +
        fsrequestParams;

    if(this.environmentConditions){
        fsRequestUri +=  '&EnvConditions='+ encodeURIComponent(this.environmentConditions) ;
    }
    this.baseRequest = fsRequestUri;

    if (fbAskLayout && GUI.InfoWindow.configCache[this.cacheKey]) {
        fbAskLayout = false;
    }
    GUI.BasePanel.instances[this.panelId] = this;

    if (!this.hasParams && !fbAskLayout && !this.dataOnly) {
        // geen data nodig
        fsRequestUri += '&CONFIG=data';
    } else {
        // wel data nodig
        if (fbAskLayout) {
            // data en config nodig
            fsRequestUri += '&CONFIG=all';
        } else {
            // geen config nodig
            fsrequiredString = this.returnRequiredString();
            fsRequestUri += '&CONFIG=data' + fsrequiredString;
        }
    }
    let icon = XDOM.getObject(this.iconId);
    icon.dataset.isLoading == 'true';

    const promise = fetch(fsRequestUri)
        .then(response=>response.json())
        .then(json=> {
            GUI.InfoWindow.handleResponse(json,{ id: this.panelId, invoke: '*EXTERNAL' })
        })
    return promise;
};

/**
 * return required fields
 */
GUI.InfoWindow.prototype.returnRequiredString = function() {
    //var requiredReturnFields = this.requiredReturnFields;
    var requiredReturnFields = GUI.InfoWindow.configCache[this.cacheKey].requiredData;

    var requireSting = '';

    for (var value in requiredReturnFields) {
        requireSting += '&' + value.toString() + '=';
        requireSting += encodeURIComponent(requiredReturnFields[value]);
    }

    return requireSting;
};

/**
 * renderd het info window.
 */
GUI.InfoWindow.prototype.render = function() {
    //var fsId = this.panelId;
    if (!this.useCache && this.dom.domObject) {//	POM-4281
        this.dom.domObject.remove();
        this.dom.domObject = null;
    }

    if (this.screenMode === GUI.BasePanel.screenMode.subview) {
        this.setSize = false;
        this.placeHolder = XDOM.getObject(this.iconId)?.parentNode;
        if(!this.placeHolder){
            //this one is removed by field authorisation so don't bother
            return;
        }
        this.placeHolder.setAttribute('data-screen-mode', GUI.BasePanel.screenMode.subview);

        this.panelBackgroundColor = this.placeHolder.parentNode.getAttribute('data-fieldset-background-color');
        this.panelIconGroup = this.placeHolder.parentNode.getAttribute('data-fieldset-icon-group');
        this.panelIconClass = this.placeHolder.parentNode.getAttribute('data-fieldset-icon-class');
        this.fieldProgressionPartId = this.placeHolder.parentNode.getAttribute('fieldPprogression-part');
        if (this.dataSet) {
            this.repositionElements();
        }
    } else {
        this.fieldProgressionPartId = this.panelId;
        this.placeHolder = XDOM.getObject('DTADIV');
    }

    this.base(GUI.InfoWindow, 'render');

    if (this.inSubfile) {
        this.placeHolder.insertBefore(this.dom.domObject, this.placeHolder.firstChild);
    } else {
        this.placeHolder.appendChild(this.dom.domObject);
    }

    GUI.InfoWindow.renderCache[this.cacheKey] = this.dom.domObject;
    this.dom.domObject.setAttribute('data-click-action', 'GUI.InfoWindow.handlePanelClick');
    this.dom.domObject.setAttribute('data-eventarg-id', this.panelId);
    this.dom.domObject.setAttribute('data-update-dom-depth', 'true');

    updatePanelSort(this.dom.domObject);

    XDOM.addEventListenerToNode('[data-focus-action]', 'focus', handleFocus, this.dom.domObject);
    XDOM.addEventListenerToNode('[data-blur-action]', 'blur', handleBlur, this.dom.domObject);
    XDOM.addEventListenerToNode('[data-mouseover-action]', 'mouseover', handleMouseOver, this.dom.domObject);
    XDOM.addEventListenerToNode('[data-mouseout-action]', 'mouseout', handleMouseOut, this.dom.domObject);
    this.alignPanel();
    this.isVisible = true;
};

GUI.InfoWindow.prototype.show = function() {
    if (this.screenMode == GUI.BasePanel.screenMode.subview) {
        //RKR ~ Return als het om een subview gaat. Het object staat er al dus hoeft niet getoond te worden.
        //Dit is aangepast omdat bij Bieman berichten niet werden getoond in een editwindow.
        return;
        //this.placeHolder = XDOM.getObject(this.iconId).parentNode;
    } else {
        this.placeHolder = XDOM.getObject('DTADIV');
    }

    if (this.inSubfile) {
        this.placeHolder.insertBefore(this.dom.domObject, this.placeHolder.firstChild);
    } else {
        this.placeHolder.appendChild(this.dom.domObject);
        this.dom.domObject.setAttribute('data-hidden', 'false');
        this.alignPanel();
    }

    updatePanelSort(this.dom.domObject);

    this.base(GUI.InfoWindow, 'show');
};

GUI.InfoWindow.closeByMacroId = function(macro) {
    for (var id in GUI.BasePanel.instances) {
        if (GUI.BasePanel.instances[id].macroName === macro) {
            GUI.BasePanel.instances[id].close();
        }
    }
};

GUI.InfoWindow.prototype.onResponse = function(response) {
    this.data = response.data;
    this.subfileData = nullWhenEmpty(response.subfileData);
    var foConfig = GUI.InfoWindow.configCache[this.cacheKey];
    var position = null,
        icon = 0;
    if (this.dom.icon) {
        icon = XDOM.getObject(this.dom.icon.id);
        if (!icon) {
            this.close(); //aanroepend element is niet meer in het scherm te zien
        }
    }

    if (!this.isInitialised) {
        if (!foConfig) {

            GUI.InfoWindow.configCache[this.cacheKey] = response.config;
            foConfig = response.config;
        }

        this.condHiddenLines = foConfig.condHiddenLines;
        this.definition = foConfig.panelDef;
        this.authorizationFields = foConfig.authorizationData;
        this.captions = new Captions(foConfig);
        this.services = new GUI.Services(foConfig);
        this.base(GUI.InfoWindow, 'init');

        //if (this.openByHover && !this.hovering) {
        //	return;
        //}

        this.render();
    } else {
        if (!this.dom.domObject && GUI.InfoWindow.renderCache[this.cacheKey]) {
            this.dom.domObject = GUI.InfoWindow.renderCache[this.cacheKey];
        }
        if (this.dom.domObject) {
            this.show();
            this.update();
        } else {
            this.render();
        }
    }

    if (response && response.basicConfig) {
        var titleText =
            getCapt('cTX_SSN') + ': ' + response.basicConfig.jobNbr + ' \x0A' + getCapt('cTX_PGM') + ': ' + response.basicConfig.macroId;
        GUI.infoTitle.register(this.dom.header, titleText);
    }

    When.update(this.dom, this.data);
    Lines.guiUpdate(this);
};

GUI.InfoWindow.handleResponse = function(response, tag) {
    var foWindow = GUI.BasePanel.instances[tag.id];
    let icon = XDOM.getObject(foWindow.iconId);

    if (!foWindow) {
        return;
    } // -->
    // if (response.responseText.startsWith('Fout')) {
    //   SCOPE.main.Dialogue.alert('GUI.InfoWindow.handleResponse: ' + response.responseText);
    // } else {
    foWindow.invoke = tag.invoke;
    foWindow.onResponse(response);
    // }
};

GUI.InfoWindow.prototype.registerEvents = function() {
    if (this.eventsRegistered) {
        return;
    }
    var foOutput = XDOM.getObject(this.id);
    if (!this.dom.icon) {
        this.dom.icon = XDOM.getObject(this.iconId);
    }
    if (this.dom.icon) {
        XDOM.setAttribute(this.dom.icon, 'data-panel-id', this.panelId);
        this.dom.icon.setAttribute('data-click-action', 'GUI.InfoWindow.handleClick');
        this.dom.icon.setAttribute('data-mouseover-action', 'GUI.InfoWindow.handleMouseOver');
        this.dom.icon.setAttribute('data-mouseout-action', 'GUI.InfoWindow.handleMouseOut');
    }

    if (foOutput.tagName === 'INPUT') {
        return;
    }
    foOutput.setAttribute('data-mouseover-action', 'GUI.InfoWindow.handleMouseOver');
    foOutput.setAttribute('data-mouseout-action', 'GUI.InfoWindow.handleMouseOut');
    foOutput.setAttribute('data-click-action', 'GUI.InfoWindow.handleClick');
    foOutput.setAttribute('data-panel-id', this.panelId);
};


GUI.InfoWindow.updateDom = function() {
    const prommises = [];
    var pageObjects = XDOM.queryAll('[data-info-id]');
    var obj = null;
    var infoWindow = null;
    var screenMode = '';
    for (var i = 0, l = pageObjects.length; i < l; i++) {
        obj = pageObjects[i];
        if(obj.dataset.when=="unavailable"){
            continue; //not visable because of when construction
        }
        screenMode = obj.getAttribute('data-screen-mode');
        if (screenMode !== GUI.BasePanel.screenMode.subview) {
            obj.setAttribute('data-click-action', 'GUI.InfoWindow.handleClick');
            obj.setAttribute('data-mouseover-action', 'GUI.InfoWindow.handleMouseOver');
            obj.setAttribute('data-mouseout-action', 'GUI.InfoWindow.handleMouseOut');
        }
        setSubviewNoMargin(obj, screenMode);
        if (screenMode === GUI.BasePanel.screenMode.subview || obj.getAttribute('data-trigger-fields')) {
            infoWindow = GUI.InfoWindow.getWindow(obj);
            prommises.push(infoWindow.init());
        }
    }
    return prommises;
};

GUI.InfoWindow.register = function(id, iconId, attributes) {
    var foOutput = XDOM.getObject(id);
    var foIcon = XDOM.getObject(iconId);

    if (foIcon) {
        XDOM.setAttributes(foIcon, attributes);
        foIcon.setAttribute('data-mouseover-action', 'GUI.InfoWindow.handleMouseOver');
        foIcon.setAttribute('data-mouseout-action', 'GUI.InfoWindow.handleMouseOut');
        foIcon.setAttribute('data-click-action', 'GUI.InfoWindow.handleClick');
    }
    foOutput.setAttribute('data-mouseover-action', 'GUI.InfoWindow.handleMouseOver');
    foOutput.setAttribute('data-mouseout-action', 'GUI.InfoWindow.handleMouseOut');
    foOutput.setAttribute('data-click-action', 'GUI.InfoWindow.handleClick');
    XDOM.setAttributes(foOutput, attributes);
};

/* EditWindow */
/* Load Timestamp 13:59:55.651 */

// Export GUI globally for backward compatibility
if (typeof window !== 'undefined') {
    window.GUI = GUI;
}

export default GUI;
