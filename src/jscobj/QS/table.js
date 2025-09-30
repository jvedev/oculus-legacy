function Table(id) {
    this.id = id;
    this.data = [];
    this.columns = [];
    this.header = new TableHeader(this);
    this.body = new TableBody(this);
    this.domObject = null;
    this.maxRows = 999999;
    this.onClick = null;
    this.width = '';
    this.totalWidth = 0;
    this.cursor = 0;
    this.displayedRecords = [];
    this.sizes = {};
    this.inline = false;
    this.lastSelectedRecord = null;
    this.bodyDivHeight = 0;
    this.dom = {};
    this.qsId = null;
    Table.add(this);
}

//static
Table.fieldType = {"data": 'd', "header": 'h'};
Table.tableInstances = [];

Table.rowClickHandler = function (e) {
    XDOM.getEvent(e);
    //check if this a link
    if (e.target.tagName === 'A') {
        //if so don't execute the rowclick event
        return;
    }

    var tbody = XDOM.getParentByTagName(GLOBAL.eventSourceElement, "TBODY");
    var rowNr = tbody.getAttribute("data-table-cursor");
    var Tableid = tbody.getAttribute("data-table-id");

    var qsId = tbody.getAttribute("data-quicksearch-id");
    QuickSearch.OnSelect(qsId, parseInt(rowNr), true);

    var foTable = Table.tableInstances[Tableid];
    if (foTable) {
        foTable.cursor = parseInt(rowNr);
        foTable.highLightRow();
    }
};

Table.add = function (table) {
    Table.tableInstances[table.id] = table;
};


Table.prototype.renderColGroup = function (forHeader) {
    if (this.inline) {
        return this.renderInlineColGroup();
    }
    var foColGroup = null;
    var fiCols = this.columns.length;
    var fiPXWidth = 0;
    var fiPXTotalWidth = 0;
    var foCol = null;
    if (fiCols === 0) {
        return;
    }
    foColGroup = XDOM.createElement('COLGROUP');
    for (var i = 0; i < fiCols; i++) {
        if (this.columns[i]) {
            fiPXWidth = SETTINGS.charWidth * this.columns[i];
            foCol = XDOM.createElement('COL');
            foCol.style.width = fiPXWidth.toString() + 'px';
            foColGroup.appendChild(foCol);
            fiPXTotalWidth += fiPXWidth;
        }
    }

    if (forHeader) {
        this.totalWidth = (fiPXTotalWidth + fiCols - 1);
    }

    this.width = fiPXTotalWidth.toString() + 'px';
    return foColGroup;
};

Table.prototype.renderInlineColGroup = function () {
    var fitotalColumns = 0;
    var fiTotalWidth = 0;
    var fiColWidth = 0;
    var fiWidth = 0;
    var foCol = null;
    var foColGroup = XDOM.createElement('COLGROUP');

    if (this.columns.length === 0) {
        return foColGroup;
    }

    for (var i = 0, l = this.columns.length; i < l; i++) {
        fitotalColumns += this.columns[i];
    }

    fiColWidth = floor(100 / fitotalColumns, 2);

    for (var i = 0, l = this.columns.length; i < l; i++) {
        if (i === l - 1) {//laatste colomn
            fiWidth = 100 - fiTotalWidth;
        } else {
            fiWidth = fiColWidth * this.columns[i];
            fiTotalWidth += fiWidth;
        }
        foCol = XDOM.createElement('COL');
        foCol.style.width = fiWidth + '%';
        foColGroup.appendChild(foCol);
    }

    return foColGroup;
};

//regelt de grotes voor inline tables: tables waarbij de buitenkant bepaaald hoe groot ze zijn en die in procenten gezet worden
Table.prototype.setSize = function () {
    if (!this.inline) {
        return;
    }
    var fiHeaderRows = this.header.rows.length;
    var fiHeaderHeight = fiHeaderRows * 20;
    var fiFullWidth = 0;

    this.domObject.style.height = this.sizes.totalHeight + 'px';
    this.header.domObject.style.height = fiHeaderHeight + 'px';
    this.backgroundDomObject.style.height = fiHeaderHeight + 'px';
    this.body.domObject.style.height = this.sizes.totalHeight - fiHeaderHeight + 'px';
    this.body.domObject.style.minHeight = this.sizes.totalHeight - fiHeaderHeight + 'px';

    this.domObject.style.width = this.sizes.totalWidth + '%';
    this.header.tableDomObject.style.width = "100%";
    this.header.tableDomObject.style.height = "100%";
    this.body.domObject.style.width = "100%"; //eerst 100% zetten en dan pas in pixels zodat we die kunnen opvragen en later geen afrondingsfouten meer kunnen hebben
    fiFullWidth = this.domObject.offsetWidth;
    this.body.domObject.style.width = fiFullWidth + 'px';

    //nu kunnen we de breedte van de header zetten afgeleid van de body - 16px voor de scrollbar
    this.header.domObject.style.width = fiFullWidth - BrowserDetect.scrollbarWidth + 'px';
    this.body.tableDomObject.style.width = "100%";
};

Table.prototype.render = function () {

    this.domObject = XDOM.createElement('DIV', this.id, 'regularTable');
    this.backgroundDomObject = XDOM.createElement('DIV', null, 'tableHeaderBackground theme-background-color');
    this.header.render();
    this.body.render();

    this.domObject.appendChild(this.backgroundDomObject);
    this.domObject.appendChild(this.header.domObject);
    this.domObject.appendChild(this.body.domObject);
    return this.domObject;
};

Table.prototype.select = function (iRowNr) {
    this.cursor = iRowNr;
    this.highLightRow();
};

Table.prototype.rowUp = function () {
    this.cursor--;
    if (this.cursor < 0) {
        this.cursor = this.displayedRecords.length - 1;
    }
    this.highLightRow();
};

Table.prototype.rowDown = function () {
    this.cursor++;
    if (this.cursor >= this.displayedRecords.length) {
        this.cursor = 0;
    }
    this.highLightRow();
};


Table.prototype.update = function (qs) {
    this.data = null;
    this.cations = null;
    this.subfileAttributes = [];

    if (qs) {
        this.data = qs.displayData;
        this.cations = qs.captions;
        this.subfileAttributes = qs.subfileAttributes || [];
    }

    this.displayedRecords = [];
    this.cursor = 0;
    XDOM.removeDOMObject(this.body.domObject);
    this.body.render();
    this.select(0);
};


Table.prototype.getCurrentRecord = function () {
    if (!this.data) {
        return null;
    }

    return this.data[this.cursor];
};

Table.prototype.highLightRow = function () {
    //unselect previous  field
    if (this.lastSelectedRecord) {
        this.lastSelectedRecord.className = this.lastSelectedRecord.className.replace('table-row-highlight', '');
        this.lastSelectedRecord.setAttribute('data-record-selected','');
    }

    this.lastSelectedRecord = this.displayedRecords[this.cursor];
    if (this.lastSelectedRecord) {
        this.lastSelectedRecord.className += ' table-row-highlight';
        scrollIntoView(this.lastSelectedRecord, this.body.domObject);
    }
};





