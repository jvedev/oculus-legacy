/* global Table, XDOM */

function TableHeader(parent) {
    this.rows = [];
    this.parent = parent;
    this.rows[0] = [];
    this.domObject = null;
    this.backgroundDomObject = null;
    this.tableDomObject = null;
};


TableHeader.prototype.newRow = function () {
    this.rows[this.rows.length] = [];
    return;
};

TableHeader.prototype.addField = function (field) {
    field.type = Table.fieldType.header;
    field.caption = field.id;
    var faCurrentRow = this.rows[this.rows.length - 1];
    faCurrentRow[faCurrentRow.length] = field;
    return;
};

/**
 * POM-1539
 * Headers van een snelzoek kunnen dynamisch zijn opgebouwd
 * @param {type} data
 * @returns {void}
 */
TableHeader.prototype.update = function (data) {
    if (!data) {
        return;
    }
    var dbHeaders = this.domObject.querySelectorAll("[data-quicksearch-heading-field]"),
        label = null;

    for (var i = 0, l = dbHeaders.length; i < l; i++) {
        label = dbHeaders[i];
        label.innerHTML = data[label.getAttribute("data-quicksearch-heading-field")] || "*---*";
    }
};

TableHeader.prototype.render = function () {
    if (this.domObject) {
        return;
    }
    var fiHeaderRows = this.rows.length;
    var faCells = null;
    var fiCells = 0;
    var foCell = null;
    var foTBODY = null;
    var foTR = null;
    var foTH = null;
    var foColGroep = null;


    this.domObject = XDOM.createElement('DIV', this.parent.id + 'tableHeader', 'table-header-div');
    this.tableDomObject = XDOM.createElement('TABLE', this.parent.id + 'header', 'regularTableHeader');

    this.domObject.appendChild(this.tableDomObject);

    foColGroep = this.parent.renderColGroup(true);
    this.tableDomObject.appendChild(foColGroep);
    foTBODY = XDOM.createElement('THEAD');
    this.tableDomObject.appendChild(foTBODY);


    for (var i = 0; i < fiHeaderRows; i++) {
        foTR = XDOM.createElement('TR');
        foTBODY.appendChild(foTR);
        faCells = this.rows[i];
        fiCells = faCells.length;
        for (var n = 0; n < fiCells; n++) {
            foCell = faCells[n];
            foTH = foCell.renderHeaderCel();
            foTR.appendChild(foTH);
        }
    }
    return;
};

