/****************************************************************************************/
/*        Section: String prototypes                                                    */
/* global Lines, BrowserDetect, ENUM, MAIN, SESSION, SETTINGS */

/** ************************************************************************************* */

String.prototype.removeTrailingZeros = function () {
    var sOut = "0." + this;
    sOut = parseFloat(sOut).toString();
    sOut = sOut.replace('0.', '');
    if (sOut == "0") {
        return "";
    }
    return sOut;
};

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (compareString) {
        var stringValue = '';
        if (this.typeof != 'String') {
            stringValue = this.toString();
        } else {
            stringValue = this;
        }

        if (stringValue == '' & compareString == '') {
            return true;
        }
        return (stringValue.indexOf(compareString) == 0 && compareString != '');
    };
}

if (!String.prototype.like) {
    /**
     * vergelijkt string met compareString case Insensitive
     * @param compareString
     * @returns {Boolean}
     */
    String.prototype.like = function (compareString) {
        return (this.toLowerCase().indexOf(compareString.toLowerCase()) > -1);
    };
}

if (!String.prototype.rgtzro) {
    String.prototype.rgtzro = function (n) {
        /* gebruik:
          var a=' '.rgtzro(5); // a == '50000'
         */
        if (this.length > 0) {
            return this + '0'.times(n - this.length);
        }
        return this;
    };
}

/**
 * String.nonBreakingSpace
 * geeft een string terug waar van de ' ' (spaties) vervangen zijn door &nbsp; maar dan via de unicode escape sequense '\u00a0'
 * @returns String waar van de ' ' (spaties) vervangen zij door de unicode escape sequense '\u00a0'
 *
 */
if (!String.prototype.nonBreakingSpace) {
    String.prototype.nonBreakingSpace = function () {
        return this.replace(/ /g, '\u00a0');
    };
}

String.prototype.times = function (n) {
    /* gebruik:
      var r='hoi', q;
      r=r.times(5);  // r == 'hoihoihoihoihoi'
      q='0'.times(4) // q == '0000'
     */
    var s = '';
    for (var i = 0; i < n; i++) {
        s += this;
    }
    return s;
};

if (!String.prototype.lftzro) {
    String.prototype.lftzro = function (n) {
        /* gebruik:
          var a='5'.lftzro(5); // a == '00005'
         */
        return '0'.times(n - this.length) + this;
    };
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


if (!String.prototype.lftblk) {
    String.prototype.lftblk = function (n) {
        /* gebruik:
          var a=' '.lftblk(5); // a == '    5'
         */
        if (this.length > 0) {
            return ' '.times(n - this.length) + this;
        }
        return this;

    };
}

if (!String.prototype.rgtblk) {
    String.prototype.rgtblk = function (n) {
        /* gebruik:
          var a=' '.lftblk(5); // a == '5    '
         */
        if (this.length > 0) {
            return this + ' '.times(n - this.length);
        }
        return this;
    };
}

if (!String.prototype.trim) {
    String.prototype.trim = function () {
        /* gebruik:
          var a=' blabla  '.trim(); // a='blabla'
         */
        a = this.replace(/^\s+/, '');
        return a.replace(/\s+$/, '');
    };
}
if (!String.prototype.trimright) {
    String.prototype.trimright = function () {
        // trim right
        /* gebruik:
          var a=' blabla  '.trimright(); // a=' blabla'
         */
        return this.replace(/\s+$/, '');
    };
}

if (!String.prototype.trimleft) {
    String.prototype.trimleft = function () {
        // trim right
        /* gebruik:
          var a=' blabla  '.trimleft(); // a='blabla  '
         */
        return this.replace(/^\s+/, '');
    };
}
if (!String.prototype.remove) {
    String.prototype.remove = function (t) {
        var i = this.indexOf(t);
        var r = "";
        if (i == -1)
            return this.toString();
        r += this.substring(0, i) + this.substring(i + t.length).remove(t);
        return r;
    };
}

if (!String.prototype.EBCDICCompare) {
    String.prototype.EBCDICCompare = function () {
        // Compare EBCDIC sequence (0-9 after A-Z)
        /* gebruik:
            foSTRING = new String("ABC")
            foSTRING.EBCDICCompare("AAA")  return 1
            foSTRING.EBCDICCompare("ABC")  return 0
            foSTRING.EBCDICCompare("DEF")  return -1
            Vergelijk volgens de EBCDIC volgorde de meegegeven string met het object
               kleiner dan  1
               groter dan  -1
               gelijk       0
       */
        // alleen karakters uit de *DTA range
        var faEbcdicSeq500 = " .(+*);-/,_:#=abcdefghijklmnopqrstuvwxyz|ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        var fsCompStr = arguments[0];
        var faToStr = this.split("");
        var faCompStr = fsCompStr.split("");
        var fiToStr = faToStr.length;
        var fiCompStr = faCompStr.length;
        var fiCompLen = Math.min(fiToStr, fiCompStr);
        var fiChrPos1 = 0;
        var fiChrPos2 = 0;

        for (var i = 0; i < fiCompLen; i++) {
            if (faToStr[i] == faCompStr[i]) {
                continue;
            }
            fiChrPos1 = faEbcdicSeq500.indexOf(faToStr[i]);
            fiChrPos2 = faEbcdicSeq500.indexOf(faCompStr[i]);
            if (fiChrPos1 > fiChrPos2) {
                return 1;
            }
            if (fiChrPos1 < fiChrPos2) {
                return -1;
            }
        }
        if (fiToStr == fiCompStr) {
            return 0;
        }
        if (fiToStr > fiCompStr) {
            return 1;
        }
        return -1;
    };
}

/** ************************************************************************************* */
/* Section: Array prototypes */
/** ************************************************************************************* */
// if (!Array.prototype.indexOf){
// Array.prototype.indexOf=function(el, start) {
// var start=start || 0;
// var fiLEN=this.length;
// for ( var i=0; i < fiLEN; ++i ) {
// if ( this[i] == el ) {
// return i;
// }
// }
// return -1;
// };
// }

/** ************************************************************************************* */
/* Section: Date prototypes */
/** ************************************************************************************* */

Date.prototype.getMDay = function () {
    // Bepalen dagnummer (maandag 1 - zondag 7)
    return (this.getDay() + 6) % 7;
};

Date.prototype.getISOYear = function () {
    // Bepalen jaar dat hoort bij weeknummer
    var thu = new Date(this.getFullYear(), this.getMonth(), this.getDate() + 3 - this.getMDay());
    return thu.getFullYear();
};

Date.prototype.getWeek = function () {
    // Bepalen weeknummer
    var onejan = new Date(this.getISOYear(), 0, 1);
    var wk = Math.ceil((((this - onejan) / 86400000) + onejan.getMDay() + 1) / 7);
    if (onejan.getMDay() > 3) {
        wk--;
    }
    return wk;
};

Date.prototype.getWeekDate = function (dowOffset) {
    // Bepalen weekdatum (jjjjwwd)
    var jaar = this.getISOYear().toString();
    var week = this.getWeek().toString().lftzro(2);
    var dag = (this.getMDay() + 1).toString();
    return jaar + week + dag;

    //return this.getISOYear().toString() + this.getWeek().toString().lftzro(2) + (this.getMDay()+1).toString();
};

/**
 * Zet Jaar Week Dag data om in een javascript date object
 * @param YWD week jaar dag als string in YYYYWWD D is optioneel
 * @returns {Date} het bijbehordende javascript Date Object
 */
function YWDToDate(YWD) {
    var foRegExp = new RegExp(/[^\x30-\x39]/); //0-9  Testen of input alleen uit cijfers bestaat
    var fdRetDate = new Date();
    var fiYear = 0;
    var fiWeek = 0;
    var fiDays = 0;
    var fiDaysToAdd = 0;
    var fdMondayFirstWeek = new Date();

    if (foRegExp.test(YWD)) {
        return fdRetDate;
    }
    var fsYear = YWD.substring(0, 4);
    var fsWeek = YWD.substring(4, 6);
    var fsDay = YWD.substring(6, 7);


    if (fsYear.length < 4) {
        return fdRetDate;
    }
    if (fsWeek.length < 2 || fsWeek < '01') {
        fsWeek = '01';
    }
    if (fsWeek > '53') {
        fsWeek = '53';
    }
    if (fsDay < '1') {
        fsDay = '1';
    }
    if (fsDay > '7') {
        fsDay = '7';
    }


    fiYear = new Number(fsYear);
    if (fiYear < 40) {
        fiYear += 2000;
    }
    if (fiYear < 99) {
        fiYear += 1900;
    }
    if (fiYear < 1940) {
        return fdRetDate;
    }

    fdMondayFirstWeek = mondayFirstWeek(fiYear);
    fdRetDate = mondayFirstWeek(fiYear);

    fiWeek = new Number(fsWeek);
    fiDays = new Number(fsDay);
    fiDays--; // maandag is 1 die zit al in fdMondayFirstWeek;
    fiWeek--; // week 1 zit al in fdMondayFirstWeek
    fiDaysToAdd = (fiWeek * 7) + fiDays;
    fdRetDate.setDate(fdMondayFirstWeek.getDate() + fiDaysToAdd);
    return fdRetDate;
}

function stringToCYQ(CYQ) {
    // notitie YYYY/Q
    var foRegExp = new RegExp(/[^\x30-\x39]/); //0-9  Testen of input alleen uit cijfers bestaat
    var fdRetDate = new Date();
    if (foRegExp.test(CYQ)) {
        return fdRetDate;
    }
//  var fiYear = 0;
//  var fiMonth = 0;
//  var fiDay = 0;
//  var fiQuart = 0;
//  var fsYear = YWD.substring(0, 4);
//  var fsQuart = YWD.substring(4, 1);

//  var fiYear = 0;
//  var fiMonth = 0;
//  var fiDay = 0;
//  var fiQuart = 0;
//  var fsYear = YWD.substring(0, 4);
//  var fsQuart = YWD.substring(4, 1);

//  fiYear = new Number(fsYear);
//  fiQuart = new Number(fsQuart);
//  fiMonth = (fiQuart * 3) - 1;

    fdRetDate.setFullYear();
    fdRetDate.setDate();
    fdRetDate.setMonth();

    return fdRetDate;
}

/**
 *
 * @param year
 * @returns {Date} maandag week 1 van het gevraagde jaar
 */
function mondayFirstWeek(year) {
    // in nederland 4 januari valt altijd in week 1(NEN 2772)
    //opgelost via switch statement omdat voorbij het jaar dagen aftrekken bijzondere maar foutieve resultaten opleverd
    var foDate = new Date(year, 0, 4);
    var fiDay = foDate.getDay();

    switch (fiDay) {
        case 0: // zondag
            return new Date(year - 1, 11, 29);
        case 1: // maandag
            return new Date(year, 0, 4);
        case 2: // dinsdag
            return new Date(year, 0, 3);
        case 3: // woensdag
            return new Date(year, 0, 2);
        case 4: // donderdag
            return new Date(year, 0, 1);
        case 5: // vrijdag
            return new Date(year - 1, 11, 31);
        case 6: // zaterdag
            return new Date(year - 1, 11, 30);
    }
}

/** ************************************************************************************* */

/* Section: object functions */
/** ************************************************************************************* */


function getBrowserDim() {
    // ***************************************************************************
    // Verkrijg de beschikbare browser breedte en hoogte
    // parms: --
    // return: zie return
    // ***************************************************************************
    var fiWDT = 630, fiHGT = 460;
    if (parseInt(navigator.appVersion) > 3) {
        if (navigator.appName == "Netscape") {
            fiWDT = window.innerWidth;
            fiHGT = window.innerHeight;
        }
        if (navigator.appName.indexOf("Microsoft") != -1) {
            fiWDT = document.body.offsetWidth;
            fiHGT = document.body.offsetHeight;
        }
    }
    return {BRWWDT: fiWDT, BRWHGT: fiHGT};
}


function clearAuthenticationCache() {
    window.onbeforeunload = null;
    try {
        var agt = navigator.userAgent.toLowerCase();
        if (agt.indexOf("msie") != -1) {
            // IE clear HTTP Authentication
            document.execCommand("ClearAuthenticationCache");
        } else {
            var xmlhttp = createXMLObject();
            xmlhttp.open("GET", "PAGE FROM REALM TO LOGOUT", true, "logout", "logout");
            xmlhttp.send("");
            xmlhttp.abort();
        }
    } catch (e) {
        // There was an error

    }

    function createXMLObject() {
        var xmlhttp = null;
        try {
            if (window.XMLHttpRequest) {
                xmlhttp = new XMLHttpRequest();
            }
            // code for IE
            else if (window.ActiveXObject) {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
        } catch (e) {
            xmlhttp = false;
        }
        return xmlhttp;
    }
}

// function jsc_CONFIRMEXIT() {
//   // ***************************************************************************
//   // Bevestigen afsluiten applicatie
//   // parms: ?
//   // return: --
//   // Indien geannuleerd zorgt IE ervoor dat het toch de window wil sluiten, er
//   // kan dan alleen in de event onbeforeunload nog worden gereageerd. Dus dan
//   // doen we een jsc_RECONFIRM()
//   // ***************************************************************************
//   var fsMsg = gCONFIRMEXIT1 + '\n\n' + gCONFIRMEXIT2 + '\n\n' + gCONFIRMEXIT3;
//   if (OCULUS.cancelEndApplication) {
//     var bCNF = confirm(fsMsg);
//     if (bCNF) {
//       window.onbeforeunload = null;
//       OCULUS.cancelEndApplication = false;
//       jsc_CLSWIN();
//       return;
//     }
//     window.onbeforeunload = jsc_RECONFIRM;
//     OCULUS.cancelEndApplication = false;
//   }
//   OCULUS.cancelEndApplication = false;
//   return false;
// }

// function jsc_RECONFIRM() {
//   // ***************************************************************************
//   // Laatste mogelijkheid om door te gaan.
//   // parms: --
//   // return: zie return
//   // ***************************************************************************
//   if (OCULUS.standAlone) { // voorheen gPFM_STANDALONE
//     window.onbeforeunload = jsc_CLSWIN;
//     return gRECONFIRM;
//   }
// }

// *************************************************************************************/
/* Section: RCVNETMSG */

// *************************************************************************************/
/**
 * controleerd op het bestaan van een variabele
 * @param name variabele naam als string
 * @windowName optioneel referentie naar window
 * @returns boolean
 */
function isSet(name, windowName) {
    if (name == null || isNaN(name) && (!name || name == '')) {
        return;
    } //-->
    var fsNameIn = name.toString();
    var faParts = fsNameIn.split('.');
    var fsName = faParts[0];
    for (var i = 0, l = faParts.length; i < l; i++) {
        if (i > 0) {
            fsName += '.' + faParts[i];
        }
        if (!isSetTest(fsName, windowName)) {
            return false;
        }
    }
    return true;
}

/**
 * controleerd op het bestaan van een variabele
 * @param name variabele naam als string
 * @windowName optioneel referentie naar window
 * @returns boolean
 */
function isSetTest(name, windowName) {
    var fsTEST = 'typeof ' + name + '!=\'undefined\'';
    var foDOC = window;
    if (windowName) {
        foDOC = windowName;
    }
    try {
        if (foDOC.eval(fsTEST)) {
            return true;
        }
    } catch (e) {
    }
    return false;
}

function getEval(value, ifEmpty, frame) {
    if (frame && isSet(value, frame)) {
        return frame.eval(value);
    }

    if (SESSION.activeFrame && isSet(value, SESSION.activeFrame)) {
        return SESSION.activeFrame.eval(value);
    }

    if (isSet(MAIN) && isSet(value, MAIN)) {
        return MAIN.eval(value);
    }

    if (isSet(value)) {
        return eval(value);
    }

    if (hasValue(ifEmpty)) {
        return ifEmpty;
    }
    return null;
}

// onderstaande regel niet verwijderen
if (OCULUS.standAlone) { // voorheen gPFM_STANDALON
    window.onbeforeunload = null;
}

/**
 * getInnerText
 * retourneerd de innerText(ie) of de  textContent(ff)
 * @param DomObj
 * @returns value
 */
function getInnerText() {
    var foObj = arguments[0];

    if (foObj.innerText) {
        return foObj.innerText;
    }
    return foObj.textContent;
}

// nieuwere functie ook geschikt voor FF SF CH
function setCursorToEnd(obj) {
    var inputObject = XDOM.getObject(obj);
    var fsValue = inputObject.value;

//  inputObject.setAttribute("data-block-autosubmit", "true");

    if (typeof inputObject.selectionStart == "number") {
        inputObject.selectionStart = inputObject.value.length;
        inputObject.selectionEnd = inputObject.value.length;
    } else {
        inputObject.focus();
        if (hasValue(fsValue)) {
            inputObject.value = '';
            inputObject.value = fsValue;
        }
    }
}

/**
 * edgefix reset zoom als start = tyrue
 * en hersteld de zoom weer
 * voor gebruik bij alignto
 * @version  V8R3M22 POM-2296
 * @param {type} start
 * @returns {void}
 */
function alignToEdgeFix(start) {
    if (!BrowserDetect.isEdge) {
        return;
    }
    if (start) {
        alignToEdgeFix.orgZoom = MAIN.OCULUS.zoomLevel;
        MAIN.OCULUS.zoomLevel = "100";
    } else {
        MAIN.OCULUS.zoomLevel = alignToEdgeFix.orgZoom;

    }
    //
    SESSION.session.zoom();
};
alignToEdgeFix.orgZoom = '';

/**
 * zorgt ervoor dat foObject uitgeleind wordt met foAlignTo volgens de volgende regels:
 * 1 links uitlijnen, als dit niet kan dan rechts
 * 2 aan de onderkant als dit niet kan aan de bovenkant
 * 3 als er niet onder of boven kan worden geplaatst dan aan de rechter kant
 * 4 kan dat niet dan aan de linker kant
 * 5 als niets kan dan centeren en overal overheen
 * @param foObject
 * @param foAlignTo
 * @param foContainer optioneel buitenste div element waarbinnen de plaatsing moet plaats vinden default waarde: DTADIV
 * @param marginHeight
 * @version  V8R3M22 POM-2296 initialisatie en toewijzing van variabele gescheiden
 *  in verband met hoisting alignToEdgeFix fix toegevoegd
 * @returns align object
 */
function alignTo(foObject, foAlignTo, foContainer, marginHeight) {
    alignToEdgeFix(true);
    var fiMarginHeight = marginHeight,
        fiVOffset = 7,
        fiHOffset = 10,
        fiObjectTop = -1,
        fiObjectLeft = -1,
        fiWidth = 0,
        fiHeight = 0,
        fiMaxHeight = 0,
        fiMaxWidth = 0,
        foPos = 0,
        fiTop = 0,
        fiLeft = 0,
        fiBottom = 0,
        fiRight = 0,
        foRet = {},
        foScreenDiv = foContainer,
        setZeroAsMinium = false;

    fiWidth = foObject.offsetWidth;
    fiHeight = foObject.offsetHeight;

    if (!foScreenDiv) {
        foScreenDiv = XDOM.getObject("DTADIV");
        setZeroAsMinium = true;
    }
    if (!fiMarginHeight) {
        fiMarginHeight = 0;
    }
    fiMaxHeight = foScreenDiv.offsetHeight - fiMarginHeight;
    fiMaxWidth = foScreenDiv.offsetWidth;
    foPos = getObjPosTo(foAlignTo, foScreenDiv);
    fiTop = foPos.top;
    fiLeft = foPos.left;
    fiBottom = foAlignTo.offsetHeight + fiTop;
    fiRight = foAlignTo.offsetWidth + fiLeft;
    fiWidth = foObject.offsetWidth;
    fiHeight = foObject.offsetHeight + 1; //oplossing tegen flikkeren na verkeerde plaatsting door afrondings fout
    // top positie bepalen
    // voorkeur onder ,boven,
    // rechts er naast bovenop gecentreerd
    if ((fiBottom + fiHeight + fiVOffset) < fiMaxHeight) { // onder
        fiObjectTop = (fiBottom + fiVOffset);
        foRet.y = ENUM.align.bottom;
    } else if ((fiTop - fiHeight - fiVOffset) > 0) { // boven
        fiObjectTop = (fiTop - fiHeight - fiVOffset);
        foRet.y = ENUM.align.top;
    } else {
        if ((fiRight + fiHOffset + fiWidth) < fiMaxWidth) {// rechts er naast
            fiObjectLeft = fiRight;
            fiObjectTop = fiMaxHeight - fiHeight - fiVOffset;
            foRet.x = ENUM.align.right;
        } else if (fiLeft - fiHOffset - fiWidth > 0) {// links er naast
            fiObjectLeft = fiLeft - fiHOffset - fiWidth;
            fiObjectTop = fiMaxHeight - fiHeight - fiVOffset;
            foRet.x = ENUM.align.left;
        } else { // centreren
            foRet.x = ENUM.align.center;
            foRet.y = ENUM.align.center;
            fiObjectTop = Math.round((fiMaxHeight / 2) - (fiHeight / 2));
            fiObjectLeft = Math.round((fiMaxWidth / 2) - (fiWidth / 2));
        }
    }

    // horizontale positie bepalen als deze nog niet is gezet:
    // voorkeur linkerhoek, rechterhoek
    if (fiObjectLeft === -1) {
        if (fiLeft + fiHOffset + fiWidth < fiMaxWidth) {
            fiObjectLeft = fiLeft + fiHOffset;
            foRet.x = ENUM.align.left;
        } else if ((fiRight - fiWidth) > 0) {
            fiObjectLeft = (fiRight - (fiWidth + fiHOffset));
            foRet.x = ENUM.align.right;
        } else {
            fiObjectLeft = Math.round((fiMaxWidth / 2) - (fiWidth / 2));
            foRet.x = ENUM.align.center;
        }
    }

    if (setZeroAsMinium) {
        if (fiObjectTop < 0) {
            fiObjectTop = 0;
        }
    }


    foRet.top = fiObjectTop;
    foRet.left = fiObjectLeft;
    alignToEdgeFix();
    return foRet;
}

// /////
/**
 *
 * @param type
 * @param id
 * @param cssClassName
 * @returns
 */
function getCaption(value, ifEmpty, recursiveCheck=false) {
    var fsResult = null;

    if(window['Captions']){ //when getCaption is called in app frame Captions object is unavailable
      fsResult = Captions.returnCaption(value);
    }


    if (typeof fsResult == 'string'  ) {
        return fsResult;
    }

    if(window['Stateless']){//when getCaption is called in app frame Stateless object is unavailable
        fsResult = Stateless.Page.getCaption(value);
        if (typeof fsResult == 'string'  ) {
            return fsResult;
        }
    }


    if (PFMBOX && isSet(value, PFMBOX)) {
        fsResult = PFMBOX.eval(value);
    }

    if (typeof fsResult == 'string') {
        return fsResult;
    }

    if (isSet(value)) {
        fsResult = eval(value);
    }

    if (typeof fsResult == 'string') {
        return fsResult;
    }

    if (isSet(value, PFMCON)) {
        fsResult = PFMCON.eval(value);
    }

    if (typeof fsResult == 'string') {
        return fsResult;
    }

    if(!recursiveCheck) {
        fsResult = getCapt(value);
        if (fsResult) {
            return fsResult;
        }
    }

    if (hasValue(ifEmpty)) {
        return ifEmpty;
    }

    return null;

}


/**
 * geeft de positie van de cursor (caret) terug van een veld
 * @param foField htmlDomInputObject
 * @returns positie van de cursor
 */
function getCaretPosition(foField) {
    var foSel = null;
    if (document.selection) {
        foField.focus();
        foSel = document.selection.createRange();
        foSel.moveStart('character', -foField.value.length);
        return foSel.text.length;
    }
    if (foField.selectionStart || foField.selectionStart == '0') {
        return foField.selectionStart;
    }
    return -1;
}

function strPx2Int(width) {
    var fsWidth = width;
    if (typeof (fsWidth) == "string" && fsWidth != null && fsWidth != "") {
        fsWidth = fsWidth.replace('px', '');
        return parseInt(fsWidth);
    }
    return 0;
}

// returns border width for some obj
function getBorderWidth(obj) {
    var foRet = {"top": 0, "left": 0, "right": 0, "bottom": 0};
    var objStyle = null;
    if (window.getComputedStyle) { // ff
        objStyle = window.getComputedStyle(obj, null);
        foRet.left = parseInt(objStyle.borderLeftWidth.slice(0, -2));
        foRet.top = parseInt(objStyle.borderTopWidth.slice(0, -2));
        foRet.right = parseInt(objStyle.borderRightWidth.slice(0, -2));
        foRet.bottom = parseInt(objStyle.borderBottomWidth.slice(0, -2));
    } else { // ie, chrome
        foRet.left = strPx2Int(obj.style.borderLeftWidth);
        foRet.top = strPx2Int(obj.style.borderTopWidth);
        foRet.right = strPx2Int(obj.style.borderRightWidth);
        foRet.bottom = strPx2Int(obj.style.borderBottomWidth);
    }
    return foRet;
}

function getObjPosTo(obj, objTo) {

    var foRet = getObjAbsolutePos(obj);
    var foObjToPos = getObjAbsolutePos(objTo);

    foRet.left -= foObjToPos.left;
    foRet.top -= foObjToPos.top;

    return foRet;
}

/**
 * analizeerd een string in het axis format (R1_C3)
 * @param axis
 * @returns {row,col} object met numbers row en col
 */
function getRowAndCol(axis) {
    var fiRow = -1;
    var fiCol = -1;
    var fsAxis = axis.toUpperCase().replace('R', '').replace('C', ''); //(fsAxis = 1_3)
    var faAxis = fsAxis.split('_');
    if (faAxis.length == 2) {
        fiRow = parseInt(faAxis[0]);
        fiCol = parseInt(faAxis[1]);
    }
    return {'row': fiRow, 'col': fiCol};
}


// returns the absolute position of some obj within document
function getObjAbsolutePos(obj) {
    var foRet = {"left": 0, "top": 0};

    if (hasValue(obj)) {
        foRet.left = obj.offsetLeft;

        var offsetParent = obj.offsetParent;
        var offsetParentTagName = offsetParent != null ? offsetParent.tagName.toLowerCase() : "";

        if ((BrowserDetect.browser == 'Explorer' && BrowserDetect.version >= 8) && offsetParentTagName == 'td') {
            foRet.top = obj.scrollTop;
        } else if ((BrowserDetect.browser == 'Explorer' && BrowserDetect.version == 8) && (offsetParentTagName == 'td' || offsetParentTagName == 'table')) {
            // rke Het gele wybertje verdween van het scherm alleen bij ie8. Staat nu niet goed, maar is niet weg.
            foRet.top = obj.scrollHeight;
            foRet.left = obj.scrollWidth;
        } else {
            foRet.top = obj.offsetTop;
        }

        var parentNode = obj.parentNode;
        var borderWidth = null;

        while (offsetParent != null) {
            foRet.left += offsetParent.offsetLeft;
            foRet.top += offsetParent.offsetTop;

            var parentTagName = offsetParent.tagName.toLowerCase();

            if (((BrowserDetect.browser == 'Explorer' && BrowserDetect.version < 8) && parentTagName != "table") ||
                (BrowserDetect.isFirefox && parentTagName == "td") ||
                BrowserDetect.isChrome) {
                borderWidth = getBorderWidth(offsetParent);
                foRet.left += borderWidth.left;
                foRet.top += borderWidth.top;
            }

            if (offsetParent != document.body && offsetParent != document.documentElement) {
                foRet.left -= offsetParent.scrollLeft;
                foRet.top -= offsetParent.scrollTop;
            }

            // next lines are necessary to fix the problem with offsetParent
            if (!(BrowserDetect.browser == 'Explorer' && BrowserDetect.version < 8)) {
                while (offsetParent != parentNode && parentNode !== null) {
                    foRet.left -= parentNode.scrollLeft;
                    foRet.top -= parentNode.scrollTop;
                    parentNode = parentNode.parentNode;
                }
            }

            parentNode = offsetParent.parentNode;
            offsetParent = offsetParent.offsetParent;
        }
    }
    return foRet;
}


function hasValue(fo) {
    return !(typeof fo == 'undefined' || fo == null);
}


var Logger = {};
Logger.placeHolder = null;

Logger.createLogDiv = function () {
    var foParent = XDOM.getObject('DTADIV');
    var d = new Date();
    Logger.placeHolder = document.createElement("DIV");
    Logger.placeHolder.style.display = "none";
    foParent.appendChild(Logger.placeHolder);
    Logger.placeHolder.appendChild(document.createTextNode(d + " --> log start"));
};

Logger.log = function (fsLog) {
    try {
        var foPlaceHolder = Logger.getLogDiv();
        if (!foPlaceHolder) {
            return;
        }
        var d = new Date();
        foPlaceHolder.appendChild(document.createTextNode(d + " --> " + fsLog));
    } catch (e) {
    }
};

Logger.getLogDiv = function () {
    try {
        var foLogDiv = XDOM.getObject('logdiv');
        var foParent = null;
        var d = null;
        if (!foLogDiv) {
            d = new Date();
            foParent = XDOM.getObject('DTADIV');
            if (!foParent) {
                return null;
            }
            foLogDiv = document.createElement("DIV");
            foLogDiv.id = "logdiv";
            foLogDiv.style.display = "none";
            foParent.appendChild(foLogDiv);
            foLogDiv.appendChild(document.createTextNode(d + " --> log start"));
        }
        return foLogDiv;
    } catch (e) {
    }
};

Logger.stackTrace = function (s) {
    var fsOut = 'stacktrace:' + s;
    console.log("------------------ stacktrace:" + s + " START -----------");
    try {
        i.dont.exist += 0; // doesn't exist- that's the point
    } catch (e) {

        try {
            var currentFunction = arguments.callee.caller;
            while (currentFunction) {
                var fn = currentFunction.toString();
                var fname = fn.substring(fn.indexOf("function") + 8, fn.indexOf('(')) || 'anonymous';
                fsOut += '\n - ' + fname;
                console.log("       --> " + fname);
                currentFunction = currentFunction.caller;
            }
        } catch (ie) {
            console.log("fout in stacktrace ");
        }
    }
    return fsOut;
};

function equals(value, compareValue) {
    if (!hasValue(value) || !hasValue(compareValue)) {
        return false;
    }
    if (isArray(compareValue)) {
        return isIn(value, compareValue);
    }
    if (getType(value) == "string") {
        return (value.like(compareValue));
    }

    return (value == compareValue);
}

function isIn(value, compareValues) {
    if (!hasValue(value) || !hasValue(compareValues)) {
        return false;
    }
    if (!isArray(compareValues)) {
        return equals(value, compareValues);
    }
    for (var i = 0, l = compareValues.length; i < l; i++) {
        if (equals(value, compareValues[i])) {
            return true;
        }
    }
    return false;
}

function isArray(obj) {
    if (obj instanceof Array) {
        return true;
    }
    if (typeof obj !== 'object') {
        return false;
    }
    if (getType(obj) === 'array') {
        return true;
    }
    return false;
}

function getType(obj) {
    if (obj === null || typeof obj === 'undefined') {
        return String(obj);
    }
    return Object.prototype.toString.call(obj).replace(/\[object ([a-zA-Z]+)\]/, '$1').toLowerCase();
}

function nullWhenEmpty(str) {
    if (typeof str == 'undefined' || str == '') {
        return null;
    }
    return str;
}

function nullOrJson(str) {
    if (typeof str == 'undefined' || str == '') {
        return null;
    }

    return JSON.stringify(str);
}

function nullOrInt(str) {
    var fiStr = nullWhenEmpty(str);
    if (fiStr) {
        fiStr = parseInt(fiStr);
    }
    return fiStr;
}

function stringValue(str) {
    if (typeof str == 'undefined') {
        return '';
    }
    return str;
}

function floor(nr, decimals) {
    var fiDecimal = Math.pow(10, decimals);
    var fiReturn = Math.floor(nr * fiDecimal) / fiDecimal;
    return fiReturn;
}

function isZero(value) {
    var fsValue = value.replace(',', '.');
    var fiValue = parseFloat(fsValue);
    if (isNaN(fiValue) || floor(fiValue, 6) == 0) {
        return true;
    }
    return false;
}

function setThenEqual(value1, value2) {
    return (!value1 || !value2 || value1 == value2);
}

function scriptToServer(i) {
    return parseInt(i) + 1;
}

/**
 * verkrijgt record nummer zoals gedefinieerd in het attribute data-record-number -1
 * data-record-number is een server side record dat wil zeggen 1 based client side is het 0 based
 * @param obj
 */
function getClientRecordNr(obj) {
    var fsRecord = XDOM.getAttribute(obj, "data-record-number");
    if (!fsRecord) {
        return null;
    }
    return serverToScript(fsRecord);
}

function getRecordNr(obj) {
    var fsRecord = XDOM.getAttribute(obj, "data-record-number");
    return parseInt(fsRecord);
};

function serverToScript(i) {
    return parseInt(i) - 1;
}

function arrayToEvalString(foArr) {
    if (isArray(foArr)) {
        return '["' + foArr.join('","') + '"]';
    }
    return "[]";
}

function unformatThousand(value) {
    return value.split(SETTINGS.thousandSeparator).join('');
}

function unformatAll() {
    var faElementsWithThousandSep = XDOM.queryAll("[data-thousand-separator='on']");
    var foElement = null;
    for (var i = 0, l = faElementsWithThousandSep.length; i < l; i++) {
        foElement = faElementsWithThousandSep[i];
        if (foElement.tagName == "INPUT") {
            foElement.value = unformatThousand(foElement.value);
        }
    }
}


function formatThousandAll() {
    var faInput = XDOM.queryAll("[data-thousand-separator='on']");
    var foInput = null;
    var fsValue = null;

    for (var i = 0, l = faInput.length; i < l; i++) {
        foInput = faInput[i];

        if (foInput.hasAttribute("data-output-value")) {
            fsValue = XDOM.getAttribute(foInput, "data-output-value");

            XDOM.setAttribute(foInput, "data-old-value", fsValue);
            foInput.innerHTML = formatThousand(fsValue);
        } else {
            foInput.value = formatThousand(foInput.value);
        }
    }
}


function formatThousand(value) {
    var fsDecimal = '';
    var fsInteger = '';
    var faNumber = null;
    var fsChar = '';
    var fsIntegerOut = '';
    var fiIntegerPos = 0;
    var fiIntegerLength = 0;
    var fbIsNegative = false;

    if (!value) {
        return '';
    }
    ;
    if (typeof value === "number") {
        value = value.toString();
    }


    if (SETTINGS.thousandSeparator == ",") {
        fsDecimalSeparator = '.';
    } else {
        fsDecimalSeparator = ',';
    }

    faNumber = value.split(fsDecimalSeparator);

    fsInteger = faNumber[0];
    fsDecimal = faNumber.length > 1 ? fsDecimalSeparator + faNumber[1] : '';
    fiIntegerLength = fsInteger.length;

    if (fsInteger.charAt(0) == "-") {
        fbIsNegative = true;
    }

    for (var i = fiIntegerLength - 1; i > -1; i--) {
        fsChar = fsInteger.charAt(i);
        if (!isNaN(fsChar)) {
            fsIntegerOut = fsChar + fsIntegerOut;
            fiIntegerPos++;
            if (fiIntegerPos % 3 == 0 && i != 0) {
                if (i == 1 && fbIsNegative)
                    break;

                fsIntegerOut = SETTINGS.thousandSeparator + fsIntegerOut;
            }
        }
    }

    if (fbIsNegative) {
        fsIntegerOut = "-" + fsIntegerOut;
    }

    return fsIntegerOut + fsDecimal;
}


function getUID() {
    var d = new Date();
    var s = Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);

    s += d.getTime();
    return s;
}


function setOldValue(obj) {
    obj.setAttribute("data-old-value", obj.value);
}

function fieldIsChanged(obj) {
    return (obj.getAttribute("data-old-value") != obj.value);
}

function getUsedAttributes() {
    var faDom = SESSION.activeFrame.document.getElementsByTagName("*");
    var foEllement = null;
    var dataAtributes = {};
    for (var i = 0, l = faDom.length; i < l; i++) {
        foEllement = faDom[i];
        for (var n = 0, le = foEllement.attributes.length; n < le; n++) {
            var foAttribute = foEllement.attributes[n];
            if (foAttribute.name.startsWith("data-")) {
                dataAtributes[foAttribute.name] = "true";
            }
        }
    }
    for (var attributeName in dataAtributes) {
        console.log(attributeName);
    }
}

/**
 * bepaald of het element focus kan hebben
 **/
function canHaveFocus(obj) {
    if (obj && obj.tagName == "INPUT" && (isIn(obj.type, ["text", "password", "button"]))) {
        return true;
    }
    return false;
}


/**
 * verkrijgt record nummer zoals gedefinieerd in het attribute data-record-number -1
 * data-record-number is een server side record dat wil zeggen 1 based client side is het 0 based
 * @param obj
 */

/*  MVB aangepast, verwijderd ivm doublure
function getClientRecordNr(obj){
	var fsRecord = XDOM.getAttribute(obj,"data-record-number");
	if(!fsRecord){
		return null;
	}
	return serverToScript(fsRecord)	;
}
*/

function getRecordNumber(obj) {
    var nr = obj.getAttribute("data-record-number");
    if (nr) {
        return parseInt(nr);
    }
    return null;
}


function addInputField(name, value) {

    var input = XDOM.getObject(name);
    if (input) {
        input.value = value;
        return;
    }

    input = XDOM.createElement('input', name);
    input.setAttribute('name', name);
    input.setAttribute('type', 'hidden');
    input.value = value;
    SESSION.activeForm.appendChild(input);
    return;
};

var useTimer = false;

function time(label) {
    if (useTimer) {
        console.time(label);
    }

}

function timeEnd(label) {
    if (useTimer) {
        console.timeEnd(label);
    }

}

function scrollIntoView(oElement, oContainer) {
    var containerTopPos = oContainer.scrollTop;
    var containerBottomPos = (containerTopPos + oContainer.clientHeight);
    var selectedRowTopPos = oElement.offsetTop;
    var selectedRowBottomPos = (selectedRowTopPos + oElement.clientHeight);

    if (selectedRowTopPos < containerTopPos) {
        oContainer.scrollTop = selectedRowTopPos;
    } else if (selectedRowBottomPos > containerBottomPos) {
        oContainer.scrollTop = (selectedRowBottomPos - oContainer.clientHeight);
    }

    return;
};


function activateOneButton(setInactive, setActive) {
    XDOM.setAttributesToNodeList(setInactive, "data-button-state", "inactive");
    setActive.setAttribute("data-button-state", "active");
}

function isActive(obj) {
    return (obj.dataset.buttonState == "active" || obj.parentNode.dataset.buttonState == "active");
}