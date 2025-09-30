/**
 * representatie van een pagina
 */
AJAX.Page = function () {
    this.dom = null;
    this.domString = '';
    this.header = {};
    this.headerData = {};
    this.macroSwitch = {};
    this.lastChangedMaskId = '';
    this.selectedObject = null;
    this.previousField = null;
    this.macroType = '';
    this.screenType = '';
    this.previousMacroType = '';
    this.lastErrorField = null;
    this.serviceIsActive = false; // status Service Function activated
    //this.activeButtonId = null; //actieve button onderaan scherm (controleren, uitvoeren, opvragen etc)
    this.subfile = null;
    this.lastFocusedField = '';
    this.autoSubmitInputObject = null;
    this.lastSelectedInput = null;
    this.modalObject = null;
    this.subfilePos = null;
    this.messageQueue = null;
    this.programResumed = null;
    this.cursorFocus = null;
    this.messageLevel = null;
    this.focusedCommand = null;
    this.programName = null;
    this.blockSearch = false;
    //this.fieldProgression = null;
    this.headerFileName = '';
    this.subfileName = '';
    this.pageUrl = '';
    this.triggers = {};
    this.controlerFields = {};
    this.resubmit = false;
};

AJAX.Page.returnToCaller = function () {
    var currentCacheKey = SESSION.popupStack.pop();
    SESSION.activePage = SESSION.pageStore[currentCacheKey];
    SESSION.activeData = SESSION.activePage.data;
};

AJAX.Page.setCallerCaller = function (macro) {
    SESSION.popupStack.push(macro);
};

/**
 * initalisatie van een pagepart
 * @param {type} data
 * @returns {undefined}
 */
AJAX.Page.prototype.updateData = function (data) {
    var macroProperties = data.macroProperties;
    this.data = data;
    this.macroSwitch = data.serverMacroSwitch;
    this.wizardState = null;
    this.header = data.headerAttributes; //SESSION.activeData.headerAttributes
    this.headerData = data.headerData; //SESSION.activeData.headerData
    this.subfileData = data.subfileData; //SESSION.activeData.subfileData
    this.subfileAttributes = data.subfileAttributes; //SESSION.activeData.subfileData
    this.subfileSelectionCount = data.subfileSelectionCount;
    this.subfileSelectedRecords = data.subfileSelectedRecords;
    this.viewProperties = data.viewProperties;
    this.autoSumFields =  this.viewProperties.autoSumFields;
    this.immediateSubmit = this.viewProperties.immediateSubmit;
    this.programParms = this.viewProperties.programParms;
    this.authorizationFields = this.viewProperties.fieldAuthorisation;
    this.cursorFocus = this.viewProperties.cursorFocus;
    this.messageLevel = this.viewProperties.messageLevel;
    this.focusedCommand = this.viewProperties.focusedCommand;
    this.messageQueue = this.viewProperties.messageQueue;
    this.createdExcelUrl = this.viewProperties.createdExcelUrl;
    this.programResumed = this.viewProperties.programResumed;
    //this.returnToCaller = this.viewProperties.returnToCaller;

    if (this.viewProperties.returnToCaller) {
        this.returnToCaller = this.viewProperties.returnToCaller.split(' ');
    }

    if (data.resubmitConstants) {
        this.resubmitConstants = data.resubmitConstants;
    }

    this.resubmitVariables = data.resubmitVariables;
    if (macroProperties) {
        this.macroProperties = data.macroProperties;
        this.headerFileName = macroProperties.headerFileName;
        this.subfileName = macroProperties.subfileName;
        this.macroType = macroProperties.macroType;
        this.screenType = macroProperties.screenType;
        this.programName = macroProperties.programName;
        this.macroName = macroProperties.macroName;
        this.loadedSubProcedure = macroProperties.loadedSubProcedure;
        this.screenSize = macroProperties.screenSize;
        this.autoRenew = macroProperties.autoRenew;
        this.retainFocusOnAccept = macroProperties.retainFocusOnAccept === '1';
        this.viewDataUri = macroProperties.viewDataUri;
        SESSION.pageStore[macroProperties.cacheKey] = this;
    } else {
        this.data.macroProperties = this.macroProperties;
    }
    if (data.wizardState) {
        this.wizardState = data.wizardState;
    }

};

AJAX.Page.prototype.setDom = function () {
    if (this.dom || this.domString) {
        if (this.dom === SESSION.activeForm) {
            return;
        }

        XDOM.removeDOMObject(SESSION.activeForm);
        SESSION.activeFrame.document.body.appendChild(this.dom);
        SESSION.activeForm = this.dom;

        return;
    }
    this.dom = SESSION.activeForm;
    this.dom.dataset.macroName = this.macroName;
    APP = SESSION.activeFrame.document;
    SCOPE.pageDoc = SESSION.activeFrame.document;
    SCOPE.page = SESSION.activeFrame;
};
AJAX.Page.prototype.setWizardURL = function () {
    if (!inWizard()) {
        return;
    }
    const app = SCOPE.session.wizardDefinition.steps.filter(d => d.stepCode == this.macroName, this)[0].stepAppCode;
    this.pageUrl = SESSION.alias + '/' + app + '/ndmctl/' + this.macroName + '.ndm/main?PFMJOBID=' + SESSION.jobId

}
/**
 *  zet de pageUrl voor deze pagina
 */
AJAX.Page.prototype.getURL = function () {
    if (this.screenType === '*SCH') {
        this.pageUrl = Search.currentInstance.getURL();
    } else if (SESSION.isSingleView) {
        if (this.wizardState) {
            this.setWizardURL()
            return;
        }
        this.pageUrl = TopView.currentInstance.getURL();
    } else {
        this.pageUrl = SESSION.stack.currentMacro.getCurrentUrl();
    }
};

AJAX.Page.prototype.autoRenewDom = function () {
    clearInterval(SESSION.stack.currentSession.autoRenewInterval);
    SESSION.stack.currentSession.autoRenewInterval = null;

    if (this.autoRenew) {
        if (this.autoRenew == '*NONE') {
            return;
        }
        SESSION.stack.currentSession.autoRenewInterval = setTimeout('autoRenew()', parseInt(this.autoRenew));
    }
};

/**
 * leest pas de dom aan en voert de permanente wijzigingen uit zoals: het zetten
 * van labels, het opmaken van maskers
 */
AJAX.Page.prototype.prepareDom = async function () {
    time('prepareDom (script)');
    SESSION.session.updateScope();
    //this.fieldProgression = new FieldProgression();
    if (this.viewProperties.dataAvailable === 'true') {
        InlineActionButton.prepare();
        Mask.prepareDom();
        oculusImage.prepareDom();

        Upload.prepareDom();
        Barcode.prepareDom();
        GUI.Signature.prepareDom();
        Subfile.prepareDom();
        SortButton.prepareDom();
        NAV.sessionLauncher.prepareDom();
        icons.prepareDom();
        FieldAttribute.prepareDom();
        GUI.infoTitle.prepareDom();
        QuickSearch.prepareDom();
        TopView.prepareDom();
        //  multiUpload.prepareDom();

    }
    MESSAGES.prepare();

    DevTools.renderToolBar();

    Command.prepareDom();

    Batch.prepareDom();
    setPrintButton();
    hideColourPicker();

    setLabels();
    setTitle();
    setHelpText();
    this.createProgramParams();
    SESSION.submitFromScope = 'MAIN';
    await this.updateDom();
    this.setFocusOnMain();
    SCOPE.main.directLink.update(window);
    timeEnd('prepareDom (script)');
};


AJAX.Page.prototype.setFocusOnMain = function(){
    //set the scope back to main just to be sure we get the right field
    //Stateless.Page.setScope(null);
    let obj = XDOM.getObject(SESSION.activePage.cursorFocus) || XDOM.getObject(this.mainSubmitField);
    //check if field is in a main page

    if(isStatelessObject(obj)){
        //field is not in main page use the mainSubmitField
        SESSION.activePage.cursorFocus =  this.mainSubmitField;
    }

    SESSION.activePage.cursorFocus = this.mainSubmitField

    setCursor('MAIN'); //in verband met ff cursor pas setten als pagina echt zichtbaar is
}

/**
 * determen if page is in overLay mode
 * @returns {boolean}
 */
AJAX.Page.prototype.isOverlay = () => {
    return (SESSION.activePage.screenType == "*SCH" || SESSION.isSingleView)
};

AJAX.Page.prototype.updateDom = async function () {
    time('updateDom (script)');
    let stateLessPromises = [];
    this.setDom();
    MAIN.focusMenu();
    if (this.viewProperties.programResumed === 'false') {
        closeAllModalObjects();
    }

    NAV.Stack.clearFields(this);
    KeepAlive.start();
    Mask.clearLastChanged();
    updateNav();
  //  MAIN.Theme.updateFromSession(SESSION.session);
    MAIN.SCREEN.handleMacroLoad(SESSION.activePage.screenSize, this.screenType, SESSION.isSingleView);
    this.getURL();
    SESSION.subScope = XDOM.getObject('SCRDIV'); //RKR Dit was de DTADIV alleen vallen objecten hier buiten.
    SESSION.activeData = this.data;
    this.mainSubmitField = this.data.viewProperties.cursorFocus;

    if (this.viewProperties.dataAvailable === 'true') {
        Subfile.clear();
        this.setValues();
        When.update();
        Modef.update();
        ActionCommand.update();
        stateLessPromises = updateStatelessParts()

        ActionCommand.updateDom();
        EditInfo.updateDom();
        Service.update();
        Upload.update();
        Barcode.update();
        INP.updateDom();
        MultiSelect.updateDom();
        SortButton.update();
        Link.update();
        MaxScale.update();
        FieldColors.update();
        Subfile.update();
        formatThousandAll();
        DataAttribute.update();
        AttentionLevel.update();
       // ConditionalAttribute.update();
        FieldAuthorization.update();
        icons.updateDom(this.headerData)
        GUI.infoTitle.update();
        GUI.Signature.update();
        updateDoubleSearchIcons(); //na when snelzoek en ConditionalAttribute
        Bi.update();
        Lines.update();
        NAV.sessionLauncher.update(); //na when snelzoek en ConditionalAttribute i.v.m. authorisatie
        //devTools.update();
        Wizard.update(SESSION);
        SingleUpload.update();
    }
    // SESSION.session.changeTheme();
    Command.update();
    Help.update();
    KeepAlive.update();
    //Messages.update();
    registerEvents();
    setfavourites();
    setTitle();
    setMessage(this.viewProperties.messageLevel, this.viewProperties.messageText, this.viewProperties.longMessageText);
    this.autoSubmitInputObject = null;

    //executeNextAction(); // uitvoeren van eventueel overschakelen naar ander procedure of subprocedure

    SESSION.submitInProgress = false;
    SESSION.session.cancelBlurEvent = false;
    SESSION.stack.currentSession.clearRetrieveJobSts();
    Batch.update(); //als laatste in verband met SESSION.submitInProgress


    //await all promisses before closing the topview

    await Promise.all(stateLessPromises);

    //update ConditionalAttribute.update
    //this is done after the resolving of the stateless promis because in developer mode innerHTML will be renewed
    //when a subview is set to protect this will be overwritten in the renew off the subview stateless content
    ConditionalAttribute.update();



    if (SESSION.isSingleView) {
        if (this.viewProperties.autoClose == 'true') {
            TopView.close();
        }
    }

    MacroTab.updateFromMain();
    SCOPE.main.Favourites.updateDom();
    Service.autoOpen();


    SESSION.subScope = null;

    //insertTestElement()


    var flashFrame = XDOM.getObject('antiFlashFrame');
    flashFrame.contentDocument.body.innerHTML = '';
    flashFrame.style.display = 'none';
    timeEnd('updateDom (script)');
    timeEnd('post (totaal)');
    timeEnd('get (totaal)');


    releasePage();
};

function updateStatelessParts() {
  return  [
    ...GUI.InfoWindow.updateDom(),
    ...GUI.EditWindow.updateDom(),
    ...QuickSearch.updateDom(), //let op quicksearch na search in verband met dubbele zoek;
    ...QueryList.updateDom()
    ]
}

//partialUpDate

AJAX.Page.prototype.partialUpDate = async function (data) {
    KeepAlive.start();
    //updating fields
    const autoSumFields = XDOM.queryAll('[data-auto-sum="true"]');
    autoSumFields.forEach(field=>{

        const value = data[field.id];
        if(value){
            // console.log(`set value ${value} to ${field.id}`);
            XDOM.setObjectValue(field,value);
        }
    })


    releasePage()
    showLoading(false);
    SESSION.submitInProgress = false;
}

AJAX.Page.prototype.reNew = async function (res) {
    if (SESSION.session.debugMode) {
        SESSION.activePage.devModeReNew(res.pageDef, res.data);
        return;
    }

    setFrames(SESSION.activePage.screenType);
    this.updateData(res.data);
    await this.updateDom();
    showFrame(SESSION.activePage.screenType);
    SESSION.submitFromScope = 'MAIN';
    Subfile.setScrollPos();

    this.autoRenewDom();

    //set cursor again because stateless pages might have changed the cursor
    // SESSION.activePage.cursorFocus =  SESSION.mainSubmitField;
    this.setFocusOnMain();
    //reset resubmit this is used for stateless parts top indicate the part is reloaded from the same context
    this.resubmit = false;
};

AJAX.Page.loadScriptTagPromised = function (uri, onload) {
    return new Promise(function (resolve, reject) {
        const scriptObj = XDOM.createElement('script'),
            parent = SESSION.activeFrame.document.getElementsByTagName('head')[0];

        scriptObj.src = uri;
        scriptObj.onload = function () {
            onload();
            resolve();
        }
        scriptObj.onError = function (error) {
            reject(error, scriptObj);
        }
        parent.appendChild(scriptObj);
    });
};

AJAX.Page.loadScriptTag = function (uri, onload) {
    var scriptObj = XDOM.createElement('script'),
        parent = SESSION.activeFrame.document.getElementsByTagName('head')[0];
    scriptObj.src = uri;
    scriptObj.onload = onload;
    parent.appendChild(scriptObj);
};
AJAX.Page.prototype.devModeReNew = function (pageDef, data) {
    var scriptObj = null,
        parent = null,
        formObj = null;

    setFrames(SESSION.activePage.screenType);
    showFrame(SESSION.activePage.screenType);
    this.dom = null;

    parent = SESSION.activeFrame.document.getElementsByTagName('body')[0];
    formObj = SESSION.activeFrame.document.getElementsByTagName('form')[0];

    //omdat IE anders zijn referentie kwijt is
    XDOM.removeDOMObject(formObj);

    parent.innerHTML = pageDef;
    SESSION.activePage.domCaptions = new Captions(data);

    SESSION.activePage.updateData(data);
    SESSION.activeData = data;
    XDOM.removeDOMObject('captionDef');

    scriptObj = XDOM.createElement('script', 'captionDef', null);
    scriptObj.src = SESSION.activePage.viewDataUri;
    scriptObj.onload = AJAX.onload;

    parent = SESSION.activeFrame.document.getElementsByTagName('head')[0];
    parent.appendChild(scriptObj);
    time('load text script (server)');
};

AJAX.Page.updateAfterIpmfSubmit = function () {
    //small reset after submit
    KeepAlive.start();
    Command.update();
    SESSION.submitInProgress = false;
    SESSION.session.cancelBlurEvent = false;
    releasePage();
    return;
};

AJAX.Page.newPage = function (pageDef, data) {
    var scriptObj = null,
        parent = null,
        headObj = '',
        formObj = null,
        flashFrame = null;
    setFrames(data.macroProperties.screenType);
    showFrame(data.macroProperties.screenType);

    parent = SESSION.activeFrame.document.getElementsByTagName('body')[0];
    formObj = SESSION.activeFrame.document.getElementsByTagName('form')[0];
    headObj = SESSION.activeFrame.document.getElementsByTagName('head')[0];
    flashFrame = XDOM.getObject('antiFlashFrame');


    if (data.macroProperties.screenType != '*SCH') {
        if (formObj) {
            flashFrame.contentDocument.body.innerHTML = parent.innerHTML;
        }
        flashFrame.style.display = 'block';
    }
    //omdat IE anders zijn referentie kwijt is
    XDOM.removeDOMObject(formObj);

    parent.innerHTML = pageDef;
    SESSION.activePage = new AJAX.Page();
    SESSION.activePage.domCaptions = new Captions(data);
    SESSION.activePage.updateData(data);
    SESSION.activeData = data;

    TopView.addNavigationToFrame(data.macroProperties.screenType);

    XDOM.removeDOMObject('captionDef');

    scriptObj = XDOM.createElement('script', 'captionDef', null);
    scriptObj.src = SESSION.activePage.viewDataUri;
    scriptObj.onload = AJAX.onload;
    headObj.appendChild(scriptObj);
    time('load text script (server)');
};

AJAX.Page.prototype.setValues = function () {
    var obj = null;
    for (var fieldName in this.headerData) {
        obj = XDOM.getObject(fieldName);
        if (obj) {
            XDOM.setObjectValue(obj, this.headerData[fieldName]);
            setOldValue(obj);
        }
    }
    var outputs = XDOM.queryAllScope('[data-value-from-id]');
    for (var i = 0, l = outputs.length; i < l; i++) {
        obj = outputs[i];
        XDOM.setObjectValue(obj, this.headerData[obj.getAttribute('data-value-from-id')]);
    }

    var clearInputs = XDOM.queryAllScope("[data-clear-after-submit='true']");
    for (var i = 0, l = clearInputs.length; i < l; i++) {
        obj = clearInputs[i];
        XDOM.setObjectValue(obj, '');
    }
};

/**
 * zet het subfile record op positie fiCursorPos
 * als fiCursorPos==null dan wordt de single line data als current record gezet
 * @param fiCursorPos
 */
AJAX.Page.prototype.setRecord = function (fiCursorPos) {
    if (SESSION.activeFrame.IdfJSON) {
        if (fiCursorPos === null) {
            this.header = SESSION.activeFrame.IsfJSON.SubfileAttributes[fiCursorPos];
        } else {
            this.header = SESSION.activeFrame.IdfJSON.HeaderAttributes;
        }
    }
    if (!this.header) {
        this.header = {};
    }
};

/**
 * verlaten van de pagina
 */
AJAX.Page.onblur = function () {
    Mask.CheckChanged();
};

AJAX.Page.prototype.createProgramParams = function () {
    for (var field in this.programParms) {
        XDOM.createInputField(field, '');
    }
};

function insertTestElement(){
    console.warn('insertTestElement remove this code');
    const placeHolder = XDOM.getObject('DTADIV');
    const testElement = document.createElement('div');
    if(placeHolder.querySelector('.camera-button')) return;
    testElement.className = "xpos026 line1 fa fa-camera dataSectionButton  theme-hover-color camera-button"
    testElement.addEventListener("click",()=>{
        new Camera(placeHolder);
    } )

    placeHolder?.appendChild(testElement);

}