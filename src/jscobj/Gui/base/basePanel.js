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

