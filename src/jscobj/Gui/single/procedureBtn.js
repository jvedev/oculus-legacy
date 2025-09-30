///**
// * GUI.SessionTab losses tab
// * @param session sessie object waar deze tab bij hoort
// */
//GUI.ProcedureBtn = function(subProcedure, width, row){
//  this.id = subProcedure.optionNr;
//  this.row = row;
//  this.title = subProcedure.title;
//  this.subProcedure = subProcedure;
//  this.dom = {};
//  this.fsCssClasses = "btnDefault col buttonLength"+width;
//  //this.fsCssClasses = "btnDefault col-md-auto buttonLength"+width;
//  this.infoTitle = null;
//  //this.containingDiv = "sessionContentWrapper";
//};
//GUI.ProcedureBtn.currentInstance = null;
//GUI.ProcedureBtn.hovered= null;
//
//GUI.ProcedureBtn.handleClick = function(fsId){
//	var foNewInstance = SESSION.stack.currentProcedure.buttonInstances[fsId].subProcedure;
//  var foSubProcedure = null;
//
//	if(GUI.ProcedureBtn.currentInstance && GUI.ProcedureBtn.currentInstance.subProcedure == foNewInstance){
//		return; //niet mogelijk om op de actieve knop te klikken
//	}
//
//  Search.close();
//  if(GUI.ProcedureBtn.currentInstance){
//    GUI.ProcedureBtn.currentInstance.deactivate();
//  }
//
//  foSubProcedure = foNewInstance;
//  SESSION.stack.clearHistory(SESSION.stack.currentProcedure);
//  foSubProcedure.load();
//};
//
//GUI.ProcedureBtn.handleMouseDown = function(){
//	//prevent blur action while navigate
//	SESSION.session.cancelBlurEvent = true;
//};
//
//
///**
// * opbouwen van tab
// */
//GUI.ProcedureBtn.prototype.render = function(){
//
//  //var foParent =           XDOM.getObject('MVCPRCR' + this.row);
//  var foParent =           XDOM.getObject('MVCPRCR1');
//
//  this.dom.domObject =     XDOM.createElement("DIV","prcBtn"+this.id, this.fsCssClasses);
//  //this.dom.ieRadius =      XDOM.createElement("DIV","iePrcRadius"+this.id ,"ieRadiusMaskSmall");
//  this.dom.backGround =    XDOM.createElement("DIV","prcBackGround"+this.id,"contentSubMenuBtnBg");
//
//  this.dom.domObject.appendChild(this.dom.backGround);
//  //this.dom.domObject.appendChild(this.dom.ieRadius);
//  //this.dom.ieRadius.appendChild(this.dom.backGround);
//
//  this.dom.backGround.appendChild(XDOM.createTextNode(this.subProcedure.description));
//  foParent.appendChild(this.dom.domObject);
//
//  SESSION.stack.currentProcedure.buttonInstances[this.id] = this;
//  this.registerEvents();
//};
//
//GUI.ProcedureBtn.prototype.cleanUp = function(){
//  this.dom.domObject = null;
//  this.dom.backGround = null;
//  this.subProcedure = null;
//};
//
//
//GUI.ProcedureBtn.prototype.activate = function(){
//  if(this.subProcedure.available){
//     this.dom.domObject.className = this.fsCssClasses+" activeBtn";
//     GUI.ProcedureBtn.currentInstance = this;
//
//  }
////  GUI.infoTitle.hide();
//};
//
//GUI.ProcedureBtn.prototype.deactivate = function(){
//  this.dom.domObject.className = this.fsCssClasses;
//};
//
//GUI.ProcedureBtn.prototype.registerEvents = function(){
//  var fsId = this.id;
//  var fsTitle = this.title+' - '+this.subProcedure.subProcedureName;
//  if(this.subProcedure.available){
//	  XDOM.addEventListener(this.dom.domObject,"click", function(){GUI.ProcedureBtn.handleClick(fsId);});
//	  XDOM.addEventListener(this.dom.domObject,"mousedown", function(){GUI.ProcedureBtn.handleMouseDown();});
//	  GUI.infoTitle.register(this.dom.domObject ,fsTitle);
//	}else{
//		 this.dom.backGround.className += ' unavailable';
//	}
//};
