/* NAV.Stack - Navigation Stack System */
/* Extracted from session/functions.js for modularization */

/**
 * NAV.Stack - Manages navigation stack and workflow
 * Handles navigation state and macro execution flow
 */

NAV.Stack = function () {
    this.currentSession = null;
    this.currentProcedure = null;
    this.nextSubprocedure = null;
    this.currentSubprocedure = null;
    this.currentMacro = null;
    this.nextMacro = null;
    this.current = null;
    this.activePage = null;
    this.breadCrums = [];
};

NAV.Stack.isFormated = function (obj) {
    return obj.formatType == NAV.Stack.formatTyp.multiFormat || obj.formatType == NAV.Stack.formatTyp.workFlow;
};

NAV.Stack.formatTyp = {
    multiFormat: '*MLTFMT',
    workFlow: '*WRKFLW',
    oldType: 'MFT'
};
/**
 * voegt een element aan de stack toe en zet de pointers previous en next
 * afhankelijk van het type object worden de members: currentSession
 * currentProcedure currentSubprocedure of currentMacro gezet
 *
 * @param obj
 */
NAV.Stack.prototype.add = function (obj) {
    if (this.current) {
        obj.previous = this.current;
        this.current.next = obj;
    }

    this.current = obj;

    switch (obj.type) {
        case 'session':
            this.currentSession = obj;
            obj.stack = this;
            break;
        case 'procedure':
            this.currentProcedure = obj;
            break;
        case 'subProcedure':
            this.currentSubprocedure = obj;
            this.currentProcedure = obj.procedure;
            break;
        case 'macro':
            this.currentMacro = obj;
            this.currentSubprocedure = obj.subProcedure;
            this.currentProcedure = obj.procedure;
            break;
    }
};

NAV.Stack.prototype.toString = function () {
    return this.currentSession.toString();
};

/**
 * de history dat na het mee gegeven element is opgebouwd weggooien Deze methode
 * verwijderd alle elementen die het element obj is toegevoegd aan de stack
 * tevens schoont hij afhankelijk van het type van obj de volgende members op:
 * currentSession currentProcedure currentSubprocedure currentMacro
 *
 * @param obj
 *          NAV object
 *
 */
NAV.Stack.prototype.clearHistory = function (obj) {
    //check if object exits and has clearHistory function
    if(!obj || typeof obj.clearHistory !== 'function') return;
    obj.clearHistory();
    this.current = obj;
    switch (obj.type) {
        case 'session':
            this.currentSession = obj;
            this.currentProcedure = null;
            this.currentSubprocedure = null;
            this.currentMacro = null;
            break;
        case 'procedure':
            this.currentProcedure = obj;
            this.currentSubprocedure = null;
            this.currentMacro = null;
            break;
        case 'subProcedure':
            this.currentProcedure = this.getPreviousProcedure();
            this.currentSubprocedure = this.getPreviousSubProcedure();
            this.currentMacro = null;

            break;
        case 'macro':
            this.currentMacro = obj;
            this.currentSubprocedure = this.getPreviousSubProcedure();
            this.currentProcedure = this.getPreviousProcedure();
            break;
    }
};

NAV.Stack.prototype.setCurrent = function (nav, activeForm) {
    this.activePage = activeForm;
    // var foPreviousMacro = this.getPreviousMacro();
    // if (foPreviousMacro) {
    //     this.addInputField('PrevMacroName', foPreviousMacro.macroName); // previous
    // } else {
    //     this.addInputField('PrevMacroName', ''); // previous Macroname
    // }
    this.setPreviousMacroFields();
    nav.Procedure.currentInstance = this.currentProcedure;
    nav.SubProcedure.currentInstance = this.currentSubprocedure;
    let targetOrWorkflow =
        this.currentSubprocedure.formatType == 'TGT' || this.currentSubprocedure.formatType == NAV.Stack.formatTyp.workFlow;

    if (this.currentMacro.formatCode && targetOrWorkflow) {
        this.currentSubprocedure.macroFormatCode = this.currentMacro.formatCode;
    }
    nav.Macro.currentInstance = this.currentMacro;
};

/**
 * retourneerd de eerste Macro die boven (terug in de hystorie) de huidige macro
 * in de stack staat
 *
 * @returns
 */
NAV.Stack.prototype.getPreviousMacro = function () {
    if (!this.currentMacro) {
        return null;
    }
    var obj = this.currentMacro.previous;
    var fiSecureCount = 0;
    while (obj && obj.type != 'macro') {
        obj = obj.previous;
        if (fiSecureCount++ > 100) {
            console.log('recursive probleem in NAV.Stack.prototype.getPreviousMacro ');
            return null;
        }
    }
    return obj;
};

/**
 * kijkt of compareObj eerder in de stack is opgenomen
 *
 * @param compareObj
 * @returns
 */
NAV.Stack.prototype.hasPreviousEntry = function (compareObj) {
    if (!this.currentMacro) {
        return null;
    }
    var obj = this.currentMacro.previous;
    var fiSecureCount = 0;
    while (obj) {
        obj = obj.previous;
        if (obj == compareObj) {
            return true;
        }
        if (fiSecureCount++ > 100) {
            console.log('recursive probleem in NAV.Stack.prototype.hasPreviousEntry ');
            return false;
        }
    }
    return false;
};

NAV.Stack.prototype.getPreviousProcedure = function () {
    if (!this.currentMacro) {
        return null;
    }
    var obj = this.currentMacro.previous;
    var fiSecureCount = 0;
    while (obj && obj.type != 'procedure') {
        obj = obj.previous;
        if (fiSecureCount++ > 100) {
            console.log('recursive probleem in NAV.Stack.prototype.getPreviousProcedure ');
            return null;
        }
    }
    return obj;
};

NAV.Stack.prototype.getTopSubprocedure = function () {
    var obj = this.currentSession;
    while (obj.next && obj.type != 'subProcedure') {
        obj = obj.next;
    }
    return obj;
};

NAV.Stack.prototype.getPreviousSubProcedure = function () {
    if (!this.currentMacro) {
        return null;
    }
    var obj = this.currentMacro.previous;
    var fiSecureCount = 0;
    while (obj && obj.type != 'subProcedure') {
        obj = obj.previous;
        if (fiSecureCount++ > 100) {
            console.log('recursive probleem in NAV.Stack.prototype.getPreviousProcedure ');
            return null;
        }
    }
    return obj;
};

/**
 * retourneerd een string met de titel op basis van de stack ten behoeve van de
 * Scherm Titel (de text boven de macro tabs) de stack kan als volgd zijn
 * opgebouwd: 1 sessie 2 procedure 3 subprocedure 4 macro 5 subprocedure 6 macro
 * 7 subprocedure 8 macro 9 macro de titel wordt als volgd bepaald: zoek de
 * macro op die boven jou in de stack staat deze leverd de titel als er geen
 * macro meer boven je staat (bij nr 4) dan neem je de titel van de boven
 * liggende subprocedure dit betekend dat macro 4 krijgt de titel van
 * subprocedure 3 macro 6 krijgt de titel van macor 4 macro 8 krijgt de titel
 * van macor 6 macro 9 krijgt de titel van macor 8
 *
 * @returns {String} titel als deze niet is gevonden dan geeft hij een lege
 *          string terug
 */
NAV.Stack.prototype.getTitle = function () {
    // return 'nog niet goed';
    var foMacro = this.getPreviousMacro();
    if (foMacro) {
        return foMacro.title;
    }
    if (this.currentSubprocedure) {
        return this.currentSubprocedure.title;
    }
    return '';
};

/**
 *
 */
NAV.Stack.prototype.sideWays = function () {
    this.clearHistory();
};

/**
 * Bouwd een lijst van hidden fields op op basis van de array van target macro's
 * elk veld krijgt een veldnaam met 'maCD_NXP_' als prefix met daar aan
 * toegevoegd de format code dus B.V. met formatcode RA heet het veld RA:
 * maCD_NXP_RA dit veld krijgt de waarde "subprocedurenaam applicatiecode
 * macronaam" met spaties gescheiden B.V. "GHOI0404 GHX GHON0404"
 *
 *          array van target macro's
 */
NAV.Stack.prototype.createMultiFormatFields = function () {
    var prefix = 'MultiFormat_';
    var macros = this.currentSubprocedure.getFormatMacros();
    for (var formatCode in macros) {
        this.addInputField(prefix + formatCode, macros[formatCode]); // next program
    }
};

NAV.Stack.prototype.setPreviousMacroFields = function () {
    var foPreviousMacro = this.getPreviousMacro();

    if (!foPreviousMacro) {
        // no previous found so clear the fields
        this.addInputField('PrevMacroName', '');
        this.addInputField('PrevMacroName', '');
        return
    }

    this.addInputField('PrevMacroName', foPreviousMacro.macroName); // previous
    this.addInputField('PrevAppCode', foPreviousMacro.application);

};

/**
 * Om het mogelijk te maken op de server door te prikken naar de juiste macro
 * moet er een lijst van hidden fields opgebouwd worden met daarin gegevens van
 * de huidige geldende target macro's target macro's zijn macro's van het
 * formatType='TGT' een lijst van target macro's (.multiFormatTargets) wordt
 * bijgehouden op procedure nivau en op macro niveau
 *
 * Als er onder een procedure een of meerdere subprocedures voorkomen van het
 * formatType='MFT' dan worden alle geldige macro's die onder die subprocedure
 * vallen met het formatType='TGT' opgenomen in de lijst van de subprocedure
 * .multiFormatTargets kan voor een procedure dus macro's bevatten vanuit
 * meerdere subprocedure's
 *
 * Als een macro het type='MFT' heeft dan bevat zijn .multiFormatTargets lijst
 * alle macro's van het typ='TGT' uit de subprocedure die die macro als target
 * heeft in dit geval zijn alle targets dus afkomstig uit 1 subproceure.
 *
 * de lijst van targetMacro's wordt in de functie this.createMultiFormatFields()
 *
 * Voorang van lijsten: er zijn twee scenario's mogelijk 1 er wordt van macro
 * gewisseld op de server dit kan door diverse oorzaken komen bijvoorbeeld door
 * te "rollen" binnen een subfile met een multiple format of automatisch
 * doorschakelen 2 er wordt van macro gewisseld door een onclick event op een
 * subfile in een multiFormat target hier gelden andere prioritijten
 *
 * deze functie houdt zich bezig met scenario 1 scenario twee wordt afgehandeld
 * door setSubfileTargetFields
 *
 * in volgorde van belangrijkheid word de lijst van .multiFormatTargets gebruikt
 * van 1 de vorige macro mits deze een multiFormat macro is (.formatType='MFT')
 * 2 de huidige macro als deze een multiFormat macro is (.formatType='MFT') 3 de
 * huidige procedure mits .multiFormat == true
 *
 * @see NAV.Stack.prototype.createMultiFormatFields
 * @param {type} activeForm
 * @param {type} submitFromSubfile
 * @returns {undefined}
 */
NAV.Stack.prototype.setFormatFields = function (activeForm, submitFromSubfile) {
    if (submitFromSubfile || this.currentSession.sessionScope.isSingleView) {
        return;
    }
    this.activePage = activeForm;
    if (this.currentSubprocedure.formatType == NAV.Stack.formatTyp.multiFormat) {
        this.createMultiFormatFields(this.currentMacro.previous);
    } else {
        this.createWorkFlowFields(this.currentMacro.previous);
    }
};

/**
 * Om het mogelijk te maken op de server door te prikken naar de juiste macro
 * moet er een lijst van hidden fields opgebouwd worden met daarin gegevens van
 * de huidige geldende target macro's target macro's zijn macro's van het
 * formatType='TGT' een lijst van target macro's (.multiFormatTargets) wordt
 * bijgehouden op procedure nivau en op macro niveau
 *
 * het laagste (nieuwste) niveau is afhankelijk van de actie binnen het scherm
 * bij doorschakelen via een subfile is de currentMacro het laagste niveau alle
 * andere acties begint bij het previous element van de currentMacro
 *
 * @param obj
 *          start object uit de stack
 * @returns {array} of null
 */
NAV.Stack.prototype.getMostRecentFormatMacros = function (obj) {
    var foNavObj = obj;
    var fiSecureCount = 0;
    while (!foNavObj.multiFormatTargets) {
        foNavObj = foNavObj.previous;
        if (!foNavObj) {
            return null;
        }
        if (fiSecureCount++ > 100) {
            console.log('recursive probleem in NAV.Stack.prototype.getMostRecentFormatMacros ');
            return null;
        }
    }
    if (!foNavObj.multiFormatTargets) {
        return null;
    }
    return foNavObj.multiFormatTargets;
};

/**
 * voegd een lijst van velden toe aan de te verzenden data
 * de velden zijn opgebouwd uit de namen WorkFlowLevel_#_[formatcode] en
 * bevatten de waarde
 * @param {obj} part
 * @returns {void}
 */
NAV.Stack.prototype.createWorkFlowFields = function (part) {
    var levels = [],
        prefix = 'WorkFlowLevel_',
        fieldName = '',
        level = 1,
        stackPart = this.currentProcedure,
        stackLevel = 1;
    if (!stackPart) {
        return;
    }
    levels.push({macros: this.currentProcedure.getFormatMacros(), level: 1});
    while (stackPart && stackPart.next != part) {
        if (stackPart.type == 'macro') {
            stackLevel++;
        }
        if (stackPart.type == 'subProcedure' && stackPart.formatType == NAV.Stack.formatTyp.workFlow) {
            levels.push( {macros: stackPart.getFormatMacros(), level: stackLevel});
        }
        stackPart = stackPart.next;
    }
    levels.push({macros: part.getFormatMacros(), level: 1});



    for (var i = 0, l = levels.length; i < l; i++) {
        level = levels[i];
        //if(!level) continue;
        for (var formatCode in level.macros) {
            fieldName = prefix + level.level + '_' + formatCode;
            this.addInputField(fieldName, level.macros[formatCode]);
        }
    }
    this.addInputField('StackLevel', stackLevel);
};

/**
 * maakt een associatieve array op basis van de de huidige procedure en de macro die wordt opgehaald via getMostRecentFormatMacros
 * @see NAV.Stack.prototype.getMostRecentFormatMacros
 * de meest recente macro's overschrijven de macro's uit de procedure zodat er nooit dubbele macro's kunnen zijn
 * als er meerdere format codes zijn geld de eerst gevonde format code teld en dan eerst de meest resente en daarna die van de subprocedure
 * @param obj stack object
 * @returns  associatieve array met macro's
 */
NAV.Stack.prototype.getFormatMacros = function (obj) {
    var foMostResentMultiFormat = this.getMostRecentFormatMacros(obj);
    var foFormattedMacros = {};
    var foTargetMacro = null;

    for (var i = 0, l = foMostResentMultiFormat.length; i < l; i++) {
        foTargetMacro = foMostResentMultiFormat[i];
        if (!foFormattedMacros[foTargetMacro.formatCode] && foTargetMacro.formatCode && foTargetMacro.macroName) {
            foFormattedMacros[foTargetMacro.formatCode] = foTargetMacro;
        }
    }

    for (var i = 0, l = this.currentProcedure.multiFormatTargets.length; i < l; i++) {
        foTargetMacro = this.currentProcedure.multiFormatTargets[i];
        if (!foFormattedMacros[foTargetMacro.formatCode] && foTargetMacro.formatCode && foTargetMacro.macroName) {
            foFormattedMacros[foTargetMacro.formatCode] = foTargetMacro;
        }
    }

    return foFormattedMacros;
};

/**
 * maakt een array op basis van de associatieve array die opgebouwd wordt in getFormatMacros
 * @param obj stack object
 * @returns array met macro's
 */
NAV.Stack.prototype.getFormatMacroArray = function (obj) {
    var foMacros = this.getFormatMacros(obj);
    var faRetMacros = [];

    for (var formatCode in foMacros) {
        faRetMacros.push(foMacros[formatCode]);
    }

    return faRetMacros;
};

/**
 * terug naar de vorige macro in de stack
 *
 * @param activeForm
 */
NAV.Stack.prototype.back = function (activeForm) {
    this.currentSubprocedure.restrictToTarget = null;

    var foMacro = this.getPreviousMacro();
    if (!foMacro) {
        return;
    }
    this.activePage = activeForm;
    this.addInputField('PrevAppCode', foMacro.application);
    this.addInputField('PrevMacroName', foMacro.macroName); // previous Macroname
    this.addInputField('SwitchMacro', 'true'); // next program
    this.addInputField('WS_CMD', 'CANCEL');
    this.addInputField('NextAppCode', foMacro.application); // volgende application ;
    this.addInputField('mNM_ENT', ''); // entry point
    this.clearHistory(foMacro);
};

NAV.Stack.clearFields = function (activePage) {
    var fieldsToClear = [
        'StackLevel',
        'SelectedSubfileRecord',
        'SwitchMacro',
        'mCD_ACN',
        'NextAppCode',
        'mNM_ENT',
        'PrevMacroName',
        'NextMacroName',
        'PrevAppCode',
        'WS_CMD'
    ];
    for (var i = 0, l = fieldsToClear.length; i < l; i++) {
        delete activePage.controlerFields[fieldsToClear[i]];
        //XDOM.setObjectValue(fieldsToClear[i],'');
    }
    for (var field in activePage.controlerFields) {
        if (field.indexOf('MultiFormat_') > -1) {
            delete activePage.controlerFields[field];
        }
    }

    //fieldsToClear = XDOM.queryAll("input[id^='maCD_NXP_']",SESSION.activeForm);
    //for(var i = 0,l=fieldsToClear.length;i<l;i++){
    //  XDOM.setObjectValue(fieldsToClear[i],'');
    //}
};

NAV.Stack.prototype.addInputField = function (fsName, fsValue) {

    //  console.log('maak:',fsName,fsValue);

    this.activePage.controlerFields[fsName] = fsValue;
    return;
};

NAV.Stack.prototype.debug = function () {
    var obj = this.currentSession;
    var fiSecureCount = 0;
    console.log('------------------------------------------------------------------'); // niet verwijderen
    console.log(obj.getDebugInfo()); // niet verwijderen

    while (obj.next) {
        obj = obj.next;
        console.log(obj.getDebugInfo()); // niet verwijderen
        if (fiSecureCount++ > 100) {
            console.log('recursive probleem in NAV.Stack.prototype.debug'); // niet verwijderen
        }
    }
    console.log('------------------------------------------------------------------'); // niet verwijderen
    return;
};
NAV.Stack.prototype.switchBack = function (staceMode) {
    if (staceMode != 'BWD') {
        return false;
    }

    var foMacro = this.getPreviousMacro();
    if(!foMacro){
        //No previous macro so nothing to switch back to,
        //return true to break out of the serverSwitch function that has been calling this.
        //This might occur when a manual navigation change is called by the user
        //while underlying macros are still loading in the background.
        return true;
    }
    this.clearHistory(foMacro);
    foMacro.subProcedure.resetDirectTargets();
    return true;
};
/**
 * bepaald of we van macro zijn veranderd
 * @param {type} loadedMacroName
 * @returns {boolean}
 */

NAV.Stack.prototype.noSwitch = function (loadedMacroName) {
    if (this.currentMacro && loadedMacroName == this.currentMacro.macroName) {
        // we blijven in de zelfde macro
        if (!this.currentMacro.isDirectTarget) {
            this.currentMacro.subProcedure.restrictToTarget = null;
        }
        return true;
    }
    return false;
};

NAV.Stack.prototype.getSubprocedure = function (subProcedureName) {
    //subprocedure blijft onveranderd
    if (subProcedureName == this.currentSubprocedure.subProcedureName) {
        return this.currentSubprocedure;
    }
    //subprocedure is target gedefinieerd in huidige subprocedure
    var subProc = this.currentSubprocedure.getTarget(subProcedureName);
    if (subProc) {
        return subProc;
    }
    subProc = this.currentMacro.previous;

    //subprocedure komt uit boom voor de huidige subprocedure
    while (subProc) {
        subProc = subProc.previous;
        if(!subProc) break;
        if (subProc.type == 'subProcedure' && subProc.subProcedureName) {
            return subProc;
        }
    }

    //subprocedure is gedefinieerd direct onder de procedure
    return this.currentProcedure.getSubProcedure(subProcedureName);
};

/**
 * op basis van de macro naam en procedure naam wordt gekeken of er op de server
 * geschakeld is naar een andere macro dan verwacht in dat geval wordt
 *
 * @param macroName
 * @param subProcedureName
 * @param fsStackMode
 *          *SWD|*FWD geeft aan of er binnen de subprocedure wordt gesprongen of
 *          een nivea dieper
 */
NAV.Stack.prototype.serverSwitch = function (macroName, subProcedureName, fsStackMode) {
    var subProcedure = null,
        macro = null;
    this.setNextAction(macroName);
    if (this.noSwitch(macroName)) {
        return;
    }
    if (this.switchBack(fsStackMode, macroName, subProcedureName)) {
        return;
    }

    subProcedure = this.getSubprocedure(subProcedureName);

    if (!subProcedure) {
        SCOPE.main.Dialogue.alert('sub procedure ' + subProcedureName + 'niet gevonden');
        return;
    }

    macro = subProcedure.getMacro(macroName);
    if (!macro) {
        SCOPE.main.Dialogue.alert('macro ' + macroName + ' uit sub procedure ' + subProcedureName + 'niet gevonden');
        return;
    }

    switch (fsStackMode) {
        case 'SWD':
            //schakelen binnen de zelfde subprocedure
            if (this.currentSubprocedure.isEqual(subProcedure)) {
                this.clearHistory(this.currentSubprocedure);
                this.add(macro);
                subProcedure.macroFormatCode = null;
            } else {
                //schakelen naar een andere subprocedure
                this.sideWaysToSPB(macro, subProcedure);
                return;
            }

            break;
        case 'FWD':
            if (!this.currentSubprocedure.isEqual(subProcedure)) {
                this.add(subProcedure);
            }
            subProcedure.macroFormatCode = macro.formatCode;
            this.add(macro);
    }

    this.activateTopSubprocedureButton();
};

NAV.Stack.prototype.sideWaysToSPB = function (macro, subProcedure) {
    this.clearHistory(this.currentProcedure);
    this.add(subProcedure);
    this.add(macro);
    this.currentProcedure.renderButtons();

    this.currentSubprocedure.activate();
};

NAV.Stack.prototype.activateTopSubprocedureButton = function () {
    var fosubProc = this.getTopSubprocedure();
    if (fosubProc && fosubProc.button) {
        fosubProc.procedure.renderButtons();
        fosubProc.button.activate();
    }
};

/**
 * activeer sub programma vanuit een subfile
 *
 * @param {type} subfileRecordNumber
 * @param {type} fsFormatCode
 * @param {type} fsActionCode
 * @param {type} activeForm
 * @returns {Boolean}
 */
NAV.Stack.prototype.setSubfileTargetFields = function (subfileRecordNumber, fsFormatCode, fsActionCode, activeForm) {
    //var foPreviousMacro = this.getPreviousMacro();
    var foTargetMacro = this.currentMacro.getTarget(fsFormatCode, fsActionCode);
    if (!foTargetMacro || foTargetMacro.display == '*ACNONLY') {
        return false;
    }

    var foSubrocedure = foTargetMacro.subProcedure;
    if (foTargetMacro.isDirectTarget) {
        foSubrocedure.restrictToTarget = foTargetMacro;
    } else {
        foSubrocedure.restrictToTarget = null;
    }

    this.activePage = activeForm;

    this.addInputField('SelectedSubfileRecord', stringValue(scriptToServer(subfileRecordNumber)));
    this.addInputField('SwitchMacro', 'true'); // next program
    this.addInputField('mCD_ACN', stringValue(fsActionCode)); // actie code
    this.addInputField('NextAppCode', foTargetMacro.application); // volgende
    this.addInputField('mNM_ENT', ''); // entry point

    // if (foPreviousMacro) {
    //     this.addInputField('PrevMacroName', foPreviousMacro.macroName); // previous
    // } else {
    //     this.addInputField('PrevMacroName', ''); // previous Macroname
    // }
    this.setPreviousMacroFields();
    this.addInputField('NextMacroName', foTargetMacro.macroName); // macro naam van
    if (foSubrocedure != this.currentSubprocedure) {
        this.add(foSubrocedure);
    }
    this.setFormatFields(activeForm);
    this.add(foTargetMacro);
    this.setPreviousMacroFields();
    return true;
};

/**
 * bij MFT doorschakelen kan RPG besluiten dat het om een recurrent aanroep moet gaan
 * dit is het geval bij een MFT waarbij een format type eigenlijk naar de MFT macro zelf verwijst
 * dit wordt echter niet zo in gericht maar in de RPG geregeld
 * in dat geval is er onterecht een stack opgebouwd en moet er weer een Hystorie back worden uitgevoerd.
 * dit is om deze manier gedaan om dat de stack bij de submit opgebouwd wordt maar pas bij de onload van de target is bekend dat het om een recurrent aanroep gaat
 * het hidden field mCD_RCR geeft aan dat het om een recurend subfile entry is
 */
NAV.Stack.prototype.setRecurrent = function () {
    var foMacro = this.getPreviousMacro();
    if (!foMacro) {
        return;
    }
    this.clearHistory(foMacro);
};

/**
 * activeer actie knop
 * @param {string} fsActionCode
 * @param {object} activeForm
 * @returns {void}
 */
NAV.Stack.prototype.setActionTargetFields = function (fsActionCode, activeForm) {
    //when we are in overlay no stack action are to be taken (this is always outside of the stack!
    if(SCOPE.session.SESSION.activePage.isOverlay()){
        return;
    }

    //var foPreviousMacro = this.getPreviousMacro();
    var foTargetMacro = this.currentMacro.getTarget(null, fsActionCode);

    if (!foTargetMacro) {
        // if (this.currentMacro.formatType == NAV.Stack.formatTyp.multiFormat)
        return false;
    }
    var foSubrocedure = foTargetMacro.subProcedure;

    if (foTargetMacro.isDirectTarget) {
        foSubrocedure.restrictToTarget = foTargetMacro;
    } else {
        foSubrocedure.restrictToTarget = null;
    }

    this.activePage = activeForm;
    this.addInputField('SwitchMacro', 'true'); // next program
    this.addInputField('mCD_ACN', stringValue(fsActionCode)); // actie code
    //this.addInputField('mCD_STC', 'NIX'); // toegevoegd stack opdracht
    this.addInputField('NextAppCode', foTargetMacro.application); // volgende
    this.addInputField('mNM_ENT', ''); // entry point
    this.setPreviousMacroFields();
    // if (foPreviousMacro) {
    //     this.addInputField('PrevMacroName', foPreviousMacro.macroName); // previous
    // } else {
    //     this.addInputField('PrevMacroName', ''); // previous Macroname
    // }
    //this.addInputField('mNM_CMC', this.currentMacro.macroName); // huidige macro
    this.addInputField('NextMacroName', foTargetMacro.macroName); // macro naam van

    this.createMultiFormatFields(this.currentMacro);
    if (foSubrocedure != this.currentSubprocedure) {
        this.nextSubprocedure = foSubrocedure;
    }
    this.nextMacro = foTargetMacro;
    return true;
};

NAV.Stack.prototype.setNextAction = function (fsMacroName) {
    if (!this.nextMacro) {
        return;
    }
    if (fsMacroName == this.nextMacro.macroName) {
        if (this.nextSubprocedure) {
            this.add(this.nextSubprocedure);
        }
        if (this.nextMacro) {
            this.add(this.nextMacro);
        }
    }
    this.nextSubprocedure = null;
    this.nextMacro = null;
};
/**

 * bepaald of een module beschikbaar voor de gebruiker op basis van het OCULUS.validApps en  array
 * als het option.MOD member niet bestaat wordt er vanuit gegaan dat de module beschikbaar is
 * is option.Mod gedefinieerd dan dient deze ook beschikbaar te zijn in de array:OCULUS.validModules array
 * het zelfde geld voor apps
 * @param {type} option navigatie Object
 * @param {type} application applicatie naam
 * @returns {Boolean}is de module ter beschikking
 */
NAV.Stack.validate = function (option, application) {
    var fsApplication = option.APP || application;

    if (fsApplication) {
        if(!SESSION.session.validApps[fsApplication]){
            return false;
        }
    }

    if (option.MOD) {
        if (!SESSION.session.validModules[option.MOD]) {
            return false;
        }
    }
    return NAV.Stack.isAuthorised(option);
};

NAV.Stack.isAuthorised = function (option) {
    var fsType = 'SBP';
    var fsName = option.SBP;

    var faAuthorisation = null;
    if (!option.USRAUT) {
        return true; //geen validatie nodig op deze optie
    }

    if (hasValue(option.MCR)) {
        //optie is geen subprocedure maar een macro
        fsType = 'MCR';
        fsName = option.MCR;
    }

    for (var i = 0, l = OCULUS.UserAuth.length; i < l; i++) {
        faAuthorisation = OCULUS.UserAuth[i];
        if (faAuthorisation[0] == fsType && faAuthorisation[1] == fsName) {
            return true;
        }
    }
    return false;
};

NAV.Stack.breadCrum = function (macro) {
    this.macroName = macro.macroName;
    this.description = macro.description;
    this.subProcedureName = macro.subProcedureName;
    this.application = macro.application;
    this.isEqual = function (macro) {
        return (
            this.macroName == macro.macroName &&
            this.application == macro.application &&
            this.subProcedureName == macro.subProcedureName
        );
    };
    this.inSameSubProcedure = function (macro) {
        return this.subProcedureName == macro.subProcedureName;
    };
};
NAV.Stack.prototype.logBreadCrums = function () {
    var trail = '',
        crum = null;
    for (var i = 0, l = this.breadCrums.length; i < l; i++) {
        crum = this.breadCrums[i];
        if (trail) {
            trail += '>>';
        }
        trail += crum.description + crum.macroName;
    }
    console.log('crums: ' + trail);
};

NAV.Stack.prototype.setBreadCrums = function () {
    var last = this.breadCrums[this.breadCrums.length - 1],
        previous = this.breadCrums[this.breadCrums.length - 2],
        newCrum = new NAV.Stack.breadCrum(this.currentMacro);

    if (!last) {
        //eerste macro in deze breadcrums;
        this.breadCrums.push(newCrum);
        return;
    }

    if (last.isEqual(newCrum)) {
        // geen verandering
        return;
    }

    if (!last.inSameSubProcedure(newCrum)) {
        //gewisseld van subProcedure
        //maak de breadCrums leeg
        this.breadCrums = [];
        //voeg nieuw crum toe
        this.breadCrums.push(newCrum);
        return;
    }
    if (previous && previous.isEqual(newCrum)) {
        //crum terug
        this.breadCrums.pop();
        return;
    }
    //volgende stap
    this.breadCrums.push(newCrum);
};

/* sessionLauncher */
/* Load Timestamp 13:59:55.672 */
/**
 * voor het starten van een nieuwe sessie via een token
 **/

// Export NAV.Stack globally for backward compatibility
if (typeof window !== 'undefined' && window.NAV) {
    window.NAV.Stack = NAV.Stack;
}

export { NAV };
