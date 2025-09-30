GUI.DisplayService = function(obj) {
   GUI.DisplayService.baseConstructor.call(this,obj);
};
GUI.DisplayService = function(obj) {
   GUI.DisplayService.baseConstructor.call(this,obj);
   this.targetId = nullWhenEmpty(obj.toId);
   this.serviceSource = nullWhenEmpty(obj.serviceSource);
   this.whenField = nullWhenEmpty(obj.whenField);
   this.whenValue = nullWhenEmpty(obj.whenValue);
   this.service = null;
};

XDOM.extendObject(GUI.DisplayService, GUI.BaseInputObject);


GUI.DisplayService.instances = [];

GUI.DisplayService.prototype.init = function(){
  this.targetId = this.parentObject.panelId + '-' + this.targetId;
  this.base(GUI.DisplayService, 'init');
  GUI.DisplayService.instances[this.targetId] = this;

};



/**
 * @override GuiBaseObject
 * @returns HTMLDomObject
 */
GUI.DisplayService.prototype.render = function(){
  this.dom.domObject = XDOM.createElement("DIV",this.id);
    this.dom.domObject.setAttribute("data-to-id", this.targetId);
  this.dom.domObject.setAttribute("data-service-source", this.serviceSource);
    this.dom.domObject.setAttribute("data-service-id", this.id);
    this.dom.domObject.setAttribute("data-service-type", "*DSP");
    this.dom.domObject.setAttribute("data-service-open", "*USER");
    this.dom.domObject.setAttribute("data-panel-id", this.panelId);

  this.setPosAndDimentions();
  this.updateState();
  this.registerEvents();
  return this.dom.domObject;
};

GUI.DisplayService.prototype.registerEvents = function(){}

/**
 * @override GuiBaseObject
 */
GUI.DisplayService.prototype.updateState = function(){
  if(!this.dom.domObject){
    this.dom.domObject = XDOM.getObject(this.id);
  }
  this.base(GUI.DisplayService, 'updateState');
  this.dom.domObject.className  = this.getCssClass();
  if(this.whenField){
    if(this.getDataValue(this.whenField )== this.whenValue){
    	this.dom.domObject.style.display='';
    }else{
    	this.dom.domObject.style.display='none';
    }
  }
};

/**
 * @override GuiBaseObject
 * @returns cssClasses
 */
GUI.DisplayService.prototype.getCssClass = function(){
  var fsCssClass =  this.base(GUI.Calendar, 'getCssClass');
  fsCssClass +=" serviceDisplay pth-display dataSectionButton theme-hover-color";
  return fsCssClass;
};


GUI.DisplayService.open = function(){
  var serviceId = XDOM.GLOBAL.getAttribute("data-eventarg-id");
  GUI.DisplayService.instances[serviceId].service.open();
};


