Stateless.Page = function (contentParentId, response, partLogic) {
    this.lastFocusedField = null;
    this.data = response.data;
    this.captionsDftLang = this.data.captionsDftLang;
    this.macroProperties = response.data.macroProperties;
    this.id = response.calerId;
    this.sourceLocation = response.sourceLocation;
    this.resubmitConstants = this.data.resubmitConstants;
    this.macroName = response.macroName;
    this.parentId = contentParentId;
    this.parentPage = SESSION.activePage;
    this.prefix = this.id + '-';
    this.partLogic = partLogic;
    this.acceptHandler = this.partLogic.accept || this.partLogic.submit; //bij geen ok handler submit gebruiken
    this.submitHandler = this.partLogic.submit;
    this.resetHandler = this.partLogic.reset;
    this.enterHandler = this.partLogic.enter;
    this.closeHandler = this.partLogic.close;
    this.type = this.partLogic.pageType;
    this.fixHTML = this.partLogic.fixHTML;
    this.onReturnOkHandler = this.partLogic.onReturnOk;
    this.screenMode = ENUM.screenMode.modal;
    this.createdExcelUrl = '';
    this.additionalValues = {};
    this.inputIsChanged = false;
    this.footerHeight = 0;
    this.toId = '';
    this.loading = false;
    this.subfile = null;
    this.init(response);
};

Stateless.Page.store = {};

/**
 * voegt data aan met het WS_PMT veld
 * als dit van toepassing is.
 * @param {type} data
 * @returns {undefined}
 */

Stateless.Page.prototype.setPromptField = function (data) {
    let obj = SESSION.activePage.lastSelectedInput || GLOBAL.eventSourceElement,
        promptField = '',
        current = getCurrendFocused();

    if (current && current.dataset.statelessPageId == this.id) {
        obj = current;
    }
    promptField = getlastSelectedInputId(obj).replace(this.prefix, '');
    this.lastFocusedField = obj;
    if (obj && obj.dataset.statelessPageId != this.id) {
        promptField = '';
    }
    data.append('WS_PMT', promptField);
};

/**
 * toont of verbergt de protectdiv
 * @param {boolean} show als true dan wordt de protectdiv getoond
 * @returns {void}
 */
Stateless.Page.prototype.toggelProtected = function (show) {
    var protectDiv = XDOM.query(
            ".stateless-protect[data-stateless-page-id='" + this.id + "']"
        ),
        footer = XDOM.query(
            ".stateless-panel-footer[data-stateless-page-id='" + this.id + "']"
        );

    if (!protectDiv || !footer) {
        return;
    }

    setSubviewLoading(protectDiv, show);
    if (show) {
        this.loading = true;
        protectDiv.style.display = 'block';
        footer.setAttribute('data-message-status', 'loading');
    } else {
        protectDiv.style.display = 'none';
        footer.setAttribute('data-message-status', 'default');
        this.loading = false;
    }
};

/**
 * valideerd en submit form data naar de macro van de page
 * @returns {undefined}
 * @param command
 */
Stateless.Page.prototype.submit = function (command) {

    if (this.loading) {
        return;
    }

    const request = new Stateless.request({page: this});

   this.setFormData(request)

    request.data.append('WS_CMD', command);
    this.toggelProtected(true);
    Stateless.setSubviewActive(GLOBAL.eventSourceElement);
    request.post();
    XDOM.cancelEvent();
};


Stateless.Page.prototype.setFormData = function (request) {
    const formObjects = XDOM.queryAll(
        "input[data-stateless-page-id='" +
        this.id +
        "'], textarea[data-stateless-page-id='" +
        this.id +
        "']"
    );
    let formInput = null;
    let name = '';
    let value = '';

    this.setPromptField(request.data);

    for (let name in this.additionalValues) {
        request.data.append(name, this.additionalValues[name]);
    }
    for (let i = 0, l = formObjects.length; i < l; i++) {
        formInput = formObjects[i];
        if (!Validate.test(formInput)) {
            return;
        }
        name = formInput.name.replace(this.prefix, '');
        value = formInput.value
        if (formInput.getAttribute("data-unicode") == "true") {
            value = XDOM.hexEncode(value);
        }
        request.data.append(name, value);
    }
    if (this.subfile) {
        let lastRenderdRecord = this.subfile.sflObject.index;
        let nonRenderdRecords = this.data.subfileData.slice(lastRenderdRecord);
        if (this.data.removedSubfileData) {
            nonRenderdRecords = nonRenderdRecords.concat(
                this.data.removedSubfileData
            );
        }
        this.subfile.sflObject.addAdditionalRecords(
            nonRenderdRecords,
            request.data
        );
    }
}

Stateless.Page.prototype.setStatelesPageId = function () {
    var id = this.id;
    XDOM.forEach('*', function (obj) {
        obj.setAttribute('data-stateless-page-id', id);
    });
};

Stateless.Page.prototype.setAdditionValue = function (name, value) {
    this.additionalValues[name] = value;
};

Stateless.Page.prototype.setHtml = function (htmlIn) {
    const body = XDOM.getObject(this.parentId);
    let html = htmlIn.replaceAll('#PanelPfx-', this.prefix);
    html = html.replaceAll('#PanelPfx', this.prefix);
    body.innerHTML = html;
};

/**
 * Args kan de volgende members hebben
 id: unique id van de pagina definitie, (verplicht)
 html: html content,
 data: alle data die nodig is (verplicht)
 }

 als de pagina eerder aangeroepen is wordt deze uit de Stateless.Page.store worden gehaald,
 en wordt er een update gedaan op basis van de nieuwe data
 in andere gevallen wordt de html content in de pagina gezet en wordt deze eerst behandeld
 door prepare html en prepare dom
 * @param {type} id  default id heeft de waarde van het global event object attribute data-stateless-page-id
 * @returns {pageObject}
 */

Stateless.Page.get = function (id) {
    var pageId =
        id ||
        XDOM.GLOBAL.getAttribute('data-stateless-page-id') ||
        XDOM.getParentAttribute(
            GLOBAL.eventSourceElement,
            'data-stateless-page-id'
        );
    return Stateless.Page.store[pageId];
};

/**
 * zet de scope naar die van de stateless page en weer terug
 */
Stateless.Page.onFocus = function () {
    var page = Stateless.Page.get();
    Stateless.Page.setScope(page);
};

Stateless.Page.command = function (command) {
    return Stateless.Page.submit(command);
};

/**
 * set subscope en activeData id kan leeg, een string of een domobject zijn
 * als leeg dan wordt de subScope en activedata hersteld naar algemene niet static waarden
 * @param {type} id
 * @returns {undefined}
 */
Stateless.Page.set = function (id) {
    Stateless.Page.setScope();
    var pageId = id,
        page = null;
    if (!id) {
        return;
    }
    if (id.getAttribute) {
        pageId = id.getAttribute('data-stateless-page-id');
    }
    if (!pageId) {
        return;
    }
    page = Stateless.Page.get(pageId);
    if (!page) {
        return;
    }
    Stateless.Page.setScope(page);
};

/**
 * maken nieuwe pagina
 * @param {type} id
 * @param {type} res
 * @param {type} partLogic overkoepelend static clas met logica waarvan page onderdeel uit maakt
 * @returns {Stateless.Page|Stateless.Page.new.page}
 */
Stateless.Page.new = function (id, response, partLogic) {
    var page = new Stateless.Page(id, response, partLogic);
    page.update(response);
    return page;
};

Stateless.Page.update = function (response) {
    var id = response.calerId,
        page = Stateless.Page.store[id];
    if (page) {
        page.update(response);
    }
};

Stateless.Page.prototype.prepareQuickSearch = function () {
    QuickSearch.prepareDom();
};

Stateless.Page.prototype.prepareParamObjects = function () {
    var objects = SESSION.subScope.querySelectorAll('[data-parm-object]'),
        obj = null,
        requestObj = null;
    for (var i = 0, l = objects.length; i < l; i++) {
        obj = objects[i];
        requestObj = JSON.stringify(obj.dataset.paramObject);

        //this.prefix
    }
};

Stateless.Page.prototype.prepareLoader = function () {
    var body = XDOM.getObject(this.parentId),
        loader = XDOM.createElement('DIV', null, 'stateless-loader'),
        blocker = XDOM.createElement('DIV', null, 'stateless-protect');

    blocker.setAttribute('data-stateless-page-id', this.id);
    body.appendChild(blocker);
    blocker.appendChild(loader);
};

Stateless.Page.prototype.setLabels = function () {
    var captions = this.data.captionsDftLang,
        lables = SESSION.subScope.getElementsByTagName('label');
    for (var i = 0, l = lables.length; i < l; i++) {
        lables[i].innerHTML =
            captions[lables[i].id.replace(this.prefix, '')] || ' ';
    }
    return;
};

/**
 * zorgt dat alle onderdelen met een field progrorgession op de juiste manier worden gezet
 * @returns {undefined}
 */
Stateless.Page.prototype.setFieldProgression = function () {
    if (!SESSION.subScope.dataset.fieldprogressionIndex) {
        fp.setIndex(SESSION.subScope);
    }
    Subfile.setHeaderBodyRef(this.prefix);
};

/**
 * na een response van de pagina wordt de onReturnOkHandler aangeroepen als de
 * returncode WS_RTN de waarde "OK" heeft
 * @returns {Stateless.Page.partLogic.onReturnOk}
 */
Stateless.Page.prototype.handleReturnCode = function () {
    //na submit altijd een multiselect sluiten. Wanneer een Multiselect ook een returncode teruggeeft kan weer worden verwijderd.
    //if(this.type == "MultiSelect"){
    // Stateless.panel.close(this.id);
    //}
    if (this.data.headerData.WS_RTN === 'OK') {
        if (this.onReturnOkHandler) {
            return this.onReturnOkHandler();
        }
    }
};

/**
 *
 * als deze pagina behoord tot het type
 */
Stateless.Page.prototype.appendset = function (response) {
    if (this.subfile) {
        Stateless.Page.setScope(this);

        if (this.subfile.append(response.data)) {
            this.toggelProtected(false);
            Stateless.Page.setScope();
            return true;
        }
        Stateless.Page.setScope();
    }

    return false;
};

/**
 * let op deze functie wordt toegewezen aan het request object waardo0r this naar de instantie
 * van het request object zelf verwijst
 * deze functie is niet static gemaakt maar als instantie alleen maar om het door te kunnen geven naar het request object
 * @param {type} response
 * @returns {undefined}
 */
Stateless.Page.prototype.onResponse = function (response) {
    if (this.page.appendset(response)) {
        return;
    }
    this.page.data = response.data;
    this.page.inputIsChanged = false;
    if (this.page.handleReturnCode()) {
        return;
    }
    if (response.html) {
        this.page.setHtml(response.html);
        this.page.subfile = new Stateless.subfile(this.page);
        this.page.prepareDom();
    }
    this.page.update(response);
};

/**
 * beperkt de globale scoop naar een Stateless.page of
 * als page = null weer naar de onderliggende statefull pagina
 * @param {Stateless.Page} page
 * @returns {void}
 */
Stateless.Page.setScope = function (page) {
    if (page) {
        SESSION.subScope = XDOM.getObject(page.parentId);
        SESSION.activeData = page.data;
    } else if (SESSION.activePage) {
        SESSION.subScope = null;
        SESSION.activeData = SESSION.activePage.data;
    }
};

Stateless.Page.prototype.init = function (response) {
    var callerObject = XDOM.getObject(this.id);
    this.screenMode = callerObject.dataset.screenMode;
    this.registerTrigger(callerObject);
    this.toId = callerObject.dataset.toId;
    this.setHtml(response.html);
    this.subfile = new Stateless.subfile(this);

    Stateless.Page.store[this.id] = this;
    this.prepareDom();
};

Stateless.Page.prototype.prepareDom = function () {
    Stateless.Page.setScope(this);
    this.prepareLoader();
    this.prepareParamObjects();
    this.setStatelesPageId();
    this.setLabels();
    Mask.prepareDom();
    oculusImage.prepareDom();
    Upload.prepareDom();
    Barcode.prepareDom();
    GUI.Signature.prepareDom();
    MultiSelect.prepareDom();
    this.subfile.prepare();
    SortButton.prepareDom();
    NAV.sessionLauncher.prepareDom();
    icons.prepareDom(SESSION.subScope);
    FieldAttribute.prepareDom();
    GUI.infoTitle.prepareDom();
    //Help.prepareDom();
    this.prepareQuickSearch();
    TopView.prepareDom();
    //Command.prepareDom();
    Batch.prepareDom();
    this.setFieldProgression();
    setHelpText();
    this.setExport();
    Stateless.Page.setScope();
};


/**
 * checks for hidden and disabled
 */
Stateless.Page.prototype.updateExport = function () {
    //search in the parent of the subscope for the icon
    const icon = SESSION.subScope.parentElement.querySelector('.fa-file-excel-o.header-button.right');
    //do we have export?
    if (!icon) return;

    //get the indicator fields out
    const {excelButtonHiddenIndicator = '', excelButtonAvailableIndicator = ''} = this.macroProperties;

    //set the indicators
    const hidden = (this.data.headerData[excelButtonHiddenIndicator] == '1')
    const disabled = (this.data.headerData[excelButtonAvailableIndicator] == '0') ;

    //update the state
    icon.setAttribute('data-button-state', disabled ? 'disabled' : '');
    icon.setAttribute('data-hidden', hidden);
}
/**
 * show excel button in header if this is defined
 */
Stateless.Page.prototype.setExport = function () {
    //check do we need an excel button?
    if (!this.macroProperties.excelButton) {
        return;
    }

    //check if this button allready exists:
    if(SESSION.subScope.parentElement.querySelector(".panelHeader > .fa-file-excel-o")){
        //see if button actualy allready exists, if so do nothing
        return;
    }

    //create Icon
    const icon = XDOM.createElement('I', null, "fa fa-file-excel-o header-button right");
    icon.title = getCapt('cCRTXLS_TTL');
    icon.setAttribute("data-stateless-page-id", this.id)
    // get the header
    const header = SESSION.subScope.parentElement.querySelector(".panelHeader");



    if (!header) { //no header so quit
        return;
    }

    // add the page-id so at on click we know what page this belongs to.
    // icon.setAttribute('data-stateless-page-id', this.id);

    header.appendChild(icon)

    //add handler
    icon.addEventListener('click', e => {
        //needs to be done to get to the right page
        XDOM.getEvent(e);
        if (XDOM.GLOBAL.getAttribute('data-button-state') === 'disabled') {
            return;
        }
        //submit for excel export
        Stateless.Page.command("CRTXLS");
    })

}
Stateless.Page.prototype.setValues = function () {
    var obj = null;
    var data = this.data.headerData;
    for (var fieldName in data) {
        obj = XDOM.getObject(this.prefix + fieldName);

        if (obj && obj.tagName !== 'LABEL') {
            XDOM.setObjectValue(obj, data[fieldName]);
            setOldValue(obj);
        }
    }

    var outputs = XDOM.queryAll('[data-value-from-id]:not([data-axis])');
    for (var i = 0, l = outputs.length; i < l; i++) {
        obj = outputs[i];
        XDOM.setObjectValue(obj, data[obj.getAttribute('data-value-from-id')]);
    }

    var clearInputs = XDOM.queryAll("[data-clear-after-submit='true']");
    for (var i = 0, l = clearInputs.length; i < l; i++) {
        obj = clearInputs[i];
        XDOM.setObjectValue(obj, '');
        obj.setAttribute('data-old-value', '');
    }
};

Stateless.Page.prototype.resetMessage = function () {
    var commandBar = XDOM.query('.stateless-panel-message'),
        msgP = XDOM.query('.stateless-panel-message p');
    if (!commandBar) {
        return;
    }
    commandBar.setAttribute('data-message-status', '');
    msgP.innerHTML = '';
};

Stateless.Page.prototype.setMessage = function (message, level) {
    var commandBar = XDOM.query('.stateless-panel-message');
    if (!commandBar) {
        return;
    }
    if (message == '' && level == '') {
        this.resetMessage();
        return;
    }
    var msgP = XDOM.query('.stateless-panel-message p'),
        messageLevel = level || this.data.viewProperties.messageLevel,
        messageText =
            message ||
            this.data.headerData.WS_ERR ||
            this.data.viewProperties.messageText ||
            '',
        messageObject = ERRORMESSAGES[messageText];

    if (messageText && messageObject) {
        messageText = messageObject.caption;
        messageLevel = messageObject.messageLevel;
    }
    messageLevel =
        ENUM.attentionLevelToMessageStatus[messageLevel] || messageLevel;
    commandBar.setAttribute('data-message-status', messageLevel);
    msgP.innerHTML = messageText;
};

Stateless.Page.prototype.setTitle = function () {
    if (!this.data.viewProperties) {
        return;
    }
    var titleText =
        getCapt('cTX_SSN') +
        ': ' +
        this.data.viewProperties.jobNbr +
        ' \x0A' +
        getCapt('cTX_PGM') +
        ': ' +
        this.macroName;
    Stateless.panel.updateTitle(this.id, titleText);
};
Stateless.Page.prototype.updateData = function (response) {
    //set the data
    this.data = response.data;

    //because sometimes captions are included in the data set but the might not be we save an old set off captions to reuse
    //check if we have new captions
    if(this.data.captionsDftLang){
        //we have new captions asign them
        this.captionsDftLang = this.data.captionsDftLang;
    }else{
        //we have no new captions so assign the old captions to the data set
        this.data.captionsDftLang = this.captionsDftLang
    }

    this.createdExcelUrl = this.data.viewProperties.createdExcelUrl;
}
Stateless.Page.prototype.update = function (response) {
    this.inputIsChanged = false;
    this.updateData(response);
    this.invoke = response.invoke;
    Stateless.Page.setScope(this);
    this.setMessage();
    this.setValues();
    When.update();
    GUI.InfoWindow.updateDom();
    GUI.EditWindow.updateDom();
    Service.update();
    Upload.update();
    Barcode.update();
    INP.updateDom();
    SortButton.update(this.prefix);

    MaxScale.update();
    FieldColors.update();
    this.subfile.update(this.data);
    formatThousandAll();
    DataAttribute.update();
    AttentionLevel.update();
    ConditionalAttribute.update();
    FieldAuthorization.update();
    GUI.infoTitle.update();
    GUI.Signature.update();
    updateDoubleSearchIcons(); //na when snelzoek en ConditionalAttribute

    icons.updateDom(this.headerData, SESSION.subScope)
    MultiSelect.update(this);
    registerEvents();
    this.updateExport();
    this.toggelProtected(false);
    this.setFocus();
    // Link.update needs to go last.
    // The invocation of the click event will set the sub-scope to null
    // (returning it to the outer main page)
    Link.update(this.createdExcelUrl);
    Stateless.Page.setScope();
    this.setTitle(); //title valt buiten de scope van de pagina in zijn container
};

Stateless.Page.prototype.focusFirstField = function () {
    //zoek het eerste de beste te focusen element
    focusField = SESSION.subScope.querySelector(
        "input:not([data-hidden='true']), textarea:not([data-hidden='true']), a:not([data-hidden='true'])"
    );
    if (focusField) {
        focusField.focus();
        return;
    }
    //er is nog steeds geen veld gevonden maak een veld aan om op te focusen
    focusField = XDOM.createElement('input');
    focusField.style.display = 'none';
    SESSION.subScope.appendChild(focusField);
    focusField.focus();
};

Stateless.Page.prototype.setFocus = function () {
    let field = this.data.headerData.WS_CSR || this.lastFocusedField;
    SESSION.activePage.cursorFocus = this.prefix + field;
    setCursor(this.id);
    return;
};

Stateless.Page.prototype.renderFooter = function () {
    var footer = XDOM.createElement(
            'DIV',
            this.prefix + 'footer',
            'stateless-panel-footer'
        ),
        messageDiv = XDOM.createElement('DIV', null, 'stateless-panel-message'),
        messagePlaceholder = XDOM.createElement('P'),
        saveButton = XDOM.createElement(
            'DIV',
            null,
            'stateless-accept-icon pth-icon'
        ),
        panelFooterButtonsPlaceHolder = XDOM.createElement(
            'DIV',
            null,
            'stateless-panel-buttons'
        ),
        refreshButton = XDOM.createElement(
            'DIV',
            null,
            'stateless-reset-icon pth-icon'
        );

    footer.appendChild(messageDiv);
    footer.appendChild(panelFooterButtonsPlaceHolder);
    messageDiv.appendChild(messagePlaceholder);
    panelFooterButtonsPlaceHolder.appendChild(saveButton);
    panelFooterButtonsPlaceHolder.appendChild(refreshButton);

    saveButton.setAttribute('data-stateless-page-id', this.id);
    saveButton.setAttribute('data-click-action', 'Stateless.Page.accept');
    refreshButton.setAttribute('data-stateless-page-id', this.id);
    refreshButton.setAttribute('data-click-action', 'Stateless.Page.reset');
    SESSION.subScope.appendChild(footer);
    this.footerHeight = footer.offsetHeight;
};
/**
 * opnieuw laden van pagina
 * als er een subfile in zit dan moeten alle regels van die subfile ook bij worden geladen
 * @pageId {string}
 */
Stateless.Page.reload = function (pageId) {
    let page = Stateless.Page.get(pageId);
    if (!page) {
        return false;
    }
    if (page.subfile) {
        page.subfile.setForReload();
    }
    page.submit('RELOAD');
    return true;
};

Stateless.Page.submit = function (command) {
    var page = Stateless.Page.get();
    if (!page) {
        return false;
    }
    page.submit(command);
    return true;
};

Stateless.Page.enter = function () {
    var page = Stateless.Page.get();
    if (page.enterHandler) {
        page.enterHandler();
        return;
    } //geen ok handler doe een submit
    if (page.submit) {
        page.submit('ENTER');
    }
};

Stateless.Page.accept = function () {
    var page = Stateless.Page.get();
    if (page.acceptHandler) {
        page.acceptHandler();
        return;
    } //geen ok handler doe een submit
    if (page.eventHandler.submit) {
        page.eventHandler.submit(page);
    }
};

Stateless.Page.reset = function () {
    var page = Stateless.Page.get();
    if (page.resetHandler) {
        page.resetHandler(page);
    }
};

/**
 *
 * @param {String} value
 * @returns {String}
 */
Stateless.Page.getCaption = function (value) {
    var result = null;
    if (SESSION.activeData.captionsUserLang) {
        result = SESSION.activeData.captionsUserLang[value];
    }
    if (!result && SESSION.activeData.captionsDftLang) {
        result = SESSION.activeData.captionsDftLang[value];
    }

    return result;
};

Stateless.Page.handleKeyDown = function () {
    var page = Stateless.Page.get();
    if (!page) {
        return false;
    }
    if (
        GLOBAL.charCode === keyCode.enter &&
        !XDOM.GLOBAL.getBooleanAttribute('data-block-autosubmit')
    ) {
        page.acceptHandler();
        return true;
    }
    return false;
};

/**
 * controleerd of de stateles pagina bij het
 * @returns {Boolean}
 */
Stateless.Page.isLoading = function () {
    var page = Stateless.Page.get();
    if (page && page.loading) {
        XDOM.cancelEvent();
        return true;
    }
    return false;
};

Stateless.Page.inputOnChange = function (obj) {
    var pageId = obj.getAttribute('data-stateless-page-id'),
        page = Stateless.Page.get(pageId);
    if (!page) {
        return false;
    }
    Stateless.Page.setScope(page);
    //verandering in de selectie van de multiselect tellen niet mee voor het
    //zetten van de onchange flag
    if (MultiSelect.onChange(page)) {
        return true;
    }
    page.resetMessage();
    Stateless.Page.setScope();
    page.inputIsChanged = true;
    if (
        isAutoSubmitField(obj) &&
        !XDOM.getBooleanAttribute(obj, 'data-block-autosubmit')
    ) {
        page.submit('ENTER');
    }
    return true;
};

Stateless.Page.updateByTrigger = function (id) {
    QueryList.open(XDOM.getObject(id));
};

Stateless.Page.prototype.registerTrigger = function (icon) {
    const triggerFields = icon.dataset.triggerFields
            ? icon.dataset.triggerFields.split(' ')
            : [],
        triggerMacros = icon.dataset.triggerMacros
            ? icon.dataset.triggerMacros.split(' ')
            : [],
        id = this.id;

    for (let i = 0, l = triggerFields.length; i < l; i++) {
        const desc = `Stateless page: ${this.macroName} is triggered by field change `;
        Trigger.register(
            triggerFields[i],
            id,
            'Stateless.Page.updateByTrigger' + id,
            function () {
                Stateless.Page.updateByTrigger(id);
            },
            desc
        );
    }
    for (let i = 0, l = triggerMacros.length; i < l; i++) {
        const desc = `Stateless page: ${this.macroName} is triggered by macro: `;
        Trigger.register(
            triggerMacros[i],
            id,
            'Stateless.Page.reload' + id,
            function () {
                Stateless.Page.reload(id);
            },
            desc
        );
    }
};

//registreerd welke subfiew er focus heeft
Stateless.setSubviewActive = function (id) {
    const obj = XDOM.getObject(id),
        fieldset = XDOM.getParentByTagName(obj, 'FIELDSET');
    //zet alle subview fieldsets met data-has-focus="true" op "false"
    Stateless.deactivateAllSubViews();
    if (fieldset) {
        fieldset.dataset.hasFocus = true;
    }
};


Stateless.deactivateAllSubViews = function () {
    XDOM.setAttributesToNodeList(
        '[data-has-focus="true"]',
        'data-has-focus',
        false
    );
}

/**
 * zet op basis van een click event de subview actief die ook de focus kan hebben
 * dit kan alleen als de subview een element heeft waar de focus op kan staan
 * komt de klick niet vanuit een subview of is de klick op een subview gegeven waar geen te focuses elementen in staan dan wordt de klick genegeerd
 * dit om te voorkomen dat een klick op een submit button of iets degelijks de focus van de input doet verliezen
 */
Stateless.setSubviewActiveOnClick = function () {
    const fieldset = XDOM.getParentByTagName(
            GLOBAL.eventSourceElement,
            'FIELDSET'
        ),
        query =
            "input:not([type='hidden']):not([data-hidden='true']):not([data-protected='true']), " +
            "textarea:not([type='hidden']):not([data-hidden='true']):not([data-protected='true'])";
    if (fieldset && fieldset.querySelector(query)) {
        //er is een fieldset en deze heeft een element dat de focus kan hebben
        XDOM.setAttributesToNodeList(
            '[data-has-focus="true"]',
            'data-has-focus',
            false
        );
        fieldset.dataset.hasFocus = true;
    }
};
/**
 * geeft aan of veld al dan niet behoord tot een stateles deel van het scherm
 * dit zijn:
 * edit window velden
 * snelzoek veld
 * @returns {boolean}
 */
Stateless.isStatelessField = function (obj) {
    if (!obj || !obj.dataset) {
        return false;
    }
    if (obj.dataset.panelId) {
        return true;
    } //edit window
    if (obj.dataset.quicksearchSelectfield) {
        return true;
    } //snelzoek window
    if (obj.dataset.statelessPageId) {
        return true;
    } //stateles window
    return false;
};

/**
 * geeft aan of er focus gezet mag worden op het veld
 * gebaseerd op active subview en of het veld
 * al dan niet stateless is
 * @param obj het te focusen veld
 * @returns {boolean}
 */
Stateless.canHaveFocus = function (id) {
    const obj = XDOM.getObject(id),
        fieldset = XDOM.getParentByTagName(obj, 'FIELDSET'),
        isStateless = Stateless.isStatelessField(obj),
        activeSubview = XDOM.query('fieldset[data-has-focus="true"]');

    if (fieldset && fieldset == activeSubview) {
        // dit veld behoort tot de actieve subview
        return true;
    }

    if (!activeSubview) {
        //er is geen subview actief altijd toestaan
        return true;
    }

    if (!fieldset && isStateless) {
        //dit veld is een stateles veld dat niet in een subview zit altijd de focus geven
        return true;
    }

    if (fieldset && obj) {
        // dit veld behoort tot een subview maar niet de actieve
        return true;
    }

    if (!obj) {
        return false;
    }

    // veld is statefull en er is een subview actief
    // dus geen focus zetten
    return false;
};

/**
 * geeft aan of er een subview active is
 * @returns {boolean}
 */
Stateless.setTryFirstSubview = function () {
    const activeSubview = XDOM.query('fieldset[data-has-focus="true"]'),
        allSubviews = XDOM.queryAll('fieldset');
    if (allSubviews.length > 0 && !activeSubview && !allSubviewsLoaded()) {
        GLOBAL.focusFirstSubView = true;
    } else {
        GLOBAL.focusFirstSubView = false;
    }
};

Stateless.translateField = function (field, prefix) {
    return prefix + field;
};

Stateless.translateParamObject = function (paramObj, prefix) {
    let parmObject = paramObj;
    if (typeof parmObject !== 'object') {
        parmObject = JSON.parse(paramObj);
    }

    for (let i = 0, l = parmObject.length; i < l; i++) {
        let item = parmObject[i];
        item.field = Stateless.translateField(item.field, prefix);
    }

    return JSON.stringify(parmObject);
};
