/* global XDOM */

function TableBody(parent) {
    this.rows = [];
    this.rows[0] = [];
    this.parent = parent;
    this.tableDomObject = null;
    this.domObject = null;
    this.bodyHeight = null;
}

TableBody.prototype.newRow = function () {
    this.rows[this.rows.length] = [];
    return;
};

TableBody.prototype.addField = function (field) {
    var faCurrentRow = this.rows[this.rows.length - 1];
    faCurrentRow[faCurrentRow.length] = field;
    return;
};


TableBody.prototype.render = function () {
    var fiDataLength = 0;
    if (this.parent.data) {
        fiDataLength = this.parent.data.length;
    }

    XDOM.removeDOMObject(this.domObject);
    this.domObject = null;

    this.domObject = XDOM.createElement('DIV', this.parent.id + 'Body', 'table-body-div');

    if (this.bodyHeight) {
        this.domObject.style.height = this.bodyHeight;
        this.domObject.style.minHeight = this.bodyHeight;
    }

    this.tableDomObject = XDOM.createElement('TABLE', this.parent.id + 'body', 'regularTableBody qsResultTable');

    this.tableDomObject.appendChild(this.parent.renderColGroup());
    this.domObject.appendChild(this.tableDomObject);
    this.parent.domObject.appendChild(this.domObject);

    if (!this.parent.data || this.parent.data.length === 0) {
        return;
    }
    for (this.cursor = 0; this.cursor < fiDataLength && this.cursor < this.parent.maxRows; this.cursor++) {
        this.renderRecord();
    }

    return;
};

TableBody.prototype.renderRecord = function () {
    var fiRows = this.rows.length;
    var faCells = null;
    var fiCells = 0;
    var foCell = null;
    var foTbody = null;
    var foTD = null;
    var foTR = null;
    var record = this.parent.data[this.cursor];
    var subfileAttributes = this.parent.subfileAttributes[this.cursor] || {};
    var fsData = '';
    var foCaptions = this.parent.captions;

    foTbody = XDOM.createElement('TBODY');
    foTbody.setAttribute("data-table-cursor", this.cursor);
    foTbody.setAttribute("data-quicksearch-id", this.parent.qsId);
    foTbody.setAttribute("data-table-id", this.parent.id);
    foTbody.addEventListener('click', Table.rowClickHandler);

    this.tableDomObject.appendChild(foTbody);
    this.parent.displayedRecords[this.cursor] = foTbody;

    if (this.cursor % 2 === 0) {
        foTbody.className = "table-row";
    } else {
        foTbody.className = "table-alt-row";
    }

    for (var i = 0; i < fiRows; i++) {
        foTR = XDOM.createElement('TR');
        foTbody.appendChild(foTR);
        foTR.style.height = "19px";
        faCells = this.rows[i];
        fiCells = faCells.length;
        for (var n = 0; n < fiCells; n++) {
            foCell = faCells[n];

            if (record[foCell.id]) {
                fsData = record[foCell.id];
            } else {
                fsData = "";
            }
            foTD = foCell.render(fsData, foCaptions, record, subfileAttributes, this.cursor);
            foTD.addEventListener('click', Table.rowClickHandler)
            foTD.setAttribute("data-click-action", "Table.rowClickHandler");
            foTD.setAttribute("data-table-cursor", this.cursor);
            foTD.setAttribute("data-table-id", this.parent.id);
            foTR.appendChild(foTD);
        }

    }
};

