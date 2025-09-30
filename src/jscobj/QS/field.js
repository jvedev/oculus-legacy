function TableField(id, cssClass, colSpan) {
    this.id = id;
    this.type = Table.fieldType.data;
    this.colSpan = 1;
    this.caption = '';
    this.labelOrigin = '';
    this.labelVariable = '';
    this.maxScaleSystemLimit = null;
    this.maxScaleField = null;
    this.blankWhenZero = null;
    this.thousandSeparator = null;
    this.attentionField = null;
    if (colSpan) {
        this.colSpan = colSpan;
    }
    this.cssClass = cssClass;
    this.sortAscend = null;
    this.sortDescend = null;
    this.sortSensitivity = null;
    this.sortId = null;
    this.qsId = null;
    this.fieldName = null;
    this.textAlign = null;
    this.infoProgram = null;
    this.whenField = null;
    this.whenValue = null;
}

/**
 *
 * @returns {domObject}
 */
TableField.prototype.renderHeaderCel = function () {
    var foDomObject = XDOM.createElement('TH', null, this.cssClass);
    var foWrapper = XDOM.createElement("DIV", null, "thWrapper");
    var foSort = XDOM.createElement("DIV", null, "srtcol");
    var foAsc = null;
    var foDesc = null;
    var foLabel = XDOM.createElement("LABEL");
    var fsText = this.caption;

    if (this.labelOrigin === "*VAR") {
        foLabel.setAttribute("data-quicksearch-heading-field", this.labelVariable);
    }

    if (fsText === '') {
        fsText = " ".nonBreakingSpace();
    }
    if (this.sortAscend === "true") {
        this.quickSearch.sortfields[this.fieldName] = this.fieldName;
        foAsc = XDOM.createElement("DIV", this.qsId + '-A-' + this.fieldName, "srtascavl pth-icon dataSectionButton");
        foAsc.setAttribute("data-quicksearch-id", this.qsId);
        foAsc.setAttribute("data-sort-sequence", "A");
        foAsc.setAttribute("data-sort-field-name", this.fieldName);
        foAsc.setAttribute("data-sort-id", this.sortId);
        foAsc.setAttribute("data-sort-case-sensitve", this.sortSensitivity);
        foAsc.setAttribute("data-sort-active", "false");
        foAsc.title = getCapt('cSRTASC_TTL');
        foAsc.addEventListener('click', QuickSearch.sortButtonClick);
        foSort.appendChild(foAsc);

    }


    if (this.sortDescend === "true") {
        this.quickSearch.sortfields[this.fieldName] = this.fieldName;
        foDesc = XDOM.createElement("DIV", this.qsId + '-D-' + this.fieldName, "srtdscavl pth-icon dataSectionButton");
        foDesc.setAttribute("data-quicksearch-id", this.qsId);
        foDesc.setAttribute("data-sort-id", this.sortId);
        foDesc.setAttribute("data-sort-field-name", this.fieldName);
        foDesc.setAttribute("data-sort-sequence", "D");
        foDesc.setAttribute("data-sort-case-sensitve", this.sortSensitivity);
        foDesc.setAttribute("data-sort-active", "false");
        foDesc.addEventListener('click', QuickSearch.sortButtonClick);
        foDesc.title = getCapt('cSRTDSC_TTL');
        foSort.appendChild(foDesc);

    }
    foLabel.appendChild(XDOM.createTextNode(fsText));
    foDomObject.appendChild(foWrapper);

    if ((this.sortAscend === "true") || (this.sortDescend === "true")) {
        foWrapper.appendChild(foSort);
        XDOM.classNameReplaceOrAdd(foLabel, "sortEnabled", "sortEnabled");
    }

    foWrapper.appendChild(foLabel);
    foDomObject.colSpan = this.colSpan;

    if (this.dataType === '*DEC' || this.dataType === '*VARDEC') {
        XDOM.classNameReplaceOrAdd(foLabel, "alignRight", "alignRight");
    }

    foLabel.style.width = "100%";
    switch (this.textAlign) {
        case "*LEFT":
            XDOM.classNameReplaceOrAdd(foLabel, "alignLeft", "alignLeft");
            break;
        case "*RIGHT":
            XDOM.classNameReplaceOrAdd(foLabel, "alignRight", "alignRight");
            break;
        case "*CENTER":
            XDOM.classNameReplaceOrAdd(foLabel, "alignCenter", "alignCenter");
            break;
        default:
            break;
    }

    return foDomObject;
};

/**
 * aanpasing in data structuur kan lijden tot het niet meer goed werken van specifieke
 * @param {type} text
 * @param {type} captions
 * @param {type} record
 * @param {type} subfileAttributes
 * @param {type} number
 * @returns {domObject}
 */
TableField.prototype.render = function (text, captions, record, subfileAttributes, number) {
    var foDomObject = null;
    var fiMaxScale = null;
    var foMaxScale = null;
    var fsAttentionLevel = null;

    this.number = number;
    this.record = record;
    this.subfileAttributes = subfileAttributes;

    if (this.maxScaleField) {
        fiMaxScale = subfileAttributes[this.maxScaleField];
    }

    fsAttentionLevel = ENUM.attentionLevelReverse[subfileAttributes[this.attentionField]];

    var fsText = null;
    if (this.type === Table.fieldType.data) {
        foDomObject = XDOM.createElement('TD', null, this.cssClass);
        if (fsAttentionLevel) {
            foDomObject.className += ' ' + fsAttentionLevel;
        }
        fsText = text;
    } else {
        foDomObject = XDOM.createElement('TH', null, this.cssClass);
        fsText = this.caption;
    }

    if (fsText === '') {
        fsText = " ".nonBreakingSpace();
    }
    foDomObject.colSpan = this.colSpan;


    if (this.blankWhenZero === ENUM.blankWhenZero.blank && isZero(fsText)) {
        fsText = '';
    }

    if (this.thousandSeparator) {
        fsText = formatThousand(fsText);
    }

    switch (this.dataType) {

        case '*LNK':
            if (fsText.trim().length > 0) {
                var showInSubfile = true;
                var foLinkObj = new GUI.Link(this);
                foLinkObj.id = this.id + "_" + this.number;
                foLinkObj.value = this.record[this.id];

                // if (foLinkObj.urlType !== "*HashedUrl") {
                //     foLinkObj.value = foLinkObj.value.toLowerCase();
                // }
                foLinkObj.extension = subfileAttributes[this.aliasField];
                foDomObject.appendChild(foLinkObj.render(showInSubfile));
            }
            break;
        case '*DEC':
            foDomObject.style.textAlign = "right";
            XDOM.setAttribute(foDomObject, "data-td-value", fsText);

            if (fiMaxScale) {
                foMaxScale = formatMaxScale(fsText, this.maxScaleSystemLimit, fiMaxScale);
                fsText = foMaxScale.value;
                foSpan = XDOM.createElement("span", null, "qsearchDec " + foMaxScale.cssClass);
                foDomObject.appendChild(foSpan);
                foSpan.appendChild(XDOM.createTextNode(fsText));
            } else {
                foDomObject.appendChild(XDOM.createTextNode(fsText));
            }
            break;
        case '*VARDEC':
            foDomObject.style.textAlign = "right";
            foDomObject.appendChild(XDOM.createTextNode(fsText));
            break;
        default:

            if (this.isMask) {
                var showInSubfile = true;
                var foMaskObj = new GUI.MaskedOutput(this);
                foMaskObj.value = this.record[this.id];
                foDomObject.appendChild(foMaskObj.render(showInSubfile));
            } else {
                foDomObject.style.textAlign = "left";
                foDomObject.appendChild(XDOM.createTextNode(fsText));
            }
    }

    if (this.infoProgram) {
        this.renderInfoProgramIcon(foDomObject);
    }


    switch (this.textAlign) {
        case "*LEFT":
            foDomObject.style.textAlign = "left";
            break;
        case "*RIGHT":
            foDomObject.setAttribute("data-align", "right");
            foDomObject.style.textAlign = "right";
            break;
        case "*CENTER":
            foDomObject.style.textAlign = "center";
            break;
        default:
            break;
    }

    var titleString = null;
    if (this.hintOrigin && this.hintVariable) {
        switch (this.hintOrigin) {
            case "*VAR":
                titleString = this.record[this.hintVariable];
                break;
            case "*LBL":
                if (captions && hasValue(captions[this.hintVariable])) {
                    titleString = captions[this.hintVariable];
                }
                break;
        }
        GUI.infoTitle.register(foDomObject, titleString);
    }

    return foDomObject;
};

TableField.prototype.checkWhen = function (value) {
    const field = this.infoProgram.whenField
    if (!field) {
        //no when conditions
        return true;
    }
    //check if whenfield is defined and equal to field in record or subfileAttributes
    return (
        this.record[field] == value ||
        this.subfileAttributes[field] == value
    );
}
    /**
     * renderd het info icoon
     * @param {cel} cell td objectje
     * @returns {void}
     */
    TableField.prototype.renderInfoProgramIcon = function (cell) {

        if (!this.checkWhen(this.infoProgram.whenValue)) { //return if when condition is not met
            return;
        }


        var id = "qs-info-" + this.id + '-' + this.number,
            div = XDOM.createElement("div", id, " pth-icon dataSectionButton theme-hover-color infoProgram  pth-infoProgram"),
            paramValues = [],
            paramObject = null;
        for (var i = 0, l = this.infoProgram.parmObject.length; i < l; i++) {
            paramObject = this.infoProgram.parmObject[i];
            if (paramObject.location === 'subfileData') {
                paramObject = {
                    "location": "directValue",
                    "value": this.record[paramObject.field]
                };
            }
            paramValues.push(paramObject);
        }

        div.setAttribute("data-parm-object", JSON.stringify(paramValues));
        div.setAttribute("data-panel-id", id);
        div.setAttribute("data-macro-name", this.infoProgram.macroName);
        div.setAttribute("data-macro-location", this.infoProgram.location || 'dbs');
        div.setAttribute("data-info-id", "INFO-" + id);
        div.setAttribute("data-to-id", "");
        div.setAttribute("data-click-action", "GUI.InfoWindow.handleClick");
        div.setAttribute("data-mouseover-action", "GUI.InfoWindow.handleMouseOver");
        div.setAttribute("data-mouseout-action", "GUI.InfoWindow.handleMouseOut");


        cell.appendChild(div);
        XDOM.addEventListener(div, "mouseover", handleMouseOver);
        XDOM.addEventListener(div, "mouseout", handleMouseOut);

    };

    TableField.prototype.setInfoProgram = function (infoPgm) {
        if (!infoPgm) {
            return;
        }
        infoPgm.parmObject = XDOM.parse(infoPgm.parmObject);
        this.infoProgram = infoPgm;
    };