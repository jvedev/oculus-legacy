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