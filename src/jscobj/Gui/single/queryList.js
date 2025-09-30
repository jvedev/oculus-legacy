GUI.QueryList = function(obj) {
  GUI.QueryList.baseConstructor.call(this,obj);
	//registreren van value's in response
	//check for *NONE or queries will go wrong
	this.toId						= obj.toId=='*NONE'?'':nullWhenEmpty(obj.toId);

	this.macroToCall		= nullWhenEmpty(obj.macroName);
	this.id = this.toId	 + '-'+ this.macroToCall;
	this.macroLocation	= nullWhenEmpty(obj.macroLocation);
	this.parmObject			= nullWhenEmpty(obj.parmObject);
	this.inputFields	  = nullWhenEmpty(obj.inputFields);
	this.returnFields		= obj.returnFields || '';
	this.buttonIcon		= nullWhenEmpty(obj.iconImage);
	this.panelMode		= nullWhenEmpty(obj.openOptions);
	this.whenField 			= nullWhenEmpty(obj.whenField);
	this.whenValue 			= nullWhenEmpty(obj.whenValue);
	this.xPosition			= nullWhenEmpty(obj.xPosition);
	this.yPosition			= nullWhenEmpty(obj.yPosition);
	this.targetInputObj	= null;
};

XDOM.extendObject(GUI.QueryList, GUI.BaseInputObject);

/**
 * @override GuiBaseObject
 * @returns HTMLDomObject
 */
GUI.QueryList.prototype.render = function(){
 this.dom.domObject = XDOM.createElement("DIV", 					this.id);
	//this.dom.domObject.setAttribute("data-is-gui", "true");

	this.dom.domObject.setAttribute("data-to-id", 				this.panelId+"-"+this.toId);
	this.dom.domObject.setAttribute("data-parm-object", 		this.parmObject);
	this.dom.domObject.setAttribute("data-button-icon", 		"queryList");
	this.dom.domObject.setAttribute("data-button-icon", 	 	this.buttonIcon);
	this.dom.domObject.setAttribute("data-open-options", 	 	this.panelMode);
	this.dom.domObject.setAttribute("data-click-action", 		"QueryList.open");


	this.dom.domObject.setAttribute("data-macro-name", 			this.macroToCall);
	this.dom.domObject.setAttribute("data-parm-prefix", 		this.panelId+"-");
	this.dom.domObject.setAttribute("data-macro-location", 	this.macroLocation);
	this.dom.domObject.setAttribute("data-input-fields", 		this.macroName+"-"+this.inputFields);
	this.dom.domObject.setAttribute('data-panel-id',        this.panelId);
	this.dom.domObject.setAttribute("data-return-fields", 	this.returnFields);
	this.dom.domObject.setAttribute("data-parm-object", this.parmObject);
	this.dom.domObject.setAttribute("data-invoker-baseId", this.macroName);
	//this.updateFieldNames();

  this.setPosAndDimentions();
  this.updateState();
  this.registerEvents();
  return this.dom.domObject;
};

GUI.QueryList.prototype.registerEvents = function(){};


/**
 * @override GuiBaseObject
 */
GUI.QueryList.prototype.updateState = function(){

  if(!this.dom.domObject){
    this.dom.domObject = XDOM.getObject(this.id);
  }
  this.base(GUI.QueryList, 'updateState');
  this.dom.domObject.className = 'pth-icon dataSectionButton ' + this.getCssClass();
  if(this.whenField){
    if(this.getDataValue(this.whenField )== this.whenValue){
    	this.dom.domObject.style.display='';
    }else{
    	this.dom.domObject.style.display='none';
    }
  }
  this.setAlias(this.dom.domObject)
};

