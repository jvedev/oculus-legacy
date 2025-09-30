/**
 * parent object voor input objecten
 * @param obj data object die de eigenschappen van dit guiObject bevatten
 * @returns {GUI.BaseObject}
 */
GUI.BaseInputObject = function(obj){
  GUI.BaseInputObject.baseConstructor.call(this,obj);
  this.dataType = nullWhenEmpty(obj.dataType);
  this.name = null;
  this.realName = obj.id;
  this.parentId = null;
  this.autoSubmit = false;
  this.forFieldProgression = false;
};

XDOM.extendObject(GUI.BaseInputObject, GUI.BaseObject);

GUI.BaseInputObject.prototype.init = function(){
  this.base(GUI.BaseInputObject, 'init');
  this.name = this.id;
  this.macroName = this.parentObject.macroName;
};
GUI.BaseInputObject.setOldValue = function(){
  XDOM.GLOBAL.setAttribute("data-old-value", GLOBAL.eventSourceElement.value);
};







