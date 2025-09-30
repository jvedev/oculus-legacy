GUI.subProcedureTab = function(macro){
	 this.id = macro.id;
  this.macro = macro;
  this.domObjectId = '';
  this.fsCssClasses = null;
  this.label = null;
  this.btnPos = this.id + 1;
};

//GUI.subProcedureTab.currentInstance = null;
//GUI.subProcedureTab.prototype.render = function(width, btnPosition, totalTabs){
//  //var fsTitle = this.macro.title+' (CTRL+'+this.btnPos+') '+this.macro.macroName;
//  var fsTitle 	= this.macro.title+' (CTRL+'+btnPosition+') '+this.macro.macroName;
//  var domObject = null;
//  var domParent = XDOM.getObject('TABDIV');
//  var fsId 			= this.id;
//  this.fsCssClasses 	= "tabLength"+width;
//  this.domObjectId 		= "btnPos"+btnPosition;
//  domObject 					= XDOM.createElement("input",this.domObjectId, this.fsCssClasses);
//  domObject.type 			= 'button';
//  domObject.value 		= this.macro.description;
//
//  domParent.appendChild(domObject);
//
//  SESSION.stack.currentSubprocedure.tabInstances[this.id] = this;
//
//  GUI.infoTitle.register(domObject, fsTitle);
//  XDOM.addEventListener(domObject,"click", function(){GUI.subProcedureTab.handleClick(fsId);});
//};

//GUI.subProcedureTab.prototype.cleanUp = function(){
//  this.macro = null;
//};


/**
* vernieuwen van dom objects dit is nodig voor ie die soms geen toegang meer heeft tot het dom object en dan een access denied fout geeft
**/
//GUI.subProcedureTab.prototype.refreshDomObjects = function(){};

//GUI.subProcedureTab.prototype.activate = function(){
//	var obj = XDOM.getObject(this.domObjectId);
//  if(obj){
//    obj.className = this.fsCssClasses+" active";
//	  GUI.subProcedureTab.currentInstance = this;
//	}
//};


//GUI.subProcedureTab.prototype.deactivate = function(){
//	var obj = XDOM.getObject(this.domObjectId);
//	if(obj){
//    obj.className = this.fsCssClasses;
//  }
//};

//GUI.subProcedureTab.handleClick = function(fsId){
//  var foNewInstance = null;
//  if(SESSION.submitInProgress){
//  	//er is al een submit het laden van de nieuwe macro wordt uitgesteld tot na de onload
//  	SESSION.NextMacroId = fsId;
//  	return;
//  }
//  SESSION.NextMacroId = null;
//
//  foNewInstance = SESSION.stack.currentSubprocedure.tabInstances[fsId];
//
//	if(GUI.subProcedureTab.currentInstance == foNewInstance){
//		return; //niet mogelijk om op de actieve knop te klikken
//	}
//
//  if(GUI.subProcedureTab.currentInstance){
//    GUI.subProcedureTab.currentInstance.deactivate();
//  }
//
//
//  //sla de subfile postitie op ivm met terug keren naar ML
//  Subfile.storeSubfilePos();
//
//  GUI.subProcedureTab.currentInstance = foNewInstance;
//  SESSION.stack.clearHistory(SESSION.stack.currentSubprocedure);
//  GUI.subProcedureTab.currentInstance.macro.load();
//
//};