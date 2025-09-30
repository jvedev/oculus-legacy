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
};

/**
 * Zet Jaar Week Dag data om in een javascript date object
 * @param YWD week jaar dag als string in YYYYWWD D is optioneel
 * @returns {Date} het bijbehordende javascript Date Object
 */
export function YWDToDate(YWD) {
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

export function stringToCYQ(CYQ) {
    // notitie YYYY/Q
    var foRegExp = new RegExp(/[^\x30-\x39]/); //0-9  Testen of input alleen uit cijfers bestaat
    var fdRetDate = new Date();
    if (foRegExp.test(CYQ)) {
        return fdRetDate;
    }

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
export function mondayFirstWeek(year) {
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