GUI.InfoWindowIcon = function(obj) {
  GUI.InfoWindowIcon.baseConstructor.call(this,obj);
	//registreren van value's in response
	this.toId						= nullWhenEmpty(obj.toId);
	this.macroToCall		= nullWhenEmpty(obj.macroName);
	this.id = this.toId	 + '-'+ this.macroToCall;
	this.macroLocation	= nullWhenEmpty(obj.macroLocation) || 'DBS';
	this.parmObject			= nullWhenEmpty(obj.parmObject);
	this.inputFields	  = nullWhenEmpty(obj.inputFields);
	this.returnFields		= nullWhenEmpty(obj.returnFields);
	this.openOptions    = nullWhenEmpty(obj.openOptions);
	this.whenField 			= nullWhenEmpty(obj.whenField);
	this.whenValue 			= nullWhenEmpty(obj.whenValue);
	this.xPosition			= nullWhenEmpty(obj.xPosition);
	this.yPosition			= nullWhenEmpty(obj.yPosition);

	this.targetInputObj	= null;
};

XDOM.extendObject(GUI.InfoWindowIcon, GUI.BaseInputObject);

/**
 * @override GuiBaseObject
 * @returns HTMLDomObject
 */
GUI.InfoWindowIcon.prototype.render = function(){
 	this.dom.domObject = XDOM.createElement("DIV",	this.id, "");
	this.dom.domObject.setAttribute("data-is-gui", "true");

	this.dom.domObject.setAttribute("data-to-id", 					this.macroName+"-"+this.toId);
	this.dom.domObject.setAttribute("data-parm-object", 		this.parmObject);
	this.dom.domObject.setAttribute("data-parm-prefix", 		this.panelId+"-");
	this.dom.domObject.setAttribute("data-open-options", 		this.openOptions);
	this.dom.domObject.setAttribute("data-mouseover-action",	"GUI.InfoWindow.handleMouseOver" );
	this.dom.domObject.setAttribute("data-mouseout-action", "GUI.InfoWindow.handleMouseOut");


	this.dom.domObject.setAttribute("data-click-action", 		"GUI.InfoWindow.handleClick");
	
	this.dom.domObject.setAttribute("data-macro-name", 			this.macroToCall);
	this.dom.domObject.setAttribute("data-macro-location", 	this.macroLocation);
	this.dom.domObject.setAttribute("data-input-fields", 		this.macroName+"-"+this.inputFields);
	this.dom.domObject.setAttribute('data-panel-id',        this.panelId);
	
	this.updateFieldNames();

  this.setPosAndDimentions();
  this.updateState();
  this.registerEvents();
  return this.dom.domObject;
};

GUI.InfoWindowIcon.prototype.registerEvents = function(){
	XDOM.addEventListener(this.dom.domObject, 'mouseover', handleMouseOver);
	XDOM.addEventListener(this.dom.domObject, 'mouseout', handleMouseOut);
};

GUI.InfoWindowIcon.prototype.updateFieldNames = function(){
	let parmObject 	 = JSON.parse(this.parmObject.replace(/\'/g,'"'));
	for(let i = 0;i < parmObject.length; i++){
		parmObject[i].field = this.macroName+"-"+parmObject[i].field;
	}
	this.dom.domObject.dataset.parmObject =  this.parmObject;
	this.dom.domObject.setAttribute("data-invoker-baseId", this.macroName);
	return;

};

/**
 * @override GuiBaseObject
 */
GUI.InfoWindowIcon.prototype.updateState = function(){

  if(!this.dom.domObject){
    this.dom.domObject = XDOM.getObject(this.id);
  }
  this.base(GUI.InfoWindowIcon, 'updateState');
  this.dom.domObject.className  = 'pth-infoProgram ' + this.getCssClass();
  if(this.whenField){
    if(this.getDataValue(this.whenField )== this.whenValue){
    	this.dom.domObject.style.display='';
    }else{
    	this.dom.domObject.style.display='none';
    }
  }
  this.setAlias(this.dom.domObject)
};

