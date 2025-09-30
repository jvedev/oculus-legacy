/* global GUI, XDOM, ENUM */

GUI.Retrieve = function(obj){
  
  GUI.Retrieve.baseConstructor.call(this,obj);
  this.toId = obj.toId;
  this.serviceSource = obj.serviceSource;
  this.whenField = obj.whenField; 
  this.whenValue = obj.whenValue;
  this.datafield = obj.toId;
  this.service = null;
};

XDOM.extendObject(GUI.Retrieve, GUI.BaseObject);

/**
 * @override GuiBaseObject
 */
GUI.Retrieve.prototype.init = function(){
  if(!this.datafield){
    this.datafield = this.toId;
  }
  this.base(GUI.Retrieve, 'init');
  this.service = this.parentObject.services.get(this.serviceSource);
  
  
  
  this.setDefaults();
  this.setValue();
};

/**
 * @override GuiBaseObject
 * @returns HTMLDomObject
 */
GUI.Retrieve.prototype.render = function(){
  this.dom.domObject = XDOM.createElement("div",this.id);
  this.dom.domObject.setAttribute("data-to-id", this.panelId + '-' + this.toId);
  this.dom.domObject.setAttribute("data-service-type", ENUM.serviceType.retrive);
  this.dom.domObject.setAttribute("data-panel-id", this.panelId);
  this.setPosAndDimentions();
  this.updateState();
  return this.dom.domObject;
};


/**
 * haalt de waarde op uit de dataset 
 * @param obj 
 */
GUI.Retrieve.update = function(obj){
  var panel = XDOM.getEditWindow(obj);
  if(!panel){
    return false;
  }
  
  var retrieve = panel.guiObjects[obj.id];
  retrieve.updateByUser();
  return true;

};

GUI.Retrieve.prototype.updateByUser = function(){
  var toValue = XDOM.getObjectValue(this.panelId + '-' + this.toId);
  this.value = this.service.get(toValue);
  this.dom.domObject.innerHTML = this.value;
};
/**
 * haalt de waarde op uit de dataset  
 */
GUI.Retrieve.prototype.setValue = function(){
  this.base(GUI.Output, 'setValue');
  if(this.value !==''){
    if(this.service){
      this.value = this.service.get(this.value);
    }else{
      this.value ='';  
    }
  }
};
/**
 * @override GuiBaseObject
 */
GUI.Retrieve.prototype.updateState = function(){
  this.base(GUI.Output, 'updateState');
  if(!this.dom.domObject){
    this.dom.domObject = XDOM.getObject(this.id);
  }
  if(!this.allowShow()){
    this.dom.domObject.style.display='none';
    return;
  }
  this.dom.domObject.className  = this.getCssClass();
  this.dom.domObject.innerHTML = this.value;
  this.dom.domObject.style.display='';
};

/**
 * controleert of dit retrieve veld mag worden getoond
 * dit mag alleen als:
 * 1 het veld: "whenField" is gedefinieerd en de waarde komt overeen met het veld "whenValue" en het veld value is niet leeg
 * 2 het veld: "whenField" is '' meer het value is niet leeg 
 * @returns {boolean} 
 */
GUI.Retrieve.prototype.allowShow = function(){
  if(this.value===''){
    return false;
  }
  if(this.whenField && this.getDataValue(this.whenField) !== this.whenValue){
      return false;  
  }
  return true;
};


/**
 * @override GuiBaseObject
 * @returns cssClasses
 */
GUI.Retrieve.prototype.getCssClass = function(){
  var fsCss = this.base(GUI.Output, 'getCssClass');
  return fsCss;
};