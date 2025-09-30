GUI.setDataAttributes = function (obj) {
    if (!obj.dataAttr) {
        return;
    }
    if (obj.dataAttr.includes('*SIGNED')) {
        obj.signed = true;
    }
    if (obj.dataAttr.includes('*UPPER')) {
        obj.upperCase = true;
    }
    if (obj.dataAttr.includes('*UCS2')) {
        obj.ucs2 = true;
    }

    if (obj.dataAttr.includes('*LFTBLK')) {
        obj.leftBlank = true;
    }
    if (obj.dataAttr.includes('*LFTZRO')) {
        obj.LeftZero = true;
    }
    if (obj.dataAttr.includes('*DIGITS')) {
        obj.digitsOnly = true;
    }
    if (obj.dataAttr.includes('*ALPHA')) {
        obj.Alpha = true;
    }

}

GUI.translateDefinition = function (obj) {
    if (obj.translated) {
        return;
    }//als een definitie hergebruikt wordt voor een ander info window hoeft hij niet meer te worden vertaald-->
    if (obj.dataType) {
        obj.dataType = GUI.translateDefinition.dataType[obj.dataType];
    }

    if (obj.textAlign) {
        obj.textAlign = GUI.translateDefinition.textAlign[obj.textAlign];
    }

    if (obj.textLevel) {
        obj.textLevel = GUI.translateDefinition.textLevel[obj.textLevel];
    }

    if (obj.fieldAttr) {
        obj.fieldAttribute = obj.fieldAttr;
    }
    if (obj.AttnField) {
        obj.attentionLevelField = obj.AttnField;
    }
    if (!obj.xSize) {
        obj.xSize = obj.maxLength;
    }
    GUI.setDataAttributes(obj);


    if (obj.colorApplyTo === "*BKGD") {
        if (obj.colorName && obj.colorName !== "*VAR") {
            obj.backgroundColor = GUI.translateDefinition.color[obj.colorName];
        } else {
            obj.backgroundColorField = obj.colorField;
        }
    }

    if (obj.colorApplyTo === "*FONT") {
        if (obj.colorName && obj.colorName !== "*VAR") {
            obj.textColor = GUI.translateDefinition.color[obj.colorName];
        } else {
            obj.textColorField = obj.colorField;
        }
    }
    obj.translated = true;
};


GUI.translateDefinition.textAlign = {
    "*LEFT": "Left",
    "*RIGHT": "Right",
    "*CENTER": "Center"
};

GUI.translateDefinition.dataType = {
    "*TXT": "text",
    "*DTA": "data",
    "*DEC": "decimal",
    "*LGL": "logical",
    "*LNK": "link",
    "*MEMO": "memo"
};

GUI.translateDefinition.dataTypeReverse = {
    "text": "*TXT",
    "data": "*DTA",
    "decimal": "*DEC",
    "logical": "*LGL",
    "link": "*LNK",
    "memo": "*MEMO"
};


GUI.translateDefinition.conditionalAttribute = {
    "*MSG": "message",
    "*INF": "information",
    "*ATN": "attention",
    "*ALR": "alert",
    "*ERR": "error",
    "*HIDDEN": "hidden",
    "*PROTECT": "protect", //alleen bij input niet bij label
    "*RIGHT": "alignRight",
    "*CENTER": "alignCenter"
};

GUI.translateDefinition.color = {
    "*BLACK": "black",
    "*GRAY": "gray",
    "*PINK": "pink",
    "*ORANGE": "orange",
    "*GREEN": "green",
    "*YELLOW": "yellow",
    "*RED": "red", //alleen bij input niet bij label
    "*BLUE": "blue",
    "*VIOLET": "violet",
    "*BROWN": "brown"
};

GUI.translateDefinition.textLevel = {
    "*LVL1": "1",
    "*LVL2": "2"
};