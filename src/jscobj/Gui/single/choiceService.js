GUI.ChoiceService = function(obj) {
   GUI.ChoiceService.baseConstructor.call(this,obj);
   this.targetId = nullWhenEmpty(obj.toId);
   this.serviceSource = nullWhenEmpty(obj.serviceSource);
   this.whenField = nullWhenEmpty(obj.whenField);
   this.whenValue = nullWhenEmpty(obj.whenValue);
   this.service = null;
};

XDOM.extendObject(GUI.ChoiceService, GUI.BaseInputObject);

GUI.ChoiceService.instances = [];

GUI.ChoiceService.prototype.init = function(){
  this.base(GUI.ChoiceService, 'init');
  GUI.ChoiceService.instances[this.id] = this;
  this.targetId = this.panelId + '-' + this.targetId;
};


/**
 * @override GuiBaseObject
 * @returns HTMLDomObject
 */
GUI.ChoiceService.prototype.render = function(){
  this.dom.domObject = XDOM.createElement("DIV",this.id);
  this.dom.domObject.setAttribute("data-to-id", this.targetId);
  this.dom.domObject.setAttribute("data-service-source", this.serviceSource);
  this.dom.domObject.setAttribute("data-service-id", this.id);
  this.dom.domObject.setAttribute("data-service-type", "*CHC");
  this.dom.domObject.setAttribute("data-service-open", "*USER");
  this.dom.domObject.setAttribute("data-panel-id", this.panelId);

  this.setPosAndDimentions();
  this.updateState();
  this.registerEvents();
  return this.dom.domObject;
};

GUI.ChoiceService.prototype.registerEvents = function(){};

/**
 * @override GuiBaseObject
 */
GUI.ChoiceService.prototype.updateState = function(){

  if(!this.dom.domObject){
    this.dom.domObject = XDOM.getObject(this.id);
  }
  this.base(GUI.ChoiceService, 'updateState');
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
GUI.ChoiceService.prototype.getCssClass = function(){
  var fsCssClass =  this.base(GUI.ChoiceService, 'getCssClass');
  fsCssClass +=" serviceChoice pth-choice dataSectionButton theme-hover-color";
  return fsCssClass;
};


GUI.ChoiceService.prototype.open = function(){
  this.service.open();
};

GUI.ChoiceService.open = function(serviceId){
  GUI.ChoiceService.instances[serviceId].open();
};