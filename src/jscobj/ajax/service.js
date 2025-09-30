/* global GLOBAL, keyCode */

// ***************************************************************************
// Registreer Service Function
// parms: fsTOID =toekennen aan object
// fOBJNM =object naam
// fSRVOBJ =Service object
// fSRVTYP =Service type (*RTV || *DSP || *CHC || *LST || *CAL)
// fSRCLOC =Service source locatie (*DBS || )
// fSRVPOS =Service Function positie
// fSRVACT =Service Action
// *USRACT default geen actie behalve door user
// *CSR de choice/calender worden geopend wanneer mWS_CSR de waarde heeft van
// het TOID
// *CSRBLK de choice/calender worden geopend wanneer mWS_CSR de waarde heeft van
// het TOID en het veld TOID is leeg
// *CSRERR de choice/calender worden geopend wanneer mWS_CSR de waarde heeft van
// het TOID en mWS_MGL is 'F' (gaan er van uit dat de fout op het TOID is
// gevonden)
// *AUTOACT de choice/calender worden altijd worden geopend, maar slechts
// maximaal 1 per scherm (eerste)
// return: --
// ***************************************************************************


function Service(obj) {
    this.id = obj.getAttribute("data-service-id");
    this.targetId = obj.getAttribute("data-to-id");
    this.serviceObjectName = obj.getAttribute("data-service-source");
    this.optionExpiredMode = obj.getAttribute("data-service-option-expired");
    this.type = obj.getAttribute("data-service-type");
    this.recordNumber = obj.getAttribute("data-record-number");
    this.axis = obj.getAttribute("data-to-axis");
    this.displayId = obj.id;

    this.serviceId = this.targetId + this.type;

    this.serviceObject = null;
    this.serviceType = this.type;
    this.selectedValue = '';
    this.placeholder = null;
    this.resultTable = null;
    this.tableBody = null;
    this.resultDiv = null;
    this.titleDiv = null;
    this.index = [];
    this.rows = [];
    this.TargetIsHidden = null;
    this.openByClick = false;
    this.maxTextLength = 10;

    this.selectedIndex = null;                  //selected record
    this.hoveredIndex = 0;                      //hovered record
    this.lastHoveredIndex = 0;
    this.maxDisplayedRows = SETTINGS.maxServiceFunctionDisplayedRows;     //show this number of record at once
    this.rowHeight = 18;                        //height of a record in chc and dsp
    this.ancorStart = 0;                        //if a page has more than one page use this as START ancor
    this.ancorEnd = 0;                          //if a page has more than one page use this as END ancor
    this.onePageView = true;                    //are there less options than maxDisplayedRows
    this.autoSelectTimestamp = null;

    this.cellAxis = null;
    this.isSFLLineSelector = (this.targetId == 'WS_SFL');

    this.columnCodeWidth = 1;
    this.hasValidOptions = false;

    this.openTimer = null;
    this.isInitialized = false;
    switch (this.serviceType) {
        case ENUM.serviceType.choice:
            this.renderRecord = this.renderChoiceRecord;

            /* POI */
            this.placeHolderClass = "popCHCWDW";


            this.placeHolderID = this.serviceObjectName + "_" + this.placeHolderClass;
            break;
        case ENUM.serviceType.display:
            this.placeHolderClass = "popDSPWDW";
            this.placeHolderID = this.serviceObjectName + "_" + this.placeHolderClass;
            this.renderRecord = this.renderDisplayRecord;
            if (!this.targetId) {
                this.targetId = this.displayId;
            }
            break;
    }
}

Service.get = function (obj) {
    var fsSource = obj.getAttribute("data-service-source");//TOV_CDLEV"
    var foService = new Service(obj);
    var panel = XDOM.GLOBAL.getEditWindow();
    foService.init();
    if (panel) {
        foService.serviceObject = panel.services.getOldFormat(fsSource);
    }
    return foService;
};


// ***************************************************************************
// Registreer Service Function
// parms: fsTOID =toekennen aan object
// fOBJNM =object naam
// fSRVOBJ =Service object
// fSRVTYP =Service type (*RTV || *DSP || *CHC || *LST || *CAL)
// fSRCLOC =Service source locatie (*DBS || )
// fSRVPOS =Service Function positie
// fSRVACT =Service Action
// *USRACT default geen actie behalve door user
// *CSR de choice/calender worden geopend wanneer mWS_CSR de waarde heeft van
// het TOID
// *CSRBLK de choice/calender worden geopend wanneer mWS_CSR de waarde heeft van
// het TOID en het veld TOID is leeg
// *CSRERR de choice/calender worden geopend wanneer mWS_CSR de waarde heeft van
// het TOID en mWS_MGL is 'F' (gaan er van uit dat de fout op het TOID is
// gevonden)
// *AUTOACT de choice/calender worden altijd worden geopend, maar slechts
// maximaal 1 per scherm (eerste)
// return: --
// ***************************************************************************

Service.currentService = null;

Service.isOpening = false;
Service.openDelay = 400;
Service.alreadyOpen = false;

Service.prototype.open = function () {
    var foTarget = XDOM.getObject(this.targetId);
    var jumpToRecord = null;

    if (SESSION.submitInProgress || Service.currentService === this) {
        return;
    }

    // Check whether the Cal modal is already open
    let alreadyOpen = window.SCOPE.main.Dialogue.getModalsByGroup([window.SCOPE.session.SESSION.jobId, 'service'])[0];

    // Remember already open and let the calendar know another service will open (focus control)
    if (alreadyOpen) {
        alreadyOpen.alreadyOpen = true;

        window.SCOPE.main.Dialogue.deleteModalGroup([window.SCOPE.session.SESSION.jobId, 'service']);
    }

    Service.currentService = this;

    this.render();

    if (this.type == ENUM.serviceType.choice || this.type == ENUM.serviceType.display) {
        jumpToRecord = this.initSettings();
    }

    this.defineScroll(jumpToRecord);
    SESSION.activePage.cursorFocus = "pageBody";
    setCursor();
};

Service.prototype.initSettings = function () {

    var optionLength = this.serviceObject.OPT.length;
    var jumpToRecord = false;
    var initChoice = true;
    if (optionLength <= this.maxDisplayedRows) {                            //als er minder/gelijk aantal opties zijn dan default per pagina
        this.maxDisplayedRows = optionLength;                               //max per pagina naar aantal opties
    } else {
        this.onePageView = false;                                      //er zijn meerdere pagina's
    }

    if (!hasValue(this.selectedIndex)) {
        this.hoveredIndex = 0;
    }

    //starten met zoeken vanaf de waarde is is opgegeven in de INPUT
    if (hasValue(this.selectedValue)) {
        var keyIndex = this.getIndexByString(this.selectedValue);
        if (keyIndex != null) {
            this.hoveredIndex = keyIndex;
            jumpToRecord = true;
        }
    }

    if (this.hoveredIndex == 0) {

        this.ancorStart = 0;                                          //default startpunt is 0
        this.ancorEnd = this.maxDisplayedRows;                      //default eindpunt is maximaal aantal op een pagina

    } else {

        if ((this.hoveredIndex > (optionLength - this.maxDisplayedRows)) && this.hoveredIndex <= optionLength) {
            this.ancorStart = (optionLength - this.maxDisplayedRows);     //default startpunt is 0
            this.ancorEnd = optionLength;                               //default eindpunt is maximaal aantal op een pagina
            jumpToRecord = true;
        } else if ((this.hoveredIndex - this.maxDisplayedRows) < 0) {
            this.ancorStart = 0;                                          //default startpunt is 0
            this.ancorEnd = this.maxDisplayedRows;
        } else {
            this.ancorEnd = this.ancorStart + this.maxDisplayedRows;
            jumpToRecord = true;
        }
    }

    this.selectRecord(initChoice);                                                  //selecteer het gekozen record en plaats focus
    return jumpToRecord;
};


Service.prototype.selectRecord = function (initChoice) {

    var fbInitChoice = null;
    fbInitChoice = initChoice;


    var lastSelectedRecord = this.lastHoveredIndex;

    this.deSelectRecord();

    var fbSelectedRecord = hasValue(this.selectedIndex);

    if ((this.serviceObject.unavailable ||
        (this.serviceType == ENUM.serviceType.display) && !fbSelectedRecord)) {
        return;
    }

    var foRecord = this.rows[this.hoveredIndex];
    if (!foRecord) {
        return;
    }

    var rowExpiredAttr = foRecord.getAttribute("data-row-disabled");

    if (rowExpiredAttr == ENUM.expiredOptions.display) {
        if (fbInitChoice) {
            GLOBAL.charCode = keyCode.arrowDown;
        }

        if (this.hasValidOptions) {
            switch (GLOBAL.charCode) {
                case keyCode.arrowUp:
                case keyCode.arrowDown:
                    this.changeSelection();
                    break;
                default:
                    this.selectNextOption();
                    break;
            }
        }

        return;
    }
    foRecord.setAttribute("data-popupRow-selected", "true");

    var foRadioBtn = XDOM.getObject("POPCHC_" + this.hoveredIndex);
    if (fbInitChoice && (this.selectedIndex == this.hoveredIndex)) {
        foRadioBtn.classList.remove('radioBtn_icon');
        foRadioBtn.classList.add('radioBtn_icon_checked');
    }

    if (foRadioBtn) {
        foRadioBtn.focus();
    }
};

Service.prototype.deSelectRecord = function () {
    var foRecord = this.rows[this.hoveredIndex];
    this.lastHoveredIndex = this.hoveredIndex;

    if (!foRecord) {
        return;
    }

    foRecord.setAttribute("data-popupRow-selected", "false");
    var foRadioBtn = XDOM.getObject("POPCHC_" + this.hoveredIndex);

    if (foRadioBtn) {
        foRadioBtn.focus();
        // XDOM.classNameReplaceOrAdd(foRadioBtn, 'radioBtn_icon_checked', 'radioBtn_icon');
    }
};

Service.openChoiceFromSubfile = function (e) {
    XDOM.cancelEvent(e);
    // openService(null, true);
};

Service.close = function (event = null) {
    let modal = null;

    // Check for modals
    if (event) {
        modal = event.target;
    } else {
        modal = window.SCOPE.main.Dialogue.getModalsByGroup([window.SCOPE.session.SESSION.jobId, 'service'])[0];
    }

    if (modal) {
        modal.delete();

        // Service.currentService.close();
        Service.currentService = null;

        return true;
    }

    return false;
};

Service.autoOpen = function () {
    var serviceIcon = XDOM.query('[data-service-open][data-to-id="' + SESSION.activePage.cursorFocus + '"]:not([data-when="unavailable"])');
    if (!serviceIcon) {
        return;
    }
    switch (serviceIcon.getAttribute("data-service-open")) {
        case ENUM.serviceOpen.cursorOnly:
            break;
        case ENUM.serviceOpen.cursorAndError:
            if (SESSION.activePage.viewProperties.messageLevel != ENUM.attentionLevel.error) {
                return
            }
            break;
        case ENUM.serviceOpen.cursorAndBlank:
            if (XDOM.getObjectValue(SESSION.activePage.cursorFocus) != "") {
                return;
            }
            break;
        default:
            return;
            break;
    }
    XDOM.invokeClick(serviceIcon);
};

Service.handleKeyDown = function () {
    if (!Service.currentService) {
        return false;
    }

    if (Service.isOpening) { // ter voorkoming dat F4 ook als toetsen aanslag
        // gezien wordt hij opent namelijk op keyDown
        Service.isOpening = false;
        if (GLOBAL.charCode === keyCode.F4) {
            return true;
        }
    }

    //set timestamp for scrolling, while key is pressed
    var activeTimestamp = new Date();
    if (((activeTimestamp - this.currentService.autoSelectTimestamp) / 1000) > 0.08) {
        Service.currentService.autoSelectTimestamp = activeTimestamp;
        Service.currentService.handleKeyDown();
        GLOBAL.eventObject.cancel();
        GLOBAL.eventObject.remapKeyCode();
    }
    return true;
};

Service.prototype.handleKeyDown = function () {
    switch (GLOBAL.charCode) {
        case keyCode.F12:
        case keyCode.escape:
            Service.close();
            return;
            break;
        case keyCode.enter:
        case keyCode.space:
            this.returnValue();
            return;
            break;
        default:
            this.changeSelection();
            break;
    }

    return;
};

Service.prototype.changeSelection = function () {
    var isDisplayWindow = (this.type == ENUM.serviceType.display);
    var jumpToRecord = false;
    this.deSelectRecord();                //deselect records before setting new value

    switch (GLOBAL.charCode) {
        case keyCode.arrowUp:
            if (isDisplayWindow) {              //if displaywindow do not select records but pages
                keyPressed = keyCode.pageUp;
                break;
            }
            this.hoveredIndex--;              //select record above
            break;

        case keyCode.arrowDown:
            if (isDisplayWindow) {              //if displaywindow do not select records but pages
                keyPressed = keyCode.pageDown;
                break;
            }
            this.hoveredIndex++;              //select record below
            break;

        case keyCode.pageUp:
            if (!isDisplayWindow) {
                this.hoveredIndex -= this.maxDisplayedRows; //this.ancorStart - this.maxDisplayedRows;       //goes exact one page up
            } else {
                this.selectedIndex -= this.maxDisplayedRows;
            }
            break;

        case keyCode.pageDown:
            if (!isDisplayWindow) {
                this.hoveredIndex += this.maxDisplayedRows;//this.ancorEnd;        //goes exact one page up
            } else {
                this.selectedIndex += this.maxDisplayedRows;
            }
            break;

        default:
            var keyIndex = this.getIndexByKey();
            if (keyIndex != null) {
                this.hoveredIndex = keyIndex;
                jumpToRecord = true;
            }

            break;

    }

    this.selectRecord();
    this.defineScroll(jumpToRecord);
};


Service.prototype.selectNextOption = function () {
    this.hoveredIndex++; //select record below
    this.selectRecord();
    this.defineScroll();
};


Service.prototype.defineScroll = function (jumpToRecord) {
    var recordSelected = this.hoveredIndex;
    var enterNewPage = false;

    if (recordSelected < this.ancorStart) {                                   //go page up
        enterNewPage = true;
    } else if (recordSelected >= this.ancorEnd) {                             //go page down
        enterNewPage = true;
    }
    if (enterNewPage || jumpToRecord) {
        this.scrollToNewPage(jumpToRecord);
    }

};

Service.prototype.scrollToNewPage = function (jumpToRecord) {

    var recordSelected = this.hoveredIndex;
    var viewedRowsAtOnce = this.maxDisplayedRows;
    var optionLength = this.serviceObject.OPT.length;

    if (hasValue(recordSelected)) {

        //opening first time or use keyboard jump to record
        if (!jumpToRecord) {

            if (recordSelected < this.ancorStart) {

                if (recordSelected < 0) {
                    //goto last page
                    this.ancorStart = (optionLength - viewedRowsAtOnce);
                    this.hoveredIndex = (optionLength - 1);
                    this.ancorEnd = optionLength;

                } else {
                    //go page up
                    if ((viewedRowsAtOnce - this.hoveredIndex) <= 0) {
                        this.ancorStart -= viewedRowsAtOnce;
                        this.ancorEnd -= viewedRowsAtOnce;
                    } else {
                        this.ancorStart = 0;
                        this.ancorEnd = viewedRowsAtOnce;
                    }
                }

                this.selectRecord();
                this.resultDiv.scrollTop = (this.ancorStart * this.returnRowHeight());

            } else {

                if (recordSelected > (optionLength - 1) || (recordSelected == 0)) {

                    //goto first page
                    this.ancorStart = 0;
                    this.hoveredIndex = 0;
                    this.ancorEnd = viewedRowsAtOnce;

                } else {

                    //go page down
                    if ((this.hoveredIndex + viewedRowsAtOnce) <= optionLength) {
                        this.ancorStart += this.maxDisplayedRows;
                        this.ancorEnd += this.maxDisplayedRows;
                    } else {
                        this.ancorStart = (optionLength - viewedRowsAtOnce);
                        this.ancorEnd = (this.hoveredIndex + 1);
                    }

                }

                this.selectRecord();

                this.resultDiv.scrollTop = (this.ancorStart * this.returnRowHeight());
            }
        } else {

            //goto selected item
            this.ancorStart = recordSelected;
            this.ancorEnd = recordSelected + viewedRowsAtOnce;

            if ((recordSelected + this.maxDisplayedRows) > optionLength) {
                this.ancorStart = (optionLength - viewedRowsAtOnce);
                this.ancorEnd = this.hoveredIndex + 1;
            }
            this.resultDiv.scrollTop = (this.ancorStart * this.returnRowHeight());
        }
    }
};


Service.handleRowClick = function (event) {
    // Target the event target
    let index = event.target.getAttribute("data-service-select-index");

    if (!index) {
        return false;
    }

    Service.currentService.selectedIndex = index;
    Service.currentService.hoveredIndex = index;
    Service.currentService.returnValue();

    return true;
};

Service.handleHeadingClick = function (e) {
    var thCell = null;
    var serviceId = null;
    var serviceObject = null;
    var serviceType = null;

    //exclude sort buttons and input fields
    if (XDOM.GLOBAL.getAttribute("data-click-action") == "SortButton.handleOnClick" || e.target.tagName == "INPUT") {
        return;
    }
    thCell = XDOM.getParentByTagName(GLOBAL.eventSourceElement, "TH");

    if (!thCell) {
        return false;
    }

    serviceId = thCell.getAttribute("data-service-click-id");
    if (!serviceId) {
        return false;
    }

    serviceObject = XDOM.getObject(serviceId);
    if (serviceObject.getAttribute("data-when") === "unavailable" || serviceObject.dataset.hidden == 'true') {
        return;
    }

    serviceType = serviceObject.getAttribute("data-service-type");

    if (serviceType == ENUM.serviceType.calendar) {
        serviceObject = new Calender(serviceObject.getAttribute("data-to-id"), null, true);
        serviceObject.open();
        return true;
    }


    if (!(serviceType == ENUM.serviceType.display || serviceType == ENUM.serviceType.choice)) {
        return false;
    }
    serviceObject = Service.get(serviceObject);
    serviceObject.openByClick = true;
    serviceObject.open();
    return true;
};

Service.prototype.returnRowHeight = function () {
    var newRowHeight = null;
    if (minVersion('*8A')) {
        return this.rowHeight;
    }
    const zoomFactor = SCOPE.main.Settings.get('ZOOM_FACTOR');
    if (BrowserDetect.isChrome) {
        // newRowHeight = (this.rowHeight - MAIN.OCULUS.zoomFactors[MAIN.OCULUS.zoomLevel].dspRowOffset);
        newRowHeight = (this.rowHeight - MAIN.OCULUS.zoomFactors[zoomFactor].dspRowOffset);
    } else {
        return this.rowHeight;
    }


    newRowHeight.toFixed(4);
    return newRowHeight;

};

Service.prototype.returnValue = function () {
    if (!this.serviceObject.OPT[this.hoveredIndex][0]) {
        return;
    }

    var fsValue = this.serviceObject.OPT[this.hoveredIndex][0];
    var fsOldValue = null;
    var foTarget = XDOM.getObject(this.targetId);
    if (!foTarget) {
        return;
    }

    Service.close();

    if (foTarget.tagName == 'INPUT') {
        setOldValue(foTarget);
        fsOldValue = foTarget.value;
        foTarget.value = fsValue;
    }

    Service.retriveRelated(foTarget);

    if (foTarget.id == "WS_SFL") {
        Command.enter();
        return;
    }
    // Subfile.setChanged(this.recordNumber);

    if (foTarget && !SESSION.submitInProgress) {
        fp.next(foTarget);
    }

    if (fsOldValue != fsValue) {
        handleOnChange(foTarget);
    }


    return false;
};

Service.prototype.close = function () {

    var foTarget = XDOM.getObject(this.targetId);

    if (this.placeHolderID) {
        XDOM.removeDOMObject(this.placeHolderID);
    }

    this.openByClick = false;
    this.placeholder = null;

    if (foTarget && foTarget.tagName == "INPUT" && foTarget.type != "hidden") {
        foTarget.focus();
    } else {
        setCursor();
    }

    Service.currentService = null;
};

Service.prototype.setDimensions = function () {
    var foRecord = this.rows[0];
    var fiTableHeight = 0;
    var fcCharWidth = 9;
    var fc4CharsWidth = fcCharWidth * 4;
    var fcCloseBtnCharWidth = 2;
    var fiWidth = 0;
    var fiTextLength = this.maxTextLength;
    var fiTitleWidth = this.serviceObject.TTL.length + fcCloseBtnCharWidth;

    if (fiTitleWidth > fiTextLength) {
        fiTextLength = fiTitleWidth;
    }

    fiWidth = ((Math.floor((fiTextLength * fcCharWidth) / fc4CharsWidth)) + 1) * fc4CharsWidth;

    if (fiWidth < SETTINGS.minServiceWidth) {
        fiWidth = SETTINGS.minServiceWidth;
    }

    if (foRecord) {
        this.rowHeight = foRecord.offsetHeight;
    }

    if (this.serviceObject.OPT.length > this.maxDisplayedRows) {
        fiWidth += 16; // scrollBar
        fiTableHeight = this.maxDisplayedRows * this.returnRowHeight();
    } else {
        fiTableHeight = this.serviceObject.OPT.length * this.returnRowHeight();
        fiTableHeight = Math.ceil(fiTableHeight + (this.serviceObject.OPT.length - 3));
    }
};


Service.prototype.renderPlaceHolder = function () {
    // Create a modal
    let dialogue = window.SCOPE.main.Dialogue.create(
        this.placeHolderID + window.SCOPE.session.SESSION.jobId,
        `<h3 slot="header">${this.serviceObject.TTL}</h3>
       <i slot="header" class="control-icon dialogue-close fas fa-times control-icon"></i>`,
        "none",
        'false',
        this.placeHolderClass
    );

    // Nothing too clever, just hook into the close function if a close event is fired
    dialogue.addEventListener('deleteDialogue', Service.close);

    // Add the session ID and the function type to the groups array
    dialogue.group.push(window.SCOPE.session.SESSION.jobId);
    dialogue.group.push('service');

    // If singleView then group it
    if (SESSION.isSingleView) {
        dialogue.group.push('singleView');
    }

    this.placeholder = dialogue; // XDOM.createElement("DIV", this.placeHolderID ,this.placeHolderClass);
};

Service.prototype.getSelectedValue = function () {
    this.selectedValue = XDOM.getObjectValue(this.targetId);
    if (this.selectedValue === null) {
        return;
    }	//in columnheading is er geen targetId
    this.selectedValue = this.selectedValue.toUpperCase();
    // escape is niet nodig voor zover we kunnen bepalen
    // deze is uitgeschakeld ten behoeven van POM-2244
    // this.selectedValue = escape(this.selectedValue);
};


Service.prototype.hide = function () {
    var obj = XDOM.getObject(this.displayId);
    if (obj) {
        obj.className = 'hidden';
    }
};


Service.prototype.init = function () {
    var foTarget = XDOM.getObject(this.targetId);

    if (this.isInitialized) {
        return;
    }
    this.isInitialized = true;

    this.getDefinition();

    //een displayPanel hoeft geen targetObj te hebben.
    if (this.type == ENUM.serviceType.display) {
        if (!foTarget) {
            this.targetId = this.id;
            foTarget = XDOM.getObject(this.targetId);
        }
    }

    if (!foTarget) {
        return;
    }

    if (this.serviceType == ENUM.serviceType.retrive) {
        this.setDescripion();
    } else {
        this.initSettings();
        //if (!this.recordNumber) {
        //   this.setHeaderEvents();
        // }
    }
};


Service.prototype.render = function () {
    this.getSelectedValue();
    this.renderPlaceHolder();
    this.renderTitleBar();
    this.renderTable();
    this.renderResults();
    this.setDimensions();

    // Should open dialogue here after the rest of the rubbish has been rendered
    let openPos;

    // Get the adjusted position to open based on event type (naturally oculus fires click events for everything, so we check if not by checking mouse client position)
    if (GLOBAL.eventObject._event.clientX > 0 && GLOBAL.eventObject._event.clientY > 0) {
        openPos = window.SCOPE.main.Dialogue.nestedMousePos(GLOBAL.eventObject._event, {x: 15, y: -50}); // window.SCOPE.page
    } else {
        openPos = window.SCOPE.main.Dialogue.nestedMousePos(GLOBAL.eventObject._event, {x: 0, y: 0}); // window.SCOPE.page
    }

    // Open
    window.SCOPE.main.Dialogue.open(this.placeholder, openPos);
};
Service.prototype.renderTable = function () {
    this.resultDiv = XDOM.createElement("DIV", "popContent");
    this.placeholder.appendChild(this.resultDiv);
};


Service.prototype.renderTitleBar = function () {
    /* Empty */
};

Service.prototype.getColumnWidth = function () {

    var codeLength = 0;

    for (var i = 0, l = this.serviceObject.OPT.length; i < l; i++) {

        if (this.serviceObject.OPT[i][0].length > codeLength) {
            codeLength = this.serviceObject.OPT[i][0].length;
        }
    }

    return codeLength;
};

Service.prototype.getOptionExpiredState = function (optionExpiredState) {

    var response = {};
    response.renderOption = true;
    response.renderOptionMode = null;


    if (!optionExpiredState) {
        return response;
    }

    if (!this.hasValidOptions) {
        if (!optionExpiredState || optionExpiredState !== "*EXPIRED") {
            this.hasValidOptions = true;
        } else {
            if (this.optionExpiredMode == ENUM.expiredOptions.allow) {
                this.hasValidOptions = true;
            }
        }
    }

    if (optionExpiredState) {
        switch (this.optionExpiredMode) {
            case ENUM.expiredOptions.allow:
            //optie is zichtbaar en mag ook gekozen worden
            case ENUM.expiredOptions.display:
                //optie is zichtbaar maar mag NIET gekozen worden
                break;
            default:
                response.renderOption = false;
                break;
        }
        response.renderOptionMode = this.optionExpiredMode;
    }

    return response;

}


Service.prototype.renderChoiceRecord = function (optionCount, optionState) {

    var optionCode = this.serviceObject.OPT[optionCount][0];
    var optionDescription = this.serviceObject.OPT[optionCount][1];
    var optionExpired = null;

    if (optionState) {
        optionExpired = optionState.renderOptionMode;
    }

    if (this.selectedValue === optionCode) {
        this.selectedIndex = optionCount;
    }
    optionCode = optionCode.replace(/ /g, '\u00a0');

    var optionRecord = XDOM.createElement("DIV", "POPTR_" + optionCount, "pointerCursor popupRow");
    var optionRecordOverlay = XDOM.createElement("DIV", null, "popupRowDisabled");
    var optionColumn_1 = XDOM.createElement("DIV", null, "txtAlignCenter popupCol");
    var optionColumn_2 = null;
    var optionColumn_3 = null;
    var optionButton = XDOM.createElement("DIV", "POPCHC_" + optionCount, "pth-icon radioBtn_icon");
    var optionColumnTxt = null;

    // Add a click event to the optionRecord
    optionRecord.addEventListener('click', Service.handleRowClick);

    optionColumn_1.appendChild(optionButton);
    optionRecord.appendChild(optionColumn_1);

    if (!this.TargetIsHidden) {
        optionColumn_2 = XDOM.createElement("DIV", null, "txtAlignLeft popupCol valueLength_" + this.columnCodeWidth);
        optionColumnTxt = XDOM.createElement("U");
        optionColumnTxt.setAttribute('data-service-select-index', optionCount);
        optionColumnTxt.appendChild(XDOM.createTextNode(optionCode.substr(0, 1)));
        optionColumn_2.appendChild(optionColumnTxt);

        optionColumn_2.appendChild(XDOM.createTextNode(optionCode.substring(1)));
        optionColumn_2.setAttribute('data-service-select-index', optionCount);

        optionRecord.appendChild(optionColumn_2);
    }

    optionColumn_3 = XDOM.createElement("DIV", null, "txtAlignLeft popupCol");
    optionColumn_3.appendChild(XDOM.createTextNode(optionDescription));

    switch (optionExpired) {
        case "*DISPLAY": //<== DISPLAY ONLY, NO SELECTION POSSIBLE
            optionRecord.appendChild(optionRecordOverlay);
            optionRecord.setAttribute('data-row-disabled', optionExpired);
            break;
        case "*ALLOW":	//<== DISPLAY WITH HIGHLIGHT, SELECTION POSSIBLE
            optionRecord.setAttribute('data-row-disabled', optionExpired);
            break;
    }

    optionRecord.appendChild(optionColumn_3);

    this.rows[optionCount] = optionRecord;

    optionRecord.setAttribute('data-service-select-index', optionCount);
    optionColumn_1.setAttribute('data-service-select-index', optionCount);
    optionColumn_3.setAttribute('data-service-select-index', optionCount);
    optionButton.setAttribute('data-service-select-index', optionCount);
    this.resultDiv.appendChild(optionRecord);
};

Service.prototype.renderDisplayRecord = function (optionCount, optionState) {
    var optionCode = this.serviceObject.OPT[optionCount][0];
    var optionDescription = this.serviceObject.OPT[optionCount][1];
    var optionRecordOverlay = XDOM.createElement("DIV", null, "popupRowDisabled");
    var optionExpired = null;

    if (optionState) {
        optionExpired = optionState.renderOptionMode;
    }

    if (this.selectedValue === optionCode) {
        this.selectedIndex = optionCount;
    }
    optionCode = optionCode.replace(/ /g, '\u00a0');

    var optionRecord = XDOM.createElement("DIV", "POPTR_" + optionCount, "popupRow");
    var optionColumn_1 = null;
    var optionColumn_2 = null;
    var optionColumn_3 = null;
    var optionColumnTxt = null;

    if (!this.TargetIsHidden) {
        optionColumn_1 = XDOM.createElement("DIV", null, "txtAlignLeft popupCol valueLenth_" + this.columnCodeWidth);
        optionColumn_2 = XDOM.createElement("DIV", null, "txtAlignCenter popupCol colSpacing");

        optionColumn_1.appendChild(XDOM.createTextNode(optionCode));
        optionColumn_2.appendChild(XDOM.createTextNode("-"));
        optionRecord.appendChild(optionColumn_1);
        optionRecord.appendChild(optionColumn_2);
    }
    optionColumn_3 = XDOM.createElement("DIV", null, "txtAlignLeft popupCol");
    optionColumn_3.appendChild(XDOM.createTextNode(optionDescription));

    switch (optionExpired) {
        case "*DISPLAY": //<== DISPLAY ONLY, NO SELECTION POSSIBLE
            optionRecord.appendChild(optionRecordOverlay);
            optionRecord.setAttribute('data-row-disabled', optionExpired);
            break;
        case "*ALLOW":	//<== DISPLAY WITH HIGHLIGHT, SELECTION POSSIBLE
            optionRecord.setAttribute('data-row-disabled', optionExpired);
            break;
    }

    optionRecord.appendChild(optionColumn_3);

    this.rows[optionCount] = optionRecord;
    this.resultDiv.appendChild(optionRecord);
};

Service.prototype.renderResults = function () {
    var fsTempText = "";
    var optionState = null;
    var totalOptionCount = this.serviceObject.OPT.length;

    this.TargetIsHidden = isHidden(this.targetId);
    this.columnCodeWidth = this.getColumnWidth();

    if ((totalOptionCount) > this.maxDisplayedRows) {
        this.resultDiv.style.overflowY = "auto";
    }

    for (var optionCounter = 0; optionCounter < totalOptionCount; optionCounter++) {
        optionState = null;
        if (this.serviceObject.OPT[optionCounter][0]) {

            if (this.serviceObject.OPT[optionCounter][2]) {  //==> Check if expired value isSet
                optionState = this.getOptionExpiredState(this.serviceObject.OPT[optionCounter][2]);

                if (optionState && !optionState.renderOption) {
                    this.serviceObject.OPT[optionCounter] = null; //==> Option is expired and hidden
                    this.serviceObject.OPT.splice(optionCounter, 1);
                    optionCounter--;
                    totalOptionCount--;
                    continue;
                }
            } else {
                this.hasValidOptions = true;
            }

            fsTempText = this.serviceObject.OPT[optionCounter][0] + this.serviceObject.OPT[optionCounter][1];
            if (fsTempText.length > this.maxTextLength) {
                this.maxTextLength = fsTempText.length;
            }
            if (this.TargetIsHidden) {
                this.index[optionCounter] = this.serviceObject.OPT[optionCounter][1].charAt(0); // array met 1e
            } else {
                this.index[optionCounter] = this.serviceObject.OPT[optionCounter][0].charAt(0); // array met 1e
            }

            this.renderRecord(optionCounter, optionState);
        }
    }
};

Service.prototype.getDescription = function (value) {
    var fsValue = value.toUpperCase();
    if (!this.serviceObject || !this.serviceObject.OPT) {
        return;
    }
    for (var i = 0, l = this.serviceObject.OPT.length; i < l; i++) {
        if (fsValue == this.serviceObject.OPT[i][0]) {
            return this.serviceObject.OPT[i][1];
        }
    }
    return '';
};

/**
 * zoekt de in de index de eerste positie op die gelijk is aan de ingedrukte
 * toets vanaf de positie van de huidige selectedIndex wordt deze niet gevonden
 * dan wordt er gezocht vanaf 0
 *
 */
Service.prototype.getIndexByKey = function () {
    for (var i = this.hoveredIndex + 1, l = this.index.length; i < l; i++) {
        if (GLOBAL.char.toUpperCase() == this.index[i].toUpperCase()) {
            return i;
        }
    }
    for (var i = 0; i < this.hoveredIndex; i++) {
        if (GLOBAL.char.toUpperCase() == this.index[i].toUpperCase()) {
            return i;
        }
    }
    return null;
};

Service.prototype.getIndexByString = function (searchString) {
    for (var i = 0; i < this.index.length; i++) {
        if (searchString.toUpperCase() == this.index[i].toUpperCase()) {
            return i;
        }
    }

    if (this.isSFLLineSelector && searchString) { // find index for subfile row indicator
        for (let i = 0, l = this.serviceObject.OPT.length; i < l; i++) {
            if (searchString == this.serviceObject.OPT[i][0]) {
                return i;
            }
        }
        //default value is "scherm vullend" when no index is fount this actualy means scherm vullend since this mode might return anything
        this.selectedIndex = 0;
        return 0;

    }

    return null;
};


/**
 * Registreer Service Function
 * @param fsToId =toekennen aan object
 * @param fsArrayId =Array ID
 * @param serverObjectName =Service object
 * @param serverType =Service type (*RTV || *DSP || *CHC || *LST || *CAL)
 * @param faVisible array met indexen (1 is eerste) van objecten die niet getoond moeten worden
 */


/**
 * Registreer Service Function
 * @param toId              toekennen aan object
 * @param iconId            id van icon die service functie aanroept
 * @param serverObjectName  Service object
 * @param serverType        Service type (*RTV || *DSP || *CHC || *LST || *CAL)
 * @param headingAxis       naam van axis als service functie in de heading van een subfile staat
 * @param serverAction      default geen actie behalve door user met de volgende mogelijkheden:
 *                              *CSR:    de choice/calender worden geopend wanneer mWS_CSR de waarde heeft van het TOID
 *                              *CSRBLK  de choice/calender worden geopend wanneer mWS_CSR de waarde heeft van het TOID en het veld TOID is leeg
 *                              *CSRERR  de choice/calender worden geopend wanneer mWS_CSR de waarde heeft van het TOID en mWS_MGL is 'F' (gaan er van uit dat de fout op het TOID is * gevonden)
 *                              *AUTOACT de choice/calender worden altijd worden geopend, maar slechts
 *                              maximaal 1 per scherm (eerste)
 * @param visible boolean  true als object getoond moeten worden
 */

Service.delayedOpenTimer = null;
Service.delayedOpenId = null;

/**
 * het updaten van retreve waarde
 */
Service.update = function () {
    var foPageObjects = XDOM.queryAllScope("[data-service-type='" + ENUM.serviceType.retrive + "']");
    for (var i = 0, l = foPageObjects.length; i < l; i++) {
        Service.retrive(foPageObjects[i]);
    }

};


Service.retriveRelated = function (foObject) {
    var foRetriveObject = XDOM.query("[data-to-id='" + foObject.id + "'][data-service-type='" + ENUM.serviceType.retrive + "']");
    if (GUI.Retrieve.update(foRetriveObject)) {
        return;
    }


    if (foRetriveObject) {
        Service.retrive(foRetriveObject);
    }
};

Service.retrive = function (obj) {
    // ***************************************************************************
    // Verkrijg de omschrijving van de code uit bijbehorende SSD
    // parms: this
    // return: --
    // ***************************************************************************
    var fsDescription = '';
    var foDisplay = obj;
    if (!foDisplay) {
        return;
    }

    var fsSource = obj.getAttribute("data-service-source");
    var fsToId = obj.getAttribute("data-to-id");
    var fsDisplayId = obj.getAttribute("data-service-id");
    var foTarget = null;
    foTarget = XDOM.getObject(fsToId);

    var fsValue = XDOM.getObjectValue(foTarget);
    var foServiceObject = Service.getDefinition(fsSource);
    if (foServiceObject.unavailable) {
        SCOPE.main.Dialogue.alert(fsSource + " " + foServiceObject.TTL  , "");
        return;
    }
    if (!fsValue || !fsValue.trim()) {
        fsValue = SESSION.activePage.headerData[fsToId];
    }
    if (!fsValue || !fsValue.trim()) {
        XDOM.setObjectValue(foDisplay, '');
        return;
    }

    for (var i = 0, l = foServiceObject.OPT.length; i < l; i++) {
        if (fsValue.toUpperCase() == foServiceObject.OPT[i][0].toUpperCase()) {
            fsDescription = foServiceObject.OPT[i][1];
            break;
        }
    }
    if (fsToId == 'WS_SFL' && !fsDescription) { // uitzondering voor subfile
        fsDescription = foServiceObject.OPT[0][1];
    }

    if (isHidden(foTarget)) {
        foDisplay.style.marginLeft = '0px';
    }

    XDOM.setObjectValue(foDisplay, fsDescription);
    return;
};


Service.getDefinition = function (serviceObjectName) {
    var serviceOpbjectFull = SESSION.activeFrame.name + '.' + serviceObjectName;
    var foReturn = getEval(serviceOpbjectFull);
    if (!foReturn) {
        foReturn = {};
        foReturn.TTL = getCapt('gNOSERVICEOBJECT');
        foReturn.OPT = [];
        foReturn.unavailable = true;
    }
    return foReturn;
};

Service.prototype.getDefinition = function () {
    this.serviceObject = Service.getDefinition(this.serviceObjectName);
};


Service.handleOnClick = function () {

    var fsId = GLOBAL.eventSourceElement.id;

    var fsType = XDOM.GLOBAL.getAttribute("data-service-type");//*CHC"
    if (!(fsType == ENUM.serviceType.display || fsType == ENUM.serviceType.choice)) {
        return false;
    }

    if (Service.currentService && Service.currentService.displayId == fsId) {
        Service.currentService.openByClick = true;
        return true;
    }

    if (Service.delayedOpenTimer) {
        clearTimeout(Service.delayedOpenTimer);
        Service.delayedOpenTimer = null;
    }


    var foService = Service.get(GLOBAL.eventSourceElement);

    foService.openByClick = true;
    foService.open();
    return true;
};

Service.handleMouseOver = function (e) {
    XDOM.getEvent(e);
    //stel dat er twee tegelijkertijd in progress zijn (vrijwel onmogelijk)
    if (Service.delayedOpenTimer) {
        clearTimeout(Service.delayedOpenTimer);
    }
    Service.delayedOpenId = GLOBAL.eventSourceElement.id;
    Service.delayedOpenTimer = setTimeout("Service.openDelayed()", Service.openDelay);
};


Service.handleMouseOut = function (serviceId) {
    //service is nog niet zichtbaar
    if (Service.delayedOpenTimer) {
        clearTimeout(Service.delayedOpenTimer);
    } else if (Service.currentService) {
        //service is zichtbaar
        if (!Service.currentService.openByClick) {
            Service.currentService.close();
        }
    }

    Service.delayedOpenTimer = null;

};

Service.openDelayed = function () {
    if (Service.currentService && Service.currentService.id == Service.delayedOpenId) {
        return;
    }
    var foService = Service.get(XDOM.getObject(Service.delayedOpenId));
    Service.delayedOpenTimer = null;
    if (!foService || foService.hidden) {
        return;
    } // -->


    foService.open();
};


function addAttributes(foObj) {
    FieldAttribute.apply(foObj);
    DataAttribute.apply(foObj);
    AttentionLevel.apply(foObj);
    ConditionalAttribute.apply(foObj);
}

Service.translate = function (source, value) {
    var serviceObject = Service.getDefinition(source);
    var description = null;
    for (var i = 0, l = serviceObject.OPT.length; i < l; i++) {
        if (value.toUpperCase() == serviceObject.OPT[i][0].toUpperCase()) {
            description = serviceObject.OPT[i][1];
            break;
        }
    }
    if (!description) {
        description = getCapt('gNOSERVICEOBJECT');
    }
    return description;
};

Service.retriveSFL = function (obj, target, display, recordValue) {
    // ***************************************************************************
    // Verkrijg de omschrijving van de code uit bijbehorende SSD
    // parms: this
    // return: --
    // ***************************************************************************
    var description = '';
    var value = recordValue || XDOM.getObjectValue(target);
    var source = obj.getAttribute("data-service-source");

    if (value) {
        value = value.trim();
    }

    if (!value) {
        XDOM.setObjectValue(display, '');
        return;
    }

    if (!display) {
        display = target;
    }
    description = Service.translate(source, value)


    if (isHidden(target)) {
        display.style.marginLeft = '0px';
    }

    if (display.previousSibling) {
        if (display.previousSibling.tagName == "OUTPUT") {
            display.previousSibling.setAttribute("data-hidden", "true");
        }
    }

    XDOM.setObjectValue(display, description);
    return;
};