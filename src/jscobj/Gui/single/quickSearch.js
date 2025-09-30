GUI.QuickSearch = function (obj) {
    GUI.QuickSearch.baseConstructor.call(this, obj);

    //registreren van value's in response
    this.quicksearchId = nullWhenEmpty(obj.id);
    this.toId = nullWhenEmpty(obj.toId);
    this.searchMacroName = nullWhenEmpty(obj.macroName);
    this.macroLocation = nullWhenEmpty(obj.macroLocation);
    this.parmObject = nullWhenEmpty(obj.parmObject);
    this.returnFields = nullWhenEmpty(obj.returnFields);
    this.activateAfter = nullWhenEmpty(obj.activateAfter);
    this.limitResults = nullWhenEmpty(obj.limitResults);
    this.activateSearch = nullWhenEmpty(obj.activateSearch);
    this.inputFields = nullWhenEmpty(obj.inputFields);
    this.whenField = nullWhenEmpty(obj.whenField);
    this.whenValue = nullWhenEmpty(obj.whenValue);
    this.xPosition = nullWhenEmpty(obj.xPosition);
    this.yPosition = nullWhenEmpty(obj.yPosition);
    this.targetInputObj = null;
};

XDOM.extendObject(GUI.QuickSearch, GUI.BaseInputObject);

/**
 * @override GuiBaseObject
 * @returns HTMLDomObject
 */
GUI.QuickSearch.prototype.render = function () {
    this.dom.domObject = XDOM.createElement("DIV", this.quicksearchId);
    this.dom.domObject.setAttribute("data-search-type", "quickSearch");

    this.dom.domObject.setAttribute("data-to-id", this.panelId + "-" + this.toId);
    this.dom.domObject.setAttribute("data-macro-name", this.searchMacroName);
    this.dom.domObject.setAttribute("data-quicksearch-id", this.quicksearchId);
    this.dom.domObject.setAttribute("data-macro-location", this.macroLocation);
    this.dom.domObject.setAttribute("data-input-fields", this.panelId + "-" + this.inputFields);

    this.dom.domObject.setAttribute("data-quicksearch-activate-after", this.activateAfter);
    this.dom.domObject.setAttribute("data-activate-search", this.activateSearch);

    this.dom.domObject.setAttribute("data-quicksearch-limit-results", this.limitResults);

    this.updateFieldNames();

    this.setPosAndDimentions();
    this.updateState();
    this.registerEvents();
    return this.dom.domObject;
};

GUI.QuickSearch.prototype.registerEvents = function () {
};

GUI.QuickSearch.prototype.updateFieldNames = function () {

    var parmObject = eval(this.parmObject);
    var returnFields = this.returnFields.split(' ');
    var fsObject = "";

    for (var l = returnFields.length, i = 0; i < l; i++) {
        fsObject += this.panelId + "-" + returnFields[i] + " ";
    }

    this.returnFields = fsObject;
    this.dom.domObject.setAttribute("data-return-fields", this.returnFields.trim());

    fsObject = "[";

    for (var i = 0; i < parmObject.length; i++) {
        if (i != 0) {
            fsObject += ", ";
        }
        fsObject += "{ 'location':'" + parmObject[i].location + "' , 'field': '" + this.panelId + "-" + parmObject[i].field + "' }";
    }

    fsObject += "]";

    this.parmObject = fsObject;

    this.dom.domObject.setAttribute("data-parm-object", this.parmObject);
    this.dom.domObject.setAttribute("data-invoker-baseId", this.panelId);
    this.dom.domObject.addEventListener('click', QuickSearch.handleOnClick);
    //update QS target input
    this.targetInputObj = this.parentObject.guiObjects[this.panelId + "-" + this.toId];
    if (this.targetInputObj && this.targetInputObj.dom && this.targetInputObj.dom.domObject) {


        if (this.activateAfter == "*AUTO") {
            this.activateAfter = QuickSearch.getDefaultMinLength(this.targetInputObj.dom.domObject);
        }

        if (!this.targetInputObj.dom.domObject.hasAttribute("data-setDefault-events") &&
            !this.targetInputObj.dom.domObject.hasAttribute("data-quicksearch-activate-after")) {

            this.targetInputObj.dom.domObject.setAttribute("data-quicksearch-id", this.quicksearchId);
            this.targetInputObj.dom.domObject.setAttribute("data-quicksearch-activate-after", this.activateAfter);
        }

    }

    return;

};

/**
 * @override GuiBaseObject
 */
GUI.QuickSearch.prototype.updateState = function () {

    if (!this.dom.domObject) {
        this.dom.domObject = XDOM.getObject(this.quicksearchId);
    }
    this.base(GUI.QuickSearch, 'updateState');
    this.dom.domObject.className = this.getCssClass();
    if (this.whenField) {
        if (this.getDataValue(this.whenField) == this.whenValue) {
            this.dom.domObject.style.display = '';
        } else {
            this.dom.domObject.style.display = 'none';
        }
    }
};

/**
 * @override GuiBaseObject
 * @returns cssClasses
 */
GUI.QuickSearch.prototype.getCssClass = function () {
    var fsCssClass = this.base(GUI.Calendar, 'getCssClass');
    fsCssClass += " quickSearch pth-quickSearch dataSectionButton theme-hover-color";
    return fsCssClass;
};
