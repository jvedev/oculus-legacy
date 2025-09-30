GUI.Calendar = function(obj) {
   GUI.Calendar.baseConstructor.call(this,obj);
   this.targetId = nullWhenEmpty(obj.toId);
   this.whenField 			= nullWhenEmpty(obj.whenField);
   this.whenValue 			= nullWhenEmpty(obj.whenValue);
};

XDOM.extendObject(GUI.Calendar, GUI.BaseInputObject);

/**
 * @override GuiBaseObject
 * @returns HTMLDomObject
 */


GUI.Calendar.prototype.render = function(){

  this.dom.domObject = XDOM.createElement("DIV",this.id);
  this.dom.domObject.setAttribute("data-to-id", this.panelId + '-' + this.targetId);
  this.dom.domObject.setAttribute("data-service-id", this.id);
  this.dom.domObject.setAttribute("data-service-type", "*CAL");
  this.setPosAndDimentions();
  this.updateState();
  this.registerEvents();
  return this.dom.domObject;
};

/**
 * @override GuiBaseObject
 */
GUI.Calendar.prototype.updateState = function(){
  if(!this.dom.domObject){
    this.dom.domObject = XDOM.getObject(this.id);
  }
  this.base(GUI.Calendar, 'updateState');
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
GUI.Calendar.prototype.getCssClass = function(){
  var fsCssClass =  this.base(GUI.Calendar, 'getCssClass');
  fsCssClass +=" serviceCalendar pth-calendar dataSectionButton theme-hover-color ";
  return fsCssClass;
};

GUI.Calendar.prototype.registerEvents = function(){
  this.dom.domObject.addEventListener('click',Calender.handleOnClick);
}
