function Subfile(id) {
    this.id = id;
    this.axisArray = [];
    this.length = 0;
    this.data = null;
    this.fields = [];
    this.index = 0;
    this.lastRenderdRecord = 0;
    this.collgroup = null;
    this.headerColgroup = null;
    this.recordTemplate = null;
    this.highlightedRecord = null;
    this.selectedRecords = null;
    this.lastSelectedKey = null;
    this.prefix = '';
    this.pageSize = null;
    this.lastRow = 0;
    this.inputIds = [];

    //scroll behavior only in search pages for now
    this.extendOnScroll = screenType()== "*SCH"
    //indicator to use when extending the sub file.
    this.doNotClear = false;
    this.doNotScroll = false;
}

Subfile.prototype.setInputIds = function () {
    var inputs = this.recordTemplate.querySelectorAll('INPUT');
    for (var i = 0, l = inputs.length; i < l; i++) {
        if (inputs[i].id.indexOf('-checkbox') > -1) {
            continue;
        }
        this.inputIds.push(
            inputs[i].id.replace(this.prefix, '').replace('_#SflRcdNbr', '')
        );
    }
};

Subfile.prototype.addAdditionalRecord = function (formFields, record, recordNr) {
    var fieldName = '';
    for (var n = 0, l = this.inputIds.length; n < l; n++) {
        fieldName = this.inputIds[n];
        formFields.append(fieldName + '_' + recordNr, record[fieldName]);
    }
};

Subfile.prototype.addAdditionalRecords = function (data, formFields) {
    var recordNr = this.index + 1;
    for (var i = 0, l = data.length; i < l; i++) {
        this.addAdditionalRecord(formFields, data[i], recordNr++);
    }
};

Subfile.prototype.prepareColGroups = function () {
    this.prepareColGroup(this.collgroup);
    this.prepareColGroup(this.headerColgroup);
};

Subfile.prototype.prepareColGroup = function (colGroup) {
    var sflWidth = colGroup.getAttribute('data-sfl-custom-width'),
        oneCol = null,
        col = null,
        colWidth = 0,
        columns = [],
        remaining = 100,
        emptyCol = null;
    if (!sflWidth || isNaN(sflWidth)) {
        return;
    }
    oneCol = 100 / sflWidth;
    columns = colGroup.getElementsByTagName('COL');
    for (var i = 0, l = columns.length; i < l; i++) {
        col = columns[i];
        colWidth = parseInt(col.getAttribute('data-column-width'));
        if (!colWidth) {
            emptyCol = col;
            continue;
        }

        colWidth *= oneCol;
        remaining -= colWidth;
        col.style.width = colWidth + '%';
    }
    if (emptyCol) {
        emptyCol.style.width = remaining + '%';
    }
};



/**
 * scroll handler for loading
 * @param e
 */
Subfile.prototype.onScroll = function (e) {
    //check to see if we need to load
    if(!scrolledDownToRange(e.target, 100)) return;

    //check to see if the last field has changed because a scroll event might come before a blur event.
    if(Subfile.checkForChange()) return;

    this.doNotClear = true //prevent removing data
    this.doNotScroll = true; //preventing scrolling to the first line after reloading
    Command.execute("PAGEDN")
}
/**
 * set scroll listner
 */
Subfile.prototype.setEventListners = function () {
    // if(!this.extendOnScroll) return;
    // const sflBody = XDOM.getObject("SFL")
    // sflBody.addEventListener("scroll",this.onScroll.bind(this) )
}
Subfile.prototype.prepareDom = function () {
    var table = XDOM.getObject(this.id);
    var headerTable = XDOM.getObject(this.id.replace('SFLTBL', 'COLHDGTBL'));

    this.collgroup = table.getElementsByTagName('colgroup')[0].cloneNode(true);
    this.headerColgroup = headerTable.getElementsByTagName('colgroup')[0];
    this.recordTemplate = table.getElementsByTagName('TBODY')[0].cloneNode(true);
    table.innerHTML = '';
    this.prepareColGroups();
    this.prepareLogical();
    this.prepareTopview();
    this.prepareTitle();
    this.prepareLink();
    this.prepareIcons()
    this.setInputIds();
    this.setFixedWidth();
    this.setEventListners();
};

Subfile.prototype.setFixedWidth = function () {
    if (SCOPE.main.Settings.get('FIXED_EXTENDED_DATA_WIDTH')) {
        let extendedObject = XDOM.getObject('extendedDataContent');

        if (!extendedObject) {
            return;
        } //==>

        let tableHeaderObject = XDOM.getObject('COLHDG'),
            tableBodyObject = XDOM.getObject('SFL');
        extendedBackgroundObject = XDOM.getObject('extendedDataBg');

        if (!tableHeaderObject || !tableBodyObject) {
            return;
        } //==>

        tableHeaderObject.setAttribute('data-fixed-width', 'true');
        tableBodyObject.setAttribute('data-fixed-width', 'true');
        extendedObject.setAttribute('data-fixed-width', 'true');
        extendedBackgroundObject.setAttribute('data-fixed-width', 'true');
    }
};

Subfile.prototype.prepareTitle = function () {
    var pageObjects = this.recordTemplate.querySelectorAll(
        '[data-title-origin="*LBL"]'
    );
    GUI.infoTitle.registerNodeList(pageObjects);
};

Subfile.prototype.prepareLink = function () {
    var aLinks = this.recordTemplate.querySelectorAll("a[data-datatype='*LNK']");
    var pLink = null;
    var aLink = null;
    var aLinkType = null;
    var isHashed = false;

    for (var i = 0, l = aLinks.length; i < l; i++) {
        aLink = aLinks[i];
        pLink = aLink.parentNode;

        aLink.setAttribute('data-axis', pLink.getAttribute('data-axis'));
        aLink.setAttribute(
            'data-value-from-id',
            pLink.getAttribute('data-value-from-id')
        );

        aLink.setAttribute(
            'data-alias-type',
            pLink.getAttribute('data-alias-type')
        );
        aLink.setAttribute(
            'data-alias-field',
            pLink.getAttribute('data-alias-field')
        );
        aLink.setAttribute('data-protocol', pLink.getAttribute('data-protocol'));
        aLink.setAttribute('target', '_blank');

        pLink.setAttribute('data-datatype', '*SYSTEM');
        pLink.removeAttribute('data-value-from-id');

        aLinkType = aLink.getAttribute('data-url-type');

        if (aLinkType && aLinkType === '*HashedUrl') {
            isHashed = true;
        }

        if (!isHashed) {
            pLink.setAttribute('data-click-action', 'Link.handleOnClick');
            aLink.setAttribute('data-click-action', 'Link.handleOnClick');
        }
    }
};

/**
 * Iterates over all dom elements in scope, having data-macro-desc as an attribute and sets the title accordingly.
 */
Subfile.prototype.prepareTopview = function () {
    //query the relevant dom objects destructure in an array
    const topViewIcons = [...this.recordTemplate.querySelectorAll('[data-macro-desc]')];

    //iterate over all elements
    topViewIcons.forEach(icon=>{
        //do we have a description
        if(!icon.dataset.macroDesc) return;
        //set the title
        icon.title = icon.dataset.macroDesc;
    })

};


Subfile.prototype.prepareLogical = function () {
    var logicals = this.recordTemplate.querySelectorAll("[data-datatype='*LGL']");
    for (var i = 0, l = logicals.length; i < l; i++) {
        logicals[i].parentNode.setAttribute(
            'data-click-action',
            'Logical.handleTdClick'
        );
    }
};

/**
 * set referencie van header en body deel naar elkaar zodat ze gevonden kunnen worden
 * bij een overgang van header naar body en vice versa
 * @param {type} prefix
 * @returns {undefined}
 */
Subfile.setHeaderBodyRef = function (prefix) {
    var headerDiv = XDOM.getObject(prefix + 'COLHDG');
    var bodyDiv = XDOM.getObject(prefix + 'SFL');
    if (!headerDiv) {
        return;
    }
    headerDiv.setAttribute('data-sfl-body-id', bodyDiv.id);
    bodyDiv.setAttribute('data-sfl-header-id', headerDiv.id);
};

/**
 * neemt data-line en data-xpos attributen over van de hidden input naar de
 * button
 * @param {type} prefix
 * @returns {undefined}
 */
Subfile.fixHeaderLogical = function (prefix) {
    var headerDiv = XDOM.getObject(prefix + 'COLHDG'),
        logical = null,
        logicalButton = null,
        logicals = headerDiv.querySelectorAll("[data-datatype='*LGL']");
    for (var i = 0, l = logicals.length; i < l; i++) {
        logical = logicals[i];
        logicalButton = XDOM.getObject(logical.id + '-checkbox'); //Hoeft nog niet aangepast te worden... rkr
        if (!logicalButton) {
            continue;
        }

        logicalButton.setAttribute('data-line', logical.getAttribute('data-line'));
        logicalButton.setAttribute('data-xpos', logical.getAttribute('data-xpos'));
    }
};

Subfile.prototype.getSelectedRecords = function () {
    if (SESSION.activePage.programResumed === 'false') {
        SESSION.activePage.subfilePos = 0;
    }
    var subfileSelectedRecords = SESSION.activePage.subfileSelectedRecords;
    this.selectedRecords = {};
    if (!subfileSelectedRecords) {
        return; //-->
    }
    for (var i = 0, l = subfileSelectedRecords.length; i < l; i++) {
        this.selectedRecords[subfileSelectedRecords[i].SF_KEY] = true;
    }
};

Subfile.prototype.updateSelectAll = function () {
    var checkBox = XDOM.getObject('SLTALL');
    if (checkBox) {
        Logical.setObjValue(checkBox, '');
    }
};

Subfile.prototype.updateColumnHeading = function (headerObj) {
    var obj = null,
        colorField = '',
        colorName = '',
        applyTo = '',
        colorValue = '',
        classPrefix = '',
        classSuffix = '';
    var colorFields = headerObj.querySelectorAll('[data-color-apply]');

    for (var i = 0, l = colorFields.length; i < l; i++) {
        obj = colorFields[i];
        colorField = obj.getAttribute('data-color-field');
        colorName = obj.getAttribute('data-color-name');
        applyTo = obj.getAttribute('data-color-apply');
        if (colorField) {
            colorValue = SESSION.activeData.headerAttributes[colorField];
            colorName = colorValue;
        } else if (colorName) {
            colorValue = colorName;
        }

        if (colorValue.indexOf('*') === 0) {
            // fixed colors (*RED, *BLUE etc)
            classSuffix = colorName.substr(1);
            if (applyTo === '*FONT') {
                classPrefix = 'font_';
            } else if (applyTo === '*BKGD') {
                classPrefix = 'bkgd_';
            }
            obj.className += ' ' + classPrefix + classSuffix.toLowerCase();
        } else {
            if (applyTo === '*FONT') {
                obj.style.color = colorValue;
            } else if (applyTo === '*BKGD') {
                obj.style.backgroundColor = colorValue;
            }
        }
    }
};

Subfile.prototype.clear = function () {
    if(this.doNotClear) {
        return;
    }
    var table = XDOM.getObject(this.id);
    table.innerHTML = '';
};

Subfile.prototype.update = function (reload = this.doNotClear) {
    var fragment = null;
    var table = XDOM.getObject(this.id);
    table.innerHTML = "";
    this.getSelectedRecords();
    this.updateSelectAll();
    fragment = document.createDocumentFragment();
    this.data =
        SESSION.activeData.subfileData || SESSION.activeData.subfile || []; //temp
    this.attributes = SESSION.activeData.subfileAttributes || {};
    this.index = 0;
    this.lastSelectedKey = null;
    this.lastRow = this.pageSize || this.data.length;
    if (reload) {
        this.lastRow = this.data.length;
    }

    if (SESSION.activeData.headerData) {
        this.lastSelectedKey = SESSION.activeData.headerData.WS_KEY;
    }

    if(!reload){
        fragment.appendChild(this.collgroup.cloneNode(true));
    }

    this.renderRecords(fragment);
    table.appendChild(fragment);
    this.selectSFKey(table);
    this.doNotClear = false;
};

/**
 *
 * @param {type} body
 * @returns {undefined}
 */
Subfile.prototype.renderRecords = function (body) {
    var lastRow = this.lastRow;
    if (lastRow > this.data.length) {
        lastRow = this.data.length;
    }
    for (; this.index < lastRow; this.index++) {
        body.appendChild(this.renderRecord());
    }
};
/**
 * check if last field was changed
 * This is done because onScroll event handler fires before blur (at least in chrome)
 */
Subfile.checkForChange = function(page) {
    if (!XDOM.fieldIsChanged(SESSION.activePage.lastFocusedField)) return false;
    if(page){
        page.submit("ENTER");
    }
    handleOnChange(XDOM.getObject(SESSION.activePage.lastFocusedField))

    return true;
};

Subfile.prototype.renderNextRecords = function () {
    var body = XDOM.getObject(this.prefix + 'SFLTBL');
    if (this.index >= this.data.length) {
        return false; // er zijn geen regels meer waar je naartoe kan scrollen
    }
    this.lastRow = this.index + this.pageSize;
    this.renderRecords(body);
    return true;
};

Subfile.prototype.renderRecord = function () {
    var record = this.recordTemplate.cloneNode(true);
    var serverIndex = scriptToServer(this.index);
    record.innerHTML = record.innerHTML.replace(/#SflRcdNbr/g, serverIndex);

    this.updateMask(record, serverIndex);
    this.updateEvents(record, serverIndex);
    this.updateInfoWindow(record, serverIndex);
    this.updateSearch(record, serverIndex);
    this.updateTopview(record, serverIndex);
    this.updateQuickSearch(record, serverIndex);
    this.updateLink(record, serverIndex);
    this.updateInput(record, serverIndex);
    this.updateImage(record, serverIndex);
    this.updateRecord(record, serverIndex);
    this.updateOutput(record, serverIndex);
    this.updateLabel(record, serverIndex);
    this.updateColor(record, serverIndex);
    this.updateWhen(record, serverIndex);
    this.updateAttentionLevel(record, serverIndex);
    this.updateRadio(record, serverIndex);
    this.updateValues(record, serverIndex);
    this.updateService(record, serverIndex);
    this.updateMaxScale(record, serverIndex);
    this.updateEditWindow(record, serverIndex);
    this.updateQueryList(record, serverIndex);
    this.updateFieldAttribute(record, serverIndex);
    this.updateDataAttribute(record, serverIndex);
    this.updateSessionLauncher(record, serverIndex);
    this.updateIcons(record, serverIndex);
    return record;
};

//Subfile.prototype.updateMultiSelect = function(record){
// MultiSelect.markChanged(record,this.data[this.index]["SF_SLT_INZ"]);
//};

Subfile.prototype.updateOutput = function (record, serverIndex) {
    var outputs = record.querySelectorAll('output[data-datatype]');
    var obj = null;
    for (var i = 0, l = outputs.length; i < l; i++) {
        obj = outputs[i];
        obj.id = obj.id.replace('#SflRcdNbr', serverIndex);
    }
};

Subfile.prototype.prepareIcons = function () {
    icons.prepareDom(this.recordTemplate);
}

Subfile.prototype.updateIcons = function (record, serverIndex) {
    icons.updateSubfileRecord(record,this.data[this.index])
}

Subfile.prototype.updateLabel = function (record, serverIndex) {
    var labels = record.getElementsByTagName('label');
    var labelObj = null;
    var captionId = null;
    var captionTxt = null;

    for (var i = 0, l = labels.length; i < l; i++) {
        labelObj = labels[i];
        if (!labelObj) {
            return;
        }

        captionId = XDOM.getAttribute(labelObj, 'data-caption-id');
        captionTxt = Captions.returnCaption(captionId);

        if (captionTxt && captionTxt !== '') {
            labelObj.innerHTML = captionTxt;
        }
    }
};

Subfile.prototype.updateEditWindow = function (record, serverIndex) {
    var editWindows = record.querySelectorAll('[data-edit-id]');
    var obj = null;
    for (var i = 0, l = editWindows.length; i < l; i++) {
        obj = editWindows[i];
        obj.id = obj.id.replace('#SflRcdNbr', serverIndex);
        obj.setAttribute(
            'data-edit-id',
            obj.getAttribute('data-edit-id') + '_' + serverIndex
        );
        obj.setAttribute('data-record-number', serverIndex);
    }
};

Subfile.prototype.updateQueryList = function (record, serverIndex) {
    const querylists = record.querySelectorAll('.queryList');

    function updateAttribute(obj, attribute) {
        //attribute fields these might be a single string or a space seperated list of string
        // iterate over them and ad record postfix
        const valueArray = (obj.getAttribute(attribute) || '').split(" ");
        const value = valueArray.map(field => {
                //do we have a field or is it just an extra space
                if (!field || !field.trim()) return '';

                //add postfix
                field += '_' + serverIndex
                return field
            }
        ).join(' ')

        //set the modified input fields
        obj.setAttribute(attribute, value);
    }

    for (let i = 0, l = querylists.length; i < l; i++) {
        const obj = querylists[i];
        obj.id = obj.id.replace('#SflRcdNbr', serverIndex);
        obj.setAttribute('data-record-number', serverIndex);

        //update toId
        const axis = obj.getAttribute('data-to-id');
        obj.setAttribute('data-to-id', axis + '_' + serverIndex);
        updateAttribute(obj, "data-input-fields");
        updateAttribute(obj, "data-return-fields");

    }
};

Subfile.prototype.updateLink = function (record, serverIndex) {
    var obj;
    var hrefs = record.querySelectorAll("a[datatype='*LNK']");
    for (var i = 0, l = hrefs.length; i < l; i++) {
        obj = hrefs[i];
        obj.id = obj.id.replace('#SflRcdNbr', serverIndex);
        obj.setAttribute('data-record-number', serverIndex);
        obj.parentNode.setAttribute('data-record-number', serverIndex);
        //obj.linkOpenPreference = obj.parentNode.dataset.linkOpenPreference;
    }
};

Subfile.prototype.updateColor = function (record, serverIndex) {
    //  Aangepast door MVB
    if (!this.attributes) {
        return;
    }
    var obj = null,
        colorField = '',
        colorName = '',
        applyTo = '',
        colorValue = '',
        classPrefix = '',
        classSuffix = '';
    var tds = record.querySelectorAll('[data-color-apply]');
    var dataRecord = this.attributes[this.index];

    for (var i = 0, l = tds.length; i < l; i++) {
        obj = tds[i];
        colorField = obj.getAttribute('data-color-field');
        colorName = obj.getAttribute('data-color-name');
        applyTo = obj.getAttribute('data-color-apply');

        if (colorField) {
            colorValue = dataRecord[colorField];
            colorName = colorValue;
        } else if (colorName) {
            colorValue = colorName;
        }

        if (colorValue.indexOf('*') === 0) {
            // fixed colors (*RED, *BLUE etc)
            classSuffix = colorName.substr(1);
            if (applyTo === '*FONT') {
                classPrefix = 'font_';
            } else if (applyTo === '*BKGD') {
                classPrefix = 'bkgd_';
            }
            obj.className += ' ' + classPrefix + classSuffix.toLowerCase();
        } else {
            if (applyTo === '*FONT') {
                obj.style.color = colorValue;
            } else if (applyTo === '*BKGD') {
                obj.style.backgroundColor = colorValue;
            }
        }
    }
};

Subfile.prototype.updateValues = function (record, serverIndex) {
    var obj = null,
        value = '',
        fieldName = '',
        type = '';
    var inputs = record.getElementsByTagName('input');
    var dataRecord = this.data[this.index];

    for (var i = 0, l = inputs.length; i < l; i++) {
        obj = inputs[i];
        type = obj.getAttribute('data-datatype');

        fieldName = obj.id.replace('_' + serverIndex, '');
        fieldName = fieldName.replace(this.prefix, '');

        value = dataRecord[fieldName];

        if (
            type !== '*LGL' &&
            type !== '*MASK' &&
            type !== '*SYSTEM' &&
            obj.type !== 'button'
        ) {
            if (!hasValue(value)) {
                value = '*--*';
            }
        }

        if (isLogical(obj)) {
            fieldName = Logical.getFieldName(fieldName);
            value = dataRecord[fieldName];
            Logical.setObjValue(obj, value);
        } else {
            XDOM.setObjectValue(obj, value, this);
        }
    }
};
Subfile.prototype.updateMaxScale = function (record, serverIndex) {
    var dataRecord = this.attributes[this.index];
    var elements = record.querySelectorAll(
        '[data-datatype ="*DEC"][data-maxscale-system-limit]:not([data-maxscale-system-limit="*AUTO"])'
    );
    var obj = null,
        scaleObject = null;

    for (var i = 0, l = elements.length; i < l; i++) {
        obj = elements[i];
        if (obj.getAttribute('data-maxscale-field') !== '*IGNORE') {
            scaleObject = new MaxScale(obj, dataRecord);
            scaleObject.apply();
        }
    }
    //cleanup voor garbage collection
    obj = null;
    scaleObject = null;
    elements = null;
};

Subfile.prototype.updateInput = function (record, serverIndex) {
    let obj = null,
        inputs = record.querySelectorAll('input, a[role="button"]');

    for (var i = 0, l = inputs.length; i < l; i++) {
        obj = inputs[i];
        obj.id = obj.id.replace('#SflRcdNbr', serverIndex);
        obj.name = obj.name.replace('#SflRcdNbr', serverIndex);
        obj.setAttribute('data-record-number', serverIndex);
    }
    INP.registerEvents(inputs);
};

Subfile.prototype.updateImage = function (record, serverIndex) {
    var obj = null,
        value = '',
        fieldName = '',
        type = '';

    var imageObjects = record.querySelectorAll('[data-datatype="*IMG"]');
    var dataRecord = this.data[this.index];

    for (var i = 0, l = imageObjects.length; i < l; i++) {
        imgObj = imageObjects[i];
        fieldName = imgObj.id.replace('_' + serverIndex, '');
        value = dataRecord[fieldName];

        if (!value) {
            XDOM.removeDOMObject(imgObj);
            continue;
        }

        imgObj.id = imgObj.id.replace('#SflRcdNbr', serverIndex);
        imgObj.setAttribute('data-record-number', serverIndex);

        oculusImage.setObjValue(imgObj, value);
    }
};

Subfile.prototype.updateEvents = function (record, serverIndex) {
    var obj = null;
    var objects = record.querySelectorAll('[data-blur-action]:not(input)'); // :not(input)
    for (var i = 0, l = objects.length; i < l; i++) {
        obj = objects[i];
        XDOM.addEventListener(obj, 'blur', handleBlur);
    }

    objects = record.querySelectorAll('[data-focus-action]:not(input)');
    for (var i = 0, l = objects.length; i < l; i++) {
        obj = objects[i];
        XDOM.addEventListener(obj, 'focus', handleFocus);
    }
};

/**
 * zet de focus op de regel van lastSelectedKey;
 * Alleen als er een SF_KEY is gedefinieerd
 * @param table domobject table
 * @returns {undefined}
 */
Subfile.prototype.selectSFKey = function (table) {
    if (!table) {
        return;
    }
    if (!hasValue(this.lastSelectedKey)) {
        return;
    }
    if (this.lastSelectedKey === '') {
        return;
    }
    if (this.data.length == 0) {
        return;
    }
    if (!this.data[0]['SF_KEY']) {
        return;
    }

    var serverIndex = 0;
    var record = null;
    for (var i = 0, l = this.data.length; i < l; i++) {
        if (this.lastSelectedKey === this.data[i]['SF_KEY']) {
            serverIndex = i + 1;
            break;
        }
    }
    record = table.querySelector(
        "tbody[data-record-number='" + serverIndex + "']"
    );
    if (!record) {
        return;
    }
    Subfile.handleRowFocus(record);

    const fieldToFocus = record.querySelector('[tabindex]'); //POM-3969
    if (fieldToFocus) {
        SESSION.activePage.cursorFocus = fieldToFocus.id;
    }
};

Subfile.prototype.updateRecord = function (record, serverIndex) {
    var obj = null,
        value = '',
        rowSelectorDisplay = null;
    var dataRecord = this.data[this.index];
    var trs = record.getElementsByTagName('TR');
    var rowSelector = record.querySelector('[data-rowselector]');
    var restButton = record.querySelector('[data-reset-record]');
    var keyField = record.querySelector("[data-axis='SFL_KEY']");
    var fields = record.querySelectorAll('[data-value-from-id]');
    var valueFromId = '';
    if (keyField) {
        keyField.id = 'SFL_A_' + serverIndex;
        keyField.setAttribute('data-record-number', serverIndex); //keyField.setAttribute("data-line", this.startLine + this.index);
    }

    record.id = record.id.replace('#SflRcdNbr', serverIndex);
    record.setAttribute('data-record-number', serverIndex);

    if (restButton) {
        restButton.setAttribute('data-reset-record', serverIndex);

        restButton.id = restButton.id.replace('#SflRcdNbr', serverIndex);

        value = dataRecord['SF_STS'];
        restButton.setAttribute('data-subfile-state', value);
    }

    for (var i = 0, l = trs.length; i < l; i++) {
        obj = trs[i];
        obj.id = obj.id.replace('#SflRcdNbr', serverIndex);
    }

    for (var i = 0, l = fields.length; i < l; i++) {
        obj = fields[i];
        obj.setAttribute('data-record-number', serverIndex);
        valueFromId = obj.getAttribute('data-value-from-id');

        if (!valueFromId) {
            continue;
        }
        value = dataRecord[valueFromId];
        if (!hasValue(value)) {
            value = '*--*';
        }

        XDOM.setObjectValue(obj, value, this);
    }

    //verplaatst naar this.selectSFKey omdat de regel nu moet zijn gerenderd voor dat er de focus op kan komen
    //	if(hasValue(this.lastSelectedKey) && this.lastSelectedKey !== ""){
    //		if(hasValue(dataRecord["SF_KEY"]) && (this.lastSelectedKey === dataRecord["SF_KEY"])){
    //			Subfile.handleRowFocus(record);
    //		}
    //	}

    if (rowSelector) {
        //zet aan of uit
        rowSelector.id = rowSelector.id.replace('#SflRcdNbr', serverIndex);
        rowSelector.name = rowSelector.name.replace('#SflRcdNbr', serverIndex);
        rowSelectorDisplay = rowSelector.parentNode.querySelector(
            'input[type="button"]'
        );
        if (this.selectedRecords[this.data[serverIndex - 1].SF_KEY]) {
            rowSelector.value = 'SLT';
        } else {
            rowSelector.value = '';
        }
        Logical.updateState(rowSelector, rowSelectorDisplay);
    }
};

Subfile.prepareDom = function () {
    var tableObject = XDOM.getObject('SFLTBL');
    var clearSelectionChc = XDOM.getObject('clearSelection');
    if (tableObject) {
        SESSION.activePage.subfile = new Subfile('SFLTBL');
        SESSION.activePage.subfile.prepareDom();
        Subfile.setHeaderBodyRef('');
        Subfile.fixHeaderLogical('');
    }

    //set remove complete selection title
    if (clearSelectionChc) {
        GUI.infoTitle.register(clearSelectionChc, getCapt('cCLEARSELECTION'));
    }
};

Subfile.clear = function () {
    if (!SESSION.activePage.subfile) {
        return;
    }

    SESSION.activePage.subfile.clear();
};

Subfile.update = function () {
    if (SESSION.activePage.subfile) {
        SESSION.activePage.subfile.updateColumnHeading(XDOM.getObject('COLHDGTBL'));
        SESSION.activePage.subfile.update();

        if (SESSION.activePage.subfileSelectionCount) {
            Logical.setLogicalCounter(
                SESSION.activePage.subfileSelectionCount.SelectionCount
            );
        }
    }
};

Subfile.setScrollPos = function(){
    if(!SESSION.activePage.subfile) return;
    if (SESSION.activePage.macroSwitch.macroStackCode == 'BWD' ||
        ['*PMT_ML', '*RGS', '*UPD_ML'].includes(SESSION.activePage.macroType)) {
        Subfile.restoreSubfilePos();
    } else {
        SESSION.activePage.subfile.scrollToTop()
    }
}

Subfile.getEventRecordNr = function (obj) {
    var recordNumber = parseInt(obj.getAttribute('data-record-number'));
    var recordObject = obj;
    if (!recordNumber) {
        if (recordObject.eventObjectTAG !== 'TBODY') {
            recordObject = XDOM.getParentByTagName(recordObject, 'TBODY');
        }
        if (
            !recordObject ||
            !recordObject.id ||
            recordObject.id.indexOf('SFL_RCD') === -1
        ) {
            return null;
        }
        recordNumber = recordObject.id.replace('SFL_RCD', '');
    }
    return recordNumber;
};

Subfile.focusFirstInput = function (obj) {
    var progression = fp.get(obj);
    progression.first();
};
Subfile.handleRowFocus = function (obj) {
    var rowObject = null;
    var tbody = null;
    var subfileBody = null;
    var currentSelectedRecord = null;

    if (obj) {
        rowObject = XDOM.getParentByTagName(obj, 'TBODY');
    } else {
        rowObject = XDOM.getParentByTagName(GLOBAL.eventSourceElement, 'TBODY');
    }

    if (rowObject) {
        tbody = XDOM.getParentByTagName(rowObject, 'TBODY');
        if (tbody) {
            subfileBody = tbody.parentNode;

            currentSelectedRecord = subfileBody.querySelector(
                "[data-record-selected='true']"
            );
            if (currentSelectedRecord !== null) {
                currentSelectedRecord.setAttribute('data-record-selected', 'false');
            }

            tbody.setAttribute('data-record-selected', 'true');

            if (SESSION.activePage.subfile) {
                SESSION.activePage.subfile.highlightedRecord = tbody.id;
            }
        }
    }
};

Subfile.handleRowBlur = function (obj) {
    var rowObject = null;
    var tbody = null;
    if (!SESSION.activePage) {
        return;
    }
    if (obj) {
        rowObject = XDOM.getParentByTagName(obj, 'TBODY');
    } else {
        rowObject = XDOM.getParentByTagName(GLOBAL.eventSourceElement, 'TBODY');
    }

    if (SESSION.activePage.subfile) {
        SESSION.activePage.subfile.highlightedRecord = null;
    }

    if (rowObject) {
        tbody = XDOM.getParentByTagName(rowObject, 'TBODY');
        if (tbody) {
            tbody.setAttribute('data-record-selected', 'false');
        }
    }
};

Subfile.selectRow = function (obj) {
    var rowObject = obj;
    var recordNr = Subfile.getEventRecordNr(rowObject);

    if (!recordNr) {
        return;
    }
    Subfile.handleRowFocus(rowObject);
};

Subfile.deselectRow = function () {
    //	var rowObject = GLOBAL.eventSourceElement;
    //	var rowBody		= null;
    //  var recordNr 	= Subfile.getEventRecordNr(rowObject);
    //
    //  rowBody = XDOM.getObject('SFL_RCD' + recordNr);
    //  if (!rowBody) {return;}

    Subfile.handleRowBlur();
};

Subfile.prototype.closeTopView = function (obj, returnFields, returnTargetFields ) {
    var dataFields = returnFields || [];
    var returnCallerFields = returnTargetFields || [];
    var recordNumber = getClientRecordNr(obj);
    var record = this.data[recordNumber];
    var returnValuesArray = [];
    for (var i = 0, l = dataFields.length; i < l; i++) {
        returnValuesArray[i] = {
            targetObject: returnCallerFields[i],
            targetValue: record[dataFields[i]]
        };
    }
    if (TopView.currentInstance) {
        TopView.currentInstance.close(returnValuesArray, true);
    }
};

Subfile.prototype.closeSearch = function (obj) {
    var dataFields = obj.getAttribute('data-subfile-return-to-caller').split(' ');
    var recordNumber = getClientRecordNr(obj);
    var record = this.data[recordNumber];
    var returnValues = [];
    for (var i = 0, l = dataFields.length; i < l; i++) {
        returnValues.push(record[dataFields[i]]);
    }
    Search.close(returnValues);
};

Subfile.prototype.navigate = function (obj) {
    var hasTarget = false;
    var recordNumber = getClientRecordNr(obj);
    var record = this.data[recordNumber];
    var formatCode = record[obj.getAttribute('data-subfile-format-field')];

    if (SESSION.submitInProgress) {
        return;
    }

    if (formatCode === '') {
        //setMessage('S', gPRC001);
        return false;
    }

    hasTarget = SESSION.stack.setSubfileTargetFields(
        recordNumber,
        formatCode,
        null,
        SESSION.activePage
    );
    if (!hasTarget) {
        //setMessage('S', gPRC001);
        return false;
    }
    window.onbeforeunload = null;

    //sla de subfile postitie op ivm met terug keren naar ML
    Subfile.storeSubfilePos();
    Command.submit(true);
    return true;
};

/**
 * Activate Selected record
 *
 * @param {obj} obj
 */
Subfile.prototype.selectRecord = function (obj) {
    var recordNumber = getClientRecordNr(obj);
    var record = this.data[recordNumber];
    var key = record['SF_KEY'];
    var radioButtonOn = obj.querySelector('[data-radio]');
    var radioButtonOff = XDOM.queryScope("[data-radio='on']");
    if (radioButtonOff) {
        radioButtonOff.setAttribute('data-radio', 'off');
    }
    XDOM.createInputField('SF_KEY', key);
    XDOM.createInputField('SelectedSubfileRecord', scriptToServer(recordNumber));
    XDOM.createInputField('WS_CMD', 'SELECT');
    radioButtonOn.setAttribute('data-radio', 'on');
    Subfile.storeSubfilePos();
    Command.submit();
};

/**
 * als in het srcElement (in dit geval een td) een input element van het type
 * checkbox of radio zit wordt een onclick op dit element uitgevoerd en wordt
 * het event verder gecanceld in dat geval wordt true geretourneerd zodat de
 * aanroepende functie (SFLACN.ACTSUBPGM) kan worden afgebroken
 *
 * @returns {boolean}
 */
Subfile.bubbleToInput = function () {
    var inputs = [],
        divs = [];
    var parent = null;

    if (
        GLOBAL.eventSourceElement.tagName === 'TD' ||
        GLOBAL.eventSourceElement.tagName === 'TH'
    ) {
        parent = GLOBAL.eventSourceElement;
    }
    if (!parent) {
        parent = XDOM.getParentByTagName(GLOBAL.eventSourceElement, 'TH');
    }
    if (!parent) {
        parent = XDOM.getParentByTagName(GLOBAL.eventSourceElement, 'TH');
    }

    if (!parent) {
        return false;
    }

    inputs = parent.getElementsByTagName('INPUT');

    if (inputs.length > 0) {
        XDOM.invokeClick(inputs[0]);
        return true;
    }

    //  divs = parent.querySelectorAll("[data-to-id]");
    //  if (divs.length > 0) {
    //    XDOM.invokeClick(divs[0]);
    //    return true;
    //  }
    return false;
};

/*
 * Positioneer subfile zo dat actief record in zichtbare deel van de subfile
 * staat
 */
Subfile.setCursor = function () {
    var fsKey = XDOM.getObjectValue('WS_KEY');

    var foInp = XDOM.getObject(fsKey);
    if (!foInp) {
        return;
    }

    foInp.scrollIntoView(true);
};

Subfile.setChanged = function (fiRecordNumber) {
    var foIndicatorDiv, FoIndicatorField;
    if (!fiRecordNumber) {
        return;
    } // -->>
    foIndicatorDiv = XDOM.getObject('UPDSTS_' + fiRecordNumber);
    if (!foIndicatorDiv) {
        return;
    } // -->>
    FoIndicatorField = XDOM.getObject('SF_STS_' + fiRecordNumber);
    //foIndicatorDiv.innerHTML = '&nbsp;';
    //foIndicatorDiv.className = 'stschg';
    foIndicatorDiv.setAttribute('data-subfile-state', 'CC');
    FoIndicatorField.value = 'P';
};

Subfile.handleKeyDown = function () {
    if (
        XDOM.GLOBAL.getAttribute('data-axis') === 'SFL_KEY' &&
        GLOBAL.charCode === keyCode.enter
    ) {
        Subfile.handleOnClick();
        XDOM.cancelEvent();
        return true;
    }
    return false;
};
/**
 *
 * @returns {undefined}
 */
Subfile.handleOnClick = function () {
    //check to see if there is a submit going on.
    if (SESSION.submitInProgress)  return;
    var body = XDOM.getParentByTagName(GLOBAL.eventSourceElement, 'TBODY');
    var selectedRow = null;
    if (!body) {
        return;
    }
    var clickAction = body.getAttribute('data-subfile-clickable');

    if (
        SESSION.activePage.subfile &&
        SESSION.activePage.subfile.highlightedRecord
    ) {
        selectedRow = XDOM.getObject(SESSION.activePage.subfile.highlightedRecord);
    }

    if (Subfile.bubbleToInput()) {
        return;
    }

    if (XDOM.GLOBAL.getAttribute('data-reset-record')) {
        Subfile.resetRecord();
        return;
    }

    if (GLOBAL.eventSourceElement.tagName === 'INPUT') {
        return;
    }

    switch (clickAction) {
        case '*QUERYLIST':
            QueryList.handleOnClick(body);
            Subfile.handleRowFocus(body);
            break;
        case '*MULTISELECT':
            MultiSelect.handleOnClick(body);
            break;
        case '*NAVIGATE':
            //check of we in een topview zitten en dus zonder stack.
            if (TopView.currentInstance && SESSION.isSingleView) {
                //sluit de topview en geef de paramaters mee terug.
                SESSION.activePage.subfile.closeTopView(
                    body,
                    SESSION.activePage.returnToCaller,
                    TopView.currentInstance.returnTargetFields
                );
            } else {
                //check of er een achterliggende macro is.
                if (!SESSION.activePage.subfile.navigate(body)) {
                    //check of er een triggerfield is.
                    if (!Subfile.activateTriggers(body)) {
                        //doe niets en geef een melding
                        setMessage('S', getCapt('gPRC001'));
                        return;
                    }
                }
            }
            break;
        case '*TRIGGER':
            //start trigger
            Subfile.activateTriggers(body);
            break;
        case '*SELECT_RECORD':
            SESSION.activePage.subfile.selectRecord(body);
            break;
        case '*CLOSE_SEARCH':
            SESSION.activePage.subfile.closeSearch(body);
            break;
    }

    if (selectedRow) {
        Subfile.handleRowBlur(selectedRow);
    }

    Subfile.handleRowFocus(body);
};

Subfile.resetRecord = function () {
    SESSION.activePage.subfile.resetRecord();
};

Subfile.prototype.resetRecord = function () {
    var index = XDOM.GLOBAL.getAttribute('data-reset-record');
    var record = XDOM.getParentByTagName(GLOBAL.eventSourceElement, 'TBODY');
    var obj = null,
        value = '',
        fieldName = '',
        type = '';
    var inputs = record.getElementsByTagName('input');
    GLOBAL.eventSourceElement.setAttribute('data-subfile-state', '');

    var dataRecord = this.data[serverToScript(index)];
    XDOM.setObjectValue('SF_STS_' + index, '');
    for (var i = 0, l = inputs.length; i < l; i++) {
        obj = inputs[i];
        fieldName = obj.name.replace('_ENT_' + index, '_DBF');
        value = dataRecord[fieldName];
        type = obj.getAttribute('data-datatype');
        if (type !== '*MASK' && type !== '*SYSTEM' && obj.type !== 'button') {
            if (!hasValue(value)) {
                continue;
                value = '*--*';
            }

            XDOM.setObjectValue(obj, value);
        }
    }
};

/**
 * slaat positie van de subfile op
 */
Subfile.storeSubfilePos = function () {
    var foSubfile = XDOM.getObject('SFL');
    if (!foSubfile) {
        return;
    } //-->

    var foSettings = Subfile.getProgramSettings();
    foSettings.subfilePos = foSubfile.scrollTop;
};
/**
 * zet de subfile in de positie die is opgeslagen door storeSubfilePos
 */
Subfile.prototype.scrollToTop = function () {

    var foSubfile = XDOM.getObject('SFL');
    if (!foSubfile) {
        return;
    } //-->

    //we are extending the subfile so don't scroll to top
    if(this.doNotScroll) {
        //reset this
        this.doNotScroll = false;
        return;
    }
    foSubfile.scrollTop = 0;
};


/**
 * zet de subfile in de positie die is opgeslagen door storeSubfilePos
 */
Subfile.restoreSubfilePos = function () {
    var foSubfile = XDOM.getObject('SFL');
    if (!foSubfile) {
        return;
    } //-->
    var foSettings = Subfile.getProgramSettings();
    foSubfile.scrollTop = foSettings.subfilePos;
};

/**
 * geeft huidige programma instellingen terug als deze niet bestaat wordt een initiele lege settings terug gegeven
 * @returns
 */
Subfile.getProgramSettings = function () {
    var foSettings = SESSION.program[SESSION.activePage.programName];
    if (!foSettings) {
        foSettings = {};
        foSettings.subfilePos = 0;
    }
    SESSION.program[SESSION.activePage.programName] = foSettings;
    return foSettings;
};

Subfile.activateTriggers = function (foRecord) {
    var faAxises = foRecord.querySelectorAll('[data-axis]');
    var faTriggers = [];
    var faAxistriggers = null;
    var foAxis = null;
    var fsAxis = '';
    var fbRet = false;
    var recordNr = null;

    for (var i = 0, l = faAxises.length; i < l; i++) {
        foAxis = faAxises[i];
        fsAxis = foAxis.getAttribute('data-axis');
        faAxistriggers = SESSION.activePage.triggers[fsAxis];
        if (faAxistriggers) {
            Trigger.setAxisField(foAxis);
            for (var caller in faAxistriggers) {
                faTriggers[caller] = faAxistriggers[caller];
            }
            fbRet = true;
        }
    }

    for (var t in faTriggers) {
        faTriggers[t].execute();
    }

    if (fbRet) {
        recordNr = foRecord.getAttribute('data-record-number');
        if (recordNr !== null) {
            Trigger.fillIPMF(recordNr);
        }
    }

    return fbRet;
};

/**
 * bereid de een record uit een subfile voor
 * @param {type} record
 * @param {type} serverIndex
 * @returns {void}
 */
Subfile.prototype.updateInfoWindow = function (record, serverIndex) {
    var obj = null;
    var InfoWindows = record.querySelectorAll('[data-info-id]');
    for (var i = 0, l = InfoWindows.length; i < l; i++) {
        obj = InfoWindows[i];
        obj.id = obj.id.replace('#SflRcdNbr', serverIndex);
        obj.setAttribute('data-record-number', serverIndex);
        //check;
        obj.setAttribute('data-click-action', 'GUI.InfoWindow.handleClick');
        obj.setAttribute('data-mouseover-action', 'GUI.InfoWindow.handleMouseOver');
        obj.setAttribute('data-mouseout-action', 'GUI.InfoWindow.handleMouseOut');
        XDOM.addEventListener(obj, 'mouseover', handleMouseOver);
        XDOM.addEventListener(obj, 'mouseout', handleMouseOut);
    }
};

Subfile.prototype.updateRadio = function (record, serverIndex) {
    var radioButton = record.querySelector('[data-radio]');
    if (!radioButton) {
        return;
    }
    var dataRecord = this.data[this.index];
    var sfKey = dataRecord['SF_KEY'];
    var wsKey = SESSION.activeData.headerData['WS_KEY'];

    radioButton.id = radioButton.id.replace('#SflRcdNbr', serverIndex);
    if (sfKey === wsKey) {
        radioButton.setAttribute('data-radio', 'on');
    }
};

/**
 *  bereid de een record uit een subfile voor
 * @param {type} record
 * @param {type} serverIndex
 * @returns {void}
 */
Subfile.prototype.updateQuickSearch = function (record, serverIndex) {
    var InfoWindows = record.querySelectorAll('[data-quicksearch-id]');
    var to = null;
    var qsId = '';
    var axis = '';
    var obj = null;


    for (var i = 0, l = InfoWindows.length; i < l; i++) {

        obj = InfoWindows[i];
        obj.addEventListener('click', QuickSearch.handleOnClick, false);
        obj.id = obj.id.replace('#SflRcdNbr', serverIndex);
        obj.setAttribute('data-record-number', serverIndex);
        qsId = obj.getAttribute('data-quicksearch-id');
        obj.setAttribute('data-quicksearch-id', qsId + '_' + serverIndex);
        axis = obj.getAttribute('data-to-id');

        obj.setAttribute('data-to-id', axis + '_' + serverIndex);

        to = record.querySelector('[data-axis="' + axis + '"]');

        QuickSearch.prepareDomObj(obj, to);
    }
};

//POM-3545
Subfile.prototype.updateSessionLauncher = function (record, serverIndex) {
    const launchers = record.querySelectorAll('[data-new-session-id]'),
        dataRecord = this.data[this.index];

    for (let i = 0, l = launchers.length; i < l; i++) {
        let launcher = launchers[i];
        launcher.dataset.recordNumber = serverIndex;
        if (launcher.dataset.newSessionEnvironmentFieldId) {
            launcher.dataset.newSessionEnvironment =
                dataRecord[launcher.dataset.newSessionEnvironmentFieldId];
            NAV.sessionLauncher.authorize(launcher);
        }
    }
};
// Subfile.prototype.updateSessionLauncher= function(record,serverIndex){
//   const launchers = record.querySelectorAll("[data-new-session-environment-field-id]"),
//         dataRecord = this.data[this.index];

//   for(let i = 0, l=launchers.length; i<l; i++) {
//     let launcher = launchers[i];
//     launcher.dataset.recordNumber=serverIndex
//     launcher.dataset.newSessionEnvironment = dataRecord[launcher.dataset.newSessionEnvironmentFieldId] ;
//     NAV.sessionLauncher.authorize(launcher);
//   };
// };

Subfile.prototype.updateDataAttribute = function (record, serverIndex) {
    var nodelist = record.querySelectorAll(
        '[data-left-zero],[data-value-when-zero],[data-left-blank],[data-to-upper],[data-digits]'
    );
    [...nodelist].forEach(obj => DataAttribute.apply(obj));
};

Subfile.prototype.updateFieldAttribute = function (record, serverIndex) {
    var obj = record.querySelectorAll('[data-protected]');
    for (var i = 0, l = obj.length; i < l; i++) {
        FieldAttribute.protect(obj[i]);
    }
};

//Subfile.prototype.updateConditionalAttributes = function(record,serverIndex){
//  return;
//  var obj = null;
//  var data = this.attributes[this.index];
//	var conditionalObjects = XDOM.queryAll('[data-condition-attribute]');
//
//  for(var i=0,l=conditionalObjects.length;i<l;i++){
//    obj = conditionalObjects[i];
//		ConditionalAttribute.apply(obj,data);
//	}
//};

Subfile.prototype.updateWhen = function (record, serverIndex) {
    var whenObjects = record.querySelectorAll('[data-when-field]');
    var obj = null,
        field = '',
        value = '';
    var data = this.attributes[this.index];
    for (var i = 0, l = whenObjects.length; i < l; i++) {
        obj = whenObjects[i];
        value = obj.getAttribute('data-when-value');
        field = obj.getAttribute('data-when-field');
        if (value !== data[field]) {
            When.set(obj, 'unavailable');
        } else {
            When.set(obj, 'available');
        }
    }
};

Subfile.prototype.updateAttentionLevel = function (record, serverIndex) {
    var attentionLevelObjects = record.querySelectorAll(
        '[data-attention-field-id]'
    );
    var obj = null;
    for (var i = 0, l = attentionLevelObjects.length; i < l; i++) {
        obj = attentionLevelObjects[i];
        AttentionLevel.apply(obj);
    }
};

Subfile.prototype.updateTopview = function (record, serverIndex) {
    var topViewDivs = record.querySelectorAll('[data-topview-parm-names]');
    var axis = '',
        obj = null;

    for (var i = 0, l = topViewDivs.length; i < l; i++) {
        obj = topViewDivs[i];
        obj.setAttribute('data-record-number', serverIndex);
        axis = obj.getAttribute('data-to-id');
        obj.setAttribute('data-to-id', axis + '_' + serverIndex);
        parmFields = obj.getAttribute('data-topview-parm-fields').split(' ');
        obj.setAttribute(
            'data-topview-parm-fields',
            parmFields.map(field => field + '_' + serverIndex).join(' ')
        );
    }
};

Subfile.prototype.updateSearch = function (record, serverIndex) {
    var searchDivs = record.querySelectorAll('[data-search-id]');
    var axis = '',
        obj = null;

    for (var i = 0, l = searchDivs.length; i < l; i++) {
        obj = searchDivs[i];
        obj.id = obj.id.replace('#SflRcdNbr', serverIndex);
        obj.setAttribute('data-record-number', serverIndex);
        axis = obj.getAttribute('data-to-id');
        obj.setAttribute('data-to-id', axis + '_' + serverIndex);
    }
};

Subfile.prototype.updateService = function (record, serverIndex) {
    var serviceObjects = record.querySelectorAll('[data-service-type]');
    var axis = '',
        target = null,
        display = null,
        obj = null;
    var dataRecord = this.data[this.index];

    for (var i = 0, l = serviceObjects.length; i < l; i++) {
        obj = serviceObjects[i];
        obj.id = obj.id.replace('#SflRcdNbr', serverIndex);
        obj.setAttribute('data-record-number', serverIndex);
        axis = obj.getAttribute('data-to-id');
        obj.setAttribute('data-to-id', axis + '_' + serverIndex);

        if (obj.getAttribute('data-service-type') === '*RTV') {
            target = record.querySelector('#' + axis + '_' + serverIndex);
            display = record.querySelector(
                "[data-to-axis='" + obj.getAttribute('data-to-axis') + "']"
            );
            Service.retriveSFL(obj, target, display, dataRecord[axis]);
        }
    }
};

Subfile.prototype.updateMask = function (record, serverIndex) {
    var maskDivs = record.querySelectorAll('[data-mask-container-for]');
    var maskParts = record.querySelectorAll('[data-mask]');
    var obj = null,
        nextPart = null;

    var maskFor = '',
        target = '',
        container = '',
        firstPart = '',
        lastPart = '';
    for (var i = 0, l = maskDivs.length; i < l; i++) {
        obj = maskDivs[i];
        maskFor = obj.getAttribute('data-mask-container-for');
        maskFor = maskFor.replace('#SflRcdNbr', serverIndex);
        obj.setAttribute('data-mask-container-for', maskFor);
        obj.id = obj.id.replace('#SflRcdNbr', serverIndex);
    }

    for (var i = 0, l = maskParts.length; i < l; i++) {
        obj = maskParts[i];
        target = obj.getAttribute('data-mask-target');
        if (target) {
            // niet target object
            target = target.replace('#SflRcdNbr', serverIndex);
            obj.setAttribute('data-mask-target', target);
            container = obj.getAttribute('data-mask-target');
            container = container.replace('#SflRcdNbr', serverIndex);
            obj.setAttribute('data-mask-container', container);
        }

        nextPart = obj.getAttribute('data-nextMask-part');
        if (nextPart) {
            // niet target object
            nextPart = nextPart.replace('#SflRcdNbr', serverIndex);
            obj.setAttribute('data-nextMask-part', nextPart);
        }

        lastPart = obj.getAttribute('data-mask-last-part');
        //target object
        if (lastPart) {
            firstPart = obj.getAttribute('data-mask-first-part');
            lastPart = lastPart.replace('#SflRcdNbr', serverIndex);
            firstPart = firstPart.replace('#SflRcdNbr', serverIndex);
            obj.setAttribute('data-mask-first-part', firstPart);
            obj.setAttribute('data-mask-last-part', lastPart);
        }
        obj.setAttribute('data-record-number', serverIndex);
    }
};
