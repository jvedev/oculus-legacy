var gTODAY=new Date();
var fACTDT=new Date();
var fPRTDAG=new Date();
var RE_NUM=/^\-?\d+$/;
var NUM_WEEKSTART=1;

function Calender(targetId, axis, visible,cellAxis){
    this.targetId = targetId;
    this.visible = visible;

    this.targetObject = null;
    this.activeDate = new Date();
    this.hoveredDate = new Date();
    this.foFocusField = [];
    this.today = new Date();
    this.placeHolder = null;
    this.caldiv = null;
    this.calwrapperdiv = null;
    this.weekRows = 0;
    this.calingField = null;
    this.shiftPressed = false;
    this.axis = axis;
    this.cellAxis = cellAxis,
        this.recordNumber = parseInt(XDOM.getAttribute(targetId, "data-record-number"));
}
Calender.currentInstance = null;

Calender.prototype.init = function(){
    this.displayObject = XDOM.getObject('CAL_' + this.targetId);
    if(!hasValue(this.visible)){
        this.visible = true;
    }

    if(!this.visible && this.displayObject){
        this.displayObject.className = 'hidden';
        return;
    }
    this.renderIcon();
};

Calender.prototype.open = function(calingField){
    XDOM.cancelEvent();
    var dateValue = '';

    if(!this.visible){
        return;
    }
    closePopUp();

    this.targetObject = XDOM.getObject(this.targetId);
    this.calingField = this.targetObject;
    Calender.currentInstance = this;
    Mask.completeAllParts(this.targetObject);
    dateValue = this.targetObject.value;



    if (!dateValue || dateValue == '  -  -') {
        this.activeDate=new Date();                 // actieve datum
    }  else {
        this.setActiveDate(dateValue,this.targetObject.getAttribute("data-mask"));
    }

    this.hoveredDate = this.activeDate;
    this.render();
};

Calender.prototype.setActiveDate = function(value,dateFormat){
    var year = null, week = null, day= null;
    switch(dateFormat){
        case '*DMY':
        case '*DMCY':
        case '*DMYY':
            this.activeDate=string2Date(value);
            return;
            break;
        case '*YWD':
            year = value.substring(0, 2);
            if(year.trim()){
                year = '20' + year;
            }
            week = value.substring(2, 4);
            day = value.substring(4, 5);
            break;
        case '*CYWD':
            year = value.substring(0, 4);
            week = value.substring(4, 6);
            day = value.substring(6, 7);
            break;
        case '*CYW':
            year = parseInt(value.substring(0, 4));
            week = value.substring(4, 6);
            day = '1';
            break;
        case '*YWK':
            year = value.substring(0, 2);
            if(year.trim()){
                year = '20' + year;
            }
            week = value.substring(2, 4);
            day = '1';
            break;
        default:
            this.activeDate = string2Date(value);
            break;
    }
    this.setActiveYwdDate(year,week,day);

};

Calender.prototype.setActiveYwdDate = function(yearIn,weekIn,dayIn){
    var dayToAdd = 0,
        year = 0,
        week = 0,
        day = 0,
        returnDate = mondayFirstWeek(year),
        today = new Date();


    year = parseInt(yearIn)|| today.getFullYear();
    week = parseInt(weekIn) || 1;
    day = parseInt(dayIn) || 1;

    returnDate = mondayFirstWeek(year);

    day--; // maandag is 1 die zit al in mondayFirstWeek;
    week--; // week 1 zit al in mondayFirstWeek



    dayToAdd = (week * 7) + day;
    returnDate.setDate(returnDate.getDate() + dayToAdd);
    this.activeDate = returnDate;
};


Calender.close = function() {
    var firstElement = null;
    if(Calender.currentInstance){
        XDOM.removeDOMObject(Calender.currentInstance.placeHolder);
        if(Calender.currentInstance.calingField){
            firstElement = Calender.currentInstance.calingField.getAttribute("data-mask-first-part")
            XDOM.focus(firstElement);
        }
        Calender.currentInstance = null;
        return true;
    }
    return false;
};

Calender.prototype.render = function(actionBy) {
    var foParent = XDOM.getObject('DTADIV');
    // in een calender komen maximaal 6 van 40px hoog en
    // en een header van 89 de max hoogte is dus 89  + (6 * 40) = 329
    // ten behoeven van de uitleining wordt de calender eerst op een maximaal gezet
    var maxHeight = '329px';

    this.placeHolder=XDOM.createElement("DIV","popCALWDW","");
    this.caldiv = XDOM.createElement("DIV", "CALDIV");
    this.calwrapperdiv = XDOM.createElement("DIV", "CALWRAPPER");
    this.caldiv.appendChild(this.calwrapperdiv);
    this.placeHolder.appendChild(this.caldiv);

    this.renderHeader();
    this.renderTable();

    XDOM.removeDOMObject("popCALWDW");
    foParent.appendChild(this.placeHolder);
    this.caldiv.setAttribute("data-click-action", "closePopup");
    this.placeHolder.setAttribute("data-click-action", "closePopup");

    var foMaskDiv = XDOM.getObject(this.targetObject.id + '_container');

    this.placeHolder.style.height= maxHeight;
    var pos = alignTo(this.placeHolder, foMaskDiv,foParent);
    this.placeHolder.style.height= '';

    this.placeHolder.style.top = pos.top + 'px';
    this.placeHolder.style.left = pos.left + 'px';





    this.foFocusField = XDOM.getObject('ACTDAT');

    if (this.foFocusField) {
        this.foFocusField = this.foFocusField.children[0];
        this.foFocusField.focus();
    }

    if(actionBy == 'usr'){

        newDate = [
            this.hoveredDate.getFullYear(),
            this.hoveredDate.getMonth(),
            this.hoveredDate.getDate()
        ];

        var newSelection = XDOM.getObject(newDate[0]+"_"+newDate[1]+"_"+newDate[2]);
        this.foFocusField = newSelection;
        newSelection.focus();

        this.highlight();
    }

    XDOM.cancelEvent();
    return;
};

Calender.dayHeaders = function(){
    var foTr = XDOM.createElement("TR","", "Weekdays");
    var foTd = XDOM.createElement("td","", "");
    var ttlClass = 'workDayTTL';
    const weekDays =     getCaptionSet('ARR_WEEKDAYS');
    foTd.appendChild(XDOM.createTextNode(getCapt('gCAL023')));
    foTr.appendChild(foTd);
    for (var n=0; n<7; n++){
        if(n >=5){
            ttlClass = "weekendTTL";
        }

        foTd = XDOM.createElement("td","", ttlClass);
        foTd.appendChild(XDOM.createTextNode(weekDays[(NUM_WEEKSTART+n)%7]));
        foTr.appendChild(foTd);
    }
    return foTr;
};


Calender.prototype.renderDay = function(foDate, dayNr){
    var fsCss = ' working theme-font-color';
    var foTd = null;
    var foInput = null;
    var day = foDate.getDate().toString().lftzro(2);
    var month = (foDate.getMonth() + 1).toString().lftzro(2);
    var year = foDate.getFullYear().toString().lftzro(2);
    //var week = foDate.getWeek().toString().lftzro(2);
    var dateString = '';


    if(foDate.getDay() == 0 || foDate.getDay() == 6) {// weekend days
        fsCss = ' weekend ';
    }

    //id voor TD's in cal
    foTd = XDOM.createElement("TD","", 'date ' + fsCss);

    if (foDate.getDate() == this.today.getDate() &&
        foDate.getMonth() == this.today.getMonth() &&
        foDate.getFullYear() == this.today.getFullYear()) {
        fsCss = ' today ';

    }

    if (foDate.getMonth() == this.hoveredDate.getMonth()) {// print days of current month
        fsCss += ' thisMonth';
    }else{
        fsCss += ' notThisMonth';
    }

    if (
        foDate.getDate() == this.activeDate.getDate() &&
        foDate.getMonth() == this.activeDate.getMonth() &&
        foDate.getFullYear() == this.activeDate.getFullYear()
    ) {
        foTd.id = "ACTDAT";
    }

    //ISO 8601 string
    dateString = year+"-"+month+"-"+day; //+ "T00:00:00.000";

    foInput = XDOM.createElement("INPUT","",'datinp ' + fsCss);
    foInput.type="button";
    foInput.value=foDate.getDate();
    foInput.id = foDate.getFullYear()+"_"+foDate.getMonth()+"_"+foDate.getDate();
    foInput.setAttribute('data-calender-return-data', dateString);
    foInput.setAttribute('data-click-action', "Calender.returnDate");

    foInput.setAttribute('data-calender-return-data-day', day);
    //foInput.setAttribute('data-calender-return-data-week', week);
    foInput.setAttribute('data-calender-return-data-month', month);
    foInput.setAttribute('data-calender-return-data-year', year);
    foInput.setAttribute('data-calender-return-data-day-number', dayNr);



    foTd.appendChild(foInput);
    foTd.setAttribute('data-calender-return-data', dateString);
    foTd.setAttribute('data-click-action', "Calender.returnDate");

    foTd.setAttribute('data-calender-return-data-day', day);
    //foTd.setAttribute('data-calender-return-data-week', week);
    foTd.setAttribute('data-calender-return-data-month', month);
    foTd.setAttribute('data-calender-return-data-year', year);
    foTd.setAttribute('data-calender-return-data-day-number', dayNr);

    return foTd;
};

Calender.prototype.renderTable = function() {

    var foTempDate=new Date(this.hoveredDate);
    foTempDate.setDate(1);
    var foDay=new Date(foTempDate.setDate(1 - (7 + foTempDate.getDay() - NUM_WEEKSTART) % 7));

    var foTr = null;
    var foTd = null;

    var foTbody =  XDOM.createElement("TBODY");
    var foResultTable = XDOM.createElement("TABLE","CALTBL" );
    var week 		= foDay.getWeek();
    var dateVars	= null;
    var fiCurrentMonth =foDay.getMonth();
    var yearWeek = null;
    var swichedYear = false;

    var getThursday = null;
    var getYearWeek = null;

    foResultTable.appendChild(foTbody);

    foTbody.appendChild(Calender.dayHeaders());
    this.weekRows = 0;
    while (foDay.getMonth() == this.hoveredDate.getMonth() || foDay.getMonth() == fiCurrentMonth) {
        this.weekRows++;

        getThursday = new Date(foDay);
        getThursday.setDate(getThursday.getDate() + 3); //donderdag bepalen.
        getYearWeek = getThursday.getFullYear();

        foTr = XDOM.createElement("TR");
        foTr.setAttribute("data-calender-yearWeek", getYearWeek);
        foTr.setAttribute("data-calender-week", foDay.getWeek().toString().lftzro(2));

        foTd = XDOM.createElement("TD","","date");
        foTd.appendChild(XDOM.createTextNode(foDay.getWeek()));
        foTr.appendChild(foTd);

        for (var fCURWD=0; fCURWD<7; fCURWD++) {
            foTr.appendChild(this.renderDay(foDay,fCURWD+1));
            foDay.setDate(foDay.getDate() + 1);
        }

        foTbody.appendChild(foTr);
    }

    this.calwrapperdiv.appendChild(foResultTable);

    return;
};

Calender.handleOnClick = function(e){
    if(e){
        XDOM.getEvent(e);
    }
    if(GLOBAL.eventSourceElement.getAttribute("data-service-type")==ENUM.serviceType.calendar){
        var foCal = new Calender(GLOBAL.eventSourceElement.getAttribute("data-to-id"),null,true);
        foCal.open();
    }
};

Calender.open = function (obj){
    if(GLOBAL.eventSourceElement.getAttribute("data-service-type")==ENUM.serviceType.calendar){
        var foCal = new Calender(obj.getAttribute("data-mask-target"),null,true);
        foCal.open();
    }
};


Calender.handleKeyDown = function(e){
    if(e){
        XDOM.getEvent(e);
    }

    if(!Calender.currentInstance){return false;}
    if(this.shiftPressed){return true;}
    switch(GLOBAL.charCode){
        case  keyCode.shift:
            this.shiftPressed = true;
        case  keyCode.F4:
        case  keyCode.F2:
            return false;
            break;
    }
    return true;
};


/**
 * Keyboard handling tbv kalender
 */
Calender.handleKeyUp = function(e){
    if(e){
        XDOM.getEvent(e);
    }

    if(!Calender.currentInstance){return false;}
    XDOM.cancelEvent(e);
    this.shiftPressed = GLOBAL.event.event.shiftKey;
    switch(GLOBAL.charCode){
        case  keyCode.arrowLeft:
            if(this.shiftPressed){
                Calender.previousMonth(null, 'usr');
            } else {
                Calender.currentInstance.navigateCalender("prevDay");
            }
            break;
        case  keyCode.arrowUp:
            if(this.shiftPressed){
                Calender.previousYear(null, 'usr');
            }else {
                Calender.currentInstance.navigateCalender("prevWeek");
            }
            break;
        case  keyCode.arrowRight:
            if(this.shiftPressed){
                Calender.nextMonth(null, 'usr');
            }else {
                Calender.currentInstance.navigateCalender("nextDay");
            }
            break;
        case  keyCode.arrowDown:
            if(this.shiftPressed){
                Calender.nextYear(null, 'usr');
            }else {
                Calender.currentInstance.navigateCalender("nextWeek");
            }
            break;
        case  keyCode.tab:
            if(this.shiftPressed){
                Calender.currentInstance.navigateCalender("prevDay");
            }else {
                Calender.currentInstance.navigateCalender("nextDay");
            }
            break;
        case  keyCode.space:
        case  keyCode.enter:
            Calender.returnDate(Calender.currentInstance.hoveredDate);
            break;
        case  keyCode.shift:
            this.shiftPressed = false;
            break;
        case keyCode.escape:
        case keyCode.F12:
            closePopUp();
            break;
        default:
            return;
            break;
    }
    GLOBAL.eventObject.remapKeyCode();
    return true;

};




Calender.prototype.renderHeader = function (){
    var fsMonthYear = getCaptionSet('ARR_MONTHS')[this.hoveredDate.getMonth()] + ' ' + this.hoveredDate.getFullYear();

    var foPanelHeader = XDOM.createElement("DIV", "", "calendarPanelHeader theme-background-color");
    var foCurrentMonth = XDOM.createElement("DIV", "", "curMonth");
    var foExit = XDOM.createElement("DIV","MEXIT", "pth-close closeCalendarButton");
    var foCalHeader = XDOM.createElement("DIV", "CALHDR");
    var foPrvYear = XDOM.createElement("DIV", "prvYear",   "pth-icon prvYear");
    var foPrvMonth = XDOM.createElement("DIV", "prvMonth", "pth-icon prvMonth");
    var foSltToday = XDOM.createElement("DIV", "sltToday", " sltToday theme-hover-background-color theme-background-color");
    var foNxtMonth = XDOM.createElement("DIV", "nxtMonth", "pth-icon nxtMonth");
    var foNxtYear = XDOM.createElement("DIV", "nxtYear",   "pth-icon nxtYear");

    foPanelHeader.appendChild(foCurrentMonth);
    foPanelHeader.appendChild(foExit);
    //foPanelHeader.setAttribute("data-mousedown-action", "Dragger.start");
    //foPanelHeader.setAttribute("data-dragger-objid", "popCALWDW");


    this.caldiv.appendChild(foPanelHeader);


    /*this.caldiv.appendChild(foCurrentMonth);
    this.caldiv.appendChild(foExit);*/

    foCurrentMonth.appendChild(XDOM.createTextNode(fsMonthYear));

    foSltToday.appendChild(XDOM.createTextNode(getCapt('gCAL022')));


    foCalHeader.appendChild(foPrvYear);
    foCalHeader.appendChild(foPrvMonth);
    foCalHeader.appendChild(foSltToday);
    foCalHeader.appendChild(foNxtMonth);
    foCalHeader.appendChild(foNxtYear);


    this.calwrapperdiv.appendChild(foCalHeader);


    foPrvYear.setAttribute("data-click-action",  "Calender.previousYear");
    foPrvMonth.setAttribute("data-click-action", "Calender.previousMonth");
    foSltToday.setAttribute("data-click-action", "Calender.setToday");
    foNxtMonth.setAttribute("data-click-action", "Calender.nextMonth");
    foNxtYear.setAttribute("data-click-action",  "Calender.nextYear");
    foExit.setAttribute("data-click-action",  "closePopUp");
    this.caldiv.setAttribute("data-click-action",  "closePopUp");
    foCurrentMonth.setAttribute("data-click-action",  "closePopUp");
};





Calender.setToday = function(e) {
    Calender.returnDate(new Date());
    return;
};

Calender.nextYear = function (e ,actBy){
    XDOM.cancelEvent(e);
    var foDate=new Date(Calender.currentInstance.hoveredDate);
    var oldYear = foDate.getFullYear();
    var newYear = oldYear + 1;
    foDate.setYear(newYear);
    // Let op: kan jaar overslaan (schrikkeljaar); zo nodig naar laatste dag goede jaar
    while(foDate.getFullYear() > newYear) foDate.setDate(foDate.getDate() - 1);
    Calender.currentInstance.hoveredDate=foDate;
    Calender.currentInstance.render(actBy);

    return;
};


Calender.nextMonth = function(e, actBy){
    XDOM.cancelEvent(e);
    var foDate=new Date(Calender.currentInstance.hoveredDate);
    var oldMonth = foDate.getMonth();
    var newMonth = oldMonth + 1;
    foDate.setMonth(newMonth);
    // Let op: kan maand overslaan (31-01 -> 03-03); zo nodig naar laatste dag goede maand
    if (newMonth < 12) while(foDate.getMonth() > newMonth) foDate.setDate(foDate.getDate() - 1);
    Calender.currentInstance.hoveredDate = foDate;
    Calender.currentInstance.render(actBy);
    return;
};

Calender.previousYear = function(e, actBy){
    XDOM.cancelEvent(e);
    var foDate=new Date(Calender.currentInstance.hoveredDate);
    var oldYear = foDate.getFullYear();
    var newYear = oldYear - 1;
    foDate.setYear(newYear);
    // Let op: kan jaar overslaan (schrikkeljaar); zo nodig naar eerste dag goede jaar
    while(foDate.getFullYear() < newYear) foDate.setDate(foDate.getDate() + 1);
    Calender.currentInstance.hoveredDate = foDate;
    Calender.currentInstance.render(actBy);
    return null;
};

Calender.previousMonth = function(e, actBy){
    XDOM.cancelEvent(e);
    var foDate=new Date(Calender.currentInstance.hoveredDate);
    var oldMonth = foDate.getMonth();
    var newMonth = oldMonth - 1;
    foDate.setMonth(newMonth);
    // Let op: kan maand overslaan (31-03 -> 03-03); zo nodig naar laatste dag goede maand
    if (newMonth > 0) while(foDate.getMonth() > newMonth) foDate.setDate(foDate.getDate() - 1);
    Calender.currentInstance.hoveredDate=foDate;
    Calender.currentInstance.render(actBy);
    return null;
};

Calender.previousDay = function(minus){
    var foDate=new Date(Calender.currentInstance.hoveredDate);
    var oldDay = foDate.getDate();
    var newDay = oldDay - minus;
    foDate.setDate(newDay);

    return foDate;
};


Calender.nextDay = function(plus){
    var foDate=new Date(Calender.currentInstance.hoveredDate);
    var oldDay = foDate.getDate();
    var newDay = oldDay + plus;
    foDate.setDate(newDay);

    return foDate;
};

var newDate = null;
var currentDate = null;

Calender.prototype.navigateCalender = function (direction){

    currentDate 	= this.foFocusField.id.split("_");

    var getNewDate = null;

    switch(direction){
        case "prevDay":
            getNewDate = Calender.previousDay(1);
            break;
        case "prevWeek":
            getNewDate = Calender.previousDay(7);
            break;
        case "nextDay":
            getNewDate = Calender.nextDay(1);
            break;
        case "nextWeek":
            getNewDate = Calender.nextDay(7);
            break;
    };


    newDate = [
        getNewDate.getFullYear(),
        getNewDate.getMonth(),
        getNewDate.getDate()
    ];


    if(this.foFocusField){
        this.cancelHighlight();
    }

    var controlDate1 = 	new Date(newDate[0],newDate[1],1);
    var controlDate2 = 	new Date(currentDate[0],currentDate[1],1);

    if(controlDate1 > controlDate2){
        Calender.nextMonth();
    }	else if(controlDate1 < controlDate2){
        Calender.previousMonth();
    }

    newSelection = XDOM.getObject(newDate[0]+"_"+newDate[1]+"_"+newDate[2]);
    Calender.currentInstance.hoveredDate = new Date(getNewDate);

    this.foFocusField = newSelection;
    newSelection.focus();

    this.highlight();

    return;
};

/**
 * @returns
 */

Calender.returnDate = function(dateIn){

    var instance = Calender.currentInstance.targetObject;
    var mask = Calender.currentInstance.targetObject.getAttribute("data-mask");
    var lastField = null,
        day = null,
        week = null,
        yearWeek = null,
        month = null,
        year = null,
        dayNr = null,
        returnValue = null;

    if(instance.getAttribute("data-protected")=="true"){
        closePopUp();
        return;
    }

    if(dateIn){
        day      = dateIn.getDate().toString().lftzro(2);
        week     = dateIn.getWeek().toString().lftzro(2);
        month    = (dateIn.getMonth() +1).toString().lftzro(2);
        year     = dateIn.getFullYear().toString().lftzro(2);
        yearWeek = year;
        dayNr    = (dateIn.getMDay()+1).toString();
    }else{
        day      = XDOM.GLOBAL.getAttribute('data-calender-return-data-day');
        week     = XDOM.getParentByTagName(GLOBAL.eventSourceElement, "TR").getAttribute('data-calender-week');
        yearWeek = XDOM.getParentByTagName(GLOBAL.eventSourceElement, "TR").getAttribute('data-calender-yearWeek');
        month    = XDOM.GLOBAL.getAttribute('data-calender-return-data-month');
        year     = XDOM.GLOBAL.getAttribute('data-calender-return-data-year');
        dayNr    = XDOM.GLOBAL.getAttribute('data-calender-return-data-day-number');
    }

    returnValue = formatDate(dayNr,day,week,month,year,yearWeek,mask);

    XDOM.setObjectValue(Calender.currentInstance.targetObject,returnValue);
    Subfile.setChanged(Calender.currentInstance.recordNumber);
    closePopUp();

    handleOnChange(instance);
    lastField = XDOM.getObject(instance.getAttribute("data-mask-last-part"));

    if(!isAutoSubmitField(instance) && lastField){
        fp.next(lastField);
    }
    return;
};


function formatDate(dayNr,day,week,month,year,yearWeek,mask){
    switch(mask){
        case '*CYQ':
            return year + Math.ceil( parseInt(month)/3);
            break;
        case '*YRQ':
            return year.substring(2) + Math.ceil( parseInt(month)/3);
            break;
        case '*DMY':
            return day + month + year.substring(2);
            break;
        case '*DMCY':
        case '*DMYY':
        case '*EUR':
            return day + month + year;
            break;
        case '*CYWD':
            return yearWeek + week + dayNr;
            break;
        case '*CYW':
            return yearWeek + week;
            break;
        case '*YWK':
            return yearWeek.substring(2) + week;
            break;
        case '*YWD':
            return yearWeek.substring(2) + week + dayNr;
            break;
        case '*YRP':
            return year.substring(2) + month; //navragen
            break;
        default:
            return day + month + year;
            break;

    }
}

function formatDatex() {
    var fTEMP=arguments[0];
    var fFORMAT=arguments[1];

    var fTEMP_dg=fTEMP.getDate().toString();
    var fTEMP_mn=(fTEMP.getMonth()+1).toString();
    var fTEMP_jr=fTEMP.getFullYear().toString();
    var fTEMP_qrt = Math.ceil(fTEMP_mn/3);
    var fTMPDT = null;
    var fJR= '';

    if (fTEMP_dg < 10) { fTEMP_dg='0' + fTEMP_dg; }
    if (fTEMP_mn < 10) { fTEMP_mn='0' + fTEMP_mn; }


    // YYYY/QQ
    if (fFORMAT == 'CYQ') {
        fTMPDT=fTEMP_jr + '/' + fTEMP_qrt;
    }
    // DD-MM-CCJJ
    if (fFORMAT == 'DMCY') {
        fTMPDT=fTEMP_dg
            + '-' + fTEMP_mn
            + '-' + fTEMP_jr;
    }
    // *DMY
    if (fFORMAT == '*DMY') {
        fJR=fTEMP_jr.toString().substring(2);
        fTMPDT=fTEMP_dg
            + fTEMP_mn
            + fJR;
    }
    // *DMYY en *EUR
    if (fFORMAT == '*DMYY' ||
        fFORMAT == '*EUR') {
        fTMPDT=fTEMP_dg
            + fTEMP_mn
            + fTEMP_jr;
    }
    // *CYWD
    if (fFORMAT == '*CYWD') {
        fTMPDT=fTEMP.getWeekDate();
    }
    // *CYW
    if (fFORMAT == '*CYW') {
        fTMPDT=fTEMP.getWeekDate().substring(0,6);
    }

    // blanko formaat=ddmmccjj
    if (fFORMAT == '') {
        fTMPDT=fTEMP_dg
            + fTEMP_mn
            + fTEMP_jr;
    }
    return fTMPDT;
}

function string2Date() {
    var fSTRDATE=arguments[0].trim();
    var dt_date=new Date();
    dt_date.setDate(1);

    try {
        if (fSTRDATE) {
            // Splits in dag/maand/jaar indien opgemaakt (dd-mm-eejj)
            var arr_date=fSTRDATE.split('-');
            // Splits in dag/maand/jaar indien niet opgemaakt (ddmmeejj of ddmmjj)
            if(arr_date.length == 1 && fSTRDATE.length >= 6) {
                arr_date[0]=fSTRDATE.substring(0,2);
                arr_date[1]=fSTRDATE.substring(2,4);
                arr_date[2]=fSTRDATE.substring(4);
            }
            // Goede jaar in datum zetten
            if (RE_NUM.exec(arr_date[2])) {
                // Jaar zo nodig corrigeren
                if (arr_date[2] < 100) arr_date[2]= Number(arr_date[2]) + 2000;
                dt_date.setFullYear(arr_date[2]);
            }
            // Goede maand in datum zetten
            if (RE_NUM.exec(arr_date[1]) && arr_date[1] >= 1 && arr_date[1] <= 12) {
                dt_date.setMonth(arr_date[1]-1);
            }
            // Goede dag in datum zetten
            if (RE_NUM.exec(arr_date[0]) && arr_date[0] >= 1 && arr_date[1] <= 31) {
                dt_date.setDate(arr_date[0]);
            }
        }
    } catch(err) {
    }

    return (dt_date);
}

Calender.prototype.highlight = function(){
    this.foFocusField.className += " dateActive";
    return;
};

Calender.prototype.cancelHighlight = function(){
    this.foFocusField.className = this.foFocusField.className.replace(" dateActive", "");
    return;
};


