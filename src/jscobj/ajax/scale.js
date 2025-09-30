/**
 * scaling:
 * Alleen geldig voor voor *DEC velden met een  data-maxscale-system-limit attribute
 *
 * data-precision:               alle cijfers dus voor en na de comma samen
 * data-scale:                   alle cijfers na de comma
 * data-maxscale-system-limit    maximaal aantal cyfers na de comma voor de hele omgeving
 * data-maxscale-field
 * data-maxscale-appearance      wordt dynamisch bepaald voor toepassen van let style ten behoeven van de uitlijning
 *
 * @see P:\20 Productontwikkeling\50 Werkdocumenten\30 Ontwerpen systeemprogrammatuur\01 Versiebeheer\Release 9\Maxscale attributen.docx
 *
 */

/**
 * aanpassen css classes voor output *DEC
 *
 * @param obj
 */
function formatMaxScale(value, globalMaxScale, maxScale, decimalSeparator) {
    var fsDecimalSeparator = SETTINGS.decimalSeparator;
    if (decimalSeparator) {
        fsDecimalSeparator = decimalSeparator;
    }
    var faValue = value.split(fsDecimalSeparator);
    var fsIntPart = faValue[0];
    var fsDecPart = faValue[1];
    if (!fsDecPart) {
        fsDecPart = '';
    }
    var fsShowPart = fsDecPart.substr(0, maxScale);
    var fsHidePart = fsDecPart.substr(maxScale, fsDecPart.length - maxScale);
    var fiDecLength = maxScale;
    var foReturn = {value: '', cssClass: '', valid: false};

    if (fsHidePart == "" || parseInt(fsHidePart) == 0) {
        //geldige opmaak
        fsHidePart = '';
        foReturn.valid = true;
    } else { // ongeldig alles laten zien
        fsShowPart = fsDecPart;
        fiDecLength = fsShowPart.length;

    }

    foReturn.cssClass = 'dec_pos' + fiDecLength + '_' + globalMaxScale;

    if (fsShowPart == '') {
        foReturn.value = fsIntPart;
    } else {
        foReturn.value = fsIntPart + fsDecimalSeparator + fsShowPart;
    }

    return foReturn;
}


function MaxScale(obj, subFileData) {
    this.obj = obj;
    this.isInput = true;
    this.decimalLength = 0;
    this.IntLength = 0;
    this.systemLimit = 0;
    this.decimalValue = '';
    this.intValue = '';
    this.value = '';
    this.subfileData = subFileData;
    this.init();
}

MaxScale.prototype.init = function () {
    this.getObjectValue();
    this.getObjectProperties();
};

MaxScale.prototype.getObjectValue = function () {

    this.isInput = (this.obj.tagName == "INPUT");

    var value = XDOM.getObjectValue(this.obj);
    var aValue = value.split(SETTINGS.decimalSeparator);
    this.intValue = aValue[0];
    if (aValue[1]) {
        this.decimalValue = aValue[1];
    }

};

MaxScale.prototype.getObjectProperties = function () {
    var scale = this.getScale();
    var precision = parseInt(this.obj.getAttribute("data-precision"));
    this.IntLength = precision - parseInt(this.obj.getAttribute("data-scale"));
    this.decimalLength = scale;
};

MaxScale.prototype.getScale = function () {
    var maxScale = null;
    var scaleField = this.obj.getAttribute("data-maxscale-field");
    var returnValue = 0;
    this.systemLimit = parseInt(this.obj.getAttribute("data-maxscale-system-limit"));
    if (this.subfileData) {
        maxScale = this.subfileData[scaleField];
    } else {
        maxScale = SESSION.activeData.headerAttributes[scaleField];
    }

    if (maxScale) {
        returnValue = parseInt(maxScale);
    } else {
        maxScale = this.obj.getAttribute("data-scale");
        if (maxScale) {
            returnValue = parseInt(maxScale);
        } else {
            returnValue = this.systemLimit;
        }
    }


    return returnValue;
};

MaxScale.prototype.validate = function () {

    var fiIntvalue = this.intValue;

    fiIntvalue = fiIntvalue.replace(/\./g, ''); 	//<-- Verwijder eerst alle punten
    fiIntvalue = fiIntvalue.replace(/\,/g, '.');	//<-- Verandere alle komma's door punten ivm Amerikaanse nummer opmaak.

    if (isNaN(this.decimalValue) || isNaN(fiIntvalue)) {
        this.valid = false;
        return false;
    }
    this.decimalValue = this.decimalValue.removeTrailingZeros();
    if (this.isInput) {
        this.valid = (this.decimalValue.length <= this.decimalLength) && (fiIntvalue.length <= this.IntLength);
    } else {
        this.valid = (this.decimalValue.length <= this.decimalLength);
    }
    return this.valid;
};


MaxScale.prototype.complete = function () {
    this.validate();
    this.value = this.intValue;
    if (this.decimalValue == "") {
        this.decimalValue = "0";
    }
    if (this.systemLimit > 0 && this.isInput) {
        this.value += SETTINGS.decimalSeparator + this.decimalValue.rgtzro(this.systemLimit);
    }

    if (this.decimalLength > 0 && !this.isInput) {
        this.value += SETTINGS.decimalSeparator + this.decimalValue.rgtzro(this.decimalLength);
    }
};


/**
 * de patern is opgebouwd als volgd:
 * #####,##00
 * waarbij geld:
 * #### hier wordt # * IntLength getoond
 * ,    alleen getoond indien er spraken is van getallen achter de comma (duh)
 * ##   hier wordt # * this.decimalLength getoond
 * 00   decimalen die de decimalLength overschrijden maar wel binnen de systemLimit vallen
 */
MaxScale.prototype.getPatern = function () {
    var patern = "#".times(this.IntLength);
    var trailingZeros = 0;
    if (this.systemLimit > 0) {
        patern += SETTINGS.decimalSeparator;
        patern += "#".times(this.decimalLength);
        trailingZeros = this.systemLimit - this.decimalLength;
        patern += "0".times(trailingZeros);
    }
    return patern;
};


MaxScale.prototype.apply = function () {
    this.complete();
    if (this.isInput) {
        this.applyToInput();
    } else {
        this.applyToOutput();
    }
    //cleanup voor garbage collection
    this.obj = null;
};

MaxScale.prototype.applyToInput = function () {
    if (this.valid) {
        this.obj.value = this.value;
        this.obj.setAttribute("value", this.value)
        this.obj.setAttribute("data-maxscale-appearance", null);
        this.obj.setAttribute("data-old-value",this.value);
    } else {
        this.obj.setAttribute("data-maxscale-appearance", "valueError");
    }
};


MaxScale.prototype.applyToOutput = function () {
    if (this.valid) {
        this.obj.setAttribute("data-maxscale-appearance", this.decimalLength + "_" + this.systemLimit);
        XDOM.setObjectValue(this.obj, this.value);
    } else {
        this.obj.setAttribute("data-maxscale-appearance", "valueError");
    }
};


MaxScale.update = function () {
    var foPageObjects = XDOM.queryAll('[data-datatype ="*DEC"][data-maxscale-system-limit]:not([data-maxscale-system-limit="*AUTO"])');
    var obj = null;

    for (var i = 0, l = foPageObjects.length; i < l; i++) {
        obj = foPageObjects[i]
        if (obj.getAttribute("data-maxscale-field") != "*IGNORE") {
            obj = new MaxScale(foPageObjects[i]);
            obj.apply();
        }
    }

    //cleanup voor garbage collection
    obj = null;
    foPageObjects = null;
};

/**
 * when data-scale is set but no data-maxscale-system-limit
 * scale will not be set by MaxScale.update
 * in that case we can format the value only based upon data-scale
 */
MaxScale.formatScaleOnly = (obj, value) => {
    const scale = obj.dataset.scale || '';
    //set the test value and make sure it will be a string
    let testValue = value || "";
    //replace "," and "." see if the remaining string actualy has a value
    testValue = parseInt(testValue.replace(".","").replace(",",""));

    //*blank and no value or 0 or "0.0"or "0,0" just return the value
    if (obj.getAttribute("data-value-when-zero")=="*BLANK" && !testValue){
        //clear the string
        return '';
    }
    if (!scale || obj.getAttribute("data-maxscale-system-limit")) {
        //ignore this field and don't format
        //excluding fields having data-maxscale-system-limit or no scale
        return value;
    }



    const decimalLength = parseInt(scale)

    //do we have decimalLength
    if (isNaN(decimalLength)) {
        return value;
    }

    //format the part

    //split
    const parts = value.split(SETTINGS.decimalSeparator);

    //get intPart
    const intPart = parts[0] || '0';

    //format decimalPart
    const decimalPart = (parts[1] || '').substring(0, decimalLength).padEnd(decimalLength, '0');


    //check if the decimal part exists
    if(!decimalPart){ //nope just return the intpart
        return intPart;
    }

    //join them
    return intPart + SETTINGS.decimalSeparator + decimalPart;

}