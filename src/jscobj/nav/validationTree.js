/**
 * object voor het opslaan van de gehele boom aan mogelijkheden Binnen het sessie niveau
 * dus alle procedures met alle subprocedures en macro's
 * deze wordt eerst opgebouwd en vervolgens worden de onderdelen die niet geldig zijn verwijderd
 */
NAV.validationTree = {
    directStart:false,
    session:{}
};
/**
 * valideerd procedures of sub procedures
 * @PARAM obj (te valideren (sub) procedure of macro
 * @PARAM defaultApp default applicatie kan ook null zijn
 * @RETURNS {Boolean}
 **/
NAV.validationTree.validate = function(obj, defaultApp){
  var application = obj.APP || defaultApp;

  //dummy part for home is always correct
  if(obj.isHome)  {
      return true;
  }

  if(obj.DSP === 'NO'){
    return false;
    obj.reason = "DSP=NO";
  }
  if(obj.isTarget){
    obj.reason = "is target";
    return false;
  }
  if(obj.MOD && !SESSION.session.validModules[obj.MOD]){
    obj.reason = "invalid MOD " + obj.MOD;
    return false;
  }
  if(!application){
    return true;
  }
  if(!SESSION.session.validApps[application]){
    obj.reason = "invalid app " + application;
    //console.log("unvalid app: " + application)
    return false;
  }
  return true;

};
/**
 * enumeratie
 * @type type
 */
NAV.validationTree.status = {
  'valid':'valid',
  'validisTarget':'validisTarget',
  'validNoChilds':'validNoChilds',
  'unValid':'unValid',
  'definitionMissing':'definitionMissing'
 };

NAV.validationTree.setSession = function(definition, session, directStart){

  NAV.validationTree.sessionObject = session;
  NAV.validationTree.session = definition;
  NAV.validationTree.directStart = directStart;
  if(directStart){
    NAV.validationTree.setDirectStartProcedure(NAV.validationTree.session)
  }else{
    NAV.validationTree.setProcedures(NAV.validationTree.session);
  }

};

NAV.validationTree.setProcedures = function(session){
  var procedures = session.OPT;
  session.procedures = {};
  for(var i=0,l=procedures.length;i<l;i++){
     NAV.validationTree.addProcedure(procedures[i], session);
  }
};

NAV.validationTree.setDirectStartProcedure = function(session){
 var procedure = session.OPT[0];
 if(procedure.PRC){ //er zijn procedures gedefinieerd normaal verder initieren van boom
   NAV.validationTree.setProcedures(session);
 }
 session.procedures = {};
 // de direct start heeft geen procedure gedefineerd
 // de definities zijn van subProcedures
 // zelf een dummy procedure aanmaken en daaraan de sub procedures toevoegen
  procedure = {
      PRC: 'directStart',
      status:NAV.validationTree.status.validNoChilds,
      available:true,
      OPT:session.OPT
    };
 session.procedures['directStart'] =   procedure;
  NAV.validationTree.setSubProcedures(procedure);

};

NAV.validationTree.addProcedure = function(definition, session){
      var procedure = getEval(definition.PRC) || NAV.validationTree.sessionObject.homeProcedure,
      defaultApp = NAV.validationTree.session.DFTAPP,
      procedureName = definition.PRC;

  if(procedure){
      if(NAV.validationTree.validate(procedure, defaultApp)){
        procedure.status = NAV.validationTree.status.validNoChilds;
        procedure.available = true;
        NAV.validationTree.setSubProcedures(procedure);
      }else{
        procedure.status = NAV.validationTree.status.unValid;
        procedure.available = false;
      }
   }else{

     procedure = definition;
     procedure.available = false;
     procedure.status = NAV.validationTree.status.definitionMissing;
   }
  session.procedures[procedureName] =   procedure;
};


/**
 * voegt subProcedures toe aan procedure
 * zodra er een subProcedure met de status valid is toegevoegd
 * betekend dat er minstens 1 geldige optie is en
 * dat maakt de status van de procedure op zijn beurd ook geldig
 * @PARAM procedure
 **/
NAV.validationTree.setSubProcedures = function(procedure){
  procedure.subProcedures = {};
  for ( var i = 0, l = procedure.OPT.length; i < l; i++) {
    if(NAV.validationTree.addSubProcedure(procedure.OPT[i], procedure)){
      procedure.status = NAV.validationTree.status.valid;
    }
  }
  return (procedure.status === NAV.validationTree.status.valid || procedure.status === NAV.validationTree.status.validNoChilds);
};


/**
 * valideerd en voegt subProcedure toe aan procedure
 * @PARAM definition
 * @PARAM procedure
 * @RETURNS {Boolean} indicatie of subProcedure de status valid heeft
 **/
NAV.validationTree.addSubProcedure = function(definition, procedure){
  var subProcedure = getEval(definition.SBP)  || NAV.validationTree.sessionObject.homeSubProcedure ,
      defaultApp = procedure.DFTAPP;

  if(subProcedure){
    if (NAV.validationTree.validate(subProcedure,defaultApp)) {
        if(NAV.validationTree.setMacros(subProcedure)){
          subProcedure.status = NAV.validationTree.status.valid;
          subProcedure.available = true;
        }else{
          subProcedure.status = NAV.validationTree.status.validNoChilds;
          subProcedure.available = true;
        }
    }else{
        subProcedure.status = NAV.validationTree.status.unValid;
        subProcedure.available = false;
    }

  }else{
     subProcedure = definition;
     subProcedure.available = false;
     subProcedure.status = NAV.validationTree.status.definitionMissing;
  }

  procedure.subProcedures[definition.SBP] = subProcedure;
  return (subProcedure.status === NAV.validationTree.status.valid);
};

/**
 * voegt macros toe aan subProcedure
 * zodra er een macro met de status valid is toegevoegd
 * betekend dat er minstens 1 geldige macro is en
 * dat maakt de status van de subProcedure op zijn beurd ook geldig
 * @PARAM subProcedure
 **/
NAV.validationTree.setMacros = function(subProcedure){
    subProcedure.macros = {};
    var macro = null;
    var targets = {};

    //verzamel alle targets
    for ( var i = 0, l = subProcedure.OPT.length; i < l; i++) {
      macro = subProcedure.OPT[i];
      if(macro.TGT){
        targets[macro.TGT]= true;
      }
    }

    for ( var i = 0, l = subProcedure.OPT.length; i < l; i++) {
      macro = subProcedure.OPT[i];
      if(targets[macro.MCR]){
        macro.isTarget = true;
      }
      if(NAV.validationTree.addMacro(macro, subProcedure)){
        subProcedure.status = NAV.validationTree.status.valid;
      }
    }
   return (subProcedure.status === NAV.validationTree.status.valid );
};

/**
 * valideerd en voegt een macro toe aan subProcedure
 * @PARAM definition
 * @PARAM subProcedure
 * @RETURNS {Boolean} indicatie of de macro de status valid heeft
 **/
NAV.validationTree.addMacro = function(definition, subProcedure){
  var macro = definition,
      defaultApp = subProcedure.DFTAPP;
  if(macro){
    if (NAV.validationTree.validate(macro,defaultApp)) {
        macro.status = NAV.validationTree.status.valid;
        macro.available = true;
    }else{
        if(macro.isTarget){
          macro.status = NAV.validationTree.status.validisTarget;
        }else{
          macro.status = NAV.validationTree.status.unValid;
        }
        macro.available = false;
    }

  }else{
     macro = definition;
     macro.available = false;
     macro.status = NAV.validationTree.status.definitionMissing;
  }

  subProcedure.macros[definition.MCR] = macro;
  return (macro.status === NAV.validationTree.status.valid);
};

NAV.validationTree.getProcedure = function(procedureName){
    return  NAV.validationTree.session.procedures[procedureName] ||
            NAV.validationTree.session.procedures['directStart'] ||
            {};

};

NAV.validationTree.getSubProcedure = function(procedureName, subProcedureName){
  var procedure = NAV.validationTree.getProcedure(procedureName)
  var subProcedure = procedure.subProcedures[subProcedureName] || {};
  return subProcedure;
};

NAV.validationTree.getMacro = function(procedureName, subProcedureName, macroName){
    return NAV.validationTree.getSubProcedure(procedureName, subProcedureName).macros[macroName] || {};
};

/**
 * geeft aan of een macro of (sub) procedure geldig zijn
 * (sub) procedures hebben dan de status: NAV.validationTree.status.valid of NAV.validationTree.status.valid
 * macro's hebben de status: NAV.validationTree.status.valid of NAV.validationTree.status.validisTarget
 * @param {type} procedureName oor het controleren van een procedure
 * @param {type} subProcedureName optioneel voor het controleren van een subProcedure of Macro
 * @param {type} macroName optioneel voor het controleren van een macro procedure en sub proceduren dienen te zijn ingevuld
 * @returns {Boolean}
 * @see NAV.validationTree.status
 */
NAV.validationTree.isValid = function(procedureName, subProcedureName, macroName){
    var status = null;
    if(macroName){
      //macro objecten
      status = NAV.validationTree.getProcedure(procedureName, subProcedureName, macroName).status;
      return (status === NAV.validationTree.status.valid ||
              status === NAV.validationTree.status.validisTarget);
    }NAV.validationTree.isValid

    if(subProcedureName){
      //subprocedure objecten
      status = NAV.validationTree.getSubProcedure(procedureName).status;
    }else{
      //procedure objecten
      status = NAV.validationTree.getProcedure(procedureName, subProcedureName).status;
    }

    return (status === NAV.validationTree.status.valid ||
            status === NAV.validationTree.status.validNoChilds);
};

/**
 * geeft aan of navigatie element rechtstreeks opgenomen moet worden in respectievelijk
 * als procedure kop in het sessie menu (linker menu)
 * Als subprocedure knop in het bovenste knoppen menu binnen de sessie
 * Als macro tab direct na het kiezen van een subprocedure knop
 *
 * voor (sub) procedures gelden dat ze getoond worden als hun status valid zijn of als er geen onderliggende definite bekend is.
 * in het laatste geval wordt de knop uitgeschakeld en krijgt een afwijkende kleur zodat er direct een indicatie is dat er iets niet goed is gedefineerd
 *
 * voor macro's geld dat alleen macro's met de status valid worden weergegeven
 * tenzij deze macro's een target macro zijn.
 * target macro's hebben een isTarget eigenschap
 *
 * @param {type} procedureName oor het controleren van een procedure
 * @param {type} subProcedureName optioneel voor het controleren van een subProcedure of Macro
 * @param {type} macroName optioneel voor het controleren van een macro procedure en sub proceduren dienen te zijn ingevuld
 * @returns {Boolean}
 */

NAV.validationTree.showDirect = function(procedureName, subProcedureName, macroName){
    var status = null;
    if(macroName){
      status = NAV.validationTree.getMacro(procedureName, subProcedureName, macroName).status;
    }
    if(subProcedureName){

      status = NAV.validationTree.getSubProcedure(procedureName, subProcedureName).status;

    }else{
      status = NAV.validationTree.getProcedure(procedureName).status;
    }

    return ( status === NAV.validationTree.status.valid || status === NAV.validationTree.status.definitionMissing);
};


/**
 * geeft status aan van het navigatie element om te bepalen of deze
 * rechtstreeks opgenomen moet worden in respectievelijk
 * als procedure kop in het sessie menu (linker menu)
 * Als subprocedure knop in het bovenste knoppen menu binnen de sessie
 * Als macro tab direct na het kiezen van een subprocedure knop
 *
 * voor (sub) procedures gelden dat ze getoond worden als hun status valid zijn of als er geen onderliggende definite bekend is.
 * in het laatste geval wordt de knop uitgeschakeld en krijgt een afwijkende kleur zodat er direct een indicatie is dat er iets niet goed is gedefineerd
 *
 * voor macro's geld dat alleen macro's met de status valid worden weergegeven
 * tenzij deze macro's een target macro zijn.
 * target macro's hebben een isTarget eigenschap
 *
 * @param {type} procedureName oor het controleren van een procedure
 * @param {type} subProcedureName optioneel voor het controleren van een subProcedure of Macro
 * @param {type} macroName optioneel voor het controleren van een macro procedure en sub proceduren dienen te zijn ingevuld
 * @returns {object}
 */

NAV.validationTree.get= function(procedureName, subProcedureName, macroName){
    if(macroName){
      return NAV.validationTree.getMacro(procedureName, subProcedureName, macroName);
    }
    if(subProcedureName){
      return NAV.validationTree.getSubProcedure(procedureName, subProcedureName);
    }
    return NAV.validationTree.getProcedure(procedureName);
};



NAV.validationTree.log = function(){
   console.log(NAV.validationTree.session);
   return;
};
