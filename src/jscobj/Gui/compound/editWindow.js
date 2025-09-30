var EDITPGM = {};


GUI.EditWindow = function (obj) {
    GUI.EditWindow.baseConstructor.call(this, obj);
    this.id = obj.getAttribute("data-edit-id");
    this.toId = obj.getAttribute('data-to-id') || '';
    this.windowType = "edit";
    this.message = '';
    //this.fieldProgression = new GUI.fieldProgression();
};

XDOM.extendObject(GUI.EditWindow, GUI.InfoWindow);


GUI.EditWindow.openInstance = null;


GUI.EditWindow.prototype.open = function () {
    if (this.screenMode != GUI.BasePanel.screenMode.subview) {
        if (GUI.EditWindow.openInstance) {
            GUI.EditWindow.openInstance.close();
        }
        GUI.EditWindow.openInstance = this;
    }
    this.base(GUI.EditWindow, 'open');
};

GUI.EditWindow.prototype.close = function () {
    if (this.screenMode != GUI.BasePanel.screenMode.subview && GUI.EditWindow.openInstance) {
        if (GUI.EditWindow.openInstance.id == this.id) {
            GUI.EditWindow.openInstance = null;
        }
    }
    this.base(GUI.EditWindow, 'close');
};

GUI.EditWindow.updateDom = function () {
    const promises = [];
    var pageObjects = XDOM.queryAll('[data-edit-id]');
    var obj = null;
    for (var i = 0, l = pageObjects.length; i < l; i++) {
        obj = pageObjects[i];
        screenMode = obj.getAttribute("data-screen-mode");
        if (screenMode != GUI.BasePanel.screenMode.subview) {
            obj.setAttribute("data-click-action", "GUI.EditWindow.handleClick");
        }
        setSubviewNoMargin(obj, screenMode);
        if (screenMode == GUI.BasePanel.screenMode.subview || obj.getAttribute("data-trigger-fields")) {
            let editWindow = GUI.EditWindow.getWindow(obj);
            promises.push(editWindow.init());
        }

    }
    return promises;
};

GUI.EditWindow.register = function (id, iconId, attributes) {
    var foOutput = XDOM.getObject(id);
    var foIcon = XDOM.getObject(iconId);

    if (foIcon) {
        XDOM.setAttributes(foIcon, attributes);
        foIcon.setAttribute("data-click-action", "GUI.EditWindow.handleClick");
    }
    foOutput.setAttribute("data-click-action", "GUI.EditWindow.handleClick");
    XDOM.setAttributes(foOutput, attributes);
};

GUI.EditWindow.prototype.validateField = function (obj) {
    return Validate.test(obj);
    //return true;
};

GUI.EditWindow.prototype.validate = function (foFLD) {
    var fsValue = foFLD.value;
    var fsDatatype = XDOM.getAttribute(foFLD, "data-datatype");
    var regEx = null,
        fKAR = null,
        fPOS = null;

    if (foFLD.tagName == "TEXTAREA") {
        return TextArea.validate(foFLD);
        var fiTextLength = TextArea.getLength(foFLD);
        var fiMaxLength = foFLD.maxLength;
        if (fiTextLength > fiMaxLength) {
            this.message = getCapt('gTXTAREAMAX1') + fiMaxLength + getCapt('gTXTAREAMAX4');
            return false;
        }
        return true;
    }
    // gedeeltelijke veld van een masker
    if (Mask.isMask(foFLD)) {
        if (!Mask.isValidPart(foFLD)) {
            this.message = Mask.getErrorMessage(foFLD);
            return false;
        } else {
            return true;
        }
    }

    switch (fsDatatype) {
        case ENUM.dataType.hidden:
            return true;
            break;
        case ENUM.dataType.decimal:
            var foValueCheck = new ValueCheck(foFLD);
            if (!foValueCheck.test()) {
                this.message = foValueCheck.message;
                return false;
            } else {
                if (foFLD.value.trim() == '-') {
                    foFLD.value = '';
                }
            }
            return true;
            break;
        case ENUM.dataType.data:
            regEx = gaREGEXP['*DTA'];
            //controleer op voorloop spaties
            if (!XDOM.getBooleanAttribute(foFLD, "data-left-blank") && fsValue.trim().length > 0 && fsValue.indexOf(' ') == 0) {
                this.message = getCapt('gVLD008');
                return false;
            }
        case ENUM.dataType.text:
        case ENUM.dataType.password:
            //digits

            if (XDOM.getBooleanAttribute(foFLD, "data-digits")) {
                regEx = gaREGEXP['*DIG'];
                if (!regEx.test(fsValue)) {
                    this.message = getCapt('gVLD007');
                    return false;
                }
                return true;
            }

            regEx = gaREGEXP['*TXT'];
            //gewoon
            if (regEx.test(fsValue)) {
                fKAR = fsValue.substring(fPOS, fPOS + 1);
                if (fPOS < fsValue.length) {
                    fsValue = fsValue.substr(fPOS + 1);
                }
                this.message = getCapt('gVLD003') + fKAR;
                return false;
            }
            break;
    }
    return true;
};

GUI.EditWindow.prototype.getData = function () {
    //haal alle velden op van de bij dit window hoordende data
    var request = '', name, value, field = null;
    var fields = XDOM.queryAll("[data-panel-id='" + this.panelId + "']");
    for (var i = 0, l = fields.length; i < l; i++) {
        field = fields[i];
        if (!Validate.test(field)) {
            XDOM.setAttribute(field, "data-old-value", field.value);
            return false;
        }


        if (field.name) {
            name = field.name.replace(this.panelId + '-', '');

            if (name) {

                if (field.getAttribute("data-unicode") == "true") {
                    value = XDOM.hexEncode(field.value);
                } else {
                    value = encodeURIComponent(field.value);
                }


                if (field.getAttribute("data-thousand-separator") == "on") {
                    value = unformatThousand(value);
                }


                request += '&' + name + '=' + value;
            }
        }
    }

    return request;
};

/**
 * controleerd alle input velden en bundelt deze in een form data component
 * @param command RESET || ENTER:autosubmit || ACCEPT:enter toets ingedrukt of klikken op enter(save toets) waarde commd in het WS_CMD veld
 * @param prompt waarde van het laatste gefocusde veld t.b.v. het  WS_PMT veld
 */
GUI.EditWindow.prototype.send = function (command, prompt) {

    var fsRequestData = this.getData();
    if (fsRequestData === false) {
        return;
    }
    Stateless.setSubviewActive(GLOBAL.eventSourceElement);
    var foRequest = new XMLHttpRequest();
    foRequest.addEventListener('load', GUI.EditWindow.handleResponse);
    foRequest.addEventListener('error', function (event) {
        console.log('fout opgetreden in GUI.EditWindow.send');
    });


    //var fsRequestUri =   this.baseRequest +   '/ndscgi/' + this.sourceLocation + '/ndmctl/' + this.macroName + '.ndm/JSON?' + fsRequestData;
    var fsRequestUri = this.baseRequest + fsRequestData;

    fsRequestUri += '&WS_CMD=' + command;
    fsRequestUri += '&WS_PMT=' + prompt;
    fsRequestUri += '&invoker=' + this.panelId;
    fsRequestUri += '&CONFIG=';

    if (!this.useCache) {
        this.clearCache();
        fsRequestUri += 'all';
    } else {
        fsRequestUri += 'data';
    }

    if (GUI.InfoWindow.configCache[this.cacheKey]) {
        for (var value in GUI.InfoWindow.configCache[this.cacheKey].requiredData) {
            fsRequestUri += "&" + value.toString() + "=";
            fsRequestUri += GUI.InfoWindow.configCache[this.cacheKey].requiredData[value];
        }
    }

    setSubviewLoading(this.dom.domObject, true);
    foRequest.open('GET', fsRequestUri);
    foRequest.send();
};


GUI.EditWindow.prototype.update = function () {
    this.base(GUI.EditWindow, 'update');
    if (this.data.WS_RTN === "OK") {

        if (autoSubmit(this.iconId)) {
            return;
        }

        Trigger.fire([this.macroName]);
        if (this.screenMode != GUI.BasePanel.screenMode.subview) {
            setTimeout("GUI.EditWindow.openInstance.close()", 2000);
            //this.close();
        }
    }

    this.updateMessage();

    if (this.data && (this.data.WS_CSR != undefined)) {
        this.setCursor(this.data.WS_CSR);
    }
};

GUI.EditWindow.prototype.updateMessage = function () {
    if (this.data && ((this.data.WS_MGL != undefined) && (this.data.WS_MSG != undefined))) {
        this.footer.setMessage(this.data.WS_MGL, this.data.WS_MSG);
    }
}

GUI.EditWindow.handleResponse = function (response) {
    var fsResponse = response.target.responseText;
    var foResponse = JSON.parse(fsResponse);
    var invoker = foResponse.basicConfig.invoker;
    var foWindow = GUI.BasePanel.instances[invoker];

    if (!foWindow) {
        return;
    } // -->
    if (fsResponse.startsWith('Fout')) {
        SCOPE.main.Dialogue.alert('GUI.EditWindow.handleResponse fout: ' + response.responseText);
    } else {
        if (foResponse.data.WS_RTN == 'OK') {
            if (isAutoSubmitField(foWindow.toId)) {
                Command.enter();
                return;
            }
            Trigger.fire([foWindow.macroName]);
        }
        foWindow.onResponse(foResponse);
    }
};


GUI.EditWindow.prototype.setCursor = function (csrField) {
    var cursorFieldId = this.panelId + "-" + csrField;
    var cursorField = XDOM.getObject(cursorFieldId, this.dom.domObject);

    setSubviewLoading(this.dom.domObject, false);
    setCursorFromStateless();

    if (!cursorField) {
        return;
    }
    if (!Stateless.canHaveFocus(cursorField)) {
        return;
    }

    SESSION.activePage.cursorFocus = cursorField;
    setCursor();
    return;
};

GUI.EditWindow.handleReset = function (e) {
    XDOM.getEvent(e);
    var foEdit = XDOM.GLOBAL.getEditWindow();
    SESSION.submitFromScope = XDOM.GLOBAL.getAttribute('data-for-panel');
    foEdit.send('RESET', '');
};


GUI.EditWindow.handleSubmit = function (e) {
    XDOM.getEvent(e);
    var foEdit = XDOM.GLOBAL.getEditWindow();
    SESSION.submitFromScope = XDOM.GLOBAL.getAttribute('data-for-panel');
    foEdit.send('ACCEPT', '');
};


GUI.EditWindow.prototype.registerSFLEvents = function () {
    if (this.eventsRegistrated) {
        return;
    }

    if (!this.dom.icon) {
        this.dom.icon = XDOM.getObject(this.iconId);
    }
    if (this.dom.icon) {
        this.dom.icon.setAttribute("data-click-action", "GUI.EditWindow.handleClick");
    }
};

GUI.EditWindow.prototype.registerEvents = function () {
    var fsPanelId = this.panelId;
    if (this.eventsRegistrated) {
        return;
    }
    if (!this.dom.icon) {
        this.dom.icon = XDOM.getObject(this.iconId);
    }
    this.dom.icon.setAttribute("data-click-action", "GUI.EditWindow.handleClick");

};

GUI.EditWindow.prototype.renderIcon = function () {
};

GUI.EditWindow.handleClick = function (e) {
    XDOM.cancelEvent(e);
    var panel = GUI.EditWindow.getWindow(GLOBAL.eventSourceElement);
    panel.recordNumber = XDOM.GLOBAL.getAttribute("data-record-number");
    panel.dom.icon = GLOBAL.eventSourceElement;
    panel.open();

    return false;
};


GUI.EditWindow.getWindow = function (obj) {
    var foEditWindow = XDOM.getEditWindow('p-' + obj.id);
    if (foEditWindow) {
        return foEditWindow;
    }
    return new GUI.EditWindow(obj);
};


GUI.EditWindow.propagateSubfile = function (attributes, recordNr) {
    GUI.EditWindow.renderIcon(attributes, recordNr);
};

GUI.EditWindow.renderIcon = function (attributes, recordNumber) {
    var foIcon = null;
    var fsMacro = attributes['data-macro-name'];
    var foApplyToRow = attributes['data-edit-applyto'];
    var foTd = XDOM.getAxis(attributes['data-edit-cell-axis'], recordNumber);

    if (!foTd || !(foApplyToRow == '*ALL' || isIn(recordNumber, foApplyToRow))) {
        return;
    }

    attributes['data-panel-id'] = fsMacro + '-' + recordNumber;
    attributes['data-record-number'] = recordNumber;

    foIcon = XDOM.createElement("DIV", null, "editProgram");
    foTd.appendChild(foIcon);

    XDOM.setAttributes(foIcon, attributes);
    foIcon.setAttribute("data-click-action", "GUI.EditWindow.handleClick");
};